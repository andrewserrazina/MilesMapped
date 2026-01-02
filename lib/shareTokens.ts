const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

export const generateShareToken = () => {
  if (typeof crypto === "undefined") {
    throw new Error("Crypto unavailable for share token generation.");
  }

  if ("randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
};

export const buildSharePath = (token: string) => `/share/${token}`;
