import Peer from "skyway-js";
import { generate } from "shortid";

import { getLocalStream } from "./localStream";
import { Room } from "./room";

import "./style.css";

(async function main() {
  const peer = new Peer({ key: "a82dbe30-5ff7-4f75-9eb4-6a8c171f4308" });

  peer.on("on", () => console.log("=== open ==="));
  peer.on("close", () => console.log("=== closed ==="));
  peer.on("disconnected", () => console.log("=== disconnented ==="));
  peer.on("error", error => console.error(error));

  const $videoContainer = document.getElementById(
    "video-container"
  ) as HTMLDivElement;

  const $parentId = document.getElementById("parent-id") as HTMLInputElement;
  const $startSessionButton = document.getElementById(
    "start-session"
  ) as HTMLButtonElement;
  const $stopSessionButton = document.getElementById(
    "stop-session"
  ) as HTMLButtonElement;

  const $peerParentId = document.getElementById(
    "peer-parent-id"
  ) as HTMLInputElement;
  const $connectPeerButton = document.getElementById(
    "connect-peer"
  ) as HTMLButtonElement;
  const $leavePeerButton = document.getElementById(
    "leave-peer"
  ) as HTMLButtonElement;
  const $cameraList = document.getElementById("camera-list") as HTMLDivElement;

  if (
    !$videoContainer ||
    !$parentId ||
    !$startSessionButton ||
    !$stopSessionButton ||
    !$peerParentId ||
    !$connectPeerButton ||
    !$leavePeerButton ||
    !$cameraList
  ) {
    return;
  }

  const parentId = generate();

  $parentId.value = parentId;

  $startSessionButton.addEventListener("click", async () => {
    const localStream = await getLocalStream();
    const room = new Room(peer, localStream, parentId, $videoContainer, false);
    room.on("onPeerChanged", (peers: string[]) => {
      $cameraList.innerHTML = "";
      peers
        .map(peerId => {
          const button = document.createElement("button");
          button.textContent = peerId;
          button.addEventListener("click", () => {
            room.changePeer(peerId);
          });
          return button;
        })
        .map(button => $cameraList.appendChild(button));
    });
    $stopSessionButton.addEventListener("click", () => {
      room.close();
    });
  });

  $connectPeerButton.addEventListener("click", async () => {
    const localStream = await getLocalStream();
    const peerParendId = $peerParentId.value;
    if (peerParendId) {
      const room = new Room(peer, localStream, peerParendId, $videoContainer);
      $leavePeerButton.addEventListener("click", () => {
        room.close();
      });
    }
  });
})();
