// createTestAdmin.cjs
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCjaeReaan-ZkqXQ9eKnCfQ4xSFEBlLFDA",
    authDomain: "vigan-car-rental.firebaseapp.com",
    projectId: "vigan-car-rental",
    storageBucket: "vigan-car-rental.firebasestorage.app",
    messagingSenderId: "433543232983",
    appId: "1:433543232983:web:d34365506280bce9e29f92",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createTestAdmin = async () => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@vigancarrental.com',
      'Admin@123'
    );
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: 'Admin User',
      email: 'admin@vigancarrental.com',
      username: 'admin',
      role: 'admin',
      contact: '123-456-7890',
      address: 'Vigan City, Philippines',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('Test admin created successfully with UID:', userCredential.user.uid);
  } catch (error) {
    console.error('Error creating test admin:', error);
  }
};

createTestAdmin();