# CCD School on iOS and Android

Tauri 2 app. **The phones have no screens of their own.** They open the web app
(`artifacts/ccd-school`), the one source of every screen and every lesson, so anything
finished on the web is on the phones too. The only native part is sound: the CCD engine
(`../engine`, Rust) on each platform's lowest-latency path, with Ableton Link for tempo
with Live (LinkKit 4.1.3 on iOS, Link 4.1.1 on Android and Mac). The web code (`src/engine`) uses the native engine when it is running
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
npm run link:fetch          # LinkKit 4.1.3 (iOS) and Link 4.1.1 (Android) into vendor/
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

Link on iOS is LinkKit, Ableton's free iOS SDK. In the app, the link button opens
Ableton's own Link settings pane (LinkKit requires it); switch Link on there and swipe
the pane down. Two things Apple controls:
1. The local network prompt. It shows the first time Link starts; tap allow.
2. Multicast. Apple requires the `com.apple.developer.networking.multicast`
   entitlement for UDP multicast, which Link uses to find Live. Request it at
   developer.apple.com/contact/request/networking-multicast (it takes a few days).
   Only the account holder of a paid Apple Developer Program membership can open
   that form. A free personal team can run the app on your phone, but without Link.
   Once granted, in Xcode add it under Signing & Capabilities for the
   `ccd-school_iOS` target. Until then, Link may not see Live from the iPhone.
3. Before an App Store release, the app has to pass LinkKit's test plan
   (ableton.github.io/linkkit) and follow `vendor/LinkKit/Ableton_Link_UI_Guidelines.pdf`.

## Android phone

For now Android ships as an unofficial APK, installed by hand (no Play Store). It is
built in the cloud and signed with a test key:

```sh
adb install -r ccd-school-android.apk
```

Or allow installs from unknown sources on the phone and open the APK from Files.

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

- iOS: LinkKit is free and royalty-free under the Ableton Link SDK licence
  (`vendor/LinkKit/LICENSE.md`).
- Android: open-source Link is GPLv2+. Fine for us and testers. If the APK is ever handed
  out publicly, the GPL means offering the app's source with it. A Play Store release
  needs Ableton's proprietary licence; requested from link-devs@ableton.com on 3 Nov 2026.
