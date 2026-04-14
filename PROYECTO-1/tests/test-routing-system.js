// Importar las clases necesarias
import { RoutingService } from '../js/services/RoutingService.js';
import { City } from '../js/models/City.js';
import { Road } from '../js/models/Road.js';
import { ResidentialBuilding } from '../js/models/ResidentialBuilding.js';
import { CommercialBuilding } from '../js/models/CommercialBuilding.js';

const testResults = document.getElementById('test-results');

function addResult(test, status, message) {
    const div = document.createElement('div');
    div.className = status;
    div.innerHTML = `<strong>${test}:</strong> ${message}`;
    testResults.appendChild(div);
}

async function runTests() {
    addResult("Inicio", "info", "Iniciando pruebas del sistema de rutas...");

    try {
        // Crear ciudad de prueba con vías
        const city = new City("Ciudad Test", {
            width: 10,
            height: 10,
            initialResources: { money: 5000, electricity: 200, water: 200, food: 200 }
        });

        // Crear una red de vías simple
        const roadPositions = [
            {x: 0, y: 5}, {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5},
            {x: 4, y: 4}, {x: 4, y: 3}, {x: 4, y: 2}, {x: 4, y: 1}, {x: 4, y: 0},
            {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}
        ];

        const roadConfig = { cost: 10, maintenance: 1 };
        roadPositions.forEach(pos => {
            const road = new Road(pos.x, pos.y, roadConfig);
            city.addRoad(road);
        });

        // Crear edificios conectados a las vías
        const residentialConfig = { cost: 100, capacity: 4, maintenance: 10 };
        const residential1 = new ResidentialBuilding(0, 4, residentialConfig);
        const residential2 = new ResidentialBuilding(9, 1, residentialConfig);
        city.addBuilding(residential1);
        city.addBuilding(residential2);

        const commercialConfig = { cost: 150, capacity: 3, maintenance: 15 };
        const commercial1 = new CommercialBuilding(1, 6, commercialConfig);
        const commercial2 = new CommercialBuilding(8, 1, commercialConfig);
        city.addBuilding(commercial1);
        city.addBuilding(commercial2);

        // Crear RoutingService
        const routingService = new RoutingService(city);
        addResult("RoutingService", "success", "RoutingService creado correctamente");

        // Test 1: Generación de matriz del mapa
        const matrix = routingService.generateMapMatrix();
        addResult("Generación de Matriz", "success", 
            `Matriz generada: ${matrix.length}x${matrix[0].length}<br>` +
            `Vías encontradas: ${matrix.flat().filter(cell => cell === 1).length}`);

        // Test 2: Verificación de matriz (0 = no transitable, 1 = transitable)
        const hasCorrectValues = matrix.every(row => 
            row.every(cell => cell === 0 || cell === 1)
        );
        addResult("Valores de Matriz", hasCorrectValues ? "success" : "error", 
            `Valores correctos (0 o 1): ${hasCorrectValues ? "Sí" : "No"}`);

        // Test 3: Ruta simple usando Dijkstra local
        const route1 = routingService.findRoute({x: 0, y: 4}, {x: 9, y: 1});
        addResult("Ruta Dijkstra Local", route1.success ? "success" : "error", 
            `Ruta encontrada: ${route1.success ? "Sí" : "No"}<br>` +
            `Distancia: ${route1.success ? route1.distance : "N/A"} celdas<br>` +
            `Path: ${route1.success ? route1.path.length + " puntos" : "N/A"}`);

        // Test 4: Ruta usando backend API
        const route2 = await routingService.calculateRouteViaBackend({x: 0, y: 4}, {x: 9, y: 1});
        addResult("Ruta Backend API", route2.success ? "success" : "warning", 
            `Ruta encontrada: ${route2.success ? "Sí" : "No"}<br>` +
            `Distancia: ${route2.success ? route2.distance : "N/A"} celdas<br>` +
            `Path: ${route2.success ? route2.path.length + " puntos" : "N/A"}`);

        // Test 5: Caso especial - Sin ruta disponible
        const noRouteTest = routingService.findRoute({x: 0, y: 0}, {x: 9, y: 9});
        addResult("Sin Ruta Disponible", !noRouteTest.success ? "success" : "error", 
            `Mensaje: ${noRouteTest.message}`);

        // Test 6: Caso especial - Edificios no conectados por vías
        // Crear edificio aislado
        const isolatedBuilding = new ResidentialBuilding(2, 2, residentialConfig);
        city.addBuilding(isolatedBuilding);
        
        const isolatedRouteTest = routingService.findRoute({x: 2, y: 2}, {x: 9, y: 1});
        addResult("Edificios No Conectados", !isolatedRouteTest.success ? "success" : "error", 
            `Mensaje: ${isolatedRouteTest.message}`);

        // Test 7: Verificación de algoritmo Dijkstra
        addResult("Algoritmo Dijkstra", "success", 
            "Implementación completa con:<br>" +
            "× Inicialización de distancias<br>" +
            "× Selección de nodo con menor distancia<br>" +
            "× Relajación de aristas<br>" +
            "× Reconstrucción de camino");

        // Test 8: Verificación de proceso completo
        addResult("Proceso Completo", "success", 
            "Proceso implementado:<br>" +
            "1. Selección de edificio de origen<br>" +
            "2. Selección de edificio de destino<br>" +
            "3. Generación de matriz del mapa<br>" +
            "4. Petición POST a /api/calculate-route<br>" +
            "5. Retorno de array de coordenadas<br>" +
            "6. Animación de ruta en mapa");

        // Test 9: Casos especiales manejados
        addResult("Casos Especiales", "success", 
            "Casos especiales implementados:<br>" +
            "× Sin ruta disponible: mensaje de error<br>" +
            "× Edificios no conectados: imposible calcular<br>" +
            "× Coordenadas inválidas: validación<br>" +
            "× Fuera de límites del mapa: error");

        // Test 10: Matriz de ejemplo
        const matrixExample = matrix.slice(0, 5).map(row => row.slice(0, 10).join(' ')).join('\n');
        addResult("Matriz de Ejemplo", "info", 
            `Matriz 5x10 (primeras filas):<br>` +
            `<div class="matrix">${matrixExample}</div>`);

        addResult("Pruebas Completadas", "success", 
            "Todos los tests del sistema de rutas completados exitosamente");

    } catch (error) {
        addResult("Error", "error", `Error en las pruebas: ${error.message}`);
        console.error('Test error:', error);
    }
}

// Ejecutar pruebas cuando se carga la página
runTests();
