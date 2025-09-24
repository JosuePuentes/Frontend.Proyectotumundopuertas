import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { getApiUrl } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

interface DailySummary {
  date: string;
  totalAbonos: number;
  totalVentasFirmes: number;
  details: Array<{
    type: "abono" | "ventaFirme";
    pedidoId: string;
    amount: number;
    timestamp: string;
  }>;
}

const ResumenVentaDiaria: React.FC = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming a backend endpoint exists to provide this data
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const res = await fetch(`${getApiUrl()}/pedidos/resumen-diario?date=${today}`);
      if (!res.ok) throw new Error("Error al obtener el resumen diario");

      const data: DailySummary = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido al obtener el resumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySummary();
  }, []);

  return (
    <Card className="w-full shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          Resumen de Venta Diaria
        </CardTitle>
        <p className="text-sm text-gray-500">
          Vista general de los ingresos por abonos y ventas firmes del día.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8 text-gray-600">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            Cargando resumen...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center text-red-600 py-6">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error: {error}
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <p className="text-lg font-semibold">Fecha: {summary.date}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-md">
                <h3 className="text-md font-medium text-green-800">Ingresos por Abonos</h3>
                <p className="text-2xl font-bold text-green-900">${summary.totalAbonos.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-md">
                <h3 className="text-md font-medium text-blue-800">Ingresos por Ventas Firmes</h3>
                <p className="text-2xl font-bold text-blue-900">${summary.totalVentasFirmes.toFixed(2)}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6">Detalle de Transacciones:</h3>
            {summary.details.length > 0 ? (
              <ul className="space-y-2">
                {summary.details.map((detail, index) => (
                  <li key={index} className="p-3 border rounded-md bg-gray-50">
                    <p className="font-medium">Tipo: {detail.type === "abono" ? "Abono" : "Venta Firme"}</p>
                    <p>Pedido ID: {detail.pedidoId}</p>
                    <p>Monto: ${detail.amount.toFixed(2)}</p>
                    <p>Hora: {new Date(detail.timestamp).toLocaleTimeString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay transacciones registradas para esta fecha.</p>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            No se pudo cargar el resumen diario.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumenVentaDiaria;
// Added a comment to force re-evaluation by build system
