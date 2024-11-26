// src/App.tsx
import { Redirect, Route } from "react-router-dom";
import {
    IonApp,
    IonRouterOutlet,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ApiProvider } from "./contexts/apiContext";
import { CustomerProvider } from "./contexts/userContext";
import { CartProvider } from "./contexts/cartContext";
import { initializeUserService } from "./services/userService";
import { initializeApi } from "./api/config";

// CSS imports
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

// Page imports
import LandingPage from "./pages/LandingPage";
import TabPage from "./pages/TabPage";
import Cart from "./pages/Cart";
import Campaign from "./pages/Campaign";

setupIonicReact();

const App: React.FC = () => {
    const api = initializeApi();
    initializeUserService(api);

    return (
        <IonApp>
            <CartProvider>
                <ApiProvider>
                    <CustomerProvider>
                        <IonReactRouter>
                            <IonRouterOutlet>
                                <Route exact path="/">
                                    <LandingPage />
                                </Route>
                                <Route exact path="/tabs/:id">
                                    <TabPage />
                                </Route>
                                <Route exact path="/cart">
                                    <Cart />
                                </Route>
                                <Route exact path="/campaigns">
                                    <Campaign />
                                </Route>
                            </IonRouterOutlet>
                        </IonReactRouter>
                    </CustomerProvider>
                </ApiProvider>
            </CartProvider>
        </IonApp>
    );
};

export default App;