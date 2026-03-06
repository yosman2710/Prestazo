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
import { supabase } from '../../utils/supabase';
import { NuevoCliente } from '../../types';

type EditClientRouteProp = RouteProp<RootStackParamList, 'EditClient'>;

export default function EditClientScreen() {
  const route = useRoute<EditClientRouteProp>();
  const navigation = useNavigation();
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
  const [isLoading, setIsLoading] = useState(false);

  const formatearFecha = (date: Date) => {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const { data: row, error } = await supabase
          .from('clientes')
          .select('nombre, telefono, direccion, nota, fecha_ingreso')
          .eq('id', clientId)
          .single();

        if (error) throw error;

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
        }
      } catch (error: any) {
        console.error('Error al cargar cliente:', error);
        Alert.alert('Error', error.message || 'No se pudo cargar la información del cliente');
      }
    };

    cargarCliente();
  }, [clientId]);

  const guardarCambios = async () => {
    if (!cliente.nombre.trim()) {
      Alert.alert('Campo obligatorio', 'El nombre no puede estar vacío');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          nota: cliente.nota || null,
          fecha_ingreso: cliente.fechaIngreso,
        })
        .eq('id', clientId);

      if (error) throw error;

      Alert.alert('Éxito', 'Cliente actualizado correctamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar los cambios');
    } finally {
      setIsLoading(false);
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

      <TouchableOpacity
        style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
        onPress={guardarCambios}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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