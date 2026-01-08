// State Management
let quizState = {
    mode: null, // 'lesson' or 'random'
    currentLesson: null,
    currentExam: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {}, // { questionIndex: selectedOption }
    skipped: new Set(),
    startTime: null,
    endTime: null,
    timerInterval: null,
    timeLimit: 60, // minutes
    incorrectIndices: [], // Lưu chỉ số câu sai
    lastResults: null // Lưu kết quả lần trước
};

let allData = {};
let examResults = {}; // Lưu kết quả các đề đã làm: {lessonId-examId: {correct, total, wrongIndices: []}}

// Load data on page load
async function loadData() {
    try {
        const response = await fetch('hrm_data.json');
        allData = await response.json();
        console.log('Data loaded:', Object.keys(allData).length, 'lessons');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Screen Navigation
function showScreen(screenId) {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('lessonScreen').style.display = 'none';
    document.getElementById('examScreen').style.display = 'none';
    document.getElementById('randomModeScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';
    window.scrollTo(0, 0);
}

function selectMode(mode) {
    quizState.mode = mode;
    if (mode === 'lesson') {
        showLessonSelection();
    } else {
        showRandomModeSetup();
    }
}

function showLessonSelection() {
    showScreen('lessonScreen');
    const grid = document.getElementById('lessonGrid');
    grid.innerHTML = '';

    Object.keys(allData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(lessonId => {
        const lesson = allData[lessonId];
        const hasExams = Object.values(lesson.exams).some(exam => exam.questions.length > 0);
        if (hasExams) {
            const card = document.createElement('div');
            card.className = 'lesson-card';
            card.onclick = () => selectLesson(lessonId);
            const examCount = Object.values(lesson.exams).filter(e => e.questions.length > 0).length;
            card.innerHTML = `
                <div class="lesson-number">Bài ${lessonId}</div>
                <div class="lesson-title">${lesson.title}</div>
                <div class="exam-count">${examCount} đề</div>
            `;
            grid.appendChild(card);
        }
    });
}

function selectLesson(lessonId) {
    quizState.currentLesson = lessonId;
    showExamSelection(lessonId);
}

function showExamSelection(lessonId) {
    showScreen('examScreen');
    const lesson = allData[lessonId];
    document.getElementById('examScreenTitle').textContent = `Bài ${lessonId}: ${lesson.title}`;
    
    const grid = document.getElementById('examGrid');
    grid.innerHTML = '';

    Object.keys(lesson.exams).sort((a, b) => parseInt(a) - parseInt(b)).forEach(examId => {
        const exam = lesson.exams[examId];
        if (exam.questions.length > 0) {
            const resultKey = `${lessonId}-${examId}`;
            const result = examResults[resultKey];
            
            const card = document.createElement('div');
            card.className = 'exam-card';
            
            // Nếu đã làm, click để hiện menu; nếu chưa, click để bắt đầu
            if (result) {
                card.onclick = () => showExamOptions(lessonId, examId, result);
            } else {
                card.onclick = () => startLesson(lessonId, examId);
            }
            
            let statusText = `${exam.questions.length} câu hỏi<br>60 phút`;
            let badge = '';
            if (result) {
                const percentage = Math.round((result.correct / result.total) * 100);
                statusText = `${percentage === 100 ? '✓' : '✗'} ${result.correct}/${result.total}<br>${percentage}%`;
                badge = percentage === 100 ? ' ✓' : ' ✗';
            }
            
            card.innerHTML = `
                <div class="exam-number">Đề ${examId}${badge}</div>
                <div class="exam-info">${statusText}</div>
            `;
            grid.appendChild(card);
        }
    });
}

function showRandomModeSetup() {
    showScreen('randomModeScreen');
    
    // Calculate total questions
    let totalQuestions = 0;
    Object.keys(allData).forEach(lessonId => {
        const lesson = allData[lessonId];
        Object.keys(lesson.exams).forEach(examId => {
            const exam = lesson.exams[examId];
            totalQuestions += exam.questions.length;
        });
    });
    
    // Calculate exam options: each exam = 40 questions = 60 minutes
    const questionsPerExam = 40;
    const numExams = Math.ceil(totalQuestions / questionsPerExam);
    
    const optionsContainer = document.getElementById('randomQuizOptions');
    optionsContainer.innerHTML = '';
    
    for (let i = 1; i <= numExams; i++) {
        let numQuestions = questionsPerExam;
        
        // For last exam, if remaining < 40, pad with random questions to make it 40
        if (i === numExams) {
            const remaining = totalQuestions % questionsPerExam;
            numQuestions = remaining === 0 ? questionsPerExam : questionsPerExam; // Always 40
        }
        
        const resultKey = `random-${i}`;
        const result = examResults[resultKey];
        
        const timeMinutes = 60;
        
        const card = document.createElement('div');
        card.className = 'exam-card';
        
        // Nếu đã làm, click để hiện menu; nếu chưa, click để bắt đầu
        if (result) {
            card.onclick = () => showRandomExamOptions(i, result);
        } else {
            card.onclick = () => startRandomQuiz(numQuestions, i);
        }
        
        let statusText = `${numQuestions} câu hỏi<br>${timeMinutes} phút`;
        let badge = '';
        if (result) {
            const percentage = Math.round((result.correct / result.total) * 100);
            statusText = `${percentage === 100 ? '✓' : '✗'} ${result.correct}/${result.total}<br>${percentage}%`;
            badge = percentage === 100 ? ' ✓' : ' ✗';
        }
        
        card.innerHTML = `
            <div class="exam-number">Đề ${i}${badge}</div>
            <div class="exam-info">${statusText}</div>
        `;
        optionsContainer.appendChild(card);
    }
}

function startLesson(lessonId, examId) {
    quizState.currentLesson = lessonId;
    quizState.currentExam = examId;
    const exam = allData[lessonId].exams[examId];
    quizState.questions = exam.questions.map((q, idx) => ({...q, questionIndex: idx}));
    startQuiz(`Bài ${lessonId}: ${allData[lessonId].title} - Đề ${examId}`, 60);
}

function showExamOptions(lessonId, examId, result) {
    // Hiện popup menu với 3 option
    const choice = prompt(`Đề ${examId} - Kết quả: ${result.correct}/${result.total}\n\n1. Làm lại đề\n2. Ôn tập câu sai\n3. Đóng\n\nChọn (1/2/3):`);
    
    if (choice === '1') {
        // Làm lại full
        startLesson(lessonId, examId);
    } else if (choice === '2') {
        // Ôn tập câu sai
        if (result.wrongIndices && result.wrongIndices.length > 0) {
            quizState.currentLesson = lessonId;
            quizState.currentExam = examId;
            const exam = allData[lessonId].exams[examId];
            
            // Chỉ lấy câu sai
            const wrongQuestions = result.wrongIndices.map(idx => exam.questions[idx]);
            quizState.questions = wrongQuestions;
            quizState.currentQuestionIndex = 0;
            quizState.answers = {};
            quizState.skipped = new Set();
            quizState.startTime = Date.now();
            quizState.endTime = null;
            
            const timeMinutes = Math.ceil((wrongQuestions.length / 40) * 60) || 60;
            startQuiz(`Ôn Tập Câu Sai - Bài ${lessonId} Đề ${examId} (${wrongQuestions.length} Câu)`, timeMinutes);
        } else {
            alert('Không có câu sai để ôn tập!');
        }
    }
    // Nếu chọn 3 hoặc cancel, không làm gì
}

function showRandomExamOptions(examNum, result) {
    // Hiện popup menu với 3 option cho random quiz
    const choice = prompt(`Đề ${examNum} - Kết quả: ${result.correct}/${result.total}\n\n1. Làm lại đề\n2. Ôn tập câu sai\n3. Đóng\n\nChọn (1/2/3):`);
    
    if (choice === '1') {
        // Làm lại full
        const totalQuestions = 40; // Always 40 for random quiz
        startRandomQuiz(totalQuestions, examNum);
    } else if (choice === '2') {
        // Ôn tập câu sai - dùng dữ liệu đã lưu
        if (result.wrongQuestions && result.wrongQuestions.length > 0) {
            quizState.questions = result.wrongQuestions;
            quizState.currentQuestionIndex = 0;
            quizState.answers = {};
            quizState.skipped = new Set();
            quizState.startTime = Date.now();
            quizState.endTime = null;
            quizState.currentLesson = null;
            quizState.currentExam = examNum;  // Lưu exam number để retryIncorrect() biết context
            
            const timeMinutes = Math.ceil((result.wrongQuestions.length / 40) * 60) || 60;
            startQuiz(`Ôn Tập Câu Sai - Đề ${examNum} (${result.wrongQuestions.length} Câu)`, timeMinutes);
        } else {
            alert('Không có câu sai để ôn tập!');
        }
    }
    // Nếu chọn 3 hoặc cancel, không làm gì
}

function startRandomQuiz(numQuestions, examNum) {
    // Collect all questions from all exams
    let allQuestions = [];
    Object.keys(allData).forEach(lessonId => {
        const lesson = allData[lessonId];
        Object.keys(lesson.exams).forEach(examId => {
            const exam = lesson.exams[examId];
            exam.questions.forEach((q, idx) => {
                allQuestions.push({
                    ...q,
                    lessonId,
                    examId,
                    questionIndex: idx
                });
            });
        });
    });

    // Shuffle all questions
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);
    
    // Always get 40 questions - if less than 40, pad with random selection
    const totalQuestionsNeeded = 40;
    let selectedQuestions = allQuestions.slice(0, totalQuestionsNeeded);
    
    // If we need more questions to reach 40, add random duplicates
    if (selectedQuestions.length < totalQuestionsNeeded) {
        const needed = totalQuestionsNeeded - selectedQuestions.length;
        for (let i = 0; i < needed; i++) {
            const randomQ = allQuestions[Math.floor(Math.random() * allQuestions.length)];
            selectedQuestions.push({...randomQ}); // Copy to avoid reference issues
        }
    }
    
    quizState.questions = selectedQuestions;
    quizState.currentLesson = null; // Mark as random mode
    quizState.currentExam = examNum; // Store exam number
    
    // Each exam = 60 minutes
    const timeMinutes = 60;
    startQuiz(`Ôn Tập Tổng Hợp - Đề ${examNum} (40 Câu)`, timeMinutes);
}

function startQuiz(title, timeMinutes = 60) {
    quizState.currentQuestionIndex = 0;
    quizState.answers = {};
    quizState.skipped = new Set();
    quizState.startTime = Date.now();
    quizState.timeLimit = timeMinutes;
    
    document.getElementById('quizTitle').textContent = title;
    document.getElementById('totalQuestions').textContent = quizState.questions.length;
    
    showScreen('quizScreen');
    displayQuestion();
    
    // Start timer
    if (quizState.timerInterval) clearInterval(quizState.timerInterval);
    let remainingSeconds = timeMinutes * 60;
    
    quizState.timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimer(remainingSeconds);
        
        if (remainingSeconds <= 0) {
            clearInterval(quizState.timerInterval);
            finishQuiz();
        }
    }, 1000);
    
    updateTimer(remainingSeconds);
}

function updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    if (seconds <= 60) {
        timerEl.classList.add('warning');
    } else {
        timerEl.classList.remove('warning');
    }
}

