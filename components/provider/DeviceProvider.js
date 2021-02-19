import React, { useState, useEffect } from 'react';
import { AppState } from 'react-native';

const DeviceContext = React.createContext();
const deviceID_default = 'DEFAULT_DEVICE';


const DeviceProvider = (props) => {

    const [appState, setAppState] = useState(AppState.currentState);
    const [scanning, setScanning] = useState(false);
    const [connected, setConnected] = useState(false);

    const [bleDevices, setBleDevices] = useState( new Map() );
    const [nameState, setNameState] = useState('undefined');
    const [profileState, setProfileState] = useState('undefined');
    const [serviceState, setServiceState] = useState('undefined');
    const [characteristicState, setCharacteristicState] = useState('undefined');
    const [valueState, setValueState] = useState('');

    return (
        //<DeviceContext.Provider value={ {deviceID, setDeviceID}}>
        <DeviceContext.Provider value={ { 
            APPSTATE:  [appState, setAppState],
            SCANNING:  [scanning, setScanning],
            CONNECTED: [connected, setConnected],
            
            BLEDEVICES: [bleDevices, setBleDevices],
            NAME: [nameState, setNameState],
            PROFILE: [profileState, setProfileState],
            SERVICE: [serviceState, setServiceState],
            CHARACT: [characteristicState, setCharacteristicState],
            VALUE: [valueState, setValueState],
        }}>
            {props.children}
        </DeviceContext.Provider>
  )
}

export { DeviceProvider, DeviceContext };