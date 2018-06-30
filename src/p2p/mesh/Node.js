"use strict";
import WebRTC from "../lib/webrtc";
import client from "socket.io-client";
import Mesh from "../mesh/Mesh";
import sha1 from "sha1";
import publicIp from "public-ip";
import events from "events";

const def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  MESH_MESSAGE: "MESH_MESSAGE",
  ONCOMMAND: "ONCOMMAND"
};

let peerOffer;
export default class Node {
  constructor(myPort, targetAddress, targetPort, isLocal) {
    this.myPort = myPort;
    this.myUrl = undefined;
    this.targetUrl = undefined;
    if (targetAddress != undefined && targetAddress.length > 0) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
    }

    this.nodeId = sha1(Math.random().toString());
    console.log("nodeId", this.nodeId);

    this.mesh = new Mesh(this.nodeId);
    this.ev = new events.EventEmitter();

    this.mesh.ev.on(def.ONCOMMAND, datalinkLayer => {      
      if (JSON.stringify(datalinkLayer).includes("p2ch")) {
        const networkLayer = datalinkLayer.data;        
        this.ev.emit("p2ch", networkLayer);
      }
    });

    if (isLocal) {
      this.myUrl = "http://localhost:" + this.myPort;
      console.log("start local", this.myUrl);
    } else {
      (async () => {
        const result = await publicIp.v4();
        this.myUrl = `http://${result}:${this.myPort}`;
        console.log("start global", this.myUrl);
      })();
    }

    if (this.targetUrl != undefined) {
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
    console.log("node broadcast", data);
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
