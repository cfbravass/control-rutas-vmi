import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

const {
  REACT_APP_APIKEY,
  REACT_APP_APPID,
  REACT_APP_AUTHDOMAIN,
  REACT_APP_MESSAGINGSENDERID,
  REACT_APP_PROJECTID,
  REACT_APP_STORAGEBUCKET,
} = process.env

const firebaseConfig = {
  apiKey: REACT_APP_APIKEY,
  authDomain: REACT_APP_AUTHDOMAIN,
  projectId: REACT_APP_PROJECTID,
  storageBucket: REACT_APP_STORAGEBUCKET,
  messagingSenderId: REACT_APP_MESSAGINGSENDERID,
  appId: REACT_APP_APPID,
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
