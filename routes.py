import os
import uuid
import zipfile
from flask import render_template, request, flash, redirect, url_for, send_file, current_app
from werkzeug.utils import secure_filename
from app import app
from utils import generate_flipbook, allowed_file
import logging

@app.route('/')
def index():
    """Main page with upload form"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle PDF file upload and generate flipbook"""
    if 'pdf_file' not in request.files:
        flash('לא נבחר קובץ PDF', 'error')
        return redirect(url_for('index'))
    
    file = request.files['pdf_file']
    background_color = request.form.get('background_color', '#f5f5f5')
    custom_title = request.form.get('custom_title', 'ספר דיגיטלי')
    background_image = request.files.get('background_image')
    
    if file.filename == '':
        flash('לא נבחר קובץ PDF', 'error')
        return redirect(url_for('index'))
    
    if file and allowed_file(file.filename):
        try:
            # Generate unique filename
            unique_id = str(uuid.uuid4())
            filename = secure_filename(file.filename or 'document.pdf')
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], f"{unique_id}_{filename}")
            file.save(filepath)
            
            # Save background image if provided
            background_image_path = None
            if background_image and background_image.filename:
                bg_filename = secure_filename(background_image.filename or 'background.jpg')
                background_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], f"{unique_id}_bg_{bg_filename}")
                background_image.save(background_image_path)
            
            # Generate flipbook
            output_path = generate_flipbook(filepath, unique_id, background_color, custom_title, background_image_path)
            
            # Clean up uploaded files
            os.remove(filepath)
            if background_image_path and os.path.exists(background_image_path):
                os.remove(background_image_path)
            
            flash('הספר הדיגיטלי נוצר בהצלחה!', 'success')
            # Create a preview link that opens in new tab
            preview_url = url_for('preview_flipbook', flipbook_id=unique_id)
            return f'''
            <script>
                window.open('{preview_url}', '_blank');
                setTimeout(() => {{
                    window.location.href = '{url_for("index")}';
                }}, 1000);
            </script>
            <div style="text-align: center; padding: 50px; font-family: Arial;">
                <h2>הספר הדיגיטלי נוצר בהצלחה!</h2>
                <p>הספר נפתח בחלון חדש</p>
                <a href="{preview_url}" target="_blank">לחץ כאן אם הספר לא נפתח</a><br><br>
                <a href="{url_for('index')}">חזור לעמוד הראשי</a>
            </div>
            '''
            
        except Exception as e:
            logging.error(f"Error generating flipbook: {str(e)}")
            flash(f'שגיאה ביצירת הספר הדיגיטלי: {str(e)}', 'error')
            return redirect(url_for('index'))
    else:
        flash('קובץ לא תקין. אנא העלה קובץ PDF בלבד.', 'error')
        return redirect(url_for('index'))

@app.route('/preview/<flipbook_id>')
def preview_flipbook(flipbook_id):
    """Preview generated flipbook (for testing purposes)"""
    preview_path = os.path.join(current_app.config['OUTPUT_FOLDER'], flipbook_id, 'index.html')
    if os.path.exists(preview_path):
        with open(preview_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    else:
        flash('הספר הדיגיטלי לא נמצא', 'error')
        return redirect(url_for('index'))

@app.errorhandler(413)
def too_large(e):
    flash('הקובץ גדול מדי. גודל מקסימלי: 50MB', 'error')
    return redirect(url_for('index'))
