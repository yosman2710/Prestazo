import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


const clients = ['María González', 'Carlos Pérez', 'Ana Torres'];

export default function CreateLoanScreen() {
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('5.0');
  const [duration, setDuration] = useState('1');
  const [durationType, setDurationType] = useState('meses');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const navigation = useNavigation();


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>

      {/* Cliente */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seleccionar Cliente</Text>
        <TouchableOpacity style={styles.selectBox}>
          <Text style={styles.selectText}>
            {selectedClient || 'Selecciona un cliente'}
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

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Duración"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
          <TouchableOpacity style={[styles.selectBox, { flex: 1 }]}>
            <Text style={styles.selectText}>{durationType}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.selectBox}>
          <Text style={styles.selectText}>
            {frequency || 'Selecciona frecuencia de pago'}
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
              if (date) setStartDate(date);
            }}
          />
        )}

        {/* Fecha de vencimiento */}
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setShowDuePicker(true)}
        >
          <Text style={styles.selectText}>
            Fecha de vencimiento: {dueDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDuePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, date) => {
              setShowDuePicker(false);
              if (date) setDueDate(date);
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.submitButton}>
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