import Peer, { MeshRoom, RoomStream } from "skyway-js";
import { EventEmitter } from "eventemitter3";

export class Room extends EventEmitter {
  private room: MeshRoom;
  constructor(
    private peer: Peer,
    localStream: MediaStream,
    roomId: string,
    private $videoContainer: HTMLDivElement,
    videoReceiveEnabled: boolean = false
  ) {
    super();
    this.room = peer.joinRoom(roomId, {
      mode: "mesh",
      stream: localStream,
      videoReceiveEnabled
    });

    this.room.once("open", () => console.log("=== You joined ==="));
    this.room.on("stream", this.onStream);
    this.room.once("peerJoin", this.onPeerJoin);
    this.room.on("peerLeave", this.onPeerLeave);
    this.room.once("close", this.onClose);
  }

  public close = () => {
    this.room.close();
  };

  public changePeer = (targetPeerId: string) => {
    Array.from(this.$videoContainer.children).forEach($element => {
      const $video = $element as HTMLVideoElement;
      const peerId = $video.dataset.peerId;
      $video.style.display = targetPeerId === peerId ? "block" : "none";
    });
  };

  private onStream = async (stream: RoomStream) => {
    const $video = document.createElement("video") as HTMLVideoElement;
    const peerId = stream.peerId;
    $video.srcObject = stream;
    $video.className = "video";
    $video.dataset.peerId = peerId;
    const observer = new MutationObserver(() => {
      if ($video.style.display !== "none") {
        console.log(`=== ${peerId} show ===`);
        $video.play();
      } else {
        console.log(`=== ${peerId} hide ===`);
        $video.pause();
      }
    });
    observer.observe($video, { attributes: true });
    this.$videoContainer.append($video);
    await $video.play().catch(console.error);
  };

  private onPeerJoin = (peerId: string) => {
    console.log(`=== ${peerId} joined ===`);

    this.peer.listAllPeers(peers => {
      this.emit("onPeerChanged", peers);
    });
  };

  private onPeerLeave = (peerId: string) => {
    console.log(`=== ${peerId} left ===`);
    const $element = this.$videoContainer.querySelector(
      `[data-peer-id=${peerId}]`
    );
    if ($element) {
      const $video = $element as HTMLVideoElement;
      let stream = <MediaStream>$video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      $video.remove();
      this.peer.listAllPeers(peers => {
        this.emit("onPeerChanged", peers);
      });
    }
  };

  private onClose = () => {
    console.log("=== You left ===");
    Array.from(this.$videoContainer.children).forEach($element => {
      const $video = $element as HTMLVideoElement;
      let stream = <MediaStream>$video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      $video.remove();
    });
  };
}
