// mockApi.js
// A self-contained, in-memory "backend" for the ZORO app. Every screen calls
// these functions the same way Payo's screens called `api.get(...)` / `api.post(...)`
// on a real axios instance — the call sites read the same, only the transport
// is fake. State lives for the lifetime of the app process (module singleton);
// a full reload resets to the seed data, same as the admin panel's React state.

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEMO_ACCOUNTS,
  seedCurrentUser,
  seedWallet,
  directory,
  seedTransactions,
  seedRecents,
  seedMarket,
  seedReferral,
  seedRewards,
  seedNotifications,
  seedBankAccounts,
} from "./dummyData";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Session persistence lives here (not in AuthContext) so this module has the
// same shape as the real api.js — see that file's hasSession()/clearSession()
// doc comment for why.
const MOCK_SESSION_KEY = "zoro_mock_session_token";
async function persistToken(token) {
  await AsyncStorage.setItem(MOCK_SESSION_KEY, token);
}
export async function hasSession() {
  return !!(await AsyncStorage.getItem(MOCK_SESSION_KEY));
}
export async function clearSession() {
  await AsyncStorage.removeItem(MOCK_SESSION_KEY);
}

const db = {
  user: seedCurrentUser(),
  wallet: seedWallet(),
  transactions: seedTransactions(),
  recents: seedRecents(),
  market: seedMarket(),
  referral: seedReferral(),
  rewards: seedRewards(),
  notifications: seedNotifications(),
  bankAccounts: seedBankAccounts(),
  pendingOtp: null,
};

// ─── AUTH ───────────────────────────────────────────────────────────────
export async function sendOtp(mobile) {
  await delay(600);
  db.pendingOtp = { mobile, code: "1234" };
  return { message: "OTP sent" };
}

export async function verifyOtp(mobile, otp, mode) {
  await delay(700);
  if (otp !== "1234") {
    const err = new Error("Invalid OTP");
    err.response = { data: { message: "Enter valid OTP" } };
    throw err;
  }
  if (mode === "login") {
    const account = DEMO_ACCOUNTS.find((a) => a.mobile === mobile);
    if (!account) {
      const err = new Error("No account");
      err.response = { data: { message: "No account found for this number. Try registering." } };
      throw err;
    }
    db.user = { ...db.user, name: account.name, mobile: account.mobile, email: account.email, avatar: account.avatar };
  } else {
    db.user = { ...db.user, mobile };
  }
  const token = "mock-token." + Date.now();
  if (mode === "login") await persistToken(token);
  return { token, mode };
}

export async function loginWithPassword(email, password) {
  await delay(600);
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (!account) {
    const err = new Error("Invalid credentials");
    err.response = { data: { message: "Invalid email or password. Try arjun.mehta@gmail.com / zoro123" } };
    throw err;
  }
  db.user = { ...db.user, name: account.name, email: account.email, mobile: account.mobile, avatar: account.avatar };
  const token = "mock-token." + Date.now();
  await persistToken(token);
  return { token, message: "Login success" };
}

export async function registerProfile(profile) {
  await delay(700);
  db.user = { ...db.user, ...profile };
  await persistToken("mock-token." + Date.now());
  return { message: "Profile created" };
}

export async function logout() {
  await clearSession();
}

export async function setTransactionPin(pin) {
  await delay(500);
  db.user.pin = pin;
  return { message: "Transaction PIN set successfully" };
}

export async function sendPasswordResetOtp(mobile) {
  await delay(600);
  db.pendingOtp = { mobile, code: "1234" };
  return { message: "OTP sent" };
}

export async function verifyPasswordResetOtp(mobile, otp) {
  await delay(600);
  if (otp !== "1234") {
    const err = new Error("Invalid OTP");
    err.response = { data: { message: "Invalid OTP" } };
    throw err;
  }
  return { token: "reset-token." + Date.now() };
}

export async function resetPassword() {
  await delay(700);
  return { message: "Password reset successfully" };
}

// ─── WALLET ─────────────────────────────────────────────────────────────
export async function getBalance() {
  await delay(400);
  return { balance: db.wallet.balance, currency: db.wallet.currency };
}

export async function getIncomeOutcome() {
  await delay(400);
  return { income: db.wallet.income, outcome: db.wallet.outcome };
}

export async function getWalletDashboard() {
  await delay(450);
  return {
    id: db.user.walletId,
    balance: db.wallet.balance,
    referralRewards: db.wallet.referralRewards,
    referralStatus: db.wallet.referralRewards > 0 ? "Unlocked" : "Locked",
    unlockInDays: 0,
    dailyLimit: db.wallet.dailyLimit,
    dailyUsed: db.wallet.dailyUsed,
  };
}

export async function getTransactionList() {
  await delay(500);
  return { transactions: [...db.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
}

export async function getTransactionById(id) {
  await delay(400);
  const tx = db.transactions.find((t) => t.id === id);
  if (!tx) {
    const err = new Error("Not found");
    err.response = { data: { message: "Transaction not found" } };
    throw err;
  }
  return tx;
}

export async function getUserByAddress(address) {
  await delay(400);
  const found = directory.find((d) => d.address.toLowerCase() === String(address).toLowerCase());
  if (!found) {
    const err = new Error("Not found");
    err.response = { data: { message: "User not found" } };
    throw err;
  }
  return found;
}

export async function scanQr(qrData) {
  await delay(500);
  // In the demo, any scanned payload resolves to a rotating demo contact —
  // real builds would decode `qrData` into an address here.
  const target = directory[Math.floor(Math.random() * directory.length)];
  return { name: target.name, walletAddress: target.address };
}

export async function transferPreview(toAddress, amount) {
  await delay(500);
  const receiver = directory.find((d) => d.address.toLowerCase() === String(toAddress).toLowerCase());
  if (!receiver) {
    const err = new Error("Invalid recipient");
    err.response = { data: { message: "Recipient wallet address not found" } };
    throw err;
  }
  if (Number(amount) > db.wallet.balance) {
    const err = new Error("Insufficient balance");
    err.response = { data: { message: "Insufficient balance for this transfer" } };
    throw err;
  }
  const isRecent = db.recents.some((r) => r.address === receiver.address);
  return {
    receiver: { name: receiver.name },
    address: receiver.address,
    amount,
    sender: { name: db.user.name, wallet: db.user.walletAddress },
    isRecent,
  };
}

export async function transfer({ amount, toAddress, pin }) {
  await delay(900);
  if (db.user.pin && pin !== db.user.pin) {
    const err = new Error("Wrong PIN");
    err.response = { data: { message: "Incorrect transaction PIN" } };
    throw err;
  }
  const value = Number(amount);
  if (value > db.wallet.balance) {
    const err = new Error("Insufficient balance");
    err.response = { data: { message: "Insufficient balance" } };
    throw err;
  }
  const receiver = directory.find((d) => d.address.toLowerCase() === String(toAddress).toLowerCase());
  db.wallet.balance = Number((db.wallet.balance - value).toFixed(2));
  db.wallet.outcome = Number((db.wallet.outcome + value).toFixed(2));
  db.wallet.dailyUsed = Number((db.wallet.dailyUsed + value).toFixed(2));
  db.transactions.unshift({
    id: `TXN-Z${Math.floor(1000 + Math.random() * 9000)}`,
    type: "sent",
    status: "completed",
    counterparty: receiver?.name || "Unknown",
    address: toAddress,
    amount: value,
    hash: "0x" + Math.random().toString(16).slice(2).padEnd(40, "0"),
    createdAt: new Date().toISOString(),
  });
  return { message: "Transfer successful" };
}

export async function generateAddress() {
  await delay(400);
  return { address: db.user.walletAddress };
}

export async function getRecents() {
  await delay(400);
  return [...db.recents];
}

export async function addRecent(contact) {
  await delay(300);
  if (!db.recents.some((r) => r.address === contact.address)) {
    db.recents.unshift(contact);
  }
  return { message: "Saved" };
}

// ─── PROFILE ────────────────────────────────────────────────────────────
export async function getProfile() {
  await delay(400);
  return {
    ...db.user,
    balance: db.wallet.balance,
    transactionCount: db.transactions.length,
  };
}

// ─── KYC ────────────────────────────────────────────────────────────────
export async function getKycStatus() {
  await delay(350);
  return { ...db.user.kyc };
}

export async function submitKyc({ level, documents }) {
  await delay(900);
  db.user.kyc = {
    ...db.user.kyc,
    level,
    documents,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  // Simulate an operator (the ZORO admin panel!) reviewing and approving
  // the request shortly after — makes the demo feel alive without a server.
  setTimeout(() => {
    if (db.user.kyc.status === "pending") {
      db.user.kyc.status = "approved";
      db.user.kyc.riskScore = Math.max(5, db.user.kyc.riskScore - 4);
    }
  }, 9000);
  return { message: "KYC submitted for review" };
}

// ─── REFERRALS & REWARDS ───────────────────────────────────────────────
export async function getReferralData() {
  await delay(450);
  return { ...db.referral };
}

export async function getRewards() {
  await delay(450);
  return [...db.rewards];
}

export async function claimReward(id) {
  await delay(600);
  const reward = db.rewards.find((r) => r.id === id);
  if (reward && reward.status === "pending") {
    reward.status = "paid";
    db.wallet.balance = Number((db.wallet.balance + reward.amount).toFixed(2));
  }
  return { message: "Reward claimed" };
}

// ─── MARKET ─────────────────────────────────────────────────────────────
export async function getMarketOverview() {
  await delay(500);
  return { data: db.market };
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────
export async function getNotifications() {
  await delay(400);
  return [...db.notifications];
}

export async function markAllNotificationsRead() {
  await delay(300);
  db.notifications.forEach((n) => (n.read = true));
  return { message: "ok" };
}

// ─── BANK LINKING ───────────────────────────────────────────────────────
export async function getBankAccounts() {
  await delay(350);
  return [...db.bankAccounts];
}

export async function addBankAccount(payload) {
  await delay(800);
  db.bankAccounts.push({ ...payload, id: `BANK-${Date.now()}`, primary: db.bankAccounts.length === 0 });
  return { message: "Bank account added" };
}

export async function setBankTpin() {
  await delay(500);
  return { message: "Bank TPIN created" };
}

export default {
  sendOtp,
  verifyOtp,
  loginWithPassword,
  registerProfile,
  logout,
  setTransactionPin,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  getBalance,
  getIncomeOutcome,
  getWalletDashboard,
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
