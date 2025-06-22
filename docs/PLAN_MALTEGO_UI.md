# Plan de Diagnóstico y Solución: Herramientas no Enlazadas en OSINTArgy

## Problema Identificado
El usuario reporta que no todas las herramientas que deberían aparecer en la página se están mostrando, sugiriendo un problema en el enlace entre las categorías y las herramientas.

## Análisis Inicial
Se ha revisado la estructura de datos y lógica tanto en el frontend como en el backend:

*   **Frontend:**
    *   `frontend/src/data/categories.json`: Define la estructura de las categorías.
    *   `frontend/src/data/tools.json`: Define la estructura general de las herramientas.
    *   `frontend/src/data/tools/index.js`: Combina las herramientas de los archivos JSON específicos de cada categoría.
    *   `frontend/src/data/tools/analisis-visualizacion.json` (ejemplo): Muestra la estructura de herramientas dentro de una categoría.
    *   `frontend/src/components/CardsView/CardsView.jsx`: Componente que renderiza las categorías y herramientas, aplicando filtros y ordenamientos.
    *   `frontend/src/hooks/useTools.js`: Hook que carga las herramientas y categorías, intentando primero desde el backend y luego desde los datos locales.
    *   `frontend/src/services/toolsService.js`: Servicio que interactúa con las APIs del backend para obtener datos de herramientas y categorías.

*   **Backend:**
    *   `backend/src/models/Category.js`: Modelo de Mongoose para las categorías, incluyendo subcategorías y un campo `tools_count`.
    *   `backend/src/models/Tool.js`: Modelo de Mongoose para las herramientas, con campos `category` y `subcategory`.
    *   `backend/src/controllers/categoriesController.js`: Controlador para las operaciones de categorías, incluyendo la obtención de categorías con estadísticas (`getWithStats`).
    *   `backend/src/controllers/toolsController.js`: Controlador para las operaciones de herramientas, incluyendo filtros por categoría y subcategoría.
    *   `backend/scripts/populate-tools-phase4.js` y `backend/scripts/seed-database.js`: Scripts para poblar la base de datos.

## Posibles Causas Raíz

1.  **Discrepancia de datos:** Los datos locales del frontend (`frontend/src/data/`) podrían estar desactualizados o incompletos en comparación con la base de datos de MongoDB del backend.
2.  **Problemas en la base de datos del backend:**
    *   Herramientas con `status: 'inactive'`.
    *   IDs de `category` o `subcategory` incorrectos, nulos o vacíos en los documentos de herramientas.
    *   Errores durante la ejecución de los scripts de población de datos que impidieron la inserción correcta de todas las herramientas o su vinculación con categorías.
3.  **Problemas de lógica en el frontend:** Aunque se ha revisado, podría haber errores sutiles en el filtrado (`filteredAndSortedTools` en `CardsView.jsx`) o en la forma en que se manejan los datos obtenidos del backend (`useTools.js`).

## Plan de Acción Detallado

### Fase 1: Diagnóstico y Verificación de Datos (Backend)

**Objetivo:** Confirmar la integridad y coherencia de los datos de herramientas y categorías en la base de datos de MongoDB.

1.  **Iniciar servicios de Docker Compose:**
    ```bash
    docker-compose up -d
    ```
    (Ejecutar en el directorio raíz del proyecto: `/Users/macbook/Documents/OSINTArgy`)

2.  **Acceder al shell de MongoDB:**
    ```bash
    docker exec -it osintargy-mongodb mongosh -u admin -p password123 --authenticationDatabase admin osintargy
    ```
    (Ejecutar después de que los servicios estén levantados)

