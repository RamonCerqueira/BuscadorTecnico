from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.ticket import Ticket
from datetime import datetime
import json

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    try:
        user_type = request.args.get('type')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        query = User.query
        
        # Filtrar por tipo
        if user_type and user_type != 'all':
            query = query.filter_by(user_type=user_type)
        
        # Buscar por nome ou email
        if search:
            query = query.filter(
                (User.name.contains(search)) |
                (User.email.contains(search))
            )
        
        # Paginação
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': page,
                'pages': users.pages,
                'per_page': per_page,
                'total': users.total
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        # Estatísticas do usuário
        stats = {}
        if user.user_type == 'client':
            stats = {
                'totalTickets': Ticket.query.filter_by(client_id=user_id).count(),
                'openTickets': Ticket.query.filter_by(client_id=user_id, status='open').count(),
                'resolvedTickets': Ticket.query.filter_by(client_id=user_id, status='resolved').count()
            }
        elif user.user_type in ['technician', 'company']:
            stats = {
                'assignedTickets': Ticket.query.filter_by(assigned_to_id=user_id).count(),
                'completedTickets': Ticket.query.filter_by(assigned_to_id=user_id, status='resolved').count(),
                'rating': user.rating,
                'totalServices': user.total_services
            }
        
        user_data = user.to_dict()
        user_data['stats'] = stats
        
        return jsonify({
            'success': True,
            'user': user_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Campos que podem ser atualizados
        updatable_fields = [
            'name', 'phone', 'website', 'specialties', 'location',
            'serviceRadius', 'avatar', 'isActive', 'isVerified'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'specialties':
                    user.specialties = json.dumps(data[field])
                elif field == 'location':
                    location = data[field]
                    user.location_lat = location.get('lat')
                    user.location_lng = location.get('lng')
                    user.location_address = location.get('address')
                elif field == 'serviceRadius':
                    user.service_radius = data[field]
                elif field == 'isActive':
                    user.is_active = data[field]
                elif field == 'isVerified':
                    user.is_verified = data[field]
                else:
                    setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/validate', methods=['POST'])
def validate_technician(user_id):
    """Validar técnico sem CNPJ"""
    try:
        user = User.query.get_or_404(user_id)
        
        if user.user_type != 'technician':
            return jsonify({'success': False, 'error': 'Usuário não é técnico'}), 400
        
        data = request.get_json()
        validation_data = data.get('validationData', {})
        
        # Em produção, verificaria as referências dos clientes
        user.validated = True
        user.is_verified = True
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/technicians/nearby', methods=['GET'])
def get_nearby_technicians():
    """Buscar técnicos próximos"""
    try:
        lat = float(request.args.get('lat', -23.5505))
        lng = float(request.args.get('lng', -46.6333))
        radius = int(request.args.get('radius', 25))
        device_type = request.args.get('deviceType')
        
        # Buscar técnicos e empresas ativos
        query = User.query.filter(
            User.user_type.in_(['technician', 'company']),
            User.is_active == True,
            User.is_verified == True
        )
        
        technicians = []
        for user in query.all():
            # Filtrar por especialidade
            if device_type and user.specialties:
                specialties = json.loads(user.specialties)
                if device_type not in specialties:
                    continue
            
            # Calcular distância (simplificado)
            if user.location_lat and user.location_lng:
                # Em produção, usaria fórmula de Haversine
                distance = abs(lat - user.location_lat) + abs(lng - user.location_lng)
                distance_km = distance * 111  # Aproximação
                
                if distance_km <= radius:
                    user_data = user.to_dict()
                    user_data['distance'] = round(distance_km, 1)
                    technicians.append(user_data)
        
        # Ordenar por distância e rating
        technicians.sort(key=lambda x: (x.get('distance', 0), -x.get('rating', 0)))
        
        return jsonify({
            'success': True,
            'technicians': technicians[:10]  # Limitar a 10 resultados
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/stats', methods=['GET'])
def get_users_stats():
    """Estatísticas gerais de usuários"""
    try:
        stats = {
            'total': User.query.count(),
            'clients': User.query.filter_by(user_type='client').count(),
            'technicians': User.query.filter_by(user_type='technician').count(),
            'companies': User.query.filter_by(user_type='company').count(),
            'admins': User.query.filter_by(user_type='admin').count(),
            'active': User.query.filter_by(is_active=True).count(),
            'verified': User.query.filter_by(is_verified=True).count(),
            'pendingValidation': User.query.filter(
                User.user_type == 'technician',
                User.validated == False
            ).count()
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/reviews', methods=['GET'])
def get_user_reviews(user_id):
    """Buscar avaliações do usuário (mockado)"""
    try:
        user = User.query.get_or_404(user_id)
        
        if user.user_type not in ['technician', 'company']:
            return jsonify({'success': False, 'error': 'Usuário não é técnico'}), 400
        
        # Reviews mockados para demonstração
        reviews = [
            {
                'id': 1,
                'clientName': 'Maria Santos',
                'rating': 5,
                'comment': 'Excelente atendimento! Resolveu o problema rapidamente.',
                'date': '2024-01-10',
                'ticketId': 2
            },
            {
                'id': 2,
                'clientName': 'Pedro Silva',
                'rating': 4,
                'comment': 'Bom técnico, preço justo.',
                'date': '2024-01-05',
                'ticketId': 3
            }
        ]
        
        return jsonify({
            'success': True,
            'reviews': reviews,
            'summary': {
                'averageRating': user.rating,
                'totalReviews': user.total_reviews,
                'distribution': {
                    '5': 8,
                    '4': 3,
                    '3': 1,
                    '2': 0,
                    '1': 0
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
def deactivate_user(user_id):
    """Desativar usuário"""
    try:
        user = User.query.get_or_404(user_id)
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuário desativado com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

