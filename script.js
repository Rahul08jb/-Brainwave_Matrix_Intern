document.addEventListener('DOMContentLoaded', () => {

    const greetingEl = document.getElementById('greeting');
    const dateEl = document.getElementById('current-date');
    const themeToggle = document.getElementById('theme-toggle');
    const form = document.getElementById('planner-form');
    const timeInput = document.getElementById('time-input');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortBtn = document.getElementById('sort-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    setGreetingAndDate();
    initializeTheme();
    renderTasks();

    themeToggle.addEventListener('click', toggleTheme);
    form.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskActions);
    filterBtns.forEach(btn => btn.addEventListener('click', handleFilterClick));
    sortBtn.addEventListener('click', sortTasks);

    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.isCompleted;
            if (currentFilter === 'completed') return task.isCompleted;
            return true; // 'all'
        });
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="no-tasks">No tasks for this view. Add one!</li>`;
        } else {
            filteredTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                taskList.appendChild(taskItem);
            });
        }
    }

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const time = timeInput.value;

        if (taskText === '' || time === '') {
            alert('Please fill in both time and task description.');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            time: time,
            isCompleted: false
        };

        tasks.push(newTask);
        saveAndRender();
        form.reset();
    }
    
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-content">
                <span class="task-time">${task.time}</span>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="complete-btn">${task.isCompleted ? '↩️' : '✔️'}</button>
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">❌</button>
            </div>
        `;
        return li;
    }

    function handleTaskActions(e) {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;
        const taskId = Number(taskItem.dataset.id);
        
        if (target.classList.contains('complete-btn')) {
            toggleComplete(taskId);
        }
        if (target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
        if (target.classList.contains('edit-btn')) {
            editTask(taskItem, taskId);
        }
    }
  
    function toggleComplete(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        );
        saveAndRender();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveAndRender();
    }

    function editTask(taskItem, id) {
        const taskTextEl = taskItem.querySelector('.task-text');
        const currentText = taskTextEl.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-text-input';
        
        taskTextEl.replaceWith(input);
        input.focus();
        
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                 tasks = tasks.map(task => 
                    task.id === id ? { ...task, text: newText } : task
                );
            }
            saveAndRender();
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                input.removeEventListener('blur', saveEdit); // Prevent double save
                saveEdit();
            }
        });
    }

    function handleFilterClick(e) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
    }

    function sortTasks() {
        tasks.sort((a, b) => a.time.localeCompare(b.time));
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function setGreetingAndDate() {
        const now = new Date();
        const hour = now.getHours();

        if (hour < 12) greetingEl.textContent = 'Good Morning! ☀️';
        else if (hour < 18) greetingEl.textContent = 'Good Afternoon! 🌇';
        else greetingEl.textContent = 'Good Evening! 🌙';

        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.textContent = '🌙';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    }
});