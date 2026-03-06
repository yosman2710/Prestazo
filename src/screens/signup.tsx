import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { User, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../providers/AuthProvider';

const { width } = Dimensions.get('window');

export default function SignupScreen({ navigation }: { navigation: any }) {
    const { signUp } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        try {
            // Store username in user_metadata
            await signUp(email, password, { display_name: username });

            Alert.alert(
                "¡Éxito!",
                "Tu cuenta ha sido creada. Por favor verifica tu correo electrónico para continuar.",
                [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.message || "No se pudo crear la cuenta");
        } finally {
            setIsLoading(false);
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <LinearGradient
                        colors={['#00e6e6', '#00a8a8']}
                        style={styles.logoCircle}
                    >
                        <Text style={styles.logoIcon}>$</Text>
                    </LinearGradient>
                    <Text style={styles.brandName}>PRESTAZO</Text>
                    <Text style={styles.subtitle}>Crea tu cuenta hoy</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.loginTitle}>Regístrate</Text>

                    {/* Input Usuario */}
                    <View style={styles.inputContainer}>
                        <User color="#003366" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de usuario"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Input Email */}
                    <View style={styles.inputContainer}>
                        <Mail color="#003366" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Gmail / Correo"
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
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#0052D4', '#4364F7', '#6FB1FC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signupButtonText}>Crear Cuenta</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footerLinks}>
                        <Text style={styles.noAccountText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.registerText}>Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.securityRow}>
                    <ShieldCheck color="rgba(255, 255, 255, 0.6)" size={14} />
                    <Text style={styles.encryptionText}>
                        Tus datos están protegidos con SSL 256-bit
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
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
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
    },
    subtitle: {
        color: '#00e6e6',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        elevation: 12,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 50,
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
    signupButton: {
        height: 50,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.8,
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
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    encryptionText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11,
        marginLeft: 5,
    }
});
