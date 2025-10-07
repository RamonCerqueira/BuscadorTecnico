import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Wrench, User, Building2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/lib/store'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { autoLogin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Obter estado da navegação
  const state = location.state || {}
  const { returnTo, message: stateMessage, mode = 'login', userType: defaultUserType } = state
  
  useEffect(() => {
    if (stateMessage) {
      setMessage(stateMessage)
    }
  }, [stateMessage])
  
  const handleDemoLogin = async (userType) => {
    setIsLoading(true)
    
    // Simula loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    autoLogin(userType)
    
    // Redirecionar para onde o usuário estava tentando ir
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate('/app/dashboard')
    }
  }
  
  const userTypes = [
    {
      id: 'client',
      label: 'Cliente',
      icon: User,
      description: 'Relatar problemas com equipamentos',
      color: 'bg-blue-500'
    },
    {
      id: 'technician',
      label: 'Técnico',
      icon: Wrench,
      description: 'Atender chamados técnicos',
      color: 'bg-green-500'
    },
    {
      id: 'company',
      label: 'Empresa',
      icon: Building2,
      description: 'Gerenciar equipe técnica',
      color: 'bg-purple-500'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Administrar plataforma',
      color: 'bg-red-500'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <Wrench className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TechFix</h1>
          <p className="text-gray-600">Plataforma Inteligente para Diagnóstico Técnico</p>
          
          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{message}</p>
            </div>
          )}
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Demo Login Cards */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Demonstração
              </h2>
              <p className="text-gray-600">
                Escolha um tipo de usuário para testar a plataforma
              </p>
            </div>
            
            <div className="grid gap-4">
              {userTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card 
                    key={type.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => handleDemoLogin(type.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`${type.color} text-white p-3 rounded-lg`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {type.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {type.description}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-400 text-white p-1 rounded">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800">Modo Demonstração</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta é uma versão de demonstração com dados fictícios. 
                    Todas as funcionalidades estão disponíveis para teste.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Entrar na Plataforma</CardTitle>
              <CardDescription>
                Acesse sua conta ou use a demonstração ao lado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="w-full" disabled>
                    Entrar
                  </Button>
                  
                  <div className="text-center">
                    <Link 
                      to="#" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input
                      id="email-register"
                      type="email"
                      placeholder="seu@email.com"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Senha</Label>
                    <Input
                      id="password-register"
                      type="password"
                      placeholder="••••••••"
                      disabled
                    />
                  </div>
                  
                  <Button className="w-full" disabled>
                    Criar Conta
                  </Button>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Modo Demonstração Ativo</strong><br />
                  Use os botões de demonstração ao lado para testar a plataforma
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TechFix. Todos os direitos reservados.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link to="#" className="hover:text-gray-700">Termos de Uso</Link>
            <Link to="#" className="hover:text-gray-700">Privacidade</Link>
            <Link to="#" className="hover:text-gray-700">Suporte</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

