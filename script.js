// Global state management
class AppState {
    constructor() {
        this.userId = null;
        this.tasks = [];
        this.pomodoroSessions = [];
        this.currentDate = new Date();
        this.editingTaskId = null;
        this.pomodoroTimer = null;
        this.isPomodoroRunning = false;
        this.isBreakTime = false;
        this.currentTime = 25 * 60; // 25 minutes in seconds
    }

    // Set the current user ID and load their data
    setUser(userId) {
        this.userId = userId;
        this.tasks = this.loadFromStorage(`tasks_${this.userId}`, []);
        this.pomodoroSessions = this.loadFromStorage(`pomodoroSessions_${this.userId}`, []);
    }

    loadFromStorage(key, defaultValue) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    saveToStorage(key, data) {
        try {
            // Only save if we have a user ID
            if (this.userId) {
                localStorage.setItem(`${key}_${this.userId}`, JSON.stringify(data));
            } else {
                console.warn('Cannot save data: No user ID set');
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    addTask(task) {
        const newTask = {
            id: Date.now().toString(),
            ...task,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: task.dueDate || null
        };
        this.tasks.push(newTask);
        this.saveToStorage('tasks', this.tasks);
        return newTask;
    }

    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updates };
            this.saveToStorage('tasks', this.tasks);
            return this.tasks[index];
        }
        return null;
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToStorage('tasks', this.tasks);
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage('tasks', this.tasks);
            return task;
        }
        return null;
    }

    addPomodoroSession() {
        const session = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            completedAt: new Date().toISOString()
        };
        this.pomodoroSessions.push(session);
        this.saveToStorage('pomodoroSessions', this.pomodoroSessions);
    }

    getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.tasks.filter(task => {
            if (!task.dueDate) return false;
            return task.dueDate === dateStr;
        });
    }

    getCompletedTasksToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.tasks.filter(task => 
            task.completed && task.dueDate === today
        ).length;
    }

    getPomodorosToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.pomodoroSessions.filter(session => 
            session.date === today
        ).length;
    }

    getCurrentStreak() {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            const hasPomodoros = this.pomodoroSessions.some(session => 
                session.date === dateStr
            );
            
            if (hasPomodoros) {
                streak++;
            } else if (i > 0) { // Don't break on first day if no pomodoros today
                break;
            }
        }
        
        return streak;
    }
}

// Initialize app
const app = new AppState();

// DOM Elements
const elements = {
    // Tasks
    tasksContainer: document.getElementById('tasksContainer'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskModal: document.getElementById('taskModal'),
    taskForm: document.getElementById('taskForm'),
    closeModal: document.getElementById('closeModal'),
    cancelTask: document.getElementById('cancelTask'),
    modalTitle: document.getElementById('modalTitle'),
    
    // Calendar
    calendar: document.getElementById('calendar'),
    currentMonth: document.getElementById('currentMonth'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    
    // Pomodoro
    timerDisplay: document.getElementById('timerDisplay'),
    startPomodoro: document.getElementById('startPomodoro'),
    pausePomodoro: document.getElementById('pausePomodoro'),
    resetPomodoro: document.getElementById('resetPomodoro'),
    workTime: document.getElementById('workTime'),
    breakTime: document.getElementById('breakTime'),
    
    // Progress
    completedToday: document.getElementById('completedToday'),
    pomodorosToday: document.getElementById('pomodorosToday'),
    currentStreak: document.getElementById('currentStreak'),
    progressChart: document.getElementById('progressChart')
};

// Task Management
class TaskManager {
    constructor() {
        this.setupEventListeners();
        this.renderTasks();
    }

    setupEventListeners() {
        elements.addTaskBtn.addEventListener('click', () => this.openModal());
        elements.closeModal.addEventListener('click', () => this.closeModal());
        elements.cancelTask.addEventListener('click', () => this.closeModal());
        elements.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close modal when clicking outside
        elements.taskModal.addEventListener('click', (e) => {
            if (e.target === elements.taskModal) {
                this.closeModal();
            }
        });
    }

    openModal(task = null) {
        app.editingTaskId = task ? task.id : null;
        
        if (task) {
            elements.modalTitle.textContent = 'Editar Tarefa';
            elements.taskTitle.value = task.title;
            elements.taskDescription.value = task.description || '';
            elements.taskPriority.value = task.priority;
            elements.taskDueDate.value = task.dueDate || '';
        } else {
            elements.modalTitle.textContent = 'Nova Tarefa';
            elements.taskForm.reset();
            elements.taskDueDate.value = new Date().toISOString().split('T')[0];
        }
        
        elements.taskModal.classList.add('active');
    }

    closeModal() {
        elements.taskModal.classList.remove('active');
        app.editingTaskId = null;
        elements.taskForm.reset();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            title: elements.taskTitle.value,
            description: elements.taskDescription.value,
            priority: elements.taskPriority.value,
            dueDate: elements.taskDueDate.value
        };

        if (app.editingTaskId) {
            app.updateTask(app.editingTaskId, taskData);
        } else {
            app.addTask(taskData);
        }

        this.renderTasks();
        this.closeModal();
        calendar.render();
    }

    renderTasks() {
        elements.tasksContainer.innerHTML = '';
        
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = app.tasks.filter(task => 
            task.dueDate === today || (!task.dueDate && !task.completed)
        );

        if (todayTasks.length === 0) {
            elements.tasksContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>Nenhuma tarefa para hoje.</p>
                    <p>Adicione uma nova tarefa para começar!</p>
                </div>
            `;
            return;
        }

        todayTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            elements.tasksContainer.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
        
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem data';
        
        div.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="btn btn-secondary" onclick="taskManager.editTask('${task.id}')">
                        Editar
                    </button>
                    <button class="btn btn-danger" onclick="taskManager.deleteTask('${task.id}')">
                        Excluir
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="task-priority priority-${task.priority}">
                    ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
                <span>Vence: ${dueDate}</span>
            </div>
        `;

        // Add click to toggle completion
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.task-actions')) {
                taskManager.toggleTask(task.id);
            }
        });

        return div;
    }

    editTask(id) {
        const task = app.tasks.find(t => t.id === id);
        if (task) {
            this.openModal(task);
        }
    }

    deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            app.deleteTask(id);
            this.renderTasks();
            calendar.render();
        }
    }

    toggleTask(id) {
        app.toggleTask(id);
        this.renderTasks();
        progressTracker.updateStats();
    }
}

