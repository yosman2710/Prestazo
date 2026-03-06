import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Info
} from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { theme } from '../../utils/theme';
import { RootStackParamList } from '../../navegation/type';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateClientScreen() {
  const navigation = useNavigation<NavigationProp>();
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

      Alert.alert('Éxito', 'Cliente guardado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo guardar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Text style={styles.headerTitle}>Nuevo Cliente</Text>
              <Text style={styles.headerSubtitle}>Ingresa los datos personales</Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre completo *</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <User color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: María González"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono *</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Phone color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: +58 412 1234567"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección (opcional)</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <MapPin color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Calle 12, Maracaibo"
                    value={address}
                    onChangeText={setAddress}
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nota (opcional)</Text>
                <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                  <View style={styles.inputIcon}>
                    <FileText color={theme.colors.primary} size={20} />
                  </View>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Añade una nota interna..."
                    multiline
                    value={note}
                    onChangeText={setNote}
                    placeholderTextColor={theme.colors.textLight}
                  />
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Info color={theme.colors.primary} size={18} />
              <Text style={styles.infoText}>
                Los campos marcados con (*) son obligatorios para registrar al cliente.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, (isLoading || !name || !phone) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading || !name || !phone}
            >
              <LinearGradient
                colors={isLoading || !name || !phone ? [theme.colors.textLight, '#94a3b8'] : [theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <CheckCircle2 color="#fff" size={20} />
                    <Text style={styles.saveButtonText}>Registrar Cliente</Text>
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
