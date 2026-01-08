from docx import Document
import json
import re

doc = Document('Test bank HRM.docx')

lessons = {}
current_lesson = None
current_exam = None

# Process each paragraph
for para_idx, para in enumerate(doc.paragraphs):
    text = para.text.strip()
    
    # Detect BÀI
    if text.startswith('BÀI ') and ':' in text:
        match = re.match(r'BÀI\s+(\d+):\s*(.*)', text)
        if match:
            lesson_id = match.group(1)
            lesson_title = match.group(2)
            current_lesson = {
                'id': lesson_id,
                'title': lesson_title,
                'exams': {}
            }
            lessons[lesson_id] = current_lesson
    
    # Detect ĐỀ
    elif text.startswith('ĐỀ ') and current_lesson:
        match = re.match(r'ĐỀ\s+(\d+)', text)
        if match:
            exam_id = match.group(1)
            current_exam = {
                'id': exam_id,
                'questions': []
            }
            current_lesson['exams'][exam_id] = current_exam
    
    # Detect Câu hỏi
    elif text.startswith('Câu ') and current_exam:
        question_id = None
        question_text = ""
        options = {}
        correct_answer = None
        
        # Extract question number
        match = re.match(r'Câu\s+(\d+)\.\s*', text)
        if match:
            question_id = match.group(1)
            
            # Reconstruct full text from runs
            full_text = ""
            correct_answer_from_run = None
            
            for run_idx, run in enumerate(para.runs):
                run_text = run.text
                full_text += run_text
                
                # Find bold runs that contain answer options
                if run.bold:
                    # Pattern: "A" or "A." or "A " (flexible matching)
                    bold_match = re.match(r'\s*([A-D])[\s.]*', run_text)
                    if bold_match:
                        answer_letter = bold_match.group(1)
                        # Capture the first bold letter-option combo we find
                        if not correct_answer_from_run:  # Only set once
                            correct_answer_from_run = answer_letter
            
            # Parse question text
            lines = full_text.split('\n')
            if lines:
                # Extract question text (first line minus "Câu X.")
                first_line = lines[0]
                question_text = re.sub(r'^Câu\s+\d+\.\s*', '', first_line).strip()
                
                # Extract all options from all lines
                for line in lines:
                    line_stripped = line.strip()
                    if line_stripped and len(line_stripped) > 0 and line_stripped[0] in 'ABCD':
                        # Try to match "A. Text", "A Text", or "A Text" (flexible)
                        opt_match = re.match(r'([A-D])[\s.]*(.*)$', line_stripped)
                        if opt_match:
                            opt_letter = opt_match.group(1)
                            opt_text = opt_match.group(2).strip() if opt_match.group(2) else ""
                            # Remove bold formatting markers
                            opt_text = opt_text.strip()
                            if opt_text:
                                options[opt_letter] = opt_text
            
            # Use bold answer if found
            if correct_answer_from_run:
                correct_answer = correct_answer_from_run
            
            # Only add if we have proper data
            if question_id and question_text and len(options) >= 3:
                question = {
                    'id': question_id,
                    'text': question_text,
                    'options': options
                }
                if correct_answer:
                    question['correct_answer'] = correct_answer
                
                current_exam['questions'].append(question)

# Save to JSON
with open('hrm_data.json', 'w', encoding='utf-8') as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

# Print statistics
print("=== EXTRACTION COMPLETE ===\n")
total_questions = 0
correct_marked = 0

for lesson_id in sorted(lessons.keys(), key=lambda x: int(x)):
    lesson = lessons[lesson_id]
    print(f"📖 Bài {lesson_id}: {lesson['title']}")
    for exam_id in sorted(lesson['exams'].keys(), key=lambda x: int(x)):
        exam = lesson['exams'][exam_id]
        num_questions = len(exam['questions'])
        total_questions += num_questions
        
        if num_questions > 0:
            marked = sum(1 for q in exam['questions'] if 'correct_answer' in q)
            correct_marked += marked
            pct = round(marked/num_questions*100) if num_questions > 0 else 0
            print(f"   Đề {exam_id}: {num_questions:2d} câu ({marked:2d} có đáp án - {pct}%)")

print(f"\n✓ Tổng cộng: {total_questions} câu hỏi")
print(f"✓ Đáp án được trích: {correct_marked}/{total_questions} ({round(correct_marked/total_questions*100)}%)")
print(f"✓ File saved: hrm_data.json")
