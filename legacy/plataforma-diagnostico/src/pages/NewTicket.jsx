import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Upload, 
  X, 
  MapPin, 
  Camera, 
  Mic, 
  Video,
  FileText,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Headphones,
  Gamepad2,
  Printer,
  Router,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuthStore, useTicketsStore } from '@/lib/store'
import { simulateFileUpload, getCurrentLocation, generateAISuggestion } from '@/lib/utils'

const formSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  deviceType: z.string().min(1, 'Selecione o tipo de dispositivo'),
  brand: z.string().min(1, 'Informe a marca'),
  model: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  location: z.string().min(5, 'Informe sua localização')
})

export default function NewTicket() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addTicket } = useTicketsStore()
  
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')
  
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const audioInputRef = useRef(null)
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      deviceType: '',
      brand: '',
      model: '',
      priority: 'medium',
      location: ''
    }
  })
  
  const deviceTypes = [
    { value: 'Celular', label: 'Celular/Smartphone', icon: Smartphone },
    { value: 'Notebook', label: 'Notebook/Laptop', icon: Laptop },
    { value: 'TV', label: 'TV/Monitor', icon: Monitor },
    { value: 'Tablet', label: 'Tablet', icon: Tablet },
    { value: 'Fone', label: 'Fone de Ouvido', icon: Headphones },
    { value: 'Console', label: 'Console/Game', icon: Gamepad2 },
    { value: 'Impressora', label: 'Impressora', icon: Printer },
    { value: 'Roteador', label: 'Roteador/Modem', icon: Router },
    { value: 'Outros', label: 'Outros', icon: Lightbulb }
  ]
  
  const brands = {
    'Celular': ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'LG', 'Huawei', 'OnePlus', 'Outros'],
    'Notebook': ['Dell', 'HP', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Samsung', 'Outros'],
    'TV': ['Samsung', 'LG', 'Sony', 'TCL', 'Philips', 'Panasonic', 'Outros'],
    'Tablet': ['Apple', 'Samsung', 'Lenovo', 'Huawei', 'Outros'],
    'Fone': ['Sony', 'JBL', 'Beats', 'Sennheiser', 'Audio-Technica', 'Outros'],
    'Console': ['Sony', 'Microsoft', 'Nintendo', 'Outros'],
    'Impressora': ['HP', 'Canon', 'Epson', 'Brother', 'Outros'],
    'Roteador': ['TP-Link', 'D-Link', 'Linksys', 'Netgear', 'Outros'],
    'Outros': ['Outros']
  }
  
  const selectedDeviceType = form.watch('deviceType')
  const availableBrands = brands[selectedDeviceType] || []
  
  // Buscar localização atual
  const handleGetLocation = async () => {
    try {
      const location = await getCurrentLocation()
      // Simular busca de endereço por coordenadas
      const address = 'São Paulo, SP' // Em produção, usar API de geocoding
      setCurrentLocation(address)
      form.setValue('location', address)
    } catch (error) {
      console.error('Erro ao obter localização:', error)
    }
  }
  
  // Upload de arquivos
  const handleFileUpload = async (files, type = 'image') => {
    setIsUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadedFile = await simulateFileUpload(file)
        return {
          ...uploadedFile,
          type,
          id: Date.now() + Math.random()
        }
      })
      
      const newFiles = await Promise.all(uploadPromises)
      setUploadedFiles(prev => [...prev, ...newFiles])
    } catch (error) {
      console.error('Erro no upload:', error)
    } finally {
      setIsUploading(false)
    }
  }
  
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }
  
  // Gerar sugestão da IA
  const generateAISuggestionForTicket = () => {
    const { deviceType, brand, model, description } = form.getValues()
    if (deviceType && description) {
      const suggestion = generateAISuggestion(deviceType, brand, model, description)
      setAiSuggestion(suggestion)
    }
  }
  
  // Submeter formulário
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newTicket = {
        ...data,
        clientId: user.id,
        clientName: user.name,
        clientPhone: user.phone,
        status: 'open',
        location: {
          lat: -23.5505,
          lng: -46.6333,
          address: data.location
        },
        images: uploadedFiles.filter(f => f.type === 'image'),
        videos: uploadedFiles.filter(f => f.type === 'video'),
        audio: uploadedFiles.find(f => f.type === 'audio'),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: null,
        responses: [],
        aiSuggestion: aiSuggestion || generateAISuggestion(data.deviceType, data.brand, data.model, data.description),
        estimatedCost: null,
        tags: [
          data.deviceType.toLowerCase(),
          data.brand.toLowerCase(),
          ...data.description.toLowerCase().split(' ').filter(word => word.length > 3)
        ].slice(0, 5)
      }
      
      addTicket(newTicket)
      navigate('/tickets')
    } catch (error) {
      console.error('Erro ao criar chamado:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Chamado</h1>
        <p className="text-gray-600 mt-1">
          Descreva o problema com seu equipamento para receber ajuda técnica
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulário Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Problema</CardTitle>
                  <CardDescription>
                    Descreva o problema de forma clara e detalhada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Problema</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: iPhone não carrega, Notebook não liga..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Detalhada</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o problema em detalhes: quando começou, o que acontece, já tentou alguma solução..."
                            className="min-h-[120px]"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              // Gerar sugestão da IA quando o usuário parar de digitar
                              clearTimeout(window.aiSuggestionTimeout)
                              window.aiSuggestionTimeout = setTimeout(generateAISuggestionForTicket, 1000)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Quanto mais detalhes, melhor será o diagnóstico
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa - Não é urgente</SelectItem>
                            <SelectItem value="medium">Média - Preciso resolver em breve</SelectItem>
                            <SelectItem value="high">Alta - É urgente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Informações do Dispositivo */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Dispositivo</CardTitle>
                  <CardDescription>
                    Ajude-nos a identificar seu equipamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Dispositivo</FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {deviceTypes.map((device) => {
                            const Icon = device.icon
                            return (
                              <div
                                key={device.value}
                                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                                  field.value === device.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                  field.onChange(device.value)
                                  form.setValue('brand', '') // Reset brand when device type changes
                                }}
                              >
                                <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                                <p className="text-xs text-center font-medium">
                                  {device.label}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedDeviceType}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a marca" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: iPhone 12, Dell Inspiron..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Localização */}
              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                  <CardDescription>
                    Para encontrar técnicos próximos a você
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço ou Região</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input 
                              placeholder="Ex: São Paulo, SP ou CEP 01234-567"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGetLocation}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>
                          Use o botão de localização para detectar automaticamente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Upload de Mídias */}
              <Card>
                <CardHeader>
                  <CardTitle>Fotos e Vídeos</CardTitle>
                  <CardDescription>
                    Adicione imagens ou vídeos do problema (opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Adicionar Fotos
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Adicionar Vídeo
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Gravar Áudio
                      </Button>
                    </div>
                    
                    {/* Hidden File Inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'image')}
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'video')}
                    />
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'audio')}
                    />
                    
                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="relative group">
                            <div className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center space-x-2">
                                {file.type === 'image' && <Camera className="h-4 w-4 text-blue-500" />}
                                {file.type === 'video' && <Video className="h-4 w-4 text-green-500" />}
                                {file.type === 'audio' && <Mic className="h-4 w-4 text-red-500" />}
                                <span className="text-sm truncate">{file.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                                onClick={() => removeFile(file.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Enviando arquivos...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sugestão da IA */}
              {aiSuggestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="bg-blue-500 text-white p-1 rounded">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <span>Sugestão da IA</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{aiSuggestion}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Dicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <span>Dicas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p>• Seja específico na descrição do problema</p>
                    <p>• Inclua quando o problema começou</p>
                    <p>• Mencione se já tentou alguma solução</p>
                    <p>• Fotos ajudam no diagnóstico</p>
                    <p>• Informe se o equipamento está na garantia</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ações */}
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando Chamado...
                    </>
                  ) : (
                    'Criar Chamado'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/tickets')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

