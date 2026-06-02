from flask import Blueprint, request, jsonify
import os
import uuid
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {
    'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
    'video': {'mp4', 'avi', 'mov', 'wmv', 'webm'},
    'audio': {'mp3', 'wav', 'ogg', 'm4a'}
}

def allowed_file(filename, file_type):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, set())

def get_file_type(filename):
    if not '.' in filename:
        return None
    
    ext = filename.rsplit('.', 1)[1].lower()
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type
    return None

@upload_bp.route('/upload/file', methods=['POST'])
def upload_file():
    """Upload de arquivo único"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'image')
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename, file_type):
            return jsonify({'success': False, 'error': 'Tipo de arquivo não permitido'}), 400
        
        # Gerar nome único
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Criar diretório se não existir
        upload_dir = os.path.join('src', 'static', 'uploads', file_type)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # URL pública do arquivo
        file_url = f"/uploads/{file_type}/{unique_filename}"
        
        return jsonify({
            'success': True,
            'file': {
                'id': str(uuid.uuid4()),
                'name': filename,
                'url': file_url,
                'type': file_type,
                'size': os.path.getsize(file_path)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/upload/multiple', methods=['POST'])
def upload_multiple_files():
    """Upload de múltiplos arquivos"""
    try:
        if 'files' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        files = request.files.getlist('files')
        uploaded_files = []
        
        for file in files:
            if file.filename == '':
                continue
            
            # Detectar tipo do arquivo
            file_type = get_file_type(file.filename)
            if not file_type:
                continue
            
            if not allowed_file(file.filename, file_type):
                continue
            
            # Gerar nome único
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Criar diretório se não existir
            upload_dir = os.path.join('src', 'static', 'uploads', file_type)
            os.makedirs(upload_dir, exist_ok=True)
            
            # Salvar arquivo
            file_path = os.path.join(upload_dir, unique_filename)
            file.save(file_path)
            
            # URL pública do arquivo
            file_url = f"/uploads/{file_type}/{unique_filename}"
            
            uploaded_files.append({
                'id': str(uuid.uuid4()),
                'name': filename,
                'url': file_url,
                'type': file_type,
                'size': os.path.getsize(file_path)
            })
        
        return jsonify({
            'success': True,
            'files': uploaded_files
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/upload/avatar', methods=['POST'])
def upload_avatar():
    """Upload de avatar do usuário"""
    try:
        if 'avatar' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['avatar']
        user_id = request.form.get('userId')
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'success': False, 'error': 'Apenas imagens são permitidas'}), 400
        
        # Gerar nome único
        filename = secure_filename(file.filename)
        unique_filename = f"avatar_{user_id}_{uuid.uuid4()}.{filename.rsplit('.', 1)[1].lower()}"
        
        # Criar diretório se não existir
        upload_dir = os.path.join('src', 'static', 'uploads', 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # URL pública do arquivo
        avatar_url = f"/uploads/avatars/{unique_filename}"
        
        return jsonify({
            'success': True,
            'avatar': {
                'url': avatar_url,
                'filename': unique_filename
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/upload/company-logo', methods=['POST'])
def upload_company_logo():
    """Upload de logo da empresa"""
    try:
        if 'logo' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['logo']
        company_id = request.form.get('companyId')
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename, 'image'):
            return jsonify({'success': False, 'error': 'Apenas imagens são permitidas'}), 400
        
        # Gerar nome único
        filename = secure_filename(file.filename)
        unique_filename = f"logo_{company_id}_{uuid.uuid4()}.{filename.rsplit('.', 1)[1].lower()}"
        
        # Criar diretório se não existir
        upload_dir = os.path.join('src', 'static', 'uploads', 'logos')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # URL pública do arquivo
        logo_url = f"/uploads/logos/{unique_filename}"
        
        return jsonify({
            'success': True,
            'logo': {
                'url': logo_url,
                'filename': unique_filename
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/upload/ticket-media', methods=['POST'])
def upload_ticket_media():
    """Upload de mídias para chamados"""
    try:
        if 'media' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        files = request.files.getlist('media')
        ticket_id = request.form.get('ticketId')
        uploaded_media = []
        
        for file in files:
            if file.filename == '':
                continue
            
            # Detectar tipo do arquivo
            file_type = get_file_type(file.filename)
            if not file_type:
                continue
            
            if not allowed_file(file.filename, file_type):
                continue
            
            # Gerar nome único
            filename = secure_filename(file.filename)
            unique_filename = f"ticket_{ticket_id}_{uuid.uuid4()}_{filename}"
            
            # Criar diretório se não existir
            upload_dir = os.path.join('src', 'static', 'uploads', 'tickets', file_type)
            os.makedirs(upload_dir, exist_ok=True)
            
            # Salvar arquivo
            file_path = os.path.join(upload_dir, unique_filename)
            file.save(file_path)
            
            # URL pública do arquivo
            media_url = f"/uploads/tickets/{file_type}/{unique_filename}"
            
            uploaded_media.append({
                'id': str(uuid.uuid4()),
                'name': filename,
                'url': media_url,
                'type': file_type,
                'size': os.path.getsize(file_path)
            })
        
        return jsonify({
            'success': True,
            'media': uploaded_media
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@upload_bp.route('/upload/info', methods=['GET'])
def upload_info():
    """Informações sobre upload"""
    return jsonify({
        'success': True,
        'limits': {
            'maxFileSize': '10MB',
            'maxFiles': 5,
            'allowedTypes': ALLOWED_EXTENSIONS
        },
        'endpoints': {
            'single': '/api/upload/file',
            'multiple': '/api/upload/multiple',
            'avatar': '/api/upload/avatar',
            'logo': '/api/upload/company-logo',
            'ticketMedia': '/api/upload/ticket-media'
        }
    })

