import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageDisplay from "@/upfile/ImageDisplay";

interface PedidoItem {
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

interface DetalleEnvioProps {
  pedido: Pedido;
}

const DetalleEnvio: React.FC<DetalleEnvioProps> = ({ pedido }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Detalle del Pedido #{pedido._id}</CardTitle>
  {/* Botón de cerrar eliminado */}
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <span className="font-semibold">Cliente:</span> {pedido.cliente_id}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Fecha:</span> {pedido.fecha_creacion}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Estado:</span> <Badge variant="secondary">{pedido.estado_general}</Badge>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Items:</span>
          <ul className="list-disc ml-6 mt-1">
            {pedido.items.map((item, idx) => (
              <li key={idx} className="mb-2">
                <div className="flex flex-col gap-1">
                  <span>
                    {item.nombre} | Cantidad: {item.cantidad}
                  </span>
                  {/* Mostrar imágenes si existen */}
                  {item.imagenes && item.imagenes.length > 0 && (
                    <div className="flex flex-row gap-2 mt-1">
                      {item.imagenes.map((img, imgIdx) => (
                        <ImageDisplay
                          key={imgIdx}
                          imageName={img}
                          alt={`Imagen ${imgIdx + 1} de ${item.nombre}`}
                          style={{
                            maxWidth: 60,
                            maxHeight: 60,
                            borderRadius: 8,
                            border: "1px solid #ddd",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetalleEnvio;
