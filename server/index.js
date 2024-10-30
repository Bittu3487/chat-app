// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');// PostgreSQL connection file

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://chat-app-22xy.vercel.app/',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user joining a room
    socket.on('joinRoom', async (room) => {
        socket.join(room);
        try {
            // Load previous messages from the room
            const result = await pool.query('SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC', [room]);
            socket.emit('loadMessages', result.rows); // Send chat history to the new user
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    });

    // Handle sending messages
    socket.on('message', async ({ room, username, text }) => {
        try {
            // Save the message to the database
            const result = await pool.query(
                'INSERT INTO messages (username, room, text) VALUES ($1, $2, $3) RETURNING *',
                [username, room, text]
            );

            // Broadcast the message to everyone in the room
            io.to(room).emit('message', result.rows[0]);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(5000, () => console.log('Server running on port 5000'));
