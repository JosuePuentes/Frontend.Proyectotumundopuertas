import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface PedidoItem {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  costo: number;
  cantidad: number;
  activo: boolean;
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
  cliente_nombre?: string;
  cliente_direccion?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado_general: string;
  items: PedidoItem[];
  seguimiento: PedidoSeguimiento[];
}

interface NotaEntregaProps {
  pedido: Pedido;
}

const NotaEntrega: React.FC<NotaEntregaProps> = ({ pedido }) => {
  const [open, setOpen] = useState(false);
  const now = new Date().toLocaleDateString("es-VE", {
    timeZone: "America/Caracas",
  });

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;
    const notaHtml = `
      <html>
        <head>
          <title>.</title>
          <style>
            @media print {
              @page { size: letter; margin: 1in; }
              body { margin: 0; }
              .center-container { display: flex; justify-content: center; align-items: flex-start; }
              .nota-carta { width: 100%; max-width: 100%; margin: 0 auto; box-sizing: border-box; min-height: unset; border-radius: 0; box-shadow: none; }
            }
            body { background: #f9f9f9; }
            .center-container { display: flex; justify-content: center; align-items: flex-start; }
            .nota-carta { background: #fff; border-radius: 0; box-shadow: none; padding: 2rem; width: 100%; max-width: 100%; margin: 2rem auto; font-family: 'Inter', sans-serif; min-height: unset; }
            .nota-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .titulo { font-size: 2rem; color: #1e3a8a; font-weight: bold; margin-bottom: 0.5rem; text-align: left; }
            .badge { background: #2563eb; color: #fff; border-radius: 999px; padding: 4px 16px; font-weight: bold; font-size: 1rem; }
            .nota-info { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
            .nota-info div { font-size: 15px; }
            .nota-label { font-weight: 600; color: #374151; margin-bottom: 2px; }
            .nota-value { font-size: 18px; font-weight: bold; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 14px; }
            th { background: #f3f4f6; }
            .totales-row { background: #f3f4f6; font-weight: bold; }
            .nota-footer { margin-top: 2rem; color: #64748b; font-size: 13px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="center-container">
            <div class="nota-carta">
              <div class="nota-header">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                  <img src="/logo.jpeg" alt="Logo" style="height: 60px; width: auto; object-fit: contain; margin-right: 1rem;" />
                  <div>
                    <div class="titulo">NOTA DE ENTREGA</div>
                    <div style="font-size: 1rem; color: #1e293b; font-weight: 600; margin-top: 0.25rem;">
                      J-507172554 TU MUNDO PUERTAS, C.A.
                    </div>
                  </div>
                </div>
              </div>
              <div class="nota-info">
                <div>
                  <div class="nota-label">RIF:</div>
                  <div class="nota-value">${pedido.cliente_id}</div>
                  ${
                    pedido.cliente_nombre
                      ? `<div class='nota-label'>Nombre o Razón Social: <span style='font-weight:600;'>${pedido.cliente_nombre}</span></div>`
                      : ""
                  }
                  ${
                    pedido.cliente_direccion
                      ? `<div class='nota-label'>Dirección: <span style='font-weight:600;'>${pedido.cliente_direccion}</span></div>`
                      : ""
                  }
                  ${
                    pedido.cliente_telefono
                      ? `<div class='nota-label'>Teléfono: <span style='font-weight:600;'>${pedido.cliente_telefono}</span></div>`
                      : ""
                  }
                  ${
                    pedido.cliente_email
                      ? `<div class='nota-label'>Email: <span style='font-weight:600;'>${pedido.cliente_email}</span></div>`
                      : ""
                  }
                </div>
                <div>
                  <div class="nota-label">Fecha de Emision:</div>
                  <div style="color: #059669; font-size: 16px;">${now}</div>
                </div>
              </div>
              <div style="margin-bottom: 1.5rem;">
                <div style="font-weight:600;font-size:17px;margin-bottom:8px;">Artículos del Pedido</div>
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pedido.items
                      .map(
                        (item) => `
                      <tr>
                        <td>${item.codigo}</td>
                        <td>${item.nombre}</td>
                        <td>${item.descripcion}</td>
                        <td style="text-align:center;">${item.cantidad}</td>
                        <td style="text-align:right;">$${
                          item.precio ?? "-"
                        }</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                  <tfoot>
                    <tr class="totales-row">
                      <td colspan="3" style="text-align:right;">Totales:</td>
                      <td style="text-align:center;">${pedido.items.reduce(
                        (acc, item) => acc + (item.cantidad ?? 0),
                        0
                      )}</td>
                      <td style="text-align:right;">$${pedido.items
                        .reduce(
                          (acc, item) =>
                            acc + (item.precio ?? 0) * (item.cantidad ?? 1),
                          0
                        )
                        .toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    win.document.write(notaHtml);
    win.document.close();
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Ocultar Nota de Entrega" : "Mostrar Nota de Entrega"}
      </Button>
      {open && (
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-3xl mx-auto print:max-w-full print:p-0 print:shadow-none print:rounded-none print:mt-0 print:mb-0 print:border-none">
          <div className="flex flex-row justify-between items-center mb-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img src="/logo.jpeg" alt="Logo" style={{ height: 60, width: 'auto', objectFit: 'contain', marginRight: '1rem' }} />
              <div>
                <h1 className="text-2xl font-bold text-blue-900 mb-1">
                  NOTA DE ENTREGA
                </h1>
                <div className="text-base font-semibold text-slate-800 mt-0.5">
                  J-507172554 TU MUNDO PUERTAS, C.A.
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-gray-700">Cliente</div>
              <div className="text-lg font-bold text-blue-700">
                {pedido.cliente_id}
              </div>
              {pedido.cliente_nombre && (
                <div className="text-base text-gray-700">
                  Nombre:{" "}
                  <span className="font-semibold">{pedido.cliente_nombre}</span>
                </div>
              )}
              {pedido.cliente_direccion && (
                <div className="text-base text-gray-700">
                  Dirección:{" "}
                  <span className="font-semibold">
                    {pedido.cliente_direccion}
                  </span>
                </div>
              )}
              {pedido.cliente_telefono && (
                <div className="text-base text-gray-700">
                  Teléfono:{" "}
                  <span className="font-semibold">
                    {pedido.cliente_telefono}
                  </span>
                </div>
              )}
              {pedido.cliente_email && (
                <div className="text-base text-gray-700">
                  Email:{" "}
                  <span className="font-semibold">{pedido.cliente_email}</span>
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-700">
                Fecha de Emision
              </div>
              <div className="text-base text-green-700">{now}</div>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold text-lg mb-2">
              Artículos del Pedido
            </div>
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Código</th>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Descripción</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-right">Precio</th>
                </tr>
              </thead>
              <tbody>
                {pedido.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{item.codigo}</td>
                    <td className="p-2">{item.nombre}</td>
                    <td className="p-2">{item.descripcion}</td>
                    <td className="p-2 text-center">{item.cantidad}</td>
                    <td className="p-2 text-right">${item.precio ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="p-2 text-right" colSpan={3}>
                    Totales:
                  </td>
                  <td className="p-2 text-center">
                    {pedido.items.reduce(
                      (acc, item) => acc + (item.cantidad ?? 0),
                      0
                    )}
                  </td>
                  <td className="p-2 text-right">
                    $
                    {pedido.items
                      .reduce(
                        (acc, item) =>
                          acc + (item.precio ?? 0) * (item.cantidad ?? 1),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-8 flex flex-row justify-between items-center print:hidden">
            <span className="text-xs text-gray-500">
              Generado el {new Date().toLocaleDateString()}
            </span>
            <button
              className="bg-black text-white px-6 py-2 rounded shadow hover:bg-gray-900 font-bold"
              onClick={handlePrint}
            >
              Imprimir Nota de Entrega
            </button>
          </div>
        </div>
      )}
      <div className="print:hidden">
        {/* El resto del contenido fuera de la nota no se imprime */}
      </div>
    </div>
  );
};

export default NotaEntrega;
