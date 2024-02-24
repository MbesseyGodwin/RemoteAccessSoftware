const io = require('socket.io-client');
const fs = require('fs');

// Connect to the server
const socket = io.connect('http://localhost:3000', {
    auth: { username: 'user', password: 'password' } // Authentication credentials
});

// Listen for 'screen' event from server
socket.on('screen', (data) => {
    console.log('Received screen capture from server');
    // Display the received screen capture (e.g., update the UI with the image)
});

// Listen for 'input' event from server
socket.on('input', (data) => {
    console.log('Received input from server:', data);
    // Handle input events received from the server
    // Example: simulate mouse clicks or keyboard input
});

// Send input events to the server
const inputEvent = { type: 'click', coordinates: { x: 100, y: 100 } };
socket.emit('input', inputEvent);

// Read file data from a file on the client side
const filePath = 'file_to_send.txt';
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Send file data to the server
    socket.emit('fileData', data);
});

// Listen for confirmation from the server that the file was saved successfully
socket.on('fileSaved', (message) => {
    console.log(message);
});

// Listen for error from the server
socket.on('fileError', (errorMessage) => {
    console.error('Error from server:', errorMessage);
});
