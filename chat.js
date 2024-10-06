// Reference to the Firebase database
const db = firebase.database().ref('messages');

// Monitor user authentication state
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User is logged in:", user.displayName);
  } else {
    console.log("No user is logged in.");
    alert("You need to log in to participate in the chat.");
  }
});

// Function to load and display messages
function loadMessages() {
  try {
    db.on('value', function(snapshot) {
      const chatBox = document.getElementById('chat-box');
      chatBox.innerHTML = ''; // Clear previous messages

      snapshot.forEach(function(childSnapshot) {
        const message = childSnapshot.val();
        displayMessage(message.username, message.text, message.imageUrl, childSnapshot.key);
      });
    });
  } catch (error) {
    console.error("Error loading messages:", error);
    alert("An error occurred while loading messages. Please try again later.");
  }
}

// Function to display messages in the chat box
function displayMessage(username, text, imageUrl, messageId) {
  try {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const currentUser = localStorage.getItem('full_name');

    // Create message HTML
    messageElement.innerHTML = `
      <div class="message-content">
        <strong>${username}</strong>: ${text}
      </div>
      <button class="delete-button" id="delete-${messageId}" style="display: none;" onclick="handleDelete('${messageId}', '${username}')">Delete</button>
    `;

    // Display image if available
    if (imageUrl) {
      messageElement.innerHTML += `<img src="${imageUrl}" alt="Image" class="chat-image">`;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message

    // Toggle delete button visibility based on the current user
    messageElement.addEventListener('click', function() {
      if (currentUser === username) {
        const deleteButton = document.getElementById(`delete-${messageId}`);
        deleteButton.style.display = deleteButton.style.display === 'none' ? 'inline' : 'none';
      }
    });
  } catch (error) {
    console.error("Error displaying message:", error);
    alert("An error occurred while displaying messages.");
  }
}

// Function to delete a message
function handleDelete(messageId, messageSender) {
  const currentUser = localStorage.getItem('full_name');
  
  if (currentUser === messageSender) {
    if (confirm("Do you want to permanently delete this message?")) {
      try {
        db.child(messageId).update({
          text: "This message has been deleted",
          imageUrl: null // Optionally remove the image URL
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("An error occurred while deleting the message. Please try again.");
      }
    }
  } else {
    alert("You can't delete someone else's message.");
  }
}

// Function to send messages (text or image)
function sendMessage(content, imageUrl = null) {
  const user = firebase.auth().currentUser;

  if (!content.trim() && !imageUrl) {
    alert('Message cannot be empty');
    return;
  }

  if (user) {
    const username = localStorage.getItem('full_name');
    if (username) {
      try {
        db.push({
          username: username,
          text: content,
          imageUrl: imageUrl,
          timestamp: Date.now()
        });

        // Clear the input field after sending
        document.getElementById('message').value = ''; 
      } catch (error) {
        console.error("Error sending message:", error);
        alert("An error occurred while sending your message. Please try again.");
      }
    } else {
      alert("Full name not found! Please set your name.");
    }
  } else {
    alert('You need to log in to send a message.');
  }
}

// Image upload function with error handling
function uploadImage(event) {
  const file = event.target.files[0]; 
  if (!file) { 
    alert('No file selected.');
    return; 
  }

  const reader = new FileReader(); 
  reader.onload = (e) => { 
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
      console.error("Image upload failed:", error); 
      alert("An error occurred while uploading the image. Please try again.");
    }, 
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        sendMessage("", downloadURL); 
      }).catch((error) => {
        console.error("Error getting download URL:", error);
        alert("An error occurred while retrieving the image URL.");
      });
    }
  ); 
}

// Send message on Enter key press with error handling
document.getElementById('message').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    try {
      const content = document.getElementById('message').value;
      sendMessage(content);
    } catch (error) {
      console.error("Error handling 'Enter' key event:", error);
      alert("An error occurred while trying to send the message.");
    }
  }
});

// Load existing messages on page load with error handling
window.onload = function() {
  try {
    loadMessages();
  } catch (error) {
    console.error("Error initializing the chat:", error);
    alert("An error occurred while loading the chat. Please refresh the page.");
  }
};
