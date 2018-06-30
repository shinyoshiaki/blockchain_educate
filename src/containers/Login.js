import React from "react";
import { connect } from "react-redux";
import { Button, TextField, Typography } from "@material-ui/core";
import { connectPortal } from "../module/P2P";
import { onTransactionEvent } from "../module/Blockchain";
import BtnClean from "../components/main/BtnClean";

let targetAddress, targetPort;

class login extends React.Component {
  connectNode = () => {
    const { dispatch, p2p } = this.props;
    const data = connectPortal(dispatch, p2p, {
      myPort: 20000,
      targetAddress: targetAddress,
      targetPort: targetPort,
      isLocal: true
    });
    onTransactionEvent(dispatch, data.node, data.blockchainApp);
    this.props.history.push("/app");
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
