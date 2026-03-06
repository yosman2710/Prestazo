import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import { RootStackParamList } from '../../navegation/type';

export default function RegisterPaymentScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'RegisterPayment'>>();
  const navigation = useNavigation();
  const { prestamoId } = route.params;

  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [montoOriginal, setMontoOriginal] = useState(0);
  const [interes, setInteres] = useState(0);
  const [totalPagado, setTotalPagado] = useState(0);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const saldoTotal = montoOriginal + (montoOriginal * interes) / 100;
  const saldoActual = saldoTotal - totalPagado;
  const nuevoSaldo = monto ? saldoActual - parseFloat(monto) : saldoActual;

  useEffect(() => {
    const cargarPrestamo = async () => {
      try {
        const { data: prestamo, error } = await supabase
          .from('prestamos')
          .select('monto, interes, total_pagado, fecha_vencimiento, clientes(nombre)')
          .eq('id', prestamoId)
          .single();

        if (error) throw error;

        setMontoOriginal(prestamo.monto);
        setInteres(prestamo.interes);
        setTotalPagado(prestamo.total_pagado);
        setFechaVencimiento(prestamo.fecha_vencimiento);
        setClienteNombre((prestamo as any).clientes?.nombre || 'Desconocido');
      } catch (error: any) {
        console.error('Error al cargar préstamo:', error);
        Alert.alert('Error', error.message || 'No se pudo cargar el préstamo');
      }
    };

    cargarPrestamo();
  }, [prestamoId]);

  const handleRegistrar = async () => {
    const montoNum = parseFloat(monto);

    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a cero');
      return;
    }

    if (montoNum > saldoActual + 0.01) { // allow small precision err
      Alert.alert('Monto excedido', 'El monto no puede ser mayor al saldo actual');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Insert Payment
      const { error: errorPago } = await supabase
        .from('pagos')
        .insert([
          {
            prestamo_id: prestamoId,
            fecha: new Date().toISOString(),
            monto: montoNum,
            nota: nota
          }
        ]);

      if (errorPago) throw errorPago;

      // 2. Update Loan Balance
      const nuevoTotalPagado = totalPagado + montoNum;
      const totalEsperado = montoOriginal + (montoOriginal * interes) / 100;
      const vencido = new Date(fechaVencimiento) < new Date();
      const pagadoTotalmente = nuevoTotalPagado >= (totalEsperado - 0.01);

      let nuevoEstado = 'activo';
      if (pagadoTotalmente) nuevoEstado = 'pagado';
      else if (vencido) nuevoEstado = 'vencido';

      const { error: errorPrestamo } = await supabase
        .from('prestamos')
        .update({
          saldo: saldoTotal - nuevoTotalPagado,
          total_pagado: nuevoTotalPagado,
          estado: nuevoEstado
        })
        .eq('id', prestamoId);

      if (errorPrestamo) throw errorPrestamo;

      Alert.alert('Pago registrado', 'El pago se ha guardado correctamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Pagos</Text>

      <View style={styles.card}>
        <Text style={styles.clientName}>{clienteNombre}</Text>
        <Text style={styles.loanId}>Préstamo #{prestamoId}</Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.label}>Saldo Total</Text>
            <Text style={styles.value}>${saldoTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Saldo Actual</Text>
            <Text style={styles.value}>${saldoActual.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Nuevo Saldo</Text>
          <Text style={styles.value}>${nuevoSaldo.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Monto del Pago</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 500.00"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      <Text style={styles.sectionTitle}>Fecha del Pago</Text>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>{fechaHoy}</Text>
      </View>

      <Text style={styles.sectionTitle}>Notas (opcional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observaciones, referencias, etc."
        multiline
        value={nota}
        onChangeText={setNota}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && { opacity: 0.7 }]}
        onPress={handleRegistrar}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Registrando...' : 'Registrar Pago'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E6F4F1',
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 4,
  },
  loanId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    width: '48%',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


