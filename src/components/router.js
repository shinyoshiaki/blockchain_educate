import { Component } from "react";

export default class Router extends Component {
  router() {
    let page = 0;
    this.props.route.forEach((v, i) => {
      if (v === this.props.page) {
        page = i;
      }
    });
    return this.props.children[page];
  }

  render() {
    return this.router();
  }
}
