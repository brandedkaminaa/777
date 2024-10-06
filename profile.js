// Reference to the profile button
const profileButton = document.getElementById('profileButton');
// Reference to the user info div
const userInfo = document.getElementById('user-info');

// Firebase Authentication: Fetch the logged-in user's info
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, you can access their details
    const userEmail = user.email;
    const userId = user.uid;

    // Assuming you have user details in the Firebase Realtime Database
    const userRef = firebase.database().ref('users/' + userId);
    userRef.once('value').then((snapshot) => {
      const userData = snapshot.val();

      // Populate the user info section
      document.getElementById('user-email').innerText = userEmail;
      
      // Full Name - check if it exists, otherwise hide or show a default text
      if (userData && userData.full_name) {
        document.getElementById('user-fullname').innerText = userData.full_name;
      } else {
        document.getElementById('user-fullname').innerText = 'Full Name not set';
      }

      // Favourite Song - check if it exists, otherwise hide or show a default text
      if (userData && userData.favourite_song) {
        document.getElementById('user-song').innerText = userData.favourite_song;
      } else {
        document.getElementById('user-song').innerText = 'No favorite song';
      }

      // Milk Before Cereal - check if it exists, otherwise hide or show a default text
      if (userData && userData.milk_before_cereal) {
        document.getElementById('user-milk').innerText = userData.milk_before_cereal;
      } else {
        document.getElementById('user-milk').innerText = 'Not answered';
      }

      // Last Login - from Firebase Authentication metadata
      document.getElementById('user-last-login').innerText = user.metadata.lastSignInTime || 'Unknown';
    });
  } else {
    // User is signed out, hide the user info section
    userInfo.style.display = 'none';
  }
});

// Event listener to toggle user info visibility
profileButton.addEventListener('click', () => {
  if (userInfo.style.display === 'none' || userInfo.style.display === '') {
    userInfo.style.display = 'flex'; // Show user info
  } else {
    userInfo.style.display = 'none'; // Hide user info
  }
});
