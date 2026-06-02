from flask import Blueprint, jsonify
from src.models.user import db, User
from src.models.ticket import Ticket, TicketResponse
from datetime import datetime, timedelta
import json

demo_bp = Blueprint('demo', __name__)

@demo_bp.route('/demo/populate', methods=['POST'])
def populate_demo_data():
    """Popula o banco com dados de demonstração"""
    try:
        # Limpar dados existentes
        TicketResponse.query.delete()
        Ticket.query.delete()
        User.query.delete()
        db.session.commit()
        
        # Criar usuários demo
        users_data = [
            {
                'name': 'João Silva',
                'email': 'joao@email.com',
                'phone': '(11) 99999-9999',
                'userType': 'client',
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'isVerified': True,
                'isActive': True
            },
            {
                'name': 'Carlos Técnico',
                'email': 'carlos@tecnico.com',
                'phone': '(11) 88888-8888',
                'userType': 'technician',
                'validated': True,
                'specialties': ['Celular', 'Notebook', 'TV'],
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'serviceRadius': 15,
                'rating': 4.8,
                'totalServices': 156,
                'totalReviews': 12,
                'isVerified': True,
                'isActive': True
            },
            {
                'name': 'TechFix Assistência',
                'email': 'contato@techfix.com',
                'phone': '(11) 77777-7777',
                'userType': 'company',
                'cnpj': '12.345.678/0001-90',
                'website': 'https://techfix.com',
                'specialties': ['Celular', 'Notebook', 'TV', 'Tablet'],
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'serviceRadius': 25,
                'rating': 4.9,
                'totalServices': 1250,
                'totalReviews': 89,
                'isVerified': True,
                'isActive': True
            },
            {
                'name': 'Admin Sistema',
                'email': 'admin@techfix.com',
                'phone': '(11) 66666-6666',
                'userType': 'admin',
                'isVerified': True,
                'isActive': True
            },
            {
                'name': 'Maria Santos',
                'email': 'maria@email.com',
                'phone': '(11) 55555-5555',
                'userType': 'client',
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'isVerified': True,
                'isActive': True
            },
            {
                'name': 'Pedro Técnico',
                'email': 'pedro@tecnico.com',
                'phone': '(11) 44444-4444',
                'userType': 'technician',
                'validated': True,
                'specialties': ['Celular', 'Tablet'],
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'serviceRadius': 10,
                'rating': 4.5,
                'totalServices': 89,
                'totalReviews': 8,
                'isVerified': True,
                'isActive': True
            }
        ]
        
        created_users = []
        for user_data in users_data:
            user = User.from_dict(user_data)
            user.password_hash = 'demo123_hashed'  # Senha demo
            user.created_at = datetime.utcnow() - timedelta(days=30)
            db.session.add(user)
            db.session.flush()  # Para obter o ID
            created_users.append(user)
        
        # Criar chamados demo
        tickets_data = [
            {
                'title': 'iPhone não carrega',
                'description': 'Meu iPhone 12 parou de carregar ontem. Já tentei trocar o cabo e o carregador.',
                'status': 'open',
                'priority': 'high',
                'deviceType': 'Celular',
                'brand': 'Apple',
                'model': 'iPhone 12',
                'clientId': created_users[0].id,
                'clientName': created_users[0].name,
                'clientPhone': created_users[0].phone,
                'clientEmail': created_users[0].email,
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'tags': ['carregamento', 'iphone', 'urgente'],
                'aiSuggestion': 'Problema comum em iPhone 12. Pode ser defeito no conector Lightning ou no CI de carga. Recomenda-se verificar se há sujeira no conector antes de abrir o aparelho.'
            },
            {
                'title': 'Notebook não liga',
                'description': 'Notebook Dell parou de ligar após queda de energia. LED da fonte acende.',
                'status': 'in_progress',
                'priority': 'medium',
                'deviceType': 'Notebook',
                'brand': 'Dell',
                'model': 'Inspiron 15',
                'clientId': created_users[4].id,
                'clientName': created_users[4].name,
                'clientPhone': created_users[4].phone,
                'clientEmail': created_users[4].email,
                'assignedTo': {
                    'id': created_users[1].id,
                    'name': created_users[1].name,
                    'type': created_users[1].user_type
                },
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'tags': ['notebook', 'dell', 'não liga'],
                'aiSuggestion': 'Possível defeito na placa-mãe causado por pico de energia. Verificar fusíveis e circuitos de proteção.',
                'estimatedCost': 'R$ 150 - R$ 300'
            },
            {
                'title': 'TV sem imagem',
                'description': 'TV Samsung 55" liga mas não aparece imagem, apenas som.',
                'status': 'resolved',
                'priority': 'medium',
                'deviceType': 'TV',
                'brand': 'Samsung',
                'model': '55" Smart TV',
                'clientId': created_users[0].id,
                'clientName': created_users[0].name,
                'clientPhone': created_users[0].phone,
                'clientEmail': created_users[0].email,
                'assignedTo': {
                    'id': created_users[2].id,
                    'name': created_users[2].name,
                    'type': created_users[2].user_type
                },
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'tags': ['tv', 'samsung', 'sem imagem'],
                'aiSuggestion': 'Problema no painel ou placa T-CON. Teste com entrada externa para confirmar.',
                'estimatedCost': 'R$ 200 - R$ 500'
            },
            {
                'title': 'Tablet tela quebrada',
                'description': 'iPad caiu e a tela rachou. Touch ainda funciona parcialmente.',
                'status': 'open',
                'priority': 'low',
                'deviceType': 'Tablet',
                'brand': 'Apple',
                'model': 'iPad Air',
                'clientId': created_users[4].id,
                'clientName': created_users[4].name,
                'clientPhone': created_users[4].phone,
                'clientEmail': created_users[4].email,
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                },
                'tags': ['tablet', 'ipad', 'tela quebrada'],
                'aiSuggestion': 'Troca do vidro e display. Verificar se o LCD está danificado.'
            }
        ]
        
        created_tickets = []
        for i, ticket_data in enumerate(tickets_data):
            ticket = Ticket.from_dict(ticket_data)
            ticket.created_at = datetime.utcnow() - timedelta(days=i*2)
            ticket.updated_at = ticket.created_at
            db.session.add(ticket)
            db.session.flush()
            created_tickets.append(ticket)
        
        # Criar respostas para alguns chamados
        responses_data = [
            {
                'ticketId': created_tickets[1].id,
                'technicianId': created_users[1].id,
                'technicianName': created_users[1].name,
                'message': 'Olá! Analisei seu caso e acredito que seja problema na placa-mãe. Posso fazer uma visita técnica amanhã às 14h para confirmar o diagnóstico.',
                'estimatedCost': 'R$ 150 - R$ 300'
            },
            {
                'ticketId': created_tickets[2].id,
                'technicianId': created_users[2].id,
                'technicianName': created_users[2].name,
                'message': 'Problema resolvido! Era defeito na placa T-CON. Peça substituída e TV funcionando perfeitamente.',
                'estimatedCost': 'R$ 280'
            }
        ]
        
        for response_data in responses_data:
            response = TicketResponse.from_dict(response_data)
            response.created_at = datetime.utcnow() - timedelta(hours=2)
            db.session.add(response)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Dados de demonstração criados com sucesso',
            'stats': {
                'users': len(created_users),
                'tickets': len(created_tickets),
                'responses': len(responses_data)
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@demo_bp.route('/demo/reset', methods=['POST'])
def reset_demo_data():
    """Reset dos dados de demonstração"""
    try:
        # Limpar todos os dados
        TicketResponse.query.delete()
        Ticket.query.delete()
        User.query.delete()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Dados resetados com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

