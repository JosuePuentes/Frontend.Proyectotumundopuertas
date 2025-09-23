import { getApiUrl } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DetalleEnvio from "./DetalleEnvio";
import AsignarArticulos from "@/organism/asignar/AsignarArticulos";
import { useEmpleado } from "@/hooks/useEmpleado";

interface PedidoItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  costo: number;
  cantidad: number;
  activo: boolean;
  imagenes?: string[];
}

interface PedidoSeguimiento {
  orden: number;
  nombre_subestado: string;
  estado: string;
  asignado_a?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  notas?: string;
}

interface Pedido {
  _id: string;
  cliente_id: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado_general: string;
  items: PedidoItem[];
  seguimiento: PedidoSeguimiento[];
}

const EnvioPage: React.FC = () => {
  const [envios, setEnvios] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { dataEmpleados, fetchEmpleado } = useEmpleado();

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/pedidos/estado/?estado_general=orden5`
      );
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const data = await res.json();
      setEnvios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const apiUrl = getApiUrl();
    fetchEmpleado(`${apiUrl}/empleados/all/`);
  }, []);

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Pedidos Entregados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></span>
            <span className="text-blue-600 font-semibold">
              Cargando pedidos...
            </span>
          </div>
        ) : error ? (
          <div className="text-red-600 font-semibold py-4">{error}</div>
        ) : envios.length === 0 ? (
          <p className="text-gray-500">No hay pedidos entregados.</p>
        ) : (
          <ul className="space-y-8">
            {envios.map((pedido) => (
              <li
                key={pedido._id}
                className="border rounded-xl bg-white shadow p-4 transition-all duration-300 hover:shadow-lg"
              >
                <DetalleEnvio pedido={pedido} />
                <div className="mt-4">
                  <AsignarArticulos
                    estado_general={"orden5"}
                    nuevo_estado_general="orden6"
                    numeroOrden="5"
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
                      costoProduccion: item.costo, // Si tienes un campo específico, cámbialo aquí
                    }))}
                    empleados={Array.isArray(dataEmpleados) ? dataEmpleados : []}
                    pedidoId={pedido._id}
                    tipoEmpleado={["envio"]}
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

export default EnvioPage;
