/**
 * ============================================
 * CITY BUILDER GAME - CONFIG
 * ============================================
 * Gestiona configuración dinámica del juego
 * cargada desde JSON externo.
 */

export class Config {

    constructor() {
        this.configData = null;
    }

    /**
     * Carga configuración desde archivo JSON
     */
    async load(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Error loading configuration file");
            }

            this.configData = await response.json();
            console.log("Game configuration loaded successfully.");
        } catch (error) {
            console.error("Config load error:", error);
        }
    }

    /**
     * Obtiene valor por clave
     */
    get(key) {
        if (!this.configData) {
            console.warn("Configuration not loaded yet.");
            return null;
        }

        return this.configData[key];
    }

    /**
     * Obtiene configuración completa
     */
    getAll() {
        return this.configData;
    }

    /**
     * Actualiza valor en memoria (no persiste automáticamente)
     */
    set(key, value) {
        if (!this.configData) {
            this.configData = {};
        }

        this.configData[key] = value;
    }

}