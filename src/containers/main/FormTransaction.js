import React, { Component } from "react";
import { Button, TextField, Typography, Divider } from "@material-ui/core";
import { connect } from "react-redux";
import { transaction } from "../../module/Blockchain";

let tokenAmount;
let targetAddress;

class FormTransaction extends Component {
  render() {
    const { dispatch, p2p } = this.props;
    return (
      <div>
        <Divider />
        <Typography gutterBottom>Transaction Form</Typography>
        <TextField
          label="target address"
          onChange={e => (targetAddress = e.target.value)}
        />
        <br />
        <TextField
          label="send amount"
          onChange={e => (tokenAmount = e.target.value)}
        />
        <br />
        <Button
          onClick={() => {
            transaction(dispatch, p2p, targetAddress, tokenAmount);
          }}
        >
          send
        </Button>
        <Divider />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    p2p: state.p2p
  };
};

export default connect(mapStateToProps)(FormTransaction);
