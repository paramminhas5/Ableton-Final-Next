# CCD School on iOS and Android

Tauri 2 app. **The phones have no screens of their own.** They open the web app
(`artifacts/ccd-school`), the one source of every screen and every lesson, so anything
finished on the web is on the phones too. The only native part is sound: the CCD engine
(`../engine`, Rust) on each platform's lowest-latency path, with Ableton Link 4.1.1 for
tempo with Live. The web code (`src/engine`) uses the native engine when it is running
inside the app, and WebAssembly in a browser.

Which address the app opens is set in `app-url.json` (use the Vercel preview of the
branch you are testing). While developing, the app opens your Mac's dev server instead
(`build.devUrl` in `src-tauri/tauri.conf.json`).

- iOS: RemoteIO, 64-frame buffer requested, playback session.
- Android: AAudio, low-latency mode, exclusive stream, two-burst buffer.
- Mac desktop (`npm run dev`): cpal, handy for testing Link next to Live.

For the spike it opens the engine lab (`/lab/engine`).

## One-time setup (Mac)

```sh
# Rust targets
rustup target add aarch64-apple-ios aarch64-apple-ios-sim aarch64-linux-android

# from this folder
cd mobile
npm install
npm run link:fetch          # Ableton Link 4.1.1 into vendor/link
```

You need Xcode 16 or later with your Apple developer team selected. CocoaPods is not
needed (Tauri uses Swift Package Manager).

## Developing against your Mac

Run the web app so the phone can reach it, then the app:

```sh
cd artifacts/ccd-school && npx next dev -H 0.0.0.0 -p 3000
```

## iPhone

```sh
cd mobile
npm run ios:init            # first time only: generates src-tauri/gen/apple
npm run ios:dev -- --open   # opens Xcode; pick your iPhone and press run
```

In Xcode, set Signing & Capabilities > Team for the `ccd-school_iOS` target the first
time. For a build without the dev server: `npm run ios:build`.

Ableton Link on iOS needs two things Apple controls:
1. The local network prompt. It shows the first time Link starts; tap allow.
2. Multicast. Apple requires the `com.apple.developer.networking.multicast`
   entitlement for UDP multicast, which Link uses to find Live. Request it at
   developer.apple.com/contact/request/networking-multicast (it takes a few days).
   Until it is granted, Link may not see Live from the iPhone.

## Android phone

A debug APK is built in the cloud: `src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`.
The engine inside it is fully optimised.

```sh
adb install -r app-universal-debug.apk
```

Or build it yourself (Android Studio with the NDK installed, `ANDROID_HOME` and
`NDK_HOME` set):

```sh
cd mobile
npm run android:build -- --debug
```

## The tests to run on each phone

1. Open the app, press start audio. The audio path line shows the platform, sample
   rate, buffer size and output latency.
2. **Latency.** Volume up, phone flat. Press "measure with mic", allow the mic, then tap
   the rim pad with a fingernail right next to the mic, 20 times. Press copy and paste
   the results into the chat.
3. **Link.** Phone and Mac on the same Wi-Fi. In Live, turn Link on (Preferences > Link,
   Tempo & MIDI). In the app press link, then play loop. The app should show 1 peer,
   take Live's tempo, and the loop should land on Live's bars. Change the tempo in Live:
   the app follows. Change it in the app with + and -: Live follows.

## Licences

Ableton Link is GPLv2+ or a commercial licence from Ableton. A closed App Store or Play
Store release needs the commercial licence (link-devs@ableton.com).
