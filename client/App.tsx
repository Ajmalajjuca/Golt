import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { AppNavigator } from "./src/navigation/AppNavigator";
import "./global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertProvider } from "./src/contexts/AlertContext";

const App = () => {
  return (
      <Provider store={store}>
        <AlertProvider>
        <AppNavigator />
        </AlertProvider>
      </Provider>
  );
};

export default App;
