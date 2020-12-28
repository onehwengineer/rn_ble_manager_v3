import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ScrollView,
  AppState,
  FlatList,
  Dimensions,
  Button,
  SafeAreaView
} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import { DeviceContext } from './provider/DeviceProvider';


const Stack = createStackNavigator();


export default function HomeScreen() {
  return (
      <Stack.Navigator initialRouteName="HomeStackMain">
        <Stack.Screen
          name="HomeStackMain"
          component={HomeStackMain}
          options={{ title: 'HomeStackMain Title' }}
        />
        <Stack.Screen
          name="HomeStackSub"
          component={HomeStackSub}
          options={{ title: 'HomeStackSub Title' }}
        />
      </Stack.Navigator>
  );
}


function HomeStackMain( {navigation} ){
  // const ITEM = useContext(DeviceContext);
  const {value1, value2, value3, value4, value5} = useContext(DeviceContext);
  const [deviceID, setDeviceID] = value1;
  const [scanning, setScanning] = value2;
  const [appState, setAppState] = value3;
  const [peripherals, setPeripherals] = value4;
  const [valueState, setValueState] = value5;
  //console.log(JSON.stringify(ITEM.deviceID));
  //console.log(JSON.stringify(deviceID));

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
          if (result) {
            console.log("Permission is OK");
          } else {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
              if (result) {
                console.log("User accept");
              } else {
                console.log("User refuse");
              }
            });
          }
      });
    }

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      this.handlerDiscover.remove();
      this.handlerStop.remove();
      this.handlerDisconnect.remove();
      this.handlerUpdate.remove();
    }
  }, []);  

  const handleAppStateChange = nextAppState => {
    console.log('[handleAppStateChange()] App State: ' + nextAppState);
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('[handleAppStateChange()] App has come to the foreground!');
      // alert('App State: ' + nextAppState);
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('[handleAppStateChange()] Connected peripherals: ' + peripheralsArray.length);
      });
    }
    setAppState(nextAppState);
  };  

  const handleDiscoverPeripheral = peripheral => {
    var peripherals_in = peripherals;
    console.log('[handleDiscoverPeripheral()] Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    //peripherals_in.set(peripheral.id, peripheral);
    //setPeripherals(peripherals_in);
    setPeripherals(prev => new Map([...prev, [peripheral.id, peripheral]]));
  }

  const handleStopScan = () => {
    console.log('[handleStopScan()] Scan is stopped');
    setScanning(false);
  };

  const handleDisconnectedPeripheral = data => {
    let peripherals_in = peripherals;
    let peripheral = peripherals_in.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      //peripherals_in.set(peripheral.id, peripheral);
      //setPeripherals(peripherals_in);
      setPeripherals(prev => new Map([...prev, [peripheral.id, peripheral]]));
    }
    console.log('[handleDisconnectedPeripheral()] Disconnected from ' + data.peripheral);
  }

  const handleUpdateValueForCharacteristic = data => {
    console.log('[handleUpdateValueForCharacteristic()] Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }; 



  const startScan = () => {
    if (!scanning) {
      //this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then((results) => {
        console.log('[startScan()] Scanning...');
        setScanning(true);
        console.log('[startScan()] scanning : ' + scanning.toString());
      });
    }
  };


  const test = peripheral => {
    if (peripheral){
      if (peripheral.connected){
        BleManager.disconnect(peripheral.id);
      }else{
        BleManager.connect(peripheral.id).then(() => {
          let peripherals_in = peripherals;
          let p = peripherals_in.get(peripheral.id);
          if (p) {
            p.connected = true;
            //peripherals_in.set(peripheral.id, p);
            //setPeripherals(peripherals_in);
            setPeripherals(prev => new Map([...prev, [peripheral.id, p]]));
          }
          console.log('[test()] Connected to ' + peripheral.id);


          setTimeout(() => {
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log('[test()] peripheralInfo : ' + JSON.stringify(peripheralInfo));
              var service = peripheralInfo["characteristics"][0]["service"];
              console.log('[test()] service : ' + JSON.stringify(service));
              var characteristics = peripheralInfo["characteristics"];
              console.log('[test()] characteristics : ' + JSON.stringify(characteristics));
              var characteristic = peripheralInfo["characteristics"][0]["characteristic"];
              console.log('[test()] characteristic : ' + JSON.stringify(characteristic));

              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, characteristic).then(() => {
                  console.log('[test()] Started notification on ' + JSON.stringify(peripheral.id));
                  bleManagerEmitter.addListener(
                    "BleManagerDidUpdateValueForCharacteristic",
                    ({ value, peripheral, characteristic, service }) => {
                      // Convert bytes array to string
                      const data = bytesToString(value);
                      console.log(`[test()] Recieved ${data} for characteristic ${characteristic}`);
                      setValueState(data);
                    }
                  );
                }).catch((error) => {
                  console.log('[test()] Notification error', error);
                });
              }, 200);
            });

          }, 900);
        }).catch((error) => {
          console.log('[test()] Connection error', error);
        });
      }
    }
  }; 


  const renderItem = item => {
    console.log("item : " + JSON.stringify(item) );
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={()=>test(item) }>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>Value: {valueState}</Text>
          <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  const list = Array.from(peripherals.values());
  const btnScanTitle = 'Scan Bluetooth (' + (scanning ? 'on' : 'off') + ')';

  // Fix : VirtualizedLists should never be nested inside plain ScrollViews ...
  const getHeader = (list) => {
    if (list.length == 0) {
      return (
        <View style={{flex:1, margin: 20}}>
          <Text style={{textAlign: 'center'}}>No peripherals</Text>
        </View>
      );
    } else { return null; }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text>This is Home Screen MAIN</Text>
        <Text>Current Device ID is : {deviceID}</Text>
        
        <Button
          title='Go to SUB Component'
          onPress={() => navigation.navigate('HomeStackSub')} />
        
        <View style={{margin: 10}}>
          <Button title={btnScanTitle} onPress={startScan } />
        </View>
        
        {/*
        <View style={{margin: 10}}>
          <Button title="Retrieve connected peripherals" onPress={retrieveConnected} />
        </View>
        */}
        <FlatList
          data={list}
          renderItem={({ item }) => renderItem(item) }
          keyExtractor={item => item.id}
          ListHeaderComponent={getHeader(list)}
        />
      </View>
    </SafeAreaView>
  );
}


function HomeStackSub( {navigation} ){
  // const ITEM = useContext(DeviceContext);
  const {value1, value2} = useContext(DeviceContext);
  const [deviceID, setDeviceID] = value1;
  const [scanning, setScanning] = value2;
  //console.log(JSON.stringify(ITEM.deviceID));
  console.log(JSON.stringify(deviceID));

  return (
    <View style={ styles.container }>
      <View style={styles.container}>
        <Text>Home Screen SUB</Text>
        <Text>Current Device ID is : {deviceID}</Text>
        {/*}
        <Button
          title='Go to MAIN Component'
          onPress={() => navigation.navigate('HomeStackMain')} />
        */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: '#F3F2F8',
    },
    row: {
      margin: 10
    },
});