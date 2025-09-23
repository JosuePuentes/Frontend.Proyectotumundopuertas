---
applyTo: '**'
---
En el frontend, muestra la lista de empleados con el permiso adecuado (por ejemplo, "herreria") y permite seleccionar uno para asignar a un pedido.
Al confirmar la asignación, realiza una petición PUT al endpoint /pedidos/subestados/ enviando en el body:
pedido_id: el _id del pedido al que se asigna el empleado.
numero_orden: el número de orden del subestado que quieres actualizar (por ejemplo, "1").
tipo_fecha: "inicio" para marcar el inicio del subestado.
estado: el nuevo estado, por ejemplo "en_proceso".
El backend actualizará el subestado correspondiente del pedido, marcando la fecha de inicio y el estado.
Muestra un mensaje de éxito o error según la respuesta del backend.