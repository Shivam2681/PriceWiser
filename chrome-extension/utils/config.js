/**
 * PriceWiser Extension - Runtime Config
 * Centralizes backend/app URLs so we don't scatter localhost/prod strings around.
 */

const DEFAULT_BACKEND_BASE_URL = "http://localhost:3000";
const BACKEND_BASE_URL_KEY = "backendBaseUrl";
const APP_BASE_URL_KEY = "appBaseUrl";

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
  if (stored) return stored;

  try {
    const manifestUrl = chrome?.runtime?.getManifest?.()?.homepage_url;
    if (manifestUrl) {
      return normalizeBaseUrl(manifestUrl);
    }
  } catch (error) {
    console.warn("[Config] Unable to read homepage_url:", error.message);
  }

  return "https://pricewiser.com";
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
  return getAppUrl("/welcome");
}
