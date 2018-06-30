import React, { Component } from "react";
import { Typography } from "@material-ui/core";

class TextPeers extends Component {
  render() {
    const { p2p } = this.props;
    return (
      <div>
          <Typography>connected peers</Typography>
          <Typography>{JSON.stringify(p2p.peerIdList)}</Typography>        
        <br />
      </div>
    );
  }
}

export default TextPeers;
