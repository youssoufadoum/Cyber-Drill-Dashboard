import { reactive } from 'vue';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  orderBy,
  deleteDoc
} from 'firebase/firestore';

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const store = reactive({
  currentUser: null,
  isAuthReady: false,
  drills: [],
  results: [],
  myResults: [],
  students: [],

  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await this.fetchUserData(userCredential.user.uid);
  },

  async signup(email, password, role, faculty = '', mahallah = '') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: userCredential.user.uid,
      email,
      role,
      faculty,
      mahallah,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userCredential.user.uid}`);
    }
    this.currentUser = userData;
  },

  async logout() {
    await signOut(auth);
    this.currentUser = null;
    this.drills = [];
    this.results = [];
    this.myResults = [];
  },

  async fetchUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        this.currentUser = userDoc.data();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  },

  async fetchDrills() {
    const path = 'drills';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      this.drills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async fetchResults() {
    if (!this.currentUser) return;
    
    const path = 'results';
    try {
      if (this.currentUser.role === 'trainer') {
        const q = query(collection(db, path), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        this.results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        const q = query(
          collection(db, path), 
          where('studentId', '==', this.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.myResults = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async createDrill(drillData) {
    const path = 'drills';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...drillData,
        trainerId: this.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      await this.fetchDrills();
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateDrill(drillId, drillData) {
    const path = `drills/${drillId}`;
    try {
      await setDoc(doc(db, 'drills', drillId), {
        ...drillData,
        trainerId: this.currentUser.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await this.fetchDrills();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteDrill(drillId) {
    const path = `drills/${drillId}`;
    try {
      await deleteDoc(doc(db, 'drills', drillId));
      await this.fetchDrills();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async submitResult(resultData) {
    const path = 'results';
    try {
      await addDoc(collection(db, path), {
        ...resultData,
        studentId: this.currentUser.uid,
        studentName: this.currentUser.name,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async submitEvaluation(drillId, studentId, score, maxScore, feedback) {
    const path = 'results';
    try {
      const q = query(
        collection(db, path), 
        where('drillId', '==', drillId),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const resultDoc = snapshot.docs[0];
        await setDoc(doc(db, path, resultDoc.id), {
          score,
          maxScore,
          feedback,
          status: 'completed'
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async fetchParticipants(drillId) {
    const path = 'results';
    try {
      const q = query(collection(db, path), where('drillId', '==', drillId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async fetchStudents() {
    const path = 'users';
    try {
      const q = query(collection(db, path), where('role', '==', 'student'));
      const snapshot = await getDocs(q);
      this.students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateProfile(profileData) {
    const path = `users/${this.currentUser.uid}`;
    try {
      await setDoc(doc(db, 'users', this.currentUser.uid), {
        ...profileData,
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        role: this.currentUser.role,
        createdAt: this.currentUser.createdAt
      }, { merge: true });
      await this.fetchUserData(this.currentUser.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async changePassword(newPassword) {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      } else {
        throw new Error('No user logged in');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await store.fetchUserData(user.uid);
  } else {
    store.currentUser = null;
  }
  store.isAuthReady = true;
});
