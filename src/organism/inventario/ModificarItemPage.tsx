import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ModificarItem from "./ModificarItem";
import { getApiUrl } from "@/lib/api";
import { useItems } from "@/hooks/useItems";

// Define los tipos de datos
interface InventarioItem {
  _id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  costo: number;
  costoProduccion: number;
  cantidad: number;
  activo: boolean;
}

// Componente para una fila de item
const ItemRow: React.FC<{
  item: InventarioItem;
  onEdit: (id: string) => void;
}> = ({ item, onEdit }) => (
  <li className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <div>
      <span className="font-bold text-blue-700 text-base">{item.nombre}</span>
      <span className="ml-2 text-xs text-gray-500">{item.descripcion}</span>
      <span className="ml-2 text-xs text-gray-400">({item.categoria})</span>
    </div>
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(item._id)}
      >
        Editar
      </Button>
    </div>
  </li>
);

const ModificarItemPage: React.FC = () => {
  const { data, loading, error, fetchItems } = useItems();
  const [filtro, setFiltro] = useState("");
  const [itemEdit, setItemEdit] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const apiUrl = getApiUrl();
    fetchItems(`${apiUrl}/inventario/all`);
  }, []);

  // Filtrado optimizado
  const itemsFiltrados = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return (data as InventarioItem[]).filter((item) =>
      item.descripcion?.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [data, filtro]);

  const handleEdit = (id: string) => {
    setItemEdit(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setItemEdit(null);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border border-gray-200 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Filtrar por descripción..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full max-w-sm"
          />
        </div>
        {loading ? (
          <div className="text-center py-8">Cargando items...</div>
        ) : error ? (
          <div className="text-red-600 font-semibold py-4">{error}</div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="text-gray-500 py-4">No hay items en el inventario.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {itemsFiltrados.map((item) => (
              <ItemRow key={item._id} item={item} onEdit={handleEdit} />
            ))}
          </ul>
        )}
        {/* Modal para editar */}
        {showModal && itemEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <Dialog open={showModal} onOpenChange={handleCloseModal}>
              <ModificarItem itemId={itemEdit} modalClose={handleCloseModal} />
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModificarItemPage;
