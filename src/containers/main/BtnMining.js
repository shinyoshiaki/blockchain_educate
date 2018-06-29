import React, { Component } from "react";
import { Button } from "@material-ui/core";
import { connect } from "react-redux";
import { mining } from "../../module/Blockchain";

class BtnMining extends Component {
  mining() {
    const { dispatch, p2p } = this.props;
    mining(dispatch, p2p);
  }
  render() {
    return (
      <ul>
        <Button
          onClick={() => {
            this.mining();
          }}
        >
          mining
        </Button>
      </ul>
    );
  }
}

const mapStateToProps = state => {
  return {
    p2p: state.p2p,    
  };
};

export default connect(mapStateToProps)(BtnMining);
