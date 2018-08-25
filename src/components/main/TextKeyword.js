import React, { Component } from "react";
import { Typography } from "@material-ui/core";

class TextKeyword extends Component {
  render() {
    const { p2p } = this.props;
    return (
      <div>
        <Typography>keyword</Typography>
        <Typography>{p2p.keyword}</Typography>
        <br />
      </div>
    );
  }
}

export default TextKeyword;
