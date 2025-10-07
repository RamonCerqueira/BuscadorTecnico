from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func
from src.models.user import db, User
from src.models.ticket import Ticket

public_search_bp = Blueprint("public_search", __name__)

@public_search_bp.route("/public/search", methods=["GET"])
def public_search():
    """Busca pública por empresas e técnicos"""
    try:
        query = request.args.get("query", "")
        location = request.args.get("location", "")
        tags = request.args.getlist("tags")  # Lista de tags
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        
        # Construir query para buscar usuários (técnicos e empresas)
        users_query = User.query.filter(or_(
            User.user_type == "technician",
            User.user_type == "company"
        ))
        
        # Filtrar por query (nome, descrição, especialidade)
        if query:
            search_pattern = f"%{query.lower()}%"
            users_query = users_query.filter(or_(
                func.lower(User.name).like(search_pattern),
                func.lower(User.description).like(search_pattern),
                func.lower(User.specialties).like(search_pattern)
            ))
        
        # Filtrar por localização
        if location:
            location_pattern = f"%{location.lower()}%"
            users_query = users_query.filter(or_(
                func.lower(User.address).like(location_pattern),
                func.lower(User.city).like(location_pattern),
                func.lower(User.state).like(location_pattern)
            ))
        
        # Filtrar por tags
        if tags:
            for tag in tags:
                tag_pattern = f"%{tag.lower()}%"
                users_query = users_query.filter(func.lower(User.specialties).like(tag_pattern))
        
        # Paginar resultados
        results = users_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Preparar dados dos resultados
        search_results = []
        for user in results.items:
            user_data = user.to_dict()
            
            # Adicionar informações extras para busca pública
            user_data.update({
                'rating': user.rating or 0,
                'total_reviews': user.total_reviews or 0,
                'specialties_list': [s.strip() for s in (user.specialties or "").split(",") if s.strip()],
                'is_available': True,  # Pode ser calculado baseado em disponibilidade
                'response_time': '2-4 horas',  # Pode ser calculado baseado em histórico
                'profile_image': user.profile_image or '/default-avatar.png'
            })
            
            search_results.append(user_data)
        
        return jsonify({
            "success": True,
            "results": search_results,
            "pagination": {
                "page": page,
                "pages": results.pages,
                "per_page": per_page,
                "total": results.total
            },
            "filters": {
                "query": query,
                "location": location,
                "tags": tags
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@public_search_bp.route("/public/profile/<int:user_id>", methods=["GET"])
def get_public_profile(user_id):
    """Obter perfil público de um técnico/empresa"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Verificar se é técnico ou empresa
        if user.user_type not in ['technician', 'company']:
            return jsonify({"success": False, "error": "Perfil não encontrado"}), 404
        
        # Buscar estatísticas do usuário
        total_tickets = Ticket.query.filter_by(assigned_technician_id=user_id).count()
        completed_tickets = Ticket.query.filter_by(
            assigned_technician_id=user_id, 
            status='closed'
        ).count()
        
        # Buscar avaliações recentes
        recent_reviews = Ticket.query.filter(
            Ticket.assigned_technician_id == user_id,
            Ticket.rating.isnot(None),
            Ticket.review.isnot(None)
        ).order_by(Ticket.closed_at.desc()).limit(5).all()
        
        reviews_data = []
        for ticket in recent_reviews:
            reviews_data.append({
                'rating': ticket.rating,
                'review': ticket.review,
                'date': ticket.closed_at.isoformat() if ticket.closed_at else None,
                'client_name': ticket.client.name if ticket.client else 'Cliente'
            })
        
        # Preparar dados do perfil
        profile_data = user.to_dict()
        profile_data.update({
            'statistics': {
                'total_tickets': total_tickets,
                'completed_tickets': completed_tickets,
                'success_rate': round((completed_tickets / total_tickets * 100), 2) if total_tickets > 0 else 0,
                'avg_rating': user.rating or 0,
                'total_reviews': user.total_reviews or 0
            },
            'recent_reviews': reviews_data,
            'specialties_list': [s.strip() for s in (user.specialties or "").split(",") if s.strip()],
            'gallery': [],  # Pode ser implementado para mostrar trabalhos anteriores
            'certifications': [],  # Pode ser implementado para mostrar certificações
            'working_hours': {
                'monday': '08:00-18:00',
                'tuesday': '08:00-18:00',
                'wednesday': '08:00-18:00',
                'thursday': '08:00-18:00',
                'friday': '08:00-18:00',
                'saturday': '08:00-14:00',
                'sunday': 'Fechado'
            }
        })
        
        return jsonify({
            "success": True,
            "profile": profile_data
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@public_search_bp.route("/public/tags", methods=["GET"])
def get_all_tags():
    """Retorna todas as tags de especialidades disponíveis"""
    try:
        # Buscar todas as especialidades únicas
        all_specialties = db.session.query(User.specialties).filter(
            or_(User.user_type == "technician", User.user_type == "company"),
            User.specialties.isnot(None)
        ).all()
        
        unique_tags = set()
        for specialty_tuple in all_specialties:
            specialty_str = specialty_tuple[0]
            if specialty_str:
                tags_list = [tag.strip().lower() for tag in specialty_str.split(",") if tag.strip()]
                unique_tags.update(tags_list)
        
        return jsonify({
            "success": True,
            "tags": sorted(list(unique_tags))
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@public_search_bp.route("/public/problems", methods=["GET"])
def get_common_problems():
    """Retorna lista de problemas comuns para busca"""
    try:
        common_problems = [
            "Tela quebrada", "Não liga", "Não carrega", "Bateria viciada",
            "Problema de software", "Lentidão", "Vírus", "Problema de rede",
            "Áudio não funciona", "Câmera não funciona", "Teclado com defeito",
            "Superaquecimento", "Manchas na tela", "Conector de carga danificado",
            "Sistema travando", "Aplicativo não abre", "Problema de conectividade",
            "Backup de dados", "Formatação", "Instalação de software"
        ]
        
        return jsonify({
            "success": True,
            "problems": common_problems
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@public_search_bp.route("/public/locations", methods=["GET"])
def get_popular_locations():
    """Retorna localizações populares"""
    try:
        # Buscar cidades mais comuns dos usuários
        popular_cities = db.session.query(
            User.city,
            func.count(User.id).label('count')
        ).filter(
            or_(User.user_type == "technician", User.user_type == "company"),
            User.city.isnot(None)
        ).group_by(User.city).order_by(func.count(User.id).desc()).limit(10).all()
        
        cities = [city for city, count in popular_cities if city]
        
        return jsonify({
            "success": True,
            "locations": cities
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@public_search_bp.route("/public/featured", methods=["GET"])
def get_featured_providers():
    """Retorna provedores em destaque"""
    try:
        # Buscar técnicos/empresas com melhor avaliação
        featured = User.query.filter(
            or_(User.user_type == "technician", User.user_type == "company"),
            User.rating >= 4.0
        ).order_by(User.rating.desc(), User.total_reviews.desc()).limit(6).all()
        
        featured_data = []
        for user in featured:
            user_data = user.to_dict()
            user_data.update({
                'specialties_list': [s.strip() for s in (user.specialties or "").split(",") if s.strip()],
                'is_featured': True
            })
            featured_data.append(user_data)
        
        return jsonify({
            "success": True,
            "featured": featured_data
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

