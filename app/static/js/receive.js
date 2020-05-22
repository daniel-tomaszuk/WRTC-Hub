function downloadResource(resourceKey) {
    const peerConnection = createPeerConnection().then(function (peerConnection) {
        const peerConnectionDataChannel = createPeerConnectionReceiveDataChannel(peerConnection).then(function () {
            // when user clicks on download link - request SDP offer from BE, continue signaling via web sockets
            createSignallingSocket(peerConnection, webSocketUrl).then(function (socket) {
                const socketPayload = {};
                socketPayload[SDPTypeKey] = resourceKey;
                const jsonMessage = JSON.stringify(socketPayload);
                sendSocketMessage(socket, jsonMessage);
            })
        });
    });
}
