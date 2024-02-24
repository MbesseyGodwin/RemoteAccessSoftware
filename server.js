// server.js file

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const robot = require('robotjs');
const fs = require('fs');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Store connected users

// Middleware to authenticate users
const authenticate = (socket, next) => {
    const { username, password } = socket.handshake.auth;
    // Validate username and password (e.g., check against a database)
    const isAuthenticated = true; // Simplified for demonstration
    if (isAuthenticated) {
        users[socket.id] = { username };
        console.log(`User ${username} authenticated`);
        next();
    } else {
        console.log(`User ${username} authentication failed`);
        socket.disconnect();
    }
};


// Middleware to handle screen capture
const captureScreen = () => {
    const screenSize = robot.getScreenSize();
    const bitmap = robot.screen.capture(0, 0, screenSize.width, screenSize.height);
    return bitmap.image;
};

// Listen for incoming connections
io.use(authenticate).on('connection', (socket) => {
    const { username } = users[socket.id];
    console.log(`User ${username} connected`);

    // Send screen capture to client
    socket.emit('screen', { screen: captureScreen() });

    // Middleware to handle file data from the client
    const handleFileData = (data) => {
        console.log(`Received file data from ${username}`);
        // Write the received file data to a file on the server
        fs.writeFile('downloaded_file.txt', data, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                // Notify the client about the error
                socket.emit('fileError', 'Error writing file');
            } else {
                console.log('File saved successfully');
                // Notify the client about successful file save
                socket.emit('fileSaved', 'File saved successfully');
            }
        });
    };

    // Listen for file data from the client
    socket.on('fileData', handleFileData);

    // Listen for input events from client
    socket.on('input', (data) => {
        console.log(`Received input from ${username}:`, data);
        // Handle input events (e.g., mouse clicks, keyboard input)
        // Example: if (data.type === 'click') { ... }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User ${username} disconnected`);
        delete users[socket.id];
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
