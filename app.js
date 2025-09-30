// App State and Configuration
const APP_STATE = {
    currentTab: 'dashboard',
    studies: [],
    disciplines: [],
    settings: {
        dailyGoal: 3,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null
    },
    timer: {
        seconds: 0,
        isRunning: false,
        interval: null
    }
};

// Initial data from the provided JSON
const INITIAL_DATA = {
    "studies": [
        {
            "id": 1696435200001,
            "discipline": "1",
            "topic": "Arritmias",
            "correctAnswers": 18,
            "totalQuestions": 20,
            "percentage": 90,
            "studyDate": "2024-09-25",
            "studyTime": 1800,
            "observations": "Revisão de conceitos básicos",
            "createdAt": "2024-09-25T10:30:00.000Z",
            "nextReview": "2024-09-28"
        },
        {
            "id": 1696435200002,
            "discipline": "2",
            "topic": "Asma",
            "correctAnswers": 15,
            "totalQuestions": 20,
            "percentage": 75,
            "studyDate": "2024-09-26",
            "studyTime": 2100,
            "observations": "Foco em diagnóstico diferencial",
            "createdAt": "2024-09-26T14:15:00.000Z",
            "nextReview": "2024-09-30"
        },
        {
            "id": 1696435200003,
            "discipline": "4",
            "topic": "AVC",
            "correctAnswers": 12,
            "totalQuestions": 20,
            "percentage": 60,
            "studyDate": "2024-09-27",
            "studyTime": 2700,
            "observations": "Preciso estudar mais sobre tratamento",
            "createdAt": "2024-09-27T09:20:00.000Z",
            "nextReview": "2024-10-01"
        },
        {
            "id": 1696435200004,
            "discipline": "1",
            "topic": "Insuficiência Cardíaca",
            "correctAnswers": 16,
            "totalQuestions": 20,
            "percentage": 80,
            "studyDate": "2024-09-28",
            "studyTime": 1950,
            "observations": "Boa performance, revisar medicações",
            "createdAt": "2024-09-28T16:45:00.000Z",
            "nextReview": "2024-09-29"
        },
        {
            "id": 1696435200005,
            "discipline": "3",
            "topic": "DRGE",
            "correctAnswers": 14,
            "totalQuestions": 20,
            "percentage": 70,
            "studyDate": "2024-09-29",
            "studyTime": 2250,
            "observations": "Revisar critérios diagnósticos",
            "createdAt": "2024-09-29T11:30:00.000Z",
            "nextReview": "2024-09-30"
        },
        {
            "id": 1696435200006,
            "discipline": "2",
            "topic": "DPOC",
            "correctAnswers": 17,
            "totalQuestions": 20,
            "percentage": 85,
            "studyDate": "2024-09-30",
            "studyTime": 1650,
            "observations": "Excelente performance em espirometria",
            "createdAt": "2024-09-30T08:00:00.000Z",
            "nextReview": "2024-10-05"
        }
    ],
    "settings": {
        "dailyGoal": 3,
        "currentStreak": 6,
        "longestStreak": 12,
        "lastStudyDate": "2024-09-30"
    },
    "disciplines": [
        {
            "id": 1,
            "nome": "Cardiologia",
            "assuntos": ["Arritmias", "Insuficiência Cardíaca", "Coronariopatias", "Hipertensão", "Valvopatias"],
            "isCustom": false
        },
        {
            "id": 2,
            "nome": "Pneumologia",
            "assuntos": ["Asma", "DPOC", "Pneumonias", "Derrame Pleural", "Embolia Pulmonar"],
            "isCustom": false
        },
        {
            "id": 3,
            "nome": "Gastroenterologia",
            "assuntos": ["DRGE", "Úlcera Péptica", "Hepatites", "Cirrose", "Pancreatite"],
            "isCustom": false
        },
        {
            "id": 4,
            "nome": "Neurologia",
            "assuntos": ["AVC", "Epilepsia", "Cefaléias", "Demências", "Parkinson"],
            "isCustom": false
        },
        {
            "id": 5,
            "nome": "Endocrinologia",
            "assuntos": ["Diabetes", "Tireoidopatias", "Obesidade", "Osteoporose", "Adrenal"],
            "isCustom": false
        }
    ]
};

// Utility functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
};

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
};

