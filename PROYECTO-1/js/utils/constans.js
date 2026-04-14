/**
 * ============================================
 * CITY BUILDER GAME - CONSTANTS
 * ============================================
 * Archivo de constantes globales del sistema.
 * No contiene lógica, solo valores estáticos.
 */

export const GAME_CONSTANTS = {

    // ==============================
    // MAP CONFIGURATION
    // ==============================
    MAP: {
        MIN_SIZE: 15,
        MAX_SIZE: 30,
        DEFAULT_SIZE: 20
    },

    // ==============================
    // INITIAL RESOURCES
    // ==============================
    INITIAL_RESOURCES: {
        MONEY: 50000,
        ELECTRICITY: 0,
        WATER: 0,
        FOOD: 0
    },

    // ==============================
    // TURN SYSTEM
    // ==============================
    TURN: {
        DEFAULT_DURATION: 10000, // 10 segundos = 1 turno
        AUTO_SAVE_INTERVAL: 30000 // 30 segundos
    },

    // ==============================
    // CITIZEN RULES
    // ==============================
    CITIZENS: {
        MIN_GROWTH_PER_TURN: 1,
        MAX_GROWTH_PER_TURN: 3,
        MAX_HAPPINESS: 100,
        MIN_HAPPINESS: 0,
        HAPPINESS_THRESHOLD_FOR_GROWTH: 60
    },

    // ==============================
    // ROAD
    // ==============================
    ROAD: {
        COST: 100
    },

    // ==============================
    // PARK
    // ==============================
    PARK: {
        COST: 1500,
        HAPPINESS_BONUS: 5
    },

    // ==============================
    // UTILITY PLANTS
    // ==============================
    UTILITY_PLANTS: {
        ELECTRIC_PLANT: {
            COST: 10000,
            PRODUCTION: 200
        },
        WATER_PLANT: {
            COST: 8000,
            PRODUCTION: 150,
            ELECTRICITY_CONSUMPTION: 20
        }
    },

    // ==============================
    // SCORE SYSTEM
    // ==============================
    SCORE: {
        POPULATION_WEIGHT: 10,
        HAPPINESS_WEIGHT: 5,
        MONEY_DIVISOR: 100,
        BUILDING_WEIGHT: 50,
        ELECTRICITY_WEIGHT: 2,
        WATER_WEIGHT: 2,

        BONUSES: {
            ALL_EMPLOYED: 500,
            HIGH_HAPPINESS: 300,
            ALL_POSITIVE_RESOURCES: 200,
            BIG_CITY: 1000
        },

        PENALTIES: {
            NEGATIVE_MONEY: -500,
            NEGATIVE_ELECTRICITY: -300,
            NEGATIVE_WATER: -300,
            LOW_HAPPINESS: -400,
            UNEMPLOYED_PER_CITIZEN: -10
        }
    },

    // ==============================
    // STORAGE KEYS
    // ==============================
    STORAGE_KEYS: {
        GAME_STATE: "city_builder_game_state",
        RANKING: "city_builder_ranking"
    },

    // ==============================
    // ROUTING
    // ==============================
    ROUTING: {
        TRANSITABLE: 1,
        NON_TRANSITABLE: 0,
        API_ENDPOINT: "/api/calculate-route"
    }
};