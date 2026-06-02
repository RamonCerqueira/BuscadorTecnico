from flask import Blueprint, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from src.models.user import db, User
from src.models.ticket import Ticket
from datetime import datetime
import json

notifications_bp = Blueprint('notifications', __name__)

# Armazenar conexões ativas dos usuários
active_connections = {}

class NotificationService:
    def __init__(self, socketio):
        self.socketio = socketio
    
    def send_notification(self, user_id, notification_data):
        """Enviar notificação para um usuário específico"""
        try:
            # Salvar notificação no banco
            notification = Notification.from_dict({
                'userId': user_id,
                'type': notification_data.get('type'),
                'title': notification_data.get('title'),
                'message': notification_data.get('message'),
                'data': notification_data.get('data', {}),
                'read': False
            })
            db.session.add(notification)
            db.session.commit()
            
            # Enviar via WebSocket se usuário estiver online
            room = f"user_{user_id}"
            self.socketio.emit('notification', {
                'id': notification.id,
                'type': notification.type,
                'title': notification.title,
                'message': notification.message,
                'data': json.loads(notification.data) if notification.data else {},
                'timestamp': notification.created_at.isoformat(),
                'read': notification.read
            }, room=room)
            
            return True
        except Exception as e:
            print(f"Erro ao enviar notificação: {e}")
            return False
    
    def send_ticket_notification(self, ticket_id, notification_type, additional_data=None):
        """Enviar notificações relacionadas a chamados"""
        try:
            ticket = Ticket.query.get(ticket_id)
            if not ticket:
                return False
            
            notifications = []
            
            if notification_type == 'ticket_created':
                # Notificar técnicos próximos
                nearby_technicians = self._get_nearby_technicians(ticket)
                for tech in nearby_technicians:
                    notifications.append({
                        'user_id': tech.id,
                        'type': 'new_ticket',
                        'title': 'Novo Chamado Disponível',
                        'message': f'Novo chamado: {ticket.title}',
                        'data': {'ticket_id': ticket.id, 'priority': ticket.priority}
                    })
            
            elif notification_type == 'ticket_assigned':
                # Notificar cliente sobre atribuição
                notifications.append({
                    'user_id': ticket.client_id,
                    'type': 'ticket_assigned',
                    'title': 'Técnico Atribuído',
                    'message': f'Técnico {ticket.assigned_to_name} foi atribuído ao seu chamado',
                    'data': {'ticket_id': ticket.id, 'technician_name': ticket.assigned_to_name}
                })
                
                # Notificar técnico sobre nova atribuição
                if ticket.assigned_to_id:
                    notifications.append({
                        'user_id': ticket.assigned_to_id,
                        'type': 'ticket_assigned_to_me',
                        'title': 'Novo Chamado Atribuído',
                        'message': f'Você foi atribuído ao chamado: {ticket.title}',
                        'data': {'ticket_id': ticket.id, 'client_name': ticket.client_name}
                    })
            
            elif notification_type == 'ticket_status_changed':
                status_messages = {
                    'in_progress': 'Seu chamado está em andamento',
                    'resolved': 'Seu chamado foi resolvido',
                    'closed': 'Seu chamado foi fechado'
                }
                
                notifications.append({
                    'user_id': ticket.client_id,
                    'type': 'ticket_status_changed',
                    'title': 'Status do Chamado Atualizado',
                    'message': status_messages.get(ticket.status, 'Status do chamado foi atualizado'),
                    'data': {'ticket_id': ticket.id, 'status': ticket.status}
                })
            
            elif notification_type == 'new_message':
                # Notificar sobre nova mensagem no chat
                sender_name = additional_data.get('sender_name', 'Usuário')
                recipient_id = additional_data.get('recipient_id')
                
                if recipient_id:
                    notifications.append({
                        'user_id': recipient_id,
                        'type': 'new_message',
                        'title': 'Nova Mensagem',
                        'message': f'{sender_name} enviou uma mensagem',
                        'data': {'ticket_id': ticket.id, 'sender_name': sender_name}
                    })
            
            # Enviar todas as notificações
            for notif in notifications:
                self.send_notification(notif['user_id'], notif)
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar notificação de chamado: {e}")
            return False
    
    def _get_nearby_technicians(self, ticket, radius_km=25):
        """Buscar técnicos próximos ao chamado"""
        try:
            # Buscar técnicos ativos e verificados
            technicians = User.query.filter(
                User.user_type.in_(['technician', 'company']),
                User.is_active == True,
                User.is_verified == True
            ).all()
            
            nearby_techs = []
            for tech in technicians:
                # Verificar especialidade
                if tech.specialties:
                    specialties = json.loads(tech.specialties)
                    if ticket.device_type not in specialties:
                        continue
                
                # Calcular distância (simplificado)
                if tech.location_lat and tech.location_lng and ticket.location_lat and ticket.location_lng:
                    distance = abs(ticket.location_lat - tech.location_lat) + abs(ticket.location_lng - tech.location_lng)
                    distance_km = distance * 111  # Aproximação
                    
                    if distance_km <= radius_km:
                        nearby_techs.append(tech)
            
            return nearby_techs[:10]  # Limitar a 10 técnicos
            
        except Exception as e:
            print(f"Erro ao buscar técnicos próximos: {e}")
            return []

