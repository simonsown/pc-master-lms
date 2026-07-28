# -*- coding: utf-8 -*-
import os
import sys
import fitz  # PyMuPDF

sys.stdout.reconfigure(encoding='utf-8')

PUBLIC_SLIDES_DIR = os.path.join(
    os.path.expanduser("~"), "Downloads", "khu ph\u1ed1",
    "pc-master-lms-latest", "public", "slides"
)

pdf_files = [
    ("839799900-Slide-1.pdf", "slide-1"),
    ("chuong1-gioi-thieu-ve-phan-cung-cua-may-PC.pdf", "chuong1-hardware"),
    ("Giao-Trinh-IC3-Phan-Cung-May-Tinh.pdf", "ic3-hardware")
]

for filename, output_dir_name in pdf_files:
    pdf_path = os.path.join(PUBLIC_SLIDES_DIR, filename)
    if not os.path.exists(pdf_path):
        print(f"Not found: {pdf_path}")
        continue

    out_dir = os.path.join(PUBLIC_SLIDES_DIR, output_dir_name)
    os.makedirs(out_dir, exist_ok=True)

    print(f"Converting {filename}...")
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=150)
        out_path = os.path.join(out_dir, f"{page_num + 1}.png")
        pix.save(out_path)
    print(f"Done: {len(doc)} pages -> {out_dir}")

print("All done!")
