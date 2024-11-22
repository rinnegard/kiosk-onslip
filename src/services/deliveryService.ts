import { User } from '../types/userTypes';
import { Resource } from '../types/resourceTypes';

interface DeliveryDetails {
    orderName: string;
    customerName: string;
    deliveryLocation: string;
    resourceId: number;
    staffId: number;
}

export const getRandomDeliveryStaff = (users: User[], currentUserId?: number): User | null => {
    const availableStaff = users.filter(u => 
        u.id !== currentUserId && 
        u['system-roles']?.includes('employee')
    );
    
    if (availableStaff.length === 0) {
        console.log('Inga tillgängliga anställda för leverans');
        return null;
    }
    
    const randomStaff = availableStaff[Math.floor(Math.random() * availableStaff.length)];
    console.log(`Vald leveranspersonal: ${randomStaff.name} (Employee)`);
    return randomStaff;
};

export const logDeliveryAssignment = (details: DeliveryDetails) => {
    console.log(`
    ====== Ny Leveranstilldelning ======
    Order: ${details.orderName}
    Beställare: ${details.customerName}
    Leveransplats: ${details.deliveryLocation}
    
    Tilldelad till: ${details.staffId}
    -------------------------------
    Status: Ordern har tilldelats för leverans
    ==============================
    `);
};

export const createDeliveryTags = (resourceId: number, staffId: number): string[] => [
    `delivery_desk:${resourceId}`,
    `delivery_staff:${staffId}`
];