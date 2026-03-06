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
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileText,
  Calendar as CalendarIcon,
  CheckCircle2,
  Info
} from 'lucide-react-native';
import { RootStackParamList } from '../../navegation/type';
import { supabase } from '../../utils/supabase';
import { theme } from '../../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type EditClientRouteProp = RouteProp<RootStackParamList, 'EditClient'>;

export default function EditClientScreen() {
  const route = useRoute<EditClientRouteProp>();
  const navigation = useNavigation();
  const { clientId } = route.params;

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [nota, setNota] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fechaIngresoDate, setFechaIngresoDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const formatearFechaDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearFechaBD = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    cargarCliente();
  }, [clientId]);

  const cargarCliente = async () => {
    setFetching(true);
    try {
      const { data: row, error } = await supabase
        .from('clientes')
        .select('nombre, telefono, direccion, nota, fecha_ingreso')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      if (row) {
        const fecha = new Date(row.fecha_ingreso);
        setNombre(row.nombre || '');
        setTelefono(row.telefono || '');
        setDireccion(row.direccion || '');
        setNota(row.nota || '');
        setFechaIngresoDate(fecha);
        setFechaIngreso(row.fecha_ingreso);
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar la información del cliente');
    } finally {
      setFetching(false);
    }
  };

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo obligatorio', 'El nombre no puede estar vacío');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: nombre,
          telefono: telefono,
          direccion: direccion,
          nota: nota || null,
          fecha_ingreso: fechaIngreso,
        })
        .eq('id', clientId);

      if (error) throw error;

      Alert.alert('Éxito', 'Cliente actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  if (fetching) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Editar Cliente</Text>
              <Text style={styles.headerSubtitle}>Actualiza la información del perfil</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre completo</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <User color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Phone color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <MapPin color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={direccion}
                    onChangeText={setDireccion}
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha de ingreso</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.inputIcon}>
                    <CalendarIcon color={theme.colors.primary} size={20} />
                  </View>
                  <Text style={styles.inputText}>
                    {formatearFechaDisplay(fechaIngresoDate)}
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
                        setFechaIngreso(formatearFechaBD(date));
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nota interna</Text>
                <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                  <View style={styles.inputIcon}>
                    <FileText color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    value={nota}
                    onChangeText={setNota}
                    multiline
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Info color={theme.colors.primary} size={18} />
              <Text style={styles.infoText}>
                Los cambios se reflejarán inmediatamente en el perfil del cliente y sus préstamos asociados.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={guardarCambios}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? [theme.colors.textLight, '#94a3b8'] : [theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <CheckCircle2 color="#fff" size={20} />
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -25,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    ...theme.shadows.md,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: theme.colors.text,
    paddingRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    marginLeft: 10,
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: 18,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.8,
  },
  gradientButton: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