3.  **Ejecutar consultas de MongoDB (dentro del shell `mongosh`):**
    *   **Número total de herramientas activas:**
        ```javascript
        db.tools.countDocuments({ status: 'active' })
        ```
    *   **Conteo de herramientas activas por categoría:**
        ```javascript
        db.tools.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ])
        ```
    *   **Conteo de herramientas activas por subcategoría:**
        ```javascript
        db.tools.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
          { $sort: { '_id.category': 1, '_id.subcategory': 1 } }
        ])
        ```
    *   **Herramientas con `category` o `subcategory` nulos/vacíos o incorrectos:**
        ```javascript
        db.tools.find({
          $or: [
            { category: { $exists: false } },
            { category: null },
            { category: '' },
            { subcategory: { $exists: false } },
            { subcategory: null },
            { subcategory: '' }
          ]
        }).project({ id: 1, name: 1, category: 1, subcategory: 1 })
        ```
    *   **Listar todas las categorías y sus subcategorías activas del backend:**
        ```javascript
        db.categories.find({ is_active: true }).project({ id: 1, name: 1, subcategories: { id: 1, name: 1 } }).sort({ order: 1 })
        ```

4.  **Compartir los resultados de las consultas.**

### Fase 2: Verificación de Coherencia (Frontend vs. Backend)

**Objetivo:** Identificar si hay una discrepancia entre los datos que el backend proporciona y los que el frontend espera o procesa.

1.  **Comparar recuentos:** Una vez obtenidos los resultados de la Fase 1, comparar el número total de herramientas activas en la DB con el número de herramientas que se muestran en el frontend.
2.  **Revisar logs del backend:** Si los recuentos no coinciden, revisar los logs del contenedor `osintargy-backend` para buscar errores al cargar o procesar herramientas.
    ```bash
    docker logs osintargy-backend
    ```
3.  **Simular llamadas a la API:** Si es necesario, se pueden usar herramientas como `curl` o Postman para llamar directamente a las APIs del backend (`/api/tools`, `/api/categories`, `/api/tools/category/:categoryId`) y verificar la respuesta.

### Fase 3: Propuesta de Solución

**Objetivo:** Implementar las correcciones necesarias una vez identificada la causa raíz.

*   **Si el problema es de datos en el backend:**
    *   **Corrección de datos:** Si se encuentran herramientas con categorías/subcategorías incorrectas o inactivas, se propondrá una estrategia para corregirlas (ej. script de migración, actualización manual).
    *   **Re-ejecución de scripts de población:** Si los scripts de población (`populate-tools-phase4.js`, `seed-database.js`) no se ejecutaron correctamente o están desactualizados, se propondrá ejecutarlos nuevamente después de revisarlos para asegurar que insertan los datos correctamente.

*   **Si el problema es de lógica en el frontend:**
    *   **Ajustes en `CardsView.jsx`:** Si el filtrado o renderizado es incorrecto, se propondrán modificaciones en la lógica de `filteredAndSortedTools` o en la forma en que se manejan las propiedades de las herramientas.
    *   **Ajustes en `useTools.js` o `toolsService.js`:** Si la obtención o procesamiento de datos del backend es defectuosa, se propondrán correcciones en estos archivos.

## Diagrama de Flujo del Plan

```mermaid
graph TD
    A[Inicio: Problema de herramientas no enlazadas] --> B{Recopilar Información};
    B --> C[Revisar Frontend: data/*.json, CardsView.jsx, useTools.js, toolsService.js];
    C --> D[Revisar Backend: models/*.js, controllers/*.js];
    D --> E{Análisis de Causa Raíz Potencial};
    E --> F{Problema de Datos en Backend?};
    F -- Sí --> G[Verificar estado de herramientas en DB (status, category/subcategory IDs)];
    G --> H[Revisar scripts de población de datos (populate-tools-phase4.js, seed-database.js)];
    H --> I{Preguntas al Usuario sobre DB y scripts};
    F -- No --> J{Problema de Lógica en Frontend?};
    J --> K[Comparar datos del frontend con lo que el backend debería enviar];
    K --> L{Propuesta de Solución: Ajustes en Frontend};
    I --> M[Propuesta de Solución: Corrección de Datos/Scripts Backend];
    M --> N[Fin: Plan Detallado];
    L --> N;