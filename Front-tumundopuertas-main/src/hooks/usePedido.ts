import { getApiUrl } from "@/lib/api";
import { useState } from "react";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

export function usePedido() {
  const [dataPedidos, setDataPedidos] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const fetchPedido = async (endpoint: string, options?: FetchOptions) => {
    setLoading(true);
    setError(null);
    setStatus(null);
    const apiurl = getApiUrl();
    try {
      const res = await fetch(`${apiurl}${endpoint}`, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });
      const result = await res.json();
      setDataPedidos(result);
      console.log("Resultado de la API:", result);
      return { success: true, data: result, status: res.status };
    } catch (err: any) {
      const errorMessage = err.message || "Error desconocido";
      setError(errorMessage);
      return { success: false, error: errorMessage, status: null };
    } finally {
      setLoading(false);
    }
  };

  return { dataPedidos, loading, error, status, fetchPedido };
}