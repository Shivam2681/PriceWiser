/**
 * PriceWiser Extension - Runtime Config
 * Centralizes backend/app URLs so we don't scatter localhost/prod strings around.
 */

const DEFAULT_BACKEND_BASE_URL = "http://localhost:3000";
const DEFAULT_APP_BASE_URL = "https://price-wiser-coral.vercel.app";
const BACKEND_BASE_URL_KEY = "backendBaseUrl";
const APP_BASE_URL_KEY = "appBaseUrl";
const BROKEN_APP_HOSTNAMES = new Set([
  "pricewiser.com",
  "www.pricewiser.com",
  "atom.com",
  "www.atom.com",
]);

function normalizeBaseUrl(value) {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

async function getStoredBaseUrl(key) {
  try {
    if (!chrome?.storage?.local) return "";
    const result = await chrome.storage.local.get([key]);
    return normalizeBaseUrl(result[key]);
  } catch (error) {
    console.warn(`[Config] Unable to read ${key}:`, error.message);
    return "";
  }
}

function buildUrl(baseUrl, path = "") {
  const normalizedBase = normalizeBaseUrl(baseUrl) || DEFAULT_BACKEND_BASE_URL;
  const normalizedPath = String(path || "");

  return new URL(
    normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`,
    normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`
  ).toString();
}

function isBrokenAppBaseUrl(value) {
  try {
    const origin = normalizeBaseUrl(value);
    if (!origin) return true;
    const hostname = new URL(origin).hostname.toLowerCase();
    return BROKEN_APP_HOSTNAMES.has(hostname);
  } catch {
    return true;
  }
}

export async function getBackendBaseUrl() {
  const stored = await getStoredBaseUrl(BACKEND_BASE_URL_KEY);
  return stored || DEFAULT_BACKEND_BASE_URL;
}

export async function setBackendBaseUrl(value) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) {
    throw new Error("Invalid backend base URL");
  }

  await chrome.storage.local.set({ [BACKEND_BASE_URL_KEY]: normalized });
  return normalized;
}

export async function getAppBaseUrl() {
  const stored = await getStoredBaseUrl(APP_BASE_URL_KEY);
  if (stored && !isBrokenAppBaseUrl(stored)) return stored;

  try {
    const manifestUrl = chrome?.runtime?.getManifest?.()?.homepage_url;
    if (manifestUrl && !isBrokenAppBaseUrl(manifestUrl)) {
      return normalizeBaseUrl(manifestUrl);
    }
  } catch (error) {
    console.warn("[Config] Unable to read homepage_url:", error.message);
  }

  return DEFAULT_APP_BASE_URL;
}

export async function setAppBaseUrl(value) {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) {
    throw new Error("Invalid app base URL");
  }

  await chrome.storage.local.set({ [APP_BASE_URL_KEY]: normalized });
  return normalized;
}

export async function getBackendUrl(path = "") {
  return buildUrl(await getBackendBaseUrl(), path);
}

export async function getAppUrl(path = "") {
  return buildUrl(await getAppBaseUrl(), path);
}

export async function getDashboardUrl(returnPath = "") {
  return getAppUrl(`/dashboard${returnPath}`);
}

export async function getWelcomeUrl() {
  return getAppUrl("/");
}
