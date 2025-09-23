import React from 'react';
import { useNavigate } from 'react-router';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem("usuario");
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <img src="/puertalogo.PNG" alt="Logo Tu Mundo Puerta" className="w-48 h-auto mb-6" />
            <h1 className="text-3xl font-bold mb-2">Bienvenido a Crafteo</h1>
            <p className="text-lg mb-4">Esta es la página principal de tu aplicación.</p>
            {!isAuthenticated && (
                <button className="bg-blue-600 text-white py-2 px-4 rounded m-8" onClick={() => navigate('/login')}>
                    Iniciar Sesion
                </button>
            )}
        </div>
    );
};

export default HomePage;