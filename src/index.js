import React from "react";
import { render } from "react-dom";
import Login from "./containers/Login";
import App from "./containers/App";
import { Provider } from "react-redux";
import createStore from "./store/createStore";

import { Route } from "react-router";
import { ConnectedRouter } from "react-router-redux";

const data = createStore();

render(
  <Provider store={data.store}>
    <ConnectedRouter history={data.history}>
      <div>
        <Route exact path="/" component={Login} />
        <Route path="/app" component={App} />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);
