from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.ticket import Ticket, TicketResponse
from datetime import datetime
import json

tickets_bp = Blueprint('tickets', __name__)

# Simulação de IA para diagnóstico
def generate_ai_suggestion(device_type, brand, model, description):
    suggestions = {
        'Celular': {
            'carregamento': 'Problema comum em smartphones. Verifique se há sujeira no conector de carga. Pode ser defeito no cabo, carregador, conector ou circuito de carga.',
            'tela': 'Possível queda ou impacto. Pode ser apenas o vidro ou o display completo. Necessário avaliação presencial.',
            'bateria': 'Bateria pode estar viciada ou com defeito. Comum após 2-3 anos de uso intenso.',
            'não liga': 'Pode ser bateria descarregada, defeito na placa ou botão power. Teste com carregador original.'
        },
        'Notebook': {
            'não liga': 'Verifique fonte de alimentação. Pode ser bateria, fonte externa ou defeito na placa-mãe.',
            'tela': 'Possível defeito no cabo flat, inversor ou painel LCD. Teste com monitor externo.',
            'superaquecimento': 'Limpeza do cooler e troca da pasta térmica podem resolver.',
            'lentidão': 'Pode ser HD com defeito, pouca memória RAM ou vírus.'
        },
        'TV': {
            'não liga': 'Verifique fonte de alimentação e fusíveis. Pode ser defeito na placa principal.',
            'sem imagem': 'Teste outras entradas. Pode ser defeito no painel ou placa T-CON.',
            'sem som': 'Verifique configurações de áudio. Pode ser defeito nos alto-falantes.'
        }
    }
    
    device_suggestions = suggestions.get(device_type, {})
    
    # Busca por palavras-chave na descrição
    for keyword, suggestion in device_suggestions.items():
        if keyword in description.lower():
            return suggestion
    
    return 'Descrição recebida. Recomendo avaliação técnica presencial para diagnóstico preciso.'

@tickets_bp.route('/tickets', methods=['GET'])
def get_tickets():
    try:
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        status = request.args.get('status')
        assigned = request.args.get('assigned')
        
        query = Ticket.query
        
        # Filtrar por usuário e tipo
        if user_type == 'client':
            query = query.filter_by(client_id=user_id)
        elif user_type in ['technician', 'company']:
            if assigned == 'me':
                query = query.filter_by(assigned_to_id=user_id)
            else:
                # Mostrar chamados disponíveis ou já atribuídos ao usuário
                query = query.filter(
                    (Ticket.status == 'open') | (Ticket.assigned_to_id == user_id)
                )
        # Admin vê todos os chamados
        
        # Filtrar por status
        if status and status != 'all':
            query = query.filter_by(status=status)
        
        tickets = query.order_by(Ticket.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'tickets': [ticket.to_dict() for ticket in tickets]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        return jsonify({
            'success': True,
            'ticket': ticket.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets', methods=['POST'])
def create_ticket():
    try:
        data = request.get_json()
        
        # Gerar sugestão da IA
        ai_suggestion = generate_ai_suggestion(
            data.get('deviceType'),
            data.get('brand'),
            data.get('model', ''),
            data.get('description')
        )
        
        # Criar chamado
        ticket = Ticket.from_dict(data)
        ticket.ai_suggestion = ai_suggestion
        
        db.session.add(ticket)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'ticket': ticket.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'status' in data:
            ticket.status = data['status']
        
        if 'assignedTo' in data:
            assigned_to = data['assignedTo']
            ticket.assigned_to_id = assigned_to.get('id')
            ticket.assigned_to_name = assigned_to.get('name')
            ticket.assigned_to_type = assigned_to.get('type')
        
        if 'estimatedCost' in data:
            ticket.estimated_cost = data['estimatedCost']
        
        ticket.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'ticket': ticket.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets/<int:ticket_id>/responses', methods=['POST'])
def add_response(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        data = request.get_json()
        
        response = TicketResponse.from_dict(data)
        response.ticket_id = ticket_id
        
        db.session.add(response)
        
        # Atualizar timestamp do chamado
        ticket.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'response': response.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets/<int:ticket_id>/assign', methods=['POST'])
def assign_ticket(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        data = request.get_json()
        
        user_id = data.get('userId')
        user = User.query.get_or_404(user_id)
        
        ticket.assigned_to_id = user.id
        ticket.assigned_to_name = user.name
        ticket.assigned_to_type = user.user_type
        ticket.status = 'in_progress'
        ticket.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'ticket': ticket.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets/stats', methods=['GET'])
def get_ticket_stats():
    try:
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        
        stats = {}
        
        if user_type == 'client':
            total = Ticket.query.filter_by(client_id=user_id).count()
            open_tickets = Ticket.query.filter_by(client_id=user_id, status='open').count()
            in_progress = Ticket.query.filter_by(client_id=user_id, status='in_progress').count()
            resolved = Ticket.query.filter_by(client_id=user_id, status='resolved').count()
            
            stats = {
                'total': total,
                'open': open_tickets,
                'inProgress': in_progress,
                'resolved': resolved
            }
            
        elif user_type in ['technician', 'company']:
            assigned = Ticket.query.filter_by(assigned_to_id=user_id).count()
            available = Ticket.query.filter_by(status='open').count()
            completed = Ticket.query.filter_by(assigned_to_id=user_id, status='resolved').count()
            
            user = User.query.get(user_id)
            
            stats = {
                'assigned': assigned,
                'available': available,
                'completed': completed,
                'rating': user.rating if user else 0,
                'totalServices': user.total_services if user else 0
            }
            
        elif user_type == 'admin':
            total = Ticket.query.count()
            open_tickets = Ticket.query.filter_by(status='open').count()
            in_progress = Ticket.query.filter_by(status='in_progress').count()
            resolved = Ticket.query.filter_by(status='resolved').count()
            
            stats = {
                'total': total,
                'open': open_tickets,
                'inProgress': in_progress,
                'resolved': resolved,
                'users': User.query.count(),
                'technicians': User.query.filter(User.user_type.in_(['technician', 'company'])).count()
            }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@tickets_bp.route('/tickets/search', methods=['GET'])
def search_tickets():
    try:
        query_text = request.args.get('q', '')
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        
        query = Ticket.query
        
        # Filtrar por usuário
        if user_type == 'client':
            query = query.filter_by(client_id=user_id)
        elif user_type in ['technician', 'company']:
            query = query.filter(
                (Ticket.status == 'open') | (Ticket.assigned_to_id == user_id)
            )
        
        # Buscar no título e descrição
        if query_text:
            query = query.filter(
                (Ticket.title.contains(query_text)) |
                (Ticket.description.contains(query_text)) |
                (Ticket.client_name.contains(query_text))
            )
        
        tickets = query.order_by(Ticket.created_at.desc()).limit(20).all()
        
        return jsonify({
            'success': True,
            'tickets': [ticket.to_dict() for ticket in tickets]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

