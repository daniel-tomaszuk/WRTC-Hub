function downloadResource(resourceKey) {
    const peerConnection = createPeerConnection().then(function (returnObject) {
        const peerConnection = returnObject["peerConnection"];
        const socket = returnObject["socket"];
        const peerConnectionDataChannel = createPeerConnectionReceiveDataChannel(peerConnection).then(function () {
            // when user clicks on download link - request SDP offer from BE, continue signaling via web sockets
            uuidResourceKey = resourceKey.split(":")[0];
            getSDPOffer(socket, uuidResourceKey);
        });
    });
}
