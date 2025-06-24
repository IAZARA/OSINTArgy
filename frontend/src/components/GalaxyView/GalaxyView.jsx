import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useFavorites } from '@hooks/useTools';
import './GalaxyView.css';

const GalaxyView = ({ tools = [], categories = [], onCategorySelect, selectedCategory, searchQuery = '' }) => {
  const canvasRef = useRef();
  const containerRef = useRef();
  const animationRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [targetCamera, setTargetCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [focusedConstellation, setFocusedConstellation] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [toolPreview, setToolPreview] = useState(null);
  
  // Estados para soporte móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [touches, setTouches] = useState([]);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPinchZooming, setIsPinchZooming] = useState(false);
  
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Funciones utilitarias para touch
  const getDistanceBetweenTouches = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenterBetweenTouches = useCallback((touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  const getTouchPosition = useCallback((touch, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, []);

  // Configuración de la galaxia con optimizaciones móviles
  const GALAXY_CONFIG = {
    centerX: 0,
    centerY: 0,
    maxRadius: 1000,
    constellationRadius: 300,
    starSize: { min: 2, max: 8 },
    colors: {
      primary: '#00D4FF',
      secondary: '#FFD700',
      accent: '#FF6B6B',
      nebula: '#9C27B0',
      energy: '#00FF88'
    },
    // Configuración específica para móviles
    mobile: {
      backgroundStars: 50,      // Menos estrellas de fondo
      maxStarsPerConstellation: 10, // Menos estrellas por constelación
      animationSpeed: 0.6,      // Animaciones más lentas
      enableNebulae: false,     // Sin nebulosas complejas
      touchThreshold: 10,       // Umbral para detectar movimiento
      doubleTapDelay: 300       // Tiempo para doble tap
    },
    desktop: {
      backgroundStars: 200,
      maxStarsPerConstellation: 15,
      animationSpeed: 1,
      enableNebulae: true,
      touchThreshold: 5,
      doubleTapDelay: 300
    }
  };

  // Generar posiciones de constelaciones en círculo
  const generateConstellations = useCallback(() => {
    const constellations = [];
    const angleStep = (2 * Math.PI) / categories.length;
    
    categories.forEach((category, index) => {
      const angle = index * angleStep;
      const distance = GALAXY_CONFIG.constellationRadius;
      
      const constellation = {
        id: category.id,
        name: category.name,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: category.color || GALAXY_CONFIG.colors.primary,
        stars: [],
        angle: angle,
        pulsing: false
      };

      // Generar estrellas (herramientas) para esta constelación
      const categoryTools = tools.filter(tool => tool.category === category.id);
      const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
      const starsCount = Math.min(categoryTools.length, config.maxStarsPerConstellation);
      
      categoryTools.slice(0, starsCount).forEach((tool, toolIndex) => {
        const starAngle = (toolIndex * 2 * Math.PI) / starsCount;
        const starDistance = 50 + (toolIndex % 3) * 25; // Distribución en anillos
        
        constellation.stars.push({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          url: tool.url,
          x: constellation.x + Math.cos(starAngle) * starDistance,
          y: constellation.y + Math.sin(starAngle) * starDistance,
          size: tool.rating ? (tool.rating / 5) * 4 + 2 : 4,
          brightness: isFavorite(tool.id) ? 1 : 0.7,
          isFavorite: user ? isFavorite(tool.id) : false,
          twinkle: Math.random(),
          category: category.id
        });
      });
      
      constellations.push(constellation);
    });
    
    return constellations;
  }, [categories, tools, user, isFavorite]);

  // Efecto para actualizar dimensiones y detectar móvil
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
        setIsMobile(window.innerWidth < 768);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Función para dibujar el fondo estrellado (optimizada para móvil)
  const drawStarField = useCallback((ctx, time) => {
    const { width, height } = dimensions;
    const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
    const speed = config.animationSpeed;
    
    // Crear campo de estrellas de fondo con cantidad adaptativa
    for (let i = 0; i < config.backgroundStars; i++) {
      const x = (Math.sin(i * 0.1 + time * 0.0001 * speed) * width * 2) % width;
      const y = (Math.cos(i * 0.15 + time * 0.0001 * speed) * height * 2) % height;
      const size = Math.sin(i + time * 0.001 * speed) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${size * (isMobile ? 0.2 : 0.3)})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dimensions, isMobile]);

  // Función para dibujar nebulosas (optimizada para móvil)
  const drawNebulae = useCallback((ctx, time) => {
    const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
    
    // Saltear nebulosas en móviles para mejor performance
    if (!config.enableNebulae) return;
    
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const speed = config.animationSpeed;
    
    // Crear gradientes de nebulosa
    for (let i = 0; i < 3; i++) {
      const x = centerX + Math.sin(time * 0.0005 * speed + i) * 200;
      const y = centerY + Math.cos(time * 0.0003 * speed + i) * 150;
      const radius = 150 + Math.sin(time * 0.001 * speed + i) * 50;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(156, 39, 176, ${0.1 + Math.sin(time * 0.002 * speed + i) * 0.05})`);
      gradient.addColorStop(0.5, `rgba(63, 81, 181, ${0.05 + Math.sin(time * 0.001 * speed + i) * 0.03})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [dimensions, isMobile]);

  // Función para dibujar constelaciones
  const drawConstellations = useCallback((ctx, constellations, time) => {
    const { width, height } = dimensions;
    const centerX = width / 2 + camera.x;
    const centerY = height / 2 + camera.y;
    
    constellations.forEach((constellation, index) => {
      let animatedX, animatedY;
      
      // Si esta constelación está enfocada, posicionarla al frente y detener rotación
      if (focusedConstellation && focusedConstellation === constellation.id) {
        // Posición fija al frente del centro
        animatedX = 0;
        animatedY = -150; // Ligeramente arriba del centro
      } else {
        // Animación de rotación normal para constelaciones no enfocadas (optimizada para móvil)
        const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
        const baseRotationSpeed = 0.00003 + (index * 0.000015);
        const rotationSpeed = baseRotationSpeed * config.animationSpeed;
        const rotationAngle = constellation.angle + (time * rotationSpeed);
        
        // Posición animada de la constelación (también optimizada)
        const distance = GALAXY_CONFIG.constellationRadius + Math.sin(time * 0.0003 * config.animationSpeed + index) * 20;
        animatedX = Math.cos(rotationAngle) * distance;
        animatedY = Math.sin(rotationAngle) * distance;
      }
      
      const consX = centerX + animatedX * camera.zoom;
      const consY = centerY + animatedY * camera.zoom;
      
      // Efecto pulsante para constelaciones seleccionadas o con hover (optimizado para móvil)
      const isActive = selectedCategory && selectedCategory.id === constellation.id;
      const isFocused = focusedConstellation === constellation.id;
      const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
      const pulseIntensity = isFocused ? 
        Math.sin(time * 0.003 * config.animationSpeed) * 0.4 + 1.0 : 
        isActive ? 
        Math.sin(time * 0.002 * config.animationSpeed) * 0.3 + 0.7 : 
        Math.sin(time * 0.001 * config.animationSpeed + index) * 0.1 + 0.9;
      
      // Dibujar aura de constelación con animación
      const baseAuraRadius = isFocused ? 120 * camera.zoom : 80 * camera.zoom;
      const auraRadius = baseAuraRadius * pulseIntensity;
      const auraGradient = ctx.createRadialGradient(consX, consY, 0, consX, consY, auraRadius);
      
      // Colores más intensos para constelaciones enfocadas y activas
      const auraAlpha = isFocused ? '60' : isActive ? '40' : '20';
      const auraAlphaOuter = isFocused ? '30' : isActive ? '20' : '10';
      
      auraGradient.addColorStop(0, `${constellation.color}${auraAlpha}`);
      auraGradient.addColorStop(0.7, `${constellation.color}${auraAlphaOuter}`);
      auraGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(consX, consY, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Efectos especiales para constelaciones enfocadas
      if (isFocused) {
        // Múltiples anillos de energía (más lentos)
        for (let ring = 1; ring <= 3; ring++) {
          const ringRadius = auraRadius * (0.4 + ring * 0.2);
          const ringAlpha = Math.sin(time * 0.0015 + ring) * 0.3 + 0.5; // Más lento
          ctx.strokeStyle = `${constellation.color}${Math.floor(ringAlpha * 100).toString(16)}`;
          ctx.lineWidth = 3 - ring;
          ctx.beginPath();
          ctx.arc(consX, consY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Destellos giratorios (más lentos)
        for (let i = 0; i < 6; i++) {
          const sparkAngle = time * 0.0008 + (i * Math.PI / 3); // Mucho más lento
          const sparkX = consX + Math.cos(sparkAngle) * auraRadius * 0.8;
          const sparkY = consY + Math.sin(sparkAngle) * auraRadius * 0.8;
          
          ctx.fillStyle = `${constellation.color}AA`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (isActive) {
        // Anillo de energía para constelaciones activas pero no enfocadas
        ctx.strokeStyle = `${constellation.color}60`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(consX, consY, auraRadius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Dibujar conexiones entre estrellas cercanas con animación
      const shouldShowConnections = isFocused || camera.zoom > 1.5;
      if (shouldShowConnections) {
        constellation.stars.forEach((star, i) => {
          constellation.stars.slice(i + 1).forEach(otherStar => {
            const distance = Math.sqrt(
              Math.pow(star.x - otherStar.x, 2) + 
              Math.pow(star.y - otherStar.y, 2)
            );
            
            if (distance < 80) {
              // Posiciones actualizadas con la rotación de la constelación
              const starX = centerX + (animatedX + (star.x - constellation.x)) * camera.zoom;
              const starY = centerY + (animatedY + (star.y - constellation.y)) * camera.zoom;
              const otherX = centerX + (animatedX + (otherStar.x - constellation.x)) * camera.zoom;
              const otherY = centerY + (animatedY + (otherStar.y - constellation.y)) * camera.zoom;
              
              // Líneas de conexión más visibles para constelaciones enfocadas (optimizado)
              const baseAlpha = isFocused ? 0.7 : 0.4;
              const connectionAlpha = Math.sin(time * 0.001 * config.animationSpeed + i) * 0.2 + baseAlpha;
              ctx.strokeStyle = `${constellation.color}${Math.floor(connectionAlpha * 100).toString(16)}`;
              ctx.lineWidth = isFocused ? 1.5 : (0.5 + (connectionAlpha * 0.5));
              ctx.beginPath();
              ctx.moveTo(starX, starY);
              ctx.lineTo(otherX, otherY);
              ctx.stroke();
            }
          });
        });
      }
      
      // Dibujar estrellas (herramientas) con posiciones animadas
      constellation.stars.forEach((star, starIndex) => {
        // Posición animada de la estrella siguiendo la rotación de la constelación
        const starX = centerX + (animatedX + (star.x - constellation.x)) * camera.zoom;
        const starY = centerY + (animatedY + (star.y - constellation.y)) * camera.zoom;
        const starSize = star.size * camera.zoom;
        
        // Efecto de parpadeo mejorado con variaciones (optimizado para móvil)
        const baseTwinkleSpeed = 0.003 + (starIndex * 0.0008);
        const twinkleSpeed = baseTwinkleSpeed * config.animationSpeed;
        const twinkle = Math.sin(time * twinkleSpeed + star.twinkle * Math.PI * 2) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        
        // Efecto de escala sutil para estrellas (optimizado)
        const scaleVariation = Math.sin(time * 0.002 * config.animationSpeed + starIndex) * 0.1 + 1;
        const animatedStarSize = starSize * scaleVariation;
        
        // Glow effect mejorado para estrellas favoritas
        if (star.isFavorite) {
          const glowRadius = animatedStarSize * 4;
          const glowGradient = ctx.createRadialGradient(starX, starY, 0, starX, starY, glowRadius);
          glowGradient.addColorStop(0, `${GALAXY_CONFIG.colors.secondary}80`);
          glowGradient.addColorStop(0.5, `${GALAXY_CONFIG.colors.secondary}40`);
          glowGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(starX, starY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Anillo orbital para favoritas
          ctx.strokeStyle = `${GALAXY_CONFIG.colors.secondary}60`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(starX, starY, animatedStarSize * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Aura sutil para todas las estrellas
        const starAuraRadius = animatedStarSize * 2.5;
        const starAuraGradient = ctx.createRadialGradient(starX, starY, 0, starX, starY, starAuraRadius);
        starAuraGradient.addColorStop(0, `${constellation.color}40`);
        starAuraGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = starAuraGradient;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(starX, starY, starAuraRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Dibujar estrella principal
        ctx.fillStyle = star.isFavorite ? 
          GALAXY_CONFIG.colors.secondary : 
          constellation.color;
        ctx.globalAlpha = alpha;
        
        ctx.beginPath();
        ctx.arc(starX, starY, animatedStarSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo brillante de la estrella
        ctx.fillStyle = 'white';
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(starX, starY, animatedStarSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        
        // Dibujar nombre con mejor estilo - siempre visible para constelaciones enfocadas
        const shouldShowName = isFocused || (camera.zoom > 2 && animatedStarSize > 3);
        if (shouldShowName) {
          const fontSize = isFocused ? 
            Math.max(12, 14 * Math.min(camera.zoom / 2, 1)) : 
            Math.max(8, 10 * Math.min(camera.zoom / 2, 1));
          
          ctx.fillStyle = isFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.9)';
          ctx.font = `${fontSize}px 'Segoe UI', system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = isFocused ? 3 : 2;
          ctx.strokeText(star.name, starX, starY + animatedStarSize + 20);
          ctx.fillText(star.name, starX, starY + animatedStarSize + 20);
        }
      });
      
      // Dibujar nombre de constelación con efectos mejorados
      if (camera.zoom < 3) {
        const fontSize = Math.max(12, 16 * Math.min(camera.zoom, 1));
        const textY = consY - 100 * camera.zoom;
        
        // Sombra del texto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(constellation.name, consX + 2, textY + 2);
        
        // Texto principal con brillo
        ctx.fillStyle = constellation.color;
        ctx.fillText(constellation.name, consX, textY);
        
        // Efecto de brillo para constelaciones activas
        if (isActive) {
          ctx.shadowColor = constellation.color;
          ctx.shadowBlur = 15;
          ctx.fillText(constellation.name, consX, textY);
          ctx.shadowBlur = 0;
        }
      }
    });
  }, [dimensions, camera, selectedCategory]);

  // Interpolación suave de cámara
  const interpolateCamera = useCallback(() => {
    const lerp = (start, end, factor) => start + (end - start) * factor;
    const lerpFactor = 0.08; // Velocidad de interpolación
    
    setCamera(prev => {
      const newX = lerp(prev.x, targetCamera.x, lerpFactor);
      const newY = lerp(prev.y, targetCamera.y, lerpFactor);
      const newZoom = lerp(prev.zoom, targetCamera.zoom, lerpFactor);
      
      // Detener navegación si estamos cerca del objetivo
      const deltaX = Math.abs(newX - targetCamera.x);
      const deltaY = Math.abs(newY - targetCamera.y);
      const deltaZoom = Math.abs(newZoom - targetCamera.zoom);
      
      if (deltaX < 1 && deltaY < 1 && deltaZoom < 0.01) {
        setIsNavigating(false);
      }
      
      return { x: newX, y: newY, zoom: newZoom };
    });
  }, [targetCamera]);

  // Loop de animación principal
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const time = Date.now();
    
    // Interpolar cámara suavemente
    if (isNavigating) {
      interpolateCamera();
    }
    
    // Limpiar canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Dibujar fondo negro espacial
    ctx.fillStyle = '#000015';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Dibujar elementos de la galaxia
    drawStarField(ctx, time);
    drawNebulae(ctx, time);
    
    // Generar y dibujar constelaciones
    const constellations = generateConstellations();
    drawConstellations(ctx, constellations, time);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [dimensions, drawStarField, drawNebulae, drawConstellations, generateConstellations, isNavigating, interpolateCamera]);

  // Iniciar animación
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, dimensions]);

  // Manejar clics en el canvas
  const handleCanvasClick = useCallback((event) => {
    // Evitar clicks si se ha arrastrado
    if (hasDragged) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convertir coordenadas de pantalla a coordenadas de galaxia
    const galaxyX = (clickX - dimensions.width / 2 - camera.x) / camera.zoom;
    const galaxyY = (clickY - dimensions.height / 2 - camera.y) / camera.zoom;
    
    const constellations = generateConstellations();
    const currentTime = Date.now();
    
    // Buscar estrella clickeada con posiciones animadas
    for (const [index, constellation] of constellations.entries()) {
      let animatedX, animatedY;
      
      // Usar la misma lógica de posicionamiento que en el renderizado
      if (focusedConstellation && focusedConstellation === constellation.id) {
        // Posición fija al frente del centro para constelaciones enfocadas
        animatedX = 0;
        animatedY = -150;
      } else {
        // Calcular posición animada actual de la constelación (misma velocidad que el renderizado)
        const rotationSpeed = 0.00003 + (index * 0.000015);
        const rotationAngle = constellation.angle + (currentTime * rotationSpeed);
        const distance = GALAXY_CONFIG.constellationRadius + Math.sin(currentTime * 0.0003 + index) * 20;
        animatedX = Math.cos(rotationAngle) * distance;
        animatedY = Math.sin(rotationAngle) * distance;
      }
      
      for (const star of constellation.stars) {
        // Posición animada de la estrella
        const starAnimatedX = animatedX + (star.x - constellation.x);
        const starAnimatedY = animatedY + (star.y - constellation.y);
        
        const distance = Math.sqrt(
          Math.pow(galaxyX - starAnimatedX, 2) + 
          Math.pow(galaxyY - starAnimatedY, 2)
        );
        
        if (distance < star.size + 15) { // Área de click un poco más grande
          console.log('Clicked on star:', star.name, 'URL:', star.url); // Debug
          // Mostrar preview de la herramienta en lugar de abrir directamente
          setToolPreview(star);
          return;
        }
      }
      
      // Buscar constelación clickeada con posición animada
      const distanceToConstellation = Math.sqrt(
        Math.pow(galaxyX - animatedX, 2) + 
        Math.pow(galaxyY - animatedY, 2)
      );
      
      if (distanceToConstellation < 100) {
        // Si ya está enfocada, desenfocar
        if (focusedConstellation === constellation.id) {
          setFocusedConstellation(null);
          setSelectedConstellation(null);
          if (onCategorySelect) {
            onCategorySelect(null);
          }
          // Volver a la vista general
          setTargetCamera({ x: 0, y: 0, zoom: 1 });
          setIsNavigating(true);
        } else {
          // Enfocar esta constelación
          setFocusedConstellation(constellation.id);
          setSelectedConstellation(constellation.id);
          if (onCategorySelect) {
            const category = categories.find(cat => cat.id === constellation.id);
            onCategorySelect(category);
          }
          
          // Navegar hacia la posición frontal con zoom apropiado
          setTargetCamera({
            x: 0,
            y: 150, // Compensar por la posición y=-150 de la constelación enfocada
            zoom: 2.5  // Zoom mayor para ver las herramientas claramente
          });
          setIsNavigating(true);
        }
        return;
      }
    }
  }, [dimensions, camera, generateConstellations, categories, onCategorySelect, hasDragged, focusedConstellation]);

  // Manejar inicio de arrastre
  const handleMouseDown = useCallback((event) => {
    if (event.button === 0) { // Solo botón izquierdo
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: event.clientX, y: event.clientY });
      setLastPanPosition({ x: camera.x, y: camera.y });
    }
  }, [camera]);

  // Manejar movimiento del mouse
  const handleMouseMove = useCallback((event) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      // Si se ha movido lo suficiente, considerar como arrastre
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasDragged(true);
      }
      
      // Aplicar el movimiento a la cámara
      const newX = lastPanPosition.x + deltaX / camera.zoom;
      const newY = lastPanPosition.y + deltaY / camera.zoom;
      
      setCamera(prev => ({ ...prev, x: newX, y: newY }));
      setTargetCamera(prev => ({ ...prev, x: newX, y: newY }));
    }
  }, [isDragging, dragStart, lastPanPosition, camera.zoom]);

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Funciones de manejo de touch para móviles
  const handleTouchStart = useCallback((event) => {
    event.preventDefault();
    const touchArray = Array.from(event.touches);
    setTouches(touchArray);
    setHasInteracted(true); // Marcar que el usuario ha interactuado
    
    if (touchArray.length === 1) {
      // Un solo dedo - iniciar arrastre
      const touch = touchArray[0];
      const touchPos = getTouchPosition(touch, canvasRef.current);
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setLastPanPosition({ x: camera.x, y: camera.y });
      
      // Detectar doble tap
      const now = Date.now();
      const timeDiff = now - lastTouchTime;
      const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
      
      if (timeDiff < config.doubleTapDelay) {
        // Doble tap - centrar vista
        setTargetCamera({ x: 0, y: 0, zoom: 1 });
        setIsNavigating(true);
      }
      setLastTouchTime(now);
      
    } else if (touchArray.length === 2) {
      // Dos dedos - iniciar pinch zoom
      setIsDragging(false);
      setIsPinchZooming(true);
      const distance = getDistanceBetweenTouches(touchArray[0], touchArray[1]);
      setLastPinchDistance(distance);
    }
  }, [camera, lastTouchTime, isMobile, getTouchPosition, getDistanceBetweenTouches]);

  const handleTouchMove = useCallback((event) => {
    event.preventDefault();
    const touchArray = Array.from(event.touches);
    
    if (touchArray.length === 1 && isDragging) {
      // Un solo dedo - arrastre
      const touch = touchArray[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      const config = isMobile ? GALAXY_CONFIG.mobile : GALAXY_CONFIG.desktop;
      
      // Si se ha movido lo suficiente, considerar como arrastre
      if (Math.abs(deltaX) > config.touchThreshold || Math.abs(deltaY) > config.touchThreshold) {
        setHasDragged(true);
      }
      
      // Aplicar el movimiento a la cámara
      const newX = lastPanPosition.x + deltaX / camera.zoom;
      const newY = lastPanPosition.y + deltaY / camera.zoom;
      
      setCamera(prev => ({ ...prev, x: newX, y: newY }));
      setTargetCamera(prev => ({ ...prev, x: newX, y: newY }));
      
    } else if (touchArray.length === 2) {
      // Dos dedos - pinch zoom
      const currentDistance = getDistanceBetweenTouches(touchArray[0], touchArray[1]);
      
      if (lastPinchDistance > 0) {
        const scale = currentDistance / lastPinchDistance;
        const newZoom = Math.max(0.5, Math.min(camera.zoom * scale, 4));
        
        // Obtener centro entre los dedos
        const center = getCenterBetweenTouches(touchArray[0], touchArray[1]);
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = center.x - rect.left;
        const centerY = center.y - rect.top;
        
        // Ajustar posición de cámara para hacer zoom hacia el centro de los dedos
        const worldCenterX = (centerX - dimensions.width / 2 - camera.x) / camera.zoom;
        const worldCenterY = (centerY - dimensions.height / 2 - camera.y) / camera.zoom;
        
        const newCameraX = camera.x + worldCenterX * (camera.zoom - newZoom);
        const newCameraY = camera.y + worldCenterY * (camera.zoom - newZoom);
        
        setCamera({ x: newCameraX, y: newCameraY, zoom: newZoom });
        setTargetCamera({ x: newCameraX, y: newCameraY, zoom: newZoom });
      }
      
      setLastPinchDistance(currentDistance);
    }
  }, [isDragging, dragStart, lastPanPosition, camera, lastPinchDistance, 
      isMobile, dimensions, getDistanceBetweenTouches, getCenterBetweenTouches]);

  const handleTouchEnd = useCallback((event) => {
    event.preventDefault();
    const touchArray = Array.from(event.touches);
    
    if (touchArray.length === 0) {
      // No más dedos - finalizar todas las interacciones
      setIsDragging(false);
      setIsPinchZooming(false);
      setLastPinchDistance(0);
      setTouches([]);
      
      // Si no hubo arrastre, simular click
      if (!hasDragged && touches.length === 1) {
        const touch = touches[0];
        const touchPos = getTouchPosition(touch, canvasRef.current);
        
        // Simular evento de click para reutilizar la lógica existente
        const fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          clientX: touch.clientX,
          clientY: touch.clientY
        };
        handleCanvasClick(fakeEvent);
      }
      
    } else if (touchArray.length === 1) {
      // Queda un dedo - volver a modo arrastre
      setIsPinchZooming(false);
      setLastPinchDistance(0);
      const touch = touchArray[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setLastPanPosition({ x: camera.x, y: camera.y });
    }
    
    setTouches(touchArray);
  }, [hasDragged, touches, camera, getTouchPosition, handleCanvasClick]);

  // Manejar wheel para zoom mejorado
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(camera.zoom * zoomFactor, 5));
    
    // Calcular punto de zoom basado en la posición del mouse
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Ajustar posición de cámara para hacer zoom hacia el cursor
    const worldMouseX = (mouseX - dimensions.width / 2 - camera.x) / camera.zoom;
    const worldMouseY = (mouseY - dimensions.height / 2 - camera.y) / camera.zoom;
    
    const newCameraX = camera.x + worldMouseX * (camera.zoom - newZoom);
    const newCameraY = camera.y + worldMouseY * (camera.zoom - newZoom);
    
    setCamera({ x: newCameraX, y: newCameraY, zoom: newZoom });
    setTargetCamera({ x: newCameraX, y: newCameraY, zoom: newZoom });
  }, [camera, dimensions]);

  // Agregar listeners de mouse y touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Eventos de mouse (para desktop)
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Eventos de touch (para móviles)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevenir comportamientos por defecto del navegador en móviles
    canvas.style.touchAction = 'none';
    
    return () => {
      // Limpiar listeners de mouse
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Limpiar listeners de touch
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && toolPreview) {
        setToolPreview(null);
      }
    };

    if (toolPreview) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [toolPreview]);

  return (
    <div 
      ref={containerRef} 
      className={`galaxy-view ${isNavigating ? 'navigating' : ''} ${isDragging ? 'dragging' : ''} ${isMobile ? 'mobile' : ''} ${hasInteracted ? 'interacted' : ''} ${isPinchZooming ? 'pinch-zooming' : ''} ${touches.length > 0 ? 'touch-active' : ''}`}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        className="galaxy-canvas"
      />
      
      {/* Controles de navegación */}
      <div className="galaxy-controls">
        <button 
          className="galaxy-btn"
          onClick={() => {
            setTargetCamera({ x: 0, y: 0, zoom: 1 });
            setIsNavigating(true);
          }}
          title="Regresar al centro"
        >
          🏠
        </button>
        <button 
          className="galaxy-btn"
          onClick={() => {
            const newZoom = Math.min(camera.zoom * 1.2, 5);
            setTargetCamera(prev => ({ ...prev, zoom: newZoom }));
            setIsNavigating(true);
          }}
          title="Acercar"
        >
          🔍+
        </button>
        <button 
          className="galaxy-btn"
          onClick={() => {
            const newZoom = Math.max(camera.zoom * 0.8, 0.1);
            setTargetCamera(prev => ({ ...prev, zoom: newZoom }));
            setIsNavigating(true);
          }}
          title="Alejar"
        >
          🔍-
        </button>
        <button 
          className="galaxy-btn"
          onClick={() => {
            // Navegación orbital alrededor del centro
            const orbitRadius = 200;
            const angle = Math.random() * Math.PI * 2;
            setTargetCamera({
              x: Math.cos(angle) * orbitRadius,
              y: Math.sin(angle) * orbitRadius,
              zoom: 1.5
            });
            setIsNavigating(true);
          }}
          title="Explorar órbita"
        >
          🌌
        </button>
        {focusedConstellation && (
          <button 
            className="galaxy-btn"
            onClick={() => {
              setFocusedConstellation(null);
              setSelectedConstellation(null);
              if (onCategorySelect) {
                onCategorySelect(null);
              }
              setTargetCamera({ x: 0, y: 0, zoom: 1 });
              setIsNavigating(true);
            }}
            title="Salir del enfoque"
            style={{ backgroundColor: 'rgba(255, 100, 100, 0.3)' }}
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Información de navegación */}
      <div className="galaxy-info">
        <div className="galaxy-stats">
          <div className="stat">
            <span className="stat-label">Constelaciones:</span>
            <span className="stat-value">{categories.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Estrellas:</span>
            <span className="stat-value">{tools.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Zoom:</span>
            <span className="stat-value">{camera.zoom.toFixed(1)}x</span>
          </div>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="galaxy-legend">
        <h4>🌌 Galaxia OSINTArgy</h4>
        <p>🌟 Click en estrellas para ver información de la herramienta</p>
        <p>⭐ Click en constelaciones para enfocar y ver herramientas</p>
        <p>🔍 Usa la rueda del mouse para zoom</p>
        <p>👆 Arrastra para navegar por la galaxia</p>
        {focusedConstellation && (
          <p style={{ color: '#FFD700', fontWeight: 'bold' }}>
            ✨ Constelación enfocada - Click nuevamente para desenfocar
          </p>
        )}
      </div>

      {/* Modal de preview de herramienta */}
      {toolPreview && (
        <div className="tool-preview-overlay" onClick={() => setToolPreview(null)}>
          <div className="tool-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tool-preview-header">
              <h3>{toolPreview.name}</h3>
              <button 
                className="close-preview-btn"
                onClick={() => setToolPreview(null)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            
            <div className="tool-preview-content">
              <div className="tool-description">
                <h4>📋 Descripción</h4>
                <p>{toolPreview.description}</p>
              </div>
              
              {toolPreview.utility && (
                <div className="tool-utility">
                  <h4>⚡ Utilidad</h4>
                  <p>{toolPreview.utility}</p>
                </div>
              )}
              
              <div className="tool-details">
                <div className="tool-tags">
                  <h4>🏷️ Tags</h4>
                  <div className="tags-container">
                    {toolPreview.tags?.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                
                {toolPreview.rating && (
                  <div className="tool-rating">
                    <h4>⭐ Rating</h4>
                    <div className="rating-display">
                      {Array.from({length: 5}, (_, i) => (
                        <span key={i} className={i < Math.floor(toolPreview.rating) ? 'star filled' : 'star'}>
                          ⭐
                        </span>
                      ))}
                      <span className="rating-number">({toolPreview.rating}/5)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="tool-preview-actions">
              <button 
                className="cancel-btn"
                onClick={() => setToolPreview(null)}
              >
                🔙 Cancelar
              </button>
              <button 
                className="open-tool-btn"
                onClick={() => {
                  if (toolPreview.url) {
                    window.open(toolPreview.url, '_blank', 'noopener,noreferrer');
                  }
                  setToolPreview(null);
                }}
              >
                🚀 Abrir Herramienta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalaxyView;