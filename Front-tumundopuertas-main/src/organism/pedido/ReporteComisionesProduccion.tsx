import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Asignacion {
  pedido_id: string;
  item_id: string;
  descripcionitem: string;
  costoproduccion: string;
  precio_item?: number;
  orden?: number;
  nombre_subestado?: string;
  estado_subestado?: string;
  fecha_inicio_subestado?: string;
  fecha_fin_subestado?: string;
  key?: string;
  empleadoId?: string;
  nombreempleado?: string;
  fecha_inicio?: string;
  estado?: string;
  fecha_fin?: string;
}

interface EmpleadoComision {
  empleado_id: string;
  nombre_empleado: string;
  asignaciones: Asignacion[];
}

const ReporteComisionesProduccion: React.FC = () => {
  const [data, setData] = useState<EmpleadoComision[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [buscando, setBuscando] = useState<boolean>(false);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [filtroAyudante, setFiltroAyudante] = useState<
    "sin-ayudante" | "solo-ayudante" | "todos"
  >("sin-ayudante");
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");

  useEffect(() => {
    const fetchEmpleados = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${getApiUrl()}/empleados/all/`);
        const empleadosData = await res.json();
        empleadosData.forEach((empleado: any) => {
          if (
            typeof empleado.identificador === "string" &&
            (empleado.identificador.startsWith("v") ||
              empleado.identificador.startsWith("V"))
          ) {
            empleado.identificador = empleado.identificador.slice(1);
          }
        });
        setEmpleados(empleadosData);
      } catch (err) {}
      setLoading(false);
    };
    fetchEmpleados();
  }, []);

  const permisosUnicos: string[] = Array.from(
    new Set(empleados.flatMap((empleado) => empleado.permisos || []))
  );
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);

  const togglePermiso = (permiso: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permiso)
        ? prev.filter((p) => p !== permiso)
        : [...prev, permiso]
    );
  };

  const formatFecha = (fecha: string | undefined) =>
    fecha
      ? new Date(fecha).toLocaleString("es-VE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "-";


  if (loading) return <div className="text-center py-10">Cargando reporte...</div>;

  const handleBuscar = async () => {
    setBuscando(true);
    setLoading(true);
    const params = new URLSearchParams();
    if (fechaInicio) params.append("fecha_inicio", fechaInicio);
    if (fechaFin) params.append("fecha_fin", fechaFin);
    const res = await fetch(
      `${getApiUrl()}/pedidos/comisiones/produccion/terminadas/?${params.toString()}`
    );
    const json = await res.json();
    const jsonFormateado = json.map((empleado: EmpleadoComision) => ({
      ...empleado,
      empleado_id:
        typeof empleado.empleado_id === "string" &&
        (empleado.empleado_id.startsWith("v") ||
          empleado.empleado_id.startsWith("V"))
          ? empleado.empleado_id.slice(1)
          : empleado.empleado_id,
    }));
    setData(jsonFormateado);
    setLoading(false);
    setBuscando(false);
  };
// --- calcular el total general ---
const totalGeneralCostos = empleados
  .filter((empleado) => {
    // ... tu mismo filtro de empleados ...
    const empleadoComision = data.find(
      (e) => e.empleado_id === empleado.identificador
    );
    return (
      empleadoComision &&
      empleadoComision.asignaciones &&
      empleadoComision.asignaciones.length > 0
    );
  })
  .reduce((acc, empleado) => {
    const empleadoComision = data.find(
      (e) => e.empleado_id === empleado.identificador
    );
    const asignacionesFiltradas =
      empleadoComision?.asignaciones?.filter((asig) => {
        if (!fechaInicio && !fechaFin) return true;
        const fecha = asig.fecha_inicio_subestado || asig.fecha_inicio || "";
        if (!fecha) return false;
        const fechaObj = new Date(fecha);
        if (fechaInicio && fechaObj < new Date(fechaInicio)) return false;
        if (fechaFin && fechaObj > new Date(fechaFin + "T23:59:59")) return false;
        return true;
      }) || [];

    const subtotal = asignacionesFiltradas.reduce((acc2, asig) => {
      const val = parseFloat(asig.costoproduccion) || 0;
      return acc2 + val;
    }, 0);
  return acc + subtotal;
  }, 0);

// --- total general de precios (considerando cantidad y filtros) ---
const empleadosFiltrados = empleados.filter((empleado) => {
  if (
    permisosSeleccionados.length > 0 &&
    !(empleado.permisos || []).some((p:any) => permisosSeleccionados.includes(p))
  ) {
    return false;
  }
  const empleadoComision = data.find(
    (e) => e.empleado_id === empleado.identificador
  );
  if (filtroAyudante === "sin-ayudante") {
    return (
      !empleado.permisos?.includes("ayudante") &&
      empleadoComision &&
      empleadoComision.asignaciones?.length > 0
    );
  }
  if (filtroAyudante === "solo-ayudante") {
    return (
      empleado.permisos?.includes("ayudante") &&
      empleadoComision &&
      empleadoComision.asignaciones?.length > 0
    );
  }
  return empleadoComision && empleadoComision.asignaciones?.length > 0;
});

const totalGeneral = empleadosFiltrados.reduce((acc, empleado) => {
  const empleadoComision = data.find(
    (e) => e.empleado_id === empleado.identificador
  );
  if (empleado.permisos?.includes("ayudante")) return acc;
  const asignacionesFiltradas = empleadoComision?.asignaciones?.filter((asig) => {
    if (!fechaInicio && !fechaFin) return true;
    const fecha = asig.fecha_inicio_subestado || asig.fecha_inicio || "";
    if (!fecha) return false;
    const fechaObj = new Date(fecha);
    if (fechaInicio && fechaObj < new Date(fechaInicio)) return false;
    if (fechaFin && fechaObj > new Date(fechaFin + "T23:59:59")) return false;
    return true;
  }) || [];
  const totalEmpleado = asignacionesFiltradas.reduce((acc2, asig) => {
    const val = parseFloat(asig.costoproduccion) || 0;
    return acc2 + val;
  }, 0);
  return acc + totalEmpleado;
}, 0);

const totalGeneralPrecios = empleadosFiltrados.reduce((acc, empleado) => {
  const empleadoComision = data.find(
    (e) => e.empleado_id === empleado.identificador
  );
  if (!empleadoComision) return acc;
  const asignacionesFiltradas = empleadoComision.asignaciones?.filter((asig) => {
    if (!fechaInicio && !fechaFin) return true;
    const fecha = asig.fecha_inicio_subestado || asig.fecha_inicio || "";
    if (!fecha) return false;
    const fechaObj = new Date(fecha);
    if (fechaInicio && fechaObj < new Date(fechaInicio)) return false;
    if (fechaFin && fechaObj > new Date(fechaFin + "T23:59:59")) return false;
    return true;
  }) || [];
  const subtotal = asignacionesFiltradas.reduce((acc2, asig) => {
    const precio = asig.precio_item || 0;
    const cantidad = (asig as any).cantidad ? Number((asig as any).cantidad) : 1;
    return acc2 + precio * cantidad;
  }, 0);
  return acc + subtotal;
}, 0);
  totalGeneralCostos
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
          Reporte de Comisiones de Producción
        </h2>
        <span className="px-4 py-2 rounded-xl bg-green-100 text-green-800 text-lg font-bold shadow-sm">
          Total General: ${totalGeneral.toFixed(2)}
        </span>
        <span className="block text-xl font-bold text-blue-700">
    Venta: ${totalGeneralPrecios.toFixed(2)}
  </span>
      </div>

      {/* FILTROS */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Desde</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hasta</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-semibold mb-1">
                Filtrar empleados
              </label>
              <Button
                variant="outline"
                onClick={() => {
                  if (filtroAyudante === "sin-ayudante")
                    setFiltroAyudante("solo-ayudante");
                  else if (filtroAyudante === "solo-ayudante")
                    setFiltroAyudante("todos");
                  else setFiltroAyudante("sin-ayudante");
                }}
              >
                {filtroAyudante === "sin-ayudante" && "Sin ayudantes"}
                {filtroAyudante === "solo-ayudante" && "Solo ayudantes"}
                {filtroAyudante === "todos" && "Mostrar todos"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleBuscar} disabled={loading || buscando}>
              {buscando ? "Buscando..." : "Buscar"}
            </Button>
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Buscar por nombre..."
              value={busquedaEmpleado}
              onChange={(e) => setBusquedaEmpleado(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={permisosSeleccionados.length === 0 ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm border"
              onClick={() => setPermisosSeleccionados([])}
            >
              Todos
            </Badge>
            {permisosUnicos.map((permiso) => (
              <Badge
                key={permiso}
                variant={
                  permisosSeleccionados.includes(permiso) ? "default" : "outline"
                }
                className="cursor-pointer px-3 py-1 text-sm capitalize"
                onClick={() => togglePermiso(permiso)}
              >
                {permiso}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE EMPLEADOS */}
      {empleados.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          No hay empleados para mostrar.
        </div>
      ) : (
        <ul className="space-y-6">
          {empleados
            .filter((empleado) => {
              if (
                permisosSeleccionados.length > 0 &&
                !(empleado.permisos || []).some((p: string) =>
                  permisosSeleccionados.includes(p)
                )
              ) {
                return false;
              }
              const empleadoComision = data.find(
                (e) => e.empleado_id === empleado.identificador
              );
              const nombre = (empleado.nombreCompleto || "").toLowerCase();
              if (
                busquedaEmpleado &&
                !nombre.includes(busquedaEmpleado.toLowerCase())
              )
                return false;
              if (filtroAyudante === "sin-ayudante") {
                return (
                  !empleado.permisos?.includes("ayudante") &&
                  (empleadoComision?.asignaciones?.length ?? 0) > 0
                );
              }
              if (filtroAyudante === "solo-ayudante") {
                return (
                  empleado.permisos?.includes("ayudante") &&
                  (empleadoComision?.asignaciones?.length ?? 0) > 0
                );
              }
              return empleadoComision?.asignaciones && empleadoComision.asignaciones.length > 0;
            })
            .map((empleado) => {
              const empleadoComision = data.find(
                (e) => e.empleado_id === empleado.identificador
              );
              const asignacionesFiltradas =
                empleadoComision?.asignaciones?.filter((asig) => {
                  if (!fechaInicio && !fechaFin) return true;
                  const fecha =
                    asig.fecha_inicio_subestado || asig.fecha_inicio || "";
                  if (!fecha) return false;
                  const fechaObj = new Date(fecha);
                  if (fechaInicio && fechaObj < new Date(fechaInicio))
                    return false;
                  if (fechaFin && fechaObj > new Date(fechaFin + "T23:59:59"))
                    return false;
                  return true;
                }) || [];
              const total = empleado.permisos?.includes("ayudante")
                ? 0
                : asignacionesFiltradas.reduce((acc, asig) => {
                  const val = parseFloat(asig.costoproduccion) || 0;
                  return acc + val;
                }, 0);
                total
              // Calcular total de venta para facturación (precio_item * cantidad)
              const totalVenta = empleado.permisos?.includes("facturacion")
                ? asignacionesFiltradas.reduce((acc, asig) => {
                  const precio = asig.precio_item || 0;
                  const cantidad = (asig as any).cantidad ? Number((asig as any).cantidad) : 1;
                  return acc + precio * cantidad;
                }, 0)
                : 0;
                totalVenta
              return (
                <li key={empleado._id}>
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {empleado.nombreCompleto || empleado._id}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {empleado.permisos?.map((permiso: string) => (
                              <Badge
                                key={permiso}
                                variant="outline"
                                className="bg-blue-100 text-blue-800 border-blue-300 text-xs"
                              >
                                {permiso}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardTitle>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-2 w-full">
                            {asignacionesFiltradas.map((asig, idx) => {
                              const cantidad = (asig as any).cantidad ? Number((asig as any).cantidad) : 1;
                              const totalLinea = (asig.precio_item || 0) * cantidad;
                              return (
                                <div
                                  key={idx}
                                  className="py-4 flex flex-col gap-2 bg-slate-50 rounded-lg p-4 shadow-sm"
                                >
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <span className="text-lg font-semibold text-blue-700">
                                      Pedido: {asig.pedido_id}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Item ID: {asig.item_id}
                                    </span>
                                  </div>
                                  <p className="text-gray-700">
                                    <span className="font-semibold">Descripción: </span>
                                    {asig.descripcionitem}
                                  </p>
                                  <div className="flex flex-wrap gap-6 mt-2">
                                    <span className="text-gray-700 font-medium">
                                      Precio:{" "}
                                      <span className="text-slate-900 font-bold">
                                        ${asig.precio_item?.toFixed(2) || "0.00"}
                                      </span>
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      Cantidad: <span className="text-slate-900 font-bold">{cantidad}</span>
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      Total línea: <span className="text-slate-900 font-bold">${totalLinea.toFixed(2)}</span>
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      Costo Producción:{" "}
                                      <span className="text-green-700 font-bold">
                                        ${asig.costoproduccion}
                                      </span>
                                    </span>
                                  </div>
                                  {asig.estado && (
                                    <span className="text-sm text-gray-600">
                                      Estado General:{" "}
                                      <span className="font-medium">{asig.estado}</span>
                                    </span>
                                  )}
                                  {asig.estado_subestado && (
                                    <span className="text-sm text-gray-600">
                                      Estado de la Asignación:{" "}
                                      <span className="font-medium">
                                        {asig.estado_subestado}
                                      </span>
                                    </span>
                                  )}
                                  {asig.fecha_inicio && (
                                    <span className="text-sm text-gray-600">
                                      Inicio: {formatFecha(asig.fecha_inicio)}
                                    </span>
                                  )}
                                  {asig.fecha_fin && (
                                    <span className="text-sm text-gray-600">
                                      Fin: {formatFecha(asig.fecha_fin)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </CardContent>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default ReporteComisionesProduccion;