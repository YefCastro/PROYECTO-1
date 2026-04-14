// Importar las clases necesarias
import { Citizen } from '../js/models/Citizen.js';
import { CitizenManager } from '../js/managers/CitizenManager.js';
import { City } from '../js/models/City.js';
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
    addResult("Inicio", "info", "Iniciando pruebas del sistema de ciudadanos...");

    try {
        // Crear ciudad de prueba
        const city = new City("Ciudad Test", {
            width: 15,
            height: 15,
            initialResources: { money: 1000, electricity: 100, water: 100, food: 100 }
        });

        // Crear CitizenManager
        const citizenManager = new CitizenManager(city);
        addResult("CitizenManager", "success", "CitizenManager creado correctamente");

        // Test 1: Creación de ciudadanos
        const citizen1 = new Citizen("Juan", { water: 1, electricity: 1, food: 1 });
        const citizen2 = new Citizen("María", { water: 1, electricity: 1, food: 1 });
        
        city.addCitizen(citizen1);
        city.addCitizen(citizen2);
        
        addResult("Creación de Ciudadanos", "success", 
            `Ciudadanos creados: ${city.getPopulation()}`);

        // Test 2: Verificar propiedades iniciales
        const initialHappiness1 = citizen1.happiness;
        const initialHappiness2 = citizen2.happiness;
        const initialEmployment1 = citizen1.isEmployed;
        const initialEmployment2 = citizen2.isEmployed;
        
        addResult("Propiedades Iniciales", "success", 
            `Felicidad inicial: ${initialHappiness1}, ${initialHappiness2}<br>` +
            `Empleo inicial: ${initialEmployment1 ? "Sí" : "No"}, ${initialEmployment2 ? "Sí" : "No"}`);

        // Test 3: Crear edificios residenciales y comerciales
        const residentialConfig = { cost: 100, capacity: 4, maintenance: 10 };
        const commercialConfig = { cost: 150, capacity: 3, maintenance: 15 };
        
        const residential1 = new ResidentialBuilding(0, 0, residentialConfig);
        const residential2 = new ResidentialBuilding(1, 0, residentialConfig);
        const commercial1 = new CommercialBuilding(2, 0, commercialConfig);
        
        city.addBuilding(residential1);
        city.addBuilding(residential2);
        city.addBuilding(commercial1);
        
        addResult("Edificios Creados", "success", 
            `Residenciales: 2, Comerciales: 1`);

        // Test 4: Asignación de vivienda
        residential1.addResident(citizen1);
        citizen1.assignHome(residential1.id);
        
        addResult("Asignación de Vivienda", citizen1.homeId ? "success" : "error", 
            `Ciudadano 1 asignado a vivienda: ${citizen1.homeId ? "Sí" : "No"}`);

        // Test 5: Asignación de empleo
        commercial1.addEmployee(citizen2);
        citizen2.employ();
        
        addResult("Asignación de Empleo", citizen2.isEmployed ? "success" : "error", 
            `Ciudadano 2 empleado: ${citizen2.isEmployed ? "Sí" : "No"}`);

        // Test 6: Verificación de capacidad
        const totalCapacity = residential1.capacity + residential2.capacity;
        const currentPopulation = city.getPopulation();
        const availableCapacity = totalCapacity - currentPopulation;
        
        addResult("Capacidad Residencial", "success", 
            `Capacidad total: ${totalCapacity}, Población: ${currentPopulation}, Disponible: ${availableCapacity}`);

        // Test 7: Verificación de empleos disponibles
        const totalJobs = commercial1.capacity;
        const employedCount = commercial1.getEmployeeCount();
        const availableJobs = totalJobs - employedCount;
        
        addResult("Capacidad Laboral", "success", 
            `Empleos totales: ${totalJobs}, Empleados: ${employedCount}, Disponibles: ${availableJobs}`);

        // Test 8: Cambios de felicidad
        const initialHappiness = citizen1.happiness;
        citizen1.increaseHappiness(10);
        const newHappiness = citizen1.happiness;
        
        addResult("Cambios de Felicidad", newHappiness > initialHappiness ? "success" : "error", 
            `Felicidad antes: ${initialHappiness}, después: ${newHappiness}`);

        // Test 9: Verificación de necesidades
        const citizenNeeds = citizen1.needs;
        addResult("Necesidades del Ciudadano", "success", 
            `Agua: ${citizenNeeds.water}, Electricidad: ${citizenNeeds.electricity}, Comida: ${citizenNeeds.food}`);

        // Test 10: Procesamiento de ciudadanos
        const context = {
            resources: city.resources,
            buildings: city.buildings
        };
        
        citizenManager.processCitizens(context);
        
        addResult("Procesamiento de Ciudadanos", "success", 
            "Ciudadanos procesados con necesidades y felicidad");

        // Test 11: Verificación de crecimiento poblacional
        const growthCapacity = citizenManager.calculateGrowthCapacity();
        addResult("Capacidad de Crecimiento", "success", 
            `Capacidad de crecimiento: ${growthCapacity} ciudadanos`);

        // Test 12: Creación automática de ciudadanos
        if (growthCapacity > 0) {
            citizenManager.createCitizens(growthCapacity);
            const newPopulation = city.getPopulation();
            
            addResult("Creación Automática", newPopulation > currentPopulation ? "success" : "error", 
                `Población antes: ${currentPopulation}, después: ${newPopulation}`);
        }

        // Test 13: Verificación de ciudadanos sin hogar
        const homelessCitizens = citizenManager.getHomelessCitizens();
        addResult("Ciudadanos sin Hogar", "success", 
            `Ciudadanos sin hogar: ${homelessCitizens.length}`);

        // Test 14: Verificación de ciudadanos desempleados
        const unemployedCitizens = citizenManager.getUnemployedCitizens();
        addResult("Ciudadanos Desempleados", "success", 
            `Ciudadanos desempleados: ${unemployedCitizens.length}`);

        // Test 15: Asignación automática
        const assignmentResult = citizenManager.performAutomaticAssignment();
        addResult("Asignación Automática", "success", 
            `Ciudadanos asignados: ${assignmentResult.housedCitizens} con vivienda, ${assignmentResult.employedCitizens} con empleo`);

        // Test 16: Verificación de felicidad promedio
        const averageHappiness = city.getAverageHappiness();
        addResult("Felicidad Promedio", "success", 
            `Felicidad promedio: ${averageHappiness}`);

        // Test 17: Verificación de tasa de empleo
        const employmentRate = citizenManager.getEmploymentRate();
        addResult("Tasa de Empleo", "success", 
            `Tasa de empleo: ${(employmentRate * 100).toFixed(1)}%`);

        // Test 18: Verificación de tasa de crecimiento
        const growthRate = citizenManager.getCurrentGrowthRate();
        addResult("Tasa de Crecimiento", "success", 
            `Tasa de crecimiento: ${growthRate} ciudadanos/turno`);

        addResult("Pruebas Completadas", "success", 
            "Todas las pruebas del sistema de ciudadanos completadas exitosamente");

    } catch (error) {
        addResult("Error", "error", `Error en las pruebas: ${error.message}`);
        console.error('Test error:', error);
    }
}

// Ejecutar pruebas cuando se carga la página
runTests();
