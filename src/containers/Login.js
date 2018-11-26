import React from "react";
import { connect } from "react-redux";
import { Button, TextField, Typography } from "@material-ui/core";
import { connectPortal, onAddPeerEvent } from "../module/P2P";
import { onTransactionEvent } from "../module/Blockchain";
import { changeScreen } from "../module/router";
import BtnClean from "../components/main/BtnClean";
import crypto from "crypto";
import keypair from "keypair";
import aes256 from "aes256";

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

  componentDidMount() {
    // const cypher = keypair();
    // const pubkey = cypher.public;
    // console.log({ pubkey });
    // const enc = aes256.encrypt("test", pubkey);
    // console.log({ enc });
    const dec = aes256.decrypt(
      "test",
      "ivmeEi7rr+CczR6O2lXfoBge7FFufZTT0oJOzN9WWE0XyDSnORRMef0m/hEwkDvSynr4JMPjsC5Wz6Ug34IkkA28g0v6yBlqd7znoBNq7XjpVd8k46NI/2jh+FmjAoFGAtsF6sJ75lhMG94TkWYG2LN4xFnM0SdW6Mz98FLrzSrdpBiUkZsptwuhKl9/Z2Gr6goM9jh1ThefFor8oTzV6rpWQq0+43NuAjY3UoeCiverRqlHPIuE5QR4YKOdUBY48jc3mPhT4f40bQndMW5+aTQW7r5j4+fWARTWkDIclR/A7+kDk1Xz5JYxigxLlQNB+0xdLCE0uQhZsJ26aAcLLg3DLHHc/W1sP/vyC9WY6J32bNhLHw3trU3zn/fgMFPHK4xaOr8vX0rI5K89msKT7bDj55tiuWTBH3kfwHaMusmoPHsN2ZSSB5lqT6n0FgggSB3y6z7xQlLFApxFoMR3Z2SIJc4+KSpM3FWpS5Dui3sprBT350UQDoI45WBiTzSqThikbHwJXcj+Zi98Dl8n+9Hao8vd35kNt5H/0B8lWVObl2w7CB5IkcNqeIEwyw05lhZ7i1wSr+Ho"
    );
    console.log({ dec });
    const a = crypto.publicEncrypt(dec, Buffer.from("test"));
    //console.log(crypto.privateDecrypt(cypher.private, a).toString("utf8"));
  }

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