// Calendar Management
class CalendarManager {
    constructor() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        elements.prevMonth.addEventListener('click', () => this.previousMonth());
        elements.nextMonth.addEventListener('click', () => this.nextMonth());
    }

    previousMonth() {
        app.currentDate.setMonth(app.currentDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        app.currentDate.setMonth(app.currentDate.getMonth() + 1);
        this.render();
    }

    render() {
        const year = app.currentDate.getFullYear();
        const month = app.currentDate.getMonth();
        
        elements.currentMonth.textContent = 
            app.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        // Clear calendar
        elements.calendar.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.textContent = day;
            elements.calendar.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            elements.calendar.appendChild(emptyDay);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            const currentDate = new Date(year, month, day);
            
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Check if this is today
            const today = new Date();
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Check if this day has tasks
            const tasksForDay = app.getTasksForDate(currentDate);
            if (tasksForDay.length > 0) {
                dayElement.classList.add('has-tasks');
                dayElement.title = `${tasksForDay.length} tarefa(s)`;
            }
            
            // Add click handler
            dayElement.addEventListener('click', () => {
                this.showDayTasks(currentDate);
            });
            
            elements.calendar.appendChild(dayElement);
        }
    }

    showDayTasks(date) {
        const tasks = app.getTasksForDate(date);
        const dateStr = date.toLocaleDateString('pt-BR');
        
        if (tasks.length === 0) {
            alert(`Nenhuma tarefa para ${dateStr}`);
            return;
        }
        
        const taskList = tasks.map(task => 
            `• ${task.title} (${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'})`
        ).join('\n');
        
        alert(`Tarefas para ${dateStr}:\n\n${taskList}`);
    }
}

// Pomodoro Timer
class PomodoroTimer {
    constructor() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        elements.startPomodoro.addEventListener('click', () => this.start());
        elements.pausePomodoro.addEventListener('click', () => this.pause());
        elements.resetPomodoro.addEventListener('click', () => this.reset());
        
        elements.workTime.addEventListener('change', () => this.updateSettings());
        elements.breakTime.addEventListener('change', () => this.updateSettings());
    }

    updateSettings() {
        if (!app.isPomodoroRunning) {
            const workMinutes = parseInt(elements.workTime.value);
            app.currentTime = workMinutes * 60;
            this.updateDisplay();
        }
    }

    start() {
        if (app.isPomodoroRunning) {
            this.pause();
            return;
        }

        app.isPomodoroRunning = true;
        elements.startPomodoro.textContent = 'Pausar';
        elements.startPomodoro.disabled = false;
        elements.pausePomodoro.disabled = true;

        app.pomodoroTimer = setInterval(() => {
            app.currentTime--;
            this.updateDisplay();

            if (app.currentTime <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        app.isPomodoroRunning = false;
        clearInterval(app.pomodoroTimer);
        
        elements.startPomodoro.textContent = 'Continuar';
        elements.startPomodoro.disabled = false;
        elements.pausePomodoro.disabled = true;
    }

    reset() {
        app.isPomodoroRunning = false;
        app.isBreakTime = false;
        clearInterval(app.pomodoroTimer);
        
        const workMinutes = parseInt(elements.workTime.value);
        app.currentTime = workMinutes * 60;
        
        elements.startPomodoro.textContent = 'Iniciar';
        elements.startPomodoro.disabled = false;
        elements.pausePomodoro.disabled = true;
        
        this.updateDisplay();
    }

    complete() {
        app.isPomodoroRunning = false;
        clearInterval(app.pomodoroTimer);
        
        if (!app.isBreakTime) {
            // Work session completed
            app.addPomodoroSession();
            app.isBreakTime = true;
            const breakMinutes = parseInt(elements.breakTime.value);
            app.currentTime = breakMinutes * 60;
            
            alert('Pomodoro concluído! Hora da pausa.');
        } else {
            // Break completed
            app.isBreakTime = false;
            const workMinutes = parseInt(elements.workTime.value);
            app.currentTime = workMinutes * 60;
            
            alert('Pausa concluída! Pronto para o próximo Pomodoro.');
        }
        
        elements.startPomodoro.textContent = 'Iniciar';
        elements.startPomodoro.disabled = false;
        elements.pausePomodoro.disabled = true;
        
        this.updateDisplay();
        progressTracker.updateStats();
        progressTracker.updateChart();
    }

    updateDisplay() {
        const minutes = Math.floor(app.currentTime / 60);
        const seconds = app.currentTime % 60;
        elements.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Progress Tracker
class ProgressTracker {
    constructor() {
        this.chart = null;
        this.setupChart();
        this.updateStats();
    }

    setupChart() {
        const ctx = elements.progressChart.getContext('2d');
        
        // Get last 7 days data
        const last7Days = this.getLast7DaysData();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(day => day.label),
                datasets: [{
                    label: 'Tarefas Completadas',
                    data: last7Days.map(day => day.completedTasks),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Pomodoros',
                    data: last7Days.map(day => day.pomodoros),
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    getLast7DaysData() {
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const completedTasks = app.tasks.filter(task => 
                task.completed && task.dueDate === dateStr
            ).length;
            
            const pomodoros = app.pomodoroSessions.filter(session => 
                session.date === dateStr
            ).length;
            
            data.push({
                label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                completedTasks,
                pomodoros
            });
        }
        
        return data;
    }

    updateStats() {
        elements.completedToday.textContent = app.getCompletedTasksToday();
        elements.pomodorosToday.textContent = app.getPomodorosToday();
        elements.currentStreak.textContent = app.getCurrentStreak();
    }

    updateChart() {
        if (this.chart) {
            const last7Days = this.getLast7DaysData();
            this.chart.data.labels = last7Days.map(day => day.label);
            this.chart.data.datasets[0].data = last7Days.map(day => day.completedTasks);
            this.chart.data.datasets[1].data = last7Days.map(day => day.pomodoros);
            this.chart.update();
        }
    }

// Initialize all managers
let taskManager, calendar, pomodoroTimer, progressTracker;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication status
    try {
        // Check if we have a valid session
        const response = await fetch('/.netlify/functions/auth/me');
        
        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                // User is authenticated
                document.body.classList.add('authenticated');
                
                // Initialize app with user data
                app.setUser(data.user.id);
                initializeApp();
                
                // Update UI with user info
                const userElements = document.querySelectorAll('[data-user]');
                userElements.forEach(el => {
                    const attr = el.getAttribute('data-user');
                    if (attr === 'name' && data.user.name) {
                        el.textContent = data.user.name;
                    } else if (attr === 'email' && data.user.email) {
                        el.textContent = data.user.email;
                    }
                });
                
                // Set up logout button
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        auth.logout();
                    });
                }
                
                return;
            }
        }
        
        // If we get here, user is not authenticated
        document.body.classList.remove('authenticated');
        
    } catch (error) {
        console.error('Error checking authentication status:', error);
        document.body.classList.remove('authenticated');
    }
    
    // If not on login/register/forgot-password pages, redirect to login
    if (!['/login.html', '/register.html', '/forgot-password.html', '/reset-password.html'].includes(window.location.pathname)) {
        window.location.href = '/login.html';
    }
});

// Initialize the main application
function initializeApp() {
    taskManager = new TaskManager();
    calendar = new CalendarManager();
    pomodoroTimer = new PomodoroTimer();
    progressTracker = new ProgressTracker();

    // Initialize the calendar with the current date
    calendar.render();

    // Load any saved settings (user-specific)
    if (app.userId) {
        const savedWorkTime = localStorage.getItem(`workTime_${app.userId}`);
        const savedBreakTime = localStorage.getItem(`breakTime_${app.userId}`);

        if (savedWorkTime) document.getElementById('workTime').value = savedWorkTime;
        if (savedBreakTime) document.getElementById('breakTime').value = savedBreakTime;
    }

    // Update the progress chart when tasks or pomodoros change
    const updateProgress = () => {
        if (progressTracker) {
            progressTracker.updateStats();
            progressTracker.updateChart();
        }
    };

    // Listen for custom events to update the progress chart
    document.addEventListener('taskAdded', updateProgress);
    document.addEventListener('taskCompleted', updateProgress);
    document.addEventListener('pomodoroCompleted', updateProgress);

    // Initial progress update
    updateProgress();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape' && elements.taskModal.classList.contains('active')) {
        taskManager.closeModal();
    }
    
    // Space key toggles pomodoro (when not in input field)
    if (e.key === ' ' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (app.isPomodoroRunning) {
            pomodoroTimer.pause();
        } else {
            pomodoroTimer.start();
        }
    }
});

// Auto-save functionality
setInterval(() => {
    app.saveToStorage('tasks', app.tasks);
    app.saveToStorage('pomodoroSessions', app.pomodoroSessions);
}, 30000); // Save every 30 seconds
