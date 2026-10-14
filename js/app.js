import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBQnxHRyj05vOhWcEsArgnYML13YMrVsKw",
  authDomain:        "batalha-de-prompt.firebaseapp.com",
  databaseURL:       "https://batalha-de-prompt-default-rtdb.firebaseio.com",
  projectId:         "batalha-de-prompt",
  storageBucket:     "batalha-de-prompt.firebasestorage.app",
  messagingSenderId: "812431626831",
  appId:             "1:812431626831:web:43867d85a41990ec95103a",
};

const firebaseApp = initializeApp(firebaseConfig);
export const db         = getDatabase(firebaseApp);
export const OPENAI_KEY = localStorage.getItem("openaiKey") || "";
