// ── Firebase configuration ────────────────────────────────────────────────────
// Project: traq-522d3

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDEW9tEO9asNcXdcFX3motSwGwkQ-ghGB4",
    authDomain: "traq-522d3.firebaseapp.com",
    databaseURL: "https://traq-522d3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "traq-522d3",
    storageBucket: "traq-522d3.firebasestorage.app",
    messagingSenderId: "794130607352",
    // ⚠️  You gave the Android app ID.  To use Phone Auth on the web you need a
    //     *Web* app registered in the Firebase Console.
    //     Console → Project Settings → Your apps → Add app → Web (</>) → copy appId
    //     It will look like:  "1:794130607352:web:XXXXXXXXXXXXXXXX"
    appId: "1:794130607352:android:2c4d87f5b7695ab5e99f0d",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