const formatPercentage = (percentage) => {
    if (percentage >= 80) return { text: `${percentage}%`, class: 'review-performance--good' };
    if (percentage >= 60) return { text: `${percentage}%`, class: 'review-performance--average' };
    return { text: `${percentage}%`, class: 'review-performance--poor' };
};

const getDisciplineName = (disciplineId) => {
    const discipline = APP_STATE.disciplines.find(d => d.id == disciplineId);
    return discipline ? discipline.nome : 'Disciplina não encontrada';
};

const isDateToday = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
};

const isDateOverdue = (date) => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
};

const calculateDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// SM-2 Algorithm for spaced repetition
const calculateNextReview = (performance, currentInterval = 1, easeFactor = 2.5) => {
    let newEaseFactor = easeFactor;
    let newInterval = currentInterval;
    
    if (performance >= 80) {
        newEaseFactor = Math.max(1.3, easeFactor + 0.1);
        newInterval = Math.max(1, Math.round(currentInterval * newEaseFactor));
    } else if (performance >= 60) {
        newInterval = Math.max(1, Math.round(currentInterval * 1.2));
    } else {
        newEaseFactor = Math.max(1.3, easeFactor - 0.2);
        newInterval = Math.max(1, Math.round(currentInterval * 0.6));
    }
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    
    return {
        nextReview: nextReviewDate.toISOString().split('T')[0],
        interval: newInterval,
        easeFactor: newEaseFactor
    };
};

// Streak calculation
const calculateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const studyDates = [...new Set(APP_STATE.studies.map(s => s.studyDate))].sort().reverse();
    
    let streak = 0;
    let checkDate = today;
    
    for (let i = 0; i < studyDates.length; i++) {
        if (studyDates[i] === checkDate) {
            streak++;
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split('T')[0];
        } else if (studyDates[i] < checkDate && calculateDaysDifference(studyDates[i], checkDate) === 1) {
            streak++;
            checkDate = studyDates[i];
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split('T')[0];
        } else {
            break;
        }
    }
    
    return streak;
};

// Storage functions
const saveData = () => {
    const data = {
        studies: APP_STATE.studies,
        disciplines: APP_STATE.disciplines,
        settings: APP_STATE.settings
    };
    localStorage.setItem('medStudyApp', JSON.stringify(data));
};

const loadData = () => {
    const saved = localStorage.getItem('medStudyApp');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            APP_STATE.studies = data.studies || [];
            APP_STATE.disciplines = data.disciplines || [];
            APP_STATE.settings = { ...INITIAL_DATA.settings, ...(data.settings || {}) };
        } catch (error) {
            console.error('Error loading saved data:', error);
            // Fallback to initial data
            APP_STATE.studies = INITIAL_DATA.studies;
            APP_STATE.disciplines = INITIAL_DATA.disciplines;
            APP_STATE.settings = INITIAL_DATA.settings;
            saveData();
        }
    } else {
        APP_STATE.studies = INITIAL_DATA.studies;
        APP_STATE.disciplines = INITIAL_DATA.disciplines;
        APP_STATE.settings = INITIAL_DATA.settings;
        saveData();
    }
    
    // Update streak
    APP_STATE.settings.currentStreak = calculateStreak();
    if (APP_STATE.settings.currentStreak > APP_STATE.settings.longestStreak) {
        APP_STATE.settings.longestStreak = APP_STATE.settings.currentStreak;
    }
    saveData();
};

// Toast notification system
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast--show'), 100);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
};

// **ENHANCED FEATURE**: Copy to clipboard functionality (works in APK)
const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback method for older browsers or APK
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (err) {
        return false;
    }
};

// **MAIN FEATURE**: Mark review as complete
const markReviewComplete = (studyId) => {
    const study = APP_STATE.studies.find(s => s.id === studyId);
    if (!study) return;
    
    const nextReviewData = calculateNextReview(study.percentage);
    study.nextReview = nextReviewData.nextReview;
    
    saveData();
    
    showToast(`Revisão de ${study.topic} marcada como concluída! Próxima revisão: ${formatDate(study.nextReview)}`, 'success');
    
    updateDashboardStats();
    renderReviewLists();
};

// Timer functions
const initTimer = () => {
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
};

const updateTimerDisplay = () => {
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = formatTime(APP_STATE.timer.seconds);
    }
};

const startTimer = () => {
    if (!APP_STATE.timer.isRunning) {
        APP_STATE.timer.isRunning = true;
        APP_STATE.timer.interval = setInterval(() => {
            APP_STATE.timer.seconds++;
            updateTimerDisplay();
        }, 1000);
        
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        const stopBtn = document.getElementById('timer-stop');
        
        if (startBtn) startBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
    }
};

const pauseTimer = () => {
    if (APP_STATE.timer.isRunning) {
        clearInterval(APP_STATE.timer.interval);
        APP_STATE.timer.isRunning = false;
        
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }
};

const stopTimer = () => {
    clearInterval(APP_STATE.timer.interval);
    APP_STATE.timer.isRunning = false;
    
    // Set the study time in the form
    const studyTimeInput = document.getElementById('study-time-manual');
    if (studyTimeInput) {
        studyTimeInput.value = Math.ceil(APP_STATE.timer.seconds / 60);
    }
    
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const stopBtn = document.getElementById('timer-stop');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    
    showToast(`Tempo registrado: ${formatDuration(APP_STATE.timer.seconds)}`, 'info');
};

const resetTimer = () => {
    clearInterval(APP_STATE.timer.interval);
    APP_STATE.timer.seconds = 0;
    APP_STATE.timer.isRunning = false;
    updateTimerDisplay();
    
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const stopBtn = document.getElementById('timer-stop');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
};

// Navigation system
const initNavigation = () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            navButtons.forEach(b => b.classList.remove('nav-btn--active'));
            btn.classList.add('nav-btn--active');
            
            tabContents.forEach(tab => {
                tab.classList.remove('tab-content--active');
                if (tab.dataset.tab === targetTab) {
                    tab.classList.add('tab-content--active');
                }
            });
            
            APP_STATE.currentTab = targetTab;
            
            switch (targetTab) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'cadastro':
                    // Refresh selects when opening cadastro tab
                    populateDisciplineSelect();
                    break;
                case 'revisoes':
                    renderReviewLists();
                    break;
                case 'historico':
                    renderStudiesHistory();
                    break;
                case 'configuracoes':
                    renderDisciplinesList();
                    updateSettingsForm();
                    break;
            }
        });
    });
};

// Dashboard functions
const updateDashboardStats = () => {
    const totalStudies = APP_STATE.studies.length;
    const today = new Date().toISOString().split('T')[0];
    
    const overdueReviews = APP_STATE.studies.filter(s => s.nextReview < today).length;
    const todayReviews = APP_STATE.studies.filter(s => s.nextReview === today).length;
    
    const avgPerformance = totalStudies > 0 
        ? Math.round(APP_STATE.studies.reduce((sum, s) => sum + s.percentage, 0) / totalStudies)
        : 0;
    
    const totalTime = APP_STATE.studies.reduce((sum, s) => sum + (s.studyTime || 0), 0);
    const avgTime = totalStudies > 0 ? Math.round(totalTime / totalStudies / 60) : 0;
    
    // Update daily goal progress
    const todayStudies = APP_STATE.studies.filter(s => s.studyDate === today).length;
    const goalProgress = Math.min((todayStudies / APP_STATE.settings.dailyGoal) * 100, 100);
    
    // Update DOM elements safely
    const elements = {
        'total-studies': totalStudies,
        'overdue-reviews': overdueReviews,
        'today-reviews': todayReviews,
        'avg-performance': `${avgPerformance}%`,
        'total-time': formatDuration(totalTime),
        'avg-time': `${avgTime}min`,
        'daily-goal-text': `${todayStudies} / ${APP_STATE.settings.dailyGoal} estudos`,
        'current-streak': APP_STATE.settings.currentStreak,
        'longest-streak': APP_STATE.settings.longestStreak
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Update progress bar
    const progressFill = document.getElementById('daily-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${goalProgress}%`;
    }
};

const updateDashboard = () => {
    updateDashboardStats();
    renderDisciplinesChart();
    renderPerformanceChart();
    renderActivityHeatmap();
    renderStreakChart();
};

const renderActivityHeatmap = () => {
    const container = document.getElementById('activity-heatmap');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // Last 30 days
    
    const studyCountByDate = {};
    APP_STATE.studies.forEach(study => {
        const date = study.studyDate;
        studyCountByDate[date] = (studyCountByDate[date] || 0) + 1;
    });
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const count = studyCountByDate[dateStr] || 0;
        
        let level = 0;
        if (count > 0) level = 1;
        if (count > 2) level = 2;
        if (count > 4) level = 3;
        
        const dayElement = document.createElement('div');
        dayElement.className = `heatmap-day heatmap-day--level-${level}`;
        dayElement.innerHTML = `<div class="heatmap-tooltip">${formatDate(dateStr)}: ${count} estudos</div>`;
        
        container.appendChild(dayElement);
    }
};

const renderDisciplinesChart = () => {
    const ctx = document.getElementById('disciplines-chart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    const disciplineCounts = {};
    APP_STATE.studies.forEach(study => {
        const disciplineName = getDisciplineName(study.discipline);
        disciplineCounts[disciplineName] = (disciplineCounts[disciplineName] || 0) + 1;
    });
    
    const labels = Object.keys(disciplineCounts);
    const data = Object.values(disciplineCounts);
    
    if (labels.length === 0) {
        labels.push('Nenhum estudo');
        data.push(1);
    }
    
    new Chart(context, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
};

const renderPerformanceChart = () => {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    const sortedStudies = [...APP_STATE.studies].sort((a, b) => new Date(a.studyDate) - new Date(b.studyDate));
    
    const labels = sortedStudies.map(s => formatDate(s.studyDate));
    const data = sortedStudies.map(s => s.percentage);
    
    new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance (%)',
                data: data,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};

const renderStreakChart = () => {
    const ctx = document.getElementById('streak-chart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    // Calculate streak history over last 30 days
    const today = new Date();
    const streakData = [];
    const labels = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculate streak up to this date
        const studiesUpToDate = APP_STATE.studies.filter(s => s.studyDate <= dateStr);
        const studyDates = [...new Set(studiesUpToDate.map(s => s.studyDate))].sort().reverse();
        
        let dayStreak = 0;
        let checkDate = dateStr;
        
        for (let j = 0; j < studyDates.length; j++) {
            if (studyDates[j] === checkDate) {
                dayStreak++;
                const prevDate = new Date(checkDate);
                prevDate.setDate(prevDate.getDate() - 1);
                checkDate = prevDate.toISOString().split('T')[0];
            } else if (studyDates[j] < checkDate && calculateDaysDifference(studyDates[j], checkDate) === 1) {
                dayStreak++;
                checkDate = studyDates[j];
                const prevDate = new Date(checkDate);
                prevDate.setDate(prevDate.getDate() - 1);
                checkDate = prevDate.toISOString().split('T')[0];
            } else {
                break;
            }
        }
        
        streakData.push(dayStreak);
        labels.push(date.getDate().toString());
    }
    
    new Chart(context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sequência (dias)',
                data: streakData,
                backgroundColor: '#1FB8CD',
                borderColor: '#1FB8CD',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};

// Study form functions
const initStudyForm = () => {
    const form = document.getElementById('study-form');
    const disciplineSelect = document.getElementById('discipline');
    const topicSelect = document.getElementById('topic');
    const totalQuestionsInput = document.getElementById('total-questions');
    const correctAnswersInput = document.getElementById('correct-answers');
    const studyDateInput = document.getElementById('study-date');
    
    if (studyDateInput) {
        studyDateInput.valueAsDate = new Date();
    }
    
    // Initial population of discipline select
    populateDisciplineSelect();
    
    // Event listener for discipline change
    if (disciplineSelect) {
        disciplineSelect.addEventListener('change', (e) => {
            populateTopicSelect(e.target.value);
        });
    }
    
    if (totalQuestionsInput) totalQuestionsInput.addEventListener('blur', validateAnswers);
    if (correctAnswersInput) correctAnswersInput.addEventListener('blur', validateAnswers);
    
    if (form) form.addEventListener('submit', handleStudyFormSubmit);
};

const populateDisciplineSelect = () => {
    const select = document.getElementById('discipline');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione uma disciplina</option>';
    
    APP_STATE.disciplines.forEach(discipline => {
        const option = document.createElement('option');
        option.value = discipline.id;
        option.textContent = discipline.nome;
        select.appendChild(option);
    });
};

const populateTopicSelect = (disciplineId) => {
    const select = document.getElementById('topic');
    if (!select) return;
    
    if (!disciplineId) {
        select.innerHTML = '<option value="">Selecione primeiro uma disciplina</option>';
        return;
    }
    
    const discipline = APP_STATE.disciplines.find(d => d.id == parseInt(disciplineId));
    
    if (discipline && discipline.assuntos) {
        select.innerHTML = '<option value="">Selecione um tópico</option>';
        
        discipline.assuntos.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            select.appendChild(option);
        });
    } else {
        select.innerHTML = '<option value="">Nenhum tópico encontrado</option>';
    }
};

const validateAnswers = () => {
    const totalQuestionsInput = document.getElementById('total-questions');
    const correctAnswersInput = document.getElementById('correct-answers');
    
    if (!totalQuestionsInput || !correctAnswersInput) return;
    
    const totalQuestions = parseInt(totalQuestionsInput.value);
    const correctAnswers = parseInt(correctAnswersInput.value);
    
    if (!isNaN(totalQuestions) && !isNaN(correctAnswers) && correctAnswers > totalQuestions) {
        correctAnswersInput.value = totalQuestions;
        showToast('Questões corretas não pode ser maior que o total de questões', 'warning');
    }
};

const handleStudyFormSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const totalQuestions = parseInt(formData.get('totalQuestions'));
    const correctAnswers = parseInt(formData.get('correctAnswers'));
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const studyTime = parseInt(formData.get('studyTime')) * 60 || 0; // Convert to seconds
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);
    
    const study = {
        id: Date.now(),
        discipline: formData.get('discipline'),
        topic: formData.get('topic'),
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        percentage: percentage,
        studyDate: formData.get('studyDate'),
        studyTime: studyTime,
        observations: formData.get('observations') || '',
        createdAt: new Date().toISOString(),
        nextReview: nextReview.toISOString().split('T')[0]
    };
    
    APP_STATE.studies.push(study);
    
    // Update streak
    APP_STATE.settings.currentStreak = calculateStreak();
    if (APP_STATE.settings.currentStreak > APP_STATE.settings.longestStreak) {
        APP_STATE.settings.longestStreak = APP_STATE.settings.currentStreak;
    }
    
    saveData();
    
    showToast('Estudo cadastrado com sucesso!', 'success');
    e.target.reset();
    
    const studyDateInput = document.getElementById('study-date');
    const topicSelect = document.getElementById('topic');
    
    if (studyDateInput) studyDateInput.valueAsDate = new Date();
    if (topicSelect) topicSelect.innerHTML = '<option value="">Selecione primeiro uma disciplina</option>';
    
    // Reset timer
    resetTimer();
    
    updateDashboardStats();
};

// Reviews functions
const renderReviewLists = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const overdueReviews = APP_STATE.studies.filter(s => isDateOverdue(s.nextReview));
    const todayReviews = APP_STATE.studies.filter(s => isDateToday(s.nextReview));
    const upcomingReviews = APP_STATE.studies.filter(s => s.nextReview > today);
    
    renderReviewList('overdue-reviews-list', overdueReviews, 'Nenhuma revisão atrasada');
    renderReviewList('today-reviews-list', todayReviews, 'Nenhuma revisão para hoje');
    renderReviewList('upcoming-reviews-list', upcomingReviews, 'Nenhuma revisão próxima');
};

const renderReviewList = (containerId, reviews, emptyMessage) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = `<div class="empty-state"><h3>${emptyMessage}</h3></div>`;
        return;
    }
    
    container.innerHTML = reviews.map(study => {
        const performance = formatPercentage(study.percentage);
        const disciplineName = getDisciplineName(study.discipline);
        
        return `
            <div class="review-item">
                <div class="review-info">
                    <h4>${study.topic}</h4>
                    <div class="review-meta">
                        <span><strong>Disciplina:</strong> ${disciplineName}</span>
                        <span><strong>Data do estudo:</strong> ${formatDate(study.studyDate)}</span>
                        <span><strong>Revisão:</strong> ${formatDate(study.nextReview)}</span>
                    </div>
                    <div class="review-performance ${performance.class}">
                        Performance anterior: ${performance.text}
                    </div>
                </div>
                <div class="review-actions">
                    <button class="btn-review-done" onclick="markReviewComplete(${study.id})">
                        Revisão Feita
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

// History functions
const initHistoryFilters = () => {
    const disciplineFilter = document.getElementById('history-discipline-filter');
    const searchInput = document.getElementById('history-search');
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const performanceFilter = document.getElementById('performance-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (disciplineFilter) {
        // Populate discipline filter
        disciplineFilter.innerHTML = '<option value="">Todas as disciplinas</option>';
        APP_STATE.disciplines.forEach(discipline => {
            const option = document.createElement('option');
            option.value = discipline.id;
            option.textContent = discipline.nome;
            disciplineFilter.appendChild(option);
        });
    }
    
    // Add event listeners
    if (searchInput) searchInput.addEventListener('input', renderStudiesHistory);
    if (disciplineFilter) disciplineFilter.addEventListener('change', renderStudiesHistory);
    if (dateFromInput) dateFromInput.addEventListener('change', renderStudiesHistory);
    if (dateToInput) dateToInput.addEventListener('change', renderStudiesHistory);
    if (performanceFilter) performanceFilter.addEventListener('change', renderStudiesHistory);
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (disciplineFilter) disciplineFilter.value = '';
            if (dateFromInput) dateFromInput.value = '';
            if (dateToInput) dateToInput.value = '';
            if (performanceFilter) performanceFilter.value = '';
            renderStudiesHistory();
        });
    }
};

const renderStudiesHistory = () => {
    const searchTerm = (document.getElementById('history-search')?.value || '').toLowerCase();
    const disciplineFilter = document.getElementById('history-discipline-filter')?.value || '';
    const dateFrom = document.getElementById('date-from')?.value || '';
    const dateTo = document.getElementById('date-to')?.value || '';
    const performanceFilter = document.getElementById('performance-filter')?.value || '';
    
    let filteredStudies = [...APP_STATE.studies];
    
    // Search filter
    if (searchTerm) {
        filteredStudies = filteredStudies.filter(s => 
            s.topic.toLowerCase().includes(searchTerm) ||
            getDisciplineName(s.discipline).toLowerCase().includes(searchTerm) ||
            (s.observations && s.observations.toLowerCase().includes(searchTerm))
        );
    }
    
    // Discipline filter
    if (disciplineFilter) {
        filteredStudies = filteredStudies.filter(s => s.discipline === disciplineFilter);
    }
    
    // Date range filter
    if (dateFrom) {
        filteredStudies = filteredStudies.filter(s => s.studyDate >= dateFrom);
    }
    if (dateTo) {
        filteredStudies = filteredStudies.filter(s => s.studyDate <= dateTo);
    }
    
    // Performance filter
    if (performanceFilter) {
        const [min, max] = performanceFilter.split('-').map(Number);
        filteredStudies = filteredStudies.filter(s => s.percentage >= min && s.percentage <= max);
    }
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${filteredStudies.length} estudos encontrados`;
    }
    
    // Sort by study date (most recent first)
    filteredStudies.sort((a, b) => new Date(b.studyDate) - new Date(a.studyDate));
    
    const container = document.getElementById('studies-list');
    if (!container) return;
    
    if (filteredStudies.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Nenhum estudo encontrado</h3></div>';
        return;
    }
    
    container.innerHTML = filteredStudies.map(study => {
        const performance = formatPercentage(study.percentage);
        const disciplineName = getDisciplineName(study.discipline);
        
        return `
            <div class="study-item">
                <div class="study-header">
                    <div class="study-info">
                        <h4>${study.topic}</h4>
                        <div class="study-discipline">${disciplineName}</div>
                    </div>
                    <div class="study-performance ${performance.class}">
                        ${performance.text}
                    </div>
                </div>
                <div class="study-details">
                    <div class="study-detail">
                        <strong>Data do Estudo:</strong> <span>${formatDate(study.studyDate)}</span>
                    </div>
                    <div class="study-detail">
                        <strong>Questões:</strong> <span>${study.correctAnswers}/${study.totalQuestions}</span>
                    </div>
                    <div class="study-detail">
                        <strong>Tempo:</strong> <span>${study.studyTime ? formatDuration(study.studyTime) : 'N/A'}</span>
                    </div>
                    <div class="study-detail">
                        <strong>Próxima Revisão:</strong> <span>${formatDate(study.nextReview)}</span>
                    </div>
                </div>
                ${study.observations ? `<div class="study-observations">${study.observations}</div>` : ''}
            </div>
        `;
    }).join('');
};

// Settings functions
const initSettings = () => {
    const dailyGoalInput = document.getElementById('daily-goal');
    const saveGoalsBtn = document.getElementById('save-goals');
    
    if (dailyGoalInput) {
        dailyGoalInput.addEventListener('change', () => {
            APP_STATE.settings.dailyGoal = parseInt(dailyGoalInput.value);
            saveData();
            updateDashboardStats();
            showToast('Meta diária atualizada!', 'success');
        });
    }
    
    if (saveGoalsBtn) {
        saveGoalsBtn.addEventListener('click', () => {
            const dailyGoalValue = document.getElementById('daily-goal')?.value;
            if (dailyGoalValue) {
                APP_STATE.settings.dailyGoal = parseInt(dailyGoalValue);
                saveData();
                updateDashboardStats();
                showToast('Meta diária salva!', 'success');
            }
        });
    }
};

const updateSettingsForm = () => {
    const dailyGoalInput = document.getElementById('daily-goal');
    if (dailyGoalInput) {
        dailyGoalInput.value = APP_STATE.settings.dailyGoal;
    }
};

const initCustomDisciplineForm = () => {
    const form = document.getElementById('custom-discipline-form');
    if (form) {
        form.addEventListener('submit', handleCustomDisciplineSubmit);
    }
};

const handleCustomDisciplineSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('custom-discipline-name').trim();
    const topicsString = formData.get('custom-discipline-topics').trim();
    
    if (!name || !topicsString) {
        showToast('Nome e tópicos são obrigatórios', 'error');
        return;
    }
    
    if (APP_STATE.disciplines.some(d => d.nome.toLowerCase() === name.toLowerCase())) {
        showToast('Já existe uma disciplina com esse nome', 'error');
        return;
    }
    
    const topics = topicsString.split(',').map(t => t.trim()).filter(t => t);
    
    const newDiscipline = {
        id: Math.max(...APP_STATE.disciplines.map(d => d.id)) + 1,
        nome: name,
        assuntos: topics,
        isCustom: true
    };
    
    APP_STATE.disciplines.push(newDiscipline);
    saveData();
    
    showToast('Disciplina customizada adicionada com sucesso!', 'success');
    e.target.reset();
    
    renderDisciplinesList();
    populateDisciplineSelect();
};

const renderDisciplinesList = () => {
    const container = document.getElementById('disciplines-list');
    if (!container) return;
    
    container.innerHTML = APP_STATE.disciplines.map(discipline => `
        <div class="discipline-item">
            <div class="discipline-info">
                <h5>${discipline.nome} ${discipline.isCustom ? '(Customizada)' : ''}</h5>
                <div class="discipline-topics">${discipline.assuntos.join(', ')}</div>
            </div>
            <div class="discipline-actions">
                ${discipline.isCustom ? `
                    <button class="btn-delete" onclick="deleteDiscipline(${discipline.id})">
                        Excluir
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
};

const deleteDiscipline = (disciplineId) => {
    const isUsed = APP_STATE.studies.some(s => s.discipline == disciplineId);
    
    if (isUsed) {
        showToast('Não é possível excluir disciplina que possui estudos cadastrados', 'error');
        return;
    }
    
    showConfirmModal(
        'Excluir Disciplina',
        'Tem certeza que deseja excluir esta disciplina?',
        () => {
            APP_STATE.disciplines = APP_STATE.disciplines.filter(d => d.id !== disciplineId);
            saveData();
            showToast('Disciplina excluída com sucesso!', 'success');
            renderDisciplinesList();
            populateDisciplineSelect();
        }
    );
};

// Data management functions
const initDataManagement = () => {
    const exportBtn = document.getElementById('export-data');
    const copyBtn = document.getElementById('copy-data');
    const showBtn = document.getElementById('show-data');
    const hideBtn = document.getElementById('hide-data');
    const selectAllBtn = document.getElementById('select-all-data');
    const importBtn = document.getElementById('import-data');
    const importFile = document.getElementById('import-file');
    const clearBtn = document.getElementById('clear-data');
    
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (copyBtn) copyBtn.addEventListener('click', copyDataToClipboard);
    if (showBtn) showBtn.addEventListener('click', showDataForCopy);
    if (hideBtn) hideBtn.addEventListener('click', hideDataDisplay);
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllData);
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (importFile) importFile.click();
        });
    }
    if (importFile) importFile.addEventListener('change', importData);
    if (clearBtn) clearBtn.addEventListener('click', clearAllData);
};

const getBackupData = () => {
    return {
        studies: APP_STATE.studies,
        disciplines: APP_STATE.disciplines,
        settings: APP_STATE.settings,
        exportDate: new Date().toISOString(),
        version: "2.0"
    };
};

const exportData = () => {
    const data = getBackupData();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `med-study-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Dados exportados com sucesso!', 'success');
};

const copyDataToClipboard = async () => {
    const data = getBackupData();
    const jsonString = JSON.stringify(data, null, 2);
    
    const success = await copyToClipboard(jsonString);
    
    if (success) {
        showToast('Dados copiados para a área de transferência! Cole em um arquivo de texto para fazer backup.', 'success');
    } else {
        showToast('Erro ao copiar dados. Use o botão "Ver Dados" para copiar manualmente.', 'error');
        showDataForCopy();
    }
};

const showDataForCopy = () => {
    const data = getBackupData();
    const jsonString = JSON.stringify(data, null, 2);
    
    const textarea = document.getElementById('data-textarea');
    const display = document.getElementById('data-display');
    
    if (textarea) textarea.value = jsonString;
    if (display) display.classList.remove('hidden');
    
    showToast('Dados exibidos abaixo. Você pode selecionar e copiar manualmente.', 'info');
};

const hideDataDisplay = () => {
    const display = document.getElementById('data-display');
    if (display) display.classList.add('hidden');
};

const selectAllData = () => {
    const textarea = document.getElementById('data-textarea');
    if (textarea) {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        
        showToast('Texto selecionado! Use Ctrl+C (ou Cmd+C no Mac) para copiar.', 'info');
    }
};

const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.studies || !data.disciplines) {
                throw new Error('Formato de arquivo inválido');
            }
            
            showConfirmModal(
                'Importar Dados',
                'Isso irá substituir todos os dados atuais. Deseja continuar?',
                () => {
                    APP_STATE.studies = data.studies;
                    APP_STATE.disciplines = data.disciplines;
                    APP_STATE.settings = { ...APP_STATE.settings, ...(data.settings || {}) };
                    
                    // Recalculate streak
                    APP_STATE.settings.currentStreak = calculateStreak();
                    if (APP_STATE.settings.currentStreak > APP_STATE.settings.longestStreak) {
                        APP_STATE.settings.longestStreak = APP_STATE.settings.currentStreak;
                    }
                    
                    saveData();
                    
                    // Refresh all views
                    updateDashboard();
                    populateDisciplineSelect();
                    renderDisciplinesList();
                    initHistoryFilters();
                    updateSettingsForm();
                    
                    showToast('Dados importados com sucesso!', 'success');
                }
            );
        } catch (error) {
            showToast('Erro ao importar dados: arquivo inválido', 'error');
        }
    };
    reader.readAsText(file);
    
    e.target.value = '';
};

const clearAllData = () => {
    showConfirmModal(
        'Limpar Todos os Dados',
        'Isso irá excluir permanentemente todos os estudos e disciplinas customizadas. Esta ação não pode ser desfeita.',
        () => {
            localStorage.removeItem('medStudyApp');
            APP_STATE.studies = [];
            APP_STATE.disciplines = INITIAL_DATA.disciplines;
            APP_STATE.settings = INITIAL_DATA.settings;
            saveData();
            
            // Refresh all views
            updateDashboard();
            populateDisciplineSelect();
            renderDisciplinesList();
            initHistoryFilters();
            updateSettingsForm();
            
            const studiesList = document.getElementById('studies-list');
            if (studiesList) studiesList.innerHTML = '';
            
            renderReviewLists();
            
            showToast('Todos os dados foram limpos!', 'success');
        }
    );
};

// Modal functions
const showConfirmModal = (title, message, onConfirm) => {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');
    
    if (!modal || !titleEl || !messageEl || !cancelBtn || !okBtn) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    modal.classList.remove('hidden');
    
    const handleCancel = () => {
        modal.classList.add('hidden');
        cancelBtn.removeEventListener('click', handleCancel);
        okBtn.removeEventListener('click', handleOk);
    };
    
    const handleOk = () => {
        modal.classList.add('hidden');
        onConfirm();
        cancelBtn.removeEventListener('click', handleCancel);
        okBtn.removeEventListener('click', handleOk);
    };
    
    cancelBtn.addEventListener('click', handleCancel);
    okBtn.addEventListener('click', handleOk);
};

// App initialization
const initApp = () => {
    try {
        loadData();
        initNavigation();
        initTimer();
        initStudyForm();
        initHistoryFilters();
        initCustomDisciplineForm();
        initSettings();
        initDataManagement();
        
        // Initialize dashboard view
        updateDashboard();
        renderReviewLists();
        renderStudiesHistory();
        renderDisciplinesList();
        updateSettingsForm();
        
        showToast('Med Study carregado com sucesso! 🎉', 'success');
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Erro ao carregar a aplicação. Recarregue a página.', 'error');
    }
};

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);