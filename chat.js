// Reference to the Firebase database
const db = firebase.database().ref('messages');

// Monitor user authentication state
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("User is logged in:", user.displayName);
  } else {
    console.log("No user is logged in.");
  }
});

// Function to load and display messages
function loadMessages() {
  db.on('value', function(snapshot) {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // Clear previous messages

    snapshot.forEach(function(childSnapshot) {
      const message = childSnapshot.val();
      displayMessage(message.username, message.text, message.imageUrl, childSnapshot.key);
    });
  });
}

// Function to display messages in the chat box
function displayMessage(username, text, imageUrl, messageId) {
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
}

// Function to delete a message
function handleDelete(messageId, messageSender) {
  const currentUser = localStorage.getItem('full_name');

  if (currentUser === messageSender) {
    if (confirm("Do you want to permanently delete this message?")) {
      db.child(messageId).update({
        text: "This message has been deleted",
        imageUrl: null // Optionally remove the image URL
      });
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
      db.push({
        username: username,
        text: content,
        imageUrl: imageUrl,
        timestamp: Date.now()
      });

      if (content) {
        document.getElementById('message').value = ''; // Clear text input
      }
    } else {
      alert("Full name not found!");
    }
  } else {
    alert('You need to log in to send a message.');
  }
}

// Detect and embed YouTube links
function detectYouTubeLink(message) {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  let match;
  let youtubeThumbnails = '';

  while ((match = youtubeRegex.exec(message)) !== null) {
    const videoId = match[1];
    youtubeThumbnails += `
      <div class="video">
        <img src="https://img.youtube.com/vi/${videoId}/default.jpg" class="video-thumb" onclick="openPopup('${videoId}')">
      </div>`;
  }

  return youtubeThumbnails || null;
}

// Function to send the message along with YouTube thumbnails (if detected)
const youtubeThumbnail = detectYouTubeLink(messages.message);
if (youtubeThumbnail) {
  messageContent += youtubeThumbnail;
}

// YouTube popup functionality
function openPopup(videoId) {
  const popup = document.getElementById("popup");
  const iframe = document.getElementById("popup-iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  popup.style.width = "200px"; 
  popup.style.height = "200px"; 
  popup.classList.remove("hidden");
}

function closePopup() {
  const popup = document.getElementById("popup");
  const iframe = document.getElementById("popup-iframe");
  iframe.src = "";
  popup.classList.add("hidden");
}

// Dragging the popup
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById("popup");
  const dragHandle = document.getElementById("drag-handle");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  dragHandle.addEventListener('mousedown', startDrag);
  dragHandle.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();

    isDragging = true;
    const startX = (e.type === 'touchstart') ? e.touches[0].clientX : e.clientX;
    const startY = (e.type === 'touchstart') ? e.touches[0].clientY : e.clientY;

    offsetX = popup.offsetLeft - startX;
    offsetY = popup.offsetTop - startY;

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      const currentX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
      const currentY = (e.type === 'touchmove') ? e.touches[0].clientY : e.clientY;

      popup.style.left = (currentX + offsetX) + 'px';
      popup.style.top = (currentY + offsetY) + 'px';
    }
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
  }
});

// Image upload function
function uploadImage(event) {
  const file = event.target.files[0]; 
  if (!file) { 
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
      // Handle upload progress if needed
    }, 
    (error) => {
      console.error("Image upload failed:", error); 
    }, 
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        sendMessage("", downloadURL); 
      }); 
    }
  ); 
}

// Send message on Enter key press
document.getElementById('message').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const content = document.getElementById('message').value;
    sendMessage(content);
  }
});

// Load existing messages on page load
window.onload = function() {
  loadMessages();
};
