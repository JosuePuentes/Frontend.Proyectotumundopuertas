import React, { useState, useEffect } from "react";
import UpFile from "@/upfile/UpFile";
import ImageDisplay from "@/upfile/ImageDisplay";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getApiUrl } from "@/lib/api";
import { useItems } from "@/hooks/useItems";
import { Button } from "@/components/ui/button";

interface ItemForm {
  _id?: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  costo: string;
  costoProduccion: string;
  cantidad: string;
  activo: boolean;
  imagenes?: string[];
}

const fieldConfig: {
  id: keyof ItemForm;
  label: string;
  type?: string;
  required?: boolean;
}[] = [
  { id: "codigo", label: "Código" },
  { id: "nombre", label: "Nombre", required: true },
  { id: "descripcion", label: "Descripción" },
  { id: "categoria", label: "Categoría", required: true },
  { id: "precio", label: "Precio", type: "number", required: true },
  { id: "costo", label: "Costo", type: "number", required: true },
  {
    id: "costoProduccion",
    label: "Costo de producción",
    type: "number",
    required: true,
  },
  { id: "cantidad", label: "Cantidad", type: "number", required: true },
];

const ModificarItem: React.FC<{ itemId: string; modalClose: () => void }> = ({
  itemId,
  modalClose,
}) => {
  const [item, setItem] = useState<ItemForm | null>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const { fetchItems, loading, error } = useItems();

  // Fetch del item
  useEffect(() => {
    const fetchItem = async () => {
      const apiUrl = getApiUrl();
      try {
        const res = await fetch(`${apiUrl}/inventario/id/${itemId}/`);
        if (!res.ok) throw new Error("No se pudo cargar el item");

        const data = await res.json();
        setItem({
          _id: data._id,
          codigo: data.codigo ?? "",
          nombre: data.nombre ?? "",
          descripcion: data.descripcion ?? "",
          categoria: data.categoria ?? "",
          precio: String(data.precio ?? ""),
          costo: String(data.costo ?? ""),
          costoProduccion: String(data.costoProduccion ?? ""),
          cantidad: String(data.cantidad ?? ""),
          activo: data.activo ?? true,
          imagenes: Array.isArray(data.imagenes)
            ? data.imagenes
            : data.imagen
            ? [data.imagen]
            : [],
        });
      } catch (err: any) {
        setMensaje(err.message || "Error cargando item");
      }
    };
    fetchItem();
  }, [itemId]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!item) return;
    const { name, value, type } = e.target;
    setItem((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value,
          }
        : prev
    );
  };

  const handleUploadSuccess = (objectName: string, idx: number) => {
    setItem((prev) => {
      if (!prev) return prev;
      const nuevas = [...(prev.imagenes ?? [])];
      nuevas[idx] = objectName;
      return { ...prev, imagenes: nuevas };
    });
    setMensaje(`Imagen ${idx + 1} actualizada ✅`);
    setTimeout(() => setMensaje(""), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    // Validación mínima
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
    await fetchItems(`${apiUrl}/inventario/id/${item._id}/`, {
      method: "PUT",
      body: {
        ...item,
        precio: parseFloat(item.precio),
        costo: parseFloat(item.costo),
        costoProduccion: parseFloat(item.costoProduccion),
        cantidad: parseInt(item.cantidad, 10),
        imagenes: item.imagenes ?? [],
      },
    });

    if (!error) {
      setMensaje("Item modificado correctamente ✅");
      setTimeout(() => {
        setMensaje("");
        modalClose();
      }, 2000);
    } else {
      setMensaje(error);
    }
  };

  if (!item) {
    return <div className="text-center py-8">Cargando item...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto max-h-[80vh] overflow-auto shadow-lg border border-gray-200 bg-white mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Modificar Item</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-6">
          {/* Campos */}
          {fieldConfig.map(({ id, label, type, required }) => (
            <div key={id}>
              <Label className="pb-2" htmlFor={id}>
                {label}
              </Label>
              <Input
                id={id}
                name={id}
                type={type || "text"}
                value={item[id] as string}
                onChange={handleChange}
                placeholder={label}
                required={required}
                min={type === "number" ? "0" : undefined}
                step={type === "number" ? "0.01" : undefined}
              />
            </div>
          ))}

          {/* Activo */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="activo"
              checked={item.activo}
              onCheckedChange={(checked) =>
                setItem((prev) =>
                  prev ? { ...prev, activo: !!checked } : prev
                )
              }
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
        </CardContent>
        <CardFooter className="sticky bottom-0 flex justify-end items-center">
          <Button
            type="submit"
            disabled={loading}
            variant={"outline"}
            className="bg-green-400 hover:bg-green-600"
          >
            Guardar cambios
          </Button>

          <Button
            variant="outline"
            onClick={modalClose}
            className="bg-red-500 hover:bg-red-600 ml-2"
          >
            Cancelar
          </Button>
        </CardFooter>
      </form>
      {/* Mensajes */}
      {mensaje && (
        <div className="mt-2 text-green-600 font-semibold">{mensaje}</div>
      )}
      {error && <div className="mt-2 text-red-600 font-semibold">{error}</div>}
    </Card>
  );
};

export default ModificarItem;
