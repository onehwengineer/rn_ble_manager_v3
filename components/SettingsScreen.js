import React, { useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import { DeviceContext } from './provider/DeviceProvider';


const Stack = createStackNavigator();

export default function SettingsScreen() {

    const ITEM = useContext(DeviceContext);

    return (
      <Stack.Navigator initialRouteName="SettingsComponent">
        <Stack.Screen
          name="SettingsComponent"
          component={SettingsStack}
          options={{ title: 'SettingsStack Title' }}
        />
      </Stack.Navigator>
    );
}

function SettingsStack(){
  const ITEM = useContext(DeviceContext);
  return (
    <View style={styles.container}>
      <Text>This is Settings Screen</Text>
      <Text>Current Device ID is : {ITEM.deviceID}</Text>
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