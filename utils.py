import os
import shutil
import zipfile
import pymupdf as fitz  # PyMuPDF
from flask import current_app, render_template
import logging

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_flipbook(pdf_path, unique_id, background_color='#f5f5f5', title='ספר דיגיטלי', background_image_path=None):
    """Generate a complete flipbook from PDF file"""
    try:
        # Create output directory for this flipbook
        flipbook_dir = os.path.join(current_app.config['OUTPUT_FOLDER'], unique_id)
        os.makedirs(flipbook_dir, exist_ok=True)
        
        # Copy PDF to flipbook directory
        pdf_dest = os.path.join(flipbook_dir, 'input.pdf')
        shutil.copy2(pdf_path, pdf_dest)
        
        # Copy background image if provided
        background_image_filename = None
        if background_image_path and os.path.exists(background_image_path):
            background_image_filename = 'background' + os.path.splitext(background_image_path)[1]
            bg_dest = os.path.join(flipbook_dir, background_image_filename)
            shutil.copy2(background_image_path, bg_dest)
        
        # Get PDF info
        doc = fitz.open(pdf_path)
        total_pages = doc.page_count
        doc.close()
        
        # Copy PDF.js files
        pdfjs_dir = os.path.join(flipbook_dir, 'pdfjs')
        os.makedirs(pdfjs_dir, exist_ok=True)
        
        # Copy PDF.js library files from static directory
        static_pdfjs = os.path.join('static', 'pdfjs')
        for file in ['pdf.min.js', 'pdf.worker.min.js']:
            src = os.path.join(static_pdfjs, file)
            dst = os.path.join(pdfjs_dir, file)
            if os.path.exists(src):
                shutil.copy2(src, dst)
        
        # Generate HTML file
        html_content = render_template('flipbook_template.html',
                                     title=title,
                                     total_pages=total_pages,
                                     background_color=background_color,
                                     background_image=background_image_filename)
        
        with open(os.path.join(flipbook_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Copy CSS files
        css_files = ['flipbook.css']
        for css_file in css_files:
            src = os.path.join('static', 'css', css_file)
            dst = os.path.join(flipbook_dir, css_file)
            if os.path.exists(src):
                shutil.copy2(src, dst)
        
        # Copy JS files
        js_files = ['flipbook.js']
        for js_file in js_files:
            src = os.path.join('static', 'js', js_file)
            dst = os.path.join(flipbook_dir, js_file)
            if os.path.exists(src):
                shutil.copy2(src, dst)
        
        # Create ZIP file
        zip_path = os.path.join(current_app.config['OUTPUT_FOLDER'], f'{unique_id}.zip')
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(flipbook_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, flipbook_dir)
                    zipf.write(file_path, arc_name)
        
        # Clean up temporary directory
        shutil.rmtree(flipbook_dir)
        
        return zip_path
        
    except Exception as e:
        logging.error(f"Error in generate_flipbook: {str(e)}")
        raise e
