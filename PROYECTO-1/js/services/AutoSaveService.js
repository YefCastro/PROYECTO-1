/**
 * ============================================
 * CITY BUILDER GAME - AUTO-SAVE SERVICE
 * ============================================
 * Manages automatic saving every 30 seconds and manual save/export
 */

import { City } from "../../models/City.js";

export class AutoSaveService {

    constructor(city, config = {}) {
        this.city = city;
        this.config = config;
        this.domainRules = null; // Will be set after initialization
        this.saveInterval = 30 * 1000; // 30 seconds
        this.timer = null;
        this.lastSaveTime = 0;
        this.autoSaveEnabled = config.autoSave !== false;
        
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }
    }

    setDomainRules(domainRules) {
        this.domainRules = domainRules;
    }

    /**
     * Iniciar guardado automático
     */
    startAutoSave() {
        this.stopAutoSave(); // Clear any existing timer
        
        const save = () => {
            try {
                this.performAutoSave();
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        };

        // Initial save
        save();
        
        // Set up periodic saves
        this.timer = setInterval(save, this.saveInterval);
    }

    /**
     * Detener guardado automático
     */
    stopAutoSave() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Realizar guardado automático
     */
    performAutoSave() {
        if (!this.domainRules) {
            // Silently skip auto-save if DomainRulesService is not available yet
            // This prevents warning messages during initialization
            return false;
        }

        try {
            const result = this.domainRules.saveToLocalStorage();
            
            if (result.success) {
                this.lastSaveTime = Date.now();
                console.log('Auto-save completed successfully');
                return true;
            } else {
                console.error('Auto-save failed:', result.message);
                return false;
            }
        } catch (error) {
            console.error('Auto-save error:', error);
            return false;
        }
    }

    /**
     * Forzar guardado manual
     */
    forceSave() {
        return this.performAutoSave();
    }

    /**
     * Exportar ciudad a archivo JSON
     */
    exportToJSON() {
        if (!this.domainRules) {
            return { success: false, message: 'DomainRulesService not available' };
        }

        return this.domainRules.exportToJSON();
    }

    /**
     * Importar ciudad desde archivo JSON
     */
    importFromJSON(jsonData) {
        if (!this.domainRules) {
            return { success: false, message: 'DomainRulesService not available' };
        }

        return this.domainRules.importFromJSON(jsonData);
    }

    /**
     * Cargar desde LocalStorage
     */
    loadFromLocalStorage() {
        if (!this.domainRules) {
            return { success: false, message: 'DomainRulesService not available' };
        }

        return this.domainRules.loadFromLocalStorage();
    }

    /**
     * Obtener tiempo hasta el próximo guardado
     */
    getTimeUntilNextSave() {
        if (!this.timer) return 0;
        
        const timeSinceLastSave = Date.now() - this.lastSaveTime;
        return Math.max(0, this.saveInterval - timeSinceLastSave);
    }

    /**
     * Obtener estado del guardado automático
     */
    getAutoSaveStatus() {
        return {
            enabled: this.autoSaveEnabled,
            active: this.timer !== null,
            lastSaveTime: this.lastSaveTime,
            nextSaveIn: this.getTimeUntilNextSave(),
            interval: this.saveInterval
        };
    }

    /**
     * Activar/desactivar guardado automático
     */
    setAutoSaveEnabled(enabled) {
        this.autoSaveEnabled = enabled;
        
        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
    }

    /**
     * Limpiar recursos
     */
    destroy() {
        this.stopAutoSave();
    }
}
