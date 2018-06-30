import React, { Component } from "react";
import { Typography } from "@material-ui/core";

class TextToken extends Component {
  render() {
    const { p2p } = this.props;
    return (
      <div>
        <Typography>blockchain address</Typography>
        <Typography>{p2p.address}</Typography>
        <br />
      </div>
    );
  }
}

export default TextToken;
