const firebaseConfig = {
  apiKey: "AIzaSyBA_MoKbYeH3oNAFLIFUdyDT5npxr0pUMA",
  authDomain: "portfolio-225f1.firebaseapp.com",
  projectId: "portfolio-225f1",
  storageBucket: "portfolio-225f1.appspot.com",
  messagingSenderId: "85498006153",
  appId: "1:85498006153:web:1fbe88e2161b440ddbd458",
  measurementId: "G-5HKHSJEK73"
};

const app = firebase.initializeApp(firebaseConfig)
const db = firebase.database()
const auth = firebase.auth()
