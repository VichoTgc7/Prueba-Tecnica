# Aplicación de Pago con Node.js y Express

Esta aplicación es un servidor desarrollado con **Node.js** y **Express**, que permite manejar flujos de pagos interactuando con la API de ETPay. Ofrece funcionalidades como:

- Creación de pagos y redirección al funnel de pago.
- Gestión de estados de pago (completado, cancelado).
- Webhook para notificaciones de pago.
- Búsqueda de pagos por diferentes parámetros.

## Requisitos

Antes de ejecutar la aplicación, asegúrate de tener instalados los siguientes componentes:

- [Node.js](https://nodejs.org/) (v14 o superior).
- [npm](https://www.npmjs.com/) (incluido con Node.js).
- Conexión a Internet para interactuar con la API de ETPay.

## Instalación

1. Instala las dependencias necesarias:

    npm install express axios body-parser
    

2. Configura los datos de la API en el archivo `server.js` si es necesario:
    - `API_URL`, `PTM_URL`, `MERCHANT_CODE`, y `MERCHANT_API_TOKEN`.

## Uso

1. Inicia el servidor:
    ```bash
    node server.js
    ```
2. Accede a la aplicación en tu navegador visitando:  
   [http://localhost:3000](http://localhost:3000)

### Funcionalidades Principales

- **Formulario de Pago**: Introduce un monto y un ID de orden para crear un pago.
- **Funnel de Pagos**: Redirige automáticamente a la página de pago de ETPay.
- **Resultados del Pago**:
  - Pagos exitosos: [http://localhost:3000/payment-completed](http://localhost:3000/payment-completed).
  - Pagos cancelados: [http://localhost:3000/payment-cancelled](http://localhost:3000/payment-cancelled).
- **Búsqueda de Pagos**: Introduce parámetros como `merchant_order_id` o `session_token` para buscar pagos en [http://localhost:3000/find](http://localhost:3000/find).


