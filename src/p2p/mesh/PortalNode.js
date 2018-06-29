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
  ONCOMMAND: "ONCOMMAND"
};

let peerOffer, peerAnswer;
export default class PortalNode {
  constructor(myPort, targetAddress, targetPort, isLocal) {
    this.myPort = myPort;
    this.myUrl = undefined;
    this.targetUrl = undefined;
    if (targetAddress != undefined && targetAddress.length > 0) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
    }

    this.userId = sha1(Math.random().toString());
    console.log("userId", this.userId);

    this.mesh = new Mesh(this.userId);
    this.ev = new events.EventEmitter();

    this.mesh.ev.on(def.ONCOMMAND, datalinkLayer => {
      console.log("portal node oncommand", datalinkLayer);
      if (JSON.stringify(datalinkLayer).includes("p2ch")) {
        const networkLayer = datalinkLayer.data;
        console.log("portal node oncommand", networkLayer);
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

    /* this.srv = http.Server();
    this.io = socketio(this.srv);
    this.srv.listen(this.myPort);

    this.io.on("connection", socket => {
      socket.on(def.OFFER, data => {
        this.answerFirst(data, socket.id);
      });
    });*/

    if (this.targetUrl != undefined) {
      const socket = client.connect(this.targetUrl);

      socket.on("connect", () => {
        console.log("socket connected");
        this.offerFirst(socket);
      });

      socket.on(def.ANSWER, data => {
        peerOffer.rtc.signal(data.sdp);
        peerOffer.connecting(data.userId);
      });
    }
  }

  answerFirst(data, socketId) {
    console.log("@cli", "answer first");

    return new Promise(resolve => {
      peerAnswer = new WebRTC("answer");

      peerAnswer.connecting(data.userId);
      peerAnswer.rtc.signal(data.sdp);

      setTimeout(() => {
        resolve(false);
      }, 4 * 1000);

      peerAnswer.rtc.on("signal", sdp => {
        this.io.sockets.sockets[socketId].emit(def.ANSWER, {
          sdp: sdp,
          userId: this.userId
        });
      });

      peerAnswer.rtc.on("error", err => {
        console.log("error", err);

        resolve(false);
      });

      peerAnswer.rtc.on("connect", () => {
        peerAnswer.connected();
        this.mesh.addPeer(peerAnswer);
        resolve(true);
      });
    });
  }

  offerFirst(socket) {
    console.log("@cli", "offer first");
    peerOffer = new WebRTC("offer");

    peerOffer.rtc.on("signal", sdp => {
      socket.emit(def.OFFER, {
        type: def.OFFER,
        userId: this.userId,
        sdp: sdp
      });
    });

    peerOffer.rtc.on("connect", () => {
      peerOffer.connected();
      this.mesh.addPeer(peerOffer);
    });
  }

  send(data) {
    this.mesh.broadCast("MESH_MESSAGE", data);
  }
}
