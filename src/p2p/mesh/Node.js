import WebRTC from "../lib/webrtc";
import client from "socket.io-client";
import Mesh from "../mesh/Mesh";
import sha1 from "sha1";
import events from "events";

const def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  MESH_MESSAGE: "MESH_MESSAGE",
  ONCOMMAND: "ONCOMMAND"
};

let peerOffer;
export default class Node {
  constructor(targetAddress = null, targetPort) {
    if (targetAddress !== null) {
      console.log("node start", targetAddress, targetPort);
      this.targetUrl = undefined;
      if (targetAddress !== undefined && targetAddress.length > 0) {
        this.targetUrl = "http://" + targetAddress + ":" + targetPort;
        console.log("target url", this.targetUrl);
      }

      this.nodeId = sha1(Math.random().toString());
      console.log("nodeId", this.nodeId);

      this.mesh = new Mesh(this.nodeId);
      this.ev = new events.EventEmitter();

      this.mesh.ev.on(def.ONCOMMAND, datalinkLayer => {
        if (JSON.stringify(datalinkLayer).includes("blockchainApp")) {
          const networkLayer = datalinkLayer.data;
          this.ev.emit("blockchainApp", networkLayer);
        }
      });

      if (this.targetUrl !== undefined) {
        const socket = client.connect(this.targetUrl);

        socket.on("connect", () => {
          console.log("socket connected");
          this.offerFirst(socket);
        });

        socket.on(def.ANSWER, data => {
          peerOffer.rtc.signal(data.sdp);
          peerOffer.connecting(data.nodeId);
        });
      }
    }
  }

  offerFirst(socket) {
    console.log("@cli", "offer first");
    peerOffer = new WebRTC("offer");

    peerOffer.rtc.on("signal", sdp => {
      socket.emit(def.OFFER, {
        type: def.OFFER,
        nodeId: this.nodeId,
        sdp: sdp
      });
    });

    peerOffer.rtc.on("connect", () => {
      peerOffer.connected();
      setTimeout(() => {
        this.mesh.addPeer(peerOffer);
      }, 1 * 1000);
    });
  }

  broadCast(data) {
    this.mesh.broadCast(def.MESH_MESSAGE, data);
  }

  send(target, data) {
    for (let key in this.mesh.peerList) {
      console.log(key);
    }
    console.log(this.mesh.peerList[target]);
    this.mesh.peerList[target].send(
      JSON.stringify({ type: def.MESH_MESSAGE, data: data })
    );
  }
}
