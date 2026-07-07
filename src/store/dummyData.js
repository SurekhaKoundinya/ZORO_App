// dummyData.js
// Seed data for the self-contained mock backend (see mockApi.js). Shapes are
// deliberately kept close to the ZORO admin panel's src/lib/dummy-data.ts so
// the two apps read as one platform, just seen from the end-user's side
// instead of the operator's side.

export const DEMO_ACCOUNTS = [
  {
    mobile: "9876543210",
    email: "arjun.mehta@gmail.com",
    password: "zoro123",
    pin: "1234",
    name: "Arjun Mehta",
    avatar: "AM",
    country: "India",
  },
  {
    mobile: "9123456789",
    email: "priya.sharma@outlook.com",
    password: "zoro123",
    pin: "1234",
    name: "Priya Sharma",
    avatar: "PS",
    country: "India",
  },
];

// The "logged in" profile — mutated in-memory by mockApi as the user acts.
export const seedCurrentUser = () => ({
  id: "USR-10001",
  name: "Arjun Mehta",
  email: "arjun.mehta@gmail.com",
  mobile: "9876543210",
  avatar: "AM",
  country: "India",
  joinDate: "Mar 12, 2024",
  walletAddress: "0xZR3d4e9f2a1b8c7d5e6f3a2b9c4d8e1f7a3c5d9e2f",
  walletId: "WAL-10001",
  referralCode: "ZORO-AM4821",
  pin: null,
  kyc: {
    level: "Level 1",
    status: "unverified", // unverified | pending | approved | rejected
    submittedAt: null,
    documents: [],
    riskScore: 12,
  },
});

export const seedWallet = () => ({
  balance: 12450.32,
  currency: "ZOR",
  income: 8600,
  outcome: 3120,
  referralRewards: 640,
  dailyLimit: 10000,
  dailyUsed: 1250,
});

// A tiny directory of other "on-platform" users so send / receive / scan-QR
// flows have someone real (in-demo) to resolve to.
export const directory = [
  { name: "Sarah Chen", address: "0xZR5c8d2e1f9a4b7c3d6e8f1a2b5c9d4e7f3a8b1c", avatar: "SC" },
  { name: "Liam O'Brien", address: "0xZR1a3b6d8e2c5f9a4b7e3d1c8f2a5b9e4d7c1f3a6b", avatar: "LO" },
  { name: "Yuki Tanaka", address: "0xZR9e2c7b4f1a3d58096b2e4c7f9a5d1b3e6c8f2d4a", avatar: "YT" },
  { name: "Fatima Al-Hassan", address: "0xZR8b2c4a5e3d8f6b2c9a4d7e1f8b3c5a9d2e7f4a1b", avatar: "FA" },
];

export const seedTransactions = () => [
  {
    id: "TXN-Z1842",
    type: "received",
    status: "completed",
    counterparty: "Sarah Chen",
    address: directory[0].address,
    amount: 480.5,
    hash: "0x8f4e2a91bc37d5f8e1204a3c9d82b7e4f65a12cd",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "TXN-Z1841",
    type: "sent",
    status: "completed",
    counterparty: "Liam O'Brien",
    address: directory[1].address,
    amount: 122.5,
    hash: "0x2b9f8c4a71e3d62890154c7e5a38f91bd4c2e087",
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "TXN-Z1840",
    type: "sent",
    status: "failed",
    counterparty: "Yuki Tanaka",
    address: directory[2].address,
    amount: 58.0,
    hash: "0x6c3e9b2f4d7a1508e3f42c6a9d81b5e7c4f2d3a9",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "TXN-Z1839",
    type: "received",
    status: "completed",
    counterparty: "Fatima Al-Hassan",
    address: directory[3].address,
    amount: 890.0,
    hash: "0x4a8d3c1e7b9f25406e8c3b7a5d92e4f16c3a8b2d",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

export const seedRecents = () => [directory[0], directory[1]];

export const seedMarket = () => [
  { id: "btc", name: "Bitcoin", symbol: "btc", image: null, accent: "#F7931A", price: 76717.27, priceChangePercentage24h: 2.14 },
  { id: "eth", name: "Ethereum", symbol: "eth", image: null, accent: "#627EEA", price: 3421.09, priceChangePercentage24h: -1.32 },
  { id: "zor", name: "ZORO Token", symbol: "zor", image: null, accent: "#FBD12D", price: 4.82, priceChangePercentage24h: 6.71 },
  { id: "usdt", name: "Tether", symbol: "usdt", image: null, accent: "#26A17B", price: 1.0, priceChangePercentage24h: 0.01 },
  { id: "sol", name: "Solana", symbol: "sol", image: null, accent: "#14F195", price: 168.44, priceChangePercentage24h: 4.02 },
  { id: "bnb", name: "BNB", symbol: "bnb", image: null, accent: "#F3BA2F", price: 612.3, priceChangePercentage24h: -0.58 },
  { id: "xrp", name: "XRP", symbol: "xrp", image: null, accent: "#25A768", price: 0.58, priceChangePercentage24h: 1.9 },
  { id: "ada", name: "Cardano", symbol: "ada", image: null, accent: "#0033AD", price: 0.44, priceChangePercentage24h: -2.4 },
];

export const seedReferral = () => ({
  referralCode: "ZORO-AM4821",
  totalUsers: 18,
  successfulReferrals: 14,
  totalRewards: 640,
  pendingRewards: 90,
  rewardPerUser: 50,
  referredUsers: [
    { name: "Marcus Johnson", joinedAt: "Jun 10, 2026", status: "active", reward: 50 },
    { name: "Sophie Laurent", joinedAt: "Jun 2, 2026", status: "active", reward: 50 },
    { name: "James Wilson", joinedAt: "May 28, 2026", status: "pending", reward: 0 },
  ],
});

export const seedRewards = () => [
  { id: "RWD-101", type: "Referral Bonus", amount: 50, status: "paid", date: "Jun 24, 2026" },
  { id: "RWD-102", type: "Trading Reward", amount: 18.4, status: "paid", date: "Jun 20, 2026" },
  { id: "RWD-103", type: "Loyalty Reward", amount: 32, status: "pending", date: "Jun 18, 2026" },
  { id: "RWD-104", type: "Milestone Bonus", amount: 100, status: "pending", date: "Jun 12, 2026" },
];

export const seedNotifications = () => [
  { id: 1, title: "Payment received", message: "You received 480.50 ZOR from Sarah Chen", time: "5 min ago", read: false, type: "success" },
  { id: 2, title: "KYC reminder", message: "Complete Level 2 verification to raise your daily limit", time: "2 hr ago", read: false, type: "warning" },
  { id: 3, title: "Referral bonus", message: "You earned 50 ZOR — Marcus Johnson joined with your code", time: "1 day ago", read: true, type: "success" },
  { id: 4, title: "Security", message: "New login detected on this device", time: "2 days ago", read: true, type: "info" },
];

export const seedBankAccounts = () => [];

export default {
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
};
