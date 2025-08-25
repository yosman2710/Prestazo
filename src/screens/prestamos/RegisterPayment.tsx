import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function RegisterPaymentScreen() {
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');

  const saldoActual = 2300;
  const nuevoSaldo = monto ? saldoActual - parseFloat(monto) : saldoActual;
  const fechaHoy = new Date().toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleRegistrar = () => {
    console.log({
      monto,
      nota,
      fecha: fechaHoy,
    });
    // Aquí puedes guardar el pago en tu base de datos
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Pagos</Text>

      {/* Info del cliente */}
      <View style={styles.card}>
        <Text style={styles.clientName}>María García</Text>
        <Text style={styles.loanId}>Préstamo #1</Text>

        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.label}>Saldo Actual</Text>
            <Text style={styles.value}>${saldoActual.toFixed(2)}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.label}>Nuevo Saldo</Text>
            <Text style={styles.value}>${nuevoSaldo.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Monto del pago */}
      <Text style={styles.sectionTitle}>Monto del Pago</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 500.00"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
      />

      {/* Fecha del pago */}
      <Text style={styles.sectionTitle}>Fecha del Pago</Text>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>{fechaHoy}</Text>
      </View>

      {/* Notas opcionales */}
      <Text style={styles.sectionTitle}>Notas (opcional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observaciones, referencias, etc."
        multiline
        value={nota}
        onChangeText={setNota}
      />

      {/* Botón registrar */}
      <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
        <Text style={styles.buttonText}>Registrar Pago</Text>
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