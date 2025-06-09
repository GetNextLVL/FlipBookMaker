#!/usr/bin/env python3
"""
Hebrew Flipbook Generator - Windows Launcher
A standalone application for creating offline Hebrew flipbooks from PDF files
"""

import os
import sys
import threading
import time
import webbrowser
import socket

# Add the application directory to Python path
app_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, app_dir)

# Import our Flask app
from app import app

class FlipbookLauncher:
    def __init__(self):
        self.port = self.find_free_port()
        self.server_thread = None
        
    def find_free_port(self):
        """Find a free port for the Flask app"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', 0))
            return s.getsockname()[1]
    
    def start_server(self):
        """Start the Flask server in a separate thread"""
        try:
            app.run(host='127.0.0.1', port=self.port, debug=False, use_reloader=False)
        except Exception as e:
            print(f"Server error: {e}")
    
    def open_browser(self):
        """Open the application in the default browser"""
        url = f"http://127.0.0.1:{self.port}"
        time.sleep(2)  # Wait for server to start
        webbrowser.open(url)
    
    def show_console_message(self):
        """Show console startup message"""
        print("=" * 50)
        print("Hebrew Flipbook Generator")
        print("מחולל ספרים דיגיטליים")
        print("=" * 50)
        print(f"Server starting on: http://127.0.0.1:{self.port}")
        print("השרת מתחיל על הכתובת הנ\"ל")
        print("=" * 50)
    
    def run(self):
        """Run the application"""
        try:
            self.show_console_message()
            
            # Start server in background
            self.server_thread = threading.Thread(target=self.start_server, daemon=True)
            self.server_thread.start()
            
            # Wait for server to start
            time.sleep(3)
            
            # Open browser
            self.open_browser()
            
            print("Browser opened. Press Ctrl+C to stop the server.")
            print("הדפדפן נפתח. לחץ Ctrl+C לעצירת השרת.")
            
            # Keep the main thread alive
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nShutting down...")
                print("נסגר...")
                sys.exit(0)
                
        except Exception as e:
            print(f"Error starting application: {str(e)}")
            print(f"שגיאה בהפעלת האפליקציה: {str(e)}")
            input("Press Enter to exit...")
            sys.exit(1)

def main():
    """Main entry point"""
    launcher = FlipbookLauncher()
    launcher.run()

if __name__ == "__main__":
    main()