import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './src/navegation/principal';
import CreateLoanScreen from './src/screens/prestamos/createPrestamo';
import CreateClientScreen from './src/screens/client/createClient';
import { enableScreens } from 'react-native-screens';
enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
     <Stack.Navigator initialRouteName="MainTabs" >
  <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
  <Stack.Screen name="CreateLoan" component={CreateLoanScreen}  options={{
  headerShown: true,
  title: 'Nuevo Préstamo',
  headerStyle: { backgroundColor: '#E6F4F1' },
  headerTintColor: '#003366',
  headerTitleStyle: { fontWeight: 'bold' },
}} />
  <Stack.Screen name="CreateClient" component={CreateClientScreen} options={{
  headerShown: true,
  title: 'Nuevo Cliente',
  headerStyle: { backgroundColor: '#E6F4F1' },
  headerTintColor: '#003366',
  headerTitleStyle: { fontWeight: 'bold' },
}} />
</Stack.Navigator>
    </NavigationContainer>
  );
}


