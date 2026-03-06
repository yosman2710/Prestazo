import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { StyleSheet } from 'react-native';

import TabNavigator from './src/navegation/principal';
import CreateLoanScreen from './src/screens/prestamos/createPrestamo';
import CreateClientScreen from './src/screens/client/createClient';
import ClientDetailScreen from './src/screens/client/ClientDetails';
import LoanDetailScreen from './src/screens/prestamos/LoanDetailScreen';
import RegisterPaymentScreen from './src/screens/prestamos/RegisterPayment';
import EditClientScreen from './src/screens/client/editClient';
import LoginScreen from './src/screens/login';
import SignupScreen from './src/screens/signup';
import { AuthProvider } from './src/providers/AuthProvider';

enableScreens();
const Stack = createNativeStackNavigator();
export default function App() {



  return (
    <NavigationContainer>
      <AuthProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="CreateLoan" component={CreateLoanScreen} options={screenOptions('Nuevo Préstamo')} />
          <Stack.Screen name="CreateClient" component={CreateClientScreen} options={screenOptions('Nuevo Cliente')} />
          <Stack.Screen name="ClientDetails" component={ClientDetailScreen} options={screenOptions('Detalles del Cliente')} />
          <Stack.Screen name="LoanDetailScreen" component={LoanDetailScreen} options={screenOptions('Detalles del Préstamo')} />
          <Stack.Screen name="RegisterPayment" component={RegisterPaymentScreen} options={screenOptions('Registrar Pago')} />
          <Stack.Screen name="EditClient" component={EditClientScreen} options={screenOptions('Editar Cliente')} />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
}

const screenOptions = (title: string) => ({
  headerShown: true,
  title,
  headerStyle: { backgroundColor: '#E6F4F1' },
  headerTintColor: '#003366',
  headerTitleStyle: styles.headerTitle,
});

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: 'bold',
    color: '#003366',
  },
});