import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBjzcD9mJRe9RHDSe8UFChmHJG5kF-d1Ig",
    authDomain: "beebek-3e3e.firebaseapp.com",
    projectId: "beebek-3e3e",
    storageBucket: "beebek-3e3e.firebasestorage.app",
    messagingSenderId: "112774538984",
    appId: "1:112774538984:web:4926b4612618a9dd130b5d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import { marked } from "marked";

// ... (existing helper setup)

async function checkPost() {
    const slug = 'paper';
    console.log(`Checking blog post: ${slug}`);
    try {
        const docRef = doc(db, 'blog_posts', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Featured Image Found?", !!data.featuredImage);
            console.log("Featured Image URL:", data.featuredImage);

            if (data.featuredImage) {
                const res = await fetch(data.featuredImage);
                console.log(`Image Fetch Status: ${res.status}`);
            }

            console.log("Content Length:", data.content?.length);

            if (data.content) {
                console.log("Attempting marked compilation...");
                try {
                    const compiled = await marked.parse(data.content);
                    console.log("Compiled Code Length:", compiled?.length);
                    if (!compiled) {
                        console.error("Compilation returned empty string!");
                    } else {
                        console.log("Compilation success!");
                        // console.log("First 100 chars:", compiled.substring(0, 100));
                    }
                } catch (e) {
                    console.error("Compilation FAILED:", e);
                }
            } else {
                console.log("No content to compile.");
            }

        } else {
            console.log("No such document!");
        }
    } catch (e) {
        console.error("Error fetching document:", e);
    }
    process.exit();
}

checkPost();
