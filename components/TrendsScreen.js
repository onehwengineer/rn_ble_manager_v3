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
  const ITEM = useContext(DeviceContext);
  return (
    <View style={styles.container}>
      <Text>This is Trends Screen</Text>
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