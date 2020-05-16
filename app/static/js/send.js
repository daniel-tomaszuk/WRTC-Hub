'use strict';

let fileReader;


$(document).ready(function () {
    const fileInput = $("#fileInput")[0];
    const abortButton = $("#abortButton")[0];
    const sendProgress = $("#sendProgress")[0];
    const statusMessage = $("#status")[0];
    const sendFileButton = $("#sendFile")[0];

    abortButton.click(function () {
        if (fileReader && fileReader.readyState === 1) {
            debugger;
            console.log('Abort read!');
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
        const tmp_promise = createConnection();
    });
});

async function createConnection() {

    const localConnection = new RTCPeerConnection();
    const remoteConnection = new RTCPeerConnection();

    // remote connection - receiver trigger!!
    remoteConnection.addEventListener('datachannel', receiveChannelCallback);
    remoteConnection.addEventListener('icecandidate', async event => {
         // triggered by setRemoteDescription
        debugger;
        console.log('Remote ICE candidate: ', event.candidate);
        const tmp_promise = await localConnection.addIceCandidate(event.candidate);
    });

    localConnection.addEventListener('icecandidate', async event => {
        // triggered by setRemoteDescription
        debugger;
        console.log('Local ICE candidate: ', event.candidate);
        const tmp_promise = await remoteConnection.addIceCandidate(event.candidate);
    });


    const sendChannel = localConnection.createDataChannel('sendDataChannel');
    sendChannel.binaryType = 'arraybuffer';

    console.log('Created send data channel');
    sendChannel.addEventListener('open', checkStateAndSendData(sendChannel.readyState));
    sendChannel.addEventListener('close', checkStateAndSendData(sendChannel.readyState));
    sendChannel.addEventListener('error', error => errorHandler(error));
    console.log('Created remote peer connection object remoteConnection');

    try {
        debugger;
        const tmp_promise = await setDescriptions(localConnection, remoteConnection);
        debugger;
    } catch (e) {
        errorHandler(e);
    }
}


function checkStateAndSendData(sendChannelState) {
    console.log(`Send channel state is: ${sendChannelState}`);
    if (sendChannelState === 'open') {
        debugger;
        sendData();
    }
}

function sendData() {
    const bitrateDiv = $("#bitrate")[0];
    const file = fileInput.files[0];
    console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

    // Handle 0 size files.
    statusMessage.textContent = '';
    downloadAnchor.textContent = '';
    if (file.size === 0) {
        bitrateDiv.innerHTML = '';
        statusMessage.textContent = 'File is empty, please select a non-empty file';
        closeDataChannels();
        return;
    }

    debugger;
    sendProgress.max = file.size;
    // receiveProgress.max = file.size;
    debugger;
    const chunkSize = 16384;
    fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));

    fileReader.addEventListener('load', e => {
        console.log('FileRead.onload ', e);
        sendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        sendProgress.value = offset;
        if (offset < file.size) {
            readSlice(offset);
        }
    });

    const readSlice = o => {
        console.log('readSlice ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
}
