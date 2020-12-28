import React, { useState, useEffect } from 'react';
import { AppState } from 'react-native';

const DeviceContext = React.createContext();
const deviceID_default = 'DEFAULT_DEVICE';


const DeviceProvider = (props) => {

  //const [deviceID, setDeviceID] = useState(deviceID_default);
  const [deviceID, setDeviceID] = useState(deviceID_default);
  const [scanning, setScanning] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [peripherals, setPeripherals] = useState( new Map() );
  const [valueState, setValueState] = useState('');

  return (
    //<DeviceContext.Provider value={ {deviceID, setDeviceID}}>
    <DeviceContext.Provider value={ { 
      value1: [deviceID, setDeviceID], 
      value2: [scanning, setScanning],
      value3: [appState, setAppState],
      value4: [peripherals, setPeripherals],
      value5: [valueState, setValueState],
    }}>
      {props.children}
    </DeviceContext.Provider>
  )
}

export { DeviceProvider, DeviceContext };