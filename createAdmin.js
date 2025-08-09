import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const createInitialAdmin = async () => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@vigancarrental.com',
      'Admin@123' // Use a strong password
    );
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: 'Admin User',
      email: 'admin@vigancarrental.com',
      username: 'admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('Initial admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createInitialAdmin();