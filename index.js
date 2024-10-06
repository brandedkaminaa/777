// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCphoH9_NPxSzgnh6kjXvPTlQdHOGkFGgQ",
  authDomain: "simple-project-de502.firebaseapp.com",
  databaseURL: "https://simple-project-de502-default-rtdb.firebaseio.com",
  projectId: "simple-project-de502",
  storageBucket: "simple-project-de502.appspot.com",
  messagingSenderId: "194813539682",
  appId: "1:194813539682:web:f5260ae96cde439c0f683b",
  measurementId: "G-HG982T31BL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Function to register a new user
function register() {
  // Get all input fields
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const full_name = document.getElementById('full_name').value; // Ensure this is correct
  const favourite_song = document.getElementById('favourite_song').value;
  const milk_before_cereal = document.getElementById('milk_before_cereal').value;

  // Validate input fields
  if (!validate_email(email) || !validate_password(password)) {
    alert('Email or Password is Outta Line!!');
    return;
  }
  if (!validate_field(full_name) || !validate_field(favourite_song) || !validate_field(milk_before_cereal)) {
    alert('One or More Extra Fields is Outta Line!!');
    return;
  }
  
  // Proceed with Firebase Authentication
  auth.createUserWithEmailAndPassword(email, password)
    .then(function() {
      const user = auth.currentUser;

      // Create user data
      const user_data = {
        email: email,
        full_name: full_name, // Store full_name directly
        favourite_song: favourite_song,
        milk_before_cereal: milk_before_cereal,
        last_login: Date.now()
      };

      // Store user data in Firebase Database
      database.ref('users/' + user.uid).set(user_data)
        .then(() => {
          alert('User Created!!');
          // Redirect to chat page (optional)
          // window.location.href = "chat.html";
        });
    })
    .catch(function(error) {
      // Handle registration errors
      alert(error.message);
    });
}

// Function to log in an existing user
function login() {
  // Get all our input fields
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate input fields
  if (!validate_email(email) || !validate_password(password)) {
    alert('Email or Password is Outta Line!!');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      const user = auth.currentUser;

      // Add this user to Firebase Database
      const database_ref = database.ref();

      // Create User data
      const user_data = {
        last_login: Date.now()
      };

      // Update last login time in Firebase Database
      database_ref.child('users/' + user.uid).update(user_data)
        .then(() => {
          // Retrieve the full name from the database
          return database.ref('users/' + user.uid).once('value');
        })
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userInfo = snapshot.val();
            const full_name = userInfo.full_name; // Correctly reference full_name
            localStorage.setItem('full_name', full_name); // Save full name in localStorage

            alert('User Logged In!!');
            // Redirect to the new page (e.g., chat.html)
            window.location.href = "chat.html";
          } else {
            alert("User data not found in database.");
          }
        });
    })
    .catch(function(error) {
      alert(error.message);
    });
}

// Validation Functions
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6; // Ensure password is at least 6 characters
}

function validate_field(field) {
  return field && field.trim().length > 0; // Check for non-empty fields
}
