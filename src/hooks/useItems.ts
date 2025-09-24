import { useState } from "react";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

export function useItems() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async (endpoint: string, options?: FetchOptions) => {
    setLoading(true);
    setError(null);
    console.log("🔍 ITEMS - Iniciando petición a:", secureEndpoint);
    try {
      let secureEndpoint = endpoint;
      if (secureEndpoint.startsWith('http://')) {
        secureEndpoint = secureEndpoint.replace('http://', 'https://');
      } else if (!secureEndpoint.startsWith('https://')) {
        secureEndpoint = `https://${secureEndpoint}`;
      }
      console.log("🔍 ITEMS - URL original:", endpoint );
      console.log("🔍 ITEMS - URL final:", secureEndpoint);
      const res = await fetch(secureEndpoint, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });
      console.log("🔍 ITEMS - Respuesta de la petición:", res);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("🔍 ITEMS - Error en la respuesta de la API:", res.status, errorText);
        throw new Error(`Error en la petición: ${res.status} ${errorText}`);
      }
      const result = await res.json();
      console.log("🔍 ITEMS - Datos recibidos:", result);
      setData(result);
    } catch (err: any) {
      console.error("🔍 ITEMS - Error en fetchItems:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
      console.log("🔍 ITEMS - Petición finalizada.");
    }
  };

  return { data, loading, error, fetchItems };
}
