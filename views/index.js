<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebSocket Chat</title>
  <link rel="stylesheet" href="/style.css">
  <style>
    /* Style the buttons within the edit-delete-buttons class */
    .edit-delete-buttons button {
      font-size: smaller;
      font-style: italic;
      margin-left: 5px;
      cursor: pointer;
      background: none; /* Remove the background color */
      border: none; /* Remove the border */
      padding: 0; /* Remove padding */
      color: inherit; /* Inherit the text color from the parent element */
    }
  
    .edit-delete-buttons button:hover {
      text-decoration: underline;
      color: rgb(140, 140, 140);
    }
  
    /* Add a class for the message container */
    .message-container {
      position: relative;
    }
  
    /* Add a class for the edit and delete buttons */
    .edit-delete-buttons {
      position: absolute;
      top: 0;
      right: 0;
      font-style: italic;
    }
  </style>
    </style>
</head>
<body>
  <div id="name-container">
    <label for="name">Your Name:</label>
    <input type="text" id="name" />
    <button onclick="submitName()">Submit</button>
  </div>
  <div id="chat-container" style="display: none;">
    <label for="message">Message:</label>
    <input type="text" id="message" />
    <button onclick="sendMessage()">Send</button>
    <ul id="chat"></ul>
  </div>

  <script>
    const socket = new WebSocket('ws://' + window.location.host);
    let clientName;

    function submitName() {
      const nameInput = document.getElementById('name');
      clientName = nameInput.value.trim();

      if (clientName !== '') {
        document.getElementById('name-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
        socket.send(clientName);
      }
    }

    function sendMessage() {
      const messageInput = document.getElementById('message');
      const message = messageInput.value;
      if (message.trim() !== '') {
        socket.send(message);
        messageInput.value = '';
      }
    }

    function editMessage(li, message) {
      // Kiểm tra xem message có phải là của người gửi không
      const isMyMessage = li.querySelector('span').textContent === clientName;

      if (!isMyMessage) {
        alert('You can only edit your own messages.');
        return;
      }

      const editedMessage = prompt('Edit your message:', message);

      if (editedMessage !== null && editedMessage.trim() !== '') {
        li.innerHTML = `<span style="font-weight: bold;">${clientName}:</span> ${editedMessage}`;

        const editContainer = document.createElement('div');
        editContainer.classList.add('edit-delete-buttons');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editMessage(li, editedMessage);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteMessage(li);

        editContainer.appendChild(editButton);
        editContainer.appendChild(deleteButton);

        li.appendChild(editContainer);

        const messageInput = document.getElementById('message');
        messageInput.value = `/edit ${editedMessage}`;
        sendMessage();
      }
    }

    function deleteMessage(li) {
      // Kiểm tra xem message có phải là của người gửi không
      const isMyMessage = li.querySelector('span').textContent === clientName;

      if (!isMyMessage) {
        alert('You can only delete your own messages.');
        return;
      }

      const confirmation = window.confirm('Do you want to delete this message?');

      if (confirmation) {
        const chat = document.getElementById('chat');
        chat.removeChild(li);

        const messageInput = document.getElementById('message');
        messageInput.value = '/delete';
        sendMessage();
      }
    }

    socket.addEventListener('message', (event) => {
            const chat = document.getElementById('chat');
            const li = document.createElement('li');

            const parts = event.data.split(':');

            if (parts.length === 2) {
                const nameSpan = document.createElement('span');
                nameSpan.style.fontWeight = 'bold';
                nameSpan.textContent = parts[0];

                li.appendChild(nameSpan);
                li.appendChild(document.createTextNode(`: ${parts[1]}`));

                if (parts[0] === clientName) {
                    // Nếu tin nhắn là của người gửi hiện tại, thêm nút Edit và Delete
                    const editContainer = document.createElement('div');
                    editContainer.classList.add('edit-delete-buttons');

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.onclick = () => editMessage(li, parts[1]);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => deleteMessage(li);

                    editContainer.appendChild(editButton);
                    editContainer.appendChild(deleteButton);

                    li.appendChild(editContainer);
                }
            } else {
                li.textContent = event.data;
            }

            li.classList.add('message-container');
            chat.appendChild(li);
        });
  </script>
</body>
</html>
