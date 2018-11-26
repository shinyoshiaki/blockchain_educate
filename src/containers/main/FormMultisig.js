import React, { Component } from "react";
import {
  Button,
  TextField,
  Typography,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-ui/core";
import { connect } from "react-redux";
import { makeNewMultiSigAddress } from "../../module/Blockchain";

const inputAddresses = {};
let inputVote = "",
  inputAmount = "";

class FormMultisig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputNum: 1
    };
  }

  clear = () => {
    this.setState({
      text: ""
    });
  };

  render() {
    const { dispatch, p2p } = this.props;
    const raws = [];
    for (let i = 0; i < this.state.inputNum; i++) {
      raws.push(
        <div key={i}>
          <TextField
            label="address"
            onChange={e => {
              inputAddresses[i] = e.target.value;
            }}
          />
        </div>
      );
    }
    return (
      <div>
        <Divider />
        <Typography>multisignature</Typography>
        {raws}
        <Button
          onClick={() => {
            this.setState(prev => {
              return { inputNum: prev.inputNum + 1 };
            });
          }}
        >
          +
        </Button>
        <Button
          onClick={() => {
            this.setState(prev => {
              return { inputNum: prev.inputNum - 1 };
            });
          }}
        >
          -
        </Button>
        <br />
        <TextField
          label="vote"
          onChange={e => {
            inputVote = e.target.value;
          }}
        />
        <br />
        <TextField
          label="amount"
          onChange={e => {
            inputAmount = e.target.value;
          }}
        />
        <br />
        <Button
          onClick={() => {
            console.log({ inputAmount });
            const friends = [];
            Object.keys(inputAddresses).forEach(key => {
              friends.push(inputAddresses[key]);
            });
            console.log(p2p.blockchainApp);
            makeNewMultiSigAddress(
              dispatch,
              p2p.blockchainApp,
              friends,
              parseInt(inputVote, 10),
              parseFloat(inputAmount, 10)
            );
          }}
        >
          make new multisig
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

export default connect(mapStateToProps)(FormMultisig);
