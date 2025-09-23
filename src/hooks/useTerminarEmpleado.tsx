import { getApiUrl } from "@/lib/api";
import { useState } from "react";

interface UseTerminarEmpleadoOptions<T = any> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

interface UseTerminarEmpleadoReturn<T = any> {
    terminarEmpleado: (payload: any) => Promise<void>;
    loading: boolean;
    error: string | null;
    data: T | null;
}

type TerminarEmpleadoPayload = {
      pedido_id: string,
      item_id: string,
      empleado_id: string,
      estado: "terminado",
      fecha_fin: string,
      orden?: string,
    };

function useTerminarEmpleado<T = any>(
    options?: UseTerminarEmpleadoOptions<T>
): UseTerminarEmpleadoReturn<T> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);

    const terminarEmpleado = async (payload: TerminarEmpleadoPayload) => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/pedidos/asignacion/terminar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData?.message || response.statusText || "Error al terminar empleado";
                throw new Error(errorMsg);
            }
            const data: T = await response.json();
            setData(data);
            options?.onSuccess?.(data);
        } catch (err: any) {
            setError(err.message);
            options?.onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    return { terminarEmpleado, loading, error, data };
}

export default useTerminarEmpleado;