import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDnxolDMt6S8wvXQ3EMxV9hQQSZOkwS-iM",
    authDomain: "smart-traffic-system-2a0ed.firebaseapp.com",
    databaseURL: "https://smart-traffic-system-2a0ed-default-rtdb.firebaseio.com",
    projectId: "smart-traffic-system-2a0ed",
    storageBucket: "smart-traffic-system-2a0ed.firebasestorage.app",
    messagingSenderId: "483968675564",
    appId: "1:483968675564:web:bcdedab8eb9d4bcce57fc9",
    measurementId: "G-ZH513K4W71"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);