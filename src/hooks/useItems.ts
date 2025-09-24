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
      if (!res.ok) throw new Error("Error en la petición");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchItems };
}