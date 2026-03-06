import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { RootStackParamList } from '../../navegation/type';
import { theme } from '../../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterPaymentScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'RegisterPayment'>>();
  const navigation = useNavigation<NavigationProp>();
  const { prestamoId } = route.params;

  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [montoOriginal, setMontoOriginal] = useState(0);
  const [interes, setInteres] = useState(0);
  const [totalPagado, setTotalPagado] = useState(0);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const saldoTotal = montoOriginal + (montoOriginal * interes) / 100;
  const saldoActual = saldoTotal - totalPagado;
  const montoNum = parseFloat(monto) || 0;
  const nuevoSaldo = Math.max(0, saldoActual - montoNum);

  useEffect(() => {
    cargarPrestamo();
  }, [prestamoId]);

  const cargarPrestamo = async () => {
    setFetching(true);
    try {
      const { data: prestamo, error } = await supabase
        .from('prestamos')
        .select('monto, interes, total_pagado, fecha_vencimiento, clientes(nombre)')
        .eq('id', prestamoId)
        .single();

      if (error) throw error;

      setMontoOriginal(prestamo.monto);
      setInteres(prestamo.interes);
      setTotalPagado(prestamo.total_pagado);
      setFechaVencimiento(prestamo.fecha_vencimiento);
      setClienteNombre((prestamo as any).clientes?.nombre || 'Cliente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar la información del préstamo');
    } finally {
      setFetching(false);
    }
  };

  const handleRegistrar = async () => {
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto válido');
      return;
    }

    if (montoNum > saldoActual + 0.05) {
      Alert.alert('Monto excedido', 'El pago no puede ser mayor al saldo pendiente');
      return;
    }

    setIsLoading(true);
    try {
      const { error: errorPago } = await supabase
        .from('pagos')
        .insert([{
          prestamo_id: prestamoId,
          fecha: new Date().toISOString(),
          monto: montoNum,
          nota: nota
        }]);

      if (errorPago) throw errorPago;

      const nuevoTotalPagado = totalPagado + montoNum;
      const vencido = new Date(fechaVencimiento) < new Date();
      const pagadoTotalmente = nuevoTotalPagado >= (saldoTotal - 0.05);

      let nuevoEstado = 'activo';
      if (pagadoTotalmente) nuevoEstado = 'pagado';
      else if (vencido) nuevoEstado = 'vencido';

      const { error: errorPrestamo } = await supabase
        .from('prestamos')
        .update({
          saldo: Math.max(0, saldoTotal - nuevoTotalPagado),
          total_pagado: nuevoTotalPagado,
          estado: nuevoEstado
        })
        .eq('id', prestamoId);

      if (errorPrestamo) throw errorPrestamo;

      Alert.alert('Éxito', 'Pago registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo registrar el pago');
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
              <Text style={styles.headerTitle}>Registrar Pago</Text>
              <Text style={styles.headerSubtitle}>{clienteNombre}</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Balance Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <TrendingDown color={theme.colors.success} size={24} />
                <Text style={styles.summaryTitle}>Resumen de Saldo</Text>
              </View>

              <View style={styles.balanceRow}>
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Saldo Actual</Text>
                  <Text style={styles.balanceValue}>${saldoActual.toFixed(2)}</Text>
                </View>
                <ArrowRight color={theme.colors.textLight} size={20} />
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Saldo Final</Text>
                  <Text style={[styles.balanceValue, { color: theme.colors.primary }]}>
                    ${nuevoSaldo.toFixed(2)}
                  </Text>
                </View>
              </View>

              {montoNum > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>Descontando ${montoNum.toFixed(2)}</Text>
                </View>
              )}
            </View>

            {/* Input Form */}
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Monto a pagar</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <DollarSign color={theme.colors.primary} size={20} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={monto}
                  onChangeText={setMonto}
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              <Text style={styles.inputLabel}>Fecha de transacción</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <View style={styles.inputIcon}>
                  <Calendar color={theme.colors.textLight} size={20} />
                </View>
                <Text style={styles.disabledInputText}>{fechaHoy}</Text>
              </View>

              <Text style={styles.inputLabel}>Observaciones (Opcional)</Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                <View style={styles.inputIcon}>
                  <FileText color={theme.colors.primary} size={20} />
                </View>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Añade una nota sobre este pago..."
                  multiline
                  value={nota}
                  onChangeText={setNota}
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Info color={theme.colors.primary} size={18} />
              <Text style={styles.infoText}>
                Este pago se aplicará al saldo pendiente del préstamo #{prestamoId.substring(0, 8)}.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (isLoading || !monto) && styles.submitButtonDisabled]}
              onPress={handleRegistrar}
              disabled={isLoading || !monto}
            >
              <LinearGradient
                colors={isLoading || !monto ? [theme.colors.textLight, '#94a3b8'] : [theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <CheckCircle2 color="#fff" size={20} />
                    <Text style={styles.submitButtonText}>Confirmar Pago</Text>
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    ...theme.shadows.md,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  discountBadge: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
  },
  discountText: {
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    ...theme.shadows.sm,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
  disabledInput: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  disabledInputText: {
    fontSize: 16,
    color: theme.colors.textLight,
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
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  gradientButton: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});


