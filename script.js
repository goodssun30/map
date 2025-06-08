"use strict"; // 厳格モードを適用（バグ防止）

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 🔹 Firebaseの設定
const firebaseConfig = {
  apiKey: "",
  authDomain: "notion-map-1c0f8.firebaseapp.com",
  projectId: "notion-map-1c0f8",
  storageBucket: "notion-map-1c0f8.firebasestorage.app",
  messagingSenderId: "694300884054",
  appId: "1:694300884054:web:cfe8985cc0c27041f54ff7"
};


// 🔹 Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Firestore の状態確認
console.log("Firestoreの状態:", db);

// 🔹 ページ読み込み時のデータ復元
getDocs(collection(db, "prefectures")).then((querySnapshot) => {
    querySnapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
            const prefData = docSnap.data();
            updateMapColor(docSnap.id, prefData.status); // 🔥 ページ読み込み時に `status` を反映！
            console.log(`ロード時のステータス確認:`, prefData.status);
        } else {
            console.warn(`Firestore のデータが見つかりません: ${docSnap.id}`);
        }
    });
});

// 🔹 状態変更関数
// 🔹 状態変更関数（ループ対応版）
function getNextStatus(currentStatus) {
    const statusFlow = ["untouched", "pass-through", "visited", "stayed"]; // 🔥 順番を維持
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    // 🔥 最後のステータスなら最初に戻る！
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : statusFlow[0];
}

// 🔹 Firestoreのデータ更新
async function updateStatus(prefCode, currentStatus) {
    try {
        const nextStatus = getNextStatus(currentStatus);
        const docRef = doc(db, "prefectures", prefCode);

        const beforeUpdateDoc = await getDoc(docRef);
        console.log(`🔵 更新前の Firestore ステータス:`, beforeUpdateDoc.data().status); // 🔥 ここで追加！

        if (nextStatus !== undefined && nextStatus !== null) {
            await updateDoc(docRef, { status: nextStatus });
            console.log(`✅ ${prefCode} のステータスを Firestore に保存しました！🚀`);

            // 🔹 Firestore に保存されたデータを取得してチェック
            const updatedDoc = await getDoc(docRef);
            console.log(`🔥 Firestore に保存後のデータ確認:`, updatedDoc.data());

            // 🔹 地図の色を変更
            updateMapColor(prefCode, nextStatus);
        } else {
            console.error(`⚠️ エラー: ${prefCode} のステータスが取得できませんでした！`);
        }
    } catch (error) {
        console.error(`🔥 Firestore 書き込みエラー:`, error);
    }
}

// 🔹 地図の色変更
function updateMapColor(prefCode, status) {
    const colorMap = {
        "untouched": "#ffffff",
        "pass-through": "#a0d8ef",
        "visited": "#fdd835",
        "stayed": "#ef5350"
    };

    const element = document.getElementById(prefCode);
    
    if (element) {
        element.style.fill = colorMap[status];
        console.log(`✅ ${prefCode} の色を変更: ${colorMap[status]}`);
    } else {
        console.error(`⚠️ エラー: ${prefCode} の要素が見つかりません！`);
    }
}


// 🔹 クリックイベント処理
document.addEventListener("DOMContentLoaded", function () {
    const prefectures = document.querySelectorAll("#map-body rect[id^='pref']");

    prefectures.forEach(pref => {
        pref.addEventListener("click", async function () {
            const prefCode = pref.id;
            const docRef = doc(db, "prefectures", prefCode);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const currentStatus = docSnap.data().status;
                const nextStatus = getNextStatus(currentStatus);

                // Firestoreに保存
                await updateDoc(docRef, { status: nextStatus });

                // 色を変更
                updateMapColor(prefCode, nextStatus);
            }
        });
    });
});
