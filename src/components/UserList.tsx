import React from "react";
import { IonSelect, IonSelectOption, IonSpinner } from "@ionic/react";
import { Customer } from "../types/userTypes";
import { useCustomer } from "../contexts/userContext";
import '../styles/components/UserList.css';

interface CustomerListProps {
    onCustomerSelect: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onCustomerSelect }) => {
    const { state: { customers, loading, error } } = useCustomer();

    if (loading) {
        return (
            <div className="customer-status">
                <IonSpinner name="crescent" />
                <span>Laddar användare...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-status error">
                <p>Fel vid hämtning av användare: {error.message}</p>
            </div>
        );
    }

    if (!customers || customers.length === 0) {
        return (
            <div className="customer-status empty">
                <p>Inga användare tillgängliga.</p>
            </div>
        );
    }

    const sortedCustomers = [...customers].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
    );

    return (
        <div className="customer-select-container">
            <IonSelect
                interface="popover"
                placeholder="Välj anställd..."
                onIonChange={(e) => {
                    const selectedCustomer = customers.find(
                        customer => customer.id === e.detail.value
                    );
                    if (selectedCustomer) {
                        onCustomerSelect(selectedCustomer);
                    }
                }}
                className="modern-select"
            >
                {sortedCustomers.map((customer: Customer) => (
                    <IonSelectOption 
                        key={customer.id} 
                        value={customer.id}
                    >
                        {customer.name}
                        {customer.email && ` (${customer.email})`}
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};

export default CustomerList;