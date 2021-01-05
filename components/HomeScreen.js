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
import {bytesToString} from 'convert-string';
import { createStackNavigator } from '@react-navigation/stack';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const window = Dimensions.get('window');

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
      if (peripheral.connected){ // If already connected, subsequent click will disconnect
        BleManager.disconnect(peripheral.id);
      } else{
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
              var name = peripheralInfo["name"];
              setNameState(name);
              console.log('[test()] name : ' + JSON.stringify(name));
              var profile = peripheralInfo["id"];
              setProfileState(profile);
              console.log('[test()] profile : ' + JSON.stringify(profile));
              var service = peripheralInfo["characteristics"][0]["service"];
              setServiceState(service);
              console.log('[test()] service : ' + JSON.stringify(service));
              var characteristics = peripheralInfo["characteristics"];
              console.log('[test()] characteristics : ' + JSON.stringify(characteristics));
              var characteristic = peripheralInfo["characteristics"][0]["characteristic"];
              setCharacteristicState(characteristic);
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
      //<TouchableHighlight onPress={()=>test(item) }>
      <TouchableHighlight onPress={() => {
        //setNameState(item.name);
        if (!item.connected){
          navigation.navigate('HomeStackSub');
        }
        test(item);
      }}>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
          {/* <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>Value: {valueState}</Text> */}
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
          <Text style={{textAlign: 'center'}}>No peripherals found</Text>
          <Text style={{textAlign: 'center'}}>Click "Scan Bluetooth (off)" to get started</Text>
        </View>
      );
    } else { 
      return (
        <View style={{flex:1, margin: 20}}>
          <Text style={{textAlign: 'center'}}>Click on a BLE name to connect</Text>
        </View>
      );
      // return null; 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerSub}>
        <Text>This is Home Screen MAIN</Text>
        {/*}
        <Text>Current Device ID is : {deviceID}</Text>
        <Button
          title='Go to SUB Component'
          onPress={() => navigation.navigate('HomeStackSub')} />
        */}
        <View style={{margin: 10}}>
          <Button title={btnScanTitle} onPress={startScan } />
        </View>
        
        {/*
        <View style={{margin: 10}}>
          <Button title="Retrieve connected peripherals" onPress={retrieveConnected} />
        </View>
        */}
        <FlatList style={styles.scroll}
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

  // Deconstruct BLE data 
  var deconstructed_a = valueState.split(",");
  var MOI = deconstructed_a[0];
  var PH = deconstructed_a[1];
  var TEMP = deconstructed_a[2];
  var PHOTO = deconstructed_a[3];
  var BAT = deconstructed_a[4];

  return (
    <View style={ styles.container }>
      <Text>Home Screen SUB</Text>
      <Text>Connected to : {nameState}</Text>
      <Text>Profile UUID : {profileState}</Text>
      <Text>Service UUID : {serviceState}</Text>
      <Text>Characteristic UUID : {characteristicState}</Text>
      <Text>All BLE Data : {valueState}</Text>
      <View></View>
      <Text>DECONSTRUCTED BLE DATA</Text>
      <Text>Moisture : {MOI}</Text>
      <Text>pH : {PH}</Text>
      <Text>Temperature : {TEMP}</Text>
      <Text>Brightness : {PHOTO}</Text>
      <Text>Battery : {BAT}</Text>
      {/*}
      <Button
        title='Go to MAIN Component'
        onPress={() => navigation.navigate('HomeStackMain')} />
      */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: '#F3F2F8', // debug '#00BFFF',
      width: window.width,
      height: window.height
    },
    containerSub: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: '#F3F2F8', // debug '#FF00FF',
      width: "90%",
    },
    scroll: {
      flex: 1,
      backgroundColor: '#FFF', // debug '#00FF00',
      borderRadius: 16,
      margin: 10,
      width: "90%"
    },
    row: {
      //width: "90%",
      margin: 10
    },
});