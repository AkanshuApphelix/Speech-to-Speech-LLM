// Access webcam feed
const webcam = document.getElementById('webcam');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { webcam.srcObject = stream; })
    .catch(error => console.error('Webcam access denied:', error));

// Chat container for displaying messages
const chatContainer = document.getElementById('chat-container');

// Get references to the necessary HTML elements
const recordBtn = document.getElementById('record-btn');
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');

// Check if the Web Speech API is supported
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Event listener for when the user starts recording
    recordBtn.addEventListener('click', () => {
        if (recordBtn.classList.contains('recording')) {
            // Stop recording
            recognition.stop();
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        } else {
            // Start recording
            recognition.start();
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
    });

    // Event listener for speech recognition results
    recognition.addEventListener('result', (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        userInput.value = transcript;
    });
} else {
    // Display an error message if the API is not supported
    userInput.placeholder = 'Voice input not supported in this browser';
    recordBtn.disabled = true;
}

// Function to handle user input
function handleUserInput() {
    const userInputValue = userInput.value;
    if (!userInputValue.trim()) return;

    // Display user's message
    addMessage(userInputValue, 'user');

    // Send to backend (Python server) and get response
    fetch('/process_input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInputValue })
    })
    .then(response => response.json())
    .then(data => {
        const botMessage = data.response;
        addMessage(botMessage, 'bot');

        // Decode base64 audio data and play it
        const audioBase64 = data.audio_data;
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    })
    .catch(error => console.error('Error:', error));

    // Clear input
    userInput.value = '';
}

// Function to add message to chat container
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to latest message
}

// Add an event listener to the "Send" button
submitBtn.addEventListener('click', handleUserInput);
