/**
 * ============================================
 * CITY BUILDER GAME - RESPONSIVE CONTROLLER
 * ============================================
 * Maneja la responsividad, zoom y navegación táctil
 */

export class ResponsiveController {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentZoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2;
        this.zoomStep = 0.25;
        
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateZoomIndicator();
    }
    
    initializeElements() {
        this.mapContainer = document.getElementById('map-container');
        this.gameGrid = document.getElementById('game-grid');
        this.zoomInBtn = document.getElementById('zoom-in-btn');
        this.zoomOutBtn = document.getElementById('zoom-out-btn');
        this.zoomResetBtn = document.getElementById('zoom-reset-btn');
        this.zoomIndicator = document.getElementById('zoom-indicator');
        this.touchPanIndicator = document.getElementById('touch-pan-indicator');
        this.minimap = document.getElementById('minimap');
        this.minimapViewport = document.getElementById('minimap-viewport');
    }
    
    bindEvents() {
        // Controles de zoom
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
        
        if (this.zoomResetBtn) {
            this.zoomResetBtn.addEventListener('click', () => this.resetZoom());
        }
        
        // Zoom con rueda del mouse
        if (this.mapContainer) {
            this.mapContainer.addEventListener('wheel', (e) => this.handleWheel(e));
        }
        
        // Navegación con mouse (desktop)
        if (this.mapContainer) {
            this.mapContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.mapContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.mapContainer.addEventListener('mouseup', () => this.handleMouseUp());
            this.mapContainer.addEventListener('mouseleave', () => this.handleMouseUp());
        }
        
        // Navegación táctil (mobile/tablet)
        if (this.mapContainer) {
            this.mapContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            this.mapContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            this.mapContainer.addEventListener('touchend', () => this.handleTouchEnd());
        }
        
        // Doble click para zoom
        if (this.mapContainer) {
            this.mapContainer.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        }
        
        // Resize de ventana
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom + delta));
        
        if (newZoom !== this.currentZoom) {
            this.setZoom(newZoom);
        }
    }
    
    handleMouseDown(e) {
        if (e.button === 0) { // Solo click izquierdo
            this.isDragging = true;
            this.startX = e.pageX - this.mapContainer.offsetLeft;
            this.startY = e.pageY - this.mapContainer.offsetTop;
            this.scrollLeft = this.mapContainer.scrollLeft;
            this.scrollTop = this.mapContainer.scrollTop;
            
            this.mapContainer.style.cursor = 'grabbing';
            this.mapContainer.classList.add('scrollable');
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const x = e.pageX - this.mapContainer.offsetLeft;
        const y = e.pageY - this.mapContainer.offsetTop;
        
        const walkX = (x - this.startX) * 2;
        const walkY = (y - this.startY) * 2;
        
        this.mapContainer.scrollLeft = this.scrollLeft - walkX;
        this.mapContainer.scrollTop = this.scrollTop - walkY;
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.mapContainer.style.cursor = '';
        this.mapContainer.classList.remove('scrollable');
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.lastTouchX = this.touchStartX;
            this.lastTouchY = this.touchStartY;
            
            // Mostrar indicador de navegación táctil
            if (this.touchPanIndicator) {
                this.touchPanIndicator.classList.add('visible');
                setTimeout(() => {
                    this.touchPanIndicator.classList.remove('visible');
                }, 2000);
            }
        } else if (e.touches.length === 2) {
            // Pinch zoom
            this.handlePinchStart(e);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Pan con un dedo
            const deltaX = e.touches[0].clientX - this.lastTouchX;
            const deltaY = e.touches[0].clientY - this.lastTouchY;
            
            this.mapContainer.scrollLeft -= deltaX;
            this.mapContainer.scrollTop -= deltaY;
            
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Pinch zoom
            this.handlePinchMove(e);
        }
    }
    
    handleTouchEnd() {
        // Limpiar estados de touch
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
    }
    
    handleDoubleClick(e) {
        e.preventDefault();
        
        // Zoom in en el punto del doble click
        const rect = this.mapContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomStep);
        this.setZoom(newZoom);
        
        // Centrar en el punto del click
        const centerX = x - rect.width / 2;
        const centerY = y - rect.height / 2;
        
        this.mapContainer.scrollLeft += centerX;
        this.mapContainer.scrollTop += centerY;
    }
    
    handlePinchStart(e) {
        this.pinchDistance = this.getDistance(e.touches[0], e.touches[1]);
        this.pinchZoom = this.currentZoom;
    }
    
    handlePinchMove(e) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / this.pinchDistance;
        
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.pinchZoom * scale));
        
        if (newZoom !== this.currentZoom) {
            this.setZoom(newZoom);
        }
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    handleResize() {
        this.adjustMapToViewport();
        this.updateMinimap();
    }
    
    zoomIn() {
        const newZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomStep);
        this.setZoom(newZoom);
    }
    
    zoomOut() {
        const newZoom = Math.max(this.minZoom, this.currentZoom - this.zoomStep);
        this.setZoom(newZoom);
    }
    
    resetZoom() {
        this.setZoom(1);
        this.centerMap();
    }
    
    setZoom(zoom) {
        this.currentZoom = zoom;
        
        if (this.gameGrid) {
            // Remover todas las clases de zoom
            this.gameGrid.classList.remove('zoom-1', 'zoom-2', 'zoom-3', 'zoom-4', 'zoom-5', 'zoom-6');
            
            // Añadir la clase de zoom correspondiente
            const zoomClass = Math.round(zoom * 2);
            this.gameGrid.classList.add(`zoom-${zoomClass}`);
            
            // Aplicar transformación directa si es necesario
            this.gameGrid.style.transform = `scale(${zoom})`;
        }
        
        // Ajustar scroll según el zoom
        if (zoom > 1) {
            this.mapContainer.classList.add('zoomed');
            this.mapContainer.style.overflow = 'auto';
        } else {
            this.mapContainer.classList.remove('zoomed');
            this.mapContainer.style.overflow = 'hidden';
        }
        
        this.updateZoomIndicator();
        this.updateMinimap();
        this.adjustMapToViewport();
    }
    
    updateZoomIndicator() {
        if (this.zoomIndicator) {
            const percentage = Math.round(this.currentZoom * 100);
            this.zoomIndicator.textContent = `${percentage}%`;
        }
    }
    
    updateMinimap() {
        if (!this.minimap || !this.minimapViewport || !this.mapContainer) return;
        
        // Actualizar el viewport del minimapa
        const mapWidth = this.mapContainer.scrollWidth;
        const mapHeight = this.mapContainer.scrollHeight;
        const viewportWidth = this.mapContainer.clientWidth;
        const viewportHeight = this.mapContainer.clientHeight;
        const scrollLeft = this.mapContainer.scrollLeft;
        const scrollTop = this.mapContainer.scrollTop;
        
        const scaleX = 120 / mapWidth; // Ancho del minimapa
        const scaleY = 120 / mapHeight; // Alto del minimapa
        
        this.minimapViewport.style.width = `${viewportWidth * scaleX}px`;
        this.minimapViewport.style.height = `${viewportHeight * scaleY}px`;
        this.minimapViewport.style.left = `${scrollLeft * scaleX}px`;
        this.minimapViewport.style.top = `${scrollTop * scaleY}px`;
    }
    
    adjustMapToViewport() {
        // Ajustar el tamaño del mapa según el viewport
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1199;
        
        if (this.gameGrid) {
            if (isMobile && this.currentZoom > 1) {
                // En mobile con zoom, permitir scroll
                this.mapContainer.style.overflow = 'auto';
            } else if (isTablet && this.currentZoom > 1.5) {
                // En tablet con zoom alto, permitir scroll
                this.mapContainer.style.overflow = 'auto';
            } else {
                this.mapContainer.style.overflow = 'hidden';
            }
        }
    }
    
    centerMap() {
        if (this.mapContainer) {
            this.mapContainer.scrollLeft = (this.mapContainer.scrollWidth - this.mapContainer.clientWidth) / 2;
            this.mapContainer.scrollTop = (this.mapContainer.scrollHeight - this.mapContainer.clientHeight) / 2;
        }
    }
    
    getOptimalTileSize() {
        const viewportWidth = this.mapContainer.clientWidth;
        const viewportHeight = this.mapContainer.clientHeight;
        
        // Calcular el tamaño óptimo del tile según el viewport
        let tileSize = 32; // Base
        
        if (window.innerWidth <= 480) {
            tileSize = 18;
        } else if (window.innerWidth <= 768) {
            tileSize = 24;
        } else if (window.innerWidth <= 1024) {
            tileSize = 28;
        } else if (window.innerWidth <= 1200) {
            tileSize = 32;
        } else if (window.innerWidth <= 1600) {
            tileSize = 36;
        } else {
            tileSize = 40;
        }
        
        // Ajustar según el zoom
        tileSize = Math.round(tileSize * this.currentZoom);
        
        return Math.max(16, Math.min(48, tileSize)); // Limitar entre 16px y 48px
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.mapContainer.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Métodos públicos para que otros componentes puedan interactuar
    getCurrentZoom() {
        return this.currentZoom;
    }
    
    setZoomLevel(level) {
        this.setZoom(level);
    }
    
    centerOnPosition(x, y) {
        if (!this.mapContainer || !this.gameGrid) return;
        
        const tileWidth = this.getOptimalTileSize();
        const tileHeight = tileWidth;
        const gap = 4; // Gap entre tiles
        
        const pixelX = x * (tileWidth + gap);
        const pixelY = y * (tileHeight + gap);
        
        const centerX = pixelX - this.mapContainer.clientWidth / 2;
        const centerY = pixelY - this.mapContainer.clientHeight / 2;
        
        this.mapContainer.scrollLeft = centerX;
        this.mapContainer.scrollTop = centerY;
    }
    
    destroy() {
        // Limpiar event listeners
        window.removeEventListener('resize', this.handleResize);
        
        if (this.mapContainer) {
            this.mapContainer.removeEventListener('wheel', this.handleWheel);
            this.mapContainer.removeEventListener('mousedown', this.handleMouseDown);
            this.mapContainer.removeEventListener('mousemove', this.handleMouseMove);
            this.mapContainer.removeEventListener('mouseup', this.handleMouseUp);
            this.mapContainer.removeEventListener('mouseleave', this.handleMouseUp);
            this.mapContainer.removeEventListener('touchstart', this.handleTouchStart);
            this.mapContainer.removeEventListener('touchmove', this.handleTouchMove);
            this.mapContainer.removeEventListener('touchend', this.handleTouchEnd);
            this.mapContainer.removeEventListener('dblclick', this.handleDoubleClick);
        }
    }
}
