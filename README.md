## rn_ble_manager_v3
React Native app serving as a client to ESP32 (server), connecting via BLE. <br>
Data broadcasted from ESP32 is displayed real-time.<br>
This app does NOT work in Simulator -> **App must be run in an actual device.**<br>
<br>
**This is an updated version of [rn_ble_manager_v2](https://github.com/onehwengineer/rn_ble_manager_v2)** <br>
For a step-by-step tutorial on how to launch this app in an iPhone, go [here](https://github.com/onehwengineer/rn_ble_manager_v2)<br>
(NOT tested under Android environment).<br>
<br>
Arduino script (.ino) for ESP32 is [here](https://github.com/onehwengineer/arduino_esp32_ble_v2)
You need BOTH Arduino script and this app to run this project!
Download Arduino script from above and flash on to your ESP32.

> **Change Logs**
> [paulo2]
> - Fixed : Green background toggle on/off issues with connection/disconnection
> - For debug, added counter to display relevant items once per each render
> - Updated var names to make more intuitive
> - Cleaned up for a better flow
> - Tested for multiple connect/disconnects
