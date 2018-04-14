import consts from 'consts/const_global'
import NodesList from 'node/lists/nodes-list'
import NodesType from "node/lists/types/Nodes-Type"

class NodeProtocol {

    /*
        HELLO PROTOCOL
     */
    async sendHello (node, validationDoubleConnectionsTypes) {


        // Waiting for Protocol Confirmation

        let response = node.sendRequestWaitOnce("HelloNode", {
            version: consts.SETTINGS.NODE.VERSION,
            uuid: consts.SETTINGS.UUID,
            nodeType: process.env.BROWSER ? NodesType.NODE_WEB_PEER : NodesType.NODE_TERMINAL
        });

        for (let i=0; i<100; i++)
            node.sendRequest( "HelloNode", {
                version: consts.SETTINGS.NODE.VERSION,
                uuid: consts.SETTINGS.UUID,
                nodeType: process.env.BROWSER ? NodesType.NODE_WEB_PEER : NodesType.NODE_TERMINAL
            });

        response = await response;

        if (typeof response !== "object")
            return false;

        if (response === null || !response.hasOwnProperty("uuid") ){
            console.error("hello received, but there is not uuid", response);
            return false;
        }

        if (response.hasOwnProperty("version")){

            if (response.version < consts.SETTINGS.NODE.VERSION_COMPATIBILITY){
                console.log("hello received, VERSION is not right", response.version, consts.SETTINGS.NODE.VERSION_COMPATIBILITY);
                return false;
            }

            if ( [NodesType.NODE_TERMINAL, NodesType.NODE_WEB_PEER].indexOf( response.nodeType ) === -1 ){
                console.error("invalid node type", response.nodeType);
                return false;
            }

            node.sckAddress.uuid = response.uuid;
            node.protocol.nodeType = response.nodeType;

            //check if it is a unique connection, add it to the list
            let previousConnection = NodesList.searchNodeSocketByAddress(node.sckAddress, "all", validationDoubleConnectionsTypes);

            if ( previousConnection === null ){
                console.log("RECEIVED HELLO NODE BACK", response.version, response.uuid);

                node.protocol.helloValidated = true;
                console.log("hello validated");
                return true;
            } else {
                console.log("hello not validated because double connection");
            }
        }
        //delete socket;
        return false;

    }


    /**
     * boradcast to every sockets except the exceptSockets
     * @param request
     * @param data
     * @param type
     * @param exceptSockets
     */
    broadcastRequest (request, data, type, exceptSockets){

        if (exceptSockets === "all") return false;

        let nodes = NodesList.getNodes(type);

        if (exceptSockets !== undefined && exceptSockets !== null && !Array.isArray(exceptSockets))
            exceptSockets = [exceptSockets];

        //console.log("request nodes.length", nodes.length, request, data, )
        //console.log("nodes.length", nodes.length );

        for (let i=0; i < nodes.length; i++) {

            let broadcast = false;

            if (exceptSockets === undefined) broadcast = true;
            else
            if (Array.isArray(exceptSockets)){

                //console.log("exceptSockets", exceptSockets);

                let found = false;
                for (let j=0; j<exceptSockets.length; j++)
                    if (exceptSockets[j] !== null && nodes[i].socket.node.sckAddress.matchAddress(exceptSockets[j].node.sckAddress, ["uuid"] )) {
                        found = true;
                        break;
                    }

                if (!found)
                    broadcast = true;
            }

            if (broadcast) {
                nodes[i].socket.node.sendRequest(request, data);
            }
        }

    }


}

export default new NodeProtocol();