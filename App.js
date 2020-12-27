import * as React from 'react';
import { StyleSheet } from 'react-native';

import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons'; // https://oblador.github.io/react-native-vector-icons/

import HomeScreen from './components/HomeScreen';
import TrendsScreen from './components/TrendsScreen';
import SettingsScreen from './components/SettingsScreen';
import { DeviceProvider } from './components/provider/DeviceProvider';



const Tab = createBottomTabNavigator();


export default function App() {

  return (
    <DeviceProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'information-circle-sharp' : 'information-circle-outline';
              } else if (route.name === 'Trends') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'list' : 'list-outline';
              }
              // Return any component that you like here!
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            style: {backgroundColor: '#F4F4F4'},
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={({ route }) => ({
              tabBarVisible: ((route) => {
                  const routeName = getFocusedRouteNameFromRoute(route) ?? ""
                  if (routeName === "HomeStackSub") {
                      return false
                  }
                  return true
              })(route),
          })}/>
          <Tab.Screen name="Trends" component={TrendsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </DeviceProvider>
  )
}


const styles = StyleSheet.create({
  imgBg: {
    height: '100%',
    width: '100%'
  },
  imgBgView: {
    flex:1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  imgBagViewText: {
    color: 'tomato', 
    fontSize: 28, 
    textAlign: 'center'
  },
});