/**
 * ============================================
 * CITY BUILDER GAME - NEWS SERVICE
 * ============================================
 * Obtiene noticias reales relacionadas con
 * ciudad, clima e infraestructura.
 */

import { APIService } from "./APIService.js";

export class NewsService {

    constructor(config = {}) {
        this.config = config;
        this.newsHistory = [];
        this.currentNews = [];
        
        // NewsAPI configuration
        this.apiKey = config.newsApiKey || null;
        this.updateInterval = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.lastUpdate = 0;
        this.updateTimer = null;
        
        // Auto-update configuration
        if (config.autoUpdate !== false) {
            this.startAutoUpdate();
        }
    }

    async fetchExternalNews(city, weather, collapseStatus) {
        if (this.config.enabled === false || this.config.disableExternalAPIs === true) {
            // Use local fallback immediately
            const fallbackMessage = this.generateFallbackNews(city, weather, collapseStatus);
            this.currentNews = [{ 
                title: fallbackMessage,
                description: "Noticia generada localmente.",
                source: "Sistema Local",
                url: "#",
                publishedAt: new Date().toISOString()
            }];
            this.lastUpdate = Date.now();
            return this.currentNews;
        }

        // Check if we need to update (30-minute interval)
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval && this.currentNews.length > 0) {
            return this.currentNews;
        }

        // Try NewsAPI first if API key is available
        if (this.apiKey) {
            try {
                const newsData = await this.fetchNewsAPI(city);
                if (newsData && newsData.articles) {
                    this.currentNews = newsData.articles.slice(0, 5); // Get latest 5 news
                    this.lastUpdate = now;
                    return this.currentNews;
                }
            } catch (error) {
                console.warn('NewsAPI failed, falling back to GDELT:', error);
            }
        }

        // Fallback to GDELT with better error handling
        try {
            const query = this.buildNewsQuery(city, weather, collapseStatus);
            const params = new URLSearchParams({
                query,
                mode: "ArtList",
                maxrecords: "5",
                format: "json",
                sort: "DateDesc"
            });

            const data = await APIService.fetchExternalJSON(
                `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`,
                { timeout: 10000, retries: 1 } // Reduce retries to avoid rate limiting
            );

            const articles = data?.articles || [];
            this.currentNews = articles;
            this.lastUpdate = now;
            return this.currentNews;
        } catch (error) {
            console.warn('GDELT API failed, using local fallback:', error.message);
            // Generate local fallback news immediately
            const fallbackMessage = this.generateFallbackNews(city, weather, collapseStatus);
            this.currentNews = [{ 
                title: fallbackMessage,
                description: "Noticia generada localmente debido a problemas de conectividad.",
                source: "Sistema Local",
                url: "#",
                publishedAt: new Date().toISOString()
            }];
            this.lastUpdate = now;
            return this.currentNews;
        }
    }

    /**
     * Fetch news from NewsAPI
     */
    async fetchNewsAPI(city) {
        const countryCode = this.getCountryCode(city);
        const params = new URLSearchParams({
            apiKey: this.apiKey,
            country: countryCode,
            category: 'general',
            pageSize: 5,
            sortBy: 'publishedAt',
            language: 'es'
        });

        const data = await APIService.fetchExternalJSON(
            `https://newsapi.org/v2/top-headlines?${params.toString()}`,
            { timeout: 15000 }
        );

        return data;
    }

    /**
     * Get country code based on city location
     */
    getCountryCode(city) {
        // Default to Spain for Spanish news, but could be configurable
        if (city?.countryCode) {
            return city.countryCode.toLowerCase();
        }
        
        // Map common Spanish-speaking countries
        const countryMapping = {
            'es': 'es', // Spain
            'mx': 'mx', // Mexico
            'co': 'co', // Colombia
            'ar': 'ar', // Argentina
            'pe': 'pe', // Peru
            've': 've', // Venezuela
            'cl': 'cl', // Chile
            'ec': 'ec', // Ecuador
            'gt': 'gt', // Guatemala
            'cu': 'cu'  // Cuba
        };

        return this.config.defaultCountry || 'es';
    }

    buildNewsQuery(city, weather, collapseStatus) {
        const cityName = city?.name?.trim();

        if (collapseStatus === "water") {
            return "water shortage urban infrastructure public services";
        }

        if (collapseStatus === "electricity") {
            return "power outage urban infrastructure public services";
        }

        if (collapseStatus === "money") {
            return "urban economy city budget public services";
        }

        if (collapseStatus === "food") {
            return "food supply city logistics urban";
        }

        if (weather?.type === "STORM") {
            return "storm city infrastructure resilience transport";
        }

        if (weather?.type === "DROUGHT") {
            return "drought water supply city infrastructure";
        }

        if (cityName && cityName.toLowerCase() !== "mi ciudad") {
            return `${cityName} urban development infrastructure`;
        }

        return this.config.defaultQuery || "urban development city infrastructure public services";
    }

    formatExternalNews(article) {
        const title = article.title?.trim();
        const description = article.description?.trim();
        const domain = article.domain?.trim();
        const source = article.source?.name?.trim();
        const url = article.url?.trim();
        const imageUrl = article.urlToImage?.trim();

        if (!title) {
            return null;
        }

        return {
            title,
            description,
            source: source || domain || "Fuente desconocida",
            url,
            imageUrl,
            publishedAt: article.publishedAt,
            content: article.content
        };
    }

    /**
     * Format multiple news articles for display
     */
    formatNewsArticles(articles) {
        if (!Array.isArray(articles)) {
            return [];
        }

        return articles
            .map(article => this.formatExternalNews(article))
            .filter(article => article && article.title)
            .slice(0, 5); // Ensure max 5 articles
    }

    generateFallbackNews(city, weather, collapseStatus) {
        if (collapseStatus) {
            return "Alerta local: la ciudad esta bajo presion por falta de recursos esenciales.";
        }

        if (city.resources.money < 100) {
            return "Boletin local: las finanzas municipales necesitan una recuperacion urgente.";
        }

        if (city.resources.electricity < 0) {
            return "Boletin local: el suministro electrico presenta fallas en varios sectores.";
        }

        if (city.resources.water < 0) {
            return "Boletin local: hay tension en la red de agua de la ciudad.";
        }

        if (weather?.type === "SUNNY") {
            return "Boletin local: el buen clima favorece la actividad economica y urbana.";
        }

        if (weather?.type === "STORM") {
            return "Boletin local: las tormentas estan afectando la movilidad y la produccion.";
        }

        if (weather?.type === "DROUGHT") {
            return "Boletin local: la sequia aumenta la presion sobre el sistema hidrico.";
        }

        if (city.getPopulation() > 50) {
            return "Boletin local: la ciudad mantiene un ritmo sostenido de crecimiento.";
        }

        return "Boletin local: la ciudad avanza con estabilidad.";
    }

    /**
     * Genera noticia según estado actual
     */
    async generateNews(city, weather, collapseStatus) {
        const articles = await this.fetchExternalNews(city, weather, collapseStatus);

        const formattedArticles = this.formatNewsArticles(articles);
        
        // Add to history
        formattedArticles.forEach(article => {
            this.newsHistory.push(article);
        });

        // If no real articles, use fallback
        if (formattedArticles.length === 0) {
            const fallbackMessage = this.generateFallbackNews(city, weather, collapseStatus);
            this.newsHistory.push(fallbackMessage);
            return [fallbackMessage];
        }

        return formattedArticles;
    }

    /**
     * Obtener historial de noticias
     */
    getHistory() {
        return this.newsHistory;
    }

    /**
     * Obtener noticias actuales
     */
    getCurrentNews() {
        return this.currentNews;
    }

    /**
     * Iniciar actualización automática cada 30 minutos
     */
    startAutoUpdate(city = null, weather = null, collapseStatus = null) {
        this.stopAutoUpdate(); // Clear any existing timer
        
        const updateNews = async () => {
            try {
                await this.fetchExternalNews(city, weather, collapseStatus);
            } catch (error) {
                console.error('News auto-update failed:', error);
            }
        };

        // Initial update
        updateNews();
        
        // Set up periodic updates
        this.updateTimer = setInterval(updateNews, this.updateInterval);
    }

    /**
     * Detener actualización automática
     */
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    /**
     * Establecer API key de NewsAPI
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Obtener tiempo hasta la próxima actualización
     */
    getTimeUntilNextUpdate() {
        if (!this.lastUpdate) return 0;
        const timeSinceUpdate = Date.now() - this.lastUpdate;
        return Math.max(0, this.updateInterval - timeSinceUpdate);
    }

    /**
     * Forzar actualización manual
     */
    async forceUpdate(city, weather, collapseStatus) {
        this.lastUpdate = 0; // Reset timer to force update
        return await this.fetchExternalNews(city, weather, collapseStatus);
    }

}