# Modelo para armazenar notificações
class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    data = db.Column(db.Text)  # JSON data
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento
    user = db.relationship('User', backref='notifications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'data': json.loads(self.data) if self.data else {},
            'read': self.read,
            'createdAt': self.created_at.isoformat()
        }
    
    @staticmethod
    def from_dict(data):
        notification = Notification()
        notification.user_id = data.get('userId')
        notification.type = data.get('type')
        notification.title = data.get('title')
        notification.message = data.get('message')
        notification.data = json.dumps(data.get('data', {}))
        notification.read = data.get('read', False)
        return notification

# Rotas da API
@notifications_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Buscar notificações do usuário"""
    try:
        user_id = request.args.get('user_id')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(read=False)
        
        notifications = query.order_by(Notification.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'notifications': [notif.to_dict() for notif in notifications.items],
            'pagination': {
                'page': page,
                'pages': notifications.pages,
                'per_page': per_page,
                'total': notifications.total
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@notifications_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_as_read(notification_id):
    """Marcar notificação como lida"""
    try:
        notification = Notification.query.get_or_404(notification_id)
        notification.read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'notification': notification.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@notifications_bp.route('/notifications/mark-all-read', methods=['POST'])
def mark_all_as_read():
    """Marcar todas as notificações como lidas"""
    try:
        user_id = request.json.get('user_id')
        
        Notification.query.filter_by(user_id=user_id, read=False).update({'read': True})
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Todas as notificações foram marcadas como lidas'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@notifications_bp.route('/notifications/send', methods=['POST'])
def send_notification():
    """Enviar notificação manual (para testes ou admin)"""
    try:
        data = request.get_json()
        
        notification_service = NotificationService(None)  # SocketIO será injetado
        success = notification_service.send_notification(
            data.get('user_id'),
            {
                'type': data.get('type'),
                'title': data.get('title'),
                'message': data.get('message'),
                'data': data.get('data', {})
            }
        )
        
        if success:
            return jsonify({'success': True, 'message': 'Notificação enviada com sucesso'})
        else:
            return jsonify({'success': False, 'error': 'Erro ao enviar notificação'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@notifications_bp.route('/notifications/stats', methods=['GET'])
def get_notification_stats():
    """Estatísticas de notificações do usuário"""
    try:
        user_id = request.args.get('user_id')
        
        total = Notification.query.filter_by(user_id=user_id).count()
        unread = Notification.query.filter_by(user_id=user_id, read=False).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'unread': unread,
                'read': total - unread
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Eventos WebSocket
def init_socketio_events(socketio):
    """Inicializar eventos WebSocket"""
    
    @socketio.on('connect')
    def handle_connect(auth):
        """Usuário conectou"""
        try:
            user_id = auth.get('user_id') if auth else None
            if user_id:
                room = f"user_{user_id}"
                join_room(room)
                active_connections[user_id] = request.sid
                print(f"Usuário {user_id} conectado")
        except Exception as e:
            print(f"Erro na conexão: {e}")
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Usuário desconectou"""
        try:
            # Remover das conexões ativas
            for user_id, sid in list(active_connections.items()):
                if sid == request.sid:
                    del active_connections[user_id]
                    print(f"Usuário {user_id} desconectado")
                    break
        except Exception as e:
            print(f"Erro na desconexão: {e}")
    
    @socketio.on('join_ticket_room')
    def handle_join_ticket_room(data):
        """Entrar na sala de um chamado específico"""
        try:
            ticket_id = data.get('ticket_id')
            if ticket_id:
                room = f"ticket_{ticket_id}"
                join_room(room)
                print(f"Usuário entrou na sala do chamado {ticket_id}")
        except Exception as e:
            print(f"Erro ao entrar na sala do chamado: {e}")
    
    @socketio.on('leave_ticket_room')
    def handle_leave_ticket_room(data):
        """Sair da sala de um chamado específico"""
        try:
            ticket_id = data.get('ticket_id')
            if ticket_id:
                room = f"ticket_{ticket_id}"
                leave_room(room)
                print(f"Usuário saiu da sala do chamado {ticket_id}")
        except Exception as e:
            print(f"Erro ao sair da sala do chamado: {e}")
    
    @socketio.on('send_message')
    def handle_send_message(data):
        """Enviar mensagem no chat do chamado"""
        try:
            ticket_id = data.get('ticket_id')
            message = data.get('message')
            sender_id = data.get('sender_id')
            sender_name = data.get('sender_name')
            
            if ticket_id and message and sender_id:
                # Emitir mensagem para todos na sala do chamado
                room = f"ticket_{ticket_id}"
                socketio.emit('new_message', {
                    'ticket_id': ticket_id,
                    'message': message,
                    'sender_id': sender_id,
                    'sender_name': sender_name,
                    'timestamp': datetime.utcnow().isoformat()
                }, room=room)
                
                # Enviar notificação para participantes
                ticket = Ticket.query.get(ticket_id)
                if ticket:
                    notification_service = NotificationService(socketio)
                    
                    # Determinar destinatário
                    recipient_id = ticket.assigned_to_id if sender_id == ticket.client_id else ticket.client_id
                    
                    if recipient_id:
                        notification_service.send_ticket_notification(
                            ticket_id, 
                            'new_message',
                            {'sender_name': sender_name, 'recipient_id': recipient_id}
                        )
                
        except Exception as e:
            print(f"Erro ao enviar mensagem: {e}")

# Instância global do serviço de notificações
notification_service = None

def init_notification_service(socketio):
    """Inicializar serviço de notificações"""
    global notification_service
    notification_service = NotificationService(socketio)
    return notification_service

