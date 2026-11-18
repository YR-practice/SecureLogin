const session = JSON.parse(sessionStorage.getItem("session") || "null");
if (!session || session.role !== "user") location.replace("index.html");

document.getElementById("who").textContent = session.name + " ";
document.getElementById("hello").textContent = "Вітаємо, " + session.name + "!";
document.getElementById("logout").onclick = () => { sessionStorage.clear(); location.href = "index.html"; };

(async () => {
  const me = (await UserStore.all()).find((u) => u.login === session.login);
  if (!me) return;
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  document.getElementById("profile").innerHTML = `
    <tr><th>ПІБ</th><td>${esc(me.name)}</td></tr>
    <tr><th>Email</th><td>${esc(me.email)}</td></tr>
    <tr><th>Логін</th><td>${esc(me.login)}</td></tr>
    <tr><th>Зареєстровано</th><td>${esc(me.created)}</td></tr>`;
})();
