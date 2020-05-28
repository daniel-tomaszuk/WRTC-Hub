const SDPTypeKey = "sdp";
const ICETypeKey = "ice";
const actionKey = "action";
const typeKey = "type";

const TCPKey = "tcp";
const UDPKey = "udp";

const answerKey = "answer";
const offerKey = "offer";

// socket payloads
const setAction = "set";
const getAction = "get";

let uuidResourceKey = null;


async function createSignallingSocket(peerConnection, url) {
    `
    Used for connecting with BE web socket. Used for WebRTC signaling / creating connection phase.
    `
    return new Promise(function (resolve, reject) {
        const webSocketConnection = new WebSocket(url);
        webSocketConnection.onopen = function () {
            logMessage('WS OPEN');
            resolve(webSocketConnection);
        };
        webSocketConnection.onerror = function (err) {
            errorHandler(err);
            reject(err);
        };
        webSocketConnection.onclose = function (event) {
            logMessage('WS CLOSE');
            resolve(webSocketConnection);
        }

        webSocketConnection.onmessage = function (message) {
            logMessage('WS MESSAGE');
            logMessage(message);
            handleSocketMessage(webSocketConnection, peerConnection, message);
        };
    });
}

function sendSocketMessage(socket, message, action, type, subType, resourceKey) {
    const socketPayload = JSON.stringify({
        "data": message,
        "action": action,
        "type": type,
        "sub_type": subType,
        "uuid_key": resourceKey
    })
    return new Promise(function (resolve, reject) {
        resolve(socket.send(socketPayload));
    });
}

async function handleSocketMessage(socket, peerConnection, socketMessage) {
    const socketMessageData = JSON.parse(socketMessage.data);

    if (!socketMessageData){
        debugger;
    }

    if ("status" in socketMessageData && socketMessageData["status"] === "accepted") {
        // accepted notification
        return
    }
    // set resource key if it's not present
    if (socketMessageData["uuid_key"] && !uuidResourceKey) {
        uuidResourceKey = socketMessageData["uuid_key"].split(":")[0];
        await peerConnection.setLocalDescription(globalSdpOffer);
    }

    // handle SDP
    if (SDPTypeKey in socketMessageData && peerConnection.remoteDescription == null) {
        // handler SDP offer
        if (socketMessageData[typeKey] === offerKey) {
            await setSDPAnswer(socket, peerConnection, socketMessageData);
            if ("ice_data" in socketMessageData) {
                await addIceCandidates(peerConnection, socketMessageData["ice_data"]);
            }
        }

        // handle SDP answer, ask for ICE candidates
        if (socketMessageData[typeKey] === answerKey) {
            // set received answer as remote description
            await peerConnection.setRemoteDescription(socketMessageData);
            // received answer for SDP, ask for ICE
            await sendSocketMessage(
                socket,
                '',
                getAction,
                ICETypeKey,
                answerKey,
                socketMessageData.uuid_key
            )
        }
    }

    // set received ICE candidates
    if ("ice_data" in socketMessageData && !("sdp" in socketMessageData)) {
        await addIceCandidates(peerConnection, socketMessageData["ice_data"]);
    }

    // handle socket notifications, request resources if required
    if (actionKey in socketMessageData && socketMessageData["action"] === setAction) {
        // notification about offer set - check type of notification and request it if necessary
        const receivedKeyData = unpackCacheKey(socketMessageData["uuid_key"]);
        // request SDP answer when it's ready (on BE notification)
        if (receivedKeyData.type === SDPTypeKey && receivedKeyData.subType === answerKey) {
            if (peerConnection.remoteDescription == null) {
                // ask BE for offer for selected resource
                const socketPayload = {};
                socketPayload[SDPTypeKey] = answerKey;
                await sendSocketMessage(
                    socket,
                    '',
                    getAction,
                    SDPTypeKey,
                    answerKey,
                    receivedKeyData.resourceKey
                );
            }
        }
    }
}
