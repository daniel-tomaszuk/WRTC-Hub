const SDPTypeKey = "sdp";
const actionKey = "action";
const typeKey = "type";
const answerKey = "answer";
const offerKey = "offer";


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

function sendSocketMessage(socket, message) {
    socket.send(message);
}

async function handleSocketMessage(socket, peerConnection, socketMessage) {
    const socketMessageData = JSON.parse(socketMessage.data);
    debugger;
    if (SDPTypeKey in socketMessageData && peerConnection.remoteDescription == null) {
        if (socketMessageData[typeKey] === offerKey) {
            debugger;
            // if SDP description has been send through BE socket - set it as remote
            // socketMessageData is sdpOffer at this case
            await peerConnection.setRemoteDescription(socketMessageData).then(function () {
                peerConnection.createAnswer().then(function (sdpAnswer) {
                    peerConnection.setLocalDescription(sdpAnswer);
                    const jsonAnswer = JSON.stringify(sdpAnswer);
                    sendSocketMessage(socket, jsonAnswer);
                });
            });
        }

        if (socketMessageData[typeKey] === answerKey) {
            debugger;
            // set received answer as remote description
            await peerConnection.setRemoteDescription(socketMessageData);
        }
    }

    if (actionKey in socketMessageData && typeKey in socketMessageData) {
        // notification about offer set - check type of notification and request it if necessary
        if (socketMessageData[typeKey] === answerKey) {
            // ask BE for offer for selected resource
            const socketPayload = {};
            socketPayload[SDPTypeKey] = answerKey;
            const getOfferPayload = JSON.stringify(socketPayload);
            debugger;
            sendSocketMessage(socket, getOfferPayload)
        }
    }
}
