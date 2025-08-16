import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './src/screens/dashboard/dashboardScreen';
import LoanListScreen from './src/screens/prestamos/listPrestamos';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='LoanList'>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="LoanList" component={LoanListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


