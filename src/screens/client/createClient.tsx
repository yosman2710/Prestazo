import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import styles from '../../style/client/createClientStyle';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

export default function CreateClientScreen() {
  const navigation = useNavigation();
  const db = useSQLiteContext(); // ← necesario para pasar contexto
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  // Verifica si la base de datos está lista

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('Campos obligatorios', 'Por favor completa nombre y teléfono');
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO clientes (nombre, fecha_ingreso, telefono, direccion, nota) VALUES (?, ?, ?, ?, ?)`,
        [name, new Date().toISOString(), phone, address, note]
      );
      setName('');
      setPhone('');
      setAddress('');
      setNote('');
      Alert.alert('Éxito', 'Cliente guardado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      Alert.alert('Error', 'No se pudo guardar el cliente');
    }
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