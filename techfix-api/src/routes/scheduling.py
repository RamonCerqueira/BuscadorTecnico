from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, time
import json
from src.models.user import db, User
from src.models.ticket import Ticket
from src.routes.notifications import notification_service
from src.routes.whatsapp import send_whatsapp_notification

scheduling_bp = Blueprint('scheduling', __name__)

# Modelo para agendamentos
class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Informações de agendamento
    scheduled_date = db.Column(db.Date, nullable=False)
    scheduled_time = db.Column(db.Time, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    
    # Status do agendamento
    status = db.Column(db.String(50), default='scheduled')  # scheduled, confirmed, in_progress, completed, cancelled, rescheduled
    
    # Informações de localização
    address = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_notes = db.Column(db.Text)
    
    # Informações do serviço
    service_type = db.Column(db.String(100))  # on_site, remote, pickup_delivery
    estimated_cost = db.Column(db.Float)
    actual_cost = db.Column(db.Float)
    
    # Notas e observações
    technician_notes = db.Column(db.Text)
    client_notes = db.Column(db.Text)
    internal_notes = db.Column(db.Text)
    
    # Lembretes
    reminder_sent = db.Column(db.Boolean, default=False)
    confirmation_required = db.Column(db.Boolean, default=True)
    confirmed_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    # Relacionamentos
    ticket = db.relationship('Ticket', backref='appointments')
    technician = db.relationship('User', foreign_keys=[technician_id], backref='technician_appointments')
    client = db.relationship('User', foreign_keys=[client_id], backref='client_appointments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticketId': self.ticket_id,
            'technicianId': self.technician_id,
            'clientId': self.client_id,
            'scheduledDate': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduledTime': self.scheduled_time.strftime('%H:%M') if self.scheduled_time else None,
            'durationMinutes': self.duration_minutes,
            'status': self.status,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'locationNotes': self.location_notes,
            'serviceType': self.service_type,
            'estimatedCost': self.estimated_cost,
            'actualCost': self.actual_cost,
            'technicianNotes': self.technician_notes,
            'clientNotes': self.client_notes,
            'internalNotes': self.internal_notes,
            'reminderSent': self.reminder_sent,
            'confirmationRequired': self.confirmation_required,
            'confirmedAt': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'cancelledAt': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
            'technician': {
                'id': self.technician.id,
                'name': self.technician.name,
                'phone': self.technician.phone
            } if self.technician else None,
            'client': {
                'id': self.client.id,
                'name': self.client.name,
                'phone': self.client.phone
            } if self.client else None,
            'ticket': {
                'id': self.ticket.id,
                'title': self.ticket.title,
                'deviceType': self.ticket.device_type
            } if self.ticket else None
        }

# Modelo para disponibilidade de técnicos
class TechnicianAvailability(db.Model):
    __tablename__ = 'technician_availability'
    
    id = db.Column(db.Integer, primary_key=True)
    technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Dia da semana (0=Segunda, 6=Domingo)
    day_of_week = db.Column(db.Integer, nullable=False)
    
    # Horários de trabalho
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    
    # Configurações
    is_available = db.Column(db.Boolean, default=True)
    max_appointments = db.Column(db.Integer, default=8)
    
    # Relacionamento
    technician = db.relationship('User', backref='availability_schedule')
    
    def to_dict(self):
        return {
            'id': self.id,
            'technicianId': self.technician_id,
            'dayOfWeek': self.day_of_week,
            'startTime': self.start_time.strftime('%H:%M'),
            'endTime': self.end_time.strftime('%H:%M'),
            'isAvailable': self.is_available,
            'maxAppointments': self.max_appointments
        }

class SchedulingService:
    def __init__(self):
        self.default_duration = 60  # minutos
        self.buffer_time = 15       # tempo entre agendamentos
        self.advance_booking_days = 30  # dias de antecedência máxima
        self.min_advance_hours = 2      # horas mínimas de antecedência
        
        # Horários padrão de trabalho
        self.default_work_hours = {
            'start': time(8, 0),   # 08:00
            'end': time(18, 0),    # 18:00
            'lunch_start': time(12, 0),  # 12:00
            'lunch_end': time(13, 0)     # 13:00
        }
    
    def get_available_slots(self, technician_id, date, duration_minutes=None):
        """Obter horários disponíveis para um técnico em uma data"""
        try:
            if duration_minutes is None:
                duration_minutes = self.default_duration
            
            # Verificar se a data é válida
            if not self.is_valid_booking_date(date):
                return []
            
            # Buscar disponibilidade do técnico
            day_of_week = date.weekday()  # 0=Segunda, 6=Domingo
            availability = TechnicianAvailability.query.filter_by(
                technician_id=technician_id,
                day_of_week=day_of_week,
                is_available=True
            ).first()
            
            if not availability:
                # Usar horário padrão se não configurado
                work_start = self.default_work_hours['start']
                work_end = self.default_work_hours['end']
            else:
                work_start = availability.start_time
                work_end = availability.end_time
            
            # Buscar agendamentos existentes
            existing_appointments = Appointment.query.filter_by(
                technician_id=technician_id,
                scheduled_date=date
            ).filter(
                Appointment.status.in_(['scheduled', 'confirmed', 'in_progress'])
            ).all()
            
            # Gerar slots disponíveis
            available_slots = self.generate_time_slots(
                work_start, work_end, duration_minutes, existing_appointments
            )
            
            return available_slots
            
        except Exception as e:
            print(f"Erro ao buscar horários disponíveis: {e}")
            return []
    
    def generate_time_slots(self, start_time, end_time, duration_minutes, existing_appointments):
        """Gerar slots de tempo disponíveis"""
        try:
            slots = []
            current_time = datetime.combine(datetime.today(), start_time)
            end_datetime = datetime.combine(datetime.today(), end_time)
            
            # Converter agendamentos existentes para intervalos ocupados
            occupied_intervals = []
            for appointment in existing_appointments:
                app_start = datetime.combine(datetime.today(), appointment.scheduled_time)
                app_end = app_start + timedelta(minutes=appointment.duration_minutes)
                occupied_intervals.append((app_start, app_end))
            
            # Gerar slots
            while current_time + timedelta(minutes=duration_minutes) <= end_datetime:
                slot_end = current_time + timedelta(minutes=duration_minutes)
                
                # Verificar se o slot não conflita com agendamentos existentes
                is_available = True
                for occupied_start, occupied_end in occupied_intervals:
                    if (current_time < occupied_end and slot_end > occupied_start):
                        is_available = False
                        break
                
                # Verificar se não é horário de almoço
                lunch_start = datetime.combine(datetime.today(), self.default_work_hours['lunch_start'])
                lunch_end = datetime.combine(datetime.today(), self.default_work_hours['lunch_end'])
                
                if current_time < lunch_end and slot_end > lunch_start:
                    is_available = False
                
                if is_available:
                    slots.append({
                        'time': current_time.time().strftime('%H:%M'),
                        'available': True,
                        'duration': duration_minutes
                    })
                
                # Próximo slot (com buffer)
                current_time += timedelta(minutes=duration_minutes + self.buffer_time)
            
            return slots
            
        except Exception as e:
            print(f"Erro ao gerar slots: {e}")
            return []
    
    def is_valid_booking_date(self, date):
        """Verificar se a data é válida para agendamento"""
        try:
            today = datetime.now().date()
            
            # Não pode ser no passado
            if date < today:
                return False
            
            # Não pode ser muito no futuro
            max_date = today + timedelta(days=self.advance_booking_days)
            if date > max_date:
                return False
            
            # Se for hoje, verificar horário mínimo
            if date == today:
                min_time = datetime.now() + timedelta(hours=self.min_advance_hours)
                if min_time.date() > today:  # Passou do dia
                    return False
            
            return True
            
        except Exception as e:
            return False
    
    def create_appointment(self, appointment_data):
        """Criar novo agendamento"""
        try:
            # Validar dados obrigatórios
            required_fields = ['ticket_id', 'technician_id', 'client_id', 'scheduled_date', 'scheduled_time']
            for field in required_fields:
                if field not in appointment_data:
                    return {'success': False, 'error': f'Campo {field} é obrigatório'}
            
            # Converter data e hora
            scheduled_date = datetime.strptime(appointment_data['scheduled_date'], '%Y-%m-%d').date()
            scheduled_time = datetime.strptime(appointment_data['scheduled_time'], '%H:%M').time()
            
            # Verificar se a data é válida
            if not self.is_valid_booking_date(scheduled_date):
                return {'success': False, 'error': 'Data inválida para agendamento'}
            
            # Verificar disponibilidade
            available_slots = self.get_available_slots(
                appointment_data['technician_id'],
                scheduled_date,
                appointment_data.get('duration_minutes', self.default_duration)
            )
            
            time_str = scheduled_time.strftime('%H:%M')
            if not any(slot['time'] == time_str and slot['available'] for slot in available_slots):
                return {'success': False, 'error': 'Horário não disponível'}
            
            # Criar agendamento
            appointment = Appointment(
                ticket_id=appointment_data['ticket_id'],
                technician_id=appointment_data['technician_id'],
                client_id=appointment_data['client_id'],
                scheduled_date=scheduled_date,
                scheduled_time=scheduled_time,
                duration_minutes=appointment_data.get('duration_minutes', self.default_duration),
                address=appointment_data.get('address'),
                latitude=appointment_data.get('latitude'),
                longitude=appointment_data.get('longitude'),
                location_notes=appointment_data.get('location_notes'),
                service_type=appointment_data.get('service_type', 'on_site'),
                estimated_cost=appointment_data.get('estimated_cost'),
                technician_notes=appointment_data.get('technician_notes'),
                client_notes=appointment_data.get('client_notes'),
                confirmation_required=appointment_data.get('confirmation_required', True)
            )
            
            db.session.add(appointment)
            db.session.commit()
            
            # Enviar notificações
            self.send_appointment_notifications(appointment, 'created')
            
            return {'success': True, 'appointment': appointment.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def update_appointment_status(self, appointment_id, new_status, notes=None):
        """Atualizar status do agendamento"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'success': False, 'error': 'Agendamento não encontrado'}
            
            old_status = appointment.status
            appointment.status = new_status
            appointment.updated_at = datetime.utcnow()
            
            if notes:
                appointment.internal_notes = notes
            
            # Atualizar timestamps específicos
            if new_status == 'confirmed':
                appointment.confirmed_at = datetime.utcnow()
            elif new_status == 'cancelled':
                appointment.cancelled_at = datetime.utcnow()
            elif new_status == 'completed':
                appointment.completed_at = datetime.utcnow()
            
            db.session.commit()
            
            # Enviar notificações se houve mudança de status
            if old_status != new_status:
                self.send_appointment_notifications(appointment, 'status_changed')
            
            return {'success': True, 'appointment': appointment.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def reschedule_appointment(self, appointment_id, new_date, new_time):
        """Reagendar compromisso"""
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return {'success': False, 'error': 'Agendamento não encontrado'}
            
            # Converter nova data e hora
            new_scheduled_date = datetime.strptime(new_date, '%Y-%m-%d').date()
            new_scheduled_time = datetime.strptime(new_time, '%H:%M').time()
            
            # Verificar disponibilidade no novo horário
            available_slots = self.get_available_slots(
                appointment.technician_id,
                new_scheduled_date,
                appointment.duration_minutes
            )
            
            time_str = new_scheduled_time.strftime('%H:%M')
            if not any(slot['time'] == time_str and slot['available'] for slot in available_slots):
                return {'success': False, 'error': 'Novo horário não disponível'}
            
            # Salvar dados antigos para histórico
            old_date = appointment.scheduled_date
            old_time = appointment.scheduled_time
            
            # Atualizar agendamento
            appointment.scheduled_date = new_scheduled_date
            appointment.scheduled_time = new_scheduled_time
            appointment.status = 'rescheduled'
            appointment.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Enviar notificações
            self.send_appointment_notifications(appointment, 'rescheduled', {
                'old_date': old_date.isoformat(),
                'old_time': old_time.strftime('%H:%M')
            })
            
            return {'success': True, 'appointment': appointment.to_dict()}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def send_appointment_notifications(self, appointment, event_type, extra_data=None):
        """Enviar notificações relacionadas ao agendamento"""
        try:
            # Preparar dados da notificação
            notification_data = {
                'appointment_id': appointment.id,
                'ticket_id': appointment.ticket_id,
                'event_type': event_type,
                'scheduled_date': appointment.scheduled_date.isoformat(),
                'scheduled_time': appointment.scheduled_time.strftime('%H:%M')
            }
            
            if extra_data:
                notification_data.update(extra_data)
            
            # Notificações baseadas no evento
            if event_type == 'created':
                # Notificar cliente
                if notification_service:
                    notification_service.send_notification(
                        appointment.client_id,
                        {
                            'type': 'appointment_scheduled',
                            'title': 'Agendamento Confirmado',
                            'message': f'Seu atendimento foi agendado para {appointment.scheduled_date.strftime("%d/%m/%Y")} às {appointment.scheduled_time.strftime("%H:%M")}',
                            'data': notification_data
                        }
                    )
                
                # Notificar técnico
                if notification_service:
                    notification_service.send_notification(
                        appointment.technician_id,
                        {
                            'type': 'new_appointment',
                            'title': 'Novo Agendamento',
                            'message': f'Você tem um novo atendimento agendado para {appointment.scheduled_date.strftime("%d/%m/%Y")} às {appointment.scheduled_time.strftime("%H:%M")}',
                            'data': notification_data
                        }
                    )
                
                # WhatsApp para cliente
                send_whatsapp_notification(appointment.ticket_id, 'appointment_scheduled')
            
            elif event_type == 'status_changed':
                status_messages = {
                    'confirmed': 'Seu agendamento foi confirmado',
                    'cancelled': 'Seu agendamento foi cancelado',
                    'completed': 'Seu atendimento foi concluído',
                    'in_progress': 'Seu atendimento está em andamento'
                }
                
                message = status_messages.get(appointment.status, f'Status do agendamento alterado para {appointment.status}')
                
                # Notificar cliente
                if notification_service:
                    notification_service.send_notification(
                        appointment.client_id,
                        {
                            'type': 'appointment_status_changed',
                            'title': 'Agendamento Atualizado',
                            'message': message,
                            'data': notification_data
                        }
                    )
            
            elif event_type == 'rescheduled':
                # Notificar cliente sobre reagendamento
                if notification_service:
                    notification_service.send_notification(
                        appointment.client_id,
                        {
                            'type': 'appointment_rescheduled',
                            'title': 'Agendamento Reagendado',
                            'message': f'Seu atendimento foi reagendado para {appointment.scheduled_date.strftime("%d/%m/%Y")} às {appointment.scheduled_time.strftime("%H:%M")}',
                            'data': notification_data
                        }
                    )
            
        except Exception as e:
            print(f"Erro ao enviar notificações de agendamento: {e}")
    
    def send_appointment_reminders(self):
        """Enviar lembretes de agendamentos (para ser executado periodicamente)"""
        try:
            # Buscar agendamentos para amanhã que ainda não tiveram lembrete enviado
            tomorrow = datetime.now().date() + timedelta(days=1)
            
            appointments = Appointment.query.filter_by(
                scheduled_date=tomorrow,
                reminder_sent=False
            ).filter(
                Appointment.status.in_(['scheduled', 'confirmed'])
            ).all()
            
            for appointment in appointments:
                # Enviar lembrete para cliente
                if notification_service:
                    notification_service.send_notification(
                        appointment.client_id,
                        {
                            'type': 'appointment_reminder',
                            'title': 'Lembrete de Agendamento',
                            'message': f'Você tem um atendimento agendado para amanhã às {appointment.scheduled_time.strftime("%H:%M")}',
                            'data': {
                                'appointment_id': appointment.id,
                                'ticket_id': appointment.ticket_id
                            }
                        }
                    )
                
                # Enviar lembrete para técnico
                if notification_service:
                    notification_service.send_notification(
                        appointment.technician_id,
                        {
                            'type': 'appointment_reminder',
                            'title': 'Lembrete de Atendimento',
                            'message': f'Você tem um atendimento agendado para amanhã às {appointment.scheduled_time.strftime("%H:%M")}',
                            'data': {
                                'appointment_id': appointment.id,
                                'ticket_id': appointment.ticket_id
                            }
                        }
                    )
                
                # Marcar lembrete como enviado
                appointment.reminder_sent = True
            
            db.session.commit()
            
            return len(appointments)
            
        except Exception as e:
            print(f"Erro ao enviar lembretes: {e}")
            return 0

# Instância global do serviço
scheduling_service = SchedulingService()

# Rotas da API
@scheduling_bp.route('/scheduling/available-slots', methods=['GET'])
def get_available_slots():
    """Obter horários disponíveis para agendamento"""
    try:
        technician_id = request.args.get('technician_id')
        date_str = request.args.get('date')
        duration = request.args.get('duration', 60, type=int)
        
        if not technician_id or not date_str:
            return jsonify({
                'success': False,
                'error': 'ID do técnico e data são obrigatórios'
            }), 400
        
        # Converter data
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Formato de data inválido. Use YYYY-MM-DD'
            }), 400
        
        # Buscar slots disponíveis
        slots = scheduling_service.get_available_slots(technician_id, date, duration)
        
        return jsonify({
            'success': True,
            'date': date_str,
            'technician_id': technician_id,
            'available_slots': slots
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/appointments', methods=['POST'])
def create_appointment():
    """Criar novo agendamento"""
    try:
        data = request.get_json()
        
        result = scheduling_service.create_appointment(data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/appointments/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Obter detalhes de um agendamento"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        
        return jsonify({
            'success': True,
            'appointment': appointment.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/appointments/<int:appointment_id>/status', methods=['PUT'])
def update_appointment_status():
    """Atualizar status do agendamento"""
    try:
        appointment_id = request.view_args['appointment_id']
        data = request.get_json()
        
        new_status = data.get('status')
        notes = data.get('notes')
        
        if not new_status:
            return jsonify({
                'success': False,
                'error': 'Status é obrigatório'
            }), 400
        
        result = scheduling_service.update_appointment_status(appointment_id, new_status, notes)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/appointments/<int:appointment_id>/reschedule', methods=['PUT'])
def reschedule_appointment():
    """Reagendar compromisso"""
    try:
        appointment_id = request.view_args['appointment_id']
        data = request.get_json()
        
        new_date = data.get('new_date')
        new_time = data.get('new_time')
        
        if not new_date or not new_time:
            return jsonify({
                'success': False,
                'error': 'Nova data e horário são obrigatórios'
            }), 400
        
        result = scheduling_service.reschedule_appointment(appointment_id, new_date, new_time)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/appointments', methods=['GET'])
def list_appointments():
    """Listar agendamentos com filtros"""
    try:
        # Parâmetros de filtro
        technician_id = request.args.get('technician_id')
        client_id = request.args.get('client_id')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Construir query
        query = Appointment.query
        
        if technician_id:
            query = query.filter_by(technician_id=technician_id)
        
        if client_id:
            query = query.filter_by(client_id=client_id)
        
        if date_from:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            query = query.filter(Appointment.scheduled_date >= date_from_obj)
        
        if date_to:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            query = query.filter(Appointment.scheduled_date <= date_to_obj)
        
        if status:
            query = query.filter_by(status=status)
        
        # Paginar resultados
        appointments = query.order_by(Appointment.scheduled_date.desc(), Appointment.scheduled_time.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'appointments': [appointment.to_dict() for appointment in appointments.items],
            'pagination': {
                'page': page,
                'pages': appointments.pages,
                'per_page': per_page,
                'total': appointments.total
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/technician-availability', methods=['POST'])
def set_technician_availability():
    """Configurar disponibilidade do técnico"""
    try:
        data = request.get_json()
        
        technician_id = data.get('technician_id')
        availability_data = data.get('availability', [])
        
        if not technician_id:
            return jsonify({
                'success': False,
                'error': 'ID do técnico é obrigatório'
            }), 400
        
        # Remover disponibilidade existente
        TechnicianAvailability.query.filter_by(technician_id=technician_id).delete()
        
        # Adicionar nova disponibilidade
        for item in availability_data:
            availability = TechnicianAvailability(
                technician_id=technician_id,
                day_of_week=item['day_of_week'],
                start_time=datetime.strptime(item['start_time'], '%H:%M').time(),
                end_time=datetime.strptime(item['end_time'], '%H:%M').time(),
                is_available=item.get('is_available', True),
                max_appointments=item.get('max_appointments', 8)
            )
            db.session.add(availability)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Disponibilidade atualizada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/technician-availability/<int:technician_id>', methods=['GET'])
def get_technician_availability(technician_id):
    """Obter disponibilidade do técnico"""
    try:
        availability = TechnicianAvailability.query.filter_by(technician_id=technician_id).all()
        
        return jsonify({
            'success': True,
            'technician_id': technician_id,
            'availability': [item.to_dict() for item in availability]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/send-reminders', methods=['POST'])
def send_reminders():
    """Enviar lembretes de agendamentos (endpoint para cron job)"""
    try:
        count = scheduling_service.send_appointment_reminders()
        
        return jsonify({
            'success': True,
            'reminders_sent': count
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@scheduling_bp.route('/scheduling/calendar/<int:technician_id>', methods=['GET'])
def get_technician_calendar(technician_id):
    """Obter calendário do técnico"""
    try:
        # Parâmetros de data
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        if not date_from or not date_to:
            # Padrão: próximos 30 dias
            today = datetime.now().date()
            date_from = today
            date_to = today + timedelta(days=30)
        else:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
        
        # Buscar agendamentos
        appointments = Appointment.query.filter_by(technician_id=technician_id).filter(
            Appointment.scheduled_date >= date_from,
            Appointment.scheduled_date <= date_to
        ).order_by(Appointment.scheduled_date, Appointment.scheduled_time).all()
        
        # Organizar por data
        calendar = {}
        current_date = date_from
        
        while current_date <= date_to:
            date_str = current_date.isoformat()
            calendar[date_str] = {
                'date': date_str,
                'appointments': [],
                'available_slots': scheduling_service.get_available_slots(technician_id, current_date)
            }
            current_date += timedelta(days=1)
        
        # Adicionar agendamentos ao calendário
        for appointment in appointments:
            date_str = appointment.scheduled_date.isoformat()
            if date_str in calendar:
                calendar[date_str]['appointments'].append(appointment.to_dict())
        
        return jsonify({
            'success': True,
            'technician_id': technician_id,
            'date_from': date_from.isoformat(),
            'date_to': date_to.isoformat(),
            'calendar': calendar
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

