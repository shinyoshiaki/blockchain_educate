import type from "./type";

/*
p2ch communication model(layer)
-------------------------------
(datalinkLayer)    <- onCommand(datalinkLayer)
network
transport
(session)    <- transaction / newblock
presen
app
*/

//transportLayer
export function sendFormat(session, body) {
  return JSON.stringify({
    layer: "transport",
    transport: "p2ch",
    type: type.BLOCKCHAIN,
    session: session,
    body: body //transaction format / board format
  });
}

//presenLayer
export function appBoardFormat(order, data) {
  return {
    layer: "presen",
    presen: order,
    data: data
  };
}

//appLayer
export function boardThreadTitleFormat(title, tag) {
  return {
    layer: "app",
    app: type.THREAD_TITLE,
    title: title,
    tag: tag,
    date: Date.now()
  };
}
