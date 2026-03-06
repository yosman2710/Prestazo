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
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../providers/AuthProvider';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: { navigation: any }) {
    const { signIn, signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(hasHardware && isEnrolled);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }

        setIsLoading(true);
        try {
            await signIn(email, password);
            // AuthProvider will handle navigation
        } catch (error: any) {
            console.log(error);
            Alert.alert("Error", error.message || "Ocurrió un error en la autenticación");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const results = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Inicia sesión con biometría',
                disableDeviceFallback: false,
                cancelLabel: 'Cancelar',
            });

            if (results.success) {
                await AsyncStorage.setItem('userToken', 'abc123token-bio');
                await AsyncStorage.setItem('userName', 'Usuario Biométrico');
                Alert.alert("Éxito", "Autenticación biométrica exitosa");
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
            colors={['#001F3F', '#003366', '#004080']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.innerContainer}
            >
                <View style={styles.header}>
                    <LinearGradient
                        colors={['#00e6e6', '#00a8a8']}
                        style={styles.logoCircle}
                    >
                        <Text style={styles.logoIcon}>$</Text>
                    </LinearGradient>
                    <Text style={styles.brandName}>PRESTAZO</Text>
                    <View style={styles.subtitleRow}>
                        <ShieldCheck color="#00e6e6" size={16} style={{ marginRight: 5 }} />
                        <Text style={styles.subtitle}>Préstamos Seguros & Rápidos</Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>¡Bienvenido!</Text>
                    <Text style={styles.loginTitle}>Inicia sesión en tu cuenta</Text>

                    {/* Input Usuario */}
                    <View style={styles.inputContainer}>
                        <User color="#003366" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Input Contraseña */}
                    <View style={styles.inputContainer}>
                        <Lock color="#003366" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff color="#003366" size={20} /> : <Eye color="#003366" size={20} />}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                        <LinearGradient
                            colors={['#0052D4', '#4364F7', '#6FB1FC']}
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
                                <Text style={styles.dividerText}>o usa</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.biometricButton}
                                onPress={handleBiometricLogin}
                                activeOpacity={0.7}
                            >
                                <View style={styles.biometricIconCircle}>
                                    <Fingerprint color="#00a8a8" size={32} />
                                </View>
                                <Text style={styles.biometricText}>Acceso Biométrico</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={styles.footerLinks}>
                        <Text style={styles.noAccountText}>
                            ¿Nuevo aquí?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.registerText}>
                                Crea una cuenta
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.encryptionText}>
                    Seguridad de grado militar 256-bit SSL
                </Text>

                <Text style={styles.encryptionText}>
                    Desarrollado por Yosman Mavarez
                </Text>
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
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 8,
        shadowColor: '#00e6e6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    logoIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '900'
    },
    brandName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 3,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    subtitle: {
        color: '#00e6e6',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 12,
    },
    welcomeText: {
        fontSize: 10,
        color: '#003366',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    loginTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 10,
        height: 48,
    },
    icon: {
        marginRight: 10,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 15,
    },
    forgotText: {
        color: '#0052D4',
        fontSize: 12,
        fontWeight: '700',
    },
    loginButton: {
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#4364F7',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
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
        letterSpacing: 0.8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#aaa',
        fontSize: 11,
        fontWeight: '600',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9f9',
        borderWidth: 1,
        borderColor: '#00a8a822',
        borderRadius: 12,
        padding: 8,
        marginBottom: 5,
    },
    biometricIconCircle: {
        backgroundColor: '#fff',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 1,
    },
    biometricText: {
        color: '#00a8a8',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    noAccountText: {
        color: '#777',
        fontSize: 13,
    },
    registerText: {
        color: '#0052D4',
        fontWeight: '800',
        fontSize: 13,
    },
    encryptionText: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        marginTop: 20,
        letterSpacing: 0.5,
    }
});
