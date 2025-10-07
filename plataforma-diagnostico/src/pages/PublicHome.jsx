import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Phone, Mail, ArrowRight, Filter, Grid, List } from 'lucide-react';
import './PublicHome.css';

const PublicHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [commonProblems, setCommonProblems] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Carregar dados iniciais
      const [tagsRes, problemsRes, locationsRes, featuredRes] = await Promise.all([
        fetch('/api/public/tags'),
        fetch('/api/public/problems'),
        fetch('/api/public/locations'),
        fetch('/api/public/featured')
      ]);

      const [tags, problems, locations, featured] = await Promise.all([
        tagsRes.json(),
        problemsRes.json(),
        locationsRes.json(),
        featuredRes.json()
      ]);

      if (tags.success) setAvailableTags(tags.tags);
      if (problems.success) setCommonProblems(problems.problems);
      if (locations.success) setPopularLocations(locations.locations);
      if (featured.success) setFeaturedProviders(featured.featured);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !location.trim() && selectedTags.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('query', searchQuery);
      if (location.trim()) params.append('location', location);
      selectedTags.forEach(tag => params.append('tags', tag));

      const response = await fetch(`/api/public/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleProblemClick = (problem) => {
    setSearchQuery(problem);
    handleSearch();
  };

  const handleLocationClick = (loc) => {
    setLocation(loc);
  };

  const handleViewProfile = (providerId) => {
    navigate(`/profile/${providerId}`);
  };

  const handleRequestService = (provider) => {
    // Verificar se está logado
    const isLoggedIn = localStorage.getItem('auth_token');
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          returnTo: '/',
          message: 'Faça login para solicitar um serviço',
          preselectedProvider: provider
        }
      });
    } else {
      navigate('/app/tickets/new', { 
        state: { 
          preselectedTechnician: provider 
        }
      });
    }
  };

  const handleCreateAccount = () => {
    navigate('/login', { state: { mode: 'register', userType: 'client' } });
  };

  const handleBecomeTechnician = () => {
    navigate('/login', { state: { mode: 'register', userType: 'technician' } });
  };

  const handleContactProvider = (provider) => {
    const isLoggedIn = localStorage.getItem('auth_token');
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          returnTo: `/profile/${provider.id}`,
          message: 'Faça login para entrar em contato'
        }
      });
    } else {
      // Abrir modal de contato ou redirecionar para chat
      window.open(`tel:${provider.phone}`, '_self');
    }
  };

  const renderProviderCard = (provider) => (
    <div key={provider.id} className={`provider-card ${viewMode === 'list' ? 'list-view' : ''}`}>
      <div className="provider-header">
        <div className="provider-avatar">
          <img 
            src={provider.profile_image || '/default-avatar.png'} 
            alt={provider.name}
            onError={(e) => e.target.src = '/default-avatar.png'}
          />
          {provider.is_available && <div className="online-indicator"></div>}
        </div>
        <div className="provider-info">
          <h3>{provider.name}</h3>
          <p className="provider-type">{provider.user_type === 'company' ? 'Empresa' : 'Técnico'}</p>
          <div className="provider-rating">
            <Star className="star-icon" />
            <span>{provider.rating || 0}</span>
            <span className="reviews-count">({provider.total_reviews || 0} avaliações)</span>
          </div>
        </div>
        <div className="provider-actions">
          <button 
            className="btn-contact"
            onClick={() => handleContactProvider(provider)}
          >
            <Phone size={16} />
          </button>
          <button 
            className="btn-contact"
            onClick={() => window.open(`mailto:${provider.email}`, '_self')}
          >
            <Mail size={16} />
          </button>
        </div>
      </div>

      <div className="provider-details">
        <p className="provider-description">{provider.description}</p>
        
        <div className="provider-specialties">
          {provider.specialties_list?.slice(0, 3).map((specialty, index) => (
            <span key={index} className="specialty-tag">{specialty}</span>
          ))}
          {provider.specialties_list?.length > 3 && (
            <span className="specialty-more">+{provider.specialties_list.length - 3}</span>
          )}
        </div>

        <div className="provider-meta">
          <div className="meta-item">
            <MapPin size={14} />
            <span>{provider.city}, {provider.state}</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>{provider.response_time || '2-4 horas'}</span>
          </div>
        </div>
      </div>

      <div className="provider-footer">
        <button 
          className="btn-view-profile"
          onClick={() => handleViewProfile(provider.id)}
        >
          Ver Perfil
          <ArrowRight size={16} />
        </button>
        <button 
          className="btn-request-service"
          onClick={() => handleRequestService(provider)}
        >
          Solicitar Serviço
        </button>
      </div>
    </div>
  );

  return (
    <div className="public-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Encontre o Técnico Ideal para Seu Problema</h1>
          <p>Conectamos você com os melhores profissionais de tecnologia da sua região</p>
          
          <div className="search-container">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="O que precisa consertar? Ex: tela quebrada, não liga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="location-box">
              <MapPin className="location-icon" />
              <input
                type="text"
                placeholder="Sua localização"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Quick Problem Buttons */}
          <div className="quick-problems">
            <span>Problemas comuns:</span>
            {commonProblems.slice(0, 6).map((problem, index) => (
              <button 
                key={index} 
                className="problem-btn"
                onClick={() => handleProblemClick(problem)}
              >
                {problem}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {(searchResults.length > 0 || selectedTags.length > 0) && (
        <section className="filters-section">
          <div className="filters-header">
            <button 
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filtros
            </button>
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filters-content">
              <div className="filter-group">
                <h4>Especialidades</h4>
                <div className="tags-grid">
                  {availableTags.slice(0, 12).map((tag, index) => (
                    <button
                      key={index}
                      className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h4>Localizações Populares</h4>
                <div className="locations-grid">
                  {popularLocations.slice(0, 8).map((loc, index) => (
                    <button
                      key={index}
                      className="location-btn"
                      onClick={() => handleLocationClick(loc)}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="results-section">
          <div className="results-header">
            <h2>Resultados da Busca ({searchResults.length})</h2>
          </div>
          
          <div className={`results-grid ${viewMode}`}>
            {searchResults.map(renderProviderCard)}
          </div>
        </section>
      )}

      {/* Featured Providers */}
      {featuredProviders.length > 0 && searchResults.length === 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2>Profissionais em Destaque</h2>
            <p>Os melhores avaliados da plataforma</p>
          </div>
          
          <div className="featured-grid">
            {featuredProviders.map(renderProviderCard)}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>Como Funciona</h2>
          <p>Processo simples e seguro</p>
        </div>
        
        <div className="flex step-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Busque</h3>
            <p>Descreva seu problema e encontre técnicos especializados na sua região</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Compare</h3>
            <p>Veja avaliações, preços e escolha o profissional ideal para você</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Contrate</h3>
            <p>Faça seu cadastro e solicite o serviço com segurança e garantia</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Pronto para Resolver seu Problema?</h2>
          <p>Cadastre-se gratuitamente e tenha acesso a centenas de técnicos qualificados</p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={handleCreateAccount}>
              Criar Conta
            </button>
            <button className="btn-secondary" onClick={handleBecomeTechnician}>
              Sou Técnico
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicHome;

