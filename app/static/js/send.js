'use strict';

let fileReader;


$(document).ready(function () {
    const fileInput = $("#fileInput")[0];
    const abortButton = $("#abortButton")[0];
    const sendFileButton = $("#sendFile")[0];

    abortButton.click(function () {
        if (fileReader && fileReader.readyState === 1) {
            logMessage('Abort read!');
            fileReader.abort();
        }
    });

    // choose file to send
    $(fileInput).on('change', function () {
        const file = fileInput.files[0];
        if (file) {
            // if file has been chosen - allow sending the file
            sendFileButton.disabled = false;
        }
    });

    // create new connection on send button
    $(sendFileButton).click(function () {
        const peerConnection = createPeerConnection().then(function (peerConnection) {
            const peerConnectionDataChannel = createPeerConnectionSendDataChannel(peerConnection).then(function () {
                // set SDP Offer in BE, continue signaling via web sockets
                const sdpOffer = peerConnection.createOffer().then(function (sdpOffer) {
                    peerConnection.setLocalDescription(sdpOffer).then(function () {
                        const jsonMessage = JSON.stringify(sdpOffer);
                        createSignallingSocket(peerConnection, webSocketUrl).then(function (socket) {
                            sendSocketMessage(socket, jsonMessage)
                        })
                    })
                });
            });
        });
    });
});
