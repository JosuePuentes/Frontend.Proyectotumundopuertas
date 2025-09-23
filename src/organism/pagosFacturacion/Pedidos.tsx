import React, { useState, useEffect } from "react"; // Added useEffect
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { // Added these imports
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Componente para gestionar pagos y abonos
const PagoManager: React.FC<{
  pedido: Pedido; // Changed from pedidoId and pagoInicial
  onSuccess?: () => void;
}> = ({ pedido, onSuccess }) => {
  const { _id: pedidoId, pago: pagoInicial, historial_pagos, items } = pedido; // Destructure pedido
  const [monto, setMonto] = useState("");
  const [estado, setEstado] = useState(pagoInicial || "sin pago");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Actualizar solo el estado del pago (manual change)
  const actualizarEstado = async (nuevoEstado: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${getApiUrl()}/pedidos/${pedidoId}/pago`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pago: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      setEstado(nuevoEstado);
      setSuccess("Estado actualizado");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Registrar abono (actualiza estado y agrega al historial)
  const registrarAbono = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const apiUrl = getApiUrl();
      const abonoMonto = parseFloat(monto);

      // Calculate current total paid
      const currentTotalPaid = (historial_pagos || []).reduce((acc, p) => acc + (p.monto || 0), 0);
      const newTotalPaid = currentTotalPaid + abonoMonto;

      // Calculate total order amount
      const totalOrderAmount = (items || []).reduce((acc, item) => acc + (item.precio || 0) * (item.cantidad || 0), 0);

      let newEstado = "sin pago";
      if (newTotalPaid > 0 && newTotalPaid < totalOrderAmount) {
        newEstado = "abonado";
      } else if (newTotalPaid >= totalOrderAmount) {
        newEstado = "pagado";
      }

      const res = await fetch(`${apiUrl}/pedidos/${pedidoId}/pago`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pago: newEstado, monto: abonoMonto }), // Send newEstado
      });
      if (!res.ok) throw new Error("Error al registrar abono");
      setSuccess("Abono registrado");
      setMonto("");
      setEstado(newEstado); // Update local state
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        value={estado}
        onChange={e => actualizarEstado(e.target.value)}
        className="text-xs border rounded px-1 py-0.5"
        disabled={loading}
      >
        <option value="sin pago">Sin pago</option>
        <option value="abonado">Abonado</option>
        <option value="pagado">Pagado</option>
      </select>
      <div className="flex gap-1 mt-1">
        <Input
          type="number"
          placeholder="Abono"
          value={monto}
          onChange={e => setMonto(e.target.value)}
          className="text-xs w-24"
          disabled={loading}
        />
        <Button
          size="sm"
          className="text-xs px-2 py-1"
          onClick={registrarAbono}
          disabled={loading || !monto || isNaN(Number(monto)) || parseFloat(monto) <= 0} // Added abonoMonto check
        >
          Abonar
        </Button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {success && <span className="text-xs text-green-600">{success}</span>}
    </div>
  );
};

interface PedidoItem {
  id: string;
  precio: number;
  cantidad: number;
  codigo?: string; // Added for invoice
  nombre?: string; // Added for invoice
  descripcion?: string; // Added for invoice
}

interface RegistroPago {
  monto: number;
  fecha: string;
  metodo?: string;
  estado?: string; // Added for invoice
}

interface Pedido {
  _id: string;
  cliente_nombre?: string;
  estado_general?: string;
  fecha_creacion?: string;
  pago?: string; // "sin pago" | "abonado" | "pagado"
  items?: PedidoItem[];
  historial_pagos?: RegistroPago[];
  cliente_id?: string; // Added for invoice
  total_abonado?: number; // Added for invoice
}

interface CompanyDetails { // Added for invoice
  nombre: string;
  rif: string;
  direccion: string;
  telefono: string;
  email: string;
}

const ESTADOS = [
  "orden1",
  "orden2",
  "orden3",
  "orden4",
  "orden5",
  "orden6",
  "pendiente",
];

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fechas de filtro
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  // Filtro local por cliente
  const [clienteFiltro, setClienteFiltro] = useState<string>("");
  // Nuevo estado para el filtro de estado de pago
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos"); // Added for filtering

  // State for invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false); // Added for invoice modal
  const [selectedPedidoForInvoice, setSelectedPedidoForInvoice] = useState<Pedido | null>(null); // Added for invoice modal
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null); // Added for invoice modal

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construcción del query string
      let params = ESTADOS.map(
        (e) => `estado_general=${encodeURIComponent(e)}`
      ).join("&");
      if (fechaInicio) params += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) params += `&fecha_fin=${fechaFin}`;

      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/pedidos/estado/?${params}`
      );
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const data = await res.json();
      setPedidos(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Fetch company details for invoice
  const fetchCompanyDetails = async () => { // Added for invoice
    try {
      const res = await fetch(`${getApiUrl()}/pedidos/company-details`);
      if (!res.ok) throw new Error("Error al obtener detalles de la empresa");
      const data = await res.json();
      setCompanyDetails(data);
    } catch (err: any) {
      console.error("Error fetching company details:", err);
    }
  };

  useEffect(() => { // Modified useEffect
    fetchPedidos();
    fetchCompanyDetails(); // Added fetchCompanyDetails
  }, []);

  // Handle "Ver Preliminar" click
  const handleViewPreliminarClick = (pedido: Pedido) => { // Added for invoice modal
    setSelectedPedidoForInvoice(pedido);
    setShowInvoiceModal(true);
  };

  // Handle print
  const handlePrint = () => { // Added for invoice modal
    const printContent = document.getElementById("invoice-print-section");
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printContents = printContent.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore original page content and functionality
    } else {
      console.error("Could not find print section");
    }
  };

  // Calculate total pedido amount
  const calculateTotalPedido = (pedido: Pedido) => { // Added for invoice modal
    return (pedido.items || []).reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 0)), 0);
  };

  // Calcular suma de pagos realizados usando historial_pagos
  const sumaPagos = pedidos.reduce((acc, pedido) => {
    const sumaPedido = (pedido.historial_pagos || []).reduce(
      (a, pago) => a + (pago.monto || 0),
      0
    );
    return acc + sumaPedido;
  }, 0);

  return (
    <Card className="w-full shadow-md rounded-2xl max-w-5xl mx-auto px-1 sm:px-4">
      <CardHeader className="px-2 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">
          Pedidos en Proceso
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-500">
          Estados: orden1 a orden6 y pendiente
        </p>
        <div className="mt-2 text-xs sm:text-sm text-green-700 font-semibold">
          Suma de pagos realizados: {sumaPagos.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
        </div>
      </CardHeader>
      <CardContent className="px-1 sm:px-6">
        {/* Controles de filtro */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col w-full sm:w-auto max-w-[110px]">
            <label className="text-xs sm:text-sm text-gray-600 mb-1">Fecha inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="text-xs sm:text-base px-1 py-1 min-w-0"
              style={{ width: "100px" }}
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto max-w-[110px]">
            <label className="text-xs sm:text-sm text-gray-600 mb-1">Fecha fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="text-xs sm:text-base px-1 py-1 min-w-0"
              style={{ width: "100px" }}
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-xs sm:text-sm text-gray-600 mb-1">Buscar cliente</label>
            <Input
              type="text"
              placeholder="Nombre del cliente"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="text-xs sm:text-base"
            />
          </div>
          {/* Nuevo Select para filtrar por estado de pago */} {/* Added for filtering */}
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-xs sm:text-sm text-gray-600 mb-1">Estado de Pago</label>
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger className="w-full text-xs sm:text-base">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="abonado">Abonado</SelectItem>
                <SelectItem value="sin pago">Sin Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end w-full sm:w-auto">
            <Button onClick={fetchPedidos} className="w-full sm:w-auto text-xs sm:text-base">Filtrar</Button>
          </div>
        </div>

        {/* Estados del fetch */}
        {loading ? (
          <div className="flex justify-center items-center py-8 text-gray-600">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            Cargando pedidos...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center text-red-600 py-6">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error: {error}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No hay pedidos en estos estados.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px] text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 sm:w-1/4">ID</TableHead>
                  <TableHead className="w-32 sm:w-1/4">Cliente</TableHead>
                  <TableHead className="w-16 sm:w-20">Estado</TableHead>
                  <TableHead className="w-24 sm:w-1/4">Fecha</TableHead>
                  <TableHead className="w-24 sm:w-1/4">Pago</TableHead>
                  <TableHead className="w-24 sm:w-1/4">Total</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos
                  .filter((pedido) => { // Modified filter logic
                    const matchesCliente = clienteFiltro.trim() === ""
                      ? true
                      : (pedido.cliente_nombre || "").toLowerCase().includes(clienteFiltro.trim().toLowerCase());

                    const matchesEstadoPago = estadoFiltro === "todos"
                      ? true
                      : pedido.pago === estadoFiltro;

                    return matchesCliente && matchesEstadoPago;
                  })
                  .map((pedido) => {
                  // Calcular el total del pedido
                  const total = (pedido.items || []).reduce(
                    (acc, item) => acc + (item.precio || 0) * (item.cantidad || 0),
                    0
                  );
                  const montoAbonado = (pedido.historial_pagos || []).reduce((a, pago) => a + (pago.monto || 0), 0); // Added for invoice modal

                  return (
                    <TableRow key={pedido._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium break-all max-w-[120px]">
                        {pedido._id.slice(-4)}
                      </TableCell>
                      <TableCell className="break-words max-w-[120px]">{pedido.cliente_nombre || "-"}</TableCell>
                      <TableCell>
                        <span className="px-1 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700 min-w-[40px] inline-block text-center">
                          {pedido.estado_general}
                        </span>
                      </TableCell>
                      <TableCell>
                        {pedido.fecha_creacion
                          ? new Date(pedido.fecha_creacion).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <PagoManager
                            pedido={pedido} // Pass the entire pedido object
                            onSuccess={fetchPedidos}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {pedido.historial_pagos && pedido.historial_pagos.length > 0 && (
                            <span className="text-xs text-green-700 font-semibold">
                              Pagos: {montoAbonado.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                            </span>
                          )}
                        {total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Invoice Modal */} {/* Added for invoice modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <DialogContent className="sm:max-w-[600px] p-6 mx-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {selectedPedidoForInvoice?.pago === "pagado" ? "Nota de Entrega" : "Comprobante de Abono"}
              </DialogTitle>
              <DialogDescription className="text-center">
                Detalle de la transacción y el pedido.
              </DialogDescription>
            </DialogHeader>
            {selectedPedidoForInvoice && companyDetails && (
              <div id="invoice-print-section" className="mt-4 space-y-4 text-sm p-4 border rounded-md bg-white">
                {/* Company Details */}
                <div className="border-b pb-2 mb-4 text-center">
                  <p className="font-bold text-xl text-gray-800">{companyDetails.nombre}</p>
                  <p className="text-gray-600">RIF: {companyDetails.rif}</p>
                  <p className="text-gray-600">Dirección: {companyDetails.direccion}</p>
                  <p className="text-gray-600">Teléfono: {companyDetails.telefono}</p>
                  <p className="text-gray-600">Email: {companyDetails.email}</p>
                </div>

                {/* Client Details */}
                <div className="border-b pb-2 mb-4">
                  <p className="font-bold text-base text-gray-700">Cliente: {selectedPedidoForInvoice.cliente_nombre}</p>
                  {/* Add more client details if available in pedido object */}
                </div>

                {/* Items */}
                <div className="mb-4">
                  <p className="font-bold mb-2 text-base text-gray-700">Items del Pedido:</p>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Código</TableHead>
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Descripción</TableHead>
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cantidad</TableHead>
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Precio Unitario</TableHead>
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Item</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPedidoForInvoice.items?.map((item, idx) => (
                        <TableRow key={idx} className="border-b hover:bg-gray-50">
                          <TableCell className="py-2 px-4 whitespace-nowrap">{item.codigo}</TableCell>
                          <TableCell className="py-2 px-4">{item.nombre} - {item.descripcion}</TableCell>
                          <TableCell className="py-2 px-4 whitespace-nowrap text-center">{(item.cantidad || 0)}</TableCell>
                          <TableCell className="py-2 px-4 whitespace-nowrap text-right">{(item.precio || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</TableCell>
                          <TableCell className="py-2 px-4 whitespace-nowrap text-right">{((item.precio || 0) * (item.cantidad || 0)).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Abonos */}
                <div className="mb-4">
                  <p className="font-bold mb-2 text-base text-gray-700">Historial de Abonos:</p>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fecha</TableHead>
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Monto Abonado</TableHead>
                        <TableHead className="py-2 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPedidoForInvoice.historial_pagos?.map((pago, idx) => (
                        <TableRow key={idx} className="border-b hover:bg-gray-50">
                          <TableCell className="py-2 px-4 whitespace-nowrap">{new Date(pago.fecha).toLocaleDateString()}</TableCell>
                          <TableCell className="py-2 px-4 whitespace-nowrap text-right">{(pago.monto || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</TableCell>
                          <TableCell className="py-2 px-4 whitespace-nowrap">{pago.estado}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="text-right font-bold text-lg mt-6 p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-800">Total Pedido: <span className="text-blue-600">{(calculateTotalPedido(selectedPedidoForInvoice) || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span></p>
                  <p className="text-gray-800">Total Abonado: <span className="text-green-600">{(montoAbonado || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span></p>
                  <p className="text-gray-800">Monto Pendiente: <span className="text-red-600">{((calculateTotalPedido(selectedPedidoForInvoice) || 0) - (montoAbonado || 0)).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span></p>
                </div>
              </div>
            )}
            <DialogFooter className="mt-6 flex justify-between">
              <Button onClick={() => setShowInvoiceModal(false)} variant="outline">Cerrar</Button>
              <Button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white">Imprimir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Pedidos;