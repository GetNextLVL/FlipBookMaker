// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const generateBtn = document.getElementById('generateBtn');
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    const pdfFileInput = document.getElementById('pdf_file');
    
    // File validation
    pdfFileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Check file type
            if (file.type !== 'application/pdf') {
                showAlert('אנא בחר קובץ PDF בלבד', 'error');
                this.value = '';
                return;
            }
            
            // Check file size (50MB)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                showAlert('הקובץ גדול מדי. גודל מקסימלי: 50MB', 'error');
                this.value = '';
                return;
            }
            
            // Show file info
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            console.log(`קובץ נבחר: ${file.name} (${fileSize} MB)`);
        }
    });
    
    // Form submission
    uploadForm.addEventListener('submit', function(e) {
        const file = pdfFileInput.files[0];
        if (!file) {
            e.preventDefault();
            showAlert('אנא בחר קובץ PDF', 'error');
            return;
        }
        
        // Show loading state
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        loadingModal.show();
        
        // Set timeout to hide modal in case of server error
        setTimeout(function() {
            loadingModal.hide();
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }, 30000); // 30 seconds timeout
    });
    
    // Handle form errors (when redirected back)
    window.addEventListener('load', function() {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        loadingModal.hide();
    });
    
    // Color picker preview
    const colorPicker = document.getElementById('background_color');
    const colorPreview = document.createElement('div');
    colorPreview.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 5px;
        display: inline-block;
        margin-right: 10px;
        border: 2px solid #ddd;
        vertical-align: middle;
    `;
    
    colorPicker.parentNode.insertBefore(colorPreview, colorPicker);
    
    function updateColorPreview() {
        colorPreview.style.backgroundColor = colorPicker.value;
    }
    
    colorPicker.addEventListener('change', updateColorPreview);
    updateColorPreview(); // Initial update
    
    // Drag and drop functionality
    const fileDropArea = document.querySelector('.card-body');
    let dragCounter = 0;
    
    fileDropArea.addEventListener('dragenter', function(e) {
        e.preventDefault();
        dragCounter++;
        this.classList.add('drag-over');
    });
    
    fileDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            this.classList.remove('drag-over');
        }
    });
    
    fileDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    fileDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dragCounter = 0;
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                pdfFileInput.files = files;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                pdfFileInput.dispatchEvent(event);
            } else {
                showAlert('אנא גרור קובץ PDF בלבד', 'error');
            }
        }
    });
    
    // Add drag styles
    const style = document.createElement('style');
    style.textContent = `
        .drag-over {
            background-color: rgba(102, 126, 234, 0.1) !important;
            border: 2px dashed #667eea !important;
        }
    `;
    document.head.appendChild(style);
});

// Utility function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    const firstChild = container.firstElementChild;
    container.insertBefore(alertDiv, firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(function() {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Handle download completion
window.addEventListener('focus', function() {
    const loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
    if (loadingModal) {
        loadingModal.hide();
    }
    
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
});
