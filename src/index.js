import React from "react";
import { render } from "react-dom";
import App from "./containers/App";
import { Provider } from "react-redux";
import createStore from "./store/createStore";

render(
  <Provider store={createStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);
