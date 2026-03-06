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
import { supabase } from '../../utils/supabase';

export default function CreateClientScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('Campos obligatorios', 'Por favor completa nombre y teléfono');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .insert([
          {
            nombre: name,
            telefono: phone,
            direccion: address,
            nota: note,
            fecha_ingreso: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      Alert.alert('Éxito', 'Cliente guardado correctamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el cliente');
    } finally {
      setIsLoading(false);
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

      <TouchableOpacity
        style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.saveText}>
          {isLoading ? 'Guardando...' : 'Guardar Cliente'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}