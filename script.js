
        let interval;
        let totalSeconds = 0;
        let originalSeconds = 0;
        let isRunning = false;
        let hasCompleted = false;
        let loopCount = 0;

        const hoursInput = document.getElementById('hours');
        const minutesInput = document.getElementById('minutes');
        const secondsInput = document.getElementById('seconds');
        const display = document.getElementById('display');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const status = document.getElementById('status');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        const loopCountDisplay = document.getElementById('loopCount');
        const beepBtn = document.getElementById('beepBtn');
        const customBtn = document.getElementById('customBtn');
        const fileUploadSection = document.getElementById('fileUploadSection');
        const soundFile = document.getElementById('soundFile');
        const fileName = document.getElementById('fileName');
        const testSoundBtn = document.getElementById('testSound');

        let useCustomSound = false;
        let customAudio = null;

        // PiP Widget elements
        const pipWidget = document.getElementById('pipWidget');
        const pipClose = document.getElementById('pipClose');
        const pipDisplay = document.getElementById('pipDisplay');
        const pipLoopCount = document.getElementById('pipLoopCount');
        const pipStartBtn = document.getElementById('pipStartBtn');
        const pipStopBtn = document.getElementById('pipStopBtn');
        const pipResetBtn = document.getElementById('pipResetBtn');
        const pipStatus = document.getElementById('pipStatus');
        let isPipVisible = false;

        // Load saved settings from localStorage on startup
        function loadSavedSettings() {
            // Load custom sound preference
            const savedSoundPreference = localStorage.getItem('timerSoundPreference');
            if (savedSoundPreference === 'custom') {
                useCustomSound = true;
                customBtn.classList.add('active');
                beepBtn.classList.remove('active');
                fileUploadSection.style.display = 'block';
            }

            // Load saved custom sound
            const savedSound = localStorage.getItem('timerCustomSound');
            const savedSoundName = localStorage.getItem('timerCustomSoundName');
            if (savedSound && savedSoundName) {
                customAudio = new Audio(savedSound);
                fileName.textContent = '✓ ' + savedSoundName + ' (saved)';
            }

            // Load volume preference
            const savedVolume = localStorage.getItem('timerVolume');
            if (savedVolume) {
                volumeSlider.value = savedVolume;
                volumeValue.textContent = savedVolume + '%';
            }
        }

        // Create beep sound using Web Audio API
        function playBeep() {
            if (useCustomSound && customAudio) {
                // Play custom sound
                const audio = customAudio.cloneNode();
                audio.volume = volumeSlider.value / 100;
                audio.play().catch(err => console.error('Error playing custom sound:', err));
            } else {
                // Play default beep
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                const volume = volumeSlider.value / 100;
                gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            }
        }

        function updateDisplay() {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            const timeString = 
                String(h).padStart(2, '0') + ':' +
                String(m).padStart(2, '0') + ':' +
                String(s).padStart(2, '0');

            display.textContent = timeString;
            pipDisplay.textContent = timeString;
            
            // Update page title with time
            document.title = isRunning ? `⏰ ${timeString} - Looping Timer` : 'Looping Timer';
        }

        function startTimer() {
            if (!isRunning) {
                if (!hasCompleted) {
                    // First time starting
                    const h = parseInt(hoursInput.value) || 0;
                    const m = parseInt(minutesInput.value) || 0;
                    const s = parseInt(secondsInput.value) || 0;
                    
                    originalSeconds = h * 3600 + m * 60 + s;
                    totalSeconds = originalSeconds;

                    if (totalSeconds === 0) {
                        alert('Please set a time greater than 0!');
                        return;
                    }
                }

                isRunning = true;
                startBtn.disabled = true;
                stopBtn.disabled = false;
                hoursInput.disabled = true;
                minutesInput.disabled = true;
                secondsInput.disabled = true;

                status.textContent = hasCompleted ? '🔄 Looping...' : '⏱️ Timer running...';
                status.className = hasCompleted ? 'status looping' : 'status active';

                interval = setInterval(() => {
                    totalSeconds--;

                    if (totalSeconds < 0) {
                        // Timer completed
                        playBeep();
                        loopCount++;
                        loopCountDisplay.textContent = loopCount;
                        hasCompleted = true;
                        totalSeconds = originalSeconds; // Reset to original time
                        status.textContent = '🔄 Looping...';
                        status.className = 'status looping';
                    }

                    updateDisplay();
                }, 1000);
            }
        }

        function stopTimer() {
            isRunning = false;
            clearInterval(interval);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            status.textContent = 'Timer stopped';
            status.className = 'status';
        }

        function resetTimer() {
            stopTimer();
            hasCompleted = false;
            loopCount = 0;
            loopCountDisplay.textContent = '0';
            hoursInput.disabled = false;
            minutesInput.disabled = false;
            secondsInput.disabled = false;
            hoursInput.value = 0;
            minutesInput.value = 1;
            secondsInput.value = 0;
            totalSeconds = 60;
            updateDisplay();
            status.textContent = '';
            status.className = 'status';
        }

        // Update display when inputs change
        [hoursInput, minutesInput, secondsInput].forEach(input => {
            input.addEventListener('input', () => {
                if (!isRunning) {
                    const h = parseInt(hoursInput.value) || 0;
                    const m = parseInt(minutesInput.value) || 0;
                    const s = parseInt(secondsInput.value) || 0;
                    totalSeconds = h * 3600 + m * 60 + s;
                    updateDisplay();
                }
            });
        });

        startBtn.addEventListener('click', startTimer);
        stopBtn.addEventListener('click', stopTimer);
        resetBtn.addEventListener('click', resetTimer);

        // Volume slider update
        volumeSlider.addEventListener('input', () => {
            const volume = volumeSlider.value;
            volumeValue.textContent = volume + '%';
            localStorage.setItem('timerVolume', volume);
        });

        // Sound selection buttons
        beepBtn.addEventListener('click', () => {
            useCustomSound = false;
            beepBtn.classList.add('active');
            customBtn.classList.remove('active');
            fileUploadSection.style.display = 'none';
            localStorage.setItem('timerSoundPreference', 'beep');
        });

        customBtn.addEventListener('click', () => {
            useCustomSound = true;
            customBtn.classList.add('active');
            beepBtn.classList.remove('active');
            fileUploadSection.style.display = 'block';
            localStorage.setItem('timerSoundPreference', 'custom');
        });

        // File upload handler
        soundFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('audio/')) {
                    alert('Please select an audio file!');
                    return;
                }
                
                // Check file size (limit to 5MB for localStorage)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File is too large! Please choose a file smaller than 5MB.');
                    return;
                }
                
                fileName.textContent = '⏳ Loading ' + file.name + '...';
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const audioData = event.target.result;
                    customAudio = new Audio(audioData);
                    
                    // Save to localStorage
                    try {
                        localStorage.setItem('timerCustomSound', audioData);
                        localStorage.setItem('timerCustomSoundName', file.name);
                        fileName.textContent = '✓ ' + file.name + ' (saved)';
                    } catch (e) {
                        if (e.name === 'QuotaExceededError') {
                            alert('Storage quota exceeded! Try a smaller audio file.');
                            fileName.textContent = '✗ File too large for storage';
                        } else {
                            console.error('Error saving to localStorage:', e);
                            fileName.textContent = '✗ Error saving file';
                        }
                    }
                };
                reader.onerror = () => {
                    alert('Error reading file!');
                    fileName.textContent = '✗ Error loading file';
                };
                reader.readAsDataURL(file);
            }
        });

        // Test sound button
        testSoundBtn.addEventListener('click', () => {
            playBeep();
        });

        // Load saved settings when page loads
        loadSavedSettings();

        // Initialize display
        updateDisplay();
