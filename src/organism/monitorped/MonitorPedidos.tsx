import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Pedido {
  _id: string;
  cliente_nombre: string;
  estado_general: string;
  fecha_creacion?: string;
  creado_por?: string; // Creador del pedido
  items?: Array<{
    nombre: string;
    descripcion: string;
    cantidad: number;
    costoProduccion?: string;
  }>;
}

const MonitorPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [clienteFilter, setClienteFilter] = useState("");
  const [usuarioFilter, setUsuarioFilter] = useState("");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [shouldSearch, setShouldSearch] = useState(true); // Buscar al cargar
  const [verSoloPendientes, setVerSoloPendientes] = useState(false);
  const apiUrl = getApiUrl();

  const ordenMap: Record<string, string> = {
    pendiente: "Pendiente",
    orden1: "Herreria",
    orden2: "Masillar/Pintar",
    orden3: "Manillar",
    orden4: "Facturación",
    orden5: "Envío",
    orden6: "Completados",
    cancelado: "Cancelado",
  };

  const [ordenFilter, setOrdenFilter] = useState<string>("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<Record<string, string>>({});
  const [actualizando, setActualizando] = useState<string>("");

  useEffect(() => {
    if (!shouldSearch) return;
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        let url = `${apiUrl}/pedidos/filtrar/por-fecha/?`;
        if (fechaInicio && fechaFin) {
          url += `fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Ordenar por fecha de creación descendente
          const sortedData = data.sort(
            (a, b) =>
              new Date(b.fecha_creacion || 0).getTime() -
              new Date(a.fecha_creacion || 0).getTime()
          );
          setPedidos(sortedData);
        } else {
          setPedidos([]);
        }
      } catch (err) {
        console.error("Error fetching pedidos:", err);
        setPedidos([]);
      }
      setLoading(false);
      setShouldSearch(false);
    };
    fetchPedidos();
  }, [shouldSearch, apiUrl, fechaInicio, fechaFin]);

  const handleActualizarEstado = async (pedidoId: string) => {
    if (!estadoSeleccionado[pedidoId]) return;
    setActualizando(pedidoId);
    try {
      const res = await fetch(`${apiUrl}/pedidos/actualizar-estado-general/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedido_id: pedidoId, nuevo_estado_general: estadoSeleccionado[pedidoId] }),
      });
      if (!res.ok) throw new Error("Error actualizando estado");
      setPedidos((prev) => prev.map((p) => p._id === pedidoId ? { ...p, estado_general: estadoSeleccionado[pedidoId] } : p));
    } catch (err) {
      console.error("Error updating estado:", err);
    }
    setActualizando("");
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchesCliente = (p.cliente_nombre || "").toLowerCase().includes(clienteFilter.toLowerCase());
    const matchesUsuario = (p.creado_por || "").toLowerCase().includes(usuarioFilter.toLowerCase());
    const matchesOrden = ordenFilter === "" || p.estado_general === ordenFilter;

    if (verSoloPendientes) {
      const isPending = p.estado_general !== 'orden6' && p.estado_general !== 'cancelado';
      return isPending && matchesCliente && matchesUsuario && matchesOrden;
    }

    return matchesOrden && matchesCliente && matchesUsuario;
  });

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Monitor de Pedidos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
        <Input
          placeholder="Buscar por Cliente..."
          value={clienteFilter}
          onChange={(e) => setClienteFilter(e.target.value)}
        />
        <Input
          placeholder="Buscar por Usuario..."
          value={usuarioFilter}
          onChange={(e) => setUsuarioFilter(e.target.value)}
        />
        <Select value={ordenFilter} onValueChange={setOrdenFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            {Object.entries(ordenMap).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 md:col-span-3">
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full"
            />
            <span className="mx-2">-</span>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full"
            />
            <Button onClick={() => setShouldSearch(true)} className="w-full md:w-auto">
              Buscar por Fecha
            </Button>
            <Button onClick={() => setVerSoloPendientes(!verSoloPendientes)} className="w-full md:w-auto">
              {verSoloPendientes ? "Mostrar Todos" : "Ver Pendientes"}
            </Button>
        </div>
      </div>

      {loading ? (
        <div>Cargando pedidos...</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-gray-500">No hay pedidos para mostrar con los filtros actuales.</div>
      ) : (
        <ul className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <li key={pedido._id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Pedido: {pedido._id.slice(-6)}</span>
                    <Badge variant="secondary">
                      {ordenMap[pedido.estado_general] || pedido.estado_general}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <strong>Cliente:</strong> {pedido.cliente_nombre}
                  </div>
                  {pedido.creado_por && (
                    <div className="text-sm text-gray-600">
                      <strong>Creado por:</strong> {pedido.creado_por}
                    </div>
                  )}
                  {pedido.fecha_creacion && (
                    <div className="text-sm text-gray-500">
                      Fecha: {new Date(pedido.fecha_creacion).toLocaleDateString()}
                    </div>
                  )}
                  {Array.isArray(pedido.items) && pedido.items.length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">Items:</div>
                      <ul className="list-disc ml-6">
                        {pedido.items.map((item, idx) => (
                          <li key={idx} className="mb-1">
                            <span className="font-bold">{item.nombre}</span> - {item.descripcion} <span className="text-gray-600">x{item.cantidad}</span>
                            {item.costoProduccion && (
                              <span className="ml-2 text-green-700 font-semibold">${item.costoProduccion}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <div className="px-6 pb-4 flex flex-col gap-2">
                  <Select
                    value={estadoSeleccionado[pedido._id] || ""}
                    onValueChange={(val) => setEstadoSeleccionado((prev) => ({ ...prev, [pedido._id]: val }))}
                  >
                    <SelectTrigger className="w-full max-w-xs" aria-label="Seleccionar estado">
                      <SelectValue placeholder="Selecciona nuevo estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ordenMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="w-full max-w-xs bg-black text-white border-black hover:bg-gray-900 hover:text-white"
                    disabled={!estadoSeleccionado[pedido._id] || actualizando === pedido._id}
                    onClick={() => handleActualizarEstado(pedido._id)}
                  >
                    {actualizando === pedido._id ? "Actualizando..." : "Cambiar Estado"}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MonitorPedidos;