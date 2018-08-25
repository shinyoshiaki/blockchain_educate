import React, { Component } from "react";
import { connect } from "react-redux";
import BtnMining from "../containers/main/BtnMining";
import TextToken from "../components/main/TextToken";
import TextPeers from "../components/main/TextPeers";
import TextUserId from "../components/main/TextUserId";
import TextNodeId from "../components/main/TextNodeId";
import FormTransaction from "../containers/main/FormTransaction";
import TextKeyword from "../components/main/TextKeyword";
import { initTokenAmount } from "../module/Blockchain";

class Main extends Component {
  componentWillMount() {
    const { dispatch, p2p } = this.props;
    initTokenAmount(dispatch, p2p.blockchainApp);
  }

  render() {
    const { p2p, blockchain } = this.props;
    return (
      <div style={{ margin: 20 }}>
        <TextUserId p2p={p2p} />
        <TextNodeId p2p={p2p} />
        <TextKeyword p2p={p2p} />
        <TextToken blockchain={blockchain} />
        <BtnMining />
        <FormTransaction />
        <TextPeers p2p={p2p} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    p2p: state.p2p,
    blockchain: state.blockchain
  };
};

export default connect(mapStateToProps)(Main);
