"use strict"; // 厳格モードを適用（バグ防止）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 🔹 Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyAGpB4dwElJQvph-hEZ1Na5ztdE_4Ks0wY",
  authDomain: "notion-map-1c0f8.firebaseapp.com",
  projectId: "notion-map-1c0f8",
  storageBucket: "notion-map-1c0f8.firebasestorage.app",
  messagingSenderId: "694300884054",
  appId: "1:694300884054:web:cfe8985cc0c27041f54ff7"
};

// 🔹 Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Firestoreの状態確認
console.log("Firestoreの状態:", db);

// 🔹 ページ読み込み時のデータ復元（Firestoreからデータを取得）
getDocs(collection(db, "prefectures")).then((querySnapshot) => {
    querySnapshot.forEach((docSnap) => {
        const prefData = docSnap.data();
        updateMapColor(docSnap.id, prefData.status);
    });
});

// 🔹 状態変更関数
function getNextStatus(currentStatus) {
    const statusFlow = ["untouched", "pass-through", "visited", "stayed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : currentStatus;
}

// 🔹 クリックイベントの処理
document.querySelectorAll(".prefecture").forEach((element) => {
    element.addEventListener("click", async () => {
        const prefCode = element.id;
        const docRef = doc(db, "prefectures", prefCode);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const currentStatus = docSnap.data().status;
            updateStatus(prefCode, currentStatus);
        }
    });
});

// 🔹 Firestoreのデータ更新
async function updateStatus(prefCode, currentStatus) {
    const nextStatus = getNextStatus(currentStatus);
    const docRef = doc(db, "prefectures", prefCode);

    await updateDoc(docRef, {
        status: nextStatus
    });

    console.log(`${prefCode} のステータスを ${nextStatus} に更新しました！`);
}

// 🔹 地図の色変更
function updateMapColor(prefCode, status) {
    const colorMap = {
        "untouched": "#ffffff",
        "pass-through": "#a0d8ef",
        "visited": "#fdd835",
        "stayed": "#ef5350"
    };
    document.getElementById(prefCode).style.fill = colorMap[status];
}

// 🔹 HTMLのクリックイベント処理
document.addEventListener("DOMContentLoaded", function () {
    const prefectures = document.querySelectorAll("#japan-map rect[id^='pref']");

    prefectures.forEach(pref => {
        pref.addEventListener("click", function () {
            if (pref.classList.contains("stayed")) {
                pref.classList.remove("stayed");
                pref.classList.add("untouched");
                pref.setAttribute("fill", "#ffffff");
            } else if (pref.classList.contains("pass-through")) {
                pref.classList.remove("pass-through");
                pref.classList.add("visited");
                pref.setAttribute("fill", "#fdd835");
            } else if (pref.classList.contains("visited")) {
                pref.classList.remove("visited");
                pref.classList.add("stayed");
                pref.setAttribute("fill", "#ef5350");
            } else {
                pref.classList.remove("untouched");
                pref.classList.add("pass-through");
                pref.setAttribute("fill", "#a0d8ef");
            }
        });
    });
});
