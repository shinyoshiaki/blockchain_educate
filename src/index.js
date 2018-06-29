import React from "react";
import { render } from "react-dom";
import App from "./containers/App";
import App2ch from "./containers/2ch/App2ch";
import Page2chThread from "./containers/2ch/Page2chThread";
import { Provider } from "react-redux";
import createStore from "./store/createStore";

import { Route } from "react-router";
import { ConnectedRouter } from "react-router-redux";

const data = createStore();

render(
  <Provider store={data.store}>
    <ConnectedRouter history={data.history}>
      <div>
        <Route exact path="/" component={App} />
        <Route path="/2ch" component={App2ch} />
        <Route path="/thread" component={Page2chThread} />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);
