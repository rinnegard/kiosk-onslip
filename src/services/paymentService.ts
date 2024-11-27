import { PaymentStatus } from '../types/payment';

interface VivaPaymentConfig {
    apiKey: string;
    merchantId: string;
    terminalId: string;
}

class PaymentService {
    private getConfig(): VivaPaymentConfig {
        return {
            apiKey: process.env.VIVA_API_KEY || '',
            merchantId: process.env.VIVA_MERCHANT_ID || '',
            terminalId: process.env.VIVA_TERMINAL_ID || ''
        };
    }

    async processPayment(amount: number, orderId: string): Promise<PaymentStatus> {
        const config = this.getConfig();

        try {
            if (!config.apiKey || !config.merchantId || !config.terminalId) {
                throw new Error('Viva API-konfiguration saknas');
            }

            const response = await fetch('https://api.viva.com/payments/v1/terminal-payments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantId: config.merchantId,
                    terminalId: config.terminalId,
                    amount: Math.round(amount * 100), // Konvertera till ören och säkerställ heltal
                    currency: 'SEK',
                    orderId: orderId,
                    captureMode: 'AUTO'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.status === 'COMPLETED') {
                return {
                    status: 'completed',
                    message: 'Betalningen genomförd',
                    transactionId: result.transactionId
                };
            }

            return {
                status: 'failed',
                message: result.message || 'Betalningen misslyckades',
                transactionId: result.transactionId
            };
        } catch (error) {
            console.error('Betalningsfel:', error);
            return {
                status: 'failed',
                message: error instanceof Error ? error.message : 'Ett oväntat fel uppstod vid betalningen'
            };
        }
    }

    // Validera betalningsinformation innan processning
    validatePaymentInfo(amount: number, orderId: string): boolean {
        if (amount <= 0) {
            console.error('Ogiltigt belopp:', amount);
            return false;
        }

        if (!orderId) {
            console.error('Order-ID saknas');
            return false;
        }

        return true;
    }
}

// Exportera en singleton-instans
export const paymentService = new PaymentService();