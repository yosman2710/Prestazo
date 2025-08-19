import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function CreateClientScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  const handleSave = () => {
    console.log({ name, phone, address, note });
    // Aquí puedes guardar el cliente en tu base de datos o estado
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: María González"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: +58 412 1234567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Dirección (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Calle 12, Maracaibo"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Nota (opcional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Observaciones, referencias, etc."
          multiline
          value={note}
          onChangeText={setNote}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Guardar Cliente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4F1',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
