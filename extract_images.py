import fitz # PyMuPDF
import io
import os

pdf_files = ["SOAL TKA Bahasa Indonesia SD 2026 (1).pdf", "SOAL TKA Matematika SD 2026 (1).pdf"]

os.makedirs("gambar_soal_pdf", exist_ok=True)

for pdf_file in pdf_files:
    if not os.path.exists(pdf_file):
        continue
        
    doc = fitz.open(pdf_file)
    pdf_name = pdf_file.replace("SOAL TKA ", "").replace(" SD 2026 (1).pdf", "")
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        image_list = page.get_images(full=True)
        
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Avoid extracting tiny images like icons or tiny logos
            if len(image_bytes) < 5000:
                continue
                
            image_filename = f"gambar_soal_pdf/{pdf_name}_hal_{page_num+1}_gbr_{image_index}.{image_ext}"
            with open(image_filename, "wb") as f:
                f.write(image_bytes)
                
print("Selesai mengekstrak gambar.")
