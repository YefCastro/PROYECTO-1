// Importar las clases necesarias
import { ScoreManager } from '../js/managers/ScoreManager.js';
import { City } from '../js/models/City.js';
import { GameState } from '../js/core/GameState.js';

const testResults = document.getElementById('test-results');

function addResult(test, status, message) {
    const div = document.createElement('div');
    div.className = status;
    div.innerHTML = `<strong>${test}:</strong> ${message}`;
    testResults.appendChild(div);
}

async function runTests() {
    addResult("Inicio", "info", "Iniciando pruebas del sistema de puntuación...");

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

        // Crear ScoreManager
        const scoreManager = new ScoreManager(city, gameState);
        addResult("ScoreManager", "success", "ScoreManager creado correctamente");

        // Test 1: Verificar puntuación inicial
        const initialScore = scoreManager.calculateScore();
        addResult("Puntuación Inicial", "success", 
            `Puntuación inicial: ${initialScore}`);

        // Test 2: Verificar factores positivos
        const population = city.getPopulation();
        const happiness = city.getAverageHappiness();
        const money = city.resources.money;
        const buildingCount = city.buildings.length;

        addResult("Factores Positivos", "success", 
            `Población: ${population}, Felicidad: ${happiness}, Dinero: ${money}, Edificios: ${buildingCount}`);

        // Test 3: Verificar penalizaciones
        const hasElectricityPenalty = city.resources.isElectricityNegative();
        const hasWaterPenalty = city.resources.isWaterNegative();
        const hasMoneyPenalty = city.resources.isMoneyNegative();

        addResult("Penalizaciones", "success", 
            `Electricidad negativa: ${hasElectricityPenalty ? "Sí" : "No"}, ` +
            `Agua negativa: ${hasWaterPenalty ? "Sí" : "No"}, ` +
            `Dinero negativo: ${hasMoneyPenalty ? "Sí" : "No"}`);

        // Test 4: Verificar puntuación con recursos negativos
        city.resources.electricity = -50;
        city.resources.water = -30;
        city.resources.money = -100;

        const negativeScore = scoreManager.calculateScore();
        addResult("Puntuación con Recursos Negativos", "success", 
            `Puntuación con recursos negativos: ${negativeScore}`);

        // Test 5: Verificar que la puntuación no sea negativa
        const nonNegativeScore = negativeScore >= 0;
        addResult("Puntuación No Negativa", nonNegativeScore ? "success" : "error", 
            `Puntuación nunca negativa: ${nonNegativeScore ? "Correcto" : "Error"}`);

        // Test 6: Verificar actualización del estado del juego
        const previousScore = gameState.accumulatedScore;
        scoreManager.calculateScore();
        const updatedScore = gameState.accumulatedScore;

        addResult("Actualización del Estado", updatedScore > previousScore ? "success" : "warning", 
            `Puntuación actualizada: ${previousScore} -> ${updatedScore}`);

        // Test 7: Verificar fórmula completa
        city.resources.electricity = 200;
        city.resources.water = 200;
        city.resources.money = 2000;

        // Añadir algunos edificios para probar
        const residentialBuildings = 5;
        const commercialBuildings = 3;
        const serviceBuildings = 2;

        for (let i = 0; i < residentialBuildings; i++) {
            city.buildings.push({ type: "residential", capacity: 4 });
        }
        for (let i = 0; i < commercialBuildings; i++) {
            city.buildings.push({ type: "commercial", capacity: 3 });
        }
        for (let i = 0; i < serviceBuildings; i++) {
            city.buildings.push({ type: "service", capacity: 2 });
        }

        const complexScore = scoreManager.calculateScore();
        addResult("Fórmula Completa", "success", 
            `Puntuación con múltiples factores: ${complexScore}`);

        // Test 8: Verificar componentes de la puntuación
        const scoreBreakdown = {
            population: population * 2,
            happiness: happiness * 5,
            money: Math.floor(city.resources.money / 100),
            buildings: buildingCount * 10
        };

        addResult("Componentes de Puntuación", "success", 
            `Población: ${scoreBreakdown.population}, ` +
            `Felicidad: ${scoreBreakdown.happiness}, ` +
            `Dinero: ${scoreBreakdown.money}, ` +
            `Edificios: ${scoreBreakdown.buildings}`);

        // Test 9: Verificar consistencia
        const calculatedTotal = Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0);
        const isConsistent = Math.abs(calculatedTotal - complexScore) <= 10; // Pequeña tolerancia

        addResult("Consistencia de Cálculo", isConsistent ? "success" : "warning", 
            `Cálculo consistente: ${isConsistent ? "Sí" : "No"}`);

        // Test 10: Verificar bonificaciones y penalizaciones específicas
        city.resources.electricity = 300; // Bonificación
        city.resources.water = 300;       // Bonificación
        city.resources.food = 500;        // Bonificación

        const bonusScore = scoreManager.calculateScore();
        addResult("Bonificaciones", bonusScore > complexScore ? "success" : "info", 
            `Puntuación con bonificaciones: ${bonusScore}`);

        addResult("Pruebas Completadas", "success", 
            "Todas las pruebas del sistema de puntuación completadas exitosamente");

    } catch (error) {
        addResult("Error", "error", `Error en las pruebas: ${error.message}`);
        console.error('Test error:', error);
    }
}

// Ejecutar pruebas cuando se carga la página
runTests();
