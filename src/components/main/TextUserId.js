import React, { Component } from "react";

class TextToken extends Component {
  render() {
    const { p2p } = this.props;
    return (
      <div>
        {p2p.userId}
        <br />
      </div>
    );
  }
}

export default TextToken;
