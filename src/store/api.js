// api.js
// The REAL backend client, wired to the ZORO Django backend (see
// ZORO_Backend_Combined.zip / apps/mobile). Exports the exact same function
// names mockApi.js does, with the same argument shapes and return shapes, so
// every screen keeps working unchanged — the only edit needed anywhere else
// is swapping the import:
//     import mockApi from "../../store/mockApi";   // before
//     import mockApi from "../../store/api";        // after
//
// Two small backend-shape differences that couldn't be papered over here are
// flagged inline below (getKycStatus's `documents` shape, and submitKyc not
// sending real files yet) — search this file for "NOTE:".

import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Base URL ────────────────────────────────────────────────────────────
// Backend is exposed via ngrok (client and server are on different
// machines) — this is the tunnel URL currently shown in the ngrok terminal.
// ponytail: free ngrok URLs change every time the tunnel restarts — update
// this constant (or call configureApiBaseUrl() at app startup) whenever
// that happens. A reserved/paid ngrok domain would make this permanent.
let BASE_URL = "https://calculate-gurgling-passport.ngrok-free.dev/api/v1";

export function configureApiBaseUrl(url) {
  BASE_URL = url.replace(/\/$/, "");
}

const ACCESS_KEY = "zoro_access_token";
const REFRESH_KEY = "zoro_refresh_token";

async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_KEY);
}

async function setTokens(access, refresh) {
  const ops = [AsyncStorage.setItem(ACCESS_KEY, access)];
  if (refresh) ops.push(AsyncStorage.setItem(REFRESH_KEY, refresh));
  await Promise.all(ops);
}

async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}

// Exported so AuthContext can check/clear session state without knowing this
// module's internal storage keys (mockApi.js had no equivalent — it used a
// single fake "token" string AuthContext stored itself under its own key;
// a real JWT pair needs this module to own both keys instead).
export async function hasSession() {
  return !!(await getAccessToken());
}
export async function clearSession() {
  await clearTokens();
}

function apiError(message) {
  const err = new Error(message);
  err.response = { data: { message } };
  return err;
}

// ngrok's free tier shows an HTML "you're about to visit..." interstitial to
// any request that looks like it's coming from a browser, INSTEAD of
// forwarding it to the local server — this header tells ngrok's edge to skip
// that and proxy straight through. Harmless (ignored) when not using ngrok.
const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" };

async function tryRefresh() {
  const refresh = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/app/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_HEADERS },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    await AsyncStorage.setItem(ACCESS_KEY, json.access);
    return true;
  } catch (e) {
    return false;
  }
}

// Every backend response is { success, data, message } (or paginated:
// { success, data, meta }) — see utils/responses.py + utils/pagination.py
// in the backend. `unwrap` pulls `data` out and turns success:false into a
// thrown error shaped like the mock's (`e.response.data.message`).
async function request(method, path, body, { auth = true, retry = true, form = false } = {}) {
  const headers = { ...NGROK_HEADERS };
  if (!form) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : form ? body : JSON.stringify(body),
  });

  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(method, path, body, { auth, retry: false, form });
  }

  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    // no body
  }

  if (!res.ok || (json && json.success === false)) {
    throw apiError(json?.message || `Request failed (${res.status})`);
  }
  return json;
}

const get = (path, opts) => request("GET", path, undefined, opts);
const post = (path, body, opts) => request("POST", path, body, opts);
const patch = (path, body, opts) => request("PATCH", path, body, opts);

// ─── AUTH ───────────────────────────────────────────────────────────────
export async function sendOtp(mobile) {
  const res = await post("/app/auth/send-otp/", { mobile }, { auth: false });
  return res.data;
}

export async function verifyOtp(mobile, otp, mode) {
  const res = await post("/app/auth/verify-otp/", { mobile, otp, mode }, { auth: false });
  if (mode === "login") await setTokens(res.data.access, res.data.refresh);
  else await setTokens(res.data.access, res.data.refresh); // register also logs in immediately
  return { token: res.data.access, mode };
}

export async function loginWithPassword(email, password) {
  const res = await post("/app/auth/login/", { email, password }, { auth: false });
  await setTokens(res.access, res.refresh); // this endpoint isn't wrapped in {data:...} — it's raw simplejwt output
  return { token: res.access, message: "Login success" };
}

export async function registerProfile(profile) {
  const res = await post("/app/auth/profile/", profile);
  return res;
}

export async function setTransactionPin(pin) {
  return post("/app/auth/set-pin/", { pin });
}

export async function sendPasswordResetOtp(mobile) {
  const res = await post("/app/auth/send-password-reset-otp/", { mobile, purpose: "reset" }, { auth: false });
  return res.data;
}

export async function verifyPasswordResetOtp(mobile, otp) {
  const res = await post("/app/auth/verify-password-reset-otp/", { mobile, otp }, { auth: false });
  return { token: res.data.reset_token };
}

// NOTE for the frontend team: ResetPasswordScreen.jsx needs a small patch to
// actually pass these two values through (it currently calls
// mockApi.resetPassword() with no arguments at all) — see route.params.resetToken
// (already provided by ForgotPasswordScreen's navigation.navigate call) and
// the `password` state already collected on that screen.
export async function resetPassword(resetToken, newPassword) {
  return post("/app/auth/reset-password/", { reset_token: resetToken, new_password: newPassword }, { auth: false });
}

export async function logout() {
  const refresh = await AsyncStorage.getItem(REFRESH_KEY);
  try {
    await post("/app/auth/logout/", { refresh });
  } finally {
    await clearTokens();
  }
}

// ─── WALLET ─────────────────────────────────────────────────────────────
export async function getWalletDashboard() {
  const res = await get("/app/wallets/dashboard/");
  return res.data;
}

// mockApi models this as a separate call, but the backend returns income/
// outcome as part of the same dashboard payload — no second round-trip needed.
export async function getIncomeOutcome() {
  const res = await get("/app/wallets/dashboard/");
  return { income: res.data.income, outcome: res.data.outcome };
}

export async function getTransactionList() {
  const res = await get("/app/transactions/");
  return { transactions: res.data };
}

export async function getTransactionById(id) {
  const res = await get(`/app/transactions/${id}/`);
  return res.data;
}

export async function getUserByAddress(address) {
  const res = await get(`/app/transactions/user-by-address/?address=${encodeURIComponent(address)}`);
  return res.data;
}

export async function scanQr(qrData) {
  const res = await post("/app/transactions/scan-qr/", { qrData });
  return res.data;
}

export async function transferPreview(toAddress, amount) {
  const res = await post("/app/transactions/preview/", { toAddress, amount });
  return res.data;
}

export async function transfer({ amount, toAddress, pin, note }) {
  return post("/app/transactions/transfer/", { amount, toAddress, pin, note });
}

export async function generateAddress() {
  const res = await get("/app/wallets/address/");
  return res.data;
}

export async function getRecents() {
  const res = await get("/app/transactions/recents/");
  return res.data;
}

export async function addRecent(contact) {
  return post("/app/transactions/recents/", { address: contact.address });
}

// ─── PROFILE ────────────────────────────────────────────────────────────
export async function getProfile() {
  const res = await get("/app/auth/profile/");
  return res.data;
}

// ─── KYC (reuses the admin backend's own /api/v1/kyc/ endpoint directly —
// it's already scoped to "my own requests" for any non-agent user) ───────
export async function getKycStatus() {
  const res = await get("/kyc/");
  const latest = res.data?.[0];
  if (!latest) {
    return { level: "Level 1", status: "unverified", submittedAt: null, documents: [], riskScore: 0 };
  }
  // NOTE: admin's KYCRequest only stores document *types*, not the
  // {type, side} pairs the mock's demo upload flow tracks — close enough
  // for status display, but KycUploadScreen's per-side tiles won't reflect
  // real per-document review state until the backend grows that detail.
  return {
    level: `Level ${latest.level}`,
    status: latest.status,
    submittedAt: latest.submitted_at,
    documents: latest.document_types || [],
    riskScore: latest.risk_score || 0,
  };
}

export async function submitKyc({ level, documents }) {
  // NOTE: KycUploadScreen currently just simulates document capture (no
  // real camera/file picker wired up yet — see that screen's own comment),
  // so there are no real files to upload. This sends the level only; wire
  // up real multipart file upload here once the screen captures real photos
  // (the backend's KYCViewSet.create already accepts `documents`/`documentTypes`
  // as multipart form fields whenever the app is ready to send them).
  const levelNumber = parseInt(String(level).replace(/\D/g, ""), 10) || 1;
  return post("/kyc/", { level: levelNumber });
}

// ─── REFERRALS & REWARDS ───────────────────────────────────────────────
export async function getReferralData() {
  const res = await get("/app/referrals/");
  return res.data;
}

export async function getRewards() {
  const res = await get("/app/rewards/");
  return res.data;
}

export async function claimReward(id) {
  return post(`/app/rewards/${id}/claim/`);
}

// ─── MARKET ─────────────────────────────────────────────────────────────
export async function getMarketOverview() {
  const res = await get("/app/market/");
  return { data: res.data };
}

// ─── NOTIFICATIONS (reuses the admin backend's own /api/v1/notifications/,
// already scoped to request.user) ───────────────────────────────────────
export async function getNotifications() {
  const res = await get("/notifications/");
  return res.data;
}

export async function markAllNotificationsRead() {
  return patch("/notifications/mark_all_read/", {});
}

// ─── BANK LINKING ───────────────────────────────────────────────────────
export async function getBankAccounts() {
  const res = await get("/app/bank-accounts/");
  return res.data;
}

export async function addBankAccount(payload) {
  return post("/app/bank-accounts/", payload);
}

export async function setBankTpin() {
  // No screen in the app calls this today (see apps/mobile/bank/views.py's
  // comment on the backend) — kept only so importing this module doesn't
  // break if a screen starts calling it.
  throw apiError("Bank TPIN isn't implemented yet — no screen calls this.");
}

export default {
  sendOtp,
  verifyOtp,
  loginWithPassword,
  registerProfile,
  setTransactionPin,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  logout,
  getBalance: getWalletDashboard, // dead in the mock too, kept for signature-compat
  getWalletDashboard,
  getIncomeOutcome,
  getTransactionList,
  getTransactionById,
  getUserByAddress,
  scanQr,
  transferPreview,
  transfer,
  generateAddress,
  getRecents,
  addRecent,
  getProfile,
  getKycStatus,
  submitKyc,
  getReferralData,
  getRewards,
  claimReward,
  getMarketOverview,
  getNotifications,
  markAllNotificationsRead,
  getBankAccounts,
  addBankAccount,
  setBankTpin,
};