function displayQuestion() {
    const question = quizState.questions[quizState.currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = quizState.currentQuestionIndex + 1;
    document.getElementById('questionNumber').textContent = (quizState.currentQuestionIndex + 1) + '.';
    document.getElementById('questionText').textContent = question.text;
    
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    ['A', 'B', 'C', 'D'].forEach(letter => {
        if (question.options[letter]) {
            const option = document.createElement('div');
            option.className = 'option';
            option.textContent = `${letter}. ${question.options[letter]}`;
            
            if (quizState.answers[quizState.currentQuestionIndex] === letter) {
                option.classList.add('selected');
            }
            
            option.onclick = () => selectOption(letter);
            container.appendChild(option);
        }
    });
    
    // Update button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = quizState.currentQuestionIndex === 0;
    
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        nextBtn.textContent = 'Nộp Bài ✓';
        nextBtn.disabled = false;
        nextBtn.onclick = () => finishQuiz();
    } else {
        nextBtn.textContent = 'Tiếp →';
        nextBtn.disabled = false;
        nextBtn.onclick = () => nextQuestion();
    }
}

function selectOption(letter) {
    quizState.answers[quizState.currentQuestionIndex] = letter;
    quizState.skipped.delete(quizState.currentQuestionIndex);
    displayQuestion();
}

