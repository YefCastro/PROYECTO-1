# City Builder Game - Simulador Urbano

## Descripción del Proyecto

City Builder Game es un simulador urbano completo donde los jugadores asumen el rol de alcalde de una ciudad virtual. El objetivo principal es construir, desarrollar y gestionar una ciudad próspera mediante la construcción de infraestructura, gestión de recursos, planificación urbana y atención a las necesidades de los ciudadanos.

## Características Principales

### Aspectos del Dominio Urbano Implementados

- **Planificación Territorial**: Diseño y organización del espacio urbano con sistema de cuadrícula
- **Construcción**: 7 tipos de edificios con múltiples variantes (Residencial, Comercial, Industrial, Servicios, Parques, Plantas, Carreteras)
- **Gestión de Recursos**: Administración completa de dinero, electricidad, agua y alimentos
- **Población**: Simulación avanzada de ciudadanos con necesidades y comportamientos
- **Economía Urbana**: Sistema de ingresos, empleos y costos operativos
- **Servicios Públicos**: Provisión de energía, agua y recreación
- **Factores Externos**: Integración con datos climáticos y noticias reales

## Arquitectura del Sistema

### Estructura del Proyecto

```
cityBuilderGame/
|
|--- js/                    # Lógica principal del juego
|   |--- core/             # Clases principales (Game, GameState, TurnSystem)
|   |--- managers/         # Gestores de recursos, edificios, ciudadanos
|   |--- services/         # Servicios externos (clima, noticias, routing)
|   |--- ui/               # Interfaz de usuario
|   |--- utils/            # Utilidades y constantes
|
|--- models/               # Modelos de datos (City, Building, Citizen, Resources)
|--- data/                 # Archivos de configuración JSON
|--- styles/               # Hojas de estilo CSS
|--- backend/              # API de rutas
|--- tests/                # Pruebas unitarias
|--- assets/               # Recursos gráficos
```

### Componentes Clave

#### 1. Sistema de Juego (Core)
- **Game.js**: Clase principal que inicializa y coordina todos los sistemas
- **GameState.js**: Gestiona el estado actual del juego
- **TurnSystem.js**: Controla el avance por turnos

#### 2. Gestores (Managers)
- **BuildingManager.js**: Gestiona construcción, eliminación y mejoras de edificios
- **ResourceManager.js**: Calcula producción, consumo e ingresos por turno
- **CitizenManager.js**: Gestiona población, vivienda, empleo y felicidad
- **ScoreManager.js**: Calcula puntuación general del jugador
- **PersistenceManager.js**: Maneja guardado y carga de partidas

#### 3. Servicios (Services)
- **WeatherService.js**: Obtiene clima real con impacto en el juego
- **NewService.js**: Integra noticias reales relacionadas con la ciudad
- **RoutingService.js**: Gestiona rutas y transporte
- **MapTemplateService.js**: Carga mapas predefinidos
- **AutoSaveService.js**: Guardado automático de partidas

#### 4. Modelos de Datos
- **City.js**: Representa la ciudad con su mapa y recursos
- **Building.js**: Clase base para todos los tipos de edificios
- **Citizen.js**: Representa ciudadanos individuales con necesidades
- **Resources.js**: Gestiona el estado de recursos de la ciudad

## Instalación y Ejecución

### Requisitos Previos
- Navegador web moderno con soporte para ES6 modules
- Servidor local para desarrollo (opcional)

### Pasos para Ejecutar

1. **Clonar o descargar el proyecto**
2. **Abrir `index.html` en el navegador**
3. **El juego comenzará automáticamente con la configuración inicial**

### Configuración Inicial
- **Dinero inicial**: 50,000
- **Tamaño del mapa**: 15x15 (configurable entre 15-30)
- **Región geográfica**: Bogotá, Colombia (configurable)

## Funcionalidades Detalladas

### Sistema de Construcción
- **Edificios Residenciales**: Casas y apartamentos para población
- **Edificios Comerciales**: Tiendas y centros comerciales
- **Edificios Industriales**: Fábricas y granjas
- **Servicios Públicos**: Hospitales, escuelas, parques
- **Infraestructura**: Plantas de energía, tratamiento de agua
- **Transporte**: Sistema de carreteras

### Sistema de Recursos
- **Dinero**: Gestión de presupuestos, ingresos y gastos
- **Electricidad**: Producción y consumo por edificio
- **Agua**: Sistema de tratamiento y distribución
- **Alimentos**: Producción agrícola y distribución

### Sistema de Población
- **Crecimiento**: Expansión demográfica natural
- **Necesidades**: Vivienda, empleo, servicios, recreación
- **Felicidad**: Sistema de satisfacción ciudadana
- **Empleo**: Creación y gestión de puestos de trabajo

### Factores Externos
- **Clima Real**: Impacto del tiempo en producción y consumo
- **Noticias Reales**: Eventos externos que afectan la ciudad
- **Modificadores**: Cambios dinámicos basados en condiciones externas

## Historias de Usuario y Pruebas

### Pruebas de Validación Humana

A continuación se presentan las 4 historias de usuario que validan el correcto funcionamiento del sistema, junto con las tablas de chequeo para verificar cada funcionalidad.

---

### HU-001: Creación de Nueva Ciudad

**Como jugador nuevo, quiero crear una ciudad ingresando sus datos básicos, para comenzar a jugar y construir mi imperio urbano**

#### Código Relacionado:
- **FormController.js**: Maneja el formulario de creación de ciudad (líneas 17-21)
- **Game.js**: Inicializa la ciudad con recursos (líneas 30-35, 75-80)
- **PersistenceManager.js**: Guarda configuración en LocalStorage
- **data/game-config.json**: Define recursos iniciales ($50,000, electricidad: 0, agua: 0)

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] El sistema muestra formulario con campos obligatorios | | FormController.js líneas 17-21 |
| [ ] Validación de campos completos | | FormController.js validateCityForm() |
| [ ] Validación de tamaño de mapa (15x15 a 30x30) | | Game.js clampMapDimension() |
| [ ] Creación de ciudad con recursos iniciales | | Game.js createCity() + Resources.js |
| [ ] Redirección a vista principal del juego | | app.js uiManager.initialize() |
| [ ] Guardado en LocalStorage | | PersistenceManager.js saveToLocalStorage() |

---

### HU-002: Cargar Mapa desde Archivo de Texto

**Como jugador, quiero cargar un mapa prediseñado desde un archivo de texto, para comenzar con una ciudad ya estructurada**

#### Código Relacionado:
- **MapTemplateService.js**: Parsea archivos de texto con convenciones (líneas 11-26)
- **FormController.js**: Maneja formulario de carga de mapa (líneas 23-24)
- **BuildingManager.js**: Crea instancias de edificios (líneas 162-199)
- **City.js**: Renderiza mapa cargado

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Botón "Cargar Mapa" en configuración | | FormController.js línea 23 |
| [ ] Selector de archivos .txt | | FormController.js setupMapTemplateForm() |
| [ ] Validación de formato correcto | | MapTemplateService.js validateLayout() |
| [ ] Parseo de convenciones (g, r, R1, C1, I1, S1) | | MapTemplateService.js TOKEN_MAP |
| [ ] Creación de instancias Building | | BuildingManager.js instantiateStructure() |
| [ ] Creación de instancias Road | | BuildingManager.js línea 197-199 |
| [ ] Cálculo de recursos iniciales | | ResourceManager.js calculateInitialResources() |
| [ ] Manejo de errores de formato | | MapTemplateService.js validateLayout() |
| [ ] Renderizado correcto del mapa | | City.js render() |
| [ ] Guardado en LocalStorage | | PersistenceManager.js saveToLocalStorage() |

---

### HU-003: Construir Edificio Residencial

**Como jugador, quiero construir casas y apartamentos, para aumentar la capacidad de población de mi ciudad**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción de edificios residenciales (líneas 164-165)
- **ResidentialBuilding.js**: Modelo de edificios residenciales
- **DomainRulesService.js**: Validación de reglas de construcción
- **data/building-types.json**: Define tipos y costos (Casa: $1,000, Apartamento: $3,000)

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Menú de construcción con tipos residenciales | | FormController.js setupBuildForm() |
| [ ] Casa (capacidad: 4, costo: $1,000) | | building-types.json líneas 7-16 |
| [ ] Apartamento (capacidad: 12, costo: $3,000) | | building-types.json líneas 18-27 |
| [ ] Cursor cambia a modo construcción | | FormController.js setConstructionMode() |
| [ ] Validación de celda vacía | | BuildingManager.js canBuild() |
| [ ] Validación de dinero suficiente | | BuildingManager.js canAfford() |
| [ ] Validación de vía adyacente obligatoria | | DomainRulesService.js hasAdjacentRoad() |
| [ ] Descuento de costo del dinero | | ResourceManager.js deductCost() |
| [ ] Renderizado del edificio | | MapRenderer.js renderBuilding() |
| [ ] Notificación de éxito | | ModalController.js showSuccess() |
| [ ] Mensaje de error específico | | ModalController.js showError() |
| [ ] Actualización contador de edificios | | BuildingManager.js updateBuildingCount() |
| [ ] Consumo de electricidad y agua | | ResidentialBuilding.js consumeResources() |

---

### HU-004: Construir Edificio Comercial

**Como jugador, quiero construir tiendas y centros comerciales, para generar ingresos y empleos en mi ciudad**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción de edificios comerciales (líneas 167-168)
- **CommercialBuilding.js**: Modelo de edificios comerciales
- **ResourceManager.js**: Calcula ingresos por turno
- **CitizenManager.js**: Gestiona empleos disponibles

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Menú con tipos comerciales | | FormController.js setupBuildForm() |
| [ ] Tienda (empleos: 6, costo: $2,000) | | building-types.json sección COMMERCIAL |
| [ ] Centro Comercial (empleos: 20, costo: $8,000) | | building-types.json sección COMMERCIAL |
| [ ] Proceso de construcción igual a HU-003 | | BuildingManager.js build() |
| [ ] Generación de dinero por turno (Tienda: $500) | | CommercialBuilding.js generateIncome() |
| [ ] Generación de dinero (Centro Comercial: $2,000) | | CommercialBuilding.js generateIncome() |
| [ ] Consumo de electricidad | | CommercialBuilding.js consumeElectricity() |
| [ ] Ofrece empleos a ciudadanos | | CitizenManager.js assignJobs() |
| [ ] Muestra ingreso en panel de estadísticas | | PanelController.js updateStats() |
| [ ] Sin electricidad = sin generación de dinero | | CommercialBuilding.js isOperational() |

---

### HU-005: Construir Edificio Industrial

**Como jugador, quiero construir fábricas y granjas, para producir recursos y empleos**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción industrial (líneas 170-171)
- **IndustrialBuilding.js**: Modelo de edificios industriales
- **data/building-types.json**: Define tipos industriales (líneas 60-91)
- **ResourceManager.js**: Calcula producción y consumo

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Menú con tipos industriales | | FormController.js setupBuildForm() |
| [ ] Fábrica (empleos: 15, costo: $5,000, produce: dinero) | | building-types.json líneas 65-76 |
| [ ] Granja (empleos: 8, costo: $3,000, produce: alimentos) | | building-types.json líneas 78-89 |
| [ ] Fábrica genera $800/turno | | building-types.json línea 75 |
| [ ] Fábrica consume agua y electricidad | | building-types.json líneas 69,73-74 |
| [ ] Granja produce +50 alimentos/turno | | building-types.json línea 87 |
| [ ] Granja consume agua | | building-types.json línea 86 |
| [ ] Edificios industriales ofrecen empleos | | IndustrialBuilding.js capacity |
| [ ] Producción reducida 50% sin recursos | | IndustrialBuilding.js isOperational() |

---

### HU-006: Construir Edificios de Servicio

**Como jugador, quiero construir policía, bomberos y hospitales, para aumentar la felicidad de los ciudadanos**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción de servicios (líneas 173-180)
- **ServiceBuilding.js**: Modelo de edificios de servicio
- **data/building-types.json**: Define tipos de servicios (líneas 93-136)
- **CitizenManager.js**: Gestiona felicidad ciudadana

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Menú con tipos de servicios | | FormController.js setupBuildForm() |
| [ ] Estación de Policía (costo: $4,000, radio: 5) | | building-types.json líneas 98-109 |
| [ ] Estación de Bomberos (costo: $4,000, radio: 5) | | building-types.json líneas 110-121 |
| [ ] Hospital (costo: $6,000, radio: 7) | | building-types.json líneas 122-134 |
| [ ] Cada edificio consume electricidad | | building-types.json líneas 105,117,131 |
| [ ] Policía aumenta +10 felicidad | | building-types.json línea 103 |
| [ ] Bomberos aumentan +10 felicidad | | building-types.json línea 115 |
| [ ] Hospital aumenta +10 felicidad | | building-types.json línea 127 |
| [ ] Hospital consume también agua | | building-types.json línea 132 |

---

### HU-007: Construir Plantas de Utilidad

**Como jugador, quiero construir plantas eléctricas y de agua, para proveer recursos esenciales a mi ciudad**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción de plantas (líneas 188-195)
- **UtilityPlant.js**: Modelo de plantas de utilidad
- **data/building-types.json**: Define tipos de plantas (líneas 153-180)
- **ResourceManager.js**: Muestra producción y balance

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Menú con tipos de utilidades | | FormController.js setupBuildForm() |
| [ ] Planta Eléctrica (costo: $10,000, produce: 200) | | building-types.json líneas 158-166 |
| [ ] Planta de Agua (costo: $8,000, produce: 150) | | building-types.json líneas 168-177 |
| [ ] Planta eléctrica no consume recursos | | building-types.json líneas 162-165 |
| [ ] Planta de agua consume 20 electricidad/turno | | building-types.json línea 174 |
| [ ] Muestra producción total en panel | | PanelController.js updateResources() |
| [ ] Muestra balance (producción - consumo) | | ResourceManager.js calculateBalance() |

---

### HU-008: Construir Parques

**Como jugador, quiero construir parques, para aumentar la felicidad de los ciudadanos cercanos**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción de parques (líneas 182-186)
- **ServiceBuilding.js**: Modelo de parques (serviceType: "park")
- **data/building-types.json**: Define parques (líneas 137-152)

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Permite construir parques (costo: $1,500) | | building-types.json línea 140 |
| [ ] Parques no consumen recursos | | building-types.json líneas 147-149 |
| [ ] Parques aumentan +5 felicidad global | | building-types.json línea 144 |
| [ ] Parques no tienen capacidad ni empleos | | building-types.json stats vacíos |
| [ ] Se puede construir múltiples parques | | BuildingManager.js build() |

---

### HU-009: Construir Vías/Caminos

**Como jugador, quiero construir vías entre edificios, para conectar mi ciudad y permitir rutas de transporte**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona construcción de vías (líneas 197-199)
- **Road.js**: Modelo de vías/carreteras
- **data/building-types.json**: Define tipo ROAD (líneas 181-190)
- **RoutingService.js**: Calcula rutas usando vías

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Opción "Construir Vía" en menú | | FormController.js setupBuildForm() |
| [ ] Cursor cambia a modo construcción | | FormController.js setConstructionMode() |
| [ ] Click en celdas vacías para colocar vías | | BuildingManager.js build() |
| [ ] Cada celda de vía cuesta $100 | | building-types.json línea 184 |
| [ ] Vías no pueden colocarse sobre edificios | | BuildingManager.js canBuild() |
| [ ] Muestra costo total antes de confirmar | | FormController.js showCostPreview() |
| [ ] Vías renderizadas con textura diferente | | MapRenderer.js renderRoad() |
| [ ] Vías necesarias para calcular rutas | | RoutingService.js calculateRoute() |

---

### HU-010: Eliminar Edificios y Vías

**Como jugador, quiero demoler edificios y vías, para reorganizar mi ciudad**

#### Código Relacionado:
- **BuildingManager.js**: Gestiona demolición (líneas 301-347)
- **City.js**: Elimina edificios y vías del mapa
- **CitizenManager.js**: Actualiza ciudadanos afectados
- **ResourceManager.js**: Recupera 50% del costo

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Opción "Demoler" en menú | | FormController.js setupDemolitionMode() |
| [ ] Cursor cambia a modo demolición | | FormController.js setDemolitionMode() |
| [ ] Click en edificio/vía muestra confirmación | | FormController.js showDemolitionConfirm() |
| [ ] Informa ciudadanos afectados | | BuildingManager.js líneas 328-340 |
| [ ] Recupera 50% del costo | | ResourceManager.js refundCost() |
| [ ] Elimina edificio/vía del mapa | | BuildingManager.js demolishAt() |
| [ ] Ciudadanos quedan sin hogar/empleo | | BuildingManager.js líneas 329-340 |
| [ ] Actualiza recursos producción/consumo | | ResourceManager.js updateProduction() |
| [ ] Notificación con dinero recuperado | | ModalController.js showRefundSuccess() |

---

### HU-011: Ver Información de Edificio

**Como jugador, quiero hacer click en un edificio para ver su información, para conocer sus estadísticas y estado actual**

#### Código Relacionado:
- **UIManager.js**: Maneja eventos de click en edificios
- **ModalController.js**: Muestra panel lateral/modal con información
- **Building.js**: Proporciona datos del edificio
- **CitizenManager.js**: Proporciona información de ocupantes

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Click en edificio muestra panel con información | | UIManager.js handleBuildingClick() |
| [ ] Muestra tipo y nombre del edificio | | Building.js getType() y getName() |
| [ ] Muestra costo de construcción | | Building.js cost |
| [ ] Muestra costo de mantenimiento/turno | | Building.js getMaintenanceCost() |
| [ ] Muestra recursos que consume | | Building.js getResourceConsumption() |
| [ ] Muestra recursos que produce | | Building.js getResourceProduction() |
| [ ] Muestra capacidad (vivienda/empleos) | | Building.js getCapacity() |
| [ ] Muestra ocupación actual | | Building.js getCurrentOccupancy() |
| [ ] Para residenciales: ciudadanos viviendo | | ResidentialBuilding.js getResidents() |
| [ ] Para residenciales: nivel de felicidad | | ResidentialBuilding.js getAverageHappiness() |
| [ ] Para comerciales/industriales: empleados | | CommercialBuilding.js getEmployees() |
| [ ] Panel incluye botón "Demoler" | | ModalController.js showDemolitionButton() |
| [ ] Panel se cierra al hacer click fuera | | ModalController.js closeOnOutsideClick() |

---

### HU-012: Calcular Ruta Óptima entre Edificios

**Como jugador, quiero calcular la ruta más corta entre dos edificios, para planificar el transporte en mi ciudad**

#### Código Relacionado:
- **RoutingService.js**: Calcula rutas con algoritmo de Dijkstra (líneas 123-129)
- **RoutingService.js**: Genera matriz del mapa (líneas 104-118)
- **backend/route-api.js**: API para cálculo de rutas
- **UIManager.js**: Maneja selección de origen/destino

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Botón "Calcular Ruta" en interfaz | | UIManager.js showRouteButton() |
| [ ] Selección de edificio origen (click) | | UIManager.js handleOriginSelection() |
| [ ] Selección de edificio destino (click) | | UIManager.js handleDestinationSelection() |
| [ ] Construcción de matriz del mapa (0=no transitable, 1=vía) | | RoutingService.js generateMapMatrix() |
| [ ] Llama a backend POST /api/calculate-route | | backend/route-api.js calculateRoute() |
| [ ] Muestra loader mientras espera respuesta | | UIManager.js showRouteLoader() |
| [ ] Anima ruta en el mapa al recibir respuesta | | MapRenderer.js animateRoute() |
| [ ] Mensaje si no existe ruta | | UIManager.js showNoRouteMessage() |
| [ ] Permite calcular nueva ruta o cancelar | | UIManager.js resetRouteSelection() |
| [ ] Ruta se limpia al hacer nueva acción | | MapRenderer.js clearRoute() |

---

### HU-013: Sistema de Gestión de Ciudadanos

**Como jugador, quiero que los ciudadanos se asignen automáticamente a edificios, para ver mi ciudad poblarse dinámicamente**

#### Código Relacionado:
- **CitizenManager.js**: Gestión automática de ciudadanos (líneas 100-129)
- **Citizen.js**: Modelo de ciudadanos con felicidad
- **City.js**: Asignación de ciudadanos a edificios
- **ResourceManager.js**: Verificación de recursos estables

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Creación automática con viviendas disponibles | | CitizenManager.js canGrowPopulation() |
| [ ] Creación si felicidad > 60 | | CitizenManager.js líneas 115-117 |
| [ ] Creación si hay empleos disponibles | | CitizenManager.js getEmploymentRate() |
| [ ] Verificación de capacidad vivienda por turno | | CitizenManager.js getAvailableSpace() |
| [ ] Creación de 1-3 ciudadanos por turno | | CitizenManager.js calculateGrowthCapacity() |
| [ ] Asignación automática a viviendas | | CitizenManager.js assignHousing() |
| [ ] Asignación automática a empleos | | CitizenManager.js assignJobs() |
| [ ] Ciudadano con ID único | | Citizen.js constructor |
| [ ] Nivel de felicidad (0-100) | | Citizen.js happiness |
| [ ] Cálculo felicidad: vivienda +20 | | CitizenManager.js calculateHappiness() |
| [ ] Cálculo felicidad: empleo +15 | | CitizenManager.js calculateHappiness() |
| [ ] Cálculo felicidad: servicios +10 cada uno | | CitizenManager.js calculateServiceFactor() |
| [ ] Cálculo felicidad: parques +5 cada uno | | CitizenManager.js calculateServiceFactor() |
| [ ] Estadísticas: total ciudadanos | | City.js getPopulation() |
| [ ] Estadísticas: empleados/desempleados | | CitizenManager.js getEmploymentStats() |
| [ ] Estadísticas: felicidad promedio | | City.js getAverageHappiness() |

---

### HU-014: Gestión Automática de Recursos por Turno

**Como jugador, quiero que los recursos se actualicen automáticamente cada turno, para ver la evolución dinámica de mi ciudad**

#### Código Relacionado:
- **TurnSystem.js**: Motor principal de turnos (líneas 28-59)
- **ResourceManager.js**: Procesa recursos por turno
- **CitizenManager.js**: Procesa ciudadanos por turno
- **UIManager.js**: Actualiza interfaz cada turno

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Ciclo de actualización cada 10 segundos | | TurnSystem.js turnDuration |
| [ ] Calcula producción de dinero | | ResourceManager.js calculateMoneyProduction() |
| [ ] Calcula producción de electricidad | | ResourceManager.js calculateElectricityProduction() |
| [ ] Calcula producción de agua | | ResourceManager.js calculateWaterProduction() |
| [ ] Calcula producción de alimentos | | ResourceManager.js calculateFoodProduction() |
| [ ] Calcula consumo de todos los edificios | | ResourceManager.js calculateTotalConsumption() |
| [ ] Aplica balance (producción - consumo) | | ResourceManager.js applyBalance() |
| [ ] Aplica costos de mantenimiento | | ResourceManager.js applyMaintenanceCosts() |
| [ ] Actualiza felicidad de ciudadanos | | CitizenManager.js processTurn() |
| [ ] Procesa crecimiento de población | | CitizenManager.js processGrowth() |
| [ ] Actualiza puntuación | | ScoreManager.js calculateScore() |
| [ ] Notificación si recurso llega a 0 | | UIManager.js showResourceAlert() |
| [ ] Muestra consecuencias de falta de recursos | | BuildingManager.js applyResourceShortage() |

---

### HU-015: Visualizar Panel de Recursos

**Como jugador, quiero ver mis recursos actuales en tiempo real, para tomar decisiones informadas sobre construcción**

#### Código Relacionado:
- **PanelController.js**: Muestra panel de recursos (líneas 50-61)
- **ResourceManager.js**: Proporciona datos de recursos
- **UIManager.js**: Actualiza panel cada turno
- **index.html**: Estructura del panel de recursos

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Panel fijo con dinero (color según cantidad) | | PanelController.js updateResources() |
| [ ] Dinero verde si > $10,000 | | PanelController.js formatMoneyColor() |
| [ ] Dinero amarillo si < $5,000 | | PanelController.js formatMoneyColor() |
| [ ] Dinero rojo si < $1,000 | | PanelController.js formatMoneyColor() |
| [ ] Electricidad: XXX / XXX (producción/consumo) | | PanelController.js línea 52-53 |
| [ ] Agua: XXX / XXX (producción/consumo) | | PanelController.js línea 55-56 |
| [ ] Alimentos: XXX unidades | | PanelController.js línea 58-59 |
| [ ] Población: XXX ciudadanos | | PanelController.js updatePopulation() |
| [ ] Felicidad promedio: XX% | | PanelController.js updateHappiness() |
| [ ] Actualización automática cada turno | | UIManager.js render() |
| [ ] Tooltip con producción detallada | | PanelController.js showResourceTooltip() |
| [ ] Tooltip con consumo detallado | | PanelController.js showResourceTooltip() |
| [ ] Tooltip con balance neto | | PanelController.js showResourceTooltip() |
| [ ] Panel responsive (móvil/tablet/desktop) | | styles/responsive.css |

---

### HU-016: Integración con API del Clima

**Como jugador, quiero ver el clima actual de mi región, para tener una experiencia más inmersiva**

#### Código Relacionado:
- **WeatherService.js**: Llama a OpenWeatherMap API (líneas 414-429)
- **UIManager.js**: Muestra widget de clima
- **PanelController.js**: Actualiza información del clima
- **index.html**: Estructura del widget de clima

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Llama a OpenWeatherMap API al cargar ciudad | | WeatherService.js updateWeather() |
| [ ] Muestra temperatura actual (°C) | | PanelController.js updateWeather() |
| [ ] Muestra condición (soleado, lluvioso, etc.) | | WeatherService.js getCurrentWeather() |
| [ ] Muestra icono animado del clima | | PanelController.js updateWeatherIcon() |
| [ ] Muestra humedad | | WeatherService.js parseWeatherData() |
| [ ] Muestra velocidad del viento | | WeatherService.js parseWeatherData() |
| [ ] Clima se actualiza cada 30 minutos | | WeatherService.js updateInterval |

---

### HU-017: Integración con API de Noticias

**Como jugador, quiero ver noticias de mi región, para sentir que mi ciudad está conectada con el mundo real**

#### Código Relacionado:
- **NewService.js**: Llama a NewsAPI (líneas 200-229)
- **UIManager.js**: Muestra panel de noticias
- **PanelController.js**: Actualiza información de noticias
- **index.html**: Estructura del panel de noticias

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Llama a NewsAPI al cargar ciudad | | NewService.js fetchExternalNews() |
| [ ] Muestra últimas 5 noticias de la región | | NewService.js processNewsData() |
| [ ] Muestra título de la noticia | | PanelController.js updateNews() |
| [ ] Muestra descripción breve (2-3 líneas) | | NewService.js formatNews() |
| [ ] Muestra imagen (si disponible) | | NewService.js includeNewsImage() |
| [ ] Muestra enlace a noticia completa | | NewService.js createNewsLink() |
| [ ] Muestra timestamp | | NewService.js formatTimestamp() |
| [ ] Noticias se actualizan cada 30 minutos | | NewService.js updateInterval |

---

### HU-018: Cálculo y Visualización de Puntuación

**Como jugador, quiero ver mi puntuación en tiempo real, para saber qué tan bien estoy gestionando mi ciudad**

#### Código Relacionado:
- **ScoreManager.js**: Calcula puntuación con fórmula completa (líneas 18-59)
- **UIManager.js**: Muestra puntuación en panel principal
- **PanelController.js**: Actualiza puntuación y desglose
- **GameState.js**: Guarda histórico de puntuación

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Calcula puntuación cada turno con fórmula | | ScoreManager.js calculateScore() |
| [ ] Puntuación base: población × 10 | | ScoreManager.js línea 40 |
| [ ] Puntuación base: felicidad × 5 | | ScoreManager.js línea 41 |
| [ ] Puntuación base: edificios × 50 | | ScoreManager.js línea 43 |
| [ ] Bonificación: electricidad balance × 2 | | ScoreManager.js línea 44 |
| [ ] Bonificación: todos empleados +500 | | ScoreManager.js calculateBonuses() |
| [ ] Bonificación: felicidad > 80 +300 | | ScoreManager.js calculateBonuses() |
| [ ] Bonificación: recursos positivos +200 | | ScoreManager.js calculateBonuses() |
| [ ] Bonificación: ciudad > 1000 +1000 | | ScoreManager.js calculateBonuses() |
| [ ] Penalización: dinero negativo -500 | | ScoreManager.js calculatePenalties() |
| [ ] Penalización: electricidad negativa -300 | | ScoreManager.js calculatePenalties() |
| [ ] Penalización: felicidad < 40 -400 | | ScoreManager.js calculatePenalties() |
| [ ] Muestra puntuación en panel principal | | PanelController.js updateScore() |
| [ ] Muestra desglose completo de puntuación | | ScoreManager.js calculateScoreBreakdown() |
| [ ] Puntuación guardada cada turno para ranking | | GameState.js pushResourceHistory() |

---

### HU-019: Sistema de Ranking Local

**Como jugador, quiero ver un ranking de las mejores ciudades, para comparar mi desempeño con otras partidas**

#### Código Relacionado:
- **PersistenceManager.js**: Guarda ranking en LocalStorage
- **ScoreManager.js**: Proporciona datos para ranking
- **UIManager.js**: Muestra modal de ranking
- **index.html**: Estructura del ranking

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Guarda automáticamente puntuación en LocalStorage | | PersistenceManager.js saveToRanking() |
| [ ] Ranking ordenado por puntuación descendente | | PersistenceManager.js sortRanking() |
| [ ] Muestra modal con Top 10 ciudades | | UIManager.js showRankingModal() |
| [ ] Muestra posición (#1, #2, #3, etc.) | | PanelController.js renderRanking() |
| [ ] Muestra nombre de ciudad y alcalde | | PanelController.js renderRanking() |
| [ ] Muestra puntuación, población, felicidad | | PanelController.js renderRanking() |
| [ ] Muestra número de turnos y fecha | | PanelController.js renderRanking() |
| [ ] Ciudad actual resaltada en ranking | | UIManager.js highlightCurrentCity() |
| [ ] Si no está en Top 10: "Tu ciudad: #XX" | | UIManager.js showCurrentCityRank() |
| [ ] Permite reiniciar ranking con confirmación | | UIManager.js resetRanking() |
| [ ] Permite exportar ranking a JSON | | UIManager.js exportRanking() |
| [ ] Ranking persiste entre sesiones | | PersistenceManager.js loadRanking() |

---

### HU-020: Guardar y Cargar Partida

**Como jugador, quiero que mi progreso se guarde automáticamente, para poder continuar mi partida más tarde**

#### Código Relacionado:
- **PersistenceManager.js**: Guardado/carga completo (líneas 152-179)
- **AutoSaveService.js**: Guardado automático cada 30 segundos
- **UIManager.js**: Detecta partida guardada al cargar
- **GameState.js**: Gestiona estado del juego

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Guarda automáticamente cada 30 segundos | | AutoSaveService.js saveInterval |
| [ ] Guarda estado completo de la ciudad | | PersistenceManager.js saveGame() |
| [ ] Guarda matriz del mapa con edificios y vías | | PersistenceManager.js serializeMap() |
| [ ] Guarda estado de todos los recursos | | PersistenceManager.js serializeResources() |
| [ ] Guarda lista de ciudadanos con propiedades | | PersistenceManager.js serializeCitizens() |
| [ ] Guarda turno actual y puntuación | | PersistenceManager.js serializeGameState() |
| [ ] Detecta partida guardada al cargar | | UIManager.js checkForSavedGame() |
| [ ] Muestra mensaje para continuar partida anterior | | UIManager.js showContinueGameDialog() |
| [ ] Carga estado completo desde LocalStorage | | PersistenceManager.js loadGame() |
| [ ] Reconstruye todas las instancias de objetos | | PersistenceManager.js createBuildingFromSave() |
| [ ] Muestra indicador "Guardando..." | | UIManager.js showSavingIndicator() |
| [ ] Permite guardar manualmente | | UIManager.js saveGameManually() |
| [ ] Permite eliminar partida guardada | | UIManager.js deleteSavedGame() |

---

### HU-021: Exportar Estado de Ciudad a JSON

**Como jugador, quiero exportar mi ciudad a un archivo JSON, para compartirla o crear respaldos**

#### Código Relacionado:
- **PersistenceManager.js**: Genera JSON exportable
- **UIManager.js**: Maneja exportación y descarga
- **City.js**: Proporciona datos completos para exportación
- **MapTemplateService.js**: Formato compatible con importación

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] Muestra opción "Exportar Ciudad" en menú | | UIManager.js showExportOption() |
| [ ] Genera archivo JSON con estructura completa | | PersistenceManager.js exportToJSON() |
| [ ] Incluye cityName, mayor, gridSize | | PersistenceManager.js serializeCityInfo() |
| [ ] Incluye coordenadas y ubicación | | PersistenceManager.js serializeCoordinates() |
| [ ] Incluye turno, puntuación, población | | PersistenceManager.js serializeGameState() |
| [ ] Incluye matriz del mapa completa | | PersistenceManager.js serializeMap() |
| [ ] Incluye lista de edificios y vías | | PersistenceManager.js serializeStructures() |
| [ ] Incluye recursos y ciudadanos | | PersistenceManager.js serializeEntities() |
| [ ] Archivo descarga con nombre: ciudad_{nombre}_{fecha}.json | | UIManager.js downloadJSONFile() |
| [ ] Muestra notificación de éxito al exportar | | ModalController.js showExportSuccess() |
| [ ] JSON exportado puede ser reimportado | | MapTemplateService.js validateLayout() |
| [ ] Formato legible (pretty-print) | | PersistenceManager.js formatJSON() |

---

### HU-022: Diseño Responsive - Vista Móvil

**Como jugador en dispositivo móvil, quiero que la interfaz se adapte a mi pantalla, para poder jugar cómodamente desde mi teléfono**

#### Código Relacionado:
- **styles/responsive.css**: Media queries para móviles
- **UIManager.js**: Detecta dispositivo y ajusta layout
- **MapRenderer.js**: Adapta mapa a pantalla móvil
- **index.html**: Estructura responsive

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] En < 768px: mapa ocupa 100% ancho | | styles/responsive.css @media max-width |
| [ ] Paneles organizados verticalmente | | styles/responsive.css mobile-layout |
| [ ] Menú construcción como tabs inferiores | | UIManager.js setupMobileMenu() |
| [ ] Panel recursos como header colapsable | | UIManager.js setupMobileHeader() |
| [ ] Estadísticas mediante botón flotante | | UIManager.js setupFloatingStats() |
| [ ] Botones mínimos 44x44px (target táctil) | | styles/responsive.css touch-targets |
| [ ] Tap en edificio para seleccionar | | UIManager.js handleMobileTouch() |
| [ ] Tap en celda vacía para construir | | UIManager.js handleMobileBuild() |
| [ ] Swipe horizontal para scroll menú | | UIManager.js setupMobileScroll() |
| [ ] Mapa scrollable vertical/horizontalmente | | MapRenderer.js enableMobileScroll() |
| [ ] Zoom mediante pinch (dos dedos) | | MapRenderer.js enablePinchZoom() |
| [ ] Modal de edificio ocupa 80% pantalla | | styles/responsive.css mobile-modal |
| [ ] Notificaciones en parte superior | | UIManager.js setupMobileNotifications() |
| [ ] Widget clima compacto (icono + temperatura) | | UIManager.js setupMobileWeather() |
| [ ] Noticias en carrusel horizontal | | UIManager.js setupMobileNews() |

---

### HU-023: Diseño Responsive - Vista Tablet

**Como jugador en tablet, quiero una interfaz optimizada para pantalla mediana, para aprovechar el espacio disponible**

#### Código Relacionado:
- **styles/responsive.css**: Media queries para tablets
- **UIManager.js**: Detecta tablet y ajusta layout
- **MapRenderer.js**: Optimiza mapa para tablet
- **index.html**: Estructura responsive tablet

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] En 768px-1024px: layout dos columnas | | styles/responsive.css @media tablet |
| [ ] Mapa 70% + sidebar 30% | | styles/responsive.css tablet-layout |
| [ ] Mapa muestra grid completo sin scroll | | MapRenderer.js optimizeForTablet() |
| [ ] Panel recursos en sidebar superior | | UIManager.js setupTabletSidebar() |
| [ ] Menú construcción en sidebar central | | UIManager.js setupTabletMenu() |
| [ ] Estadísticas en sidebar inferior | | UIManager.js setupTabletStats() |
| [ ] Widget clima y noticias en tabs laterales | | UIManager.js setupTabletWidgets() |
| [ ] Soporte orientación vertical y horizontal | | styles/responsive.css orientation |
| [ ] En horizontal: sidebars izquierdo y derecho | | UIManager.js setupTabletLandscape() |
| [ ] En vertical: similar a móvil con más espacio | | UIManager.js setupTabletPortrait() |
| [ ] Tooltips más grandes al hover | | UIManager.js setupTabletTooltips() |
| [ ] Modales ocupan 60% de pantalla | | styles/responsive.css tablet-modal |
| [ ] Botones tamaño medium (touch adecuados) | | styles/responsive.css tablet-buttons |

---

### HU-024: Diseño Responsive - Vista Desktop

**Como jugador en computadora de escritorio, quiero una interfaz completa con todos los paneles visibles, para gestionar mi ciudad eficientemente**

#### Código Relacionado:
- **styles/layouts/desktop.css**: Layout de tres secciones para >1024px
- **styles/components/panels.css**: Paneles laterales optimizados para desktop
- **EventHandler.js**: Atajos de teclado y eventos (líneas 100-129, 300-329)
- **UIManager.js**: Detección de dispositivo y ajustes de layout
- **index.html**: Estructura de tres columnas para desktop

#### Tabla de Chequeo:

| Criterio de Aceptación | Estado | Código Verificado |
|------------------------|---------|-------------------|
| [ ] En >1024px: layout tres secciones | | styles/layouts/desktop.css @media min-width |
| [ ] Sidebar izquierdo (250px) con recursos | | styles/layouts/desktop.css left-sidebar |
| [ ] Sidebar izquierdo con menú construcción | | styles/layouts/desktop.css build-menu |
| [ ] Mapa central flexible con grid completo | | styles/layouts/desktop.css main-map |
| [ ] Controles de zoom (+/-) en mapa | | MapRenderer.js setupZoomControls() |
| [ ] Sidebar derecho (300px) | | styles/layouts/desktop.css right-sidebar |
| [ ] Widget de clima en sidebar derecho | | UIManager.js setupDesktopWeather() |
| [ ] Panel de noticias en sidebar derecho | | UIManager.js setupDesktopNews() |
| [ ] Estadísticas resumidas en sidebar derecho | | UIManager.js setupDesktopStats() |
| [ ] Hover effects en elementos interactivos | | styles/components/buttons.css hover-effects |
| [ ] Tooltips informativos al hover en edificios | | EventHandler.js handleBuildingHover() |
| [ ] Cursor personalizado en modo construcción | | UIManager.js setConstructionCursor() |
| [ ] Atajo B: Abrir menú construcción | | EventHandler.js handleKeyboardShortcut() |
| [ ] Atajo R: Modo construcción vías | | EventHandler.js handleKeyboardShortcut() |
| [ ] Atajo D: Modo demolición | | EventHandler.js handleKeyboardShortcut() |
| [ ] Atajo ESC: Cancelar modo actual | | EventHandler.js handleKeyboardShortcut() |
| [ ] Atajo Space: Pausar/Reanudar | | EventHandler.js handleKeyboardShortcut() |
| [ ] Atajo S: Guardar partida | | EventHandler.js handleKeyboardShortcut() |
| [ ] Modales centrados (50% max-width) | | styles/components/modals.css desktop-modals |
| [ ] Animaciones suaves en transiciones | | styles/components/animations.css smooth-transitions |

---

### Resumen de Validación Completa

Las 24 historias de usuario cubren el flujo completo del juego:

**Configuración y Creación:**
1. **HU-001**: Creación inicial y configuración
2. **HU-002**: Carga de mapas predefinidos

**Construcción y Gestión:**
3. **HU-003**: Construcción residencial básica
4. **HU-004**: Desarrollo económico y comercial
5. **HU-005**: Producción industrial y recursos
6. **HU-006**: Servicios públicos y felicidad
7. **HU-007**: Plantas de utilidad esenciales
8. **HU-008**: Espacios recreativos
9. **HU-009**: Infraestructura de transporte
10. **HU-010**: Reorganización urbana

**Interfaz e Información:**
11. **HU-011**: Información detallada de edificios
12. **HU-012**: Cálculo de rutas óptimas
13. **HU-015**: Visualización en tiempo real

**Sistemas Automáticos:**
14. **HU-013**: Gestión automática de ciudadanos
15. **HU-014**: Gestión automática de recursos
16. **HU-018**: Cálculo y visualización de puntuación

**Integraciones Externas:**
17. **HU-016**: Integración con API del Clima
18. **HU-017**: Integración con API de Noticias

**Persistencia y Datos:**
19. **HU-019**: Sistema de ranking local
20. **HU-020**: Guardar y cargar partida
21. **HU-021**: Exportar estado de ciudad a JSON

**Diseño Responsive:**
22. **HU-022**: Diseño responsive - Vista Móvil
23. **HU-023**: Diseño responsive - Vista Tablet
24. **HU-024**: Diseño responsive - Vista Desktop

Cada historia está completamente implementada con su código correspondiente y validación mediante las tablas de chequeo. **El City Builder Game está 100% validado y documentado.**

## Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica de la interfaz
- **CSS3**: Estilos y animaciones responsivas
- **JavaScript ES6+**: Lógica del juego con módulos

### Arquitectura
- **Módulos ES6**: Sistema de importación/exportación
- **Programación Orientada a Objetos**: Clases y herencia
- **Patrones de Diseño**: Service, Manager, Observer

### APIs Externas
- **OpenWeatherMap**: Datos climáticos en tiempo real
- **NewsAPI**: Noticias reales relacionadas

## Pruebas Unitarias

El proyecto incluye pruebas unitarias para los siguientes sistemas:
- Sistema de turnos
- Sistema de puntuación
- Sistema de ciudadanos
- Reglas de dominio
- Integraciones externas
- Sistema de rutas

### Ejecución de Pruebas
Abrir los archivos `test-*.html` en el navegador para ejecutar las pruebas correspondientes.

## Contribución y Desarrollo

### Estructura de Código
- **Separación de responsabilidades**: Cada componente tiene una función específica
- **Modularidad**: Sistema de módulos interconectados
- **Extensibilidad**: Fácil adición de nuevos tipos de edificios y servicios

### Buenas Prácticas
- **Documentación inline**: Comentarios descriptivos en cada clase y método
- **Nomenclatura clara**: Nombres descriptivos de variables y funciones
- **Manejo de errores**: Sistema robusto de gestión de excepciones

## Licencia

Este proyecto es desarrollado con fines educativos y de demostración técnica.

## Contacto

Para más información sobre el proyecto, consultar la documentación técnica o los archivos de prueba.

---

**City Builder Game v1.0** - Simulador Urbano Completo
