from flask import Blueprint, request, jsonify
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import base64
import io
import os
import json
from datetime import datetime
import openai
from src.models.user import db
from src.models.ticket import Ticket

ai_vision_bp = Blueprint('ai_vision', __name__)

class AIVisionService:
    def __init__(self):
        # Configurar OpenAI para análise de imagens
        self.openai_client = openai.OpenAI()
        
        # Configurações de processamento de imagem
        self.supported_formats = ['jpg', 'jpeg', 'png', 'bmp', 'tiff']
        self.max_image_size = (1920, 1080)  # Redimensionar imagens grandes
        self.min_image_size = (100, 100)    # Tamanho mínimo para análise
        
        # Templates de análise por categoria de dispositivo
        self.analysis_templates = {
            'smartphone': {
                'common_issues': [
                    'tela quebrada', 'não carrega', 'não liga', 'bateria viciada',
                    'câmera não funciona', 'alto-falante com problema', 'botões não respondem',
                    'conector de carga danificado', 'display com manchas', 'touch não funciona'
                ],
                'components': [
                    'tela/display', 'bateria', 'placa-mãe', 'câmera', 'alto-falante',
                    'conector de carga', 'botões', 'sensor de proximidade', 'microfone'
                ]
            },
            'notebook': {
                'common_issues': [
                    'tela quebrada', 'não liga', 'superaquecimento', 'teclado não funciona',
                    'trackpad com problema', 'não carrega', 'ventilador barulhento',
                    'dobradiça quebrada', 'portas USB não funcionam', 'Wi-Fi não conecta'
                ],
                'components': [
                    'tela/LCD', 'teclado', 'trackpad', 'fonte/carregador', 'bateria',
                    'placa-mãe', 'memória RAM', 'HD/SSD', 'ventilador', 'dobradiças'
                ]
            },
            'tablet': {
                'common_issues': [
                    'tela quebrada', 'não carrega', 'não liga', 'touch não responde',
                    'bateria não segura carga', 'câmera não funciona', 'alto-falante mudo',
                    'botões travados', 'conector danificado'
                ],
                'components': [
                    'tela/display', 'bateria', 'placa-mãe', 'câmera', 'alto-falante',
                    'conector de carga', 'botões', 'microfone'
                ]
            },
            'tv': {
                'common_issues': [
                    'não liga', 'sem imagem', 'sem som', 'tela piscando',
                    'linhas na tela', 'não conecta Wi-Fi', 'controle não funciona',
                    'portas HDMI com problema', 'LED queimado'
                ],
                'components': [
                    'placa principal', 'fonte de alimentação', 'tela/painel', 'alto-falantes',
                    'placa T-CON', 'LEDs de backlight', 'receptor IR', 'portas HDMI'
                ]
            }
        }
    
    def analyze_image(self, image_data, device_type='smartphone', additional_context=''):
        """Analisar imagem usando Computer Vision e IA"""
        try:
            # Processar imagem
            processed_image = self.preprocess_image(image_data)
            if not processed_image:
                return {'success': False, 'error': 'Erro ao processar imagem'}
            
            # Análise técnica da imagem
            technical_analysis = self.perform_technical_analysis(processed_image, device_type)
            
            # Análise com IA (OpenAI Vision)
            ai_analysis = self.perform_ai_analysis(image_data, device_type, additional_context)
            
            # Combinar análises
            combined_analysis = self.combine_analyses(technical_analysis, ai_analysis, device_type)
            
            return {
                'success': True,
                'analysis': combined_analysis
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def preprocess_image(self, image_data):
        """Pré-processar imagem para análise"""
        try:
            # Decodificar imagem base64
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
            
            # Abrir imagem com PIL
            image = Image.open(io.BytesIO(image_bytes))
            
            # Converter para RGB se necessário
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Redimensionar se muito grande
            if image.size[0] > self.max_image_size[0] or image.size[1] > self.max_image_size[1]:
                image.thumbnail(self.max_image_size, Image.Resampling.LANCZOS)
            
            # Verificar tamanho mínimo
            if image.size[0] < self.min_image_size[0] or image.size[1] < self.min_image_size[1]:
                return None
            
            # Melhorar qualidade da imagem
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.2)
            
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.1)
            
            return image
            
        except Exception as e:
            print(f"Erro no pré-processamento: {e}")
            return None
    
    def perform_technical_analysis(self, image, device_type):
        """Análise técnica usando OpenCV"""
        try:
            # Converter PIL para OpenCV
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            analysis = {
                'image_quality': self.analyze_image_quality(cv_image),
                'damage_detection': self.detect_damage(cv_image),
                'color_analysis': self.analyze_colors(cv_image),
                'edge_detection': self.detect_edges(cv_image),
                'brightness_analysis': self.analyze_brightness(cv_image)
            }
            
            return analysis
            
        except Exception as e:
            print(f"Erro na análise técnica: {e}")
            return {}
    
    def analyze_image_quality(self, image):
        """Analisar qualidade da imagem"""
        try:
            # Calcular nitidez usando Laplacian
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Calcular brilho médio
            brightness = np.mean(gray)
            
            # Calcular contraste
            contrast = gray.std()
            
            quality_score = min(100, (laplacian_var / 100) * 50 + (contrast / 128) * 50)
            
            return {
                'sharpness': float(laplacian_var),
                'brightness': float(brightness),
                'contrast': float(contrast),
                'quality_score': float(quality_score),
                'is_blurry': laplacian_var < 100,
                'is_too_dark': brightness < 50,
                'is_too_bright': brightness > 200
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def detect_damage(self, image):
        """Detectar possíveis danos na imagem"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detectar bordas para identificar rachaduras
            edges = cv2.Canny(gray, 50, 150)
            
            # Detectar linhas (possíveis rachaduras)
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=30, maxLineGap=10)
            
            # Detectar contornos irregulares
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Análise de cor para detectar manchas ou descoloração
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Detectar áreas muito escuras (possíveis manchas)
            dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 50))
            dark_area = cv2.countNonZero(dark_mask)
            
            # Detectar áreas muito claras (possível superexposição)
            bright_mask = cv2.inRange(hsv, (0, 0, 200), (180, 255, 255))
            bright_area = cv2.countNonZero(bright_mask)
            
            total_pixels = image.shape[0] * image.shape[1]
            
            return {
                'potential_cracks': len(lines) if lines is not None else 0,
                'irregular_contours': len(contours),
                'dark_spots_percentage': (dark_area / total_pixels) * 100,
                'bright_spots_percentage': (bright_area / total_pixels) * 100,
                'has_potential_damage': (
                    (lines is not None and len(lines) > 5) or
                    (dark_area / total_pixels) > 0.1 or
                    (bright_area / total_pixels) > 0.3
                )
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def analyze_colors(self, image):
        """Analisar distribuição de cores"""
        try:
            # Converter para HSV para melhor análise de cor
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Calcular histograma de cores
            hist_h = cv2.calcHist([hsv], [0], None, [180], [0, 180])
            hist_s = cv2.calcHist([hsv], [1], None, [256], [0, 256])
            hist_v = cv2.calcHist([hsv], [2], None, [256], [0, 256])
            
            # Encontrar cor dominante
            dominant_hue = np.argmax(hist_h)
            dominant_saturation = np.argmax(hist_s)
            dominant_value = np.argmax(hist_v)
            
            # Classificar cor dominante
            color_name = self.classify_color(dominant_hue, dominant_saturation, dominant_value)
            
            return {
                'dominant_hue': int(dominant_hue),
                'dominant_saturation': int(dominant_saturation),
                'dominant_brightness': int(dominant_value),
                'dominant_color': color_name,
                'color_diversity': float(np.std(hist_h)),
                'is_monochromatic': np.std(hist_h) < 10
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def classify_color(self, hue, saturation, value):
        """Classificar cor baseada em HSV"""
        if saturation < 30:
            if value < 50:
                return 'preto'
            elif value > 200:
                return 'branco'
            else:
                return 'cinza'
        
        if hue < 10 or hue > 170:
            return 'vermelho'
        elif hue < 25:
            return 'laranja'
        elif hue < 35:
            return 'amarelo'
        elif hue < 85:
            return 'verde'
        elif hue < 125:
            return 'azul'
        else:
            return 'roxo'
    
    def detect_edges(self, image):
        """Detectar bordas e formas"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Contar pixels de borda
            edge_pixels = cv2.countNonZero(edges)
            total_pixels = gray.shape[0] * gray.shape[1]
            edge_density = (edge_pixels / total_pixels) * 100
            
            # Detectar formas geométricas
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            shapes = []
            for contour in contours:
                if cv2.contourArea(contour) > 500:  # Filtrar contornos pequenos
                    approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
                    if len(approx) == 4:
                        shapes.append('retângulo')
                    elif len(approx) == 3:
                        shapes.append('triângulo')
                    elif len(approx) > 8:
                        shapes.append('círculo')
                    else:
                        shapes.append('polígono')
            
            return {
                'edge_density': float(edge_density),
                'detected_shapes': shapes,
                'shape_count': len(shapes),
                'has_geometric_patterns': len(shapes) > 0
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def analyze_brightness(self, image):
        """Analisar distribuição de brilho"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Calcular estatísticas de brilho
            mean_brightness = np.mean(gray)
            std_brightness = np.std(gray)
            min_brightness = np.min(gray)
            max_brightness = np.max(gray)
            
            # Calcular histograma de brilho
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
            
            # Encontrar picos no histograma
            peaks = []
            for i in range(1, 255):
                if hist[i] > hist[i-1] and hist[i] > hist[i+1] and hist[i] > 100:
                    peaks.append(i)
            
            return {
                'mean_brightness': float(mean_brightness),
                'brightness_std': float(std_brightness),
                'min_brightness': int(min_brightness),
                'max_brightness': int(max_brightness),
                'brightness_range': int(max_brightness - min_brightness),
                'brightness_peaks': peaks,
                'is_well_exposed': 50 < mean_brightness < 200 and std_brightness > 30,
                'is_underexposed': mean_brightness < 50,
                'is_overexposed': mean_brightness > 200
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def perform_ai_analysis(self, image_data, device_type, additional_context):
        """Análise usando OpenAI Vision API"""
        try:
            # Preparar prompt baseado no tipo de dispositivo
            device_info = self.analysis_templates.get(device_type, self.analysis_templates['smartphone'])
            
            prompt = f"""
            Analise esta imagem de um {device_type} com problema técnico.
            
            Contexto adicional: {additional_context}
            
            Problemas comuns em {device_type}: {', '.join(device_info['common_issues'])}
            Componentes principais: {', '.join(device_info['components'])}
            
            Por favor, forneça uma análise detalhada incluindo:
            1. Descrição do que você vê na imagem
            2. Possíveis problemas identificados
            3. Componentes que podem estar danificados
            4. Gravidade do problema (baixa, média, alta)
            5. Possibilidade de reparo (fácil, médio, difícil, impossível)
            6. Estimativa de custo de reparo (baixo, médio, alto)
            7. Recomendações para o técnico
            8. Peças que podem precisar ser substituídas
            
            Responda em formato JSON estruturado.
            """
            
            # Converter imagem para base64 se necessário
            if isinstance(image_data, str) and not image_data.startswith('data:image'):
                image_data = f"data:image/jpeg;base64,{image_data}"
            
            # Chamar OpenAI Vision API
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_data,
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            # Extrair resposta
            ai_response = response.choices[0].message.content
            
            # Tentar parsear como JSON
            try:
                ai_analysis = json.loads(ai_response)
            except json.JSONDecodeError:
                # Se não for JSON válido, estruturar a resposta
                ai_analysis = {
                    'description': ai_response,
                    'confidence': 0.8,
                    'analysis_method': 'openai_vision'
                }
            
            return ai_analysis
            
        except Exception as e:
            print(f"Erro na análise com IA: {e}")
            # Fallback para análise básica
            return {
                'description': f'Análise automática de {device_type}. Imagem recebida para diagnóstico.',
                'confidence': 0.5,
                'analysis_method': 'fallback',
                'error': str(e)
            }
    
    def combine_analyses(self, technical_analysis, ai_analysis, device_type):
        """Combinar análises técnica e de IA"""
        try:
            combined = {
                'timestamp': datetime.utcnow().isoformat(),
                'device_type': device_type,
                'technical_analysis': technical_analysis,
                'ai_analysis': ai_analysis,
                'summary': self.generate_summary(technical_analysis, ai_analysis, device_type),
                'recommendations': self.generate_recommendations(technical_analysis, ai_analysis, device_type),
                'confidence_score': self.calculate_confidence(technical_analysis, ai_analysis)
            }
            
            return combined
            
        except Exception as e:
            return {
                'error': str(e),
                'technical_analysis': technical_analysis,
                'ai_analysis': ai_analysis
            }
    
    def generate_summary(self, technical_analysis, ai_analysis, device_type):
        """Gerar resumo da análise"""
        try:
            summary = []
            
            # Análise de qualidade da imagem
            if 'image_quality' in technical_analysis:
                quality = technical_analysis['image_quality']
                if quality.get('is_blurry'):
                    summary.append("Imagem está desfocada, pode afetar a precisão do diagnóstico")
                if quality.get('is_too_dark'):
                    summary.append("Imagem muito escura, recomenda-se melhor iluminação")
                if quality.get('quality_score', 0) > 70:
                    summary.append("Qualidade da imagem é boa para análise")
            
            # Análise de danos
            if 'damage_detection' in technical_analysis:
                damage = technical_analysis['damage_detection']
                if damage.get('has_potential_damage'):
                    summary.append("Possíveis danos detectados na imagem")
                if damage.get('potential_cracks', 0) > 0:
                    summary.append(f"Detectadas {damage['potential_cracks']} possíveis rachaduras")
            
            # Análise de IA
            if isinstance(ai_analysis, dict) and 'description' in ai_analysis:
                summary.append(f"IA identificou: {ai_analysis['description'][:100]}...")
            
            return summary if summary else ["Análise concluída sem problemas evidentes"]
            
        except Exception as e:
            return [f"Erro ao gerar resumo: {str(e)}"]
    
    def generate_recommendations(self, technical_analysis, ai_analysis, device_type):
        """Gerar recomendações baseadas na análise"""
        try:
            recommendations = []
            
            # Recomendações baseadas na qualidade da imagem
            if 'image_quality' in technical_analysis:
                quality = technical_analysis['image_quality']
                if quality.get('is_blurry'):
                    recommendations.append("Solicitar nova foto com melhor foco")
                if quality.get('is_too_dark'):
                    recommendations.append("Solicitar foto com melhor iluminação")
            
            # Recomendações baseadas em danos detectados
            if 'damage_detection' in technical_analysis:
                damage = technical_analysis['damage_detection']
                if damage.get('has_potential_damage'):
                    recommendations.append("Inspeção física detalhada recomendada")
                    recommendations.append("Verificar integridade estrutural do dispositivo")
            
            # Recomendações do tipo de dispositivo
            device_info = self.analysis_templates.get(device_type, {})
            if device_info:
                recommendations.append(f"Verificar componentes típicos de {device_type}")
                recommendations.append("Realizar testes funcionais específicos")
            
            # Recomendações da IA
            if isinstance(ai_analysis, dict):
                if 'recommendations' in ai_analysis:
                    if isinstance(ai_analysis['recommendations'], list):
                        recommendations.extend(ai_analysis['recommendations'])
                    else:
                        recommendations.append(str(ai_analysis['recommendations']))
            
            return recommendations if recommendations else ["Continuar com diagnóstico padrão"]
            
        except Exception as e:
            return [f"Erro ao gerar recomendações: {str(e)}"]
    
    def calculate_confidence(self, technical_analysis, ai_analysis):
        """Calcular score de confiança da análise"""
        try:
            confidence = 0.5  # Base
            
            # Aumentar confiança baseado na qualidade da imagem
            if 'image_quality' in technical_analysis:
                quality = technical_analysis['image_quality']
                quality_score = quality.get('quality_score', 0)
                confidence += (quality_score / 100) * 0.3
            
            # Aumentar confiança se a IA forneceu análise estruturada
            if isinstance(ai_analysis, dict) and 'confidence' in ai_analysis:
                ai_confidence = ai_analysis.get('confidence', 0.5)
                confidence = (confidence + ai_confidence) / 2
            
            # Limitar entre 0 e 1
            return max(0, min(1, confidence))
            
        except Exception as e:
            return 0.5

# Instância global do serviço
ai_vision_service = AIVisionService()

# Rotas da API
@ai_vision_bp.route('/ai-vision/analyze', methods=['POST'])
def analyze_image():
    """Analisar imagem com IA e Computer Vision"""
    try:
        data = request.get_json()
        
        image_data = data.get('image')
        device_type = data.get('device_type', 'smartphone')
        additional_context = data.get('context', '')
        
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'Imagem é obrigatória'
            }), 400
        
        # Realizar análise
        result = ai_vision_service.analyze_image(image_data, device_type, additional_context)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_vision_bp.route('/ai-vision/analyze-ticket', methods=['POST'])
def analyze_ticket_images():
    """Analisar todas as imagens de um chamado"""
    try:
        data = request.get_json()
        
        ticket_id = data.get('ticket_id')
        
        if not ticket_id:
            return jsonify({
                'success': False,
                'error': 'ID do chamado é obrigatório'
            }), 400
        
        # Buscar chamado
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return jsonify({
                'success': False,
                'error': 'Chamado não encontrado'
            }), 404
        
        # Analisar imagens do chamado
        analyses = []
        images = ticket.images or []
        
        for i, image_path in enumerate(images):
            try:
                # Ler imagem do arquivo
                if os.path.exists(image_path):
                    with open(image_path, 'rb') as f:
                        image_data = base64.b64encode(f.read()).decode()
                    
                    # Analisar imagem
                    analysis = ai_vision_service.analyze_image(
                        image_data, 
                        ticket.device_type or 'smartphone',
                        f"Chamado #{ticket.id}: {ticket.description}"
                    )
                    
                    if analysis['success']:
                        analysis['image_index'] = i
                        analysis['image_path'] = image_path
                        analyses.append(analysis)
                        
            except Exception as e:
                print(f"Erro ao analisar imagem {i}: {e}")
        
        # Gerar análise consolidada
        consolidated_analysis = ai_vision_service.consolidate_analyses(analyses, ticket)
        
        return jsonify({
            'success': True,
            'ticket_id': ticket_id,
            'individual_analyses': analyses,
            'consolidated_analysis': consolidated_analysis
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_vision_bp.route('/ai-vision/supported-devices', methods=['GET'])
def get_supported_devices():
    """Listar dispositivos suportados para análise"""
    try:
        devices = list(ai_vision_service.analysis_templates.keys())
        
        device_info = {}
        for device in devices:
            template = ai_vision_service.analysis_templates[device]
            device_info[device] = {
                'name': device.title(),
                'common_issues': template['common_issues'],
                'components': template['components']
            }
        
        return jsonify({
            'success': True,
            'supported_devices': devices,
            'device_info': device_info
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_vision_bp.route('/ai-vision/image-quality', methods=['POST'])
def check_image_quality():
    """Verificar qualidade da imagem antes da análise"""
    try:
        data = request.get_json()
        
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'Imagem é obrigatória'
            }), 400
        
        # Pré-processar imagem
        processed_image = ai_vision_service.preprocess_image(image_data)
        
        if not processed_image:
            return jsonify({
                'success': False,
                'error': 'Não foi possível processar a imagem'
            }), 400
        
        # Analisar qualidade
        cv_image = cv2.cvtColor(np.array(processed_image), cv2.COLOR_RGB2BGR)
        quality_analysis = ai_vision_service.analyze_image_quality(cv_image)
        
        # Determinar se a imagem é adequada para análise
        is_suitable = (
            quality_analysis.get('quality_score', 0) > 30 and
            not quality_analysis.get('is_too_dark', False) and
            not quality_analysis.get('is_too_bright', False)
        )
        
        recommendations = []
        if quality_analysis.get('is_blurry'):
            recommendations.append("Tire uma foto mais nítida")
        if quality_analysis.get('is_too_dark'):
            recommendations.append("Melhore a iluminação")
        if quality_analysis.get('is_too_bright'):
            recommendations.append("Reduza a iluminação ou evite flash direto")
        
        return jsonify({
            'success': True,
            'quality_analysis': quality_analysis,
            'is_suitable': is_suitable,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Método adicional para consolidar análises
def consolidate_analyses(self, analyses, ticket):
    """Consolidar múltiplas análises de imagens"""
    try:
        if not analyses:
            return {'error': 'Nenhuma análise disponível'}
        
        # Combinar todas as análises
        all_summaries = []
        all_recommendations = []
        confidence_scores = []
        
        for analysis in analyses:
            if analysis.get('success') and 'analysis' in analysis:
                analysis_data = analysis['analysis']
                
                if 'summary' in analysis_data:
                    all_summaries.extend(analysis_data['summary'])
                
                if 'recommendations' in analysis_data:
                    all_recommendations.extend(analysis_data['recommendations'])
                
                if 'confidence_score' in analysis_data:
                    confidence_scores.append(analysis_data['confidence_score'])
        
        # Remover duplicatas
        unique_summaries = list(set(all_summaries))
        unique_recommendations = list(set(all_recommendations))
        
        # Calcular confiança média
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.5
        
        # Gerar diagnóstico consolidado
        consolidated_diagnosis = self.generate_consolidated_diagnosis(
            unique_summaries, 
            unique_recommendations, 
            ticket
        )
        
        return {
            'summary': unique_summaries,
            'recommendations': unique_recommendations,
            'confidence_score': avg_confidence,
            'diagnosis': consolidated_diagnosis,
            'images_analyzed': len(analyses)
        }
        
    except Exception as e:
        return {'error': str(e)}

def generate_consolidated_diagnosis(self, summaries, recommendations, ticket):
    """Gerar diagnóstico consolidado"""
    try:
        diagnosis = {
            'primary_issue': 'Diagnóstico baseado em análise de imagens',
            'severity': 'média',
            'repairability': 'possível',
            'estimated_cost': 'médio',
            'next_steps': []
        }
        
        # Analisar padrões nos resumos
        damage_keywords = ['rachadura', 'quebrado', 'danificado', 'trinca']
        if any(keyword in ' '.join(summaries).lower() for keyword in damage_keywords):
            diagnosis['severity'] = 'alta'
            diagnosis['primary_issue'] = 'Dano físico detectado'
        
        # Analisar recomendações
        if 'inspeção física' in ' '.join(recommendations).lower():
            diagnosis['next_steps'].append('Realizar inspeção física detalhada')
        
        diagnosis['next_steps'].append('Confirmar diagnóstico com testes funcionais')
        diagnosis['next_steps'].append('Solicitar orçamento detalhado')
        
        return diagnosis
        
    except Exception as e:
        return {'error': str(e)}

# Adicionar método à classe
AIVisionService.consolidate_analyses = consolidate_analyses
AIVisionService.generate_consolidated_diagnosis = generate_consolidated_diagnosis

