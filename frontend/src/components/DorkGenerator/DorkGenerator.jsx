import React, { useState, useEffect } from 'react'
import { Copy, Search, Info, Settings, RefreshCw, ExternalLink, BookOpen, Download, Globe } from 'lucide-react'
import DorkService from '../../services/dorkService.js'
import './DorkGenerator.css'

const DorkGenerator = () => {
  
  // Estados principales
  const [query, setQuery] = useState('')
  const [targetType, setTargetType] = useState('usernames')
  const [selectedEngines, setSelectedEngines] = useState(['google', 'yandex'])
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Estados para opciones avanzadas
  const [includeTerms, setIncludeTerms] = useState([])
  const [excludeTerms, setExcludeTerms] = useState([])
  const [includeInput, setIncludeInput] = useState('')
  const [excludeInput, setExcludeInput] = useState('')
  const [dateAfter, setDateAfter] = useState('')
  const [dateBefore, setDateBefore] = useState('')
  
  // Estados de la aplicación
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [targetTypes, setTargetTypes] = useState([])
  const [searchEngines, setSearchEngines] = useState([])
  const [copiedItems, setCopiedItems] = useState(new Set())

  // Estados para opciones multimedia
  const [imageSize, setImageSize] = useState('')
  const [imageType, setImageType] = useState('')
  const [imageColor, setImageColor] = useState('')
  const [videoFormat, setVideoFormat] = useState('')
  const [videoDuration, setVideoDuration] = useState('')
  const [videoQuality, setVideoQuality] = useState('')
  
  // Estados para funciones avanzadas
  const [enableChaining, setEnableChaining] = useState(false)
  const [chainedTypes, setChainedTypes] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Usar datos locales en lugar de API
      const localTargetTypes = [
        {
          id: 'usernames',
          name: 'Nombres de Usuario',
          description: 'Buscar perfiles y cuentas de usuario'
        },
        {
          id: 'emails',
          name: 'Correos Electrónicos',
          description: 'Encontrar direcciones de email'
        },
        {
          id: 'websites',
          name: 'Sitios Web',
          description: 'Buscar dominios y sitios específicos'
        },
        {
          id: 'documents',
          name: 'Documentos',
          description: 'Encontrar archivos PDF, DOC, etc.'
        },
        {
          id: 'images',
          name: 'Imágenes',
          description: 'Buscar imágenes por tipo, tamaño y contenido'
        },
        {
          id: 'videos',
          name: 'Videos',
          description: 'Encontrar videos por formato y plataforma'
        },
        {
          id: 'social',
          name: 'Redes Sociales',
          description: 'Buscar en plataformas sociales'
        },
        {
          id: 'multimedia_platforms',
          name: 'Plataformas Multimedia',
          description: 'Buscar en YouTube, Vimeo, Instagram, etc.'
        },
        {
          id: 'phones',
          name: 'Números Telefónicos',
          description: 'Buscar números de teléfono y contactos'
        },
        {
          id: 'cryptocurrency',
          name: 'Criptomonedas',
          description: 'Buscar wallets, direcciones y transacciones crypto'
        },
        {
          id: 'iot_devices',
          name: 'Dispositivos IoT',
          description: 'Buscar cámaras, routers y dispositivos inteligentes'
        }
      ]

      const localSearchEngines = [
        {
          id: 'google',
          name: 'Google',
          description: 'Motor de búsqueda más completo'
        },
        {
          id: 'yandex',
          name: 'Yandex',
          description: 'Excelente para contenido en cirílico'
        },
        {
          id: 'bing',
          name: 'Bing',
          description: 'Motor de búsqueda de Microsoft'
        },
        {
          id: 'duckduckgo',
          name: 'DuckDuckGo',
          description: 'Búsqueda privada'
        }
      ]

      setTargetTypes(localTargetTypes)
      setSearchEngines(localSearchEngines)
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
      setError('Error cargando la configuración inicial')
    }
  }

  // Manejar cambios en los motores de búsqueda
  const handleEngineChange = (engineId) => {
    setSelectedEngines(prev => {
      if (prev.includes(engineId)) {
        return prev.filter(id => id !== engineId)
      } else {
        return [...prev, engineId]
      }
    })
  }

  // Manejar cambios en tipos encadenados
  const handleChainedTypeChange = (typeId) => {
    setChainedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId)
      } else {
        return [...prev, typeId]
      }
    })
  }

  // Generar sugerencias inteligentes basadas en el input
  const generateSmartSuggestions = (inputQuery) => {
    const suggestions = []
    const lowerQuery = inputQuery.toLowerCase()
    
    // Detectar patrones y sugerir tipos apropiados
    if (lowerQuery.includes('@') || lowerQuery.includes('email') || lowerQuery.includes('mail')) {
      suggestions.push({ type: 'emails', reason: 'Detectado patrón de email' })
    }
    
    if (lowerQuery.includes('.com') || lowerQuery.includes('.org') || lowerQuery.includes('.net') || lowerQuery.includes('www.')) {
      suggestions.push({ type: 'websites', reason: 'Detectado dominio web' })
    }
    
    if (lowerQuery.match(/\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/)) {
      suggestions.push({ type: 'phones', reason: 'Detectado formato de teléfono' })
    }
    
    if (lowerQuery.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^0x[a-fA-F0-9]{40}$/)) {
      suggestions.push({ type: 'cryptocurrency', reason: 'Detectada dirección crypto' })
    }
    
    if (lowerQuery.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      suggestions.push({ type: 'iot_devices', reason: 'Detectada dirección IP' })
    }
    
    if (lowerQuery.includes('camera') || lowerQuery.includes('router') || lowerQuery.includes('device')) {
      suggestions.push({ type: 'iot_devices', reason: 'Detectado dispositivo IoT' })
    }
    
    return suggestions
  }

  // Manejar cambios en el query principal
  const handleQueryChange = (value) => {
    setQuery(value)
    
    // Generar sugerencias si hay contenido
    if (value.trim().length > 2) {
      const newSuggestions = generateSmartSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Aplicar sugerencia
  const applySuggestion = (suggestionType) => {
    setTargetType(suggestionType)
    setShowSuggestions(false)
  }

  // Agregar término de inclusión
  const addIncludeTerm = () => {
    if (includeInput.trim() && !includeTerms.includes(includeInput.trim())) {
      setIncludeTerms([...includeTerms, includeInput.trim()])
      setIncludeInput('')
    }
  }

  // Agregar término de exclusión
  const addExcludeTerm = () => {
    if (excludeInput.trim() && !excludeTerms.includes(excludeInput.trim())) {
      setExcludeTerms([...excludeTerms, excludeInput.trim()])
      setExcludeInput('')
    }
  }

  // Remover término
  const removeTerm = (term, type) => {
    if (type === 'include') {
      setIncludeTerms(includeTerms.filter(t => t !== term))
    } else {
      setExcludeTerms(excludeTerms.filter(t => t !== term))
    }
  }

  // Función local para generar dorks
  const generateDorksLocal = (params) => {
    const { query, targetType, engines, includeTerms = [], excludeTerms = [], dateAfter, dateBefore } = params
    const dorks = []

    // Plantillas de dorks por tipo
    const dorkTemplates = {
      usernames: [
        'site:facebook.com "{query}"',
        'site:twitter.com "{query}"',
        'site:instagram.com "{query}"',
        'site:linkedin.com "{query}"',
        'site:github.com "{query}"',
        'site:reddit.com "{query}"',
        'site:youtube.com "{query}"',
        'inurl:"{query}" site:social',
        '"{query}" profile',
        '"{query}" usuario OR user'
      ],
      emails: [
        '"{query}" email OR mail',
        '"{query}" @gmail.com OR @hotmail.com OR @yahoo.com',
        '"{query}" @outlook.com OR @live.com OR @msn.com',
        '"{query}" @corporate.com OR @empresa.com',
        'site:pastebin.com "{query}"',
        'site:paste.org "{query}"',
        'site:ghostbin.com "{query}"',
        'site:github.com "{query}" email',
        'filetype:txt "{query}" email',
        'filetype:csv "{query}" email',
        'filetype:sql "{query}" email',
        'intext:"{query}" "@"',
        '"{query}" contact OR contacto',
        'site:haveibeenpwned.com "{query}"',
        'site:breachdirectory.org "{query}"',
        '"{query}" leaked OR filtrado OR breach',
        '"{query}" "email list" OR "lista email"',
        '"{query}" "mailing list" OR "lista correo"',
        'inurl:"email" "{query}"',
        'intext:"{query}" "mailto:"'
      ],
      websites: [
        'site:{query}',
        'inurl:{query}',
        'intitle:"{query}"',
        'related:{query}',
        'link:{query}',
        'cache:{query}',
        'info:{query}',
        'inanchor:"{query}"'
      ],
      documents: [
        'filetype:pdf "{query}"',
        'filetype:doc "{query}"',
        'filetype:docx "{query}"',
        'filetype:xls "{query}"',
        'filetype:xlsx "{query}"',
        'filetype:ppt "{query}"',
        'filetype:pptx "{query}"',
        'filetype:txt "{query}"',
        'filetype:csv "{query}"',
        'filetype:xml "{query}"',
        'filetype:json "{query}"',
        'filetype:epub "{query}"',
        'filetype:rtf "{query}"',
        'filetype:odt "{query}"',
        'filetype:ods "{query}"',
        'filetype:odp "{query}"',
        'ext:pdf "{query}"',
        'ext:doc "{query}"',
        'ext:xls "{query}"',
        'intext:"{query}" filetype:conf',
        'intext:"{query}" filetype:cfg',
        'intext:"{query}" filetype:ini'
      ],
      images: [
        'filetype:jpg "{query}"',
        'filetype:jpeg "{query}"',
        'filetype:png "{query}"',
        'filetype:gif "{query}"',
        'filetype:bmp "{query}"',
        'filetype:svg "{query}"',
        'filetype:webp "{query}"',
        'ext:jpg "{query}"',
        'ext:png "{query}"',
        'imagesize:large "{query}"',
        'imagesize:medium "{query}"',
        'imagesize:small "{query}"',
        'site:imgur.com "{query}"',
        'site:flickr.com "{query}"',
        'site:pinterest.com "{query}"',
        'inurl:image "{query}"',
        'inurl:photo "{query}"',
        'inurl:picture "{query}"',
        '"{query}" foto OR photo OR imagen',
        '"{query}" wallpaper OR background'
      ],
      videos: [
        'filetype:mp4 "{query}"',
        'filetype:avi "{query}"',
        'filetype:mov "{query}"',
        'filetype:wmv "{query}"',
        'filetype:flv "{query}"',
        'filetype:webm "{query}"',
        'filetype:mkv "{query}"',
        'ext:mp4 "{query}"',
        'ext:avi "{query}"',
        'site:youtube.com "{query}"',
        'site:vimeo.com "{query}"',
        'site:dailymotion.com "{query}"',
        'site:twitch.tv "{query}"',
        'inurl:video "{query}"',
        'inurl:watch "{query}"',
        'inurl:stream "{query}"',
        '"{query}" video OR película OR movie',
        '"{query}" streaming OR live',
        '"{query}" tutorial OR how-to',
        '"{query}" documentary OR documental'
      ],
      social: [
        'site:facebook.com "{query}"',
        'site:twitter.com "{query}"',
        'site:instagram.com "{query}"',
        'site:tiktok.com "{query}"',
        'site:linkedin.com "{query}"',
        'site:pinterest.com "{query}"',
        'site:snapchat.com "{query}"',
        'site:telegram.me "{query}"',
        'site:discord.com "{query}"',
        'site:reddit.com "{query}"',
        'site:tumblr.com "{query}"',
        'site:mastodon.social "{query}"',
        'site:clubhouse.com "{query}"',
        'site:signal.org "{query}"',
        'site:whatsapp.com "{query}"',
        'inurl:"t.me/" "{query}"',
        'inurl:"discord.gg/" "{query}"',
        '"{query}" "social media" OR "redes sociales"'
      ],
      multimedia_platforms: [
        'site:youtube.com "{query}"',
        'site:vimeo.com "{query}"',
        'site:instagram.com "{query}"',
        'site:tiktok.com "{query}"',
        'site:pinterest.com "{query}"',
        'site:flickr.com "{query}"',
        'site:imgur.com "{query}"',
        'site:twitch.tv "{query}"',
        'site:dailymotion.com "{query}"',
        'site:soundcloud.com "{query}"',
        'site:spotify.com "{query}"',
        'site:deviantart.com "{query}"',
        'site:behance.net "{query}"',
        'site:dribbble.com "{query}"',
        '"{query}" multimedia OR media',
        '"{query}" gallery OR galería',
        '"{query}" portfolio OR portafolio',
        '"{query}" creative OR creativo'
      ],
      phones: [
        '"{query}" phone OR telefono OR tel',
        '"{query}" mobile OR movil OR celular',
        '"{query}" "phone number" OR "numero telefono"',
        '"{query}" contact OR contacto',
        '"{query}" "+1" OR "+34" OR "+52" OR "+44"',
        '"{query}" "(" ")" phone',
        'intext:"{query}" phone',
        'intext:"{query}" "phone:" OR "tel:" OR "mobile:"',
        'site:whitepages.com "{query}"',
        'site:truecaller.com "{query}"',
        'site:yellowpages.com "{query}"',
        'filetype:vcf "{query}"',
        'filetype:csv "{query}" phone',
        '"{query}" directory OR directorio',
        '"{query}" "área code" OR "codigo area"',
        'inurl:phonebook "{query}"',
        'inurl:directory "{query}"',
        '"{query}" whatsapp OR telegram'
      ],
      cryptocurrency: [
        '"{query}" bitcoin OR btc',
        '"{query}" ethereum OR eth',
        '"{query}" wallet OR billetera',
        '"{query}" "bitcoin address" OR "dirección bitcoin"',
        '"{query}" "1" "3" "bc1" bitcoin',
        '"{query}" "0x" ethereum',
        'site:blockchain.info "{query}"',
        'site:blockchair.com "{query}"',
        'site:etherscan.io "{query}"',
        'site:bitcointalk.org "{query}"',
        'intext:"{query}" "crypto" OR "cryptocurrency"',
        '"{query}" "private key" OR "clave privada"',
        '"{query}" "seed phrase" OR "frase semilla"',
        '"{query}" exchange OR intercambio',
        '"{query}" mining OR mineria',
        '"{query}" "public key" OR "clave publica"',
        'filetype:txt "{query}" wallet',
        'inurl:address "{query}"'
      ],
      iot_devices: [
        '"{query}" camera OR camara',
        '"{query}" "IP camera" OR "camara IP"',
        '"{query}" router OR enrutador',
        '"{query}" "smart device" OR "dispositivo inteligente"',
        'inurl:"view/live" "{query}"',
        'inurl:"ViewerFrame?Mode=" "{query}"',
        'inurl:"/cgi-bin/" "{query}"',
        'intitle:"Live View" "{query}"',
        'intitle:"Network Camera" "{query}"',
        'site:shodan.io "{query}"',
        'site:censys.io "{query}"',
        '"{query}" "admin" "password" device',
        '"{query}" "default password" OR "contraseña por defecto"',
        'intext:"{query}" "IoT" OR "Internet of Things"',
        '"{query}" "smart home" OR "casa inteligente"',
        '"{query}" "webcam" OR "security camera"',
        'inurl:"axis-cgi/mjpg" "{query}"',
        'intitle:"D-Link" "{query}"',
        'intitle:"TP-Link" "{query}"',
        'intitle:"Netgear" "{query}"'
      ]
    }

    // Determinar qué tipos usar (encadenado o individual)
    const typesToUse = enableChaining && chainedTypes.length > 0 ? [targetType, ...chainedTypes] : [targetType]
    
    // Generar dorks para cada tipo y motor
    typesToUse.forEach(currentType => {
      const templates = dorkTemplates[currentType] || dorkTemplates.usernames
      
      engines.forEach(engine => {
        templates.forEach((template, index) => {
        let dorkQuery = template.replace(/\{query\}/g, query)

        // Agregar términos adicionales
        if (includeTerms.length > 0) {
          dorkQuery += ' ' + includeTerms.map(term => `"${term}"`).join(' ')
        }

        // Agregar términos a excluir
        if (excludeTerms.length > 0) {
          dorkQuery += ' ' + excludeTerms.map(term => `-"${term}"`).join(' ')
        }

        // Agregar filtros específicos para multimedia
        if (targetType === 'images') {
          if (imageSize) {
            dorkQuery += ` imagesize:${imageSize}`
          }
          if (imageType) {
            dorkQuery += ` imagetype:${imageType}`
          }
          if (imageColor) {
            dorkQuery += ` imagecolor:${imageColor}`
          }
        }

        if (targetType === 'videos') {
          if (videoFormat) {
            dorkQuery += ` filetype:${videoFormat}`
          }
          if (videoDuration && engine === 'google') {
            dorkQuery += ` videoduration:${videoDuration}`
          }
          if (videoQuality && engine === 'google') {
            dorkQuery += ` videoquality:${videoQuality}`
          }
        }

        // Agregar filtros de fecha (solo para Google)
        if (engine === 'google') {
          if (dateAfter) {
            dorkQuery += ` after:${dateAfter}`
          }
          if (dateBefore) {
            dorkQuery += ` before:${dateBefore}`
          }
        }

        // Crear URL del motor de búsqueda
        let searchUrl = ''
        switch (engine) {
          case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`
            break
          case 'yandex':
            searchUrl = `https://yandex.com/search/?text=${encodeURIComponent(dorkQuery)}`
            break
          case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(dorkQuery)}`
            break
          case 'duckduckgo':
            searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(dorkQuery)}`
            break
        }

          dorks.push({
            engine: engine.charAt(0).toUpperCase() + engine.slice(1),
            type: currentType,
            query: dorkQuery,
            url: searchUrl,
            id: `${engine}-${currentType}-${index}`
          })
        })
      })
    })

    return { dorks }
  }

  // Generar dorks
  const generateDorks = async () => {
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda')
      return
    }

    if (selectedEngines.length === 0) {
      setError('Selecciona al menos un motor de búsqueda')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params = {
        query: query.trim(),
        targetType,
        engines: selectedEngines,
        includeTerms,
        excludeTerms,
        dateAfter,
        dateBefore,
        imageSize,
        imageType,
        imageColor,
        videoFormat,
        videoDuration,
        videoQuality
      }

      // Usar función local en lugar de API
      const response = generateDorksLocal(params)
      setResults(response)
    } catch (error) {
      console.error('Error generando dorks:', error)
      setError('Error al generar los dorks. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Copiar al portapapeles
  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => new Set([...prev, id]))
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error('Error copiando al portapapeles:', error)
    }
  }

  // Abrir en nueva ventana
  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Abrir todas las URLs en pestañas separadas
  const openAllTabs = () => {
    if (!results || !results.dorks) return

    // Confirmar antes de abrir muchas pestañas
    const totalTabs = results.dorks.filter(dork => dork.url).length
    if (totalTabs > 10) {
      const confirmed = window.confirm(
        `Esto abrirá ${totalTabs} pestañas nuevas. ¿Estás seguro de que quieres continuar?\n\n` +
        `Nota: Tu navegador puede bloquear algunas pestañas emergentes.`
      )
      if (!confirmed) return
    }

    // Abrir cada URL con un pequeño delay para evitar bloqueos del navegador
    results.dorks.forEach((dork, index) => {
      if (dork.url) {
        setTimeout(() => {
          window.open(dork.url, '_blank', 'noopener,noreferrer')
        }, index * 100) // 100ms de delay entre cada pestaña
      }
    })
  }

  // Descargar dorks en diferentes formatos
  const downloadDorks = (format = 'txt') => {
    if (!results || !results.dorks) return

    switch (format) {
      case 'json':
        downloadDorksAsJSON()
        break
      case 'csv':
        downloadDorksAsCSV()
        break
      case 'txt':
      default:
        downloadDorksAsText()
        break
    }
  }

  // Descargar como JSON
  const downloadDorksAsJSON = () => {
    if (!results || !results.dorks) return

    const data = {
      metadata: {
        query,
        targetType,
        engines: selectedEngines,
        includeTerms,
        excludeTerms,
        dateAfter,
        dateBefore,
        generatedAt: new Date().toISOString(),
        totalDorks: results.dorks.length
      },
      dorks: results.dorks
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const safeQuery = query.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    link.download = `dorks_${safeQuery}_${targetType}_${timestamp}.json`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Descargar como CSV
  const downloadDorksAsCSV = () => {
    if (!results || !results.dorks) return

    let csvContent = 'Engine,Type,Query,URL\n'
    
    results.dorks.forEach(dork => {
      const escapedQuery = `"${dork.query.replace(/"/g, '""')}"`
      const escapedUrl = `"${dork.url || ''}"`
      csvContent += `${dork.engine},${dork.type},${escapedQuery},${escapedUrl}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const safeQuery = query.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    link.download = `dorks_${safeQuery}_${targetType}_${timestamp}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Descargar como texto
  const downloadDorksAsText = () => {
    if (!results || !results.dorks) return

    try {
      // Crear contenido del archivo
      let content = `# Dorks OSINT Generados\n`
      content += `# Término de búsqueda: ${query}\n`
      content += `# Tipo de búsqueda: ${targetType}\n`
      content += `# Motores seleccionados: ${selectedEngines.join(', ')}\n`
      content += `# Generado el: ${new Date().toLocaleString()}\n`
      content += `# Total de dorks: ${results.dorks.length}\n\n`

      if (includeTerms.length > 0) {
        content += `# Términos incluidos: ${includeTerms.join(', ')}\n`
      }
      if (excludeTerms.length > 0) {
        content += `# Términos excluidos: ${excludeTerms.join(', ')}\n`
      }
      if (dateAfter || dateBefore) {
        content += `# Filtros de fecha: ${dateAfter ? `después de ${dateAfter}` : ''} ${dateBefore ? `antes de ${dateBefore}` : ''}\n`
      }
      content += `\n${'='.repeat(80)}\n\n`

      // Agrupar por motor de búsqueda
      const groupedByEngine = results.dorks.reduce((acc, dork) => {
        if (!acc[dork.engine]) {
          acc[dork.engine] = []
        }
        acc[dork.engine].push(dork)
        return acc
      }, {})

      // Escribir cada grupo
      Object.entries(groupedByEngine).forEach(([engine, dorks]) => {
        content += `## ${engine.toUpperCase()}\n\n`

        dorks.forEach((dork, index) => {
          content += `${index + 1}. Query: ${dork.query}\n`
          if (dork.url) {
            content += `   URL: ${dork.url}\n`
          }
          content += `\n`
        })

        content += `${'-'.repeat(40)}\n\n`
      })

      // Añadir sección de URLs para copiar fácilmente
      content += `## URLS PARA COPIAR\n\n`
      results.dorks.forEach((dork, index) => {
        if (dork.url) {
          content += `${dork.url}\n`
        }
      })

      // Crear y descargar archivo
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Crear nombre de archivo seguro
      const safeQuery = query.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      link.download = `dorks_${safeQuery}_${targetType}_${timestamp}.txt`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Mostrar confirmación
      setCopiedItems(prev => new Set([...prev, 'download']))
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete('download')
          return newSet
        })
      }, 3000)

    } catch (error) {
      console.error('Error descargando archivo:', error)
      setError('Error al descargar el archivo. Inténtalo de nuevo.')
    }
  }

  // Función para obtener información sobre el tipo de búsqueda
  const getSearchTypeInfo = () => {
    const typeInfo = {
      usernames: {
        icon: '👤',
        description: 'Buscar perfiles de usuario en redes sociales y plataformas',
        examples: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'GitHub']
      },
      emails: {
        icon: '📧',
        description: 'Encontrar direcciones de correo electrónico',
        examples: ['Gmail', 'Outlook', 'Yahoo', 'Documentos PDF', 'Pastebin']
      },
      websites: {
        icon: '🌐',
        description: 'Analizar sitios web y encontrar información específica',
        examples: ['Paneles admin', 'Archivos sensibles', 'Subdominios']
      },
      documents: {
        icon: '📄',
        description: 'Localizar documentos y archivos específicos',
        examples: ['PDF', 'DOC', 'XLS', 'PPT', 'TXT']
      },
      images: {
        icon: '🖼️',
        description: 'Buscar imágenes por formato, tamaño y contenido',
        examples: ['JPG', 'PNG', 'GIF', 'Flickr', 'Pinterest']
      },
      videos: {
        icon: '🎥',
        description: 'Encontrar videos por formato y plataforma',
        examples: ['MP4', 'AVI', 'YouTube', 'Vimeo', 'Twitch']
      },
      social: {
        icon: '📱',
        description: 'Búsquedas específicas en redes sociales',
        examples: ['Facebook', 'Twitter', 'Instagram', 'TikTok']
      },
      multimedia_platforms: {
        icon: '🎨',
        description: 'Plataformas de contenido multimedia y creativo',
        examples: ['YouTube', 'Instagram', 'Pinterest', 'DeviantArt']
      },
      phones: {
        icon: '📞',
        description: 'Buscar números telefónicos y directorios de contactos',
        examples: ['WhitePages', 'TrueCaller', 'YellowPages', 'Directorios']
      },
      cryptocurrency: {
        icon: '₿',
        description: 'Buscar wallets, direcciones y transacciones de criptomonedas',
        examples: ['Bitcoin', 'Ethereum', 'Blockchain.info', 'Etherscan']
      },
      iot_devices: {
        icon: '📷',
        description: 'Buscar dispositivos IoT, cámaras y equipos conectados',
        examples: ['Cámaras IP', 'Routers', 'Shodan', 'Dispositivos Smart']
      }
    }
    return typeInfo[targetType] || typeInfo.usernames
  }

  return (
    <div className="dork-generator">
      <div className="dork-generator__container">
        {/* Columna izquierda - Instrucciones y guía */}
        <div className="dork-generator__guide">
          <div className="guide-section">
            <div className="guide-header">
              <BookOpen className="guide-icon" size={24} />
              <h2>Generador de Dorks OSINT</h2>
            </div>
            
            <div className="guide-content">
              <div className="guide-item">
                <h3>¿Qué son los Google Dorks?</h3>
                <p>
                  Los Google Dorks son consultas de búsqueda avanzadas que utilizan operadores especiales
                  para encontrar información específica en motores de búsqueda. Esta herramienta genera
                  automáticamente múltiples dorks basados en plantillas predefinidas para investigaciones OSINT.
                </p>
              </div>

              <div className="guide-item">
                <h3>Cómo Funciona</h3>
                <p>
                  El generador utiliza plantillas de dorks específicas para cada tipo de búsqueda y motor.
                  Simplemente ingresa tu término de búsqueda y selecciona las opciones deseadas.
                  La herramienta creará automáticamente múltiples consultas optimizadas.
                </p>
              </div>

              <div className="guide-item">
                <h3>Tipos de Búsqueda Disponibles</h3>
                <ul>
                  <li><strong>Nombres de usuario:</strong> Busca perfiles en redes sociales (Facebook, Twitter, LinkedIn, Instagram, GitHub, Reddit, etc.)</li>
                  <li><strong>Emails:</strong> Encuentra direcciones de correo en documentos, Pastebin, GitHub, breaches y proveedores populares</li>
                  <li><strong>Sitios web:</strong> Analiza dominios, encuentra archivos sensibles, paneles de administración y información técnica</li>
                  <li><strong>Documentos:</strong> Localiza archivos PDF, DOC, XLS, PPT, XML, JSON, EPUB y configuraciones</li>
                  <li><strong>Imágenes:</strong> Busca imágenes por formato (JPG, PNG, GIF), tamaño, tipo y plataformas como Flickr, Pinterest, Imgur</li>
                  <li><strong>Videos:</strong> Encuentra videos por formato (MP4, AVI, MOV), duración y plataformas como YouTube, Vimeo, Twitch</li>
                  <li><strong>Redes Sociales:</strong> Búsquedas ampliadas en Facebook, Twitter, Discord, Telegram, Reddit, Mastodon y más</li>
                  <li><strong>Plataformas Multimedia:</strong> Búsquedas especializadas en YouTube, Instagram, TikTok, SoundCloud y otras plataformas de contenido</li>
                  <li><strong>Números Telefónicos:</strong> Busca teléfonos en directorios, WhitePages, TrueCaller y archivos de contactos</li>
                  <li><strong>Criptomonedas:</strong> Encuentra wallets, direcciones Bitcoin/Ethereum, exchanges y transacciones crypto</li>
                  <li><strong>Dispositivos IoT:</strong> Localiza cámaras IP, routers, dispositivos inteligentes y equipos conectados</li>
                </ul>
              </div>

              <div className="guide-item">
                <h3>Motores de Búsqueda Soportados</h3>
                <ul>
                  <li><strong>Google:</strong> El más completo, ideal para búsquedas generales</li>
                  <li><strong>Yandex:</strong> Excelente para contenido en ruso y Europa del Este</li>
                  <li><strong>Bing:</strong> Alternativa de Microsoft, buenos resultados únicos</li>
                  <li><strong>DuckDuckGo:</strong> Búsquedas privadas sin seguimiento del usuario</li>
                </ul>
              </div>

              <div className="guide-item">
                <h3>Funciones Avanzadas</h3>
                <ul>
                  <li><strong>Términos a incluir:</strong> Palabras que DEBEN aparecer en todos los resultados</li>
                  <li><strong>Términos a excluir:</strong> Palabras que NO deben aparecer en los resultados</li>
                  <li><strong>Filtros de fecha:</strong> Limita resultados por período específico</li>
                  <li><strong>Acciones masivas:</strong> Abre todos los resultados en pestañas separadas o descarga como archivo de texto</li>
                </ul>
              </div>

              <div className="guide-item">
                <h3>Consejos para Mejores Resultados</h3>
                <ul>
                  <li>Usa términos específicos y únicos (nombres completos, dominios exactos)</li>
                  <li>Combina múltiples motores para cobertura completa</li>
                  <li>Prueba diferentes tipos de búsqueda para el mismo objetivo</li>
                  <li>Utiliza las opciones avanzadas para refinar resultados</li>
                  <li>Guarda los dorks más efectivos para investigaciones futuras</li>
                </ul>
              </div>

              <div className="guide-item">
                <h3>Ejemplos de Uso</h3>
                <ul>
                  <li><strong>Investigar una persona:</strong> Usa "nombres de usuario" con el nombre completo</li>
                  <li><strong>Encontrar contactos:</strong> Usa "emails" con el nombre de la empresa o dominio</li>
                  <li><strong>Analizar un sitio web:</strong> Usa "sitios web" con el dominio objetivo</li>
                  <li><strong>Buscar imágenes específicas:</strong> Usa "imágenes" con términos descriptivos para encontrar fotos, logos o gráficos</li>
                  <li><strong>Localizar videos:</strong> Usa "videos" para encontrar contenido audiovisual, tutoriales o documentales</li>
                  <li><strong>Investigar en plataformas multimedia:</strong> Usa "plataformas multimedia" para búsquedas dirigidas en redes sociales visuales</li>
                  <li><strong>Encontrar documentos sensibles:</strong> Usa "documentos" para localizar PDFs, presentaciones, configuraciones XML/JSON</li>
                  <li><strong>Buscar números telefónicos:</strong> Usa "números telefónicos" para encontrar contactos en directorios y bases de datos</li>
                  <li><strong>Investigar actividad crypto:</strong> Usa "criptomonedas" para rastrear wallets, transacciones y actividad blockchain</li>
                  <li><strong>Encontrar dispositivos IoT:</strong> Usa "dispositivos IoT" para localizar cámaras, routers y equipos conectados expuestos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario y resultados */}
        <div className="dork-generator__form">
          <div className="form-section">
            <h2>Configurar búsqueda</h2>
            
            {error && (
              <div className="error-message">
                <Info size={16} />
                {error}
              </div>
            )}

            {/* Término de búsqueda principal */}
            <div className="form-group">
              <label htmlFor="query">Término de búsqueda *</label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Ej: john.doe, empresa.com, usuario123"
                className="form-input"
                disabled={loading}
              />
              
              {/* Sugerencias inteligentes */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="smart-suggestions">
                  <div className="suggestions-header">
                    <span>🧠 Sugerencias inteligentes:</span>
                    <button 
                      className="close-suggestions"
                      onClick={() => setShowSuggestions(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="suggestions-list">
                    {suggestions.map((suggestion, index) => {
                      const typeInfo = targetTypes.find(t => t.id === suggestion.type)
                      return (
                        <button
                          key={index}
                          className="suggestion-item"
                          onClick={() => applySuggestion(suggestion.type)}
                        >
                          <span className="suggestion-type">{typeInfo?.name}</span>
                          <span className="suggestion-reason">{suggestion.reason}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tipo de objetivo */}
            <div className="form-group">
              <label htmlFor="targetType">Tipo de búsqueda</label>
              <select
                id="targetType"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                {targetTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>

              {/* Información del tipo de búsqueda seleccionado */}
              <div className="search-type-info">
                <div className="search-type-header">
                  <span className="search-type-icon">{getSearchTypeInfo().icon}</span>
                  <span className="search-type-description">{getSearchTypeInfo().description}</span>
                </div>
                <div className="search-type-examples">
                  <strong>Ejemplos:</strong> {getSearchTypeInfo().examples.join(', ')}
                </div>
              </div>
            </div>

            {/* Motores de búsqueda */}
            <div className="form-group">
              <label>Motores de búsqueda</label>
              <div className="checkbox-group">
                {searchEngines.map(engine => (
                  <label key={engine.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedEngines.includes(engine.id)}
                      onChange={() => handleEngineChange(engine.id)}
                      disabled={loading}
                    />
                    <span className="checkbox-label">{engine.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Opciones avanzadas */}
            <div className="form-group">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="advanced-toggle"
                disabled={loading}
              >
                <Settings size={16} />
                Opciones avanzadas
                {showAdvanced ? ' ▼' : ' ▶'}
              </button>
            </div>

            {showAdvanced && (
              <div className="advanced-options">
                {/* Términos a incluir */}
                <div className="form-group">
                  <label>Términos adicionales a incluir</label>
                  <div className="term-input">
                    <input
                      type="text"
                      value={includeInput}
                      onChange={(e) => setIncludeInput(e.target.value)}
                      placeholder="Término adicional"
                      className="form-input"
                      onKeyPress={(e) => e.key === 'Enter' && addIncludeTerm()}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={addIncludeTerm}
                      className="add-term-btn"
                      disabled={loading}
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="terms-list">
                    {includeTerms.map(term => (
                      <span key={term} className="term-tag include">
                        {term}
                        <button onClick={() => removeTerm(term, 'include')}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Términos a excluir */}
                <div className="form-group">
                  <label>Términos a excluir</label>
                  <div className="term-input">
                    <input
                      type="text"
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      placeholder="Término a excluir"
                      className="form-input"
                      onKeyPress={(e) => e.key === 'Enter' && addExcludeTerm()}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={addExcludeTerm}
                      className="add-term-btn"
                      disabled={loading}
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="terms-list">
                    {excludeTerms.map(term => (
                      <span key={term} className="term-tag exclude">
                        {term}
                        <button onClick={() => removeTerm(term, 'exclude')}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Filtros de fecha */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dateAfter">Después de</label>
                    <input
                      id="dateAfter"
                      type="date"
                      value={dateAfter}
                      onChange={(e) => setDateAfter(e.target.value)}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateBefore">Antes de</label>
                    <input
                      id="dateBefore"
                      type="date"
                      value={dateBefore}
                      onChange={(e) => setDateBefore(e.target.value)}
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Opciones específicas para imágenes */}
                {(targetType === 'images' || targetType === 'multimedia_platforms') && (
                  <div className="multimedia-options">
                    <h4>🖼️ Opciones para Imágenes</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="imageSize">Tamaño de imagen</label>
                        <select
                          id="imageSize"
                          value={imageSize}
                          onChange={(e) => setImageSize(e.target.value)}
                          className="form-input"
                          disabled={loading}
                        >
                          <option value="">Cualquier tamaño</option>
                          <option value="large">Grande (&gt;2MP)</option>
                          <option value="medium">Mediano (0.3-2MP)</option>
                          <option value="small">Pequeño (&lt;0.3MP)</option>
                          <option value="1920x1080">1920x1080 (Full HD)</option>
                          <option value="1280x720">1280x720 (HD)</option>
                          <option value="800x600">800x600</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="imageType">Tipo de imagen</label>
                        <select
                          id="imageType"
                          value={imageType}
                          onChange={(e) => setImageType(e.target.value)}
                          className="form-input"
                          disabled={loading}
                        >
                          <option value="">Cualquier tipo</option>
                          <option value="photo">Fotografía</option>
                          <option value="clipart">Clipart</option>
                          <option value="lineart">Arte lineal</option>
                          <option value="face">Rostros</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="imageColor">Color predominante</label>
                      <select
                        id="imageColor"
                        value={imageColor}
                        onChange={(e) => setImageColor(e.target.value)}
                        className="form-input"
                        disabled={loading}
                      >
                        <option value="">Cualquier color</option>
                        <option value="red">Rojo</option>
                        <option value="blue">Azul</option>
                        <option value="green">Verde</option>
                        <option value="yellow">Amarillo</option>
                        <option value="orange">Naranja</option>
                        <option value="purple">Púrpura</option>
                        <option value="pink">Rosa</option>
                        <option value="white">Blanco</option>
                        <option value="black">Negro</option>
                        <option value="gray">Gris</option>
                        <option value="brown">Marrón</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Opciones específicas para videos */}
                {(targetType === 'videos' || targetType === 'multimedia_platforms') && (
                  <div className="multimedia-options">
                    <h4>🎥 Opciones para Videos</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="videoFormat">Formato de video</label>
                        <select
                          id="videoFormat"
                          value={videoFormat}
                          onChange={(e) => setVideoFormat(e.target.value)}
                          className="form-input"
                          disabled={loading}
                        >
                          <option value="">Cualquier formato</option>
                          <option value="mp4">MP4</option>
                          <option value="avi">AVI</option>
                          <option value="mov">MOV</option>
                          <option value="wmv">WMV</option>
                          <option value="flv">FLV</option>
                          <option value="webm">WebM</option>
                          <option value="mkv">MKV</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="videoDuration">Duración</label>
                        <select
                          id="videoDuration"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          className="form-input"
                          disabled={loading}
                        >
                          <option value="">Cualquier duración</option>
                          <option value="short">Corto (&lt; 4 min)</option>
                          <option value="medium">Mediano (4-20 min)</option>
                          <option value="long">Largo (&gt; 20 min)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="videoQuality">Calidad de video</label>
                      <select
                        id="videoQuality"
                        value={videoQuality}
                        onChange={(e) => setVideoQuality(e.target.value)}
                        className="form-input"
                        disabled={loading}
                      >
                        <option value="">Cualquier calidad</option>
                        <option value="high">Alta calidad</option>
                        <option value="standard">Calidad estándar</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Encadenamiento de tipos */}
                <div className="form-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={enableChaining}
                      onChange={(e) => {
                        setEnableChaining(e.target.checked)
                        if (!e.target.checked) {
                          setChainedTypes([])
                        }
                      }}
                      disabled={loading}
                    />
                    <span className="checkbox-label">Habilitar encadenamiento de tipos de búsqueda</span>
                  </label>
                  <p className="help-text">Combina múltiples tipos de búsqueda para obtener resultados más completos</p>
                </div>

                {enableChaining && (
                  <div className="form-group">
                    <label>Tipos adicionales a incluir</label>
                    <div className="checkbox-grid">
                      {targetTypes
                        .filter(type => type.id !== targetType)
                        .map(type => (
                          <label key={type.id} className="checkbox-item small">
                            <input
                              type="checkbox"
                              checked={chainedTypes.includes(type.id)}
                              onChange={() => handleChainedTypeChange(type.id)}
                              disabled={loading}
                            />
                            <span className="checkbox-label">{type.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón generar */}
            <button
              onClick={generateDorks}
              disabled={loading || !query.trim() || selectedEngines.length === 0}
              className="generate-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="spinning" size={16} />
                  Generando...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Generar Dorks
                </>
              )}
            </button>
          </div>

          {/* Resultados */}
          {results && (
            <div className="results-section">
              <div className="results-header">
                <h3>Dorks generados ({results.dorks?.length || 0})</h3>

                {results.dorks && results.dorks.length > 0 && (
                  <div className="results-actions">
                    <button
                      onClick={openAllTabs}
                      className="action-btn secondary"
                      title="Abrir todas las búsquedas en pestañas separadas"
                    >
                      <Globe size={16} />
                      Abrir Todo ({results.dorks.filter(d => d.url).length} pestañas)
                    </button>

                    <div className="download-options">
                      <button
                        onClick={() => downloadDorks('txt')}
                        className="action-btn primary"
                        title="Descargar como archivo de texto"
                      >
                        <Download size={16} />
                        TXT
                      </button>
                      <button
                        onClick={() => downloadDorks('csv')}
                        className="action-btn secondary"
                        title="Descargar como CSV para Excel"
                      >
                        <Download size={16} />
                        CSV
                      </button>
                      <button
                        onClick={() => downloadDorks('json')}
                        className="action-btn secondary"
                        title="Descargar como JSON estructurado"
                      >
                        <Download size={16} />
                        JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {results.dorks && results.dorks.length > 0 ? (
                <div className="results-list">
                  {results.dorks.map((dork, index) => (
                    <div key={index} className="result-item">
                      <div className="result-header">
                        <span className="result-engine">{dork.engine}</span>
                        <span className="result-type">{dork.type}</span>
                      </div>
                      
                      <div className="result-query">
                        <code>{dork.query}</code>
                      </div>
                      
                      <div className="result-actions">
                        <button
                          onClick={() => copyToClipboard(dork.query, `${index}-query`)}
                          className="action-btn"
                          title="Copiar query"
                        >
                          <Copy size={14} />
                          {copiedItems.has(`${index}-query`) ? 'Copiado!' : 'Copiar'}
                        </button>
                        
                        {dork.url && (
                          <button
                            onClick={() => openInNewTab(dork.url)}
                            className="action-btn primary"
                            title="Abrir en nueva pestaña"
                          >
                            <ExternalLink size={14} />
                            Buscar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No se generaron dorks con los parámetros especificados.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DorkGenerator