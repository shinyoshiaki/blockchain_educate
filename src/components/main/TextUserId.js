import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import BlockChainApp from "../../p2p/blockchain/BlockchainApp";
import aes256 from "aes256";

class TextToken extends Component {
  getPubKey(bca = new BlockChainApp()) {
    return aes256.encrypt("format", bca.cypher.pubKey);
  }

  render() {
    const { p2p } = this.props;
    return (
      <div>
        <Typography>blockchain address</Typography>
        <Typography>{p2p.address}</Typography>
        <Typography>{this.getPubKey(p2p.blockchainApp)}</Typography>
        <br />
      </div>
    );
  }
}

export default TextToken;
