# ZORO Mobile

The ZORO mobile wallet app — built with the **bare React Native CLI**
(no Expo), using the previously delivered **Payo** app as a structural
reference and the **ZORO admin panel** for branding (gold `#FBD12D` on
near-black `#0A0A0A`) and feature parity (KYC review, rewards, referrals).

This is a **fully self-contained demo**: there is no real backend. Every
screen talks to an in-memory mock API (`src/store/mockApi.js`) seeded with
demo data (`src/store/dummyData.js`), so once dependencies are installed the
app runs standalone — no server, database, or `.env` required.

## Prerequisites

- Node.js LTS
- A full **React Native Android environment**: Android Studio, an Android
  SDK (API 34) + build tools installed through the SDK Manager, and either a
  running emulator or a physical device with USB debugging on.
- `JAVA_HOME` and `ANDROID_HOME`/`ANDROID_SDK_ROOT` set up the way Android
  Studio's own "SDK Location" screen shows (this is the same environment the
  Payo app builds against).

## Running it

```bash
npm install
npx react-native run-android
```

`npm install` pulls every native dependency (React Navigation, AsyncStorage,
the camera/clipboard/gradient/icon libraries, etc.). `npx react-native
run-android` builds the native Android project under `android/` with Gradle
and installs + launches the app on whichever emulator/device is connected —
this is the same command you already use for the Payo app.

Metro (the JS bundler) starts automatically as part of that command. If you
ever need to start it by itself (e.g. after closing its terminal window),
run:

```bash
npx react-native start
```

### One thing to do the very first time

Gradle wrapper JARs are compiled Java binaries, not plain text, so the one
file this project can't ship pre-built is
`android/gradle/wrapper/gradle-wrapper.jar` (everything else the wrapper
needs — `gradlew`, `gradlew.bat`, `gradle-wrapper.properties` — is included).
The very first time you open `android/` in Android Studio or run
`./gradlew` from that folder, either:

- let Android Studio sync the project — it detects the incomplete wrapper
  and downloads the matching `gradle-wrapper.jar` automatically, or
- run this once from the `android/` folder yourself, using the Gradle
  bundled with Android Studio:
  ```bash
  gradle wrapper --gradle-version 8.6
  ```

After that one-time step, `npx react-native run-android` works exactly like
any other bare React Native project.

## Demo credentials

- Email/password login: `arjun.mehta@gmail.com` / `zoro123`
- Any mobile-OTP flow (login, register, forgot password): OTP is always `1234`
- Transaction PIN: set your own during onboarding, or use `1234` if prompted

## What's inside

- `App.jsx` — root component: `SafeAreaProvider` → `ThemeProvider` →
  `AuthProvider` → `AppNavigator`.
- `index.js` — the RN entry point (`AppRegistry.registerComponent`).
- `android/` — the native Android project (Gradle build files, manifest,
  `MainActivity.kt`/`MainApplication.kt`, launcher icons) that
  `react-native run-android` builds.
- `src/theme/` — shared gold/black design tokens mirroring the admin panel's
  CSS variables, plus light/dark palettes. (`.js` — no JSX here.)
- `src/context/` — `ThemeContext` (light/dark, persisted) and `AuthContext`
  (session persisted via AsyncStorage, wraps the mock auth API).
- `src/store/` — `dummyData.js` (seed data) and `mockApi.js` (the fake
  backend — every function returns a Promise with an artificial delay, same
  call shape as a real `axios` call). Both plain `.js`, no JSX.
- `src/navigation/` — `AppNavigator.jsx` (root stack, swaps between
  Splash/Onboarding/Auth/Main screen groups based on auth state) and
  `MainTabs.jsx` (bottom tab bar: Home, Wallet, Market, Profile).
- `src/screens/` — every screen, grouped by feature: `Auth`, `KYC`, `Home`,
  `Wallet`, `Send`, `Bank`, `Market`, `Profile`. All `.jsx`.
- `src/components/` — shared UI: `ZoroLogo`, `ScreenContainer`,
  `PrimaryButton`, `InputField`, `Header`, `Card`, `StatusBadge`,
  `LoadingOverlay`, `EmptyState`. All `.jsx`.

## Feature flow

1. **Onboarding** → **Register/Login** (password or mobile OTP) → **Profile
   setup** → **Transaction PIN** → drops into the main app.
2. **Home** — balance card, quick actions (Send/Receive/Scan/Bank), KYC
   nudge banner, recent activity.
3. **Send** — enter address or scan a QR → amount → PIN confirm → success.
4. **Receive** — your own QR code + shareable wallet address.
5. **Wallet** — balance, income/outcome, daily limit usage, referral rewards.
6. **KYC** — intro → document "upload" (simulated) → status screen that
   polls and auto-approves after ~9 seconds, echoing the admin panel
   reviewing and approving a request.
7. **Market** — demo price list with a per-coin detail chart.
8. **Profile** — edit profile, refer & earn, rewards (claimable), linked
   bank accounts, settings (light/dark toggle), log out.

## Library choices (bare-workflow equivalents of Payo's native modules)

This project targets the **bare React Native CLI**, matching how the Payo
reference app is built and run. Where the app needs a native capability, it
uses:

- `react-native-camera-kit` — QR code scanning (Send → Scan a QR)
- `@react-native-clipboard/clipboard` — copy-to-clipboard (Wallet, Receive,
  Refer & Earn)
- `react-native-linear-gradient` — gradient cards (Home, Wallet, Refer &
  Earn, Splash)
- `react-native-vector-icons` (Ionicons) — every icon in the app
- `@react-native-async-storage/async-storage` — theme + session persistence
- `react-native-qrcode-svg` — rendering your own wallet QR on the Receive
  screen (pure SVG, no native module needed)
- `react-native-screens` / `react-native-safe-area-context` — required by
  React Navigation
