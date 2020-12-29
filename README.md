## rn_ble_manager_v2
React Native app serving as a client to ESP32 (server), connecting via BLE. <br>
Data broadcasted from ESP32 is displayed real-time.
> This app is a modified version of the example app in https://github.com/innoveit/react-native-ble-manager. Changes are : <br>
> 1) Class components -> Function components with hooks <br>
> 2) Displaying data broadcasted from ESP32 in real-time <br>
> 3) Using Context() as a global var to store States across various screens <br>
> 4) Using Stack & Bottom-Tab navigators <br>

## Snapshots
To be included <br>

## Install React Native
But there are many prerequisites we need to install before we can install RN.<br>
Make sure ALL are installed.
- [1] Install **Homebrew**
  - Homebrew is a package manager that let's you install stuff that Apple or Linux didn't need
  - Open Terminal, and paste :
  - ```/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"```
  - This will also install **Xcode Command Line Tools** (this step takes a while... 2.5GB)
- [2] Install **Node JS**
  - ```brew install node```
- [3] Install **React Native Client**
  - `sudo npm i -g react-native-cli`
  - `# i for install, -g for global` <br>

To build ios projects under Xcode, we need the following as well (yarn is good to have). 
- [4] Install **CocoaPods**
  - CocoaPods is a dependency manager for Swift and Objective-C Cocoa projects.
  - `brew install cocoapods`
  - ~~`sudo gem install cocoapods`~~
- [5] Install **Watchman**
  - React Native uses watchman to detect when you've made code changes and then automatically build and push the update your device without you needing to manually refresh it (live reload).
  - `brew install watchman`
- [6] Install **Yarn**
  - Yarn is a new JavaScript package manager built by Facebook, Google, Exponent and Tilde.
  - `brew install yarn`
  
  
## Clone This Repository
>To do so, check if Git is installed by `git --version`. <br>
>If nothing shows up, you need to install Xcode, which will install Git.<br>
>Check if Xcode is installed by `xcode-select -p` <br>
>If directory exists, Xcode is installed. Otherwise, install Xcode from App Store.

From your local machine, open Terminal, and go to (`cd` into) a directory where you would like to copy (clone) this project. <br>
Do NOT create project directory, since `clone` will create a project directory with the name `rn_ble_manager_v2`.

- Paste following : <br>
- `git clone https://github.com/onehwengineer/rn_ble_manager_v2.git`

You will now notice that [your project dir]/rn_ble_manager_v2 is created. <br>


## Install All Node Libraries/Dependencies in Cloned Project (as specified under packages.json)
- From Terminal, `cd` into /rn_ble_manager_v2
- Type : `npm install`
- Next, `cd` into /ios (a sub-directory of rn_ble_manager_v2), and type `pod install`
- `cd ..` to go back to project directory

## [IMPORTANT] MUST DO THIS STEP
For any apps with react-native-vector-icons library, below steps must be done after cloning. <br>
Otherwise, *failed to build ios project... error code 65* will show up when `react-native run-ios` is run.

- [1] Unlink react-native-vector-icons library
  - `react-native unlink react-native-vector-icons` 
  - `cd ios` -> `pod install` -> `cd ..`
- [2] Install again
  - `npm install --save react-native-vector-icons` **—save** is important here
  - `cd ios` -> `pod install` -> `cd ..`
- [3] Add fonts manuall for ios and android (use your text editor - I use VSCode)
  - [ios] Go to [project name]/ios/[project name]/**info.plist** 
  - Add the fonts BELOW UIAppFonts array 
  ```console
  <key>UIAppFonts</key>
    <array>
      <string>AntDesign.ttf</string>
      <string>Entypo.ttf</string>
      <string>EvilIcons.ttf</string>
      <string>Feather.ttf</string>
      <string>FontAwesome.ttf</string>
      <string>FontAwesome5_Brands.ttf</string>
      <string>FontAwesome5_Regular.ttf</string>
      <string>FontAwesome5_Solid.ttf</string>
      <string>Foundation.ttf</string>
      <string>Ionicons.ttf</string>
      <string>MaterialIcons.ttf</string>
      <string>MaterialCommunityIcons.ttf</string>
      <string>SimpleLineIcons.ttf</string>
      <string>Octicons.ttf</string>
      <string>Zocial.ttf</string>
    </array>
  ```
    - Save -> restart VSCode (or any other text editor) & metro bundler (Terminal)
    - [android] Add this line to android/app/**build.gradle**
    - `apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"`
    
## Run App on Simulator
- In Terminal, make sure you are inside the project directory
- Type 'react-native run-ios`
- Note that first build takes a while - be patient

## Run App on Actual Device (iPhone)
> For this step, **make sure to use your PERSONAL laptop/iphone**
- [1] Sign up for Apple Developer account
  - https://developer.apple.com/
  - Make sure to make this account separate from your personal

