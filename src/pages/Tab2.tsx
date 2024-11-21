import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { UserList } from '../components/UserList';
import { User } from '../types/userTypes';

const Tab2: React.FC = () => {
    const handleUserSelect = (user: User) => {
        console.log('Selected user:', user);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Anställda</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <UserList onUserSelect={handleUserSelect} />
            </IonContent>
        </IonPage>
    );
};

export default Tab2;