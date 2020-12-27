import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import { DeviceContext } from './provider/DeviceProvider';


const Stack = createStackNavigator();

export default function HomeScreen() {

    // const [deviceID, setDeviceID] = useState(deviceID_default);
    const ITEM = useContext(DeviceContext);
    console.log(JSON.stringify(ITEM.deviceID));

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
  const ITEM = useContext(DeviceContext);
  console.log(JSON.stringify(ITEM.deviceID));

  return (
    <View style={ styles.container }>
      <View style={styles.container}>
        <Text>This is Home Screen MAIN</Text>
        <Text>Current Device ID is : {ITEM.deviceID}</Text>
        <Button
          title='Go to SUB Component'
          onPress={() => navigation.navigate('HomeStackSub')} />
      </View>
    </View>
  );
}

function HomeStackSub( {navigation} ){
  const ITEM = useContext(DeviceContext);
  console.log(JSON.stringify(ITEM.deviceID));

  return (
    <View style={ styles.container }>
      <View style={styles.container}>
        <Text>Home Screen SUB</Text>
        <Text>Current Device ID is : {ITEM.deviceID}</Text>
        <Button
          title='Go to MAIN Component'
          onPress={() => navigation.navigate('HomeStackMain')} />
      </View>
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