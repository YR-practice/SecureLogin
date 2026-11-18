const session = JSON.parse(sessionStorage.getItem("session") || "null");
if (!session || session.role !== "admin") location.replace("index.html");

document.getElementById("who").textContent = session.name + " ";
document.getElementById("logout").onclick = () => { sessionStorage.clear(); location.href = "index.html"; };

let showPass = false, showCipher = false;
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function render() {
  const users = await UserStore.all(); // дешифрування даних з Local Storage
  const tbody = document.getElementById("rows");
  document.querySelectorAll(".cipherCol").forEach((c) => c.classList.toggle("hidden", !showCipher));
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">Користувачів ще немає</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(u.name)}</td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.login)}</td>
      <td>${showPass ? esc(u.password) : "•".repeat(Math.min(u.password.length, 12))}</td>
      <td>${esc(u.created)}</td>
      <td class="cipher cipherCol ${showCipher ? "" : "hidden"}">${esc(u.cipherPassword)}</td>
      <td class="row-actions"><button data-id="${u.id}">Видалити</button></td>
    </tr>`).join("");
  tbody.querySelectorAll("button[data-id]").forEach((b) => {
    b.onclick = () => { UserStore.remove(Number(b.dataset.id)); render(); };
  });
}
document.getElementById("togglePass").onclick = (e) => {
  showPass = !showPass; e.target.textContent = showPass ? "Сховати паролі" : "Показати паролі"; render();
};
document.getElementById("toggleCipher").onclick = (e) => {
  showCipher = !showCipher; e.target.textContent = showCipher ? "Сховати шифротекст" : "Показати шифротекст"; render();
};
document.getElementById("refresh").onclick = render;
render();
