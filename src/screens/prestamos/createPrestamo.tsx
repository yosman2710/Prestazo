import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  User as UserIcon,
  DollarSign,
  Percent,
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  Check as CheckIcon,
  ArrowLeft,
  Info,
  History as HistoryIcon
} from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { theme } from '../../utils/theme';
import { RootStackParamList } from '../../navegation/type';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateLoanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateLoan'>>();
  const initialClientId = route.params?.clientId;

  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState('5.0');
  const [duration, setDuration] = useState('1');
  const [frequency, setFrequency] = useState('Diario');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const frecuencias = ['Diario', 'Semanal', 'Quincenal', 'Mensual'];

  useEffect(() => {
    const cargarClientes = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (!error && data) {
        const enriched = data.map(c => ({ id: c.id.toString(), nombre: c.nombre }));
        setClientes(enriched);

        if (initialClientId) {
          const client = enriched.find(c => c.id === initialClientId);
          if (client) setSelectedClientName(client.nombre);
        }
      }
    };
    cargarClientes();
  }, [initialClientId]);

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
      setDueDate(calcularFechaVencimiento(startDate, value, cuotas));
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    const cuotas = parseInt(value);
    if (frequency && !isNaN(cuotas)) {
      setDueDate(calcularFechaVencimiento(startDate, frequency, cuotas));
    }
  };

  const handleCreateLoan = async () => {
    if (!selectedClientId || !amount || !interest || !duration || !frequency) {
      Alert.alert('Faltan datos', 'Por favor completa todos los campos del préstamo.');
      return;
    }

    setIsLoading(true);
    try {
      const monto = parseFloat(amount);
      const { error } = await supabase
        .from('prestamos')
        .insert([{
          cliente_id: parseInt(selectedClientId),
          monto,
          saldo: monto,
          interes: parseFloat(interest),
          fecha_inicio: startDate.toISOString(),
          fecha_vencimiento: dueDate.toISOString(),
          frecuencia: frequency,
          cantidad_cuotas: parseInt(duration),
          estado: 'activo',
        }]);

      if (error) throw error;
      Alert.alert('¡Éxito!', 'Préstamo registrado correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el préstamo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerIndicator}>
          <Text style={styles.headerTitle}>Nuevo Préstamo</Text>
          <Text style={styles.headerSubtitle}>Define los términos del crédito</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Cliente</Text>
          <TouchableOpacity
            style={[styles.inputContainer, initialClientId && styles.disabledInput]}
            onPress={() => !initialClientId && setShowClientModal(true)}
            disabled={!!initialClientId}
          >
            <UserIcon color={theme.colors.primary} size={20} />
            <Text style={[styles.inputText, !selectedClientName && styles.placeholderText]}>
              {selectedClientName || 'Seleccionar un cliente'}
            </Text>
            {!initialClientId && <ChevronDown color={theme.colors.textLight} size={20} />}
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Detalles Financieros</Text>

          <View style={styles.inputContainer}>
            <DollarSign color={theme.colors.primary} size={20} />
            <TextInput
              style={styles.textInput}
              placeholder="Monto del préstamo"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Percent color={theme.colors.primary} size={18} />
              <TextInput
                style={styles.textInput}
                placeholder="Interés (%)"
                keyboardType="numeric"
                value={interest}
                onChangeText={setInterest}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Clock color={theme.colors.primary} size={18} />
              <TextInput
                style={styles.textInput}
                placeholder="Cuotas"
                keyboardType="numeric"
                value={duration}
                onChangeText={handleDurationChange}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowFrequencyModal(true)}
          >
            <HistoryIcon color={theme.colors.primary} size={20} />
            <Text style={styles.inputText}>{frequency}</Text>
            <ChevronDown color={theme.colors.textLight} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Fechas</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowStartPicker(true)}
          >
            <CalendarIcon color={theme.colors.primary} size={20} />
            <Text style={styles.inputText}>Inicio: {startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <View style={[styles.inputContainer, styles.disabledInput]}>
            <CalendarIcon color={theme.colors.textLight} size={20} />
            <Text style={styles.disabledText}>Vencimiento: {dueDate.toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Info color={theme.colors.primary} size={16} />
          <Text style={styles.infoText}>
            El interés se calcula sobre el monto total. El vencimiento se ajusta según la frecuencia y cuotas.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleCreateLoan}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckIcon color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Crear Préstamo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modals are unchanged but updated styled */}
      <Modal visible={showClientModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <ScrollView style={{ maxHeight: 400 }}>
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
                  {selectedClientId === c.id && <CheckIcon color={theme.colors.primary} size={20} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowClientModal(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showFrequencyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Frecuencia de Pago</Text>
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
                {frequency === f && <CheckIcon color={theme.colors.primary} size={20} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowFrequencyModal(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) {
              setStartDate(date);
              const cuotas = parseInt(duration);
              if (frequency && !isNaN(cuotas)) {
                setDueDate(calcularFechaVencimiento(date, frequency, cuotas));
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  headerIndicator: {
    marginVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textLight,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    ...theme.shadows.xs,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  disabledInput: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderColor: 'transparent',
  },
  disabledText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  row: {
    flexDirection: 'row',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  modalClose: {
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 15,
  },
  modalCloseText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});



