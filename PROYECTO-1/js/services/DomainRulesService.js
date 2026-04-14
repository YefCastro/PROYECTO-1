/**
 * ============================================
 * CITY BUILDER GAME - DOMAIN RULES SERVICE
 * ============================================
 * Enforces all domain rules for construction, population, routing, and persistence
 */

export class DomainRulesService {

    constructor(city) {
        this.city = city;
    }

    // =========================
    // A. REGLAS DE CONSTRUCCIÓN
    // =========================

    /**
     * 1. Exclusividad espacial: Una celda no puede estar ocupada por más de un elemento
     */
    checkSpatialExclusivity(x, y) {
        if (!this.city.map.isWithinBounds(x, y)) {
            return { valid: false, message: "Posición fuera del mapa" };
        }

        if (!this.city.map.isCellEmpty(x, y)) {
            return { valid: false, message: "Celda ocupada por otro elemento" };
        }

        return { valid: true };
    }

    /**
     * 2. Restricción presupuestaria: No se puede construir si el costo excede el dinero disponible
     */
    checkBudgetRestriction(cost) {
        if (!this.city.resources.hasEnoughMoney(cost)) {
            return { 
                valid: false, 
                message: `Dinero insuficiente. Se requieren $${cost}, disponible: $${this.city.resources.money}` 
            };
        }

        return { valid: true };
    }

    /**
     * 3. Adyacencia obligatoria: Los edificios deben estar al lado de vías adyacentes
     */
    checkMandatoryAdjacency(x, y, buildingType) {
        // Roads don't require adjacency to other roads
        if (buildingType === "ROAD") {
            return { valid: true };
        }

        // Check if building has road access
        const hasRoadAccess = this.hasAdjacentRoad(x, y);
        
        if (!hasRoadAccess) {
            return { 
                valid: false, 
                message: "Los edificios deben estar adyacentes a una vía" 
            };
        }

        return { valid: true };
    }

    /**
     * 4. Límite territorial: El tamaño del mapa es fijo, no se puede expandir
     */
    checkTerritorialLimit(x, y) {
        if (!this.city.map.isWithinBounds(x, y)) {
            return { 
                valid: false, 
                message: `Posición (${x}, ${y}) fuera de los límites del mapa (${this.city.map.width}x${this.city.map.height})` 
            };
        }

        return { valid: true };
    }

    /**
     * Verificar todas las reglas de construcción
     */
    validateConstruction(x, y, buildingType, cost) {
        const rules = [
            () => this.checkTerritorialLimit(x, y),
            () => this.checkSpatialExclusivity(x, y),
            () => this.checkBudgetRestriction(cost),
            () => this.checkMandatoryAdjacency(x, y, buildingType)
        ];

        for (const rule of rules) {
            const result = rule();
            if (!result.valid) {
                return result;
            }
        }

        return { valid: true };
    }

    /**
     * Verificar si hay vía adyacente
     */
    hasAdjacentRoad(x, y) {
        const directions = [
            { dx: 0, dy: -1 },  // arriba
            { dx: 1, dy: 0 },   // derecha
            { dx: 0, dy: 1 },   // abajo
            { dx: -1, dy: 0 }   // izquierda
        ];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (this.city.map.isWithinBounds(nx, ny)) {
                const entity = this.city.map.getEntity(nx, ny);
                if (entity && entity.type === "road") {
                    return true;
                }
            }
        }

        return false;
    }

    // =========================
    // B. REGLAS DE POBLACIÓN
    // =========================

    /**
     * 1. Capacidad residencial: Ciudadanos no pueden exceder la suma de capacidades
     */
    checkResidentialCapacity() {
        const totalCapacity = this.calculateTotalResidentialCapacity();
        const currentPopulation = this.city.getPopulation();

        if (currentPopulation > totalCapacity) {
            return { 
                valid: false, 
                message: `Población (${currentPopulation}) excede la capacidad residencial (${totalCapacity})` 
            };
        }

        return { valid: true };
    }

    /**
     * 2. Requisitos de crecimiento
     */
    checkGrowthRequirements() {
        const requirements = [
            { name: "Capacidad de vivienda", check: () => this.hasAvailableHousing() },
            { name: "Felicidad promedio > 60", check: () => this.checkHappinessThreshold() },
            { name: "Empleos disponibles", check: () => this.hasAvailableJobs() }
        ];

        const failedRequirements = [];
        
        for (const requirement of requirements) {
            if (!requirement.check()) {
                failedRequirements.push(requirement.name);
            }
        }

        if (failedRequirements.length > 0) {
            return { 
                valid: false, 
                message: `Requisitos de crecimiento no cumplidos: ${failedRequirements.join(", ")}` 
            };
        }

        return { valid: true };
    }

    /**
     * 3. Asignación automática: Ciudadanos sin hogar/empleo se asignan automáticamente
     */
    performAutomaticAssignment() {
        const homelessCitizens = this.getHomelessCitizens();
        const unemployedCitizens = this.getUnemployedCitizens();

        // Assign housing to homeless citizens
        for (const citizen of homelessCitizens) {
            this.assignHousing(citizen);
        }

        // Assign jobs to unemployed citizens
        for (const citizen of unemployedCitizens) {
            this.assignJob(citizen);
        }

        return {
            housedCitizens: homelessCitizens.filter(c => c.homeId !== null).length,
            employedCitizens: unemployedCitizens.filter(c => c.isEmployed).length
        };
    }

    /**
     * Calcular capacidad residencial total
     */
    calculateTotalResidentialCapacity() {
        return this.city.buildings
            .filter(building => building.type === "residential")
            .reduce((total, building) => total + building.capacity, 0);
    }

    /**
     * Verificar si hay viviendas disponibles
     */
    hasAvailableHousing() {
        const totalCapacity = this.calculateTotalResidentialCapacity();
        const currentPopulation = this.city.getPopulation();
        return currentPopulation < totalCapacity;
    }

    /**
     * Verificar umbral de felicidad
     */
    checkHappinessThreshold() {
        const averageHappiness = this.city.getAverageHappiness();
        return averageHappiness > 60;
    }

    /**
     * Verificar si hay empleos disponibles
     */
    hasAvailableJobs() {
        const totalJobs = this.calculateTotalJobCapacity();
        const employedCitizens = this.city.getPopulation() - this.getUnemployedCitizens().length;
        return totalJobs > employedCitizens;
    }

    /**
     * Calcular capacidad total de empleos
     */
    calculateTotalJobCapacity() {
        return this.city.buildings
            .filter(building => building.type === "commercial" || building.type === "industrial")
            .reduce((total, building) => total + building.capacity, 0);
    }

    /**
     * Obtener ciudadanos sin hogar
     */
    getHomelessCitizens() {
        return this.city.citizens.filter(citizen => !citizen.homeId);
    }

    /**
     * Obtener ciudadanos desempleados
     */
    getUnemployedCitizens() {
        return this.city.citizens.filter(citizen => !citizen.isEmployed);
    }

    /**
     * Asignar vivienda a un ciudadano
     */
    assignHousing(citizen) {
        const residentialBuildings = this.city.buildings
            .filter(building => building.type === "residential")
            .filter(building => building.getResidentCount() < building.capacity);

        if (residentialBuildings.length > 0) {
            const building = residentialBuildings[0];
            building.addResident(citizen);
            citizen.assignHome(building.id);
            return true;
        }

        return false;
    }

    /**
     * Asignar empleo a un ciudadano
     */
    assignJob(citizen) {
        const jobBuildings = this.city.buildings
            .filter(building => building.type === "commercial" || building.type === "industrial")
            .filter(building => building.getEmployeeCount() < building.capacity);

        if (jobBuildings.length > 0) {
            const building = jobBuildings[0];
            building.addEmployee(citizen);
            citizen.employ();
            return true;
        }

        return false;
    }

    // =========================
    // C. REGLAS DE RUTAS
    // =========================

    /**
     * 1. Transitabilidad: Solo las vías son transitables
     */
    checkTransitability(x, y) {
        if (!this.city.map.isWithinBounds(x, y)) {
            return { valid: false, message: "Posición fuera del mapa" };
        }

        const entity = this.city.map.getEntity(x, y);
        if (!entity || entity.type !== "road") {
            return { valid: false, message: "Solo las vías son transitables" };
        }

        return { valid: true };
    }

    /**
     * 2. Existencia de camino: Si no hay secuencia de vías conectando origen y destino, no hay ruta
     */
    checkRouteExistence(startX, startY, endX, endY) {
        // Check if start and end positions are traversable
        const startCheck = this.checkTransitability(startX, startY);
        if (!startCheck.valid) {
            return { valid: false, message: "El origen no es una posición transitable" };
        }

        const endCheck = this.checkTransitability(endX, endY);
        if (!endCheck.valid) {
            return { valid: false, message: "El destino no es una posición transitable" };
        }

        // Check if there's a path using BFS
        const path = this.findPath(startX, startY, endX, endY);
        if (!path) {
            return { valid: false, message: "No existe una secuencia de vías conectando origen y destino" };
        }

        return { valid: true, path };
    }

    /**
     * 3. Optimalidad: El algoritmo siempre retorna la ruta de menor distancia
     */
    findOptimalRoute(startX, startY, endX, endY) {
        const routeCheck = this.checkRouteExistence(startX, startY, endX, endY);
        
        if (!routeCheck.valid) {
            return routeCheck;
        }

        // Use Dijkstra algorithm for optimal path
        const optimalPath = this.dijkstra(startX, startY, endX, endY);
        
        return { 
            valid: true, 
            path: optimalPath,
            distance: optimalPath ? optimalPath.length - 1 : 0
        };
    }

    /**
     * Encontrar camino usando BFS (para verificación de existencia)
     */
    findPath(startX, startY, endX, endY) {
        const visited = new Set();
        const queue = [{ x: startX, y: startY, path: [{ x: startX, y: startY }] }];
        visited.add(`${startX},${startY}`);

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.x === endX && current.y === endY) {
                return current.path;
            }

            const neighbors = this.getTraversableNeighbors(current.x, current.y);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...current.path, { x: neighbor.x, y: neighbor.y }]
                    });
                }
            }
        }

        return null;
    }

    /**
     * Algoritmo de Dijkstra para ruta óptima
     */
    dijkstra(startX, startY, endX, endY) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Initialize all road cells
        for (let y = 0; y < this.city.map.height; y++) {
            for (let x = 0; x < this.city.map.width; x++) {
                if (this.isRoad(x, y)) {
                    const key = `${x},${y}`;
                    distances.set(key, key === `${startX},${startY}` ? 0 : Infinity);
                    previous.set(key, null);
                    unvisited.add(key);
                }
            }
        }

        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let currentKey = null;
            let minDistance = Infinity;

            for (const key of unvisited) {
                const distance = distances.get(key);
                if (distance < minDistance) {
                    minDistance = distance;
                    currentKey = key;
                }
            }

            if (currentKey === null || minDistance === Infinity) {
                break;
            }

            unvisited.delete(currentKey);

            if (currentKey === `${endX},${endY}`) {
                return this.reconstructPath(previous, endX, endY);
            }

            const [currentX, currentY] = currentKey.split(',').map(Number);
            const neighbors = this.getTraversableNeighbors(currentX, currentY);

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (unvisited.has(neighborKey)) {
                    const altDistance = distances.get(currentKey) + 1;
                    if (altDistance < distances.get(neighborKey)) {
                        distances.set(neighborKey, altDistance);
                        previous.set(neighborKey, currentKey);
                    }
                }
            }
        }

        return null;
    }

    /**
     * Reconstruir camino desde el mapa de anteriores
     */
    reconstructPath(previous, endX, endY) {
        const path = [];
        let currentKey = `${endX},${endY}`;

        while (currentKey) {
            const [x, y] = currentKey.split(',').map(Number);
            path.unshift({ x, y });
            currentKey = previous.get(currentKey);
        }

        return path;
    }

    /**
     * Verificar si una celda es una vía
     */
    isRoad(x, y) {
        const entity = this.city.map.getEntity(x, y);
        return entity && entity.type === "road";
    }

    /**
     * Obtener vecinos transitables
     */
    getTraversableNeighbors(x, y) {
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ];

        const neighbors = [];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (this.city.map.isWithinBounds(nx, ny) && this.isRoad(nx, ny)) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    // =========================
    // D. REGLAS DE PERSISTENCIA
    // =========================

    /**
     * 1. Guardado automático: Cada 30 segundos
     */
    getAutoSaveInterval() {
        return 30 * 1000; // 30 segundos en milisegundos
    }

    /**
     * 2. Guardado en LocalStorage: Toda la ciudad se serializa a JSON
     */
    saveToLocalStorage() {
        try {
            const cityData = this.city.toJSON();
            const json = JSON.stringify(cityData);
            localStorage.setItem('cityBuilderGame_save', json);
            return { success: true, message: "Ciudad guardada en LocalStorage" };
        } catch (error) {
            return { success: false, message: `Error al guardar: ${error.message}` };
        }
    }

    /**
     * Cargar desde LocalStorage
     */
    loadFromLocalStorage() {
        try {
            const json = localStorage.getItem('cityBuilderGame_save');
            if (!json) {
                return { success: false, message: "No hay partida guardada" };
            }

            const cityData = JSON.parse(json);
            return { success: true, data: cityData };
        } catch (error) {
            return { success: false, message: `Error al cargar: ${error.message}` };
        }
    }

    /**
     * 3. Exportación opcional: El jugador puede exportar manualmente a archivo JSON
     */
    exportToJSON() {
        try {
            const cityData = this.city.toJSON();
            const json = JSON.stringify(cityData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `city_builder_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return { success: true, message: "Ciudad exportada a archivo JSON" };
        } catch (error) {
            return { success: false, message: `Error al exportar: ${error.message}` };
        }
    }

    /**
     * Importar desde archivo JSON
     */
    importFromJSON(jsonData) {
        try {
            const cityData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            return { success: true, data: cityData };
        } catch (error) {
            return { success: false, message: `Error al importar: ${error.message}` };
        }
    }
}
