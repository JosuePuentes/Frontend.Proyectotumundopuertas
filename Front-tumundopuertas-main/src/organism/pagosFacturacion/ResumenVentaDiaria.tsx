import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, DollarSign, Calendar } from "lucide-react";

interface VentaFirme {
  _id: string;
  cliente_id: string;
  cliente_nombre: string;
  fecha: string;
  monto: number;
  metodo_pago?: string;
}

interface Abono {
  _id: string;
  pedido_id: string;
  cliente_nombre: string;
  fecha: string;
  monto: number;
  tipo: 'inicial' | 'proceso'; // inicial = abono al crear pedido, proceso = abono en pedido en proceso
  metodo_pago?: string;
}

interface ResumenData {
  ventas_firmes: VentaFirme[];
  abonos: Abono[];
  total_ventas_firmes: number;
  total_abonos: number;
  total_general: number;
}

const ResumenVentaDiaria: React.FC = () => {
  const [data, setData] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL.replace('http://', 'https://');

  const fetchResumenVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fecha_inicio", fechaInicio);
      if (fechaFin) params.append("fecha_fin", fechaFin);

      const res = await fetch(`${apiUrl}/pedidos/resumen-venta-diaria?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener resumen de ventas");

      const resumenData = await res.json();
      setData(resumenData);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default date to today if no dates are set
    if (!fechaInicio && !fechaFin) {
      const today = new Date().toISOString().split('T')[0];
      setFechaInicio(today);
      setFechaFin(today);
    }
  }, []);

  useEffect(() => {
    if (fechaInicio || fechaFin) {
      fetchResumenVentas();
    }
  }, [fechaInicio, fechaFin]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-VE');
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Resumen de Venta Diaria
          </CardTitle>
          <p className="text-sm text-gray-500">
            Reporte de ventas firmes y abonos por fecha
          </p>
        </CardHeader>
        <CardContent>
          {/* Filtros de fecha */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Fecha inicio</label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Fecha fin</label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-40"
              />
            </div>
            <Button 
              onClick={fetchResumenVentas}
              disabled={loading}
              className="mt-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Consultar
            </Button>
          </div>

          {/* Resumen de totales */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Ventas Firmes</p>
                      <p className="text-lg font-bold text-green-900">
                        {formatCurrency(data.total_ventas_firmes)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Abonos</p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(data.total_abonos)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Total General</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(data.total_general)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contenido principal */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Cargando resumen de ventas...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center text-red-600 py-6">
              <AlertCircle className="w-5 h-5 mr-2" />
              Error: {error}
            </div>
          ) : !data ? (
            <div className="text-center text-gray-500 py-6">
              Selecciona un rango de fechas para consultar el resumen.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sección Ventas Firmes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-800">
                    Ventas Firmes ({data.ventas_firmes.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Pagos completos registrados en el módulo 'Mis pagos'
                  </p>
                </CardHeader>
                <CardContent>
                  {data.ventas_firmes.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No hay ventas firmes en el período seleccionado.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID Cliente</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Método</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.ventas_firmes.map((venta) => (
                            <TableRow key={venta._id}>
                              <TableCell className="font-medium">
                                {venta.cliente_id}
                              </TableCell>
                              <TableCell>{venta.cliente_nombre}</TableCell>
                              <TableCell>{formatDate(venta.fecha)}</TableCell>
                              <TableCell className="font-semibold text-green-700">
                                {formatCurrency(venta.monto)}
                              </TableCell>
                              <TableCell>{venta.metodo_pago || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sección Abonos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-800">
                    Abonos ({data.abonos.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Abonos iniciales al crear pedido y abonos en pedidos en proceso
                  </p>
                </CardHeader>
                <CardContent>
                  {data.abonos.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No hay abonos en el período seleccionado.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pedido ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Método</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.abonos.map((abono) => (
                            <TableRow key={abono._id}>
                              <TableCell className="font-medium">
                                {abono.pedido_id.slice(-6)}
                              </TableCell>
                              <TableCell>{abono.cliente_nombre}</TableCell>
                              <TableCell>{formatDate(abono.fecha)}</TableCell>
                              <TableCell className="font-semibold text-blue-700">
                                {formatCurrency(abono.monto)}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  abono.tipo === 'inicial' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {abono.tipo === 'inicial' ? 'Inicial' : 'En proceso'}
                                </span>
                              </TableCell>
                              <TableCell>{abono.metodo_pago || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumenVentaDiaria;