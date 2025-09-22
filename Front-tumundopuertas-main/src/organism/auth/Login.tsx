import { getApiUrl } from "@/lib/api";
import React, { useState } from "react";

interface LoginResponse {
	access_token: string;
	token_type: string;
	permisos: string[];
	usuario: string;
	identificador?: string;
}

const Login: React.FC = () => {
	const [usuario, setUsuario] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const apiUrl = getApiUrl();
			const res = await fetch(`${apiUrl}/auth/login/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ usuario, password })
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.detail || "Error de autenticación");
			}
			const data: LoginResponse = await res.json();
			localStorage.setItem("access_token", data.access_token);
			localStorage.setItem("usuario", data.usuario);
			localStorage.setItem("permisos", JSON.stringify(data.permisos));
			if (data.identificador) {
				localStorage.setItem("identificador", data.identificador);
			}
			// Redirigir o mostrar éxito
			window.location.href = "/";
		} catch (err: any) {
			setError(err.message || "Error desconocido");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
				<div className="mb-4">
					<label className="block mb-2 font-semibold">Usuario</label>
					<input
						type="text"
						value={usuario}
						onChange={e => setUsuario(e.target.value)}
						className="w-full border px-3 py-2 rounded"
						required
					/>
				</div>
				<div className="mb-6">
					<label className="block mb-2 font-semibold">Contraseña</label>
					<input
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						className="w-full border px-3 py-2 rounded"
						required
					/>
				</div>
				{error && <div className="mb-4 text-red-600 text-center">{error}</div>}
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors"
					disabled={loading}
				>
					{loading ? "Ingresando..." : "Ingresar"}
				</button>
			</form>
		</div>
	);
};

export default Login;
