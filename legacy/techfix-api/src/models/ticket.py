from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

# Importar db do módulo user para usar a mesma instância
from src.models.user import db

class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='open')  # open, in_progress, resolved, closed
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    device_type = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(100))
    
    # Cliente
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    client_name = db.Column(db.String(100), nullable=False)
    client_phone = db.Column(db.String(20), nullable=False)
    client_email = db.Column(db.String(100))
    
    # Localização
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    location_address = db.Column(db.String(200), nullable=False)
    
    # Técnico responsável
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    assigned_to_name = db.Column(db.String(100))
    assigned_to_type = db.Column(db.String(20))  # technician, company
    
    # Mídias (JSON)
    images = db.Column(db.Text)  # JSON array
    videos = db.Column(db.Text)  # JSON array
    audio = db.Column(db.Text)   # JSON object
    
    # IA e estimativas
    ai_suggestion = db.Column(db.Text)
    estimated_cost = db.Column(db.String(100))
    tags = db.Column(db.Text)  # JSON array
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    client = db.relationship('User', foreign_keys=[client_id], backref='client_tickets')
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='assigned_tickets')
    responses = db.relationship('TicketResponse', backref='ticket', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'deviceType': self.device_type,
            'brand': self.brand,
            'model': self.model,
            'clientId': self.client_id,
            'clientName': self.client_name,
            'clientPhone': self.client_phone,
            'clientEmail': self.client_email,
            'location': {
                'lat': self.location_lat,
                'lng': self.location_lng,
                'address': self.location_address
            },
            'assignedTo': {
                'id': self.assigned_to_id,
                'name': self.assigned_to_name,
                'type': self.assigned_to_type
            } if self.assigned_to_id else None,
            'images': json.loads(self.images) if self.images else [],
            'videos': json.loads(self.videos) if self.videos else [],
            'audio': json.loads(self.audio) if self.audio else None,
            'aiSuggestion': self.ai_suggestion,
            'estimatedCost': self.estimated_cost,
            'tags': json.loads(self.tags) if self.tags else [],
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'responses': [response.to_dict() for response in self.responses]
        }
    
    @staticmethod
    def from_dict(data):
        ticket = Ticket()
        ticket.title = data.get('title')
        ticket.description = data.get('description')
        ticket.status = data.get('status', 'open')
        ticket.priority = data.get('priority', 'medium')
        ticket.device_type = data.get('deviceType')
        ticket.brand = data.get('brand')
        ticket.model = data.get('model')
        ticket.client_id = data.get('clientId')
        ticket.client_name = data.get('clientName')
        ticket.client_phone = data.get('clientPhone')
        ticket.client_email = data.get('clientEmail')
        
        location = data.get('location', {})
        ticket.location_lat = location.get('lat')
        ticket.location_lng = location.get('lng')
        ticket.location_address = location.get('address')
        
        assigned_to = data.get('assignedTo')
        if assigned_to:
            ticket.assigned_to_id = assigned_to.get('id')
            ticket.assigned_to_name = assigned_to.get('name')
            ticket.assigned_to_type = assigned_to.get('type')
        
        ticket.images = json.dumps(data.get('images', []))
        ticket.videos = json.dumps(data.get('videos', []))
        ticket.audio = json.dumps(data.get('audio')) if data.get('audio') else None
        ticket.ai_suggestion = data.get('aiSuggestion')
        ticket.estimated_cost = data.get('estimatedCost')
        ticket.tags = json.dumps(data.get('tags', []))
        
        return ticket


class TicketResponse(db.Model):
    __tablename__ = 'ticket_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    technician_name = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    estimated_cost = db.Column(db.String(100))
    visit_scheduled = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    technician = db.relationship('User', backref='responses')
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticketId': self.ticket_id,
            'technicianId': self.technician_id,
            'technicianName': self.technician_name,
            'message': self.message,
            'estimatedCost': self.estimated_cost,
            'visitScheduled': self.visit_scheduled.isoformat() if self.visit_scheduled else None,
            'createdAt': self.created_at.isoformat()
        }
    
    @staticmethod
    def from_dict(data):
        response = TicketResponse()
        response.ticket_id = data.get('ticketId')
        response.technician_id = data.get('technicianId')
        response.technician_name = data.get('technicianName')
        response.message = data.get('message')
        response.estimated_cost = data.get('estimatedCost')
        
        if data.get('visitScheduled'):
            response.visit_scheduled = datetime.fromisoformat(data.get('visitScheduled').replace('Z', '+00:00'))
        
        return response

