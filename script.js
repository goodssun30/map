"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// 🔹 Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAGpB4dwElJQvph-hEZ1Na5ztdE_4Ks0wY",
  authDomain: "notion-map-1c0f8.firebaseapp.com",
  projectId: "notion-map-1c0f8",
  storageBucket: "notion-map-1c0f8.firebasestorage.app",
  messagingSenderId: "694300884054",
  appId: "1:694300884054:web:cfe8985cc0c27041f54ff7"
};

// 🔹 Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 匿名ログインしてから Firestore 処理を開始
signInAnonymously(auth)
  .then(() => {
    console.log("✅ 匿名ログイン成功");
    console.log("あなたのUIDは：", auth.currentUser.uid);

    startFirestoreLogic();  // ログイン成功後にマップ処理をスタート
  })
  .catch((error) => {
    console.error("匿名ログイン失敗:", error);
  });

// 🔹 ステータスの次を返す関数
function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case "untouched": return "pass-through";
    case "pass-through": return "visited";
    case "visited": return "stayed";
    case "stayed": return "untouched";
    default: return "untouched";
  }
}

// 🔹 マップの色をステータスに合わせて変える
function updateMapColor(prefCode, status) {
  const colorMap = {
    "untouched": "#ffffff",
    "pass-through": "#a6e0f7",
    "visited": "#fae070",
    "stayed": "#fc7472"
  };

  const element = document.getElementById(prefCode);
  if (element) {
    element.style.fill = colorMap[status] || "#ffffff";
    console.log(`✅ ${prefCode} の色を変更: ${colorMap[status]}`);
  } else {
    console.error(`⚠️ ${prefCode} の要素が見つかりません！`);
  }
}

// 🔹 Firestoreのステータス更新＆色変更
async function updateStatus(prefCode, currentStatus) {
  try {
    const nextStatus = getNextStatus(currentStatus);
    const docRef = doc(db, "prefectures", prefCode);
    await updateDoc(docRef, { status: nextStatus });
    console.log(`✅ ${prefCode} のステータスを Firestore に保存しました！`);

    updateMapColor(prefCode, nextStatus);
  } catch (error) {
    console.error("Firestore 書き込みエラー:", error);
  }
}

// 🔹 ページ読み込み後＆クリックイベント登録
function startFirestoreLogic() {
  // 1. ページ読み込み時に Firestore からステータス読み込み＆色反映
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

  // 2. 地図の県ごとにクリックイベントを付ける
  const prefectures = document.querySelectorAll("#map-body rect[id^='pref']");
  prefectures.forEach(pref => {
    pref.addEventListener("click", async () => {
      const prefCode = pref.id;
      const docRef = doc(db, "prefectures", prefCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentStatus = docSnap.data().status;
        await updateStatus(prefCode, currentStatus);
      } else {
        console.warn(`${prefCode} のデータがありません`);
      }
    });
  });
}
