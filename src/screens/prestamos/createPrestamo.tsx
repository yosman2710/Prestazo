import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

export default function CreateLoanScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('5.0');
  const [duration, setDuration] = useState('1');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
     const rows = await db.getAllAsync(
  `SELECT id, nombre FROM clientes ORDER BY nombre ASC`
) as { id: string; nombre: string }[];

      setClientes(rows);
    };
    cargarClientes();
  }, []);

  const calcularFechaVencimiento = (
    fechaInicio: Date,
    frecuencia: string,
    cuotas: number
  ): Date => {
    const nuevaFecha = new Date(fechaInicio);
    const diasPorCuota: Record<string, number> = {
      Diario: 1,
      Semanal: 7,
      Quincenal: 15,
      Mensual: 30,
    };
    const dias = diasPorCuota[frecuencia] ?? 0;
    nuevaFecha.setDate(nuevaFecha.getDate() + dias * cuotas);
    return nuevaFecha;
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    const cuotas = parseInt(duration);
    if (!isNaN(cuotas)) {
      const nuevaFecha = calcularFechaVencimiento(startDate, value, cuotas);
      setDueDate(nuevaFecha);
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    const cuotas = parseInt(value);
    if (frequency && !isNaN(cuotas)) {
      const nuevaFecha = calcularFechaVencimiento(startDate, frequency, cuotas);
      setDueDate(nuevaFecha);
    }
  };

  const handleCreateLoan = async () => {
    if (!selectedClientId || !amount || !interest || !duration || !frequency) {
      Alert.alert('Campos obligatorios', 'Completa todos los campos requeridos');
      return;
    }

    try {
      const monto = parseFloat(amount);
      const interesNum = parseFloat(interest);
      const cuotas = parseInt(duration);

      await db.runAsync(
        `INSERT INTO prestamos (
          cliente_id, monto, saldo, interes, fecha_inicio, fecha_vencimiento,
          frecuencia, cantidad_cuotas, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          selectedClientId,
          monto,
          monto,
          interesNum,
          startDate.toISOString(),
          dueDate.toISOString(),
          frequency,
          cuotas,
          'Activo',
        ]
      );

      Alert.alert('Éxito', 'Préstamo creado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      Alert.alert('Error', 'No se pudo crear el préstamo');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        {/* Cliente */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seleccionar Cliente</Text>
          {clientes.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.selectBox,
                selectedClientId === c.id && { borderColor: '#2196F3' },
              ]}
              onPress={() => setSelectedClientId(c.id)}
            >
              <Text style={styles.selectText}>{c.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Detalles del préstamo */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalles del Préstamo</Text>

          <TextInput
            style={styles.input}
            placeholder="Monto del préstamo"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={styles.input}
            placeholder="Porcentaje de interés (%)"
            keyboardType="numeric"
            value={interest}
            onChangeText={setInterest}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Cantidad de cuotas"
              keyboardType="numeric"
              value={duration}
              onChangeText={handleDurationChange}
            />
            <TouchableOpacity
              style={[styles.selectBox, { flex: 1 }]}
              onPress={() => handleFrequencyChange('Diario')} // Podés cambiar esto por un modal
            >
              <Text style={styles.selectText}>
                {frequency || 'Frecuencia de pago'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fecha de inicio */}
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.selectText}>
              Fecha de inicio: {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) {
                  setStartDate(date);
                  const cuotas = parseInt(duration);
                  if (frequency && !isNaN(cuotas)) {
                    const nuevaFecha = calcularFechaVencimiento(date, frequency, cuotas);
                    setDueDate(nuevaFecha);
                  }
                }
              }}
            />
          )}

          {/* Fecha de vencimiento */}
          <View style={styles.selectBox}>
            <Text style={styles.selectText}>
              Fecha de vencimiento: {dueDate.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleCreateLoan}>
          <Text style={styles.submitText}>Crear Préstamo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
  padding: 16,
  paddingBottom: 40,
},
container: {
  flex: 1,
  backgroundColor: '#E6F4F1',
},

  backButton: {
  marginBottom: 12,
  paddingVertical: 6,
  paddingHorizontal: 12,
  backgroundColor: '#ccc',
  borderRadius: 6,
  alignSelf: 'flex-start',
},
backButtonText: {
  color: '#333',
  fontWeight: 'bold',
  fontSize: 14,
},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  selectBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  selectText: {
    fontSize: 14,
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


