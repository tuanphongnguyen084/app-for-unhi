from docx import Document
import json
import re

doc = Document('HRM.docx')

lessons = {}
current_lesson = None
current_exam = None
current_question = None  # For multi-paragraph questions

# Process each paragraph
for para_idx, para in enumerate(doc.paragraphs):
    text = para.text.strip()
    
    if not text:
        continue
    
    # Detect BÀI
    if para.style.name == 'Heading 2' and 'BÀI' in text:
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
            current_exam = None
            current_question = None
            print(f"✓ Bài {lesson_id}: {lesson_title}")
    
    # Detect ĐỀ
    elif para.style.name == 'Heading 2' and 'ĐỀ' in text:
        match = re.match(r'ĐỀ\s+(\d+)', text)
        if match:
            exam_id = match.group(1)
            
            if not current_lesson:
                current_lesson = {
                    'id': '1',
                    'title': 'Tổng quan',
                    'exams': {}
                }
                lessons['1'] = current_lesson
            
            current_exam = {
                'id': exam_id,
                'questions': []
            }
            current_lesson['exams'][exam_id] = current_exam
            current_question = None
            print(f"  → Đề {exam_id}")
    
    # Detect Câu hỏi
    elif current_exam and re.match(r'Câu\s+\d+', text):
        match = re.match(r'Câu\s+(\d+)[:.：]\s*(.*)', text)
        if match:
            question_id = match.group(1)
            question_text = match.group(2)
            
            # Parse options from the same paragraph text
            options = {}
            correct_answer = None
            
            for line in text.split('\n'):
                line = line.strip()
                if line and line[0] in 'ABCD' and len(line) > 2 and line[1] == '.':
                    letter = line[0]
                    option_text = line[3:].strip()
                    if option_text:
                        options[letter] = option_text
            
            # Check which option is bold
            run_pos = 0
            run_ranges = []
            
            for run in para.runs:
                run_len = len(run.text)
                run_ranges.append((run_pos, run_pos + run_len, run))
                run_pos += run_len
            
            for letter in ['A', 'B', 'C', 'D']:
                if letter in options:
                    option_start = text.find(f'{letter}.')
                    if option_start != -1:
                        for run_start, run_end, run in run_ranges:
                            if run_start <= option_start < run_end and run.bold:
                                correct_answer = letter
                                break
            
            current_question = {
                'id': question_id,
                'text': question_text,
                'options': options,
                'correct_answer': correct_answer
            }
            current_exam['questions'].append(current_question)
    
    # Detect standalone options (option text in separate paragraph)
    elif current_question and re.match(r'^[A-D]\.\s*', text):
        letter = text[0]
        option_text = text[3:].strip()
        
        # Check if option is bold
        is_bold = False
        for run in para.runs:
            if run.bold and run.text.strip():
                is_bold = True
                break
        
        current_question['options'][letter] = option_text
        if is_bold:
            current_question['correct_answer'] = letter

# Save to JSON
with open('hrm_data.json', 'w', encoding='utf-8') as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

# Print statistics
print("\n" + "=" * 50)
print("Kết quả trích xuất:")
print("=" * 50)

total_questions = 0
total_answered = 0

for lesson_id in sorted(lessons.keys(), key=lambda x: int(x)):
    lesson = lessons[lesson_id]
    lesson_questions = 0
    lesson_answered = 0
    
    print(f"\nBài {lesson_id}: {lesson['title']}")
    
    for exam_id in sorted(lesson['exams'].keys(), key=lambda x: int(x)):
        exam = lesson['exams'][exam_id]
        num_q = len(exam['questions'])
        num_ans = sum(1 for q in exam['questions'] if q.get('correct_answer'))
        
        lesson_questions += num_q
        lesson_answered += num_ans
        
        status = "✓" if num_q > 0 else "✗"
        print(f"  Đề {exam_id}: {num_q} câu ({num_ans} có đáp án) {status}")
    
    total_questions += lesson_questions
    total_answered += lesson_answered

print("\n" + "=" * 50)
print(f"✓ Tổng cộng: {total_questions} câu hỏi")
print(f"✓ Đáp án được trích: {total_answered}/{total_questions} ({100*total_answered//total_questions}%)")
print("=" * 50)
