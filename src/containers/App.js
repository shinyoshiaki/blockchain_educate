import React, { Component } from "react";
import { connect } from "react-redux";
import BtnMining from "../containers/main/BtnMining";
import TextToken from "../components/main/TextToken";
import TextUserId from "../components/main/TextUserId";
import FormTransaction from "../containers/main/FormTransaction";
import { Typography } from "@material-ui/core";

class App extends Component {
  render() {
    const { p2p, blockchain } = this.props;
    return (
      <div>
        <div style={{ margin: 20 }}>
          <Typography gutterBottom variant="title">
            <TextUserId p2p={p2p} />
          </Typography>
          <Typography gutterBottom variant="title">
            <TextToken blockchain={blockchain} />
          </Typography>
          <BtnMining />
          <FormTransaction />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    p2p: state.p2p,
    blockchain: state.blockchain
  };
};

export default connect(mapStateToProps)(App);
