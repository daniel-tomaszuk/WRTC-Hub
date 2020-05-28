'use strict';

let fileReader;
let globalSdpOffer = null;

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
        // brace yourself and enter callback hell!
        createPeerConnection().then(function (returnObject) {
            const peerConnection = returnObject["peerConnection"];
            const socket = returnObject["socket"];
            createPeerConnectionSendDataChannel(peerConnection).then(function () {
                // set SDP Offer in BE, continue signaling via web sockets
                peerConnection.createOffer().then(function (sdpOffer) {
                    globalSdpOffer = sdpOffer;
                    sendSocketMessage(socket, sdpOffer, setAction, SDPTypeKey, offerKey);
                });
            });
        });
    });
});
