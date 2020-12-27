import React, { useState, useEffect } from 'react';

const DeviceContext = React.createContext();
const deviceID_default = 'DEFAULT_DEVICE';


const DeviceProvider = (props) => {

  //const [deviceID, setDeviceID] = useState(deviceID_default);
  const [deviceID, setDeviceID] = useState(deviceID_default);

  return (
    <DeviceContext.Provider value={ {deviceID, setDeviceID}}>
      {props.children}
    </DeviceContext.Provider>
  )
}

export { DeviceProvider, DeviceContext };