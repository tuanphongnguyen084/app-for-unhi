from flask import Flask, render_template, jsonify
import json
import random
import os

app = Flask(__name__)

# Load all JSON files
BASE_PATH = "/Users/nguyentuanphong/Downloads/app for unhi"
json_files = ['1.json', '11.json', '22.json', '33.json', '44.json', '55.json']

all_questions = []

for json_file in json_files:
    json_path = os.path.join(BASE_PATH, json_file)
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_questions.extend(data['questions'])
    except:
        pass

print(f"Loaded {len(all_questions)} total questions")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    # Get 50 random questions
    if len(all_questions) < 50:
        selected = all_questions
    else:
        selected = random.sample(all_questions, 50)
    
    return jsonify({
        'questions': selected,
        'total': len(selected)
    })

@app.route('/api/check-answer', methods=['POST'])
def check_answer():
    # This endpoint can be used to verify answers
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=8000, host='127.0.0.1')
