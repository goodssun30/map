"use strict"; // 厳格モードを適用（バグ防止）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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
const auth = getAuth(app);

// 🔹 匿名ログインしてからFirestore操作を始める関数
function startFirestoreLogic() {
  // ページ読み込み時のデータ復元
  getDocs(collection(db, "prefectures")).then((querySnapshot) => {
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const prefData = docSnap.data();
        updateMapColor(docSnap.id, prefData.status);
        console.log(`ロード時のステータス確認:`, prefData.status);
      } else {
        console.warn(`Firestore のデータが見つかりません: ${docSnap.id}`);
      }
    });
  });

  // クリックイベント処理
  const prefectures = document.querySelectorAll("#map-body rect[id^='pref']");
  prefectures.forEach(pref => {
    pref.addEventListener("click", async function () {
      const prefCode = pref.id;
      const docRef = doc(db, "prefectures", prefCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentStatus = docSnap.data().status;
        const nextStatus = getNextStatus(currentStatus);
        await updateDoc(docRef, { status: nextStatus });
        updateMapColor(prefCode, nextStatus);
      }
    });
  });
}

// 🔹 状態変更関数
function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case "untouched":
      return "pass-through";
    case "pass-through":
      return "visited";
    case "visited":
      return "stayed";
    case "stayed":
      return "untouched";
    default:
      return "untouched";
  }
}

// 🔹 地図の色変更
function updateMapColor(prefCode, status) {
  const colorMap = {
    "untouched": "#ffffff",
    "pass-through": "#a6e0f7",
    "visited": "#fae070",
    "stayed": "#fc7472"
  };
  const element = document.getElementById(prefCode);
  if (element) {
    element.style.fill = colorMap[status];
    console.log(`✅ ${prefCode} の色を変更: ${colorMap[status]}`);
  } else {
    console.error(`⚠️ エラー: ${prefCode} の要素が見つかりません！`);
  }
}

// 🔹 匿名ログイン実行
signInAnonymously(auth)
  .then(() => {
    console.log("匿名ログイン成功");
    startFirestoreLogic();  // 匿名ログイン成功したらFirestore処理を開始
  })
  .catch((error) => {
    console.error("匿名ログイン失敗:", error);
  });
