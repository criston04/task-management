'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import backgroundAnimation from '../../../../public/Stars.json';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { app } from '../../firebase/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

interface Task {
    id: string;
    title: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
}

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [taskError, setTaskError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                await fetchTasks(user.uid);
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchTasks = async (uid: string) => {
        setLoading(true);
        try {
            const q = query(collection(db, 'tasks'), where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            const taskData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Task[];
            setTasks(taskData);
        } catch (err: any) {
            setError(err.message || 'Error al cargar las tareas');
        } finally {
            setLoading(false);
        }
    };
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) {
            setTaskError('El título de la tarea no puede estar vacío');
            return;
        }
        if (!userId) {
            setError('Usuario no autenticado');
            return;
        }
        setLoading(true);
        setTaskError('');
        setError('');
        try {
            const taskId = doc(collection(db, 'tasks')).id; 
            await setDoc(doc(db, 'tasks', taskId), {
                title: newTask,
                completed: false,
                userId,
                createdAt: new Date(),
            });
            setNewTask('');
            await fetchTasks(userId);
        } catch (err: any) {
            setError(
                err.code === 'permission-denied'
                    ? 'permisos insuficientes. verifica las reglase de firestore.'
                    : err.message || 'Error al agregar la tarea',
            );
        } finally {
            setLoading(false);
        }
    };
    const handleToggleTask = async (taskId: string, completed: boolean) => {
        if (!userId) return;
        setLoading(true);
        try {
            await setDoc(doc(db, 'tasks', taskId), { completed: !completed }, { merge: true });
            await fetchTasks(userId);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la tarea');
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!userId) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
            await fetchTasks(userId);
        } catch (err: any) {
            setError(err.message || 'Error al eliminar la tarea');
        } finally {
            setLoading(false);
        }
    };
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/pages/login');
        } catch (err: any) {
            setError(err.message || 'Error al cerrar sesión');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 to-indigo-100 px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
            <div className="max-w-3xl mx-auto">
                <div className="absolute inset-0 w-full h-full pointer-events-none z-1">
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Mis Tareas</h1>
                    <button
                        onClick={handleSignOut}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                    >
                        Cerrar Sesión
                    </button>
                </div>
                <form onSubmit={handleAddTask} className="mb-6 bg-white p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="newTask" className="block text-sm font-medium text-gray-700">
                                Nueva Tarea
                            </label>
                            <input
                                id="newTask"
                                type="text"
                                placeholder="Ingresa una nueva tarea"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className={`mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${taskError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                disabled={loading}
                                aria-describedby="task-error"
                            />
                            {taskError && (
                                <p className="text-red-500 text-xs mt-1" id="task-error">
                                    {taskError}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`p-3 rounded-md text-white font-medium transition duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Agregando...
                                </span>
                            ) : (
                                'Agregar'
                            )}
                        </button>
                    </div>
                </form>
                {error && (
                    <p className="text-red-500 text-sm text-center animate-pulse mb-4" aria-live="polite">
                        {error}
                    </p>
                )}
                {tasks.length === 0 && !loading && (
                    <p className="text-gray-600 text-center">No tienes tareas aún.</p>
                )}
                <ul className="space-y-4">
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-gray-900"
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTask(task.id, task.completed)}
                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                                    disabled={loading}
                                />
                                <span className={`text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                                    {task.title}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-500 hover:text-red-700 transition duration-200"
                                disabled={loading}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );



}
