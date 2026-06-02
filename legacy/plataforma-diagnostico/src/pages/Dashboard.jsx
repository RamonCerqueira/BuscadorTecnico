import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Wrench,
  Star,
  MapPin,
  Phone,
  Calendar,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, useTicketsStore } from '@/lib/store'
import { 
  formatDate, 
  getStatusColor, 
  getStatusText, 
  getPriorityColor, 
  getPriorityText,
  getInitials,
  getAvatarColor
} from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, userType } = useAuthStore()
  const { tickets, getTicketsByUser } = useTicketsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const userTickets = getTicketsByUser(user?.id, userType)
  
  // Filtrar tickets
  const filteredTickets = userTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  // Estatísticas baseadas no tipo de usuário
  const getStats = () => {
    if (userType === 'client') {
      const myTickets = userTickets
      return [
        {
          title: 'Meus Chamados',
          value: myTickets.length,
          icon: Ticket,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Em Andamento',
          value: myTickets.filter(t => t.status === 'in_progress').length,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          title: 'Resolvidos',
          value: myTickets.filter(t => t.status === 'resolved').length,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Pendentes',
          value: myTickets.filter(t => t.status === 'open').length,
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      ]
    } else if (userType === 'technician' || userType === 'company') {
      const assignedTickets = userTickets.filter(t => t.assignedTo?.id === user?.id)
      const availableTickets = userTickets.filter(t => t.status === 'open')
      
      return [
        {
          title: 'Atendimentos',
          value: assignedTickets.length,
          icon: Wrench,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Disponíveis',
          value: availableTickets.length,
          icon: Ticket,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Avaliação',
          value: user?.rating || 4.8,
          icon: Star,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          suffix: '★'
        },
        {
          title: 'Total Serviços',
          value: user?.totalServices || 0,
          icon: TrendingUp,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        }
      ]
    } else if (userType === 'admin') {
      return [
        {
          title: 'Total Chamados',
          value: tickets.length,
          icon: Ticket,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Usuários Ativos',
          value: 1250,
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Técnicos',
          value: 89,
          icon: Wrench,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          title: 'Taxa Resolução',
          value: 94,
          icon: TrendingUp,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          suffix: '%'
        }
      ]
    }
    return []
  }
  
  const stats = getStats()
  
  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
    
    switch (userType) {
      case 'client':
        return `${greeting}, ${user?.name}! Como podemos ajudar você hoje?`
      case 'technician':
        return `${greeting}, ${user?.name}! Pronto para atender novos chamados?`
      case 'company':
        return `${greeting}, ${user?.name}! Gerencie sua equipe e atendimentos.`
      case 'admin':
        return `${greeting}, ${user?.name}! Monitore a plataforma e usuários.`
      default:
        return `${greeting}, ${user?.name}!`
    }
  }
  
  const getQuickActions = () => {
    if (userType === 'client') {
      return [
        {
          title: 'Novo Chamado',
          description: 'Relatar problema com equipamento',
          icon: Plus,
          action: () => navigate('/tickets/new'),
          color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
          title: 'Meus Chamados',
          description: 'Ver todos os chamados',
          icon: Ticket,
          action: () => navigate('/tickets'),
          color: 'bg-green-600 hover:bg-green-700'
        }
      ]
    } else if (userType === 'technician' || userType === 'company') {
      return [
        {
          title: 'Chamados Disponíveis',
          description: 'Ver chamados para atender',
          icon: Ticket,
          action: () => navigate('/tickets?status=open'),
          color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
          title: 'Meus Atendimentos',
          description: 'Gerenciar atendimentos',
          icon: Wrench,
          action: () => navigate('/tickets?assigned=me'),
          color: 'bg-green-600 hover:bg-green-700'
        }
      ]
    } else if (userType === 'admin') {
      return [
        {
          title: 'Gerenciar Usuários',
          description: 'Administrar usuários',
          icon: Users,
          action: () => navigate('/users'),
          color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
          title: 'Analytics',
          description: 'Ver relatórios',
          icon: TrendingUp,
          action: () => navigate('/analytics'),
          color: 'bg-purple-600 hover:bg-purple-700'
        }
      ]
    }
    return []
  }
  
  const quickActions = getQuickActions()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">{getWelcomeMessage()}</p>
        </div>
        
        {userType === 'client' && (
          <Button onClick={() => navigate('/tickets/new')} className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Novo Chamado
          </Button>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}{stat.suffix || ''}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${action.color} text-white p-3 rounded-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {userType === 'client' ? 'Meus Chamados Recentes' : 
                 userType === 'admin' ? 'Chamados Recentes' : 'Chamados Disponíveis'}
              </CardTitle>
              <CardDescription>
                {userType === 'client' ? 'Acompanhe o status dos seus chamados' :
                 userType === 'admin' ? 'Últimos chamados na plataforma' : 'Chamados que você pode atender'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/tickets')}>
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar chamados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('open')}
              >
                Abertos
              </Button>
              <Button
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('in_progress')}
              >
                Em Andamento
              </Button>
            </div>
          </div>
          
          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum chamado encontrado
                </h3>
                <p className="text-gray-600">
                  {userType === 'client' 
                    ? 'Você ainda não criou nenhum chamado.'
                    : 'Não há chamados disponíveis no momento.'
                  }
                </p>
                {userType === 'client' && (
                  <Button 
                    onClick={() => navigate('/tickets/new')}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Chamado
                  </Button>
                )}
              </div>
            ) : (
              filteredTickets.slice(0, 5).map((ticket) => (
                <div 
                  key={ticket.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusText(ticket.status)}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityText(ticket.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Wrench className="h-3 w-3 mr-1" />
                          {ticket.deviceType} {ticket.brand}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {ticket.location.address}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                      
                      {ticket.assignedTo && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={ticket.assignedTo.avatar} />
                            <AvatarFallback className={getAvatarColor(ticket.assignedTo.name)}>
                              {getInitials(ticket.assignedTo.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600">
                            Atendido por {ticket.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                        {userType === 'client' && ticket.status === 'open' && (
                          <DropdownMenuItem>
                            Editar Chamado
                          </DropdownMenuItem>
                        )}
                        {(userType === 'technician' || userType === 'company') && ticket.status === 'open' && (
                          <DropdownMenuItem>
                            Atender Chamado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