function previousQuestion() {
    if (quizState.currentQuestionIndex > 0) {
        quizState.currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        displayQuestion();
    }
}

function skipQuestion() {
    quizState.skipped.add(quizState.currentQuestionIndex);
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        displayQuestion();
    }
}

function goBack() {
    if (quizState.mode === 'lesson') {
        showLessonSelection();
    } else {
        showRandomModeSetup();
    }
}

function goBackToSelection() {
    // Quay về lại screen chọn đề/chế độ (không về trang chủ)
    clearInterval(quizState.timerInterval);
    
    // Reset answers
    quizState.currentQuestionIndex = 0;
    quizState.answers = {};
    quizState.skipped = new Set();
    
    if (quizState.mode === 'lesson') {
        showExamSelection(quizState.currentLesson);
    } else {
        showRandomModeSetup();
    }
}

function goHome() {
    clearInterval(quizState.timerInterval);
    quizState = {
        mode: null,
        currentLesson: null,
        currentExam: null,
        questions: [],
        currentQuestionIndex: 0,
        answers: {},
        skipped: new Set(),
        startTime: null,
        endTime: null,
        timerInterval: null,
        timeLimit: 60,
        incorrectIndices: [],
        lastResults: null
    };
    showScreen('homeScreen');
}

function finishQuiz() {
    clearInterval(quizState.timerInterval);
    quizState.endTime = Date.now();
    showResults();
}

function showResults() {
    // Calculate results using correct answers from JSON
    let correct = 0;
    let incorrect = 0;
    quizState.incorrectIndices = []; // Reset incorrect indices
    
    quizState.questions.forEach((question, index) => {
        const userAnswer = quizState.answers[index];
        const hasCorrectAnswer = 'correct_answer' in question;
        const correctAnswer = question.correct_answer;
        
        if (userAnswer) {
            if (hasCorrectAnswer && userAnswer === correctAnswer) {
                correct++;
            } else if (!hasCorrectAnswer) {
                // If no correct answer marked, count as correct (user answered)
                correct++;
            } else {
                incorrect++;
                quizState.incorrectIndices.push(index); // Lưu chỉ số câu sai
            }
        } else {
            // Unanswered
            incorrect++;
            quizState.incorrectIndices.push(index);
        }
    });
    
    // Lưu kết quả nếu là chế độ "Ôn Tập Từng Bài"
    if (quizState.currentLesson && quizState.currentExam) {
        const resultKey = `${quizState.currentLesson}-${quizState.currentExam}`;
        examResults[resultKey] = {
            correct: correct,
            total: quizState.questions.length,
            wrongIndices: quizState.incorrectIndices
        };
    } else if (!quizState.currentLesson && quizState.currentExam) {
        // Lưu kết quả cho "Ôn Tập Tổng Hợp" (random mode)
        // Lưu luôn questions data để có thể làm lại câu sai
        const resultKey = `random-${quizState.currentExam}`;
        const wrongQuestions = quizState.incorrectIndices.map(idx => quizState.questions[idx]);
        examResults[resultKey] = {
            correct: correct,
            total: quizState.questions.length,
            wrongIndices: quizState.incorrectIndices,
            wrongQuestions: wrongQuestions  // Lưu full question data
        };
    }
    
    const skipped = quizState.skipped.size;
    const totalTime = Math.floor((quizState.endTime - quizState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    const percentage = quizState.questions.length > 0 
        ? Math.round((correct / quizState.questions.length) * 100)
        : 0;
    
    document.getElementById('finalScore').textContent = correct;
    document.getElementById('totalScore').textContent = quizState.questions.length;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('skippedCount').textContent = skipped;
    document.getElementById('totalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('percentage').textContent = percentage;
    
    let message = '';
    if (percentage === 100) {
        message = 'Giỏi quá kkk!';
    } else if (percentage >= 80) {
        message = '🎉 Xuất sắc!';
    } else if (percentage >= 60) {
        message = '👍 Tốt!';
    } else if (percentage >= 50) {
        message = '📚 Bình thường, tiếp tục ôn tập!';
    } else {
        message = 'Gà quá làm lại đi!';
    }
    document.getElementById('resultMessage').textContent = message;
    
    // Render buttons based on percentage
    const resultButtons = document.getElementById('resultButtons');
    resultButtons.innerHTML = '';
    
    if (percentage === 100) {
        // Nếu 100%, chỉ có nút Quay về (về lại screen chọn đề)
        resultButtons.innerHTML = `<button class="btn-home" onclick="goBackToSelection()">Quay Về</button>`;
    } else {
        // Nếu chưa 100%, có 3 option
        resultButtons.innerHTML = `
            <button class="btn-home" style="background: #ff69b4; flex: 1;" onclick="retryFullQuiz()">Làm Lại Full</button>
            <button class="btn-home" style="background: #ffa502; flex: 1;" onclick="retryIncorrect()">Làm Lại Câu Sai</button>
            <button class="btn-home" style="background: #999; flex: 1;" onclick="goBackToSelection()">Quay Về</button>
        `;
    }
    
    showScreen('resultsScreen');
}

function retryFullQuiz() {
    // Reset answers và bắt đầu lại từ câu 1
    quizState.currentQuestionIndex = 0;
    quizState.answers = {};
    quizState.skipped = new Set();
    quizState.startTime = Date.now();
    quizState.endTime = null;
    
    document.getElementById('quizTitle').textContent = document.getElementById('quizTitle').textContent.replace('(kết quả)', '').trim();
    document.getElementById('totalQuestions').textContent = quizState.questions.length;
    
    showScreen('quizScreen');
    displayQuestion();
    
    // Start timer
    if (quizState.timerInterval) clearInterval(quizState.timerInterval);
    let remainingSeconds = quizState.timeLimit * 60;
    
    quizState.timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimer(remainingSeconds);
        
        if (remainingSeconds <= 0) {
            clearInterval(quizState.timerInterval);
            finishQuiz();
        }
    }, 1000);
    
    updateTimer(remainingSeconds);
}

function retryIncorrect() {
    // Xử lý cho cả lesson mode và random mode
    let incorrectQuestions = [];
    
    if (quizState.currentLesson && quizState.currentExam) {
        // Lesson mode: lấy câu sai từ currentLesson's exam
        const resultKey = `${quizState.currentLesson}-${quizState.currentExam}`;
        const result = examResults[resultKey];
        if (result && result.wrongIndices) {
            const exam = allData[quizState.currentLesson].exams[quizState.currentExam];
            incorrectQuestions = result.wrongIndices.map(idx => exam.questions[idx]);
        }
    } else if (!quizState.currentLesson && quizState.currentExam) {
        // Random mode: lấy từ wrongQuestions đã lưu
        const resultKey = `random-${quizState.currentExam}`;
        const result = examResults[resultKey];
        if (result && result.wrongQuestions) {
            incorrectQuestions = result.wrongQuestions;
        } else {
            // Fallback: lấy từ quizState (nếu vừa làm xong)
            incorrectQuestions = quizState.incorrectIndices.map(idx => quizState.questions[idx]);
        }
    }
    
    if (incorrectQuestions.length === 0) {
        alert('Không có câu sai để ôn tập!');
        return;
    }
    
    quizState.questions = incorrectQuestions;
    quizState.currentQuestionIndex = 0;
    quizState.answers = {};
    quizState.skipped = new Set();
    quizState.startTime = Date.now();
    quizState.endTime = null;
    
    document.getElementById('quizTitle').textContent = `Làm Lại Câu Sai - ${incorrectQuestions.length} Câu`;
    document.getElementById('totalQuestions').textContent = incorrectQuestions.length;
    
    showScreen('quizScreen');
    displayQuestion();
    
    // Start timer (30 phút cho mỗi 20 câu)
    if (quizState.timerInterval) clearInterval(quizState.timerInterval);
    const timeMinutes = Math.ceil((incorrectQuestions.length / 40) * 60);
    let remainingSeconds = timeMinutes * 60;
    
    quizState.timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimer(remainingSeconds);
        
        if (remainingSeconds <= 0) {
            clearInterval(quizState.timerInterval);
            finishQuiz();
        }
    }, 1000);
    
    updateTimer(remainingSeconds);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    showScreen('homeScreen');
});
