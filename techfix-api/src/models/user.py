from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255))
    user_type = db.Column(db.String(20), nullable=False)  # client, technician, company, admin
    
    # Campos específicos para técnicos/empresas
    cnpj = db.Column(db.String(20))
    website = db.Column(db.String(200))
    logo = db.Column(db.String(200))
    validated = db.Column(db.Boolean, default=False)
    specialties = db.Column(db.Text)  # JSON array
    
    # Localização
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    location_address = db.Column(db.String(200))
    service_radius = db.Column(db.Integer, default=15)  # km
    
    # Avaliações e estatísticas
    rating = db.Column(db.Float, default=0.0)
    total_services = db.Column(db.Integer, default=0)
    total_reviews = db.Column(db.Integer, default=0)
    
    # Avatar
    avatar = db.Column(db.String(200))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'userType': self.user_type,
            'cnpj': self.cnpj,
            'website': self.website,
            'logo': self.logo,
            'validated': self.validated,
            'specialties': json.loads(self.specialties) if self.specialties else [],
            'location': {
                'lat': self.location_lat,
                'lng': self.location_lng,
                'address': self.location_address
            } if self.location_address else None,
            'serviceRadius': self.service_radius,
            'rating': self.rating,
            'totalServices': self.total_services,
            'totalReviews': self.total_reviews,
            'avatar': self.avatar,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'lastLogin': self.last_login.isoformat() if self.last_login else None,
            'isActive': self.is_active,
            'isVerified': self.is_verified
        }
    
    @staticmethod
    def from_dict(data):
        user = User()
        user.name = data.get('name')
        user.email = data.get('email')
        user.phone = data.get('phone')
        user.user_type = data.get('userType', 'client')
        user.cnpj = data.get('cnpj')
        user.website = data.get('website')
        user.logo = data.get('logo')
        user.validated = data.get('validated', False)
        user.specialties = json.dumps(data.get('specialties', []))
        
        location = data.get('location', {})
        if location:
            user.location_lat = location.get('lat')
            user.location_lng = location.get('lng')
            user.location_address = location.get('address')
        
        user.service_radius = data.get('serviceRadius', 15)
        user.rating = data.get('rating', 0.0)
        user.total_services = data.get('totalServices', 0)
        user.total_reviews = data.get('totalReviews', 0)
        user.avatar = data.get('avatar')
        user.is_active = data.get('isActive', True)
        user.is_verified = data.get('isVerified', False)
        
        return user

