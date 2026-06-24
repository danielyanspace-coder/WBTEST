/** Генерация человекочитаемого реферального кода: SELLIX-XXXX. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // без похожих символов

export function generateReferralCode() {
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `SELLIX-${s}`;
}
