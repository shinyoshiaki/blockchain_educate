import React, { Component } from "react";
import { connect } from "react-redux";
import Router from "../components/router";

import Main from "./Main";
import Login from "./Login";

class App extends Component {
  render() {
    const { app } = this.props;
    console.log("start", app);
    return (
      <div>
        <Router route={["login", "main"]} page={app.screen}>
          <Login />
          <Main />
        </Router>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    app: state.app
  };
};

export default connect(mapStateToProps)(App);
