from flask import Blueprint, request, jsonify
from src.models.user import db, User
from datetime import datetime
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

auth_bp = Blueprint('auth', __name__)

def _token_serializer():
    secret = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    return URLSafeTimedSerializer(secret_key=secret, salt='techfix-auth')

def hash_password(password):
    """Hash de senha com algoritmo adaptativo do Werkzeug."""
    return generate_password_hash(password)

def verify_password(password, hashed):
    """Verificar senha usando hash adaptativo."""
    return check_password_hash(hashed, password)

def generate_auth_token(user_id):
    serializer = _token_serializer()
    return serializer.dumps({'user_id': user_id})

def decode_auth_token(token, max_age_seconds=60 * 60 * 24 * 7):
    serializer = _token_serializer()
    return serializer.loads(token, max_age=max_age_seconds)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email e senha são obrigatórios'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not verify_password(password, user.password_hash):
            return jsonify({'success': False, 'error': 'Credenciais inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'success': False, 'error': 'Conta desativada'}), 401
        
        # Atualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'token': generate_auth_token(user.id)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validações básicas
        required_fields = ['name', 'email', 'password', 'userType']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} é obrigatório'}), 400
        
        # Verificar se email já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email já cadastrado'}), 400
        
        # Criar usuário
        user = User.from_dict(data)
        user.password_hash = hash_password(data['password'])
        
        # Validação automática para demonstração
        if user.user_type == 'client':
            user.is_verified = True
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'token': generate_auth_token(user.id)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/demo-login', methods=['POST'])
def demo_login():
    """Login automático para demonstração"""
    try:
        data = request.get_json()
        user_type = data.get('userType', 'client')
        
        # Dados mockados para demonstração
        demo_users = {
            'client': {
                'name': 'João Silva',
                'email': 'joao@email.com',
                'phone': '(11) 99999-9999',
                'userType': 'client',
                'location': {
                    'lat': -23.5505,
                    'lng': -46.6333,
                    'address': 'São Paulo, SP'
                }
            },
            'technician': {
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
                'totalServices': 156
            },
            'company': {
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
                'totalServices': 1250
            },
            'admin': {
                'name': 'Admin Sistema',
                'email': 'admin@techfix.com',
                'phone': '(11) 66666-6666',
                'userType': 'admin'
            }
        }
        
        user_data = demo_users.get(user_type)
        if not user_data:
            return jsonify({'success': False, 'error': 'Tipo de usuário inválido'}), 400
        
        # Verificar se usuário já existe
        user = User.query.filter_by(email=user_data['email']).first()
        
        if not user:
            # Criar usuário demo
            user = User.from_dict(user_data)
            user.password_hash = hash_password('demo123')
            user.is_verified = True
            user.is_active = True
            
            db.session.add(user)
            db.session.commit()
        
        # Atualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'token': generate_auth_token(user.id)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/verify-token', methods=['POST'])
def verify_token():
    """Verificar token (mockado para demonstração)"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'success': False, 'error': 'Token inválido'}), 401

        # Compatibilidade retroativa com token antigo de demonstração
        if token.startswith('mock_token_'):
            user_id = int(token.replace('mock_token_', ''))
        else:
            payload = decode_auth_token(token)
            user_id = payload.get('user_id')

        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 401
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except SignatureExpired:
        return jsonify({'success': False, 'error': 'Token expirado'}), 401
    except BadSignature:
        return jsonify({'success': False, 'error': 'Token inválido'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """Logout (para demonstração)"""
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

@auth_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Recuperação de senha (mockado)"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'success': False, 'error': 'Email é obrigatório'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'success': False, 'error': 'Email não encontrado'}), 404
        
        # Em produção, enviaria email com link de recuperação
        return jsonify({
            'success': True,
            'message': 'Email de recuperação enviado com sucesso'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/change-password', methods=['POST'])
def change_password():
    """Alterar senha"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not all([user_id, current_password, new_password]):
            return jsonify({'success': False, 'error': 'Todos os campos são obrigatórios'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404
        
        if not verify_password(current_password, user.password_hash):
            return jsonify({'success': False, 'error': 'Senha atual incorreta'}), 400
        
        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Senha alterada com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
