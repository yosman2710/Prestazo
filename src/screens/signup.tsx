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
import { theme } from '../utils/theme';
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
            colors={[theme.colors.primary, theme.colors.secondary]}
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
                    <ArrowLeft color={theme.colors.surface} size={24} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <LinearGradient
                        colors={[theme.colors.accent, theme.colors.secondary]}
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
                        <User color={theme.colors.primary} size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de usuario"
                            placeholderTextColor={theme.colors.textLight}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Input Email */}
                    <View style={styles.inputContainer}>
                        <Mail color={theme.colors.primary} size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Gmail / Correo"
                            placeholderTextColor={theme.colors.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Input Contraseña */}
                    <View style={styles.inputContainer}>
                        <Lock color={theme.colors.primary} size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor={theme.colors.textLight}
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
                            colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.surface} />
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
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...theme.shadows.lg,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    logoIcon: {
        fontSize: 42,
        color: '#fff',
        fontWeight: '900'
    },
    brandName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 32,
        padding: 24,
        ...theme.shadows.lg,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 18,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
    },
    signupButton: {
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 8,
        ...theme.shadows.md,
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    noAccountText: {
        color: theme.colors.textLight,
        fontSize: 14,
    },
    registerText: {
        color: theme.colors.primary,
        fontWeight: '800',
        fontSize: 14,
        marginLeft: 6,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    encryptionText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        marginLeft: 8,
        fontWeight: '600',
    }
});

