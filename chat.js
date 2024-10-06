// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the Firebase Realtime Database
const dbRef = firebase.database().ref('messages');
const storageRef = firebase.storage().ref('uploads');

// DOM Elements
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send-button');
const chatBox = document.getElementById('chat-box');
const attachIcon = document.getElementById('attach-icon');
const imageInput = document.getElementById('image-input');
const popup = document.getElementById('popup');
const youtubeVideo = document.getElementById('youtube-video');

// Listen for new messages in the chat room
dbRef.on('child_added', (snapshot) => {
  const messageData = snapshot.val();
  displayMessage(messageData);
});

// Send text messages
sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message) {
    const messageData = {
      text: message,
      timestamp: Date.now(),
      type: 'text'
    };
    dbRef.push(messageData);
    messageInput.value = ''; // Clear input
  }
});

// Display message in chat box
function displayMessage(messageData) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  if (messageData.type === 'text') {
    messageElement.innerText = messageData.text;
  } else if (messageData.type === 'image') {
    const img = document.createElement('img');
    img.src = messageData.url;
    img.alt = 'Attached image';
    img.style.maxWidth = '100%';
    messageElement.appendChild(img);
  } else if (messageData.type === 'video') {
    const link = document.createElement('a');
    link.href = '#';
    link.innerText = 'Watch Video';
    link.onclick = () => showPopup(messageData.url);
    messageElement.appendChild(link);
  }

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Upload image
function uploadImage(event) {
  const file = event.target.files[0];
  if (file) {
    const fileName = Date.now() + '-' + file.name;
    const fileRef = storageRef.child(fileName);

    fileRef.put(file).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {
        const messageData = {
          url: url,
          timestamp: Date.now(),
          type: 'image'
        };
        dbRef.push(messageData);
      });
    });
  }
}

// Show YouTube video popup
function showPopup(videoUrl) {
  youtubeVideo.src = videoUrl;
  popup.style.display = 'block';
}

// Close YouTube video popup
function closePopup() {
  youtubeVideo.src = ''; // Stop the video
  popup.style.display = 'none';
}

// Allow sending messages with Enter key
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});
