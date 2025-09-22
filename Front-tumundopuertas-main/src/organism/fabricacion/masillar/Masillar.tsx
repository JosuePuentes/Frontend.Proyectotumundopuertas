import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DetalleMasillar from "./DetalleMasillar";
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
  costoProduccion: number;
  detalleitem?: string;
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

const PedidosMasillar: React.FC = () => {
  const [masillar, setMasillar] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { dataEmpleados, fetchEmpleado } = useEmpleado();

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/pedidos/all/?orden=orden2`);
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const pedidos = await res.json();
      setMasillar(pedidos.filter((p: Pedido) => p.estado_general === "orden2"));
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPedidos();
    fetchEmpleado(`${getApiUrl()}/empleados/all/`);
  }, []);


  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Pedidos Para Masillar y Pintar</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></span>
            <span className="text-blue-600 font-semibold">Cargando pedidos...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 font-semibold py-4">{error}</div>
        ) : masillar.length === 0 ? (
          <p className="text-gray-500">No hay pedidos en pintar.</p>
        ) : (
          <ul className="space-y-8">
            {masillar.map((pedido) => (
              <li key={pedido._id} className="border rounded-xl bg-white shadow p-4 transition-all duration-300 hover:shadow-lg">
                <DetalleMasillar pedido={pedido} />
                <div className="mt-4">
                  <AsignarArticulos
                    estado_general={"orden2"}
                    nuevo_estado_general="orden3"
                    numeroOrden="2"
                    items={pedido.items.map((item) => ({
                      id: item.id,
                      codigo: item.codigo,
                      nombre: item.nombre,
                      descripcion: item.descripcion,
                      categoria: item.categoria,
                      precio: item.precio,
                      costo: item.costo,
                      cantidad: item.cantidad,
                      activo: item.activo,  
                      costoProduccion: item.costoProduccion || 0, // Si tienes un campo específico, cámbialo aquí
                      detalleitem: item.detalleitem || "",
                      imagenes: item.imagenes || [],
                    }))}
                    empleados={Array.isArray(dataEmpleados) ? dataEmpleados : []}
                    pedidoId={pedido._id}
                    tipoEmpleado={["masillar","pintar","ayudante"]}
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

export default PedidosMasillar;
