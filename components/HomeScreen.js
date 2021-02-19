import React, { useState, useEffect, useContext } from 'react';
import {
	StyleSheet, Text, View, TouchableHighlight, NativeEventEmitter, NativeModules,
	Platform, PermissionsAndroid, AppState, FlatList, Dimensions,
	Button, SafeAreaView
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { DeviceContext } from './provider/DeviceProvider';

import {bytesToString} from 'convert-string';
import BleManager from 'react-native-ble-manager';

// BLE Objects
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Stack Object
const Stack = createStackNavigator();

// Global Vars
const window = Dimensions.get('window');
var COUNTER = 0;
const COUNTER_renderItem_default = 10;
var COUNTER_renderItem = COUNTER_renderItem_default; // Some # larger than main COUNTER



// **************************************************************************************
// **************************************************************************************
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



// **************************************************************************************
// **************************************************************************************
function HomeStackMain( {navigation} ){

	const { APPSTATE, SCANNING, CONNECTED,
            BLEDEVICES, NAME, PROFILE, SERVICE, CHARACT, VALUE } = useContext(DeviceContext);
	
    const [appState, setAppState] = APPSTATE;
	const [scanning, setScanning] = SCANNING;
    const [connected, setConnected] = CONNECTED;

	const [bleDevices, setBleDevices] = BLEDEVICES;
	const [nameState, setNameState] = NAME;
	const [profileState, setProfileState] = PROFILE;
	const [serviceState, setServiceState] = SERVICE;
	const [characteristicState, setCharacteristicState] = CHARACT;
	const [valueState, setValueState] = VALUE;

	useEffect(() => {
		AppState.addEventListener('change', handleAppStateChange);
		BleManager.start({showAlert: false});

		this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (bleDevice) => {
            // Only print discovered devices on the first scan
            // COUNTER : Scan (0->1) -> Click -> Discover (1->2) -> renderItem
			if (COUNTER == 1 ){ console.log('[handlerDiscover()] bleDevice', bleDevice); }
			if (bleDevice.name && bleDevice.name.includes('xyz')) {
				if (COUNTER == 1 ){ console.log('[handlerDiscover()] Found Profile name : xyz'); }
				setBleDevices(prev => new Map([...prev, [bleDevice.id, bleDevice]]));
			}
            COUNTER++;
		});

		this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', () => {
		    setScanning(false);
            console.log('[handleStopScan()] Scan is stopped');
            // Reset counters
            console.log( "[handlerStop()] COUNTER : ", COUNTER );
            console.log( "[handlerStop()] COUNTER_renderItem : " , COUNTER_renderItem);
            COUNTER = 0;
            COUNTER_renderItem = COUNTER_renderItem_default;
            console.log( "[handlerStop()] COUNTER (reset) : ", COUNTER );
            console.log( "[handlerStop()] COUNTER_renderItem (reset) : " , COUNTER_renderItem);
            console.log( '[handlerStop()] **********************************************');
        });

		this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (bleDevice) => {
            // console.log( '[handlerDisconnect()] bleDevice : ', bleDevice );
            /*
                 { 
                     "peripheral": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969" 
                }
            */
            console.log('[handlerDisconnect()] Disconnected from Profile UUID : ' + bleDevice.peripheral);

            // Reset counters
            COUNTER = 0;
            COUNTER_renderItem = COUNTER_renderItem_default;
            console.log( "[handlerDisconnect()] COUNTER (reset) : ", COUNTER );
            console.log( "[handlerDisconnect()] COUNTER_renderItem (reset) : " , COUNTER_renderItem);
            console.log('[handlerDisconnect()] ****************************************');
        });

		this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', (bleDevice) => {
            // console.log("[handlerUpdate()] bleDevice : ", bleDevice );
            /*
                {
                    "peripheral": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969", 
                    "service": "4FAFC201-1FB5-459E-8FCC-C5C9C331914B", 
                    "characteristic": "4A154D60-4767-469D-A86E-5A3FC5BBC6AC", 
                    "value": [57, 57, 44, 52, 52, 50, 44, 52, 50, 57, 44, 54, 48, 56, 44, 57, 51, 55]
                }
            */
            const value_str = bytesToString(bleDevice.value);
            setValueState(value_str);
            console.log(`[handlerUpdate()] Received ${value_str} for characteristic ${bleDevice.characteristic}`);
        });

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

	const startScan = () => {
		if ( !scanning ) {
			BleManager.scan([], 2, true).then((results) => {
				setScanning(true);
                bleDevices.clear(); // Clear previous new Map() object (bleDevices) before each scan
				
                console.log('\n', '\n');
                console.log('[startScan()] ************************************************');
				console.log('[startScan()] Scanning...');
                
                COUNTER++;
                COUNTER_renderItem = COUNTER_renderItem_default; // Reset at start of each scan
                console.log( "[startScan()] COUNTER : ", COUNTER );
                console.log( "[startScan()] COUNTER_renderItem : " , COUNTER_renderItem);
			});
		}
	};
                /* 
                {    
                    "name":"xyz:Homerun.ai",
                    "id": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969",
                    "rssi": -58,
                    "advertising": {
                        "kCBAdvDataTimestamp": 635362013.874371,
                        "isConnectable": 1,
                        "localName": "xyz:Homerun.ai",
                        "txPowerLevel": 3
                    }
                } 
                */
	const connectAndPrepare = (bleDevice) => {
        // console.log( '[connectAndPrepare()] bleDevice : ', bleDevice );
        /*
            {
                "name": "xyz:Homerun.ai", 
                "id": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969", 
                "rssi": -61,
                "connected": true, <----------------------------------------!!!!
                "advertising": {
                    "isConnectable": 1, 
                    "kCBAdvDataTimestamp": 635366304.922352, 
                    "localName": "xyz:Homerun.ai", 
                    "txPowerLevel": 3
                }
            }
        */
		if ( bleDevice ){
			if ( bleDevice.connected ){ 
                // If already connected, subsequent click will disconnect
				BleManager.disconnect(bleDevice.id).then(() => {
                    let bleDeviceToDisconnect = bleDevices.get(bleDevice.id);
                    if ( bleDeviceToDisconnect ){
                        bleDeviceToDisconnect.connected = false;
                        setConnected(false);
                    } else {
                        alert(`[connectAndPrepare()] Cannot disconnect from ${bleDeviceToDisconnect.name}. Maybe device already turned off?`);
                    }
                    console.log('\n', '\n');
                    console.log('[connectAndPrepare()] ****************************************');
					console.log('[connectAndPrepare()] Disconnected from : ' + bleDeviceToDisconnect.name);
                }).catch((error) => {
					console.log('[connectAndPrepare()] Disconnection error : ', error);
				});
			} else {
				BleManager.connect(bleDevice.id).then(() => {
					let bleDeviceToConnect = bleDevices.get(bleDevice.id);
					if ( bleDeviceToConnect ) {
						bleDeviceToConnect.connected = true;
                        setConnected(true);
						setBleDevices(prev => new Map( [...prev, [bleDeviceToConnect.id, bleDeviceToConnect]] ));
					} else {
                        alert(`[connectAndPrepare()] Cannot connect to ${bleDeviceConnect.name}. Is device powered on?`);
                    }
                    console.log('\n', '\n');
					console.log('[connectAndPrepare()] Connected to : ' + bleDeviceToConnect.name);

					setTimeout(() => {
						BleManager.retrieveServices(bleDevice.id).then((bleDeviceDetails) => {
							// console.log('[test()] bleDeviceDetails : ' + JSON.stringify(bleDeviceDetails));
                            /*
                            {
                                "id": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969",
                                "advertising": {
                                    "kCBAdvDataTimestamp": 635362015.787799,
                                    "isConnectable": 1,
                                    "localName": "xyz:Homerun.ai",
                                    "txPowerLevel": 3
                                },
                                "name": "xyz:Homerun.ai",
                                "rssi": -62,
                                "services": ["4FAFC201-1FB5-459E-8FCC-C5C9C331914B"],
                                "characteristics": [
                                    { 
                                        "service": "4FAFC201-1FB5-459E-8FCC-C5C9C331914B",
                                        "characteristic": "4A154D60-4767-469D-A86E-5A3FC5BBC6AC",
                                        "isNotifying": false,
                                        "properties": ["Read","Write","Notify","Indicate"]
                                    },
                                    {
                                        "service": "4FAFC201-1FB5-459E-8FCC-C5C9C331914B",
                                        "characteristic": "BEB5483E-36E1-4688-B7F5-EA07361B26A8",
                                        "isNotifying": false,
                                        "properties": ["Read","Write","Notify","Indicate"]
                                    },
                                    {
                                        "service": "4FAFC201-1FB5-459E-8FCC-C5C9C331914B",
                                        "characteristic": "165FA2CF-F22E-4E81-B74B-2A22D3753977",
                                        "isNotifying": false,
                                        "properties": ["Read","Write","Notify","Indicate"]
                                    }, 
                                    {
                                        "service": "4FAFC201-1FB5-459E-8FCC-C5C9C331914B",
                                        "characteristic": "3020F983-7FAF-4207-BD40-A1BC8A620D7E",
                                        "isNotifying": false,
                                        "properties": ["Read","Write","Notify","Indicate"]
                                    }
                                ]
                            }
                            */

                            var name = bleDeviceDetails.name;
                            var profile_uuid = bleDeviceDetails.id;
                            var service_uuid = bleDeviceDetails.services[0];
                            var characteristic_uuid = bleDeviceDetails.characteristics[0].characteristic;
                            var characteristics_uuid = [];
                            for (var eachCharact in bleDeviceDetails.characteristics){
                                characteristics_uuid.push( eachCharact.characteristic );
                            }

                            setNameState(name);
                            setProfileState(profile_uuid);
                            setServiceState(service_uuid);
                            setCharacteristicState(characteristic_uuid);

                            console.log('[connectAndPrepare()] Device Name : ', name);
                            console.log('[connectAndPrepare()] Profile UUID : ', profile_uuid);
                            console.log('[connectAndPrepare()] Service UUID : ', service_uuid);
                            console.log('[connectAndPrepare()] Characteristic UUID : ', characteristic_uuid);

							setTimeout(() => {
								BleManager.startNotification(profile_uuid, service_uuid, characteristic_uuid).then(() => {
									console.log('[connectAndPrepare()] Started notification on : ' + JSON.stringify(profile_uuid));

									BleManager.read(profile_uuid, service_uuid, characteristic_uuid).then((readData) => {
                                        console.log("[connectAndPrepare()] readData : ", bytesToString(readData));
                                        /*
                                         * NOTE THAT read() TRIGGERS BOTH onConnect() and onRead() in Arduino script
                                         * Data is read from handlerUpdate() in BLEManagerEmitter
                                         */
									}).catch((error) => {
										console.log('[connectAndPrepare()] Read error', error);
									});

								}).catch((error) => {
									console.log('[connectAndPrepare()] Notification error', error);
								});

							}, 200);
						});

					}, 900);
				}).catch((error) => {
					console.log('[test()] Connection error : ', error);
				});
			}
		} else {
            alert("Cannot connect to this BLE Device. Please scan again.");
        }
	}; 

	const getHeader = (bleDevicesList) => {
		if (bleDevicesList.length == 0) {
			return (
				<View style={{flex:1, margin: 20}}>
					<Text style={{textAlign: 'center'}}>No peripherals found</Text>
					<Text style={{textAlign: 'center'}}>Click "Scan Bluetooth (OFF)" to get started</Text>
				</View>
			);
		} else { 
			return (
				<View style={{flex:1, margin: 20}}>
					<Text style={{textAlign: 'center'}}>Click on a BLE name to connect</Text>
				</View>
			);
		}
	};

    const renderItem = (bleDevice) => {
        if (COUNTER_renderItem > COUNTER && bleDevices.size>0 ){ 
            COUNTER_renderItem = COUNTER; // So that subsequent if statement is ignored
            console.log('\n');
            console.log("[renderItem()] COUNTER : " , COUNTER);
            console.log("[renderItem()] COUNTER_renderItem : " , COUNTER_renderItem);
            console.log("[renderItem()] bleDevice : " + JSON.stringify(bleDevice)); 
                /* 
                {    
                    "name":"xyz:Homerun.ai",
                    "id": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969",
                    "rssi": -58,
                    "advertising": {
                        "kCBAdvDataTimestamp": 635362013.874371,
                        "isConnectable": 1,
                        "localName": "xyz:Homerun.ai",
                        "txPowerLevel": 3
                    }
                } 
                */
            console.log('\n');
        }
		const color = bleDevice.connected ? 'green' : 'white';

		return (
			<TouchableHighlight onPress={() => {
				if ( !bleDevice.connected ){
					navigation.navigate('HomeStackSub');
				}
				connectAndPrepare(bleDevice);
			}}>
				<View style={[styles.row, {backgroundColor: color}]}>
					<Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{bleDevice.name}</Text>
					<Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{bleDevice.id}</Text>
					{/* <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {bleDevice.rssi}</Text> */}
					{/* <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>Value: {valueState}</Text> */}
				</View>
			</TouchableHighlight>
		);
	};

    
    // console.log( "bleDevices : ", ...bleDevices.entries() );
    // console.log( "bleDevices : ", ...bleDevices.keys() );
    // console.log( "bleDevices : ", ...bleDevices.values() );
    // console.log( "bleDevices.size : ", bleDevices.size );
        /*  Format of new Map() : [ ..., [ key, value ] ]
            [
                (key) "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969", 
                (value) {
                    "id": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969", 
                    "name": "xyz:Homerun.ai", 
                    "connected": false, 
                    "rssi": -62
                    "advertising": {
                        "isConnectable": 1, 
                        "kCBAdvDataTimestamp": 635362015.787799, 
                        "localName": "xyz:Homerun.ai", 
                        "txPowerLevel": 3
                    }
                }
            ]
        */
    const bleDevicesList = Array.from( bleDevices.values() );
    // console.log( "bleDevicesList : " + JSON.stringify(bleDevicesList));
        /*
            [{
                "id": "508B2D6A-D6CE-1D21-F82C-00C5CDBFD969",
                "name": "xyz:Homerun.ai",
                "connected":false 
                "rssi": -62,
                "advertising": {
                    "isConnectable": 1,
                    "kCBAdvDataTimestamp": 635362015.787799,
                    "localName": "xyz:Homerun.ai",
                    "txPowerLevel": 3
                },
            }]
        */
	const btnScanTitle = 'Scan Bluetooth (' + (scanning ? 'ON' : 'OFF') + ')';

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.containerSub}>
				<Text>This is Home Screen MAIN</Text>
				<View style={{margin: 10}}>
					<Button title={ btnScanTitle } onPress={ startScan } />
				</View>
				<FlatList style={styles.scroll}
					data={bleDevicesList}
					keyExtractor={ item => item.id }
					ListHeaderComponent={ getHeader(bleDevicesList) }
					renderItem={({ item }) => renderItem(item) }
				/>
			</View>
		</SafeAreaView>
	);
}



// **************************************************************************************
// **************************************************************************************
function HomeStackSub( {navigation} ){
	const { APPSTATE, SCANNING, CONNECTED,
        BLEDEVICES, NAME, PROFILE, SERVICE, CHARACT, VALUE } = useContext(DeviceContext);

    const [appState, setAppState] = APPSTATE;
    const [scanning, setScanning] = SCANNING;
    const [connected, setConnected] = CONNECTED;

    const [bleDevices, setBleDevices] = BLEDEVICES;
    const [nameState, setNameState] = NAME;
    const [profileState, setProfileState] = PROFILE;
    const [serviceState, setServiceState] = SERVICE;
    const [characteristicState, setCharacteristicState] = CHARACT;
    const [valueState, setValueState] = VALUE;

	// Deconstruct BLE data 
	var deconst_a = valueState.split(",");
	var MOI = deconst_a[0];
	var PH = deconst_a[1];
	var TEMP = deconst_a[2];
	var PHOTO = deconst_a[3];
	var BAT = deconst_a[4];

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



// **************************************************************************************
// **************************************************************************************
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