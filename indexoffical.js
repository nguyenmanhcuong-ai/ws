const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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
    // Convert the message to a string
    const receivedMessage = String(message);

    if (!clientName) {
      // Set the client's name and inform all clients
      clientName = receivedMessage.trim();
      broadcast(`${clientName} has joined the chat.`);
    } else {
      // Check if the message is an edit or delete request
      if (receivedMessage.startsWith('/edit ')) {
        // Extract the edited message and handle it
        const editedMessage = receivedMessage.substring('/edit '.length);
        editMessage(editedMessage);
      } else if (receivedMessage.startsWith('/delete')) {
        // Handle delete request
        deleteLastMessage();
      } else {
        // Regular message, store it and broadcast with sender's name
        const messageWithSender = `${clientName}: ${receivedMessage}`;
        clientMessages.push(messageWithSender);
        broadcast(messageWithSender);
      }
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

  // Function to edit the last message sent by the client
  function editMessage(editedMessage) {
    if (clientMessages.length > 0) {
      // Replace the last message with the edited one
      const lastMessage = clientMessages.pop();
      const editedWithSender = `${clientName}: ${editedMessage}`;
      clientMessages.push(editedWithSender);
      broadcast(`* ${clientName} edited their message: ${lastMessage} to ${editedWithSender}`);
    }
  }

  // Function to delete the last message sent by the client
  function deleteLastMessage() {
    if (clientMessages.length > 0) {
      // Remove the last message and broadcast the deletion
      const deletedMessage = clientMessages.pop();
      broadcast(`* ${clientName} deleted their message`);
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
