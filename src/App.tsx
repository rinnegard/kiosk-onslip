import { Redirect, Route } from "react-router-dom";
import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonSpinner,
    IonContent,
    setupIonicReact,
    IonButton,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { iceCream, restaurant, beer, people } from "ionicons/icons";
import { ApiProvider, useApi } from "./contexts/apiContext";
import { UserProvider } from "./contexts/userContext";
import { initializeUserService } from "./services/userService";
import { initializeApi } from "./api/config";
import Tab2 from "./pages/Tab2";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

/* Dark mode CSS */
import "@ionic/react/css/palettes/dark.system.css";

import Cart from "./pages/Cart";
import { CartProvider, useCart } from "./contexts/cartContext";
import CartIcon from "./components/CartIcon";
import { getButtonColor } from "./utils/buttonUtils";

setupIonicReact();

const getIconForTab = (name: string) => {
    switch (name.toLowerCase()) {
        case "godis":
            return iceCream;
        case "lunch":
            return restaurant;
        case "läsk":
            return beer;
        default:
            return restaurant;
    }
};

const TabPage: React.FC<{ buttonMap: any }> = ({ buttonMap }) => {
    const { state, dispatch } = useCart();
    if (!buttonMap) return null;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{buttonMap.name}</IonTitle>
                    <CartIcon></CartIcon>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="ion-padding">
                    {buttonMap.buttons.map((button: any) => (
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

const TabContent: React.FC = () => {
    const { buttonMaps, loading, error } = useApi();

    if (loading) {
        return (
            <IonContent className="ion-padding ion-text-center">
                <IonSpinner />
            </IonContent>
        );
    }

    if (error) {
        return (
            <IonContent className="ion-padding">
                <p>Ett fel uppstod: {error.message}</p>
            </IonContent>
        );
    }

    const filteredMaps = buttonMaps.filter(
        (map) =>
            map.type === "tablet-buttons" &&
            map.buttons &&
            map.buttons.length > 0
    );

    if (filteredMaps.length === 0) {
        return (
            <IonContent className="ion-padding ion-text-center">
                <p>Inga knappar tillgängliga</p>
            </IonContent>
        );
    }

    return (
        <IonTabs>
            <IonRouterOutlet>
                {filteredMaps.map((buttonMap, index) => (
                    <Route
                        key={buttonMap.id}
                        exact={index === 0}
                        path={`/tab${buttonMap.id}`}
                    >
                        <TabPage buttonMap={buttonMap} />
                    </Route>
                ))}
                <Route exact path="/users">
                    <Tab2 />
                </Route>
                <Route exact path="/">
                    <Redirect to={`/tab${filteredMaps[0].id}`} />
                </Route>
                <Route exact path={`/cart`}>
                    <Cart />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                {filteredMaps.map((buttonMap) => (
                    <IonTabButton
                        key={buttonMap.id}
                        tab={`tab${buttonMap.id}`}
                        href={`/tab${buttonMap.id}`}
                    >
                        <IonIcon
                            aria-hidden="true"
                            icon={getIconForTab(buttonMap.name)}
                        />
                        <IonLabel>{buttonMap.name}</IonLabel>
                    </IonTabButton>
                ))}
                <IonTabButton tab="users" href="/users">
                    <IonIcon aria-hidden="true" icon={people} />
                    <IonLabel>Anställda</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

const App: React.FC = () => {
    const api = initializeApi();
    initializeUserService(api);

    return (
        <IonApp>
            <CartProvider>
                <ApiProvider>
                    <UserProvider>
                        <IonReactRouter>
                            <TabContent />
                        </IonReactRouter>
                    </UserProvider>
                </ApiProvider>
            </CartProvider>
        </IonApp>
    );
};

export default App;
