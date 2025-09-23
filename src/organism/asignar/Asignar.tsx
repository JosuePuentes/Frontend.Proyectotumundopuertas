import { getApiUrl } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEmpleado } from "@/hooks/useEmpleado";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FinalizarSubestado from "@/organism/designar/FinalizarSubestado";

interface AsignarEmpleadoProps {
  pedidoId: string;
  nuevoEstadoGeneral: string;
  onAsignado?: () => void;
}

const AsignarEmpleado: React.FC<AsignarEmpleadoProps> = ({ pedidoId, nuevoEstadoGeneral, onAsignado }) => {
  const { dataEmpleados, fetchEmpleado } = useEmpleado();
  const [empleadoId, setEmpleadoId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [empleadoActual, setEmpleadoActual] = useState<string>("");
  const [showFinalizar, setShowFinalizar] = useState(false);

  // Fetch empleados al montar
  useEffect(() => {
    const apiurl = getApiUrl();
    fetchEmpleado(`${apiurl}/empleados/all`);
    // Obtener el pedido y detectar si ya tiene asignado un empleado
    const fetchPedidoDetalle = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/pedidos/id/${pedidoId}`);
        if (!res.ok) return;
        const pedido = await res.json();
        // Buscar en seguimiento el subestado actual y el asignado
        if (pedido && Array.isArray(pedido.seguimiento)) {
          const sub = pedido.seguimiento.find((s: any) => s.estado === "en_proceso" && s.asignado_a_id);
          if (sub && sub.asignado_a_id) setEmpleadoActual(sub.asignado_a_id);
        }
      } catch {}
    };
    fetchPedidoDetalle();
  }, [pedidoId]);

  // Selecciona empleado y muestra formulario
  const handleSelectEmpleado = (id: string) => {
    setEmpleadoId(id);
    setShowForm(true);
    setMessage(null);
  };

  // Asigna empleado al pedido (cambia el asignado si ya existe)
  const handleAsignar = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const apiUrl = getApiUrl();
      const numeroOrden = "1"; // Puedes cambiarlo por la orden que corresponda
      const response = await fetch(`${apiUrl}/pedidos/subestados/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: pedidoId,
          numero_orden: numeroOrden,
          tipo_fecha: "inicio",
          estado: "en_proceso",
          asignado_a_id: empleadoId,
          asignado_a_nombre: empleadoSeleccionado?.nombreCompleto || empleadoId
        }),
      });
      if (!response.ok) throw new Error("No se pudo asignar el empleado");
      setMessage({ type: "success", text: empleadoActual ? "Empleado cambiado correctamente" : "Empleado asignado correctamente" });
      setShowForm(false);
      setEmpleadoId("");
      setEmpleadoActual(empleadoId);
      onAsignado?.();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error al asignar" });
    } finally {
      setLoading(false);
    }
  };

  // Obtiene el nombre del empleado seleccionado
  const empleadoSeleccionado = Array.isArray(dataEmpleados)
    ? dataEmpleados.find((e: any) => e.identificador === empleadoId)
    : null;

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Asignar Empleado al Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        {empleadoActual && (
          <div className="mb-4 p-2 border rounded bg-blue-50 flex items-center justify-between">
            <span className="font-medium text-blue-700">Empleado asignado actualmente:</span>
            <span className="font-bold">{empleadoActual}</span>
            <button
              type="button"
              className="ml-4 px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              onClick={() => setShowForm(true)}
            >
              Cambiar empleado
            </button>
          </div>
        )}
        <ul className="space-y-2">
          {Array.isArray(dataEmpleados) && dataEmpleados
            .filter((e: any) =>
              typeof e.identificador === "string" &&
              e.identificador.trim() !== "" &&
              Array.isArray(e.permisos) &&
              e.permisos.includes("herreria")
            )
            .map((empleado: any) => (
              <li
                key={empleado.id}
                className={`border rounded p-2 flex items-center justify-between ${empleadoActual && !showForm ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}`}
                onClick={() => {
                  if (!empleadoActual || showForm) handleSelectEmpleado(empleado.identificador);
                }}
                style={empleadoActual && !showForm ? { pointerEvents: 'none', opacity: 0.6 } : {}}
              >
                <span>{empleado.nombreCompleto || empleado.identificador}</span>
                <Badge variant="secondary">{empleado.permisos?.join(", ")}</Badge>
              </li>
            ))}
        </ul>
        {showForm && empleadoId && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <div className="mb-2">
              <span className="font-medium">Empleado seleccionado:</span> {empleadoSeleccionado?.nombreCompleto || empleadoId}
            </div>
            {message && (
              <div className={message.type === "error" ? "text-red-600 mb-2" : "text-green-600 mb-2"}>{message.text}</div>
            )}
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
              onClick={handleAsignar}
              disabled={loading}
            >
              {loading ? (empleadoActual ? "Cambiando..." : "Asignando...") : (empleadoActual ? "Confirmar cambio" : "Confirmar asignación")}
            </button>
            <button
              type="button"
              className="ml-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-200"
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        )}
        <div className="mt-6">
          {empleadoActual && (
            !showFinalizar ? (
              <Button
                variant="secondary"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowFinalizar(true)}
              >
                Terminar proceso
              </Button>
            ) : (
              <FinalizarSubestado
                pedidoId={pedidoId}
                numeroOrden={"1"}
                estadoGeneralActual={"orden1"}
                nuevoEstadoGeneral={nuevoEstadoGeneral}
                onFinalizado={() => { setShowFinalizar(false); onAsignado?.(); }}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AsignarEmpleado;
