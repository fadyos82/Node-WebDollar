import NodesList from 'node/lists/nodes-list'
import consts from "consts/const_global";

class NodeWebPeersDiscoveryService {

    constructor() {

        console.log("NodeWebPeersDiscoveryService constructor");

    }

    startDiscovery(){

        //if a new client || or || web peer is established then, I should register for accepting WebPeer connections
        NodesList.emitter.on("nodes-list/connected", (result) => { this._newSocketRegisterAcceptWebPeers(result) } );

    }

    _newSocketRegisterAcceptWebPeers(nodesListObject){
        //{type: ["webpeer", "client"]}

        if (nodesListObject.type === "webpeer" ||   // signaling service on webpeer
            nodesListObject.type === "client") {

            //client Signaling for WebRTC

            nodesListObject.socket.node.protocol.signaling.client.initializeSignalingClientService();

        }

    }

}

export default new NodeWebPeersDiscoveryService();

