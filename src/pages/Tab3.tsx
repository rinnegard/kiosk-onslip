import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonSpinner,
} from "@ionic/react";
import { useApi } from "../contexts/apiContext";
import { getButtonColor } from "../utils/buttonUtils";

const Tab3: React.FC = () => {
    const { buttonMaps, loading, error } = useApi();
    const drinkButtons =
        buttonMaps.find((map) => map.name === "Läsk")?.buttons || [];

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
                    <IonTitle>Läsk</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="ion-padding">
                    {drinkButtons.map((button) => (
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

export default Tab3;
