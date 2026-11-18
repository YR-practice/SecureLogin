/* Симетричне шифрування AES-256-GCM (Web Crypto API).
   Ключ виводиться з секретної фрази через PBKDF2 (SHA-256, 100 000 ітерацій).
   Той самий ключ використовується і для шифрування, і для дешифрування. */
const CryptoLab = (() => {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const SECRET_PHRASE = "WebSecurityLab-2026-secret-key"; // секретний ключ (демо)
  const SALT = enc.encode("lab-encryption-salt-v1");
  let keyPromise = null;

  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  function getKey() {
    if (!keyPromise) {
      keyPromise = crypto.subtle
        .importKey("raw", enc.encode(SECRET_PHRASE), "PBKDF2", false, ["deriveKey"])
        .then((base) =>
          crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: SALT, iterations: 100000, hash: "SHA-256" },
            base,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
          )
        );
    }
    return keyPromise;
  }

  /** E_K(M) -> "iv:ciphertext" (base64) */
  async function encrypt(plain) {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
    return toB64(iv) + ":" + toB64(ct);
  }

  /** D_K(C) -> відкритий текст */
  async function decrypt(packed) {
    const [ivB64, ctB64] = packed.split(":");
    const key = await getKey();
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(ivB64) }, key, fromB64(ctB64));
    return dec.decode(pt);
  }

  /** SHA-256 (для пароля адміністратора в БД) */
  async function sha256(text) {
    const h = await crypto.subtle.digest("SHA-256", enc.encode(text));
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  return { encrypt, decrypt, sha256 };
})();
