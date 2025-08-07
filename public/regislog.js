import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqNpEcm-VLu7ir3gQlz1nRSSFCsi62e1g",
  authDomain: "radioissuelog-webapp.firebaseapp.com",
  projectId: "radioissuelog-webapp",
  storageBucket: "radioissuelog-webapp.firebasestorage.app",
  messagingSenderId: "230850078468",
  appId: "1:230850078468:web:ac079a8d2ccbebb06c9251",
  measurementId: "G-WL0GVXF77M",
};

const app = initializeApp(firebaseConfig);

let isSigningUp = false;

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
    messageDiv.style.display = "none";
  }, 3000);
}

const passwordInput = document.getElementById("Signpassword");
const letter = document.getElementById("letter");
const capital = document.getElementById("capital");
const number = document.getElementById("number");
const length = document.getElementById("length");

function validate() {
  const password = passwordInput.value;
  document.getElementById("passvalidate").style.display = "block";
  const lowerCaseLetters = /[a-z]/g;
  const hasLowerCase = password.match(lowerCaseLetters);
  letter.classList.toggle("valid", hasLowerCase);
  letter.classList.toggle("invalid", !hasLowerCase);

  const upperCaseLetters = /[A-Z]/g;
  const hasUpperCase = password.match(upperCaseLetters);
  capital.classList.toggle("valid", hasUpperCase);
  capital.classList.toggle("invalid", !hasUpperCase);

  const numbers = /[0-9]/g;
  const hasNumber = password.match(numbers);
  number.classList.toggle("valid", hasNumber);
  number.classList.toggle("invalid", !hasNumber);

  const hasMinLength = password.length >= 8;
  length.classList.toggle("valid", hasMinLength);
  length.classList.toggle("invalid", !hasMinLength);

  if (
    letter.classList.contains("invalid") ||
    capital.classList.contains("invalid") ||
    number.classList.contains("invalid") ||
    length.classList.contains("invalid")
  ) {
    submit.disabled = true;
  } else {
    submit.disabled = false;
  }
}

const submit = document.getElementById("signupButton");
submit.addEventListener("click", function (event) {
  event.preventDefault();

  const email = document.getElementById("Signemail").value;
  const password = document.getElementById("Signpassword").value;
  const Fname = document.getElementById("Fname").value;
  const Lname = document.getElementById("Lname").value;

  const auth = getAuth();
  const db = getFirestore();

  isSigningUp = true;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      const userData = {
        email: email,
        firstName: Fname,
        lastName: Lname,
      };

      showMessage("Account Created Successfully", "signUpMessage");

      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          setTimeout(() => {
            isSigningUp = false;
            window.location.href = "homepage.html";
          }, 2000);
        })
        .catch((error) => {
          console.error("Error writing user document", error);
          isSigningUp = false;
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        showMessage("Email already exists!", "signUpMessage");
      } else {
        showMessage("Error creating user", "signUpMessage");
      }
      isSigningUp = false;
    });
});

const signIn = document.getElementById("loginButton");
signIn.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const auth = getAuth();

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showMessage("login is successful", "signInMessage");
      const user = userCredential.user;
      localStorage.setItem("loggedInUserId", user.uid);
      window.location.href = "homepage.html";
    })

    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/invalid-credential") {
        showMessage("Incorrect Email or Password", "signInMessage");
      } else {
        showMessage("Account does not Exist", "signInMessage");
      }
    });
});

function showRegis() {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("registerForm").classList.add("active");
}

function showLogin() {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("showRegis").addEventListener("click", (e) => {
    e.preventDefault();
    showRegis();
  });

  document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  });

  passwordInput.addEventListener("keyup", validate);
});

const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (user && !isSigningUp) {
    window.location.href = "homepage.html";
  }
});
