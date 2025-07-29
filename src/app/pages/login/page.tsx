'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import customAnimation from '../../../../public/codi.json';
import backgroundAnimation from '../../../../public/Stars.json';
import { debounce } from 'lodash';
import { app } from '../../firebase/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

type AuthForm = {
  username?: string;
  email: string;
  password: string;
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<AuthForm>();
  const username = watch('username');
  const email = watch('email');
  const password = watch('password');
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAnimationState('success');
        setTimeout(() => router.push('/pages/dashboard'), 1000);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isLogin) {
      setUsernameStatus('');
      setAnimationState(email || password ? 'typing' : 'idle');
    } else {
      const checkUsername = debounce(async (username: string) => {
        if (username && username.length >= 3) {
          setUsernameStatus('checking');
          setAnimationState('checking');
          try {
            const q = query(collection(db, 'usuarios'), where('username', '==', username));
            const querySnapshot = await getDocs(q);
            setUsernameStatus(querySnapshot.empty ? 'available' : 'taken');
            setAnimationState(querySnapshot.empty ? 'available' : 'error');
          } catch (err: any) {
            setError('Error al verificar nombre de usuario');
            setAnimationState('error');
          }
        } else {
          setUsernameStatus('');
          setAnimationState(email || password ? 'typing' : 'idle');
        }
      }, 500);
      checkUsername(username || '');
      return () => checkUsername.cancel();
    }
  }, [username, email, password, isLogin]);

  useEffect(() => {
    if (errors.username || errors.email || errors.password || error) {
      setAnimationState('error');
    }
  }, [errors, error]);

  useEffect(() => {
    if (lottieRef.current) {
      switch (animationState) {
        case 'typing':
          lottieRef.current.setSpeed(1.2);
          lottieRef.current.playSegments([0, 100], true);
          break;
        case 'checking':
          lottieRef.current.setSpeed(1.5);
          lottieRef.current.playSegments([0, 100], true);
          break;
        case 'available':
          lottieRef.current.setSpeed(1);
          lottieRef.current.playSegments([0, 100], true);
          break;
        case 'success':
          lottieRef.current.setSpeed(1);
          lottieRef.current.playSegments([150, 240], true);
          break;
        case 'error':
          lottieRef.current.setSpeed(0.8);
          lottieRef.current.playSegments([0, 100], true);
          break;
        default:
          lottieRef.current.setSpeed(1);
          lottieRef.current.goToAndStop(0, true);
          break;
      }
    }
  }, [animationState]);

  const onSubmit: SubmitHandler<AuthForm> = async (data) => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const q = query(collection(db, 'usuarios'), where('username', '==', data.email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError('Usuario no encontrado');
          setAnimationState('error');
          return;
        }
        if (querySnapshot.size > 1) {
          setError('Múltiples usuarios con el mismo nombre. Contacta al soporte.');
          setAnimationState('error');
          return;
        }
        const userData = querySnapshot.docs[0].data();
        await signInWithEmailAndPassword(auth, userData.email, data.password);
        setAnimationState('success');
      } else {
        if (usernameStatus !== 'available') {
          setError('El nombre de usuario no está disponible');
          setAnimationState('error');
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          uid: userCredential.user.uid,
          username: data.username,
          email: data.email,
          createdAt: new Date(),
        });
        setAnimationState('success');
      }
    } catch (err: any) {
      setError(
        err.code === 'auth/wrong-password' ? 'Contraseña incorrecta' :
        err.code === 'auth/user-not-found' ? 'Usuario no encontrado' :
        err.code === 'auth/email-already-in-use' ? 'El correo ya está registrado' :
        err.code === 'permission-denied' ? 'Permisos insuficientes. Verifica las reglas de Firestore.' :
        err.code === 'auth/too-many-requests' ? 'Demasiados intentos. Intenta de nuevo más tarde.' :
        err.message || 'Error al procesar'
      );
      setAnimationState('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsernameStatus('');
    setAnimationState('idle');
    reset();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
       <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-200 to-indigo-100 z-0" />
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <Lottie
          animationData={backgroundAnimation}
          loop={true}
          style={{
            width: '125vw', 
            height: '130vh', 
            position: 'absolute',
            left: '-15vw', 
            top: '-15vh',  
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />
      </div>
      <div className="relative z-20 flex items-center justify-center w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/60 p-8 rounded-xl shadow-md w-full max-w-md text-blue-950"
        >
          <div className="flex justify-center mb-">
            <Lottie
              lottieRef={lottieRef}
              animationData={customAnimation}
              loop={animationState !== 'success'}
              style={{ width: 180, height: 180 }}
            />
          </div>
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleMode}
              className="text-indigo-500 hover:underline text-sm"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username', {
                    required: !isLogin ? 'El nombre de usuario es obligatorio' : false,
                    minLength: {
                      value: 3,
                      message: 'El nombre de usuario debe tener al menos 3 caracteres',
                    },
                  })}
                  className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                    errors.username || usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'available' ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nombre de usuario"
                />
                {usernameStatus === 'checking' && (
                  <p className="text-gray-500 text-xs mt-1 animate-pulse">Verificando...</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-green-500 text-xs mt-1">¡Nombre disponible!</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-red-500 text-xs mt-1">El nombre de usuario ya está en uso</p>
                )}
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {isLogin ? 'Nombre de usuario o Correo' : 'Correo electrónico'}
              </label>
              <input
                id="email"
                type={isLogin ? 'text' : 'email'}
                {...register('email', {
                  required: 'Este campo es obligatorio',
                  pattern: isLogin ? undefined : {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Correo electrónico inválido',
                  },
                })}
                className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={isLogin ? 'Ingresa tu nombre de usuario o correo' : 'Ingresa tu correo'}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                  },
                })}
                className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu contraseña"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center animate-pulse" aria-live="polite">
                {error}
              </p>
            )}
            <motion.button
              type="submit"
              disabled={loading || (!isLogin && usernameStatus !== 'available')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full p-3 rounded-md text-white font-medium transition duration-200 ${
                loading || (!isLogin && usernameStatus !== 'available') ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isLogin ? 'Iniciando...' : 'Registrando...'}
                </span>
              ) : (
                isLogin ? 'Entrar' : 'Registrarse'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}