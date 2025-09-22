import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Cliente {
  nombre: string;
  rif: string;
  direccion: string;
  telefono: string;
}

const CrearCliente: React.FC = () => {
  const [cliente, setCliente] = useState<Cliente>({
    nombre: "",
    rif: "",
    direccion: "",
    telefono: "",
  });
  const [mensaje, setMensaje] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.nombre || !cliente.rif || !cliente.direccion || !cliente.telefono) {
      setMensaje("Completa todos los campos obligatorios.");
      return;
    }
    const apiUrl = "https://crafteo.onrender.com";
    const secureApiUrl = `https://${apiUrl.replace(/^(http|https):\/\//, '')}`;
    fetch(`${secureApiUrl}/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cliente),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al crear el cliente");
        }
        return response.json();
      })
      .then(() => {
        setMensaje("Cliente creado correctamente ✅");
        setCliente({ nombre: "", rif: "", direccion: "", telefono: "" });
      })
      .catch((error) => {
        setMensaje(error.message);
      });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Crear Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="nombre">Nombre O Razon Social</Label>
            <Input
              id="nombre"
              name="nombre"
              value={cliente.nombre}
              onChange={handleChange}
              placeholder="Nombre o Razon Social del cliente"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="rif">RIF</Label>
            <Input
              id="rif"
              name="rif"
              value={cliente.rif}
              onChange={handleChange}
              placeholder="RIF"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              name="direccion"
              value={cliente.direccion}
              onChange={handleChange}
              placeholder="Dirección"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              value={cliente.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4 font-bold py-2">
            Crear Cliente
          </Button>
        </form>
        {mensaje && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            {mensaje}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrearCliente;
