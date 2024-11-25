import React from "react";
import { IonSelect, IonSelectOption } from "@ionic/react";
import { Customer } from "../types/userTypes";
import { useCustomer } from "../contexts/userContext";

interface CustomerListProps {
    onCustomerSelect: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onCustomerSelect }) => {
    const { state: { customers, loading, error } } = useCustomer();

    if (loading) return <p>Laddar användare...</p>;
    if (error) return <p>Fel vid hämtning av användare: {error.message}</p>;

    if (!customers || customers.length === 0) {
        return <p>Inga användare tillgängliga.</p>;
    }

    return (
        <div className="customer-select-container">
            <IonSelect
                interface="popover"
                placeholder="Välj anställd..."
                onIonChange={(e) => {
                    const selectedCustomer = customers.find(customer => customer.id === e.detail.value);
                    if (selectedCustomer) {
                        onCustomerSelect(selectedCustomer);
                    }
                }}
                className="modern-select"
            >
                {customers.map((customer: Customer) => (
                    <IonSelectOption key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email ?? "Ingen e-post"})
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};
