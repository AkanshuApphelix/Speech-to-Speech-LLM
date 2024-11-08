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
        if (recordBtn.textContent === 'Start Recording') {
            recognition.start();
            recordBtn.textContent = 'Stop Recording';
        } else {
            recognition.stop();
            recordBtn.textContent = 'Start Recording';
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
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    // Display user's message
    addMessage(userInput, 'user');

    // Send to backend (Python server) and get response
    fetch('/process_input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput })
    })
    .then(response => response.json())
    .then(data => {
        const botMessage = data.response;
        addMessage(botMessage, 'bot');

        // Play audio response
        const audio = new Audio(data.audio_url);
        audio.play();
    })
    .catch(error => console.error('Error:', error));

    // Clear input
    document.getElementById('user-input').value = '';
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