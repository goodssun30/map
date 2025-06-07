"use strict"; // 厳格モードを適用（バグ防止）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 🔹 Firebaseの設定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 🔹 Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Firestoreの状態確認
console.log("Firestoreの状態:", db);

// 🔹 ページ読み込み時のデータ復元（Firestoreからデータを取得）
getDocs(collection(db, "prefectures")).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        const prefData = doc.data();
        updateMapColor(doc.id, prefData.status);
    });
});

// 🔹 状態変更関数
function getNextStatus(currentStatus) {
    const statusFlow = ["untouched", "pass-through", "visited", "stayed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : currentStatus;
}

// 🔹 クリックイベントの処理（Firestoreのデータ取得・更新）
document.querySelectorAll(".prefecture").forEach((element) => {
    element.addEventListener("click", async () => {
        const prefCode = element.id; // 例: "pref13"
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
document.addEventListener("DOMContentLoaded", function () {
  const prefectures = document.querySelectorAll("#japan-map rect[id^='pref']");

  prefectures.forEach(pref => {
    pref.addEventListener("click", function () {
      if (pref.classList.contains("stayed")) {
        pref.classList.remove("stayed");
        pref.classList.add("untouched"); /* ✅ 初期状態（未踏）に戻る */
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
        pref.classList.remove("untouched"); /* ✅ 初期状態をリセット */
        pref.classList.add("pass-through");
        pref.setAttribute("fill", "#a0d8ef");
      }
    });
  });
});
