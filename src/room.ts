import Peer, { MeshRoom, RoomStream } from "skyway-js";
import { EventEmitter } from "eventemitter3";

export class Room extends EventEmitter {
  private room: MeshRoom;
  private currentPeerId?: string;
  constructor(
    private peer: Peer,
    localStream: MediaStream,
    roomId: string,
    private $video: HTMLVideoElement,
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

  public changePeer = (peerId: string) => {
    this.currentPeerId = peerId;
  };

  private onStream = async (stream: RoomStream) => {
    this.$video.srcObject = stream;
    await this.$video.play().catch(console.error);
  };

  private onPeerJoin = (peerId: string) => {
    console.log(`=== ${peerId} joined ===`);
    this.peer.listAllPeers(peers => {
      this.emit("onPeerChanged", peers);
    });
  };

  private onPeerLeave = (peerId: string) => {
    console.log(`=== ${peerId} left ===`);
    this.peer.listAllPeers(peers => {
      this.emit("onPeerChanged", peers);
    });
  };

  private onClose = () => {
    console.log("=== You left ===");
    this.$video.srcObject = null;
  };
}
