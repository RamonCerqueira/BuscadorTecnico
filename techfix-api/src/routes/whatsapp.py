from flask import Blueprint, request, jsonify
import requests
import json
import os
from datetime import datetime
from src.models.user import db, User
from src.models.ticket import Ticket
from src.routes.notifications import notification_service

whatsapp_bp = Blueprint('whatsapp', __name__)

class WhatsAppService:
    def __init__(self):
        # Configurações do WhatsApp Business API
        # Em produção, essas configurações viriam de variáveis de ambiente
        self.access_token = os.getenv('WHATSAPP_ACCESS_TOKEN', 'demo_token')
        self.phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID', 'demo_phone_id')
        self.verify_token = os.getenv('WHATSAPP_VERIFY_TOKEN', 'techfix_verify_token')
        self.api_version = 'v21.0'
        self.base_url = f'https://graph.facebook.com/{self.api_version}'
        
        # Templates de mensagens aprovados
        self.message_templates = {
            'ticket_created': {
                'name': 'ticket_created',
                'language': 'pt_BR',
                'components': [
                    {
                        'type': 'body',
                        'parameters': [
                            {'type': 'text', 'text': '{{ticket_id}}'},
                            {'type': 'text', 'text': '{{ticket_title}}'}
                        ]
                    }
                ]
            },
            'ticket_assigned': {
                'name': 'ticket_assigned',
                'language': 'pt_BR',
                'components': [
                    {
                        'type': 'body',
                        'parameters': [
                            {'type': 'text', 'text': '{{technician_name}}'},
                            {'type': 'text', 'text': '{{ticket_title}}'}
                        ]
                    }
                ]
            },
            'ticket_status_update': {
                'name': 'ticket_status_update',
                'language': 'pt_BR',
                'components': [
                    {
                        'type': 'body',
                        'parameters': [
                            {'type': 'text', 'text': '{{ticket_id}}'},
                            {'type': 'text', 'text': '{{status}}'}
                        ]
                    }
                ]
            },
            'appointment_reminder': {
                'name': 'appointment_reminder',
                'language': 'pt_BR',
                'components': [
                    {
                        'type': 'body',
                        'parameters': [
                            {'type': 'text', 'text': '{{technician_name}}'},
                            {'type': 'text', 'text': '{{appointment_date}}'},
                            {'type': 'text', 'text': '{{appointment_time}}'}
                        ]
                    }
                ]
            }
        }
    
    def send_template_message(self, to_phone, template_name, parameters=None):
        """Enviar mensagem usando template aprovado"""
        try:
            # Remover formatação do número de telefone
            clean_phone = self._clean_phone_number(to_phone)
            
            if not clean_phone:
                return {'success': False, 'error': 'Número de telefone inválido'}
            
            # Preparar template
            template = self.message_templates.get(template_name)
            if not template:
                return {'success': False, 'error': f'Template {template_name} não encontrado'}
            
            # Substituir parâmetros se fornecidos
            if parameters:
                for component in template['components']:
                    if component['type'] == 'body' and 'parameters' in component:
                        for i, param in enumerate(component['parameters']):
                            if i < len(parameters):
                                param['text'] = parameters[i]
            
            # Payload da mensagem
            payload = {
                'messaging_product': 'whatsapp',
                'to': clean_phone,
                'type': 'template',
                'template': template
            }
            
            # Headers
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # URL da API
            url = f'{self.base_url}/{self.phone_number_id}/messages'
            
            # Para demonstração, simular envio bem-sucedido
            if self.access_token == 'demo_token':
                return {
                    'success': True,
                    'message_id': f'demo_msg_{datetime.now().timestamp()}',
                    'status': 'sent',
                    'demo': True
                }
            
            # Enviar mensagem real
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'message_id': data.get('messages', [{}])[0].get('id'),
                    'status': 'sent'
                }
            else:
                return {
                    'success': False,
                    'error': f'Erro da API: {response.status_code} - {response.text}'
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_text_message(self, to_phone, message_text):
        """Enviar mensagem de texto simples"""
        try:
            clean_phone = self._clean_phone_number(to_phone)
            
            if not clean_phone:
                return {'success': False, 'error': 'Número de telefone inválido'}
            
            payload = {
                'messaging_product': 'whatsapp',
                'to': clean_phone,
                'type': 'text',
                'text': {'body': message_text}
            }
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            url = f'{self.base_url}/{self.phone_number_id}/messages'
            
            # Para demonstração
            if self.access_token == 'demo_token':
                return {
                    'success': True,
                    'message_id': f'demo_msg_{datetime.now().timestamp()}',
                    'status': 'sent',
                    'demo': True
                }
            
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'message_id': data.get('messages', [{}])[0].get('id'),
                    'status': 'sent'
                }
            else:
                return {
                    'success': False,
                    'error': f'Erro da API: {response.status_code} - {response.text}'
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _clean_phone_number(self, phone):
        """Limpar e formatar número de telefone"""
        if not phone:
            return None
        
        # Remover caracteres não numéricos
        clean = ''.join(filter(str.isdigit, phone))
        
        # Adicionar código do país se não tiver
        if len(clean) == 11 and clean.startswith('11'):
            clean = '55' + clean
        elif len(clean) == 10:
            clean = '5511' + clean
        elif len(clean) == 11 and not clean.startswith('55'):
            clean = '55' + clean
        
        return clean if len(clean) >= 12 else None
    
    def process_webhook_message(self, webhook_data):
        """Processar mensagem recebida via webhook"""
        try:
            entry = webhook_data.get('entry', [])
            if not entry:
                return {'success': False, 'error': 'Dados de entrada inválidos'}
            
            changes = entry[0].get('changes', [])
            if not changes:
                return {'success': False, 'error': 'Nenhuma mudança encontrada'}
            
            value = changes[0].get('value', {})
            messages = value.get('messages', [])
            
            for message in messages:
                from_phone = message.get('from')
                message_type = message.get('type')
                timestamp = message.get('timestamp')
                
                if message_type == 'text':
                    text_body = message.get('text', {}).get('body', '')
                    self._handle_text_message(from_phone, text_body, timestamp)
                elif message_type == 'interactive':
                    self._handle_interactive_message(from_phone, message, timestamp)
            
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _handle_text_message(self, from_phone, text, timestamp):
        """Processar mensagem de texto recebida"""
        try:
            # Buscar usuário pelo telefone
            user = User.query.filter_by(phone=from_phone).first()
            
            if not user:
                # Usuário não encontrado, enviar mensagem de boas-vindas
                self.send_text_message(
                    from_phone,
                    "Olá! Bem-vindo ao TechFix. Para usar nossos serviços, faça seu cadastro em nosso site: https://techfix.com"
                )
                return
            
            # Processar comandos simples
            text_lower = text.lower().strip()
            
            if text_lower in ['oi', 'olá', 'hello', 'hi']:
                self.send_text_message(
                    from_phone,
                    f"Olá {user.name}! Como posso ajudá-lo hoje? Digite 'menu' para ver as opções disponíveis."
                )
            elif text_lower == 'menu':
                self._send_menu(from_phone)
            elif text_lower == 'chamados':
                self._send_user_tickets(from_phone, user.id)
            elif text_lower == 'ajuda':
                self._send_help_message(from_phone)
            else:
                # Resposta padrão
                self.send_text_message(
                    from_phone,
                    "Desculpe, não entendi sua mensagem. Digite 'menu' para ver as opções disponíveis ou 'ajuda' para obter suporte."
                )
                
        except Exception as e:
            print(f"Erro ao processar mensagem de texto: {e}")
    
    def _send_menu(self, to_phone):
        """Enviar menu de opções"""
        menu_text = """
🔧 *TechFix - Menu Principal*

Digite uma das opções:
• *chamados* - Ver seus chamados
• *novo* - Criar novo chamado
• *status* - Verificar status de chamado
• *ajuda* - Falar com suporte
• *site* - Acessar nosso site

Para criar um novo chamado, acesse: https://techfix.com/new-ticket
        """
        self.send_text_message(to_phone, menu_text)
    
    def _send_user_tickets(self, to_phone, user_id):
        """Enviar lista de chamados do usuário"""
        try:
            tickets = Ticket.query.filter_by(client_id=user_id).order_by(Ticket.created_at.desc()).limit(5).all()
            
            if not tickets:
                self.send_text_message(
                    to_phone,
                    "Você não possui chamados no momento. Para criar um novo chamado, acesse: https://techfix.com/new-ticket"
                )
                return
            
            message = "📋 *Seus Chamados Recentes:*\n\n"
            
            for ticket in tickets:
                status_emoji = {
                    'open': '🔴',
                    'in_progress': '🟡',
                    'resolved': '🟢',
                    'closed': '⚫'
                }.get(ticket.status, '⚪')
                
                message += f"{status_emoji} *#{ticket.id}* - {ticket.title}\n"
                message += f"Status: {ticket.status}\n"
                message += f"Criado: {ticket.created_at.strftime('%d/%m/%Y')}\n\n"
            
            message += "Para ver detalhes, acesse: https://techfix.com/tickets"
            
            self.send_text_message(to_phone, message)
            
        except Exception as e:
            print(f"Erro ao buscar chamados: {e}")
            self.send_text_message(
                to_phone,
                "Erro ao buscar seus chamados. Tente novamente mais tarde."
            )
    
    def _send_help_message(self, to_phone):
        """Enviar mensagem de ajuda"""
        help_text = """
🆘 *TechFix - Suporte*

Precisa de ajuda? Estamos aqui para você!

📞 *Contatos:*
• WhatsApp: (11) 99999-9999
• Email: suporte@techfix.com
• Site: https://techfix.com

⏰ *Horário de Atendimento:*
Segunda a Sexta: 8h às 18h
Sábado: 8h às 12h

Digite 'menu' para voltar ao menu principal.
        """
        self.send_text_message(to_phone, help_text)

# Instância global do serviço
whatsapp_service = WhatsAppService()

# Rotas da API
@whatsapp_bp.route('/whatsapp/webhook', methods=['GET', 'POST'])
def whatsapp_webhook():
    """Webhook para receber mensagens do WhatsApp"""
    if request.method == 'GET':
        # Verificação do webhook
        verify_token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')
        
        if verify_token == whatsapp_service.verify_token:
            return challenge
        else:
            return 'Token de verificação inválido', 403
    
    elif request.method == 'POST':
        # Processar mensagem recebida
        try:
            data = request.get_json()
            result = whatsapp_service.process_webhook_message(data)
            
            if result['success']:
                return jsonify({'status': 'success'})
            else:
                return jsonify({'status': 'error', 'message': result['error']}), 400
                
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

@whatsapp_bp.route('/whatsapp/send-template', methods=['POST'])
def send_template_message():
    """Enviar mensagem usando template"""
    try:
        data = request.get_json()
        
        to_phone = data.get('to_phone')
        template_name = data.get('template_name')
        parameters = data.get('parameters', [])
        
        if not to_phone or not template_name:
            return jsonify({
                'success': False,
                'error': 'Telefone e nome do template são obrigatórios'
            }), 400
        
        result = whatsapp_service.send_template_message(to_phone, template_name, parameters)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/send-text', methods=['POST'])
def send_text_message():
    """Enviar mensagem de texto"""
    try:
        data = request.get_json()
        
        to_phone = data.get('to_phone')
        message = data.get('message')
        
        if not to_phone or not message:
            return jsonify({
                'success': False,
                'error': 'Telefone e mensagem são obrigatórios'
            }), 400
        
        result = whatsapp_service.send_text_message(to_phone, message)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/notify-ticket', methods=['POST'])
def notify_ticket_whatsapp():
    """Enviar notificação de chamado via WhatsApp"""
    try:
        data = request.get_json()
        
        ticket_id = data.get('ticket_id')
        notification_type = data.get('type')  # 'created', 'assigned', 'status_changed'
        
        if not ticket_id or not notification_type:
            return jsonify({
                'success': False,
                'error': 'ID do chamado e tipo de notificação são obrigatórios'
            }), 400
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return jsonify({
                'success': False,
                'error': 'Chamado não encontrado'
            }), 404
        
        # Buscar cliente
        client = User.query.get(ticket.client_id)
        if not client or not client.phone:
            return jsonify({
                'success': False,
                'error': 'Cliente não encontrado ou sem telefone'
            }), 404
        
        # Enviar notificação baseada no tipo
        if notification_type == 'created':
            result = whatsapp_service.send_template_message(
                client.phone,
                'ticket_created',
                [str(ticket.id), ticket.title]
            )
        elif notification_type == 'assigned':
            technician_name = ticket.assigned_to_name or 'Técnico'
            result = whatsapp_service.send_template_message(
                client.phone,
                'ticket_assigned',
                [technician_name, ticket.title]
            )
        elif notification_type == 'status_changed':
            status_text = {
                'in_progress': 'em andamento',
                'resolved': 'resolvido',
                'closed': 'fechado'
            }.get(ticket.status, ticket.status)
            
            result = whatsapp_service.send_template_message(
                client.phone,
                'ticket_status_update',
                [str(ticket.id), status_text]
            )
        else:
            return jsonify({
                'success': False,
                'error': 'Tipo de notificação inválido'
            }), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/templates', methods=['GET'])
def get_templates():
    """Listar templates disponíveis"""
    try:
        templates = list(whatsapp_service.message_templates.keys())
        return jsonify({
            'success': True,
            'templates': templates
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/config', methods=['GET'])
def get_whatsapp_config():
    """Obter configuração do WhatsApp (sem dados sensíveis)"""
    try:
        return jsonify({
            'success': True,
            'config': {
                'phone_number_id': whatsapp_service.phone_number_id,
                'api_version': whatsapp_service.api_version,
                'webhook_configured': bool(whatsapp_service.verify_token),
                'demo_mode': whatsapp_service.access_token == 'demo_token'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Função para integrar com o sistema de notificações
def send_whatsapp_notification(ticket_id, notification_type):
    """Função auxiliar para enviar notificações WhatsApp"""
    try:
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return False
        
        client = User.query.get(ticket.client_id)
        if not client or not client.phone:
            return False
        
        # Verificar se cliente quer receber notificações WhatsApp
        # (em produção, isso seria uma configuração do usuário)
        
        if notification_type == 'ticket_created':
            result = whatsapp_service.send_template_message(
                client.phone,
                'ticket_created',
                [str(ticket.id), ticket.title]
            )
        elif notification_type == 'ticket_assigned':
            technician_name = ticket.assigned_to_name or 'Técnico'
            result = whatsapp_service.send_template_message(
                client.phone,
                'ticket_assigned',
                [technician_name, ticket.title]
            )
        elif notification_type == 'ticket_status_changed':
            status_text = {
                'in_progress': 'em andamento',
                'resolved': 'resolvido',
                'closed': 'fechado'
            }.get(ticket.status, ticket.status)
            
            result = whatsapp_service.send_template_message(
                client.phone,
                'ticket_status_update',
                [str(ticket.id), status_text]
            )
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"Erro ao enviar notificação WhatsApp: {e}")
        return False

