// Reference to the Firebase database
const db = firebase.database().ref('messages');

// Function to load messages from Firebase
function loadMessages() {
  db.on('child_added', function(snapshot) {
    const message = snapshot.val();
    displayMessage(message.username, message.text, message.imageUrl, snapshot.key); // Pass message key
  });
}

// Function to display messages in the chat box
function displayMessage(username, text, imageUrl, messageId) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const user = firebase.auth().currentUser;
  const currentUser = localStorage.getItem('full_name');

  // Create message HTML
  messageElement.innerHTML = `
    <strong>${username}</strong>: ${text}
    <button class="delete-button" id="delete-${messageId}" style="display: none;" onclick="handleDelete('${messageId}', '${username}')">Delete</button>
  `;

  // If an image URL exists, display the image; otherwise, display the text message
  if (imageUrl) {
    messageElement.innerHTML += `<img src="${imageUrl}" alt="Image" class="chat-image">`;
  }

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message

  // Add click event to toggle delete button visibility
  messageElement.addEventListener('click', function() {
    // Show delete button if the current user is the sender
    if (currentUser === username) {
      const deleteButton = document.getElementById(`delete-${messageId}`);
      deleteButton.style.display = deleteButton.style.display === 'none' ? 'inline' : 'none';
    }
  });
}

// Function to handle delete message
function handleDelete(messageId, messageSender) {
  const currentUser = localStorage.getItem('full_name');

  if (currentUser === messageSender) {
    // Ask for confirmation
    if (confirm("Do you want to permanently delete this message?")) {
      // Update message to indicate it has been deleted
      db.child(messageId).update({
        text: "This message has been deleted",
        imageUrl: null // Optionally remove the image URL if any
      });
    }
  } else {
    alert("You can't delete someone else's message.");
  }
}

// Function to send text messages
function sendMessage(content, imageUrl = null) {
  const user = firebase.auth().currentUser;

  if (!content.trim() && !imageUrl) {
    alert('Message cannot be empty');
    return;
  }

  if (user) {
    const username = localStorage.getItem('full_name');
    if (username) {
      db.push({
        username: username,
        text: content,
        imageUrl: imageUrl,
        timestamp: Date.now()
      });

      // Clear the input field for text messages
      if (content) {
        document.getElementById('message').value = '';
      }
    } else {
      alert("Full name not found!");
    }
  } else {
    alert('You need to log in to send a message.');
  }
}

// Load existing messages when the user opens the chat page
window.onload = function() {
  loadMessages();
};

// Send button event listener
document.getElementById('send-button').addEventListener('click', function() {
  const content = document.getElementById('message').value;
  sendMessage(content); // Send text message
});

// Send message on Enter key press
document.getElementById('message').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const content = document.getElementById('message').value;
    sendMessage(content); // Send text message
  }
});


// Function to handle image upload
function uploadImage(event) {
  const file = event.target.files[0]; 
  if (!file) { 
    return; 
  }

  const reader = new FileReader(); 
  reader.onload = (e) => { 
    // Optionally, show a preview of the image 
    document.getElementById('imagePreview').src = e.target.result; 
  }; 

  reader.readAsDataURL(file); 

  const storageRef = firebase.storage().ref(); 
  const uploadTask = storageRef.child('images/' + file.name).put(file); 

  uploadTask.on('state_changed', 
    (snapshot) => {
      // Optionally, handle upload progress
    }, 
    (error) => {
      // Handle errors
      console.error("Image upload failed:", error); 
    }, 
    () => {
      // Upload complete
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        // Send the image URL as a message 
        sendMessage("", downloadURL); 
      }); 
    }
  ); 
}

    const chatContainer = document.getElementById("chat-container");
    const popup = document.getElementById("popup");
    const youtubeVideo = document.getElementById("youtube-video");

    // Regular expression to match YouTube links
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/)?(?:watch\?v=|embed\/))([^\?&]+)/;

    function openPopup(videoId) {
      popup.style.display = "block";
      youtubeVideo.src = `https://www.youtube.com/embed/${videoId}`;
    }

    function closePopup() {
      popup.style.display = "none";
      youtubeVideo.src = ""; // Clear the iframe source
    }

    // Example chat messages (replace with your actual chat logic)

    // Display chat messages and make links clickable
    chatMessages.forEach(message => {
      const messageElement = document.createElement("p");
      messageElement.textContent = message;

      // Find YouTube links in the message
      const match = message.match(youtubeRegex);
      if (match) {
        const videoId = match[1];
        const linkElement = document.createElement("a");
        linkElement.href = "#"; // Prevent default link behavior
        linkElement.textContent = message;
        linkElement.onclick = () => openPopup(videoId);
        messageElement.appendChild(linkElement);
      }

      chatContainer.appendChild(messageElement);
    });
