import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
} from "@ionic/react";
import { getButtonColor } from '../utils/buttonUtils';
import { ButtonMap } from '../types';

interface TabPageProps {
    buttonMap: ButtonMap;
}

const TabPage: React.FC<TabPageProps> = ({ buttonMap }) => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{buttonMap.name}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="ion-padding">
                    {buttonMap.buttons.map((button) => (
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

export default TabPage;