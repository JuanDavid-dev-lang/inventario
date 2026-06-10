<?php
/**
 * Ejemplo de integración del Servicio de Notificaciones
 * Adiciona esta lógica en tu endpoint de creación de movimientos
 */

class NotificationService {
    private $notificationUrl = 'http://notification-service:3001/notify/transaction';
    
    /**
     * Enviar notificación de transacción
     * 
     * @param string $tipo - Tipo de movimiento (Entrada, Salida, Ajuste)
     * @param string $producto - Nombre del producto
     * @param int $cantidad - Cantidad movida
     * @param string $motivo - Motivo del movimiento
     * @param int $stockAnterior - Stock antes del movimiento
     * @param int $stockActual - Stock después del movimiento
     * 
     * @return bool - True si se envió exitosamente
     */
    public function notifyTransaction($tipo, $producto, $cantidad, $motivo, $stockAnterior, $stockActual) {
        $data = [
            'tipo' => $tipo,
            'producto' => $producto,
            'cantidad' => $cantidad,
            'motivo' => $motivo,
            'stock_anterior' => $stockAnterior,
            'stock_actual' => $stockActual
        ];

        try {
            $ch = curl_init($this->notificationUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return $httpCode === 200;
        } catch (Exception $e) {
            error_log('Error notifying transaction: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Verificar estado del servicio
     * 
     * @return bool - True si el servicio está disponible
     */
    public function healthCheck() {
        try {
            $ch = curl_init('http://notification-service:3001/health');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 3);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return $httpCode === 200;
        } catch (Exception $e) {
            return false;
        }
    }
}

// ============================================
// EJEMPLO DE USO EN TU API
// ============================================

/*
// En tu endpoint POST /api/movimientos

$notificationService = new NotificationService();

// Después de registrar el movimiento en la BD
if ($movimientoGuardado) {
    // Enviar notificación por correo
    $notificationService->notifyTransaction(
        $tipo,           // 'Entrada', 'Salida', 'Ajuste'
        $productoNombre,
        $cantidad,
        $motivo,
        $stockAnterior,
        $stockActual
    );

    // Responder al cliente
    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Movimiento registrado']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al registrar movimiento']);
}
*/
?>
