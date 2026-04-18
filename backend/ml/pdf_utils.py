import fitz
from PIL import Image
import io

def convert_pdf_to_image(pdf_path:str)-> Image.Image:
    """Convert first page of pdf to PIL image"""
    doc=fitz.open(pdf_path)
    image_paths=[]

    for page_num in range(len(doc)):
        page=doc[page_num]
        mat=fitz.Matrix(2.0,2.0)
        pix=page.get_pixmap(matrix=mat)

        img_bytes=pix.tobytes("png")
        image= Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        page_filename=f"{os.path.splitext(os.path.basename(pdf_path))[0]}_page{page_num+1}.png"
        page_path=os.path.join(output_dir, page_filename)
        image.save(page_path)
        image_paths.append(page_path)

    doc.close()
    return image_path