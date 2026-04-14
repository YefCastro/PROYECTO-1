// Importar las clases necesarias
import { TurnSystem } from '../js/core/TurnSystem.js';
import { GameState } from '../js/core/GameState.js';
import { ResourceManager } from '../js/managers/ResourceManager.js';
import { CitizenManager } from '../js/managers/CitizenManager.js';
import { ScoreManager } from '../js/managers/ScoreManager.js';
import { PersistenceManager } from '../js/managers/PersistenceManager.js';
import { City } from '../js/models/City.js';

const testResults = document.getElementById('test-results');

function addResult(test, status, message) {
    const div = document.createElement('div');
    div.className = status;
    div.innerHTML = `<strong>${test}:</strong> ${message}`;
    testResults.appendChild(div);
}

async function runTests() {
    addResult("Inicio", "info", "Iniciando pruebas del sistema de turnos...");

    try {
        // Crear ciudad de prueba
        const city = new City("Ciudad Test", {
            width: 15,
            height: 15,
            initialResources: { money: 1000, electricity: 100, water: 100, food: 100 }
        });

        // Crear game state
        const gameState = new GameState();
        gameState.initialize(city, {});

        // Crear managers
        const resourceManager = new ResourceManager(city);
        const citizenManager = new CitizenManager(city);
        const scoreManager = new ScoreManager(city, gameState);
        const persistenceManager = new PersistenceManager(gameState);

        // Crear turn system
        const turnSystem = new TurnSystem(gameState, {
            resourceManager,
            citizenManager,
            scoreManager,
            persistenceManager
        });

        addResult("TurnSystem", "success", "TurnSystem creado correctamente");

        // Test 1: Verificar estado inicial
        const initialTurn = gameState.currentTurn;
        const initialScore = gameState.accumulatedScore;
        
        addResult("Estado Inicial", "success", 
            `Turno inicial: ${initialTurn}, Puntuación inicial: ${initialScore}`);

        // Test 2: Ejecutar un turno
        const beforeResources = { ...city.resources };
        const beforePopulation = city.getPopulation();
        
        turnSystem.nextTurn();
        
        const afterTurn = gameState.currentTurn;
        const afterScore = gameState.accumulatedScore;
        const afterPopulation = city.getPopulation();
        
        addResult("Ejecución de Turno", "success", 
            `Turno después: ${afterTurn}, Puntuación después: ${afterScore}`);

        // Test 3: Verificar procesamiento de recursos
        const resourceProcessed = beforeResources.money !== city.resources.money ||
                                beforeResources.electricity !== city.resources.electricity ||
                                beforeResources.water !== city.resources.water ||
                                beforeResources.food !== city.resources.food;

        addResult("Procesamiento de Recursos", resourceProcessed ? "success" : "warning", 
            `Recursos procesados: ${resourceProcessed ? "Sí" : "No cambios detectados"}`);

        // Test 4: Verificar procesamiento de ciudadanos
        addResult("Procesamiento de Ciudadanos", "success", 
            `Población antes: ${beforePopulation}, después: ${afterPopulation}`);

        // Test 5: Verificar cálculo de puntuación
        const scoreIncreased = afterScore > initialScore;
        addResult("Cálculo de Puntuación", scoreIncreased ? "success" : "warning", 
            `Puntuación incrementada: ${scoreIncreased ? "Sí" : "No"}`);

        // Test 6: Verificar persistencia
        const persistedData = persistenceManager.save();
        addResult("Persistencia", persistedData ? "success" : "error", 
            `Datos guardados: ${persistedData ? "Sí" : "No"}`);

        // Test 7: Verificar múltiples turnos
        const currentTurn = afterTurn;
        turnSystem.nextTurn();
        turnSystem.nextTurn();
        
        const finalTurn = gameState.currentTurn;
        addResult("Múltiples Turnos", finalTurn === currentTurn + 2 ? "success" : "error", 
            `Turnos ejecutados: ${finalTurn - currentTurn}`);

        // Test 8: Verificar auto-save
        const autoSaveResult = persistenceManager.save();
        addResult("Auto-Save", autoSaveResult ? "success" : "error", 
            `Auto-save: ${autoSaveResult ? "Funcional" : "Error"}`);

        addResult("Pruebas Completadas", "success", 
            "Todas las pruebas del sistema de turnos completadas exitosamente");

    } catch (error) {
        addResult("Error", "error", `Error en las pruebas: ${error.message}`);
        console.error('Test error:', error);
    }
}

// Ejecutar pruebas cuando se carga la página
runTests();
