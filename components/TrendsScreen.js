import React, { useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import { DeviceContext } from './provider/DeviceProvider';


const Stack = createStackNavigator();

export default function TrendsScreen() {

    const ITEM = useContext(DeviceContext);

    return (
      <Stack.Navigator initialRouteName="TrendsComponent">
        <Stack.Screen
          name="TrendsComponent"
          component={TrendsStack}
          options={{ title: 'TrendsStack Title' }}
        />
      </Stack.Navigator>
    );
}

function TrendsStack(){
  const {value1, value2, value3, value4, 
    value5, value6, value7, value8, value9 } = useContext(DeviceContext);
  const [deviceID, setDeviceID] = value1;
  const [scanning, setScanning] = value2;
  const [appState, setAppState] = value3;
  const [peripherals, setPeripherals] = value4;
  const [valueState, setValueState] = value5;
  const [nameState, setNameState] = value6;
  const [profileState, setProfileState] = value7;
  const [serviceState, setServiceState] = value8;
  const [characteristicState, setCharacteristicState] = value9;

  return (
    <View style={styles.container}>
      <Text>This is Trends Screen (a placeholder)</Text>
      <Text>Connected to : {nameState}</Text>
      <Text>Profile UUID : {profileState}</Text>
      <Text>Service UUID : {serviceState}</Text>
      <Text>Characteristic UUID : {characteristicState}</Text>
      <Text>Value : {valueState}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: '#F3F2F8',
    },
});