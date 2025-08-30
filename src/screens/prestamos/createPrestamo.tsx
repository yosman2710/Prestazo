import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  Modal,
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
  const [selectedClientName, setSelectedClientName] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('5.0');
  const [duration, setDuration] = useState('1');
  const [frequency, setFrequency] = useState('');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  const frecuencias = ['Diario', 'Semanal', 'Quincenal', 'Mensual'];

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
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowClientModal(true)}
          >
            <Text style={styles.selectText}>
              {selectedClientName || 'Seleccionar cliente'}
            </Text>
          </TouchableOpacity>
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

          <TextInput
            style={styles.input}
            placeholder="Cantidad de cuotas"
            keyboardType="numeric"
            value={duration}
            onChangeText={handleDurationChange}
          />

          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowFrequencyModal(true)}
          >
            <Text style={styles.selectText}>
              {frequency || 'Seleccionar frecuencia de pago'}
            </Text>
          </TouchableOpacity>

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

      {/* Modal de clientes */}
      <Modal visible={showClientModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un cliente</Text>
            {clientes.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedClientId(c.id);
                  setSelectedClientName(c.nombre);
                  setShowClientModal(false);
                }}
              >
                <Text style={styles.modalText}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowClientModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de frecuencia */}
      <Modal visible={showFrequencyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Frecuencia de pago</Text>
            {frecuencias.map((f) => (
              <TouchableOpacity
                key={f}
                style={styles.modalItem}
                onPress={() => {
                  handleFrequencyChange(f);
                  setShowFrequencyModal(false);
                }}
              >
                <Text style={styles.modalText}>{f}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowFrequencyModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4F1',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366',
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  modalClose: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


