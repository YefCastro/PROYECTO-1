/**
 * ============================================
 * CITY BUILDER GAME - ROUTING SERVICE
 * ============================================
 * Maneja conectividad vial y calcula rutas
 * reales sobre la red de carreteras.
 */

import { DomainRulesService } from "./DomainRulesService.js";

export class RoutingService {

    constructor(city) {
        this.city = city;
        this.domainRules = new DomainRulesService(city);
    }

    buildKey(x, y) {
        return `${x},${y}`;
    }

    parseKey(key) {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
    }

    normalizePoint(point) {
        return {
            x: Number(point?.x),
            y: Number(point?.y)
        };
    }

    isValidPoint(point) {
        return Number.isInteger(point.x) && Number.isInteger(point.y);
    }

    isRoadTile(x, y) {
        const tile = this.city.map.getEntity(x, y);
        return Boolean(tile && String(tile.type).toLowerCase() === "road");
    }

    getDirections() {
        return [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
    }

    getRoadNeighbors(x, y) {
        return this.getDirections()
            .map(({ dx, dy }) => ({ x: x + dx, y: y + dy }))
            .filter(point => {
                return this.city.map.isWithinBounds(point.x, point.y)
                    && this.isRoadTile(point.x, point.y);
            });
    }

    getAccessibleRoadTiles(x, y) {
        if (!this.city.map.isWithinBounds(x, y)) {
            return [];
        }

        if (this.isRoadTile(x, y)) {
            return [{ x, y }];
        }

        return this.getRoadNeighbors(x, y);
    }

    /**
     * Verifica si una posicion tiene carretera adyacente
     */
    hasRoadAccess(x, y) {
        return this.getAccessibleRoadTiles(x, y).length > 0;
    }

    /**
     * Verifica conectividad vial para una celda edificable
     */
    isConnectedToRoad(x, y) {
        return this.hasRoadAccess(x, y);
    }

    reconstructPath(previous, endKey) {
        const path = [];
        let currentKey = endKey;

        while (currentKey) {
            path.unshift(this.parseKey(currentKey));
            currentKey = previous.get(currentKey) || null;
        }

        return path;
    }

    /**
     * Genera matriz del mapa para el backend
     * 0 = celda no transitable (edificios, terreno vacío)
     * 1 = celda transitable (vías)
     */
    generateMapMatrix() {
        const map = this.city.map;
        const matrix = [];

        for (let y = 0; y < map.height; y++) {
            const row = [];
            for (let x = 0; x < map.width; x++) {
                // 1 si es vía, 0 si no es transitable
                row.push(this.isRoadTile(x, y) ? 1 : 0);
            }
            matrix.push(row);
        }

        return matrix;
    }

    /**
     * Implementación del algoritmo de Dijkstra
     */
    dijkstra(start, end) {
        const startKey = this.buildKey(start.x, start.y);
        const endKey = this.buildKey(end.x, end.y);

        // Inicializar distancias
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Configurar punto inicial
        distances.set(startKey, 0);
        previous.set(startKey, null);

        // Inicializar todos los nodos con distancia infinita
        for (let y = 0; y < this.city.map.height; y++) {
            for (let x = 0; x < this.city.map.width; x++) {
                if (this.isRoadTile(x, y)) {
                    const key = this.buildKey(x, y);
                    if (key !== startKey) {
                        distances.set(key, Infinity);
                    }
                    unvisited.add(key);
                }
            }
        }

        while (unvisited.size > 0) {
            // Encontrar el nodo no visitado con menor distancia
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
                break; // No hay más nodos alcanzables
            }

            unvisited.delete(currentKey);

            // Si llegamos al destino, reconstruir el camino
            if (currentKey === endKey) {
                return this.reconstructPath(previous, endKey);
            }

            // Explorar vecinos
            const current = this.parseKey(currentKey);
            const neighbors = this.getRoadNeighbors(current.x, current.y);

            for (const neighbor of neighbors) {
                const neighborKey = this.buildKey(neighbor.x, neighbor.y);

                if (!unvisited.has(neighborKey)) {
                    continue;
                }

                // Todas las aristas tienen peso 1 (movimiento entre celdas adyacentes)
                const altDistance = distances.get(currentKey) + 1;

                if (altDistance < distances.get(neighborKey)) {
                    distances.set(neighborKey, altDistance);
                    previous.set(neighborKey, currentKey);
                }
            }
        }

        return null; // No hay ruta
    }

    /**
     * Calcula ruta usando Dijkstra
     */
    findRoute(startPoint, endPoint) {
        const start = this.normalizePoint(startPoint);
        const end = this.normalizePoint(endPoint);

        // Use DomainRulesService for route validation and optimal path finding
        const routeResult = this.domainRules.findOptimalRoute(start.x, start.y, end.x, end.y);

        if (!routeResult.valid) {
            return { success: false, message: routeResult.message };
        }

        return {
            success: true,
            origin: start,
            destination: end,
            path: routeResult.path,
            distance: routeResult.distance,
            cost: routeResult.distance,
            accessedFromRoad: this.isRoadTile(start.x, start.y),
            accessedToRoad: this.isRoadTile(end.x, end.y)
        };
    }

    /**
     * Calcula ruta vía backend API
     */
    async calculateRouteViaBackend(startPoint, endPoint) {
        const matrix = this.generateMapMatrix();
        const start = this.normalizePoint(startPoint);
        const end = this.normalizePoint(endPoint);

        try {
            const response = await fetch('/api/calculate-route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    matrix: matrix,
                    start: { x: start.x, y: start.y },
                    end: { x: end.x, y: end.y }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                return {
                    success: true,
                    origin: start,
                    destination: end,
                    path: result.path,
                    distance: result.distance || (result.path ? result.path.length - 1 : 0),
                    cost: result.distance || (result.path ? result.path.length - 1 : 0)
                };
            } else {
                return { success: false, message: result.message || "Error al calcular ruta en backend" };
            }
        } catch (error) {
            console.error('Error calling backend routing API:', error);
            // Fallback to local Dijkstra implementation
            return this.findRoute(startPoint, endPoint);
        }
    }

}
