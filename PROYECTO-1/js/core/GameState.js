/**
 * ============================================
 * CITY BUILDER GAME - GAME STATE
 * ============================================
 * Mantiene el estado global actual del juego.
 */

export class GameState {

    constructor() {
        this.city = null;
        this.turn = 1;
        this.score = 0;
        this.isPaused = false;
        this.resourceHistory = [];
        this.config = null;
    }

    syncCityProgress() {
        if (this.city && typeof this.city.setProgress === "function") {
            this.city.setProgress({
                turn: this.turn,
                score: this.score
            });
        }
    }

    /**
     * Inicializa estado con ciudad nueva
     */
    initialize(cityInstance, configInstance) {
        this.city = cityInstance;
        this.turn = Number(configInstance?.game?.initialTurn ?? 1);
        this.score = 0;
        this.isPaused = false;
        this.resourceHistory = [];
        this.config = configInstance;
        this.syncCityProgress();
    }

    /**
     * Incrementa turno
     */
    nextTurn() {
        this.turn++;
        this.syncCityProgress();
    }

    /**
     * Actualiza puntuacion
     */
    updateScore(newScore) {
        this.score = newScore;
        this.syncCityProgress();
    }

    /**
     * Alterna estado de pausa
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    /**
     * Guarda snapshot de recursos (maximo 20 registros)
     */
    pushResourceHistory(snapshot) {
        this.resourceHistory.push(snapshot);

        if (this.resourceHistory.length > 20) {
            this.resourceHistory.shift();
        }
    }

    /**
     * Serializa estado para guardado
     */
    toJSON() {
        return {
            city: this.city ? this.city.toJSON() : null,
            turn: this.turn,
            score: this.score,
            isPaused: this.isPaused,
            resourceHistory: this.resourceHistory,
            serviceBenefits: this.config?.serviceBenefits || null
        };
    }

    /**
     * Restaura estado desde objeto JSON
     */
    loadFromJSON(data) {
        this.turn = Number(data.turn ?? 1);
        this.score = Number(data.score ?? 0);
        this.isPaused = Boolean(data.isPaused);
        this.resourceHistory = data.resourceHistory || [];
        if (data.serviceBenefits && this.config) {
            this.config.serviceBenefits = {
                ...this.config.serviceBenefits,
                ...data.serviceBenefits
            };
        }
        this.syncCityProgress();
    }

}
