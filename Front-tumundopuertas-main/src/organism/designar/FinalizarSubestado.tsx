import { getApiUrl } from "@/lib/api";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface FinalizarSubestadoProps {
  pedidoId: string;
  numeroOrden: string;
  estadoGeneralActual: string;
  nuevoEstadoGeneral: string;
  onFinalizado?: () => void;
}

const FinalizarSubestado: React.FC<FinalizarSubestadoProps> = ({
  pedidoId,
  numeroOrden,
  nuevoEstadoGeneral,
  onFinalizado,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleFinalizar = async () => {
    setLoading(true);
    setMessage("");
    try {
      const apiUrl = getApiUrl();
      // Usar el nuevo endpoint para finalizar pedido y subestado en una sola petición
      const res = await fetch(`${apiUrl}/pedidos/finalizar/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: pedidoId,
          numero_orden: numeroOrden,
          nuevo_estado_general: nuevoEstadoGeneral,
        }),
      });
      if (!res.ok) throw new Error("Error finalizando el pedido");
      setMessage("Pedido finalizado correctamente");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      onFinalizado?.();
    } catch (err: any) {
      setMessage(err.message || "Error al finalizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start m-4">
        {message && (
          <div className="mb-2 text-green-700 font-bold">{message}</div>
        )}
        <Button
          variant="secondary"
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={handleFinalizar}
          disabled={loading}
        >
          {loading ? "Finalizando..." : "Finalizar pedido"}
        </Button>
    </div>
  );
};

export default FinalizarSubestado;
