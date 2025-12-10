// script.js (module)
// Uses Firebase v9 modular SDK via CDN imports. Replace the firebaseConfig object with your project's config.
// Firestore collection used: "todos"

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// TODO: Replace these values with your Firebase project config (found in Firebase console -> Project settings)
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_SENDER_ID",
  appId: "REPLACE_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const addForm = document.getElementById("addForm");
const todoInput = document.getElementById("todoInput");
const todosList = document.getElementById("todosList");
const empty = document.getElementById("empty");

function renderItem(docSnap) {
  const id = docSnap.id;
  const data = docSnap.data();
  const li = document.createElement("li");
  li.className = "todo";
  li.dataset.id = id;

  const left = document.createElement("div");
  left.className = "left";

  const text = document.createElement("div");
  text.className = "text";
  text.textContent = data.text || "";

  left.appendChild(text);

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove";
  removeBtn.type = "button";
  removeBtn.title = "Remove";
  removeBtn.textContent = "✕";
  removeBtn.addEventListener("click", async () => {
    try {
      await deleteDoc(doc(db, "todos", id));
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Could not remove item. See console for details.");
    }
  });

  li.appendChild(left);
  li.appendChild(removeBtn);

  return li;
}

// Real-time listener: render list ordered by createdAt
const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  // Clear current list
  todosList.innerHTML = "";

  if (snapshot.empty) {
    empty.hidden = false;
    return;
  } else {
    empty.hidden = true;
  }

  snapshot.forEach((docSnap) => {
    const li = renderItem(docSnap);
    todosList.appendChild(li);
  });
}, (err) => {
  console.error("Failed to subscribe to todos:", err);
  empty.hidden = false;
  empty.textContent = "Unable to load to-dos (check console).";
});

// Add new todo
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = (todoInput.value || "").trim();
  if (!text) return;
  try {
    await addDoc(collection(db, "todos"), {
      text,
      createdAt: serverTimestamp()
    });
    todoInput.value = "";
    todoInput.focus();
  } catch (err) {
    console.error("Failed to add todo:", err);
    alert("Failed to add item. See console for details.");
  }
});

// Allow Enter in input to submit (already handled by form), ensure focus UX
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    todoInput.value = "";
    todoInput.blur();
  }
});
