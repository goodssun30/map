"use strict"; // 厳格モードを適用（バグ防止）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// 🔹 Firebaseの設定
const firebaseConfig = {
  apiKey: "", // APIキーはセキュリティに注意して設定してください
  authDomain: "notion-map-1c0f8.firebaseapp.com",
  projectId: "notion-map-1c0f8",
  storageBucket: "notion-map-1c0f8.firebasestorage.app",
  messagingSenderId: "694300884054",
  appId: "1:694300884054:web:cfe8985cc0c27041f54ff7"
};

// 🔹 Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

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
      return "untouched"; // ここがループのキー
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

// 🔹 Firestoreのデータ更新関数
async function updateStatus(prefCode, currentStatus) {
  try {
    const nextStatus = getNextStatus(currentStatus);
    const docRef = doc(db, "prefectures", prefCode);

    await updateDoc(docRef, { status: nextStatus });
    console.log(`✅ ${prefCode} のステータスを Firestore に保存しました！🚀`);

    // 地図の色を変更
    updateMapColor(prefCode, nextStatus);
  } catch (error) {
    console.error(`🔥 Firestore 書き込みエラー:`, error);
  }
}

// 🔹 Firestore読み込み＆イベント設定関数（認証後に呼ぶ）
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

  // クリックイベント登録
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
        console.warn(`クリックした ${prefCode} のデータがFirestoreにありません`);
      }
    });
  });
}

// 🔹 匿名ログインしてからFirestore処理を開始
signInAnonymously(auth)
  .then(() => {
    console.log("匿名ログイン成功");
    startFirestoreLogic();
  })
  .catch((error) => {
    console.error("匿名ログイン失敗:", error);
  });
