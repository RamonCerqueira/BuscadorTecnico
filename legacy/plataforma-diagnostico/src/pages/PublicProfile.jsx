import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Phone, Mail, MessageCircle, Calendar,
  Award, CheckCircle, ArrowLeft, Share2, Heart, Flag,
  Camera, Play, FileText, ExternalLink
} from 'lucide-react';
import './PublicProfile.css';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/public/profile/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
      } else {
        // Perfil não encontrado
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    // Verificar se usuário está logado
    const isLoggedIn = localStorage.getItem('auth_token');
    if (!isLoggedIn) {
      // Redirecionar para login
      navigate('/login', { 
        state: { 
          returnTo: `/profile/${id}`,
          message: 'Faça login para entrar em contato com o profissional'
        }
      });
    } else {
      setShowContactModal(true);
    }
  };

  const handleRequestService = () => {
    const isLoggedIn = localStorage.getItem('auth_token');
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          returnTo: `/profile/${id}`,
          message: 'Faça login para solicitar um serviço'
        }
      });
    } else {
      navigate('/app/tickets/new', { 
        state: { 
          preselectedTechnician: profile 
        }
      });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star-filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="star-half" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star-empty" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="public-profile loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="public-profile error">
        <div className="error-message">
          <h2>Perfil não encontrado</h2>
          <p>O perfil que você está procurando não existe ou foi removido.</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile">
      {/* Header */}
      <header className="profile-header">
        <div className="header-background"></div>
        <div className="header-content">
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Voltar
          </button>
          
          <div className="header-actions">
            <button className="btn-action">
              <Share2 size={18} />
            </button>
            <button className="btn-action">
              <Heart size={18} />
            </button>
            <button className="btn-action">
              <Flag size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Info */}
      <section className="profile-info">
        <div className="profile-main">
          <div className="profile-avatar">
            <img 
              src={profile.profile_image || '/default-avatar.png'} 
              alt={profile.name}
              onError={(e) => e.target.src = '/default-avatar.png'}
            />
            {profile.is_available && <div className="online-badge">Online</div>}
          </div>
          
          <div className="profile-details">
            <div className="profile-title">
              <h1>{profile.name}</h1>
              <span className="profile-type">
                {profile.user_type === 'company' ? 'Empresa' : 'Técnico Especializado'}
              </span>
            </div>
            
            <div className="profile-rating">
              <div className="stars">
                {renderStars(profile.statistics?.avg_rating || 0)}
              </div>
              <span className="rating-text">
                {profile.statistics?.avg_rating?.toFixed(1) || '0.0'} 
                ({profile.statistics?.total_reviews || 0} avaliações)
              </span>
            </div>
            
            <div className="profile-meta">
              <div className="meta-item">
                <MapPin size={16} />
                <span>{profile.city}, {profile.state}</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>Responde em 2-4 horas</span>
              </div>
              <div className="meta-item">
                <CheckCircle size={16} />
                <span>{profile.statistics?.success_rate || 0}% de sucesso</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn-contact" onClick={handleContactClick}>
            <MessageCircle size={18} />
            Entrar em Contato
          </button>
          <button className="btn-request" onClick={handleRequestService}>
            <Calendar size={18} />
            Solicitar Serviço
          </button>
        </div>
      </section>

      {/* Specialties */}
      <section className="profile-specialties">
        <h3>Especialidades</h3>
        <div className="specialties-grid">
          {profile.specialties_list?.map((specialty, index) => (
            <span key={index} className="specialty-tag">{specialty}</span>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="profile-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{profile.statistics?.total_tickets || 0}</div>
            <div className="stat-label">Serviços Realizados</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profile.statistics?.completed_tickets || 0}</div>
            <div className="stat-label">Concluídos</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profile.statistics?.success_rate || 0}%</div>
            <div className="stat-label">Taxa de Sucesso</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{profile.statistics?.avg_rating?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">Avaliação Média</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="profile-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Avaliações ({profile.recent_reviews?.length || 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Galeria
          </button>
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informações
          </button>
        </div>
        
        <div className="tabs-content">
          {activeTab === 'overview' && (
            <div className="tab-overview">
              <div className="overview-section">
                <h4>Sobre</h4>
                <p>{profile.description || 'Nenhuma descrição disponível.'}</p>
              </div>
              
              <div className="overview-section">
                <h4>Avaliações Recentes</h4>
                {profile.recent_reviews?.length > 0 ? (
                  <div className="reviews-preview">
                    {profile.recent_reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                          <span className="review-date">
                            {new Date(review.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="review-text">{review.review}</p>
                        <span className="review-author">- {review.client_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-reviews">Nenhuma avaliação ainda.</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-reviews">
              {profile.recent_reviews?.length > 0 ? (
                <div className="reviews-list">
                  {profile.recent_reviews.map((review, index) => (
                    <div key={index} className="review-card">
                      <div className="review-header">
                        <div className="review-author-info">
                          <div className="author-avatar">
                            {review.client_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="author-name">{review.client_name}</div>
                            <div className="review-date">
                              {new Date(review.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="review-text">{review.review}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-content">
                  <p>Nenhuma avaliação ainda.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'gallery' && (
            <div className="tab-gallery">
              <div className="no-content">
                <Camera size={48} />
                <p>Galeria em breve</p>
                <span>O profissional ainda não adicionou fotos dos trabalhos realizados.</span>
              </div>
            </div>
          )}
          
          {activeTab === 'info' && (
            <div className="tab-info">
              <div className="info-section">
                <h4>Informações de Contato</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <span>{profile.phone || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{profile.address || `${profile.city}, ${profile.state}`}</span>
                  </div>
                </div>
              </div>
              
              <div className="info-section">
                <h4>Horário de Funcionamento</h4>
                <div className="working-hours">
                  {Object.entries(profile.working_hours || {}).map(([day, hours]) => (
                    <div key={day} className="hours-item">
                      <span className="day">{day}</span>
                      <span className="hours">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Entrar em Contato</h3>
              <button 
                className="modal-close"
                onClick={() => setShowContactModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="contact-options">
                <button className="contact-option">
                  <Phone size={20} />
                  <div>
                    <span>Ligar</span>
                    <small>{profile.phone || 'Não disponível'}</small>
                  </div>
                </button>
                
                <button className="contact-option">
                  <Mail size={20} />
                  <div>
                    <span>Email</span>
                    <small>{profile.email}</small>
                  </div>
                </button>
                
                <button className="contact-option">
                  <MessageCircle size={20} />
                  <div>
                    <span>Chat</span>
                    <small>Conversar pelo app</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;

