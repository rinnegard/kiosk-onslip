import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonSpinner,
} from "@ionic/react";
import { useApi } from '../contexts/apiContext';
import { getButtonColor } from '../utils/buttonUtils';

const Tab1: React.FC = () => {
    const { buttonMaps, loading, error } = useApi();
    const candyButtons = buttonMaps.find(map => map.name === "Godis")?.buttons || [];

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <IonSpinner />
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <p>Error: {error.message}</p>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Godis</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="ion-padding">
                    {candyButtons.map((button) => (
                        <IonButton 
                            key={`${button.x}-${button.y}-${button.product}`}
                            expand="block"
                            color={getButtonColor(button.theme)}
                        >
                            {button.name || `Product ${button.product}`}
                        </IonButton>
                    ))}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Tab1;