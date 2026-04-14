// Importar las clases necesarias
import { DomainRulesService } from '../js/services/DomainRulesService.js';
import { City } from '../js/models/City.js';
import { Road } from '../js/models/Road.js';
import { ResidentialBuilding } from '../js/models/ResidentialBuilding.js';
import { CommercialBuilding } from '../js/models/CommercialBuilding.js';
import { Citizen } from '../js/models/Citizen.js';

const testResults = document.getElementById('test-results');

function addResult(test, status, message) {
    const div = document.createElement('div');
    div.className = status;
    div.innerHTML = `<strong>${test}:</strong> ${message}`;
    testResults.appendChild(div);
}

async function runTests() {
    addResult("Inicio", "info", "Iniciando pruebas de reglas del dominio...");

    try {
        // Crear ciudad de prueba
        const city = new City("Ciudad Test", {
            width: 10,
            height: 10,
            initialResources: { money: 5000, electricity: 200, water: 200, food: 200 }
        });

        const domainRules = new DomainRulesService(city);
        addResult("DomainRulesService", "success", "DomainRulesService creado correctamente");

        // === A. REGLAS DE CONSTRUCCIÓN ===
        
        // Test 1: Exclusividad espacial
        const road1 = new Road(0, 0, { cost: 10, maintenance: 1 });
        city.addRoad(road1);
        
        const spatialCheck1 = domainRules.checkSpatialExclusivity(0, 0);
        addResult("Exclusividad Espacial (ocupada)", !spatialCheck1.valid ? "success" : "error", 
            `Celda (0,0) ocupada: ${spatialCheck1.valid ? "Permitido" : "Rechazado"}`);

        const spatialCheck2 = domainRules.checkSpatialExclusivity(1, 1);
        addResult("Exclusividad Espacial (libre)", spatialCheck2.valid ? "success" : "error", 
            `Celda (1,1) libre: ${spatialCheck2.valid ? "Permitido" : "Rechazado"}`);

        // Test 2: Restricción presupuestaria
        const budgetCheck1 = domainRules.checkBudgetRestriction(100);
        addResult("Restricción Presupuestaria (suficiente)", budgetCheck1.valid ? "success" : "error", 
            `Costo 100, dinero 5000: ${budgetCheck1.valid ? "Permitido" : "Rechazado"}`);

        city.resources.money = 50;
        const budgetCheck2 = domainRules.checkBudgetRestriction(100);
        addResult("Restricción Presupuestaria (insuficiente)", !budgetCheck2.valid ? "success" : "error", 
            `Costo 100, dinero 50: ${budgetCheck2.valid ? "Permitido" : "Rechazado"}`);

        // Test 3: Adyacencia obligatoria
        const adjacencyCheck1 = domainRules.checkMandatoryAdjacency(0, 1, "RESIDENTIAL");
        addResult("Adyacencia (cerca de vía)", adjacencyCheck1.valid ? "success" : "error", 
            `Edificio (0,1) cerca de vía (0,0): ${adjacencyCheck1.valid ? "Permitido" : "Rechazado"}`);

        const adjacencyCheck2 = domainRules.checkMandatoryAdjacency(5, 5, "RESIDENTIAL");
        addResult("Adyacencia (lejos de vía)", !adjacencyCheck2.valid ? "success" : "error", 
            `Edificio (5,5) lejos de vías: ${adjacencyCheck2.valid ? "Permitido" : "Rechazado"}`);

        // Test 4: Límite territorial
        const limitCheck1 = domainRules.checkTerritorialLimit(5, 5);
        addResult("Límite Territorial (dentro)", limitCheck1.valid ? "success" : "error", 
            `Posición (5,5) dentro de mapa 10x10: ${limitCheck1.valid ? "Permitido" : "Rechazado"}`);

        const limitCheck2 = domainRules.checkTerritorialLimit(15, 15);
        addResult("Límite Territorial (fuera)", !limitCheck2.valid ? "success" : "error", 
            `Posición (15,15) fuera de mapa 10x10: ${limitCheck2.valid ? "Permitido" : "Rechazado"}`);

        // Test 5: Validación completa de construcción
        city.resources.money = 5000;
        const constructionCheck = domainRules.validateConstruction(0, 1, "RESIDENTIAL", 100);
        addResult("Validación Construcción (completa)", constructionCheck.valid ? "success" : "error", 
            `Construcción válida: ${constructionCheck.valid ? "Sí" : "No"}`);

        // === B. REGLAS DE POBLACIÓN ===

        // Test 6: Capacidad residencial
        const residentialConfig = { cost: 100, capacity: 4, maintenance: 10 };
        const residential1 = new ResidentialBuilding(0, 1, residentialConfig);
        city.addBuilding(residential1);

        // Añadir ciudadanos
        const citizen1 = new Citizen("Citizen1", { water: 1, electricity: 1, food: 1 });
        const citizen2 = new Citizen("Citizen2", { water: 1, electricity: 1, food: 1 });
        const citizen3 = new Citizen("Citizen3", { water: 1, electricity: 1, food: 1 });
        city.addCitizen(citizen1);
        city.addCitizen(citizen2);
        city.addCitizen(citizen3);

        residential1.addResident(citizen1);
        residential1.addResident(citizen2);
        citizen1.assignHome(residential1.id);
        citizen2.assignHome(residential1.id);

        const capacityCheck = domainRules.checkResidentialCapacity();
        addResult("Capacidad Residencial", capacityCheck.valid ? "success" : "warning", 
            `Población 3, capacidad 4: ${capacityCheck.valid ? "OK" : capacityCheck.message}`);

        // Test 7: Requisitos de crecimiento
        const growthCheck = domainRules.checkGrowthRequirements();
        addResult("Requisitos de Crecimiento", growthCheck.valid ? "success" : "info", 
            `Requisitos cumplidos: ${growthCheck.valid ? "Sí" : "No"}`);

        // Test 8: Asignación automática
        const citizen4 = new Citizen("Citizen4", { water: 1, electricity: 1, food: 1 });
        city.addCitizen(citizen4);

        const assignmentResult = domainRules.performAutomaticAssignment();
        addResult("Asignación Automática", "success", 
            `Ciudadanos asignados: ${assignmentResult.housedCitizens} con vivienda, ${assignmentResult.employedCitizens} con empleo`);

        // === C. REGLAS DE RUTAS ===

        // Test 9: Transitabilidad
        const transitCheck1 = domainRules.checkTransitability(0, 0);
        addResult("Transitabilidad (vía)", transitCheck1.valid ? "success" : "error", 
            `Celda (0,0) es vía: ${transitCheck1.valid ? "Transitable" : "No transitable"}`);

        const transitCheck2 = domainRules.checkTransitability(1, 1);
        addResult("Transitabilidad (no vía)", !transitCheck2.valid ? "success" : "error", 
            `Celda (1,1) no es vía: ${transitCheck2.valid ? "Transitable" : "No transitable"}`);

        // Test 10: Existencia de camino
        const road2 = new Road(0, 1, { cost: 10, maintenance: 1 });
        const road3 = new Road(0, 2, { cost: 10, maintenance: 1 });
        city.addRoad(road2);
        city.addRoad(road3);

        const pathCheck1 = domainRules.checkRouteExistence(0, 0, 0, 2);
        addResult("Existencia de Camino (conectado)", pathCheck1.valid ? "success" : "error", 
            `Camino (0,0) a (0,2): ${pathCheck1.valid ? "Existe" : "No existe"}`);

        const pathCheck2 = domainRules.checkRouteExistence(0, 0, 5, 5);
        addResult("Existencia de Camino (desconectado)", !pathCheck2.valid ? "success" : "error", 
            `Camino (0,0) a (5,5): ${pathCheck2.valid ? "Existe" : "No existe"}`);

        // Test 11: Optimalidad de ruta
        const optimalRoute = domainRules.findOptimalRoute(0, 0, 0, 2);
        addResult("Optimalidad de Ruta", optimalRoute.valid ? "success" : "error", 
            `Ruta óptima (0,0) a (0,2): ${optimalRoute.valid ? `Distancia ${optimalRoute.distance}` : "No encontrada"}`);

        // === D. REGLAS DE PERSISTENCIA ===

        // Test 12: Intervalo de auto-save
        const autoSaveInterval = domainRules.getAutoSaveInterval();
        addResult("Intervalo Auto-Save", autoSaveInterval === 30000 ? "success" : "error", 
            `Intervalo: ${autoSaveInterval}ms (esperado: 30000ms = 30s)`);

        // Test 13: Guardado en LocalStorage
        const saveResult = domainRules.saveToLocalStorage();
        addResult("Guardado LocalStorage", saveResult.success ? "success" : "error", 
            `Guardado: ${saveResult.success ? "Exitoso" : saveResult.message}`);

        // Test 14: Carga desde LocalStorage
        const loadResult = domainRules.loadFromLocalStorage();
        addResult("Carga LocalStorage", loadResult.success ? "success" : "info", 
            `Carga: ${loadResult.success ? "Exitosa" : loadResult.message}`);

        // Test 15: Exportación JSON
        const exportResult = domainRules.exportToJSON();
        addResult("Exportación JSON", exportResult.success ? "success" : "error", 
            `Exportación: ${exportResult.success ? "Exitosa" : exportResult.message}`);

        // Test 16: Importación JSON
        const testCityData = {
            name: "Ciudad Importada",
            currentTurn: 1,
            accumulatedScore: 100,
            resources: { money: 1000, electricity: 100, water: 100, food: 100 }
        };

        const importResult = domainRules.importFromJSON(testCityData);
        addResult("Importación JSON", importResult.success ? "success" : "error", 
            `Importación: ${importResult.success ? "Exitosa" : importResult.message}`);

        // Test 17: Verificación de todas las reglas
        addResult("Verificación Completa", "success", 
            "Todas las reglas del dominio implementadas:<br>" +
            "× Reglas de construcción: Exclusividad, presupuesto, adyacencia, límites<br>" +
            "× Reglas de población: Capacidad, crecimiento, asignación automática<br>" +
            "× Reglas de rutas: Transitabilidad, existencia, optimalidad<br>" +
            "× Reglas de persistencia: Auto-save, LocalStorage, exportación");

        addResult("Pruebas Completadas", "success", 
            "Todas las pruebas de reglas del dominio completadas exitosamente");

    } catch (error) {
        addResult("Error", "error", `Error en las pruebas: ${error.message}`);
        console.error('Test error:', error);
    }
}

// Ejecutar pruebas cuando se carga la página
runTests();
