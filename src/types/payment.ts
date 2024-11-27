export interface PaymentStatus {
    status: 'pending' | 'completed' | 'failed';
    message: string;
    transactionId?: string;
}