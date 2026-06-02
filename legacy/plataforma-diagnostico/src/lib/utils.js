import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Formatação de data
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatDateShort(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Formatação de telefone
export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// Formatação de CNPJ
export function formatCNPJ(cnpj) {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
  }
  return cnpj
}

// Validação de email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone
export function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}

// Validação de CNPJ
export function isValidCNPJ(cnpj) {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.length === 14
}

// Geração de cores para avatars
export function getAvatarColor(name) {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

// Geração de iniciais
export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Status de chamado
export function getStatusColor(status) {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || colors.open
}

export function getStatusText(status) {
  const texts = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    resolved: 'Resolvido',
    closed: 'Fechado'
  }
  return texts[status] || 'Desconhecido'
}

// Prioridade de chamado
export function getPriorityColor(priority) {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }
  return colors[priority] || colors.medium
}

export function getPriorityText(priority) {
  const texts = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta'
  }
  return texts[priority] || 'Média'
}

// Cálculo de distância (aproximado)
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Simulação de IA para diagnóstico
export function generateAISuggestion(deviceType, brand, model, description) {
  const suggestions = {
    'Celular': {
      'carregamento': 'Problema comum em smartphones. Verifique se há sujeira no conector de carga. Pode ser defeito no cabo, carregador, conector ou circuito de carga.',
      'tela': 'Possível queda ou impacto. Pode ser apenas o vidro ou o display completo. Necessário avaliação presencial.',
      'bateria': 'Bateria pode estar viciada ou com defeito. Comum após 2-3 anos de uso intenso.',
      'não liga': 'Pode ser bateria descarregada, defeito na placa ou botão power. Teste com carregador original.'
    },
    'Notebook': {
      'não liga': 'Verifique fonte de alimentação. Pode ser bateria, fonte externa ou defeito na placa-mãe.',
      'tela': 'Possível defeito no cabo flat, inversor ou painel LCD. Teste com monitor externo.',
      'superaquecimento': 'Limpeza do cooler e troca da pasta térmica podem resolver.',
      'lentidão': 'Pode ser HD com defeito, pouca memória RAM ou vírus.'
    },
    'TV': {
      'não liga': 'Verifique fonte de alimentação e fusíveis. Pode ser defeito na placa principal.',
      'sem imagem': 'Teste outras entradas. Pode ser defeito no painel ou placa T-CON.',
      'sem som': 'Verifique configurações de áudio. Pode ser defeito nos alto-falantes.'
    }
  }
  
  const deviceSuggestions = suggestions[deviceType] || {}
  
  // Busca por palavras-chave na descrição
  for (const [keyword, suggestion] of Object.entries(deviceSuggestions)) {
    if (description.toLowerCase().includes(keyword)) {
      return suggestion
    }
  }
  
  return 'Descrição recebida. Recomendo avaliação técnica presencial para diagnóstico preciso.'
}

// Upload de arquivos (simulado)
export function simulateFileUpload(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type
      })
    }, 1000)
  })
}

// Geolocalização (simulada)
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Fallback para São Paulo
          resolve({
            lat: -23.5505,
            lng: -46.6333
          })
        }
      )
    } else {
      // Fallback para São Paulo
      resolve({
        lat: -23.5505,
        lng: -46.6333
      })
    }
  })
}

