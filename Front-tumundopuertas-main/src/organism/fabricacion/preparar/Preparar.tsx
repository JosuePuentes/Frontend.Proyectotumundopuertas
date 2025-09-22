import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DetallePreparar from "./DetallePreparar";
import AsignarArticulos from "@/organism/asignar/AsignarArticulos";
import { getApiUrl } from "@/lib/api";
import { useEmpleado } from "@/hooks/useEmpleado";

// Tipos para pedido y item
export type PedidoItem = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  costo: number;
  cantidad: number;
  activo: boolean;
  costoProduccion?: number;
  detalleitem?: string;
  imagenes?: string[];
};

export type Pedido = {
  _id: string;
  cliente_id: string;
  cliente_nombre: string;
  fecha_creacion: string;
  estado_general: string;
  items: PedidoItem[];
  seguimiento?: any[];
};
const PedidosPreparar: React.FC = () => {
  const [preparar, setPreparar] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { dataEmpleados, fetchEmpleado } = useEmpleado();
  
  const fetchPedidos = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/pedidos/all/?orden=orden3`);
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const pedidos = await res.json();
      setPreparar(pedidos.filter((p: any) => p.estado_general === "orden3"));
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchEmpleado(`${getApiUrl()}/empleados/all/`);
  }, []);

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Pedidos en Manillar</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></span>
            <span className="text-blue-600 font-semibold">Cargando pedidos...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 font-semibold py-4">{error}</div>
        ) : preparar.length === 0 ? (
          <p className="text-gray-500">No hay pedidos en Manillar.</p>
        ) : (
          <ul className="space-y-8">
            {preparar.map((pedido: any) => (
              <li key={pedido._id} className="border rounded-xl bg-white shadow p-4 transition-all duration-300 hover:shadow-lg">
                <DetallePreparar pedido={pedido} />
                <div className="mt-4">
                  <AsignarArticulos
                    estado_general={"orden3"}
                    nuevo_estado_general="orden4"
                    numeroOrden="3"
                    items={pedido.items.map((item: any) => ({
                      id: item.id,
                      codigo: item.codigo,
                      nombre: item.nombre,
                      descripcion: item.descripcion,
                      categoria: item.categoria,
                      precio: item.precio,
                      costo: item.costo,
                      cantidad: item.cantidad,
                      activo: item.activo,
                      costoProduccion: item.costoProduccion ||  0, // Si tienes un campo específico, cámbialo aquí
                      detalleitem: item.detalleitem || "", // Asegúrate de mapear el nuevo campo
                      imagenes: item.imagenes || [], // Asegúrate de mapear el nuevo campo
                    }))}
                    empleados={Array.isArray(dataEmpleados) ? dataEmpleados : []}
                    pedidoId={pedido._id}
                    tipoEmpleado={["manillar","ayudante"]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PedidosPreparar;
