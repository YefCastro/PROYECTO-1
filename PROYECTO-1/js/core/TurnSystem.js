/**
 * ============================================
 * CITY BUILDER GAME - TURN SYSTEM
 * ============================================
 * Motor principal que ejecuta cada turno.
 */

export class TurnSystem {

    constructor(gameState, managers) {
        this.gameState = gameState;

        this.resourceManager = managers.resourceManager;
        this.citizenManager = managers.citizenManager;
        this.scoreManager = managers.scoreManager;
        this.persistenceManager = managers.persistenceManager;
        
        // Auto-turn system
        this.autoTurnEnabled = false;
        this.turnDuration = 5000; // Default 5 seconds in milliseconds
        this.turnTimer = null;
        this.onTurnComplete = null; // Callback for turn completion
    }

    /**
     * Ejecuta un turno completo
     */
    nextTurn(context = {}) {

        if (this.gameState.isPaused) {
            return { success: false, message: "Juego en pausa" };
        }

        const city = this.gameState.city;
        const weather = context.weather || null;

        // 1. Procesar recursos
        const resourceReport = this.resourceManager.processTurn(weather);

        // 2. Procesar ciudadanos
        this.citizenManager.processTurn({
            resourceReport
        });

        // 3. Calcular puntuacion
        const score = this.scoreManager.calculateScore();

        // 4. Guardar snapshot historico
        this.gameState.pushResourceHistory({
            turn: this.gameState.turn,
            money: city.resources.money,
            electricity: city.resources.electricity,
            water: city.resources.water,
            food: city.resources.food,
            population: city.getPopulation(),
            score,
            weather: weather?.type || null
        });

        // 5. Verificar colapso
        const collapse = this.resourceManager.checkForCollapse();

        if (collapse) {
            this.gameState.isPaused = true;
        }

        // 6. Guardado automático en LocalStorage
        if (this.persistenceManager) {
            this.persistenceManager.saveGame();
        }

        // 7. Avanzar turno
        this.gameState.nextTurn();

        return {
            success: true,
            turn: this.gameState.turn,
            collapse,
            gameOver: Boolean(collapse),
            report: resourceReport,
            score,
            weather
        };
    }

    /**
     * Configura la duración del turno en segundos
     */
    setTurnDuration(seconds) {
        const durationMs = Math.max(1000, Math.min(60000, Number(seconds) * 1000));
        this.turnDuration = durationMs;
        
        // Si los turnos automáticos están activos, reiniciar el timer
        if (this.autoTurnEnabled) {
            this.stopAutoTurn();
            this.startAutoTurn();
        }
    }

    /**
     * Obtiene la duración del turno en segundos
     */
    getTurnDuration() {
        return this.turnDuration / 1000;
    }

    /**
     * Inicia los turnos automáticos
     */
    startAutoTurn() {
        if (this.autoTurnEnabled) {
            return; // Ya está activo
        }

        this.autoTurnEnabled = true;
        this.scheduleNextTurn();
    }

    /**
     * Detiene los turnos automáticos
     */
    stopAutoTurn() {
        this.autoTurnEnabled = false;
        
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
    }

    /**
     * Verifica si los turnos automáticos están activos
     */
    isAutoTurnEnabled() {
        return this.autoTurnEnabled;
    }

    /**
     * Programa el siguiente turno automático
     */
    scheduleNextTurn() {
        if (!this.autoTurnEnabled) {
            return;
        }

        this.turnTimer = setTimeout(() => {
            if (this.autoTurnEnabled && !this.gameState.isPaused) {
                this.executeAutoTurn();
            }
        }, this.turnDuration);
    }

    /**
     * Ejecuta un turno automático
     */
    async executeAutoTurn() {
        try {
            // Ejecutar el turno normal
            const result = this.nextTurn();
            
            // Llamar al callback si está definido
            if (this.onTurnComplete && typeof this.onTurnComplete === 'function') {
                await this.onTurnComplete(result);
            }
            
            // Programar el siguiente turno si el juego no ha terminado
            if (this.autoTurnEnabled && !result.gameOver) {
                this.scheduleNextTurn();
            } else if (result.gameOver) {
                this.stopAutoTurn();
            }
        } catch (error) {
            console.error('Error en turno automático:', error);
            // Continuar con el siguiente turno incluso si hay error
            if (this.autoTurnEnabled) {
                this.scheduleNextTurn();
            }
        }
    }

    /**
     * Establece el callback para cuando se completa un turno
     */
    setTurnCompleteCallback(callback) {
        this.onTurnComplete = callback;
    }

}
