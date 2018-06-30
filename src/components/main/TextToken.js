import React, { Component } from "react";
import { Typography } from "@material-ui/core";
class TextToken extends Component {
  render() {
    const { blockchain } = this.props;
    return (
      <div>
        <Typography> token amout</Typography>
        <Typography> {blockchain.tokenAmount}</Typography>
        <br />
      </div>
    );
  }
}

export default TextToken;
