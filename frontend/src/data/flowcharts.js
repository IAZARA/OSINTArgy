// Datos de flowcharts OSINT traducidos al español
// Basados en IntelTechniques.com OSINT Workflow Charts

export const flowchartsData = {
  domain: {
    id: 'domain',
    title: 'Dominio',
    description: 'Flujo completo para investigar un nombre de dominio',
    icon: '🌐',
    color: '#4A90E2',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Nombre de Dominio',
        x: 100,
        y: 50,
        description: 'Punto de partida: el dominio a investigar'
      },
      {
        id: 'live_website',
        type: 'process',
        label: 'Sitio Web Activo',
        x: 400,
        y: 50,
        description: 'Verificar si el sitio web está activo y accesible',
        tools: ['Navegador web', 'Ping', 'Nslookup']
      },
      {
        id: 'search_engines',
        type: 'process',
        label: 'Motores de Búsqueda',
        x: 400,
        y: 150,
        description: 'Buscar el dominio en diferentes motores de búsqueda',
        tools: ['Google', 'Bing', 'Yandex']
      },
      {
        id: 'cached',
        type: 'process',
        label: 'Versiones en Caché',
        x: 600,
        y: 200,
        description: 'Buscar versiones guardadas del sitio web',
        tools: ['Wayback Machine', 'Google Cache', 'Archive.today']
      },
      {
        id: 'site_search',
        type: 'process',
        label: 'Búsqueda site:',
        x: 600,
        y: 300,
        description: 'Usar operador site: para encontrar páginas indexadas',
        tools: ['Google Dorks', 'OSINTArgy Dork Generator'],
        internal_tool: '/dorks'
      },
      {
        id: 'intel_domain_tool',
        type: 'process',
        label: 'Herramienta de Dominio',
        x: 400,
        y: 350,
        description: 'Usar herramientas especializadas de análisis de dominio',
        tools: ['IntelTechniques Domain Tool', 'DomainTools', 'SecurityTrails']
      },
      {
        id: 'whois_data',
        type: 'data',
        label: 'Datos WHOIS',
        x: 800,
        y: 400,
        description: 'Información de registro del dominio',
        tools: ['Whoisology', 'Who.is', 'WhoisInfo', 'ViewDNS', 'WhoisMind']
      },
      {
        id: 'real_name',
        type: 'result',
        label: 'Nombre Real',
        x: 600,
        y: 600,
        description: 'Nombre real del propietario del dominio'
      },
      {
        id: 'email_address',
        type: 'result',
        label: 'Dirección de Email',
        x: 700,
        y: 700,
        description: 'Emails asociados al dominio',
        internal_tool: '/email-osint'
      },
      {
        id: 'documents',
        type: 'result',
        label: 'Documentos',
        x: 500,
        y: 700,
        description: 'Documentos encontrados en el dominio',
        internal_tool: '/file-analysis'
      },
      {
        id: 'ip_address',
        type: 'result',
        label: 'Dirección IP',
        x: 800,
        y: 600,
        description: 'Direcciones IP asociadas al dominio'
      },
      {
        id: 'social_networks',
        type: 'result',
        label: 'Redes Sociales',
        x: 900,
        y: 800,
        description: 'Perfiles en redes sociales asociados'
      },
      {
        id: 'analytics',
        type: 'process',
        label: 'Analytics',
        x: 150,
        y: 200,
        description: 'Análisis de tráfico y estadísticas del sitio',
        tools: ['SpyOnWeb', 'DomainCrawler', 'AnalyzeID', 'NerdyData', 'PubDB']
      },
      {
        id: 'new_domains',
        type: 'result',
        label: 'Nuevos Dominios',
        x: 200,
        y: 800,
        description: 'Dominios relacionados o similares'
      },
      {
        id: 'subdomains',
        type: 'result',
        label: 'Subdominios',
        x: 100,
        y: 900,
        description: 'Subdominios del dominio principal'
      }
    ],
    connections: [
      { from: 'start', to: 'live_website' },
      { from: 'live_website', to: 'search_engines' },
      { from: 'live_website', to: 'cached' },
      { from: 'live_website', to: 'site_search' },
      { from: 'start', to: 'intel_domain_tool' },
      { from: 'intel_domain_tool', to: 'whois_data' },
      { from: 'whois_data', to: 'real_name' },
      { from: 'whois_data', to: 'email_address' },
      { from: 'whois_data', to: 'documents' },
      { from: 'whois_data', to: 'ip_address' },
      { from: 'whois_data', to: 'social_networks' },
      { from: 'start', to: 'analytics' },
      { from: 'analytics', to: 'new_domains' },
      { from: 'new_domains', to: 'subdomains' }
    ]
  },

  email: {
    id: 'email',
    title: 'Email',
    description: 'Flujo para investigar una dirección de correo electrónico',
    icon: '📧',
    color: '#E74C3C',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Dirección de Email',
        x: 100,
        y: 50,
        description: 'Punto de partida: el email a investigar'
      },
      {
        id: 'verify_address',
        type: 'process',
        label: 'Verificar Dirección',
        x: 100,
        y: 200,
        description: 'Verificar si la dirección de email es válida',
        tools: ['Hunter.io', 'Email Hippo', 'OSINTArgy Email OSINT'],
        internal_tool: '/email-osint'
      },
      {
        id: 'remove_domain',
        type: 'process',
        label: 'Extraer Username',
        x: 400,
        y: 100,
        description: 'Remover el dominio y buscar solo el username',
        example: 'mikeb55@yahoo.com → mikeb55'
      },
      {
        id: 'facebook_search',
        type: 'process',
        label: 'Búsqueda en Facebook',
        x: 400,
        y: 200,
        description: 'Buscar el email en Facebook',
        tools: ['Facebook Search', 'Facebook Password Reset']
      },
      {
        id: 'document_search',
        type: 'process',
        label: 'Búsqueda de Documentos',
        x: 400,
        y: 250,
        description: 'Buscar documentos que contengan el email',
        tools: ['Google Dorks', 'Document Search']
      },
      {
        id: 'pipl_api',
        type: 'process',
        label: 'PIPL API',
        x: 400,
        y: 300,
        description: 'Usar PIPL para buscar información asociada',
        tools: ['PIPL', "That's Them", 'ReverseMails', 'Gravatar']
      },
      {
        id: 'intel_email_tool',
        type: 'process',
        label: 'Herramienta de Email',
        x: 400,
        y: 350,
        description: 'Herramientas especializadas de búsqueda de email',
        tools: ['IntelTechniques Email Tool', 'EmailRep']
      },
      {
        id: 'search_engines',
        type: 'process',
        label: 'Motores de Búsqueda',
        x: 100,
        y: 350,
        description: 'Buscar el email en motores de búsqueda',
        tools: ['Google', 'Yandex', 'Bing']
      },
      {
        id: 'compromised_data',
        type: 'process',
        label: 'Datos Comprometidos',
        x: 250,
        y: 450,
        description: 'Buscar en bases de datos de filtraciones',
        tools: ['HIBP', 'Hacked-Emails', 'Dehashed']
      },
      {
        id: 'username',
        type: 'result',
        label: 'Nombre de Usuario',
        x: 700,
        y: 100,
        description: 'Username extraído del email',
        internal_tool: '/username-osint'
      },
      {
        id: 'employer',
        type: 'result',
        label: 'Empleador',
        x: 700,
        y: 200,
        description: 'Información laboral asociada'
      },
      {
        id: 'real_name',
        type: 'result',
        label: 'Nombre Real',
        x: 700,
        y: 300,
        description: 'Nombre real de la persona'
      },
      {
        id: 'social_networks',
        type: 'result',
        label: 'Redes Sociales',
        x: 600,
        y: 800,
        description: 'Perfiles en redes sociales'
      },
      {
        id: 'websites_blogs',
        type: 'result',
        label: 'Sitios Web / Blogs',
        x: 300,
        y: 700,
        description: 'Sitios web y blogs asociados'
      }
    ],
    connections: [
      { from: 'start', to: 'verify_address' },
      { from: 'start', to: 'remove_domain' },
      { from: 'start', to: 'facebook_search' },
      { from: 'start', to: 'document_search' },
      { from: 'start', to: 'pipl_api' },
      { from: 'start', to: 'intel_email_tool' },
      { from: 'verify_address', to: 'search_engines' },
      { from: 'verify_address', to: 'compromised_data' },
      { from: 'remove_domain', to: 'username' },
      { from: 'facebook_search', to: 'employer' },
      { from: 'facebook_search', to: 'real_name' },
      { from: 'pipl_api', to: 'real_name' },
      { from: 'intel_email_tool', to: 'social_networks' },
      { from: 'search_engines', to: 'websites_blogs' },
      { from: 'compromised_data', to: 'social_networks' },
      { from: 'websites_blogs', to: 'social_networks' }
    ]
  },

  location: {
    id: 'location',
    title: 'Ubicación',
    description: 'Flujo para investigar una ubicación geográfica',
    icon: '📍',
    color: '#27AE60',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Ubicación',
        x: 100,
        y: 50,
        description: 'Punto de partida: ubicación a investigar'
      },
      {
        id: 'gps_coordinates',
        type: 'process',
        label: 'Coordenadas GPS',
        x: 300,
        y: 50,
        description: 'Obtener coordenadas GPS exactas',
        tools: ['GPS Coordinates', 'What3Words', 'Plus Codes']
      },
      {
        id: 'physical_address',
        type: 'process',
        label: 'Dirección Física',
        x: 100,
        y: 250,
        description: 'Dirección postal completa'
      },
      {
        id: 'search_engines',
        type: 'process',
        label: 'Motores de Búsqueda',
        x: 250,
        y: 300,
        description: 'Buscar la dirección en motores de búsqueda',
        tools: ['Google', 'Bing', 'Yandex']
      },
      {
        id: 'google_earth',
        type: 'process',
        label: 'Google Earth App',
        x: 100,
        y: 400,
        description: 'Usar Google Earth para vista satelital',
        tools: ['Google Earth', 'Google Earth Pro']
      },
      {
        id: 'satellite_view',
        type: 'process',
        label: 'Vista Satelital',
        x: 250,
        y: 500,
        description: 'Imágenes satelitales e históricas',
        tools: ['LandViewer', 'TerraServer', 'Zoom Earth']
      },
      {
        id: 'street_view',
        type: 'process',
        label: 'Vista de Calle',
        x: 450,
        y: 400,
        description: 'Imágenes a nivel de calle',
        tools: ['Google Maps', 'Bing Maps', 'Yandex Maps', 'Mapillary']
      },
      {
        id: 'intel_maps_tool',
        type: 'process',
        label: 'Herramienta de Mapas',
        x: 300,
        y: 150,
        description: 'Herramientas especializadas de mapas',
        tools: ['IntelTechniques Custom Maps Tool']
      },
      {
        id: 'people_search',
        type: 'process',
        label: 'Búsqueda de Personas',
        x: 100,
        y: 600,
        description: 'Buscar personas en esa ubicación',
        tools: ['PIPL', 'Nuwber', "That's Them", 'FastPeople']
      },
      {
        id: 'real_name',
        type: 'result',
        label: 'Nombre Real',
        x: 400,
        y: 800,
        description: 'Nombres de personas en la ubicación'
      },
      {
        id: 'telephone',
        type: 'result',
        label: 'Teléfono',
        x: 200,
        y: 800,
        description: 'Números de teléfono asociados'
      },
      {
        id: 'social_networks',
        type: 'result',
        label: 'Redes Sociales',
        x: 700,
        y: 800,
        description: 'Perfiles geolocalizados'
      },
      {
        id: 'interior_images',
        type: 'result',
        label: 'Imágenes Interiores',
        x: 600,
        y: 700,
        description: 'Fotos del interior de edificios'
      },
      {
        id: 'username',
        type: 'result',
        label: 'Nombre de Usuario',
        x: 800,
        y: 700,
        description: 'Usernames de personas en la zona'
      }
    ],
    connections: [
      { from: 'start', to: 'gps_coordinates' },
      { from: 'start', to: 'physical_address' },
      { from: 'start', to: 'intel_maps_tool' },
      { from: 'gps_coordinates', to: 'intel_maps_tool' },
      { from: 'physical_address', to: 'search_engines' },
      { from: 'physical_address', to: 'google_earth' },
      { from: 'google_earth', to: 'satellite_view' },
      { from: 'search_engines', to: 'street_view' },
      { from: 'intel_maps_tool', to: 'satellite_view' },
      { from: 'intel_maps_tool', to: 'street_view' },
      { from: 'physical_address', to: 'people_search' },
      { from: 'people_search', to: 'telephone' },
      { from: 'people_search', to: 'real_name' },
      { from: 'street_view', to: 'interior_images' },
      { from: 'street_view', to: 'username' },
      { from: 'street_view', to: 'social_networks' },
      { from: 'satellite_view', to: 'social_networks' }
    ]
  },

  realname: {
    id: 'realname',
    title: 'Nombre Real',
    description: 'Flujo para investigar una persona por su nombre real',
    icon: '👤',
    color: '#9B59B6',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Nombre Real',
        x: 150,
        y: 50,
        description: 'Punto de partida: nombre completo de la persona'
      },
      {
        id: 'twitter',
        type: 'process',
        label: 'Twitter',
        x: 400,
        y: 50,
        description: 'Buscar perfiles de Twitter',
        tools: ['Twitter Search', 'Twitter Advanced Search']
      },
      {
        id: 'facebook',
        type: 'process',
        label: 'Facebook',
        x: 400,
        y: 120,
        description: 'Buscar perfiles de Facebook',
        tools: ['Facebook Search', 'Facebook Graph Search']
      },
      {
        id: 'people_search',
        type: 'process',
        label: 'Motores de Búsqueda de Personas',
        x: 150,
        y: 200,
        description: 'Buscadores especializados en personas',
        tools: ['PIPL', "That's Them", 'AdvCheck', 'FastPeople', 'TruePeople', 'FamilyTreeNow', 'Intelius', 'Spokeo']
      },
      {
        id: 'search_engines',
        type: 'process',
        label: 'Motores de Búsqueda',
        x: 400,
        y: 200,
        description: 'Búsqueda general en motores',
        tools: ['Google', 'Bing', 'Yandex']
      },
      {
        id: 'facebook_profile',
        type: 'result',
        label: 'Perfil de Facebook',
        x: 600,
        y: 250,
        description: 'Perfil encontrado en Facebook'
      },
      {
        id: 'username',
        type: 'result',
        label: 'Nombre de Usuario',
        x: 500,
        y: 350,
        description: 'Username usado en plataformas',
        internal_tool: '/username-osint'
      },
      {
        id: 'user_number',
        type: 'result',
        label: 'Número de Usuario',
        x: 650,
        y: 350,
        description: 'ID numérico de usuario'
      },
      {
        id: 'fb_custom_tools',
        type: 'process',
        label: 'Herramientas FB',
        x: 600,
        y: 450,
        description: 'Herramientas personalizadas de Facebook',
        tools: ['FB Custom Tools', 'Social Searcher']
      },
      {
        id: 'address',
        type: 'result',
        label: 'Dirección',
        x: 250,
        y: 750,
        description: 'Dirección física de la persona'
      },
      {
        id: 'phone',
        type: 'result',
        label: 'Teléfono',
        x: 400,
        y: 750,
        description: 'Número de teléfono'
      },
      {
        id: 'resumes',
        type: 'result',
        label: 'CVs',
        x: 200,
        y: 650,
        description: 'Currículos y hojas de vida'
      },
      {
        id: 'voter_records',
        type: 'result',
        label: 'Registros Electorales',
        x: 100,
        y: 850,
        description: 'Información de registro electoral'
      },
      {
        id: 'intel_name_tool',
        type: 'process',
        label: 'Herramienta de Nombres',
        x: 400,
        y: 950,
        description: 'Herramienta especializada de búsqueda de nombres',
        tools: ['IntelTechniques Name Search Tool']
      },
      {
        id: 'relatives',
        type: 'result',
        label: 'Familiares',
        x: 700,
        y: 950,
        description: 'Información de familiares'
      },
      {
        id: 'social_networks',
        type: 'result',
        label: 'Redes Sociales',
        x: 700,
        y: 750,
        description: 'Otros perfiles en redes sociales'
      }
    ],
    connections: [
      { from: 'start', to: 'twitter' },
      { from: 'start', to: 'facebook' },
      { from: 'start', to: 'people_search' },
      { from: 'start', to: 'search_engines' },
      { from: 'facebook', to: 'facebook_profile' },
      { from: 'facebook_profile', to: 'username' },
      { from: 'username', to: 'user_number' },
      { from: 'user_number', to: 'fb_custom_tools' },
      { from: 'people_search', to: 'resumes' },
      { from: 'people_search', to: 'address' },
      { from: 'search_engines', to: 'address' },
      { from: 'search_engines', to: 'phone' },
      { from: 'search_engines', to: 'username' },
      { from: 'address', to: 'voter_records' },
      { from: 'phone', to: 'intel_name_tool' },
      { from: 'address', to: 'intel_name_tool' },
      { from: 'intel_name_tool', to: 'relatives' },
      { from: 'fb_custom_tools', to: 'social_networks' },
      { from: 'username', to: 'social_networks' }
    ]
  },

  telephone: {
    id: 'telephone',
    title: 'Teléfono',
    description: 'Flujo para investigar un número de teléfono',
    icon: '📞',
    color: '#F39C12',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Número de Teléfono',
        x: 150,
        y: 50,
        description: 'Punto de partida: número telefónico a investigar'
      },
      {
        id: 'facebook_search',
        type: 'process',
        label: 'Búsqueda en Facebook',
        x: 400,
        y: 50,
        description: 'Buscar el número en Facebook',
        tools: ['Facebook Search']
      },
      {
        id: 'reverse_caller_apis',
        type: 'process',
        label: 'APIs de Identificación',
        x: 150,
        y: 200,
        description: 'APIs de identificación de llamadas',
        tools: ['NextCaller', 'OpenCNAM', 'CallerIDService']
      },
      {
        id: 'reverse_search_sites',
        type: 'process',
        label: 'Sitios de Búsqueda Reversa',
        x: 300,
        y: 200,
        description: 'Sitios web de búsqueda reversa',
        tools: ['Twilio', 'OpenCNAM', 'WhoCalld', 'PrivacyStar']
      },
      {
        id: 'reverse_caller_sites',
        type: 'process',
        label: 'Sitios de Identificación',
        x: 400,
        y: 150,
        description: 'Sitios de identificación de llamadas'
      },
      {
        id: 'facebook_page',
        type: 'result',
        label: 'Página de Facebook',
        x: 600,
        y: 50,
        description: 'Página o perfil de Facebook asociado'
      },
      {
        id: 'nuwber',
        type: 'process',
        label: 'Nuwber',
        x: 350,
        y: 300,
        description: 'Búsqueda en base de datos Nuwber',
        tools: ['Nuwber', 'CallerIDTest']
      },
      {
        id: 'real_name',
        type: 'result',
        label: 'Nombre Real',
        x: 600,
        y: 400,
        description: 'Nombre real del propietario del número'
      },
      {
        id: 'contacts',
        type: 'result',
        label: 'Contactos',
        x: 450,
        y: 450,
        description: 'Lista de contactos asociados'
      },
      {
        id: 'android_emulator',
        type: 'process',
        label: 'Emulador Android',
        x: 100,
        y: 450,
        description: 'Usar emulador para apps móviles',
        tools: ['Android Emulator', 'BlueStacks']
      },
      {
        id: 'intel_number_tool',
        type: 'process',
        label: 'Herramienta de Números',
        x: 250,
        y: 500,
        description: 'Herramienta especializada de números',
        tools: ['IntelTechniques Number Search Tool']
      },
      {
        id: 'people_search_tools',
        type: 'process',
        label: 'Buscadores de Personas',
        x: 100,
        y: 600,
        description: 'Herramientas de búsqueda de personas',
        tools: ['FastPeopleSearch', 'TruePeopleSearch', 'PIPL', 'True Caller', "That's Them", 'Sync.me', 'WP Plus']
      },
      {
        id: 'google_custom',
        type: 'process',
        label: 'Google Personalizado',
        x: 400,
        y: 750,
        description: 'Búsquedas personalizadas en Google'
      },
      {
        id: 'mobile_apps',
        type: 'result',
        label: 'Apps Móviles',
        x: 600,
        y: 450,
        description: 'Aplicaciones móviles asociadas'
      },
      {
        id: 'find_friends',
        type: 'result',
        label: 'Buscar "Amigos"',
        x: 700,
        y: 550,
        description: 'Función de buscar amigos en apps'
      },
      {
        id: 'privacystar',
        type: 'result',
        label: 'PrivacyStar',
        x: 800,
        y: 650,
        description: 'Información de PrivacyStar'
      },
      {
        id: 'usernames',
        type: 'result',
        label: 'Nombres de Usuario',
        x: 800,
        y: 850,
        description: 'Usernames asociados al número',
        internal_tool: '/username-osint'
      },
      {
        id: 'name',
        type: 'result',
        label: 'Nombre',
        x: 200,
        y: 950,
        description: 'Nombre asociado al número'
      },
      {
        id: 'real_address',
        type: 'result',
        label: 'Dirección Real',
        x: 350,
        y: 950,
        description: 'Dirección física del propietario'
      },
      {
        id: 'business',
        type: 'result',
        label: 'Negocio',
        x: 500,
        y: 950,
        description: 'Información de negocio asociado'
      },
      {
        id: 'social_networks',
        type: 'result',
        label: 'Redes Sociales',
        x: 650,
        y: 950,
        description: 'Perfiles en redes sociales'
      },
      {
        id: 'relatives',
        type: 'result',
        label: 'Familiares',
        x: 800,
        y: 950,
        description: 'Información de familiares'
      }
    ],
    connections: [
      { from: 'start', to: 'facebook_search' },
      { from: 'start', to: 'reverse_caller_apis' },
      { from: 'start', to: 'reverse_search_sites' },
      { from: 'start', to: 'reverse_caller_sites' },
      { from: 'facebook_search', to: 'facebook_page' },
      { from: 'reverse_search_sites', to: 'nuwber' },
      { from: 'nuwber', to: 'real_name' },
      { from: 'reverse_caller_sites', to: 'real_name' },
      { from: 'reverse_caller_apis', to: 'android_emulator' },
      { from: 'android_emulator', to: 'contacts' },
      { from: 'android_emulator', to: 'intel_number_tool' },
      { from: 'contacts', to: 'mobile_apps' },
      { from: 'mobile_apps', to: 'find_friends' },
      { from: 'find_friends', to: 'privacystar' },
      { from: 'privacystar', to: 'usernames' },
      { from: 'reverse_caller_apis', to: 'people_search_tools' },
      { from: 'intel_number_tool', to: 'google_custom' },
      { from: 'people_search_tools', to: 'name' },
      { from: 'google_custom', to: 'real_address' },
      { from: 'google_custom', to: 'business' },
      { from: 'google_custom', to: 'social_networks' },
      { from: 'name', to: 'real_address' },
      { from: 'usernames', to: 'relatives' },
      { from: 'social_networks', to: 'relatives' }
    ]
  },

  username: {
    id: 'username',
    title: 'Username',
    description: 'Flujo para investigar un nombre de usuario',
    icon: '🔍',
    color: '#3498DB',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Nombre de Usuario',
        x: 150,
        y: 50,
        description: 'Punto de partida: username a investigar'
      },
      {
        id: 'potential_emails',
        type: 'process',
        label: 'Emails Potenciales',
        x: 400,
        y: 80,
        description: 'Generar posibles direcciones de email',
        example: 'username@gmail.com, username@yahoo.com, etc.'
      },
      {
        id: 'email_assumptions',
        type: 'process',
        label: 'Suposiciones de Email',
        x: 400,
        y: 150,
        description: 'Probar diferentes variaciones de email'
      },
      {
        id: 'search_engines',
        type: 'process',
        label: 'Motores de Búsqueda',
        x: 150,
        y: 200,
        description: 'Buscar el username en motores de búsqueda',
        tools: ['Google', 'Bing', 'Yandex']
      },
      {
        id: 'intel_username_tool',
        type: 'process',
        label: 'Herramienta de Username',
        x: 250,
        y: 350,
        description: 'Herramientas especializadas de username',
        tools: ['IntelTechniques Username Tool', 'OSINTArgy Username OSINT'],
        internal_tool: '/username-osint'
      },
      {
        id: 'username_search_tools',
        type: 'process',
        label: 'Buscadores de Username',
        x: 200,
        y: 450,
        description: 'Herramientas de búsqueda de usernames',
        tools: ['Knowem', 'CheckUsers', 'NameVine', 'UserSherlock', 'UserSearch', 'PeekYou']
      },
      {
        id: 'hibp_check',
        type: 'process',
        label: 'Have I Been Pwned',
        x: 400,
        y: 220,
        description: 'Verificar si el email fue comprometido',
        tools: ['HaveIBeenPwned', 'Hacked-Emails']
      },
      {
        id: 'api_searches',
        type: 'process',
        label: 'Búsquedas API',
        x: 400,
        y: 550,
        description: 'Búsquedas usando APIs',
        tools: ['PIPL', 'HIBP', 'Hacked-Emails', 'Full Contact']
      },
      {
        id: 'manual_attempts',
        type: 'process',
        label: 'Intentos Manuales',
        x: 600,
        y: 400,
        description: 'Búsqueda manual en plataformas',
        tools: ['Twitter', 'Instagram', 'Google+', 'Facebook', 'YouTube']
      },
      {
        id: 'email_address',
        type: 'result',
        label: 'Dirección de Email',
        x: 700,
        y: 300,
        description: 'Email válido encontrado',
        internal_tool: '/email-osint'
      },
      {
        id: 'social_networks',
        type: 'result',
        label: 'Redes Sociales',
        x: 400,
        y: 950,
        description: 'Perfiles encontrados en redes sociales'
      },
      {
        id: 'internet_archives',
        type: 'result',
        label: 'Archivos de Internet',
        x: 200,
        y: 850,
        description: 'Información en archivos históricos'
      }
    ],
    connections: [
      { from: 'start', to: 'potential_emails' },
      { from: 'start', to: 'search_engines' },
      { from: 'potential_emails', to: 'email_assumptions' },
      { from: 'email_assumptions', to: 'hibp_check' },
      { from: 'hibp_check', to: 'email_address' },
      { from: 'search_engines', to: 'intel_username_tool' },
      { from: 'intel_username_tool', to: 'username_search_tools' },
      { from: 'username_search_tools', to: 'api_searches' },
      { from: 'api_searches', to: 'social_networks' },
      { from: 'email_assumptions', to: 'manual_attempts' },
      { from: 'manual_attempts', to: 'email_address' },
      { from: 'manual_attempts', to: 'social_networks' },
      { from: 'username_search_tools', to: 'internet_archives' },
      { from: 'internet_archives', to: 'social_networks' }
    ]
  }
}

// Función helper para obtener un flowchart por ID
export const getFlowchartById = (id) => {
  return flowchartsData[id] || null
}

// Función helper para obtener todos los flowcharts
export const getAllFlowcharts = () => {
  return Object.values(flowchartsData)
}

// Función helper para obtener información básica de todos los flowcharts
export const getFlowchartsInfo = () => {
  return Object.values(flowchartsData).map(({ id, title, description, icon, color }) => ({
    id,
    title,
    description,
    icon,
    color
  }))
}