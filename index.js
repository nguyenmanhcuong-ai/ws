const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const BinaryServer = require('binaryjs').BinaryServer;
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const binaryServer = new BinaryServer({ server: server, path: '/binary-endpoint' });

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Render the EJS file
app.get('/', (req, res) => {
  res.render('index');
});

// WebSocket server
wss.on('connection', (ws) => {
  let clientName;

  // Store messages with sender's name for each client
  const clientMessages = [];

  // Listen for the client's name
  ws.on('message', (message) => {
    const receivedMessage = String(message);

    if (!clientName) {
      clientName = receivedMessage.trim();
      broadcast(`${clientName} has joined the chat.`);
    } else {
      // Regular message, store it and broadcast with sender's name
      const messageWithSender = `${clientName}: ${receivedMessage}`;
      clientMessages.push(messageWithSender);
      broadcast(messageWithSender);
    }
  });

  // Connection closed
  ws.on('close', () => {
    console.log('Client disconnected');
    // Notify all clients when someone leaves the chat
    if (clientName) {
      broadcast(`${clientName} has left the chat.`);
    }
  });

  // Function to broadcast a message to all clients
  function broadcast(message) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});

// Binary Server for voice chat
binaryServer.on('stream', (client, stream) => {
  // Broadcast the voice stream to other clients
  broadcastVoice(stream);
});

function broadcastVoice(stream) {
  binaryServer.clients.forEach((client) => {
    if (client !== null && client !== undefined && client !== stream.client) {
      const sendStream = client.createStream({ highWaterMark: 16 * 1024 });
      stream.pipe(sendStream);
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
