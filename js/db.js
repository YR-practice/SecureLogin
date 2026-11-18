/* База даних адміністратора: IndexedDB (браузерна БД).
   Пароль зберігається не відкрито, а як хеш SHA-256 із сіллю. */
const AdminDB = (() => {
  const DB_NAME = "lab_crypto_db";
  const STORE = "admins";
  const SALT = "admin-salt-2026";
  // Дані адміністратора для перевірки роботи:
  const DEFAULT_ADMIN = { login: "admin", password: "Admin@2026", name: "Адміністратор системи" };

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "login" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  const tx = (db, mode) => db.transaction(STORE, mode).objectStore(STORE);
  const wrap = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

  async function init() {
    const db = await open();
    const existing = await wrap(tx(db, "readonly").get(DEFAULT_ADMIN.login));
    if (!existing) {
      const hash = await CryptoLab.sha256(SALT + DEFAULT_ADMIN.password);
      await wrap(tx(db, "readwrite").put({ login: DEFAULT_ADMIN.login, name: DEFAULT_ADMIN.name, passHash: hash }));
    }
    return db;
  }

  async function verify(login, password) {
    const db = await init();
    const rec = await wrap(tx(db, "readonly").get(login));
    if (!rec) return null;
    const hash = await CryptoLab.sha256(SALT + password);
    return hash === rec.passHash ? rec : null;
  }
  return { init, verify };
})();
