import { IonSelect, IonSelectOption } from "@ionic/react";
import { User } from '../types/userTypes';
import { useUsers } from '../contexts/userContext';

interface UserListProps {
    onUserSelect: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
    const { users, loading } = useUsers();

    if (loading) return null;

    const employees = users
        .filter((user: User) => !user.deleted)
        .filter((user: User) => user['system-roles']?.includes('employee'))
        .sort((a: User, b: User) => a.name.localeCompare(b.name));

    return (
        <div className="user-select-container">
            <IonSelect 
                interface="popover"
                placeholder="Välj användare"
                onIonChange={e => {
                    const selectedUser = employees.find(user => user.id === e.detail.value);
                    if (selectedUser) onUserSelect(selectedUser);
                }}
                className="modern-select"
            >
                {employees.map((user: User) => (
                    <IonSelectOption key={user.id} value={user.id}>
                        {user.name}
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};