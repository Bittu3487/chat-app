import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Picker from 'emoji-picker-react';
import { format, isToday, isYesterday } from 'date-fns';


const socket = io.connect('https://chat-app-alpha-pied.vercel.app/?vercelToolbarCode=YqKM8TRJiWmdChF');

function App() {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username.trim() && room.trim()) {
            socket.emit('joinRoom', room);
            setIsLoggedIn(true);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const timestamp = new Date().toISOString();
            socket.emit('message', { room, username, text: message, timestamp });
            setMessage('');
        }
    };
    const getDateLabel = (date) => {
        if (isToday(new Date(date))) return 'Today';
        if (isYesterday(new Date(date))) return 'Yesterday';
        return format(new Date(date), 'MMMM dd, yyyy'); // for other dates
    };


    const handleEmojiClick = (emojiObject) => {
        setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    };

    useEffect(() => {
        socket.on('loadMessages', (messages) => {
            setChat(messages);
        });

        socket.on('message', (msg) => {
            setChat((prevChat) => {
                if (!prevChat.some((m) => m.id === msg.id)) {
                    return [...prevChat, msg];
                }
                return prevChat;
            });
        });
    }, []);

    return (
        <div className="container">
            {!isLoggedIn ? (
                <div className="container login-container d-flex flex-column align-items-center mt-5">
                    <form onSubmit={handleLogin} className="w-50 p-4 border rounded shadow">
                        <h3 className="text-center mb-4">Join Chat Room</h3>
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Enter room name"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary w-100">
                            Enter Chat
                        </button>
                    </form>
                </div>
            ) : (
                <div className="chat-container">
                    <h4>Room: {room}</h4>
                    <div className="chat-message">
                        {chat.reduce((acc, msg, index) => {
                            const msgDate = getDateLabel(msg.timestamp);
                            const prevDate = index > 0 ? getDateLabel(chat[index - 1].timestamp) : null;

                            // Insert date label if it's different from the previous message
                            if (msgDate !== prevDate) {
                                acc.push(
                                    <div key={`date-${msg.timestamp}`} className="date-label">
                                        {msgDate}
                                    </div>
                                );
                            }

                            acc.push(
                                <div key={msg.id} className={`message ${msg.username === username ? 'sender' : 'receiver'}`}>
                                    <strong>{msg.username}:</strong> {msg.text}
                                    <div className="message-time">
                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                    </div>
                                </div>
                            );

                            return acc;
                        }, [])}
                    </div>

                    <form onSubmit={sendMessage} className="fixed-bottom bg-light p-2 d-flex align-items-center">
                        <button
                            type="button"
                            className="btn btn-outline-secondary me-2"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div style={{ position: 'absolute', bottom: '60px' }}>
                                <Picker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter message"
                            className="form-control me-2"
                        />
                        <button type="submit" className="btn btn-success">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default App;
