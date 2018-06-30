import React, { Component } from "react";
import { Button } from "@material-ui/core";

class BtnClean extends Component {
  render() {
    return (
      <div>
        <Button
          onClick={() => {
            localStorage.clear();
          }}
        >
          clean
        </Button>
      </div>
    );
  }
}

export default BtnClean;
