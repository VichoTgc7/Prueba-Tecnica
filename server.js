const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

//cargar credenciales
require('dotenv').config();

const app = express();
const port = 3000;

//MiddleWare

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); //Motor de plantillas EJS
app.use(express.static('public')); //Archivos estaticos


//Ruta pago y funnel

app.post('/create-payment', async (req, res) =>{
    const {monto, merchant_order_id} = req.body;

    try{
        const response = await axios.post('${process.env.API_URL}/create-payment',{
            monto,
            merchant_order_id,
            merchant_code: process.env.MERCHANT_CODE, 
        },{
            headers:{
                'Authorization': `Bearer ${process.env.MERCHANT_API_TOKEN}`,
              }
        });

        //Funnel

        const paymentUrl = '${procces.env.PMT_URL}${response.data.payment_url}';

        res.redirect(paymentUrl);
    } catch (error){
        console.error('Error al crear el pago: ', error.response?.data || error.message);
        res.status(500).send('Error al crear el pago');
    }
});