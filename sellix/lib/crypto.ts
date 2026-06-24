/**
 * Шифрование секретов (ключей WB API) — AES-256-GCM.
 * Ключ берётся из WB_KEY_ENCRYPTION_SECRET и приводится к 32 байтам через SHA-256.
 * Никогда не храним ключ WB в открытом виде.
 */
import crypto from "node:crypto";

function getKey() {
  const secret = process.env.WB_KEY_ENCRYPTION_SECRET || "dev-insecure-secret-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    cipher: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptSecret(cipherB64: string, ivB64: string, tagB64: string) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(cipherB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
