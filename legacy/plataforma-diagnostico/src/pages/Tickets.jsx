import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Wrench,
  Clock,
  User,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export default function Tickets() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, userType } = useAuthStore()
  const { tickets, getTicketsByUser, updateTicket } = useTicketsStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  
  const userTickets = getTicketsByUser(user?.id, userType)
  
  // Filtrar e ordenar tickets
  const filteredTickets = userTickets
    .filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
      const matchesDevice = deviceFilter === 'all' || ticket.deviceType === deviceFilter
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDevice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })
  
  const getPageTitle = () => {
    switch (userType) {
      case 'client':
        return 'Meus Chamados'
      case 'technician':
      case 'company':
        return 'Chamados Disponíveis'
      case 'admin':
        return 'Todos os Chamados'
      default:
        return 'Chamados'
    }
  }
  
  const getPageDescription = () => {
    switch (userType) {
      case 'client':
        return 'Gerencie seus chamados de suporte técnico'
      case 'technician':
      case 'company':
        return 'Encontre chamados para atender em sua região'
      case 'admin':
        return 'Monitore todos os chamados da plataforma'
      default:
        return 'Lista de chamados'
    }
  }
  
  const handleTicketAction = (ticketId, action) => {
    switch (action) {
      case 'view':
        navigate(`/tickets/${ticketId}`)
        break
      case 'edit':
        navigate(`/tickets/${ticketId}/edit`)
        break
      case 'assign':
        updateTicket(ticketId, {
          assignedTo: { id: user.id, name: user.name, type: userType },
          status: 'in_progress'
        })
        break
      case 'resolve':
        updateTicket(ticketId, { status: 'resolved' })
        break
      case 'close':
        updateTicket(ticketId, { status: 'closed' })
        break
      default:
        break
    }
  }
  
  const deviceTypes = [...new Set(tickets.map(t => t.deviceType))]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">{getPageDescription()}</p>
        </div>
        
        {userType === 'client' && (
          <Button onClick={() => navigate('/tickets/new')} className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Novo Chamado
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
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
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recente</SelectItem>
                <SelectItem value="oldest">Mais Antigo</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Device Type Filter */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={deviceFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDeviceFilter('all')}
              >
                Todos os Dispositivos
              </Button>
              {deviceTypes.map(device => (
                <Button
                  key={device}
                  variant={deviceFilter === device ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDeviceFilter(device)}
                >
                  {device}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando {filteredTickets.length} de {userTickets.length} chamados
        </p>
        
        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || deviceFilter !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setPriorityFilter('all')
              setDeviceFilter('all')
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </div>
      
      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum chamado encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou criar um novo chamado.
              </p>
              {userType === 'client' && (
                <Button onClick={() => navigate('/tickets/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Chamado
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 
                          className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          #{ticket.id} - {ticket.title}
                        </h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusText(ticket.status)}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityText(ticket.priority)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    {/* Device Info */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Wrench className="h-4 w-4 mr-1" />
                        {ticket.deviceType} {ticket.brand} {ticket.model}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {ticket.location.address}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(ticket.createdAt)}
                      </span>
                      {ticket.responses.length > 0 && (
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {ticket.responses.length} resposta(s)
                        </span>
                      )}
                    </div>
                    
                    {/* Client Info (for technicians/companies) */}
                    {(userType === 'technician' || userType === 'company' || userType === 'admin') && (
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={getAvatarColor(ticket.clientName)}>
                            {getInitials(ticket.clientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ticket.clientName}</p>
                          <p className="text-xs text-gray-500">{ticket.clientPhone}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Assigned Technician */}
                    {ticket.assignedTo && (
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ticket.assignedTo.avatar} />
                          <AvatarFallback className={getAvatarColor(ticket.assignedTo.name)}>
                            {getInitials(ticket.assignedTo.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Atendido por {ticket.assignedTo.name}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">4.8</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* AI Suggestion */}
                    {ticket.aiSuggestion && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <div className="bg-blue-500 text-white p-1 rounded">
                            <Wrench className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-800 mb-1">
                              Sugestão da IA
                            </p>
                            <p className="text-sm text-blue-700">
                              {ticket.aiSuggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Estimated Cost */}
                    {ticket.estimatedCost && (
                      <div className="text-sm text-gray-600">
                        <strong>Custo estimado:</strong> {ticket.estimatedCost}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'view')}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      
                      {userType === 'client' && ticket.status === 'open' && (
                        <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'edit')}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      
                      {(userType === 'technician' || userType === 'company') && ticket.status === 'open' && !ticket.assignedTo && (
                        <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'assign')}>
                          <User className="mr-2 h-4 w-4" />
                          Atender Chamado
                        </DropdownMenuItem>
                      )}
                      
                      {ticket.assignedTo?.id === user?.id && ticket.status === 'in_progress' && (
                        <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'resolve')}>
                          <Clock className="mr-2 h-4 w-4" />
                          Marcar como Resolvido
                        </DropdownMenuItem>
                      )}
                      
                      {userType === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleTicketAction(ticket.id, 'close')}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Fechar Chamado
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

