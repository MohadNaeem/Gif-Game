import { initializeApp } from "firebase/app";

import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import "firebase/compat/database";

const firebaseConfig = {
  // omo7-739e5 credentials
  // apiKey: "AIzaSyDMGmymk2yDeMZVUHlfCYo4Vj8RiaidmV0",
  // authDomain: "omo7-739e5.firebaseapp.com",
  // databaseURL: "https://omo7-739e5-default-rtdb.asia-southeast1.firebasedatabase.app",
  // projectId: "omo7-739e5",
  // storageBucket: "omo7-739e5.appspot.com",
  // messagingSenderId: "1007535342958",
  // appId: "1:1007535342958:web:be35c15fbd3e01cb306d7f",
  // measurementId: "G-8M8ZDHLT4Y"

  
  // omo-v1 credentials
  apiKey: "AIzaSyCIc39s-BtDTS8bxoLiIDLeaWYx8coSp0o",
  authDomain: "omo-v1.firebaseapp.com",
  projectId: "omo-v1",
  storageBucket: "omo-v1.appspot.com",
  messagingSenderId: "587290578670",
  appId: "1:587290578670:web:4e7ea532af44bd898f2dff",
  measurementId: "G-B737SS2JXK",
  databaseURL: "https://omo-v1-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig)

export default app