import React from "react";
import { connect } from "react-redux";
import { Button, TextField, Typography } from "@material-ui/core";
import { connectPortal, onAddPeerEvent } from "../module/P2P";
import { onTransactionEvent } from "../module/Blockchain";
import { changeScreen } from "../module/router";
import BtnClean from "../components/main/BtnClean";

let targetAddress = "localhost",
  targetPort = "20000",
  keyword = "";

class login extends React.Component {
  connectNode = () => {
    const { dispatch, p2p } = this.props;
    const data = connectPortal(
      dispatch,
      p2p,
      {
        targetAddress: targetAddress,
        targetPort: targetPort
      },
      keyword
    );
    onTransactionEvent(dispatch, data.node, data.blockchainApp);
    onAddPeerEvent(dispatch, data.node.mesh);

    changeScreen(dispatch, "main");
  };

  render() {
    return (
      <div>
        <Typography>{"login"}</Typography>
        <TextField
          label="target address"
          onChange={e => (targetAddress = e.target.value)}
        />
        <br />
        <TextField
          label="target port"
          onChange={e => (targetPort = e.target.value)}
        />
        <br />
        <TextField label="keyword" onChange={e => (keyword = e.target.value)} />
        <br />
        <Button onClick={this.connectNode}>connect</Button>
        <br />
        <BtnClean />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    p2p: state.p2p
  };
};

export default connect(mapStateToProps)(login);
