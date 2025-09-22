import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { getApiUrl } from "@/lib/api";

interface Cliente {
  _id: string;
  nombre: string;
  rif: string;
  direccion: string;
  telefono: string;
}

const ModificarCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    rif: "",
    direccion: "",
    telefono: "",
  });
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${getApiUrl()}/clientes/all/`)
      .then((response) => {
        if (!response.ok) throw new Error("Error al obtener clientes");
        return response.json();
      })
      .then((data: Cliente[]) => {
        setClientes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`No se pudieron cargar los clientes: ${err.message}`);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (clienteSeleccionado) {
      setForm({
        nombre: clienteSeleccionado.nombre || "",
        rif: clienteSeleccionado.rif || "",
        direccion: clienteSeleccionado.direccion || "",
        telefono: clienteSeleccionado.telefono || "",
      });
    }
  }, [clienteSeleccionado]);

  const handleSelectCliente = (id: string) => {
    const cliente = clientes.find((c) => c._id === id) || null;
    setClienteSeleccionado(cliente);
    setMensaje("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!form.rif.trim()) return "El RIF es obligatorio.";
    if (!form.direccion.trim()) return "La dirección es obligatoria.";
    if (!form.telefono.trim()) return "El teléfono es obligatorio.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/clientes/id/${clienteSeleccionado?._id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al modificar cliente");
      setMensaje("Cliente modificado correctamente ✅");
      setTimeout(() => {
        setMensaje("");
        navigate("/modificarcliente");
      }, 3000);
    } catch (err: any) {
      setError("No se pudo modificar el cliente");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Modificar Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="selectCliente">Selecciona un cliente</Label>
          {loading ? (
            <div className="mt-2 text-gray-500">Cargando clientes...</div>
          ) : error ? (
            <div className="mt-2 text-red-500">{error}</div>
          ) : (
            <select
              id="selectCliente"
              className="mt-1 w-full border rounded px-2 py-2"
              value={clienteSeleccionado?._id || ""}
              onChange={(e) => handleSelectCliente(e.target.value)}
            >
              <option value="">-- Selecciona --</option>
              {clientes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre} ({c.rif})
                </option>
              ))}
            </select>
          )}
        </div>
        {clienteSeleccionado && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nombre">Nombre O Razon Social</Label>
              <Input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="rif">RIF</Label>
              <Input
                id="rif"
                name="rif"
                value={form.rif}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4 font-bold py-2">
              Guardar Cambios
            </Button>
          </form>
        )}
        {mensaje && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            {mensaje}
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-600 font-semibold">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModificarCliente;
