import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { AppNavigator } from "./src/navigation/AppNavigator";
import "./global.css";
import { SafeAreaView } from "react-native-safe-area-context";

const App = () => {
  return (
      <Provider store={store}>
        <AppNavigator />
      </Provider>
  );
};

export default App;
