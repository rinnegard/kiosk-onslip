import React from "react";
import { IonSelect, IonSelectOption } from "@ionic/react";
import { Customer } from "../types/userTypes";
import { useUsers } from "../contexts/userContext";

interface UserListProps {
    onUserSelect: (customer: Customer) => void;
}

export const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
    const { state: { customers, loading, error } } = useUsers();

    if (loading) return <p>Laddar användare...</p>;
    if (error) return <p>Fel vid hämtning av användare: {error.message}</p>;

    if (!customers || customers.length === 0) {
        return <p>Inga användare tillgängliga.</p>;
    }

    return (
        <div className="user-select-container">
            <IonSelect
                interface="popover"
                placeholder="Välj användare"
                onIonChange={(e) => {
                    const selectedCustomer = customers.find(user => user.id === e.detail.value);
                    if (selectedCustomer) {
                        onUserSelect(selectedCustomer);
                    }
                }}
                className="modern-select"
            >
                {customers.map((user: Customer) => (
                    <IonSelectOption key={user.id} value={user.id}>
                        {user.name} ({user.email ?? "Ingen e-post"})
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};
