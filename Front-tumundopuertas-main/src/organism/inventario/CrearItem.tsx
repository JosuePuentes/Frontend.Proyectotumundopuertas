import React, { useState } from "react";
import UpFile from "@/upfile/UpFile";
import ImageDisplay from "@/upfile/ImageDisplay";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useItems } from "@/hooks/useItems";

interface ItemForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  costo: string;
  costoProduccion: string; // Nuevo campo
  cantidad: string;
  activo: boolean;
  imagenes?: string[];
}

const CrearItem: React.FC = () => {
  const [item, setItem] = useState<ItemForm>({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    costo: "",
    costoProduccion: "", // Nuevo campo
    cantidad: "",
    activo: true,
    imagenes: [],
  });
  const [mensaje, setMensaje] = useState<string>("");
  const { fetchItems, loading, error } = useItems();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setItem((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadSuccess = (objectName: string, idx: number) => {
    setItem((prev) => {
      const nuevas = [...(prev.imagenes ?? [])];
      nuevas[idx] = objectName;
      return { ...prev, imagenes: nuevas };
    });
    setMensaje(`Imagen ${idx + 1} actualizada ✅`);
    setTimeout(() => setMensaje(""), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !item.nombre ||
      !item.precio ||
      !item.costo ||
      !item.costoProduccion ||
      !item.cantidad ||
      !item.categoria
    ) {
      setMensaje("Completa los campos obligatorios.");
      return;
    }
    const apiUrl = getApiUrl();
    await fetchItems(`${apiUrl}/inventario`, {
      method: "POST",
      body: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        precio: parseFloat(item.precio),
        costo: parseFloat(item.costo),
        costoProduccion: parseFloat(item.costoProduccion),
        cantidad: parseInt(item.cantidad, 10),
        activo: item.activo,
        imagenes: item.imagenes ?? [],
      },
    });
    if (!error) {
      setMensaje("Item creado correctamente ✅");
      setItem({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        costo: "",
        costoProduccion: "",
        cantidad: "",
        activo: true,
        imagenes: [],
      });
    } else {
      setMensaje(error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Crear Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              name="codigo"
              value={item.codigo}
              onChange={handleChange}
              placeholder="Código del item"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={item.nombre}
              onChange={handleChange}
              placeholder="Nombre del item"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              name="descripcion"
              value={item.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              name="categoria"
              value={item.categoria}
              onChange={handleChange}
              placeholder="Categoría"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={item.precio}
              onChange={handleChange}
              placeholder="Precio"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="costo">Costo</Label>
            <Input
              id="costo"
              name="costo"
              type="number"
              min="0"
              step="0.01"
              value={item.costo}
              onChange={handleChange}
              placeholder="Costo"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="costoProduccion">Costo Producción</Label>
            <Input
              id="costoProduccion"
              name="costoProduccion"
              type="number"
              min="0"
              step="0.01"
              value={item.costoProduccion}
              onChange={handleChange}
              placeholder="Costo de producción empleado"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              name="cantidad"
              type="number"
              min="0"
              value={item.cantidad}
              onChange={handleChange}
              placeholder="Cantidad"
              className="mt-1"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              checked={item.activo}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <Label htmlFor="activo">Activo</Label>
          </div>
          {/* Imágenes */}
          <div>
            <Label>Imágenes del item (máx. 3)</Label>
            <div className="flex gap-4 flex-wrap mt-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  {item.imagenes?.[idx] ? (
                    <ImageDisplay
                      imageName={item.imagenes[idx]}
                      alt={`Imagen ${idx + 1}`}
                      style={{
                        maxWidth: 90,
                        maxHeight: 90,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                      }}
                    />
                  ) : (
                    <div className="w-[90px] h-[90px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      Sin imagen
                    </div>
                  )}
                  <UpFile
                    label={item.imagenes?.[idx] ? "Actualizar" : "Subir"}
                    allowedFileTypes={["image/*"]}
                    maxSizeMB={5}
                    initialFileUrl={item.imagenes?.[idx]}
                    objectPath="items/"
                    onUploadSuccess={(objectName) =>
                      handleUploadSuccess(objectName, idx)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-4 font-bold py-2"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Item"}
          </Button>
        </form>
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

export default CrearItem;
