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
import { CustomerProvider } from "./contexts/userContext";
import { initializeUserService } from "./services/userService";
import { initializeApi } from "./api/config";

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
import TabPage from "./pages/TabPage";
import "./theme/variables.css";
import Campaign from "./pages/Campaign";

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

const TabContent: React.FC = () => {
    const {
        state: { buttonMaps, loading, error },
    } = useApi();

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <div
                        className="loading-container"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        <IonSpinner name="crescent" />
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <div className="error-container ion-text-center">
                        <h2>Ett fel uppstod</h2>
                        <p>{error.message}</p>
                        <IonButton onClick={() => window.location.reload()}>
                            Försök igen
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const filteredMaps = buttonMaps.filter(
        (map) => map.type === "tablet-buttons" && map.buttons?.length > 0
    );

    if (filteredMaps.length === 0) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <div className="empty-state">
                        <h2>Inga produkter tillgängliga</h2>
                        <p>Vänligen försök igen senare</p>
                    </div>
                </IonContent>
            </IonPage>
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
                <Route exact path="/">
                    <Redirect to={`/tab${filteredMaps[0].id}`} />
                </Route>
                <Route exact path={`/cart`}>
                    <Cart />
                </Route>
                <Route exact path={`/campaigns`}>
                    <Campaign />
                </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom" className="fade-in">
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
                    <CustomerProvider>
                        <IonReactRouter>
                            <TabContent />
                        </IonReactRouter>
                    </CustomerProvider>
                </ApiProvider>
            </CartProvider>
        </IonApp>
    );
};

export default App;
