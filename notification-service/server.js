const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Configuración de la BD
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'inventario',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'inventario_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Función para enviar correo de transacción
async function sendTransactionEmail(transaction) {
  try {
    const emailBody = `
      <h2>📊 Nueva Transacción de Inventario</h2>
      <hr>
      <p><strong>Tipo:</strong> ${transaction.tipo}</p>
      <p><strong>Producto:</strong> ${transaction.producto}</p>
      <p><strong>Cantidad:</strong> ${transaction.cantidad}</p>
      <p><strong>Motivo:</strong> ${transaction.motivo}</p>
      <p><strong>Fecha:</strong> ${new Date(transaction.fecha).toLocaleString('es-CO')}</p>
      <p><strong>Stock Anterior:</strong> ${transaction.stock_anterior}</p>
      <p><strong>Stock Actual:</strong> ${transaction.stock_actual}</p>
      <hr>
      <p><em>Generado automáticamente por el sistema de inventario</em></p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `🔔 Transacción: ${transaction.tipo} - ${transaction.producto}`,
      html: emailBody
    });

    console.log(`✅ Correo enviado para transacción ID: ${transaction.id}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return false;
  }
}

// Endpoint para registrar y notificar una transacción
app.post('/notify/transaction', async (req, res) => {
  try {
    const { tipo, producto, cantidad, motivo, stock_anterior, stock_actual } = req.body;

    const transaction = {
      tipo,
      producto,
      cantidad,
      motivo,
      stock_anterior,
      stock_actual,
      fecha: new Date()
    };

    // Enviar correo
    const emailSent = await sendTransactionEmail(transaction);

    res.json({
      success: emailSent,
      message: emailSent ? 'Correo enviado exitosamente' : 'Error al enviar correo',
      transaction
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para enviar correo de prueba
app.post('/notify/test', async (req, res) => {
  try {
    const testTransaction = {
      id: 'TEST-001',
      tipo: 'Entrada',
      producto: 'Laptop Dell XPS 13',
      cantidad: 5,
      motivo: 'Compra a proveedor',
      stock_anterior: 10,
      stock_actual: 15,
      fecha: new Date()
    };

    const sent = await sendTransactionEmail(testTransaction);

    res.json({
      success: sent,
      message: 'Correo de prueba enviado a ' + process.env.RECIPIENT_EMAIL
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obtener estado del servicio
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'notification-service', timestamp: new Date() });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servicio de Notificaciones ejecutándose en puerto ${PORT}`);
  console.log(`📧 Correo de destino: ${process.env.RECIPIENT_EMAIL}`);
});

module.exports = app;
