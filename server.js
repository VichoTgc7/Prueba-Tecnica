const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

// Datos globales
const API_URL = "https://api-sandbox.etpay.com";
const PTM_URL = "https://pmt-sandbox.etpay.com";
const INIT_API = "/session/initialize";
const CHECK_PAYMENT_API = "/merchant/check_payment_status";
const MERCHANT_CODE = "cl_sandbox_pruebatecnica";
const MERCHANT_API_TOKEN = "hdOhgochca7DyVEL4canpdaUX4SVGKMeXuGOcY1lhjSQSvL4zrHfweRszjbt7poN";

// URL de redirección
const PAYMENT_COMPLETED_URL = "http://localhost:3000/payment-completed";
const PAYMENT_CANCELLATION_URL = "http://localhost:3000/payment-cancelled";
const PAYMENT_WEBHOOK_URL = "http://localhost:3000/payment-webhook";

// Función para abrir URLs en el navegador
const openUrl = (url) => {
    const start =
        process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
    exec(`${start} ${url}`);
};

// Configuración de middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//obtener informacion del pago
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Formulario Principal</title>
        </head>
        <body>
            <h1>Captura de Datos para Pago</h1>
            <form action="/create-payment" method="POST">
                <label for="order_amount">Monto:</label><br>
                <input type="number" id="order_amount" name="order_amount" required><br><br>
                
                <label for="merchant_order_id">Merchant Order ID:</label><br>
                <input type="text" id="merchant_order_id" name="merchant_order_id" required><br><br>
                
                <button type="submit">Iniciar Pago</button>
            </form>
            
            <br>
            <hr>
            <br>

            <h2>Otras Opciones</h2>
            <button onclick="location.href='/find'">Buscar Pagos</button>
        </body>
        </html>
    `);
});

//Crear un pago y redirigir al funnel
app.post("/create-payment", async (req, res) => {
    const { order_amount, merchant_order_id } = req.body;

    try {
        const requestData = {
            merchant_code: MERCHANT_CODE,
            merchant_api_token: MERCHANT_API_TOKEN,
            merchant_order_id,
            order_amount: Number(order_amount),
            payment_completed_url: PAYMENT_COMPLETED_URL,
            payment_cancellation_url: PAYMENT_CANCELLATION_URL,
            payment_webhook_url: PAYMENT_WEBHOOK_URL,
        };

        // Solicitud a la API para iniciar sesión de pago
        const response = await axios.post(`${API_URL}${INIT_API}`, requestData);
        const token = response.data.token;

        // Redirige al cliente al funnel de pagos
        const paymentUrl = `${PTM_URL}/session/${token}`;
        console.log("Redirigiendo a:", paymentUrl);
        openUrl(paymentUrl);

        // Enviar una respuesta al cliente
        res.send(`
            <h1>Redirigiendo al Funnel de Pagos</h1>
            <p>Si no se abre automáticamente, haz clic en este <a href="${paymentUrl}" target="_blank">enlace</a>.</p>
        `);
    } catch (error) {
        console.error("Error al crear el pago:", error.response ? error.response.data : error.message);
        res.status(500).send("Error al crear el pago.");
    }
});

//pagos completados
app.get("/payment-completed", (req, res) => {
    res.send(`
        <h1>Pago Exitoso</h1>
        <p>¡Gracias por tu compra!</p>
    `);
});

//pagos cancelados
app.get("/payment-cancelled", (req, res) => {
    res.send(`
        <h1>Pago Cancelado</h1>
        <p>El pago ha sido cancelado. Si fue un error, intenta nuevamente.</p>
    `);
});

//Webhook estados de pago
app.post("/payment-webhook", (req, res) => {
    const paymentStatus = req.body;

    console.log("Notificación recibida:", paymentStatus);

    res.status(200).send("Webhook recibido.");
});

// busqueda de pagos
app.get("/find", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Búsqueda de Pagos</title>
        </head>
        <body>
            <h1>Búsqueda de Pagos</h1>
            <form action="/find" method="POST">
                <label for="merchant_order_id">Merchant Order ID (opcional):</label><br>
                <input type="text" id="merchant_order_id" name="merchant_order_id"><br><br>
                
                <label for="session_token">Session Token (opcional):</label><br>
                <input type="text" id="session_token" name="session_token"><br><br>
                
                <label for="payment_token">Payment_token (opcional):</label><br>
                <input type="text" id="payment_token" name="payment_token"><br><br>
                
                <button type="submit">Buscar</button>
            </form>
            
            <br>
            <hr>
            <br>

            <h2>Otras Opciones</h2>
            <button onclick="location.href='/'">Realizar un pago</button>
        </body>
        </html>
    `);
});

app.post("/find", async (req, res) => {
    const { merchant_order_id, session_token, payment_token } = req.body;

    const requestData = {
        merchant_code: MERCHANT_CODE,
        session_token: session_token,
        merchant_api_token: MERCHANT_API_TOKEN,
        payment_token: payment_token,
    };
    //Buscar pagos con datos existentes
    if (merchant_order_id) {
        requestData.merchant_order_id = merchant_order_id;
    }
    if (session_token) {
        requestData.session_token = session_token;
    }
    if (payment_token) {
        requestData.payment_token = payment_token;
    }

    try {
        //buscar el estado del pago
        const response = await axios.post(`${API_URL}${CHECK_PAYMENT_API}`, requestData);

        res.send(`
            <h1>Resultados de la Búsqueda</h1>
            <pre>${JSON.stringify(response.data, null, 2)}</pre>
            <a href="/find">Volver a buscar</a>
        `);
    } catch (error) {
        console.error("Error al buscar el estado del pago:", error.response ? error.response.data : error.message);
        res.status(500).send(`
            <h1>Error en la búsqueda</h1>
            <p>${error.response ? error.response.data.message : "Error inesperado"}</p>
            <a href="/find">Volver a intentar</a>
        `);
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
