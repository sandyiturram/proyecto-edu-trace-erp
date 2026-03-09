import os
import asyncio
from playwright.async_api import async_playwright

async def generate_pdf():
    base_dir = r"c:\Users\sandy\OneDrive - uv.cl\Aplicaciones\proyecto_ERP - respaldo"
    html_path = os.path.join(base_dir, "Codigo_Fuente_ERP_Sandy_Iturra.html")
    pdf_path = os.path.join(base_dir, "Codigo_Fuente_ERP_Sandy_Iturra.pdf")
    
    html_uri = f"file:///{html_path.replace(chr(92), '/')}"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(html_uri)
        # Generar pdf usando print CSS media
        await page.pdf(
            path=pdf_path,
            format="A4",
            margin={"top": "20mm", "bottom": "20mm", "left": "20mm", "right": "20mm"},
            print_background=True
        )
        await browser.close()
        print(f"Éxito: PDF guardado en {pdf_path}")

if __name__ == "__main__":
    asyncio.run(generate_pdf())
