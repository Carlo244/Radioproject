import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);

const db = getFirestore(app);

let TableData = [];

let currentPage = 1;
const itemsPerPage = 6;

function showAddIssueForm() {
  document.getElementById("addIssueForm").style.display = "block";
  document
    .getElementById("addIssueForm")
    .scrollIntoView({ behavior: "smooth" });
  document.getElementById("time").value = "";
  document.getElementById("station").value = "";
  document.getElementById("platform").value = "";
  document.getElementById("issue").value = "";
  document.getElementById("station").focus();
}

function hideAddIssueForm() {
  document.getElementById("addIssueForm").style.display = "none";
  document.getElementById("time").value = "";
  document.getElementById("station").value = "";
  document.getElementById("platform").value = "";
  document.getElementById("issue").value = "";
}

function renderStationIssues() {
  const yesFM = TableData.filter(
    (item) => item.station && item.station.toUpperCase() === "YES FM"
  );
  const loveRadio = TableData.filter(
    (item) => item.station && item.station.toUpperCase() === "LOVE RADIO"
  );
  const easyRock = TableData.filter(
    (item) => item.station && item.station.toUpperCase() === "EASY ROCK"
  );

  function renderToTbody(issues, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = "";
    issues.forEach((item) => {
      let tr = document.createElement("tr");
      [
        item.time,
        item.station,
        item.platform,
        item.issue,
        item.created_at,
      ].forEach((data) => {
        let td = document.createElement("td");
        td.textContent = data;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  renderToTbody(yesFM, "Yesissuelogs");
  renderToTbody(loveRadio, "LOVEissuelogs");
  renderToTbody(easyRock, "EASYissuelog");
}

function renderIssues(issues) {
  const tbody = document.getElementById("issueLog");
  tbody.innerHTML = "";
  issues.forEach((item) => {
    let tr = document.createElement("tr");

    const displayItems = [
      item.time,
      item.station,
      item.platform,
      item.issue,
      item.created_at,
    ];

    displayItems.forEach((data) => {
      let td = document.createElement("td");
      td.textContent = data;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function listenForIssues() {
  const q = query(collection(db, "issues"), orderBy("serverTimestamp", "desc"));
  onSnapshot(
    q,
    (querySnapshot) => {
      const issues = [];
      querySnapshot.forEach((doc) => {
        issues.push({ id: doc.id, ...doc.data() });
      });
      TableData = issues;
      renderIssues(TableData);
      renderStationIssues();
    },
    (error) => {
      console.error("Error listening for issues:", error);
      alert(
        "Failed to load issues. Please check your Firebase setup, network, and Firestore rules."
      );
    }
  );
}

async function addIssue() {
  let timeValue = document.querySelector("#time").value.trim();
  let station = document.querySelector("#station").value.trim();
  let platform = document.querySelector("#platform").value.trim();
  let issue = document.querySelector("#issue").value.trim();

  if (
    !timeValue ||
    !station ||
    !platform ||
    !issue ||
    station === "Select a Station"
  ) {
    alert("Please fill out all required fields correctly.");
    return;
  }

  function to12HourFormat(timeStr) {
    try {
      return new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return timeStr;
    }
  }

  function getcurrentDATE() {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const newIssueData = {
    time: to12HourFormat(timeValue),
    station: station,
    platform: platform,
    issue: issue,
    created_at: getcurrentDATE(),
    serverTimestamp: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "issues"), newIssueData);
    console.log("Document written with ID: ", docRef.id);
    hideAddIssueForm();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert(
      "Failed to add issue. Please check your internet connection or try again."
    );
  }
}

function searchFunc() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toUpperCase();

  const filteredIssues = TableData.filter((item) => {
    return (
      (item.station && item.station.toUpperCase().includes(filter)) ||
      (item.platform && item.platform.toUpperCase().includes(filter)) ||
      (item.issue && item.issue.toUpperCase().includes(filter)) ||
      (item.time && item.time.toUpperCase().includes(filter)) ||
      (item.created_at && item.created_at.toUpperCase().includes(filter))
    );
  });
  renderIssues(filteredIssues);
}

function toggleIssuesView(showAll) {
  document.querySelector("#table-container").style.display = showAll
    ? "block"
    : "none";
  document.querySelector("#loveyesrock").style.display = showAll
    ? "none"
    : "block";
  document.querySelector("#ViewAllIssuesButton").style.display = showAll
    ? "none"
    : "inline-block";
  document.querySelector("#ViewSeparateIssuesButton").style.display = showAll
    ? "inline-block"
    : "none";
  document.querySelector("#searchInput").style.display = showAll
    ? "block"
    : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  listenForIssues();

  document
    .getElementById("addIssueButton")
    .addEventListener("click", showAddIssueForm);

  document
    .getElementById("submitIssueButton")
    .addEventListener("click", addIssue);

  document
    .getElementById("cancelAddIssueButton")
    .addEventListener("click", hideAddIssueForm);

  document
    .getElementById("ViewAllIssuesButton")
    .addEventListener("click", () => toggleIssuesView(true));
  document
    .getElementById("ViewSeparateIssuesButton")
    .addEventListener("click", () => toggleIssuesView(false));

  document.getElementById("searchInput").addEventListener("keyup", searchFunc);
});
