import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navegation/type';

//import { router } from 'expo-router';

interface AuthContextType {
    session: Session | null;
    user: any | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, options?: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    useEffect(() => {
        async function fetchSeccion() {
            const { error, data } = await supabase.auth.getSession();
            if (error) {
                console.error('Error al obtener la sesión', error);
            }

            if (data.session) {
                setSession(data.session);
                setUser(data.session.user);
            } else {
                navigation.navigate('Login');
            }

            setLoading(false);
        }

        fetchSeccion();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session) {
                navigation.navigate('MainTabs');
            } else {
                navigation.navigate('Login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };

    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, options?: any) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: options
            }
        });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};