/**
 * ============================================
 * CITY BUILDER GAME - HELPERS
 * ============================================
 * Funciones utilitarias reutilizables.
 * No contienen lógica del dominio.
 */

export const Helpers = {

    /**
     * Genera un ID único simple
     */
    generateId(prefix = "id") {
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    },

    /**
     * Retorna un número aleatorio entero entre min y max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Formatea números como dinero
     */
    formatMoney(amount) {
        return `$${amount.toLocaleString()}`;
    },

    /**
     * Limita un valor entre un mínimo y máximo
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Calcula promedio de un arreglo de números
     */
    average(numbers) {
        if (!numbers.length) return 0;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return sum / numbers.length;
    },

    /**
     * Calcula distancia Manhattan entre dos puntos
     */
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },

    /**
     * Deep clone simple para objetos serializables
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounce para eventos (ej: resize)
     */
    debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Crea matriz bidimensional
     */
    createMatrix(rows, cols, defaultValue = null) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(typeof defaultValue === "function" ? defaultValue(i, j) : defaultValue);
            }
            matrix.push(row);
        }
        return matrix;
    },

    /**
     * Verifica si coordenada está dentro del mapa
     */
    isWithinBounds(x, y, width, height) {
        return x >= 0 && y >= 0 && x < width && y < height;
    }

};