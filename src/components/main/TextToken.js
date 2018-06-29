import React, { Component } from "react";

class TextToken extends Component {
  render() {
    const { blockchain } = this.props;
    return (
      <div>
        {blockchain.tokenAmount}
        <br />
      </div>
    );
  }
}

export default TextToken;
