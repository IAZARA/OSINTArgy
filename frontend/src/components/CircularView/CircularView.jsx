import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './CircularView.css';

const CircularView = ({ tools = [], categories = [], onCategorySelect, selectedCategory }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeCategory, setActiveCategory] = useState(null); // ID de la categoría activa para mostrar herramientas
  const [showCategories, setShowCategories] = useState(false);

  // Efecto para actualizar dimensiones del SVG
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 600 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Efecto principal para dibujar con D3
  useEffect(() => {
    if (!svgRef.current || categories.length === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.selectAll('*').remove(); // Limpiar SVG en cada redibujo

    const mainGroup = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

    // 1. Botón Central (Logo OSINTArgy) - SIMPLIFICADO
    const centralButton = mainGroup.append('g')
      .attr('class', 'central-button')
      .on('click', (event) => {
        event.stopPropagation();
        setShowCategories(prev => !prev);
        setActiveCategory(null);
        if (onCategorySelect) {
          onCategorySelect(null);
        }
      });

    centralButton.append('circle')
      .attr('r', 60)
      .attr('fill', '#003366') // Azul oscuro OSINT
      .attr('stroke', '#00D4FF')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0px 0px 10px #00D4FF)');

    centralButton.append('image')
      .attr('href', '/favicon.png') // Asegúrate que esta ruta es correcta
      .attr('x', -40)
      .attr('y', -40)
      .attr('width', 80)
      .attr('height', 80);

    centralButton.append('title')
      .text('OSINTArgy - Haz click para ver/ocultar categorías');

    // 2. Renderizar Categorías si showCategories es true
    if (showCategories) {
      const numCategories = categories.length;
      const categoryRadius = Math.min(width, height) / 3.5; // Radio para posicionar categorías
      const angleStep = (2 * Math.PI) / numCategories;

      categories.forEach((category, i) => {
        const angle = i * angleStep - Math.PI / 2; // Empezar desde arriba
        const catX = categoryRadius * Math.cos(angle);
        const catY = categoryRadius * Math.sin(angle);

        const categoryGroup = mainGroup.append('g')
          .attr('class', 'category-node')
          .attr('transform', `translate(${catX}, ${catY})`)
          .on('click', (event) => {
            event.stopPropagation();
            setActiveCategory(prev => (prev === category.id ? null : category.id));
            if (onCategorySelect) {
              onCategorySelect(category);
            }
          });

        categoryGroup.append('circle')
          .attr('r', 40)
          .attr('fill', category.color || '#1E5A8A')
          .attr('stroke', '#00D4FF')
          .attr('stroke-width', 2)
          .style('filter', activeCategory === category.id ? 'drop-shadow(0px 0px 15px #FFD700)' : 'drop-shadow(0px 0px 5px #00D4FF)');

        categoryGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .attr('font-size', '20px')
          .text(category.icon || '📁');

        categoryGroup.append('title')
          .text(`${category.name}\n${category.description || ''}\nHaz click para ver herramientas`);

        // 3. Renderizar Herramientas si esta categoría está activa
        if (activeCategory === category.id) {
          const categoryTools = tools.filter(tool => tool.category === category.id);
          const numTools = categoryTools.length;
          if (numTools > 0) {
            const toolRadius = 100; // Radio para posicionar herramientas alrededor de la categoría
            const toolAngleStep = (2 * Math.PI) / numTools;

            categoryTools.forEach((tool, j) => {
              const toolAngle = j * toolAngleStep - Math.PI / 2;
              const toolX = toolRadius * Math.cos(toolAngle);
              const toolY = toolRadius * Math.sin(toolAngle);

              const toolGroup = categoryGroup.append('g')
                .attr('class', 'tool-node')
                .attr('transform', `translate(${toolX}, ${toolY})`)
                .on('click', (event) => {
                  event.stopPropagation();
                  if (tool.url) {
                    window.open(tool.url, '_blank', 'noopener,noreferrer');
                  }
                });

              toolGroup.append('circle')
                .attr('r', 25)
                .attr('fill', '#FF9800') // Naranja para herramientas
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 1.5);

              toolGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', 'black')
                .attr('font-size', '14px')
                .text(tool.icon || '🔧');

              toolGroup.append('title')
                .text(`${tool.name}\n${tool.description || 'Herramienta OSINT'}\nHaz click para abrir`);
            });
          }
        }
      });
    }

  }, [dimensions, categories, tools, showCategories, activeCategory, onCategorySelect]);

  return (
    <div ref={containerRef} className="circular-view-container">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
};

export default CircularView;
