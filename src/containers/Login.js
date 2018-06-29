import React from "react";
import { connect } from "react-redux";
import { Button, TextField, Typography } from "@material-ui/core";
import { switchModalMakeThread } from "../../module/Ui";

let isLocal, myPort, targetAddress, targetPort;

class Page2chMakeThread extends React.Component {
  connectPortalNode = () => {
    const { dispatch } = this.props;
    switchModalMakeThread(dispatch);
  };

  render() {
    return (
      <div>
        <Typography>{"login"}</Typography>
        <TextField
          label="is local ture or false"
          onChange={e => (isLocal = e.target.value)}
        />
        <br />
        <TextField label="my port" onChange={e => (myPort = e.target.value)} />
        <br />
        <TextField
          label="target address"
          onChange={e => (targetAddress = e.target.value)}
        />
        <br />
        <TextField
          label="target port"
          onChange={e => (targetPort = e.target.value)}
        />
        <br />
        <Button
          onClick={() => {
            this.connectPortalNode();
          }}
        >
          connect
        </Button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    p2p: state.p2p,
    twoCh: state.twoCh
  };
};

export default connect(mapStateToProps)(Page2chMakeThread);
