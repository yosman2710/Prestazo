import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navegation/type';
import { useSQLiteContext } from 'expo-sqlite';
import { NuevoCliente } from '../../types';

type EditClientRouteProp = RouteProp<RootStackParamList, 'EditClient'>;

export default function EditClientScreen() {
  const route = useRoute<EditClientRouteProp>();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { clientId } = route.params;

  const [cliente, setCliente] = useState<NuevoCliente>({
    nombre: '',
    telefono: '',
    direccion: '',
    nota: '',
    fechaIngreso: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaIngresoDate, setFechaIngresoDate] = useState(new Date());

  const formatearFecha = (date: Date) => {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  useEffect(() => {
    const cargarCliente = async () => {
      type ClienteDBRow = {
        nombre: string;
        telefono: string;
        direccion: string;
        nota?: string;
        fecha_ingreso: string;
      };

      try {
        const row = await db.getFirstAsync(
          `SELECT nombre, telefono, direccion, nota, fecha_ingreso FROM clientes WHERE id = ?`,
          [clientId]
        ) as ClienteDBRow;

        if (row) {
          const fecha = new Date(row.fecha_ingreso);
          setFechaIngresoDate(fecha);
          setCliente({
            nombre: row.nombre ?? '',
            telefono: row.telefono ?? '',
            direccion: row.direccion ?? '',
            nota: row.nota ?? '',
            fechaIngreso: formatearFecha(fecha),
          });
        } else {
          Alert.alert('Cliente no encontrado', 'No se encontró información para este cliente.');
        }
      } catch (error) {
        console.error('Error al cargar cliente:', error);
        Alert.alert('Error', 'No se pudo cargar la información del cliente');
      }
    };

    cargarCliente();
  }, []);

  const guardarCambios = async () => {
    if (!cliente.nombre.trim()) {
      Alert.alert('Campo obligatorio', 'El nombre no puede estar vacío');
      return;
    }

    try {
      await db.runAsync(
        `UPDATE clientes SET nombre = ?, telefono = ?, direccion = ?, nota = ?, fecha_ingreso = ? WHERE id = ?`,
        [
          cliente.nombre,
          cliente.telefono,
          cliente.direccion,
          cliente.nota || null,
          cliente.fechaIngreso,
          clientId,
        ]
      );
      Alert.alert('Éxito', 'Cliente actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      Alert.alert('Error', 'No se pudo guardar los cambios');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Cliente</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={cliente.nombre}
          onChangeText={(text) => setCliente({ ...cliente, nombre: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={cliente.telefono}
          onChangeText={(text) => setCliente({ ...cliente, telefono: text })}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={cliente.direccion}
          onChangeText={(text) => setCliente({ ...cliente, direccion: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nota</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={cliente.nota}
          onChangeText={(text) => setCliente({ ...cliente, nota: text })}
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha de ingreso</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.selectText}>
            {cliente.fechaIngreso || 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={fechaIngresoDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setFechaIngresoDate(date);
                setCliente({ ...cliente, fechaIngreso: formatearFecha(date) });
              }
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={guardarCambios}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
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
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});