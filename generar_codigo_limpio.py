import os
import re
import html

def remove_js_comments(text):
    # Remove block comments /* ... */
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    # Remove line comments // ... but avoid matching URLs (http:// or https://)
    text = re.sub(r'(?<!:)//.*', '', text)
    return text

def remove_html_comments(text):
    # Remove HTML comments <!-- ... -->
    return re.sub(r'<!--[\s\S]*?-->', '', text)

def process_file(filepath, ext):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if ext in ['.js', '.css']:
            content = remove_js_comments(content)
        elif ext == '.html':
            content = remove_html_comments(content)
            
        # Remover líneas vacías
        lines = [line.rstrip() for line in content.split('\n') if line.strip()]
        return '\n'.join(lines)
    except Exception as e:
        return f"Error leyendo {filepath}: {str(e)}"

# Carpeta principal
base_dir = r"c:\Users\sandy\OneDrive - uv.cl\Aplicaciones\proyecto_ERP - respaldo"

files_to_process = [
    ('index.html', '.html'),
    ('diagrama-contable.html', '.html'),
]

# Cargar todos los archivos CSS
css_dir = os.path.join(base_dir, 'css')
if os.path.exists(css_dir):
    for root, dirs, files in os.walk(css_dir):
        for file in files:
            if file.endswith('.css'):
                files_to_process.append((os.path.relpath(os.path.join(root, file), base_dir), '.css'))

# Cargar todos los archivos JS
js_dir = os.path.join(base_dir, 'js')
if os.path.exists(js_dir):
    for root, dirs, files in os.walk(js_dir):
        for file in files:
            if file.endswith('.js'):
                files_to_process.append((os.path.relpath(os.path.join(root, file), base_dir), '.js'))

html_output = [
    "<!DOCTYPE html>",
    "<html lang='es'>",
    "<head>",
    "<meta charset='UTF-8'>",
    "<title>Código Fuente - ERP Sandy Iturra</title>",
    "<style>",
    "body { font-family: 'Courier New', Courier, monospace; font-size: 11px; padding: 20px; color: #333; }",
    "h1 { text-align: center; font-family: Arial, sans-serif; margin-bottom: 30px; }",
    "h2 { font-family: Arial, sans-serif; background-color: #e0e0e0; padding: 8px; margin-top: 30px; font-size: 14px; border-left: 4px solid #333; page-break-after: avoid; }",
    ".file-content { background-color: #f7f7f7; padding: 15px; border: 1px solid #ccc; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }",
    "@media print {",
    "    body { padding: 0; }",
    "    h2 { page-break-after: avoid; background-color: #ddd !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
    "    .file-content { border: 1px solid #999; }",
    "}",
    "</style>",
    "</head>",
    "<body>",
    "<h1>CÓDIGO FUENTE - PROYECTO ERP<br><small>Autora: Sandy Iturra Mena</small></h1>"
]

for filepath, ext in files_to_process:
    full_path = os.path.join(base_dir, filepath)
    if os.path.exists(full_path):
        clean_code = process_file(full_path, ext)
        # Reemplazar tabulaciones por espacios para mejor renderizado
        clean_code = clean_code.replace('\t', '    ')
        html_output.append(f"<h2>Archivo: {filepath}</h2>")
        html_output.append(f"<div class='file-content'>{html.escape(clean_code)}</div>")

html_output.append("</body></html>")

output_file = os.path.join(base_dir, 'Codigo_Fuente_ERP_Sandy_Iturra.html')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_output))
    
print(f"Éxito. Archivo generado en: {output_file}")
