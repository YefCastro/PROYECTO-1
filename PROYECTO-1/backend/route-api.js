/**
 * ============================================
 * CITY BUILDER GAME - ROUTING API BACKEND
 * ============================================
 * Backend service for route calculation using Dijkstra algorithm
 */

class RouteAPI {
    constructor() {
        this.setupRoutes();
    }

    setupRoutes() {
        // This would typically be set up in a proper backend server
        // For demo purposes, we'll simulate the API endpoint
        if (typeof window !== 'undefined') {
            this.setupMockAPI();
        }
    }

    setupMockAPI() {
        // Mock API endpoint for development
        window.mockRouteAPI = true;
        
        // Intercept fetch calls to /api/calculate-route only
        const originalFetch = window.fetch;
        window.fetch = async function(url, options) {
            // Only intercept our specific API endpoint
            if (typeof url === 'string' && url.includes('/api/calculate-route') && options?.method === 'POST') {
                return RouteAPI.handleCalculateRoute(options);
            }
            // Let all other calls pass through normally
            return originalFetch.call(this, url, options);
        };
    }

    static async handleCalculateRoute(options) {
        try {
            const requestBody = JSON.parse(options.body);
            const { matrix, start, end } = requestBody;

            // Implement Dijkstra algorithm
            const path = RouteAPI.dijkstra(matrix, start, end);

            if (path) {
                return new Response(JSON.stringify({
                    success: true,
                    path: path,
                    distance: path.length - 1
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'No existe una ruta continua entre origen y destino'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Error al procesar la solicitud de ruta'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Implementación del algoritmo de Dijkstra para el backend
     */
    static dijkstra(matrix, start, end) {
        const height = matrix.length;
        const width = matrix[0].length;

        // Validar coordenadas
        if (!RouteAPI.isValidCoordinate(start, width, height) || 
            !RouteAPI.isValidCoordinate(end, width, height)) {
            return null;
        }

        // Encontrar celdas de carretera adyacentes al inicio y fin
        const startRoads = RouteAPI.getAdjacentRoads(matrix, start.x, start.y);
        const endRoads = RouteAPI.getAdjacentRoads(matrix, end.x, end.y);

        if (startRoads.length === 0 || endRoads.length === 0) {
            return null;
        }

        let bestPath = null;
        let shortestDistance = Infinity;

        // Probar todas las combinaciones de inicio-fin
        for (const startRoad of startRoads) {
            for (const endRoad of endRoads) {
                const path = RouteAPI.dijkstraPath(matrix, startRoad, endRoad);
                if (path && path.length < shortestDistance) {
                    bestPath = path;
                    shortestDistance = path.length;
                }
            }
        }

        return bestPath;
    }

    static dijkstraPath(matrix, start, end) {
        const height = matrix.length;
        const width = matrix[0].length;
        
        const startKey = `${start.x},${start.y}`;
        const endKey = `${end.x},${end.y}`;

        // Inicializar distancias
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Configurar punto inicial
        distances.set(startKey, 0);
        previous.set(startKey, null);

        // Inicializar todos los nodos con distancia infinita
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (matrix[y][x] === 1) { // Es carretera
                    const key = `${x},${y}`;
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
                break;
            }

            unvisited.delete(currentKey);

            if (currentKey === endKey) {
                return RouteAPI.reconstructPath(previous, endKey);
            }

            const [currentX, currentY] = currentKey.split(',').map(Number);
            const neighbors = RouteAPI.getNeighbors(matrix, currentX, currentY);

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (!unvisited.has(neighborKey)) {
                    continue;
                }

                const altDistance = distances.get(currentKey) + 1;

                if (altDistance < distances.get(neighborKey)) {
                    distances.set(neighborKey, altDistance);
                    previous.set(neighborKey, currentKey);
                }
            }
        }

        return null;
    }

    static reconstructPath(previous, endKey) {
        const path = [];
        let currentKey = endKey;

        while (currentKey) {
            const [x, y] = currentKey.split(',').map(Number);
            path.unshift({ x, y });
            currentKey = previous.get(currentKey);
        }

        return path;
    }

    static isValidCoordinate(coord, width, height) {
        return coord.x >= 0 && coord.x < width && 
               coord.y >= 0 && coord.y < height;
    }

    static getAdjacentRoads(matrix, x, y) {
        const height = matrix.length;
        const width = matrix[0].length;
        const roads = [];

        const directions = [
            { dx: 0, dy: -1 },  // arriba
            { dx: 1, dy: 0 },   // derecha
            { dx: 0, dy: 1 },   // abajo
            { dx: -1, dy: 0 }   // izquierda
        ];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height && matrix[ny][nx] === 1) {
                roads.push({ x: nx, y: ny });
            }
        }

        return roads;
    }

    static getNeighbors(matrix, x, y) {
        const height = matrix.length;
        const width = matrix[0].length;
        const neighbors = [];

        const directions = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ];

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height && matrix[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }
}

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    new RouteAPI();
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteAPI;
}
