// Timer Application with User-Defined Maximum Time
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const timerDisplay = document.getElementById('timer');
    const maxTimeDisplay = document.getElementById('max-time-display');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const setTimeBtn = document.getElementById('setTimeBtn');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    
    // Get the progress ring element
    const progressRing = document.querySelector('.progress-ring-fill');
    const circumference = 2 * Math.PI * 130; // radius is 130
    
    // Timer variables
    let timerInterval = null;
    let timeElapsed = 0; // Count UP from 0
    let maxTime = 435; // Initial: 7 minutes 15 seconds = 435 seconds
    let isRunning = false;
    let isPaused = false;
    let startTime = 0;
    let pausedTime = 0;
    
    // Initialize the timer display
    function initTimer() {
        timeElapsed = 0;
        pausedTime = 0;
        updateTimerDisplay();
        updateMaxTimeDisplay();
        updateProgressRing();
        updateCurrentYear();
        
        // Set initial stroke properties for the progress ring
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = circumference; // Start with empty circle
        
        // Set initial input values
        setInputValuesFromTime(maxTime);
    }
    
    // Update the main timer display - Count UP
    function updateTimerDisplay() {
        const hours = Math.floor(timeElapsed / 3600);
        const minutes = Math.floor((timeElapsed % 3600) / 60);
        const seconds = Math.floor(timeElapsed % 60);
        
        // Format to always show 2 digits
        timerDisplay.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
        // Change text color as time approaches maximum
        if (maxTime - timeElapsed <= 10 && timeElapsed < maxTime) {
            timerDisplay.style.color = '#e74c3c'; // Red when less than 10 seconds to max
        } else if (maxTime - timeElapsed <= 30) {
            timerDisplay.style.color = '#f39c12'; // Orange when less than 30 seconds to max
        } else {
            timerDisplay.style.color = '#2c3e50'; // Default color
        }
    }
    
    // Update the maximum time display
    function updateMaxTimeDisplay() {
        const hours = Math.floor(maxTime / 3600);
        const minutes = Math.floor((maxTime % 3600) / 60);
        const seconds = Math.floor(maxTime % 60);
        
        maxTimeDisplay.textContent = 
            `Max: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Set input values based on time in seconds
    function setInputValuesFromTime(timeInSeconds) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        
        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = seconds;
    }
    
    // Update the circular progress ring - Fills as time increases
    function updateProgressRing() {
        // Calculate progress (how much time has elapsed)
        const progress = Math.min(timeElapsed / maxTime, 1); // Cap at 1
        
        // Calculate stroke dashoffset based on progress
        // When progress is 0 (no time elapsed), offset is circumference (empty circle)
        // When progress is 1 (time complete), offset is 0 (full circle)
        const offset = circumference - (progress * circumference);
        
        // Set the stroke dashoffset
        progressRing.style.strokeDashoffset = offset;
        
        // Change progress ring color based on progress
        if (progress < 0.5) {
            progressRing.style.stroke = '#2ecc71'; // Green for first half
        } else if (progress < 0.75) {
            progressRing.style.stroke = '#f39c12'; // Orange for next quarter
        } else if (progress < 1) {
            progressRing.style.stroke = '#e74c3c'; // Red for last quarter
        } else {
            progressRing.style.stroke = '#3498db'; // Blue when complete
        }
        
        // Add animation when timer reaches maximum
        if (timeElapsed >= maxTime) {
            timerDisplay.classList.add('timer-complete');
        } else {
            timerDisplay.classList.remove('timer-complete');
        }
    }
    
    // Start the timer - Count UP
    function startTimer() {
        if (isRunning) return;
        
        // Check if timer has already reached maximum
        if (timeElapsed >= maxTime && !isPaused) {
            resetTimer();
            return;
        }
        
        isRunning = true;
        isPaused = false;
        
        // Update button states
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // Record start time, accounting for already elapsed time
        startTime = Date.now() - (pausedTime * 1000);
        
        // Start the timer interval
        timerInterval = setInterval(() => {
            const currentTime = Date.now();
            timeElapsed = Math.min(maxTime, Math.floor((currentTime - startTime) / 1000));
            
            // Update displays
            updateTimerDisplay();
            updateProgressRing();
            
            // Check if timer has reached maximum
            if (timeElapsed >= maxTime) {
                timeElapsed = maxTime;
                stopTimer();
                flashTimerDisplay();
                playCompletionSound();
            }
        }, 100); // Update every 100 milliseconds
    }
    
    // Flash effect for timer completion
    function flashTimerDisplay() {
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            timerDisplay.style.color = flashCount % 2 === 0 ? '#e74c3c' : '#2c3e50';
            flashCount++;
            if (flashCount >= 8) { // Flash 4 times
                clearInterval(flashInterval);
                timerDisplay.style.color = '#e74c3c';
            }
        }, 300);
    }
    
    // Play sound when timer completes
    function playCompletionSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log("Audio context not supported");
        }
    }
    
    // Pause the timer
    function pauseTimer() {
        if (!isRunning) return;
        
        isRunning = false;
        isPaused = true;
        
        // Store the elapsed time when pausing
        pausedTime = timeElapsed;
        
        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Clear the interval to stop the timer
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Stop the timer (when it reaches maximum)
    function stopTimer() {
        isRunning = false;
        isPaused = false;
        
        // Update button states
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        
        // Clear the interval
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reset the timer to 0
    function resetTimer() {
        // Stop the timer if it's running
        if (isRunning || isPaused) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Reset variables
        timeElapsed = 0;
        pausedTime = 0;
        isRunning = false;
        isPaused = false;
        
        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        // Update displays
        updateTimerDisplay();
        updateProgressRing();
        
        // Reset color
        timerDisplay.style.color = '#2c3e50';
        timerDisplay.classList.remove('timer-complete');
    }
    
    // Set the maximum time based on user input
    function setMaxTime() {
        // Get values from inputs
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        
        // Calculate total seconds
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        
        // Validate input
        if (totalSeconds <= 0) {
            alert('Please enter a valid time (greater than 0 seconds).');
            return;
        }
        
        if (totalSeconds > 24 * 3600) { // More than 24 hours
            alert('Maximum time cannot exceed 24 hours.');
            return;
        }
        
        // If timer is running, pause it before changing max time
        const wasRunning = isRunning;
        if (wasRunning) {
            pauseTimer();
        }
        
        // Set the new maximum time
        const oldMaxTime = maxTime;
        maxTime = totalSeconds;
        
        // Adjust current elapsed time if it exceeds new max time
        if (timeElapsed > maxTime) {
            timeElapsed = maxTime;
        } else {
            // Adjust the progress percentage to match new max time
            const progress = timeElapsed / oldMaxTime;
            timeElapsed = Math.floor(progress * maxTime);
        }
        
        // Update pausedTime if timer was paused
        if (isPaused) {
            pausedTime = timeElapsed;
        }
        
        // Update displays
        updateTimerDisplay();
        updateMaxTimeDisplay();
        updateProgressRing();
        
        // If it was running before, start it again
        if (wasRunning) {
            startTimer();
        }
        
        // Show confirmation message
        showNotification(`Maximum time set to ${formatTime(maxTime)}`);
    }
    
    // Show notification message
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2ecc71;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Format time in seconds to HH:MM:SS
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
    
    // Update current year in footer
    function updateCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }
    
    // Validate inputs to ensure reasonable values
    function validateInputs() {
        // Validate hours (0-23)
        let hours = parseInt(hoursInput.value) || 0;
        if (hours < 0) hours = 0;
        if (hours > 23) hours = 23;
        hoursInput.value = hours;
        
        // Validate minutes (0-59)
        let minutes = parseInt(minutesInput.value) || 0;
        if (minutes < 0) minutes = 0;
        if (minutes > 59) minutes = 59;
        minutesInput.value = minutes;
        
        // Validate seconds (0-59)
        let seconds = parseInt(secondsInput.value) || 0;
        if (seconds < 0) seconds = 0;
        if (seconds > 59) seconds = 59;
        secondsInput.value = seconds;
    }
    
    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    setTimeBtn.addEventListener('click', setMaxTime);
    
    // Validate inputs on change
    hoursInput.addEventListener('change', validateInputs);
    minutesInput.addEventListener('change', validateInputs);
    secondsInput.addEventListener('change', validateInputs);
    
    // Allow Enter key to set time
    hoursInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            setMaxTime();
        }
    });
    
    minutesInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            setMaxTime();
        }
    });
    
    secondsInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            setMaxTime();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Spacebar to start/pause (but not when focused on inputs)
        if (event.code === 'Space' && !event.target.matches('input')) {
            event.preventDefault(); // Prevent page scroll
            if (isRunning) {
                pauseTimer();
            } else if (timeElapsed < maxTime) {
                startTimer();
            }
        }
        
        // 'R' key to reset (but not when focused on inputs)
        if (event.code === 'KeyR' && !event.ctrlKey && !event.target.matches('input')) {
            resetTimer();
        }
        
        // 'S' key to set time (but not when focused on inputs)
        if (event.code === 'KeyS' && !event.ctrlKey && !event.target.matches('input')) {
            event.preventDefault();
            setMaxTime();
        }
    });
    
    // Initialize the timer when page loads
    initTimer();
});