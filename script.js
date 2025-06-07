"use strict"; // 厳格モードを適用（バグ防止

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