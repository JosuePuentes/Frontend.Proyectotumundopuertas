// src/db/data.ts

// Tipos de datos
export type Item = {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: 'puerta' | 'ventana';
    material: string;
    precio: number;
};

export type Cliente = {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
};

export type Pedido = {
    id: number;
    clienteId: number;
    fecha: string;
    items: Array<{
        itemId: number;
        cantidad: number;
    }>;
    estado_general: 'orden1' | 'orden2' | 'orden3' | 'orden4' | 'orden5' | 'orden6' | 'orden7';
};

// Datos de ejemplo

export const items: Item[] = [
    {
        id: 1,
        nombre: 'Puerta de madera clásica',
        descripcion: 'Puerta de madera maciza con acabado natural.',
        tipo: 'puerta',
        material: 'madera',
        precio: 2500,
    },
    {
        id: 2,
        nombre: 'Ventana corrediza de aluminio',
        descripcion: 'Ventana de aluminio con vidrio templado.',
        tipo: 'ventana',
        material: 'aluminio',
        precio: 1800,
    },
    {
        id: 3,
        nombre: 'Puerta metálica reforzada',
        descripcion: 'Puerta de metal para máxima seguridad.',
        tipo: 'puerta',
        material: 'metal',
        precio: 3200,
    },
];

export const clientes: Cliente[] = [
    {
        id: 1,
        nombre: 'Juan Pérez',
        direccion: 'Calle Falsa 123, Ciudad',
        telefono: '555-1234',
        email: 'juan.perez@email.com',
    },
    {
        id: 2,
        nombre: 'María López',
        direccion: 'Av. Principal 456, Ciudad',
        telefono: '555-5678',
        email: 'maria.lopez@email.com',
    },
];

export const pedidos: Pedido[] = [
    {
        id: 1,
        clienteId: 1,
        fecha: '2024-06-10',
        items: [
            { itemId: 1, cantidad: 2 },
            { itemId: 2, cantidad: 4 },
        ],
        estado_general: 'orden1',
    },
    {
        id: 2,
        clienteId: 2,
        fecha: '2024-06-11',
        items: [
            { itemId: 3, cantidad: 1 },
        ],
        estado_general: 'orden2',
    },
];

