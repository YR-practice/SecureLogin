/* Користувачі в Local Storage: кожне поле зберігається у зашифрованому вигляді. */
const UserStore = (() => {
  const KEY = "users";
  const raw = () => JSON.parse(localStorage.getItem(KEY) || "[]");
  const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));

  async function add({ name, email, login, password }) {
    const users = raw();
    users.push({
      id: Date.now(),
      name: await CryptoLab.encrypt(name),
      email: await CryptoLab.encrypt(email),
      login: await CryptoLab.encrypt(login),
      password: await CryptoLab.encrypt(password),
      created: await CryptoLab.encrypt(new Date().toLocaleString("uk-UA")),
    });
    save(users);
  }

  async function decryptRecord(u) {
    return {
      id: u.id,
      name: await CryptoLab.decrypt(u.name),
      email: await CryptoLab.decrypt(u.email),
      login: await CryptoLab.decrypt(u.login),
      password: await CryptoLab.decrypt(u.password),
      created: await CryptoLab.decrypt(u.created),
      cipherPassword: u.password,
    };
  }

  async function all() {
    return Promise.all(raw().map(decryptRecord));
  }
  async function find(login, password) {
    return (await all()).find((u) => u.login === login && u.password === password) || null;
  }
  async function loginExists(login) {
    return (await all()).some((u) => u.login.toLowerCase() === login.toLowerCase());
  }
  function remove(id) { save(raw().filter((u) => u.id !== id)); }

  return { add, all, find, loginExists, remove };
})();
