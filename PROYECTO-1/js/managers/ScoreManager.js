/**
 * ============================================
 * CITY BUILDER GAME - SCORE MANAGER
 * ============================================
 * Calcula puntuación general del jugador.
 */

export class ScoreManager {

    constructor(city, gameState) {
        this.city = city;
        this.gameState = gameState;
    }

    /**
     * Calcula puntuación total con fórmula completa
     */
    calculateScore() {
        const scoreBreakdown = this.calculateScoreBreakdown();
        const totalScore = scoreBreakdown.total;

        this.gameState.updateScore(totalScore);
        return totalScore;
    }

    /**
     * Calcula el desglose completo de la puntuación
     */
    calculateScoreBreakdown() {
        const population = this.city.getPopulation();
        const happiness = this.city.getAverageHappiness();
        const money = this.city.resources.money;
        const buildingCount = this.city.buildings.length;
        const electricityBalance = this.city.resources.getElectricityBalance();
        const waterBalance = this.city.resources.getWaterBalance();

        // Fórmula base: score = (población × 10) + (felicidad_promedio × 5) + (dinero ÷ 100) + (número_edificios × 50) + (balance_electricidad × 2) + (balance_agua × 2) + bonificaciones - penalizaciones
        let baseScore = 0;
        
        baseScore += population * 10;           // población × 10
        baseScore += happiness * 5;            // felicidad_promedio × 5
        baseScore += Math.floor(money / 100);  // dinero ÷ 100
        baseScore += buildingCount * 50;       // número_edificios × 50
        baseScore += electricityBalance * 2;    // balance_electricidad × 2
        baseScore += waterBalance * 2;         // balance_agua × 2

        // Calcular bonificaciones
        const bonuses = this.calculateBonuses();
        
        // Calcular penalizaciones
        const penalties = this.calculatePenalties();

        const totalScore = Math.max(0, baseScore + bonuses.total - penalties.total);

        return {
            base: {
                population: population * 10,
                happiness: happiness * 5,
                money: Math.floor(money / 100),
                buildings: buildingCount * 50,
                electricity: electricityBalance * 2,
                water: waterBalance * 2,
                total: baseScore
            },
            bonuses: bonuses,
            penalties: penalties,
            total: totalScore
        };
    }

    /**
     * Calcula todas las bonificaciones
     */
    calculateBonuses() {
        const population = this.city.getPopulation();
        const happiness = this.city.getAverageHappiness();
        const unemployed = this.city.getUnemployedCitizens().length;
        const allEmployed = population > 0 && unemployed === 0;

        let bonuses = {
            allEmployed: 0,
            highHappiness: 0,
            allResourcesPositive: 0,
            largeCity: 0,
            total: 0
        };

        // Todos los ciudadanos empleados: +500
        if (allEmployed) {
            bonuses.allEmployed = 500;
        }

        // Felicidad > 80: +300
        if (happiness > 80) {
            bonuses.highHappiness = 300;
        }

        // Todos los recursos positivos: +200
        if (!this.city.resources.isElectricityNegative() && 
            !this.city.resources.isWaterNegative() && 
            !this.city.resources.isMoneyNegative()) {
            bonuses.allResourcesPositive = 200;
        }

        // Ciudad > 1,000 habitantes: +1,000
        if (population > 1000) {
            bonuses.largeCity = 1000;
        }

        bonuses.total = bonuses.allEmployed + bonuses.highHappiness + bonuses.allResourcesPositive + bonuses.largeCity;

        return bonuses;
    }

    /**
     * Calcula todas las penalizaciones
     */
    calculatePenalties() {
        const population = this.city.getPopulation();
        const happiness = this.city.getAverageHappiness();
        const unemployed = this.city.getUnemployedCitizens().length;

        let penalties = {
            negativeMoney: 0,
            negativeElectricity: 0,
            negativeWater: 0,
            lowHappiness: 0,
            unemployment: 0,
            total: 0
        };

        // Dinero negativo: -500
        if (this.city.resources.isMoneyNegative()) {
            penalties.negativeMoney = 500;
        }

        // Electricidad negativa: -300
        if (this.city.resources.isElectricityNegative()) {
            penalties.negativeElectricity = 300;
        }

        // Agua negativa: -300
        if (this.city.resources.isWaterNegative()) {
            penalties.negativeWater = 300;
        }

        // Felicidad < 40: -400
        if (happiness < 40) {
            penalties.lowHappiness = 400;
        }

        // Por cada ciudadano desempleado: -10
        penalties.unemployment = unemployed * 10;

        penalties.total = penalties.negativeMoney + penalties.negativeElectricity + penalties.negativeWater + penalties.lowHappiness + penalties.unemployment;

        return penalties;
    }

    /**
     * Obtiene el desglose de la puntuación para mostrar en UI
     */
    getScoreBreakdown() {
        return this.calculateScoreBreakdown();
    }

}