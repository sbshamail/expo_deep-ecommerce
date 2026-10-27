push in expo /For Testing via Expo Go

```bash
eas update --branch main --message "First update" //push code
```

directly build and deploy to expo no expo app needed to run

```bash
eas build -p android --profile preview // building, preview and download link
--clear-cache //clear the cache
#If You Want Faster Local Testing:
npx expo install expo-dev-client #if not install
npx expo run:android --variant development
rm -rf android ios .expo .expo-shared
rm -rf ~/.gradle

```

# Pull from Emulator

```shell
adb shell pm path com.hamail1223.opentravel
# package:/data/app/~~9L0kpMFH6eyR75-HBfe32w==/com.hamail1223.opentravel-5L8TA4PMJ8p7UvZX5nIW2w==/base.apk
adb pull /data/app/~~9L0kpMFH6eyR75-HBfe32w==/com.hamail1223.opentravel-5L8TA4PMJ8p7UvZX5nIW2w==/base.apk ~/Downloads/OpenTravel.apk
```

# build

<https://docs.expo.dev/build/setup/>

```shell
eas build:configure
#local only work if android studio installed
eas build --local --platform android #Note: You need Android Studio + Android SDK + eas-cli installed
--profile preview
# for local builds.
```

# credentials

```shell

eas credentials -p android
```

# TEST

1. Run the same checks EAS runs first (about 20 s). Run these from expo-frontend:

```sh
npx expo-doctor
```

EAS runs this exact check first. It catches config, asset and dependency-version problems.

2. Run prebuild locally. This is the step that failed for you.

```sh
npx expo prebuild --platform android --no-install --clean

```

It generates the android/ folder without building anything, and it needs no Android Studio.
Your webp icon error would have appeared here in seconds.
It reads app.json and every config plugin, which are the most likely things to break.
Delete android/ afterwards, or confirm it's in .gitignore. The folder is generated, so you shouldn't commit it or edit it by hand.

3. Check the code itself (about 30 s).

```sh
npx tsc --noEmit
npx expo lint
```

4. Test that the JavaScript bundles (about 1 min).

```sh
npx expo export --platform android
```

This runs Metro, the bundler, and catches import errors, missing files and syntax problems. Delete the dist/ folder afterwards.
