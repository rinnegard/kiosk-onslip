import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
} from "@ionic/react";
import { getButtonColor } from "../utils/buttonUtils";
import { ButtonMap } from "../types";
import { useCart } from "../contexts/cartContext";

interface TabPageProps {
    buttonMap: ButtonMap;
}

const TabPage: React.FC<TabPageProps> = ({ buttonMap }) => {
    const { state, dispatch } = useCart();

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
                            onClick={() => {
                                dispatch({
                                    type: "ADD_ITEM",
                                    payload: {
                                        id: button.product!,
                                        name: button.name!,
                                        quantity: 1,
                                    },
                                });
                            }}
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
