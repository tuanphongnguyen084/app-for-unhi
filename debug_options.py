from docx import Document
import re

doc = Document('HRM.docx')

# Đo các option ở Bài 1 Đề 1
lesson_num = 0
exam_num = 0
question_num = 0
in_target = False

for para in doc.paragraphs:
    text = para.text.strip()
    
    # Tìm Bài 1
    if re.match(r'Bài\s+1[:\s]', text):
        in_target = True
        lesson_num += 1
        continue
    
    if in_target and lesson_num == 1:
        # Tìm Đề 1
        if re.match(r'Đề\s+1[:\s]', text):
            exam_num += 1
            if exam_num == 1:
                question_num = 0
        
        # Check câu hỏi
        if re.match(r'Câu\s+\d+', text):
            question_num += 1
            if question_num <= 2:  # Lấy 2 câu đầu
                print(f"\n=== QUESTION: {text[:50]}...")
        
        # Check option nếu trong 2 câu đầu
        if question_num <= 2 and re.match(r'^[A-D]\.\s*', text):
            letter = text[0]
            option_text = text[3:80]  # First 80 chars
            print(f"\n  {letter}. {option_text}")
            
            # In chi tiết runs
            for i, run in enumerate(para.runs):
                if run.text.strip():
                    print(f"    run[{i}] bold={run.bold} text='{run.text[:40]}...'")
    
    if lesson_num > 1:
        break
