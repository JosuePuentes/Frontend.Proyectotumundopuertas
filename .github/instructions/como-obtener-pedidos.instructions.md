---
applyTo: '**'
---
Instrucción para obtener los pedidos:

En el frontend, realiza una petición GET al endpoint /pedidos/all para obtener la lista completa de pedidos.
Si solo necesitas los pedidos de herrería, realiza una petición GET al endpoint /pedidos/herreria para obtener únicamente los pedidos cuyo estado general sea "orden1".
El backend responderá con un array de objetos pedido, cada uno con su información completa.
Muestra los pedidos en el frontend según la lógica de tu aplicación (por ejemplo, en una tabla, tarjetas, o lista).