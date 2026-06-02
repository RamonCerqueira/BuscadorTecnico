import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Star,
  MessageSquare,
  Send,
  Paperclip,
  Camera,
  Video,
  Mic,
  CheckCircle,
  AlertCircle,
  Wrench,
  DollarSign,
  CalendarDays,
  Edit,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuthStore, useTicketsStore } from '@/lib/store'
import { 
  formatDate, 
  formatTime,
  getStatusColor, 
  getStatusText, 
  getPriorityColor, 
  getPriorityText,
  getInitials,
  getAvatarColor
} from '@/lib/utils'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userType } = useAuthStore()
  const { tickets, updateTicket, addResponse } = useTicketsStore()
  
  const [newMessage, setNewMessage] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const ticket = tickets.find(t => t.id === parseInt(id))
  
  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chamado não encontrado</h2>
        <p className="text-gray-600 mb-4">O chamado que você está procurando não existe.</p>
        <Button onClick={() => navigate('/tickets')}>
          Voltar para Chamados
        </Button>
      </div>
    )
  }
  
  const canRespond = (userType === 'technician' || userType === 'company' || userType === 'admin')
  const canAssign = canRespond && ticket.status === 'open' && !ticket.assignedTo
  const canResolve = ticket.assignedTo?.id === user?.id && ticket.status === 'in_progress'
  const isOwner = userType === 'client' && ticket.clientId === user?.id
  
  const handleAssignTicket = () => {
    updateTicket(ticket.id, {
      assignedTo: { id: user.id, name: user.name, type: userType },
      status: 'in_progress'
    })
  }
  
  const handleResolveTicket = () => {
    updateTicket(ticket.id, { status: 'resolved' })
  }
  
  const handleSendResponse = async () => {
    if (!newMessage.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const response = {
        technicianId: user.id,
        technicianName: user.name,
        message: newMessage,
        createdAt: new Date(),
        estimatedCost: estimatedCost || null,
        visitScheduled: scheduledDate ? new Date(scheduledDate) : null
      }
      
      addResponse(ticket.id, response)
      setNewMessage('')
      setEstimatedCost('')
      setScheduledDate('')
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5" />
      case 'in_progress':
        return <Clock className="h-5 w-5" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5" />
      case 'closed':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tickets')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chamado #{ticket.id}
            </h1>
            <p className="text-gray-600">{ticket.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {canAssign && (
            <Button onClick={handleAssignTicket}>
              <User className="h-4 w-4 mr-2" />
              Atender Chamado
            </Button>
          )}
          
          {canResolve && (
            <Button onClick={handleResolveTicket} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Resolvido
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && ticket.status === 'open' && (
                <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Chamado
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem>
                Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Chamado */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Problema</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(ticket.status)}
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityText(ticket.priority)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dispositivo</h4>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Wrench className="h-4 w-4" />
                    <span>{ticket.deviceType} {ticket.brand} {ticket.model}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Localização</h4>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{ticket.location.address}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em {formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Atualizado em {formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
              
              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Sugestão da IA */}
          {ticket.aiSuggestion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="bg-blue-500 text-white p-1 rounded">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span>Diagnóstico Inicial da IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{ticket.aiSuggestion}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Mídias */}
          {(ticket.images?.length > 0 || ticket.videos?.length > 0 || ticket.audio) && (
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Anexados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.images?.map((image, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4 text-blue-500" />
                        <span className="text-sm truncate">Imagem {index + 1}</span>
                      </div>
                    </div>
                  ))}
                  
                  {ticket.videos?.map((video, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-green-500" />
                        <span className="text-sm truncate">Vídeo {index + 1}</span>
                      </div>
                    </div>
                  ))}
                  
                  {ticket.audio && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Mic className="h-4 w-4 text-red-500" />
                        <span className="text-sm truncate">Áudio</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Respostas e Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversas ({ticket.responses.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.responses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma resposta ainda</p>
                    {canRespond && (
                      <p className="text-sm">Seja o primeiro a responder este chamado</p>
                    )}
                  </div>
                ) : (
                  ticket.responses.map((response, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={getAvatarColor(response.technicianName)}>
                            {getInitials(response.technicianName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {response.technicianName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(response.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{response.message}</p>
                          
                          {response.estimatedCost && (
                            <div className="flex items-center space-x-2 text-sm text-green-600 mb-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Custo estimado: {response.estimatedCost}</span>
                            </div>
                          )}
                          
                          {response.visitScheduled && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              <CalendarDays className="h-4 w-4" />
                              <span>Visita agendada: {formatDate(response.visitScheduled)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Formulário de Resposta */}
                {canRespond && ticket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Digite sua resposta..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Custo Estimado (Opcional)
                          </label>
                          <Input
                            placeholder="Ex: R$ 150,00 - R$ 300,00"
                            value={estimatedCost}
                            onChange={(e) => setEstimatedCost(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Agendar Visita (Opcional)
                          </label>
                          <Input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          onClick={handleSendResponse}
                          disabled={!newMessage.trim() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Resposta
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={getAvatarColor(ticket.clientName)}>
                    {getInitials(ticket.clientName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{ticket.clientName}</h3>
                  <p className="text-sm text-gray-600">Cliente</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{ticket.clientPhone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{ticket.location.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Técnico Responsável */}
          {ticket.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle>Técnico Responsável</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ticket.assignedTo.avatar} />
                    <AvatarFallback className={getAvatarColor(ticket.assignedTo.name)}>
                      {getInitials(ticket.assignedTo.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.assignedTo.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chamado criado</p>
                    <p className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
                
                {ticket.assignedTo && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Técnico atribuído</p>
                      <p className="text-xs text-gray-500">{ticket.assignedTo.name}</p>
                    </div>
                  </div>
                )}
                
                {ticket.responses.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Primeira resposta</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(ticket.responses[0].createdAt)}
                      </p>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'resolved' && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Problema resolvido</p>
                      <p className="text-xs text-gray-500">{formatDate(ticket.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

