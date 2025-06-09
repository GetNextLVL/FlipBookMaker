// Flipbook functionality
class FlipbookViewer {
    constructor() {
        this.pdfDoc = null;
        this.pageNum = 1;
        this.totalPages = window.TOTAL_PAGES || 1;
        this.scale = 1.2;
        this.isDoublePageMode = false;
        this.canvas = document.getElementById('pdf-canvas');
        this.canvas2 = document.getElementById('pdf-canvas-2');
        this.ctx = this.canvas.getContext('2d');
        this.ctx2 = this.canvas2.getContext('2d');
        
        this.init();
    }
    
    async init() {
        try {
            // Load PDF
            const loadingTask = pdfjsLib.getDocument('input.pdf');
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            
            // Update total pages display
            document.getElementById('total-pages').textContent = this.totalPages;
            document.getElementById('page-input').max = this.totalPages;
            
            // Render first page
            this.renderPage();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('PDF loaded successfully');
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('שגיאה בטעינת הקובץ');
        }
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.prevPage();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextPage();
        });
        
        // View mode buttons
        document.getElementById('single-page-btn').addEventListener('click', () => {
            this.setSinglePageMode();
        });
        
        document.getElementById('double-page-btn').addEventListener('click', () => {
            this.setDoublePageMode();
        });
        
        // Page selector
        document.getElementById('go-to-page').addEventListener('click', () => {
            this.goToPage();
        });
        
        document.getElementById('page-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.goToPage();
            }
        });
        
        // Keyboard navigation (RTL Hebrew)
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.nextPage(); // RTL: left arrow = next page
                    break;
                case 'ArrowRight':
                    this.prevPage(); // RTL: right arrow = previous page
                    break;
                case 'Home':
                    this.goToPage(1);
                    break;
                case 'End':
                    this.goToPage(this.totalPages);
                    break;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.renderPage();
        });
    }
    
    async renderPage() {
        if (!this.pdfDoc) return;
        
        try {
            // Show loading
            document.getElementById('pdf-container').classList.add('loading');
            
            if (this.isDoublePageMode && this.pageNum > 1) {
                // Render two pages side by side
                await this.renderDoublePage();
            } else {
                // Render single page
                await this.renderSinglePage();
            }
            
            this.updateUI();
            
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showError('שגיאה בהצגת העמוד');
        } finally {
            document.getElementById('pdf-container').classList.remove('loading');
        }
    }
    
    async renderSinglePage() {
        const page = await this.pdfDoc.getPage(this.pageNum);
        const viewport = page.getViewport({ scale: this.scale });
        
        // Adjust canvas size
        this.canvas.width = viewport.width;
        this.canvas.height = viewport.height;
        
        // Render page
        const renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Hide second canvas
        this.canvas2.style.display = 'none';
    }
    
    async renderDoublePage() {
        // Render left page (current page)
        const leftPage = await this.pdfDoc.getPage(this.pageNum);
        const leftViewport = leftPage.getViewport({ scale: this.scale });
        
        this.canvas.width = leftViewport.width;
        this.canvas.height = leftViewport.height;
        
        const leftRenderContext = {
            canvasContext: this.ctx,
            viewport: leftViewport
        };
        
        await leftPage.render(leftRenderContext).promise;
        
        // Render right page (next page) if exists
        if (this.pageNum < this.totalPages) {
            const rightPage = await this.pdfDoc.getPage(this.pageNum + 1);
            const rightViewport = rightPage.getViewport({ scale: this.scale });
            
            this.canvas2.width = rightViewport.width;
            this.canvas2.height = rightViewport.height;
            this.canvas2.style.display = 'block';
            
            const rightRenderContext = {
                canvasContext: this.ctx2,
                viewport: rightViewport
            };
            
            await rightPage.render(rightRenderContext).promise;
        } else {
            this.canvas2.style.display = 'none';
        }
    }
    
    nextPage() {
        if (this.isDoublePageMode && this.pageNum > 1) {
            // In double page mode, skip by 2
            if (this.pageNum + 2 <= this.totalPages) {
                this.pageNum += 2;
            } else if (this.pageNum + 1 <= this.totalPages) {
                this.pageNum += 1;
            }
        } else {
            if (this.pageNum < this.totalPages) {
                this.pageNum++;
            }
        }
        this.renderPage();
    }
    
    prevPage() {
        if (this.isDoublePageMode && this.pageNum > 1) {
            // In double page mode, skip by 2
            this.pageNum = Math.max(1, this.pageNum - 2);
        } else {
            this.pageNum = Math.max(1, this.pageNum - 1);
        }
        this.renderPage();
    }
    
    goToPage(pageNumber = null) {
        const targetPage = pageNumber || parseInt(document.getElementById('page-input').value);
        
        if (targetPage >= 1 && targetPage <= this.totalPages) {
            this.pageNum = targetPage;
            this.renderPage();
        } else {
            this.showError('מספר עמוד לא תקין');
        }
    }
    
    setSinglePageMode() {
        this.isDoublePageMode = false;
        document.getElementById('single-page-btn').classList.add('active');
        document.getElementById('double-page-btn').classList.remove('active');
        document.body.classList.remove('double-page-mode');
        document.body.classList.add('single-page-mode');
        this.renderPage();
    }
    
    setDoublePageMode() {
        this.isDoublePageMode = true;
        document.getElementById('double-page-btn').classList.add('active');
        document.getElementById('single-page-btn').classList.remove('active');
        document.body.classList.add('double-page-mode');
        document.body.classList.remove('single-page-mode');
        
        // Adjust page number for double page mode
        if (this.pageNum === 1) {
            this.pageNum = 1; // Keep first page single
        } else if (this.pageNum % 2 === 0) {
            this.pageNum = this.pageNum - 1; // Make it odd for left page
        }
        
        this.renderPage();
    }
    
    updateUI() {
        // Update page info
        document.getElementById('current-page').textContent = this.pageNum;
        document.getElementById('page-input').value = this.pageNum;
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.pageNum <= 1;
        
        if (this.isDoublePageMode && this.pageNum > 1) {
            nextBtn.disabled = this.pageNum >= this.totalPages;
        } else {
            nextBtn.disabled = this.pageNum >= this.totalPages;
        }
    }
    
    showError(message) {
        const container = document.getElementById('pdf-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <i style="font-size: 48px; margin-bottom: 20px;">⚠️</i>
                <h3>${message}</h3>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    טען מחדש
                </button>
            </div>
        `;
    }
}

// Initialize flipbook when DOM is loaded
let flipbookInstance;
document.addEventListener('DOMContentLoaded', function() {
    flipbookInstance = new FlipbookViewer();
});

// Add touch gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next page in RTL Hebrew
            flipbookInstance?.nextPage();
        } else {
            // Swipe right - previous page in RTL Hebrew
            flipbookInstance?.prevPage();
        }
    }
}
