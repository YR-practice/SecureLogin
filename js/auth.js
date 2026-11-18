const $ = (id) => document.getElementById(id);
const msg = $("msg");
function show(text, type) { msg.textContent = text; msg.className = "msg " + type; }

function switchTab(toLogin) {
  $("loginBox").classList.toggle("hidden", !toLogin);
  $("regBox").classList.toggle("hidden", toLogin);
  $("tabLogin").classList.toggle("active", toLogin);
  $("tabReg").classList.toggle("active", !toLogin);
  msg.className = "msg";
  $("title").textContent = toLogin ? "Увійти" : "Реєстрація";
}
$("showLPass").onchange = (e) => ($("lPass").type = e.target.checked ? "text" : "password");
$("showRPass").onchange = (e) => {
  $("rPass").type = $("rPass2").type = e.target.checked ? "text" : "password";
};
$("tabLogin").onclick = () => switchTab(true);
$("tabReg").onclick = () => switchTab(false);

AdminDB.init(); // створює БД та запис адміністратора

/* ---------- Реєстрація ---------- */
$("btnReg").onclick = async () => {
  const name = $("rName").value.trim();
  const email = $("rEmail").value.trim();
  const login = $("rLogin").value.trim();
  const pass = $("rPass").value;
  const pass2 = $("rPass2").value;

  if (!name || !email || !login || !pass) return show("Заповніть усі поля", "err");
  if (!/^\S+@\S+\.\S+$/.test(email)) return show("Некоректний email", "err");
  if (pass.length < 6) return show("Пароль має містити щонайменше 6 символів", "err");
  if (pass !== pass2) return show("Паролі не співпадають", "err");
  if (login.toLowerCase() === "admin" || (await UserStore.loginExists(login)))
    return show("Такий логін уже зайнятий", "err");

  await UserStore.add({ name, email, login, password: pass }); // шифрування перед записом у Local Storage
  ["rName", "rEmail", "rLogin", "rPass", "rPass2"].forEach((i) => ($(i).value = ""));
  switchTab(true);
  show("Реєстрація успішна! Тепер увійдіть.", "ok");
};

/* ---------- Вхід ---------- */
$("btnLogin").onclick = async () => {
  const login = $("lLogin").value.trim();
  const pass = $("lPass").value;
  if (!login || !pass) return show("Введіть логін і пароль", "err");

  if ($("isAdmin").checked) {
    const admin = await AdminDB.verify(login, pass);
    if (!admin) return show("Невірні дані адміністратора", "err");
    sessionStorage.setItem("session", JSON.stringify({ role: "admin", login: admin.login, name: admin.name }));
    location.href = "admin.html";
  } else {
    const user = await UserStore.find(login, pass);
    if (!user) return show("Невірний логін або пароль", "err");
    sessionStorage.setItem("session", JSON.stringify({ role: "user", login: user.login, name: user.name }));
    location.href = "user.html";
  }
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") ($("loginBox").classList.contains("hidden") ? $("btnReg") : $("btnLogin")).click();
});
