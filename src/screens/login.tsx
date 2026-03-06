import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Lock, Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../utils/theme';

import { useAuth } from '../providers/AuthProvider';


const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: { navigation: any }) {
    const { signIn, signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(hasHardware && isEnrolled);

        // Verificar si hay credenciales guardadas
        const storedEmail = await SecureStore.getItemAsync('userEmail');
        const storedPassword = await SecureStore.getItemAsync('userPassword');
        const isEnabled = await AsyncStorage.getItem('biometricsEnabled');
        setHasSavedCredentials(!!(storedEmail && storedPassword && isEnabled === 'true'));
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }

        setIsLoading(true);
        try {
            await signIn(email, password);
            // Si el login es exitoso, guardamos las credenciales para biometría
            await SecureStore.setItemAsync('userEmail', email);
            await SecureStore.setItemAsync('userPassword', password);
            await AsyncStorage.setItem('biometricsEnabled', 'true');
            setHasSavedCredentials(true);
        } catch (error: any) {
            console.log(error);
            Alert.alert("Error", error.message || "Ocurrió un error en la autenticación");
        } finally {
            setIsLoading(false);
        }
    };


    const handleBiometricLogin = async () => {
        if (!hasSavedCredentials) {
            Alert.alert("Aviso", "Primero debes iniciar sesión con tu correo y contraseña para activar la biometría.");
            return;
        }

        try {
            const results = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Inicia sesión con biometría',
                disableDeviceFallback: false,
                cancelLabel: 'Cancelar',
            });

            if (results.success) {
                const storedEmail = await SecureStore.getItemAsync('userEmail');
                const storedPassword = await SecureStore.getItemAsync('userPassword');

                if (storedEmail && storedPassword) {
                    setIsLoading(true);
                    try {
                        await signIn(storedEmail, storedPassword);
                    } catch (error: any) {
                        Alert.alert("Error", "Error al iniciar sesión con las credenciales guardadas: " + error.message);
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    Alert.alert("Error", "No se encontraron credenciales guardadas.");
                }
            } else {
                if (results.error !== 'user_cancel' && results.error !== 'app_cancel') {
                    Alert.alert("Error", "No se pudo autenticar");
                }
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Ocurrió un error inesperado");
        }
    };


    return (
        <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.innerContainer}
            >
                <View style={styles.header}>
                    <LinearGradient
                        colors={[theme.colors.accent, theme.colors.secondary]}
                        style={styles.logoCircle}
                    >
                        <Text style={styles.logoIcon}>$</Text>
                    </LinearGradient>
                    <Text style={styles.brandName}>PRESTAZO</Text>
                    <View style={styles.subtitleRow}>
                        <ShieldCheck color={theme.colors.accent} size={14} style={{ marginRight: 5 }} />
                        <Text style={styles.subtitle}>Préstamos Seguros</Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>¡Bienvenido!</Text>
                    <Text style={styles.loginTitle}>Inicia sesión</Text>

                    {/* Input Usuario */}
                    <View style={styles.inputContainer}>
                        <User color={theme.colors.primary} size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor={theme.colors.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Input Contraseña */}
                    <View style={styles.inputContainer}>
                        <Lock color={theme.colors.primary} size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor={theme.colors.textLight}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff color={theme.colors.primary} size={18} /> : <Eye color={theme.colors.primary} size={18} />}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Cargando...' : 'Ingresar'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {isBiometricSupported && (
                        <>
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>o</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.biometricButton,
                                    !hasSavedCredentials && { opacity: 0.5, backgroundColor: '#f1f5f9' }
                                ]}
                                onPress={handleBiometricLogin}
                                activeOpacity={hasSavedCredentials ? 0.7 : 1}
                            >
                                <View style={[styles.biometricIconCircle, !hasSavedCredentials && { backgroundColor: '#e2e8f0' }]}>
                                    <Fingerprint color={hasSavedCredentials ? theme.colors.cardGreen : '#94a3b8'} size={24} />
                                </View>
                                <Text style={[styles.biometricText, !hasSavedCredentials && { color: '#94a3b8' }]}>
                                    Usar Biometría
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={styles.footerLinks}>
                        <Text style={styles.noAccountText}>
                            ¿Nuevo aquí?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.registerText}>
                                Regístrate
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.securityInfo}>
                    <Text style={styles.encryptionText}>
                        Seguridad SSL 256-bit
                    </Text>
                    <Text style={styles.encryptionText}>
                        Desarrollado por Yosman Mavarez
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        ...theme.shadows.lg,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    logoIcon: {
        fontSize: 38,
        color: '#fff',
        fontWeight: '900'
    },
    brandName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 15,
    },
    subtitle: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 28,
        padding: 20,
        ...theme.shadows.lg,
    },
    welcomeText: {
        fontSize: 10,
        color: theme.colors.primary,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 12,
        marginBottom: 12,
        height: 52,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    loginButton: {
        height: 52,
        borderRadius: 16,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 12,
        color: theme.colors.textLight,
        fontSize: 11,
        fontWeight: 'bold',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    biometricIconCircle: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        ...theme.shadows.sm,
    },
    biometricText: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '700',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    noAccountText: {
        color: theme.colors.textLight,
        fontSize: 13,
    },
    registerText: {
        color: theme.colors.primary,
        fontWeight: '800',
        fontSize: 13,
        marginLeft: 4,
    },
    securityInfo: {
        marginTop: 15,
    },
    encryptionText: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
        marginBottom: 2,
        fontWeight: '600',
    }
});

