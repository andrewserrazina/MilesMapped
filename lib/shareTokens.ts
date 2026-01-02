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
  const cryptoApi = globalThis.crypto as Crypto | undefined;

  if (!cryptoApi) {
    throw new Error("Crypto unavailable for share token generation.");
  }

  if ("randomUUID" in cryptoApi) {
    return cryptoApi.randomUUID().replace(/-/g, "");
  }

  const bytes = new Uint8Array(32);
  cryptoApi.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
};

export const buildSharePath = (token: string) => `/share/${token}`;
