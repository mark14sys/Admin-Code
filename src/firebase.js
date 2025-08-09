import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCjaeReaan-ZkqXQ9eKnCfQ4xSFEBlLFDA",
    authDomain: "vigan-car-rental.firebaseapp.com",
    projectId: "vigan-car-rental",
    storageBucket: "vigan-car-rental.firebasestorage.app",
    messagingSenderId: "433543232983",
    appId: "1:433543232983:web:d34365506280bce9e29f92",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default app;