/**
 * ============================================
 * CITY BUILDER GAME - LOCAL STORAGE WRAPPER
 * ============================================
 * Encapsula el uso de window.localStorage
 * para mantener el código limpio y centralizado.
 */

export const Storage = {

    /**
     * Guarda datos en LocalStorage
     */
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            window.localStorage.setItem(key, serialized);
        } catch (error) {
            console.error("Error saving to LocalStorage:", error);
        }
    },

    /**
     * Obtiene datos de LocalStorage
     */
    get(key) {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Error reading from LocalStorage:", error);
            return null;
        }
    },

    /**
     * Elimina una clave específica
     */
    remove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error("Error removing from LocalStorage:", error);
        }
    },

    /**
     * Limpia todo el LocalStorage
     */
    clear() {
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error("Error clearing LocalStorage:", error);
        }
    },

    /**
     * Verifica si existe una clave
     */
    exists(key) {
        return window.localStorage.getItem(key) !== null;
    }

};