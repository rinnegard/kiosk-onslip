import { API } from '@onslip/onslip-360-web-api';
import { initializeApi } from '../api/config';

export type SystemRole = 'admin' | 'cashier' | 'service' | 'employee';
export type Customer = API.Customer;

export interface DeliveryDetails {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    deliveryLocation: string;
    totalAmount: number;
    items: string[];
}

export interface DeliveryStaffInfo {
    id: number;
    name: string;
    email: string;
}

const DELIVERY_STAFF_ID = 6;

// Funktion för att hämta den dedikerade leveranspersonalen (ID 6)
export const getDeliveryStaff = async (): Promise<Customer | null> => {
    const api = initializeApi();

    try {
        const staff = await api.getCustomer(DELIVERY_STAFF_ID);
        
        if (staff) {
            console.log(`Tilldelad leveranspersonal: ${staff.name} (Employee ID: ${DELIVERY_STAFF_ID})`);
            return staff;
        } else {
            console.error(`Leveranspersonal (ID ${DELIVERY_STAFF_ID}) hittades inte`);
            return null;
        }
    } catch (error) {
        console.error("Fel vid hämtning av leveranspersonal:", error);
        return null;
    }
};

// Logga leveranstilldelning
export const logDeliveryAssignment = (details: DeliveryDetails) => {
    console.log(`
    ====== Ny Leveranstilldelning ======
    Order ID: ${details.orderId}
    Order: ${details.orderName}
    Beställare: ${details.customerName}
    Email: ${details.customerEmail}
    Leveransplats: ${details.deliveryLocation}
    Totalt belopp: ${details.totalAmount} kr
    
    Produkter:
    ${details.items.join('\n')}
    
    Tilldelad till: ID ${DELIVERY_STAFF_ID} (Fast leveranspersonal)
    -------------------------------
    Status: Ordern har tilldelats för leverans
    ==============================
    `);
};

// Skapa leveranstagg
export const createDeliveryTags = (resourceId: number): string[] => [
    `delivery_desk:${resourceId}`,
    `delivery_staff:${DELIVERY_STAFF_ID}`
];

// Skicka e-post via API
export const sendEmail = async (
    recipientEmail: string,
    subject: string,
    message: string
): Promise<void> => {
    const api = initializeApi();

    try {
        const command: API.Command = {
            name: 'send-email',
            args: [
                'noreply@domain.com',
                recipientEmail,
                subject,
                'text/plain',
                message
            ]
        };

        await api.doCommand(command);
        console.log(`E-post skickad till: ${recipientEmail}`);
    } catch (error) {
        console.error("Fel vid skickande av e-post:", error);
        throw error;
    }
};

// Formatera orderdetaljer för e-post
export const formatOrderDetails = (details: DeliveryDetails): string => {
    return `
Orderdetaljer:
Order ID: ${details.orderId}
Beställare: ${details.customerName}
Leveransplats: ${details.deliveryLocation}

Produkter:
${details.items.join('\n')}

Totalt belopp: ${details.totalAmount} kr
`;
};

// Samlade e-postnotifieringar
export const notifications = {
    // Till kund - order mottagen
    async sendCustomerOrderConfirmation(details: DeliveryDetails) {
        await sendEmail(
            details.customerEmail,
            `Orderbekräftelse: ${details.orderName}`,
            `
Hej!

Din beställning är mottagen och behandlas nu.

${formatOrderDetails(details)}

Vi meddelar dig när din beställning har godkänts av vår leveranspersonal.

Med vänliga hälsningar,
Teamet`
        );
    },

    // Till leveranspersonal
    async sendDeliveryStaffNotification(details: DeliveryDetails) {
        const staff = await getDeliveryStaff();
        if (!staff?.email) {
            throw new Error("Kunde inte hitta e-postadress för leveranspersonal");
        }

        await sendEmail(
            staff.email,
            `Ny leverans att hantera: ${details.orderName}`,
            `
Hej!

En ny leverans väntar på din hantering.

${formatOrderDetails(details)}

Vänligen granska och godkänn beställningen i systemet.

Med vänliga hälsningar,
Systemet`
        );
    },

    // Till kund - order godkänd
    async sendOrderApprovalNotification(details: DeliveryDetails) {
        await sendEmail(
            details.customerEmail,
            `Din beställning är godkänd: ${details.orderName}`,
            `
Hej!

Din beställning har nu godkänts av vår leveranspersonal.
Betalning kommer att ske på plats via betalterminal.

${formatOrderDetails(details)}

Med vänliga hälsningar,
Teamet`
        );
    },

    // Till kund - betalning genomförd
    async sendPaymentConfirmation(details: DeliveryDetails, transactionId: string) {
        await sendEmail(
            details.customerEmail,
            `Betalningsbekräftelse: ${details.orderName}`,
            `
Hej!

Vi bekräftar att betalningen har genomförts.

Transaktions-ID: ${transactionId}

${formatOrderDetails(details)}

Tack för ditt köp!

Med vänliga hälsningar,
Teamet`
        );
    }
};