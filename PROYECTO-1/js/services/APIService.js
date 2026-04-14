/**
 * ============================================
 * CITY BUILDER GAME - API SERVICE
 * ============================================
 * Servicio para manejar carga de datos externos
 * y posibles llamadas a backend.
 */

/**
 * Custom error class for API errors
 */
class APIError extends Error {
    constructor(message, status = null, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

export class APIService {

    /**
     * Cargar JSON desde cualquier endpoint con timeout
     */
    static async fetchExternalJSON(url, options = {}) {
        const {
            timeout = 8000,
            headers = {},
            retries = 2
        } = options;

        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            const controller = typeof AbortController !== "undefined"
                ? new AbortController()
                : null;

            const timeoutId = controller
                ? setTimeout(() => controller.abort(), timeout)
                : null;

            try {
                const response = await fetch(url, {
                    headers,
                    signal: controller?.signal
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new APIError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        errorData
                    );
                }

                const data = await response.json();
                return data;

            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error instanceof APIError && error.status >= 400 && error.status < 500) {
                    break;
                }

                // Log retry attempt
                if (attempt < retries) {
                    console.warn(`APIService: Attempt ${attempt + 1} failed, retrying...`, error.message);
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            } finally {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        }

        console.error("APIService Error: All attempts failed", lastError);
        return null;
    }

    /**
     * Check if API is available
     */
    static async checkAPIAvailability(url) {
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Cargar archivo JSON
     */
    static async fetchJSON(path) {
        return APIService.fetchExternalJSON(path);
    }

    /**
     * Simulación futura de guardado en servidor
     */
    static async postData(url, data) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            return await response.json();

        } catch (error) {
            console.error("POST Error:", error);
            return null;
        }
    }

}
