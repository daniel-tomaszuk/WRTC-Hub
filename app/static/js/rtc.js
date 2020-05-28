const dataChannelLabel = "rtcDataChannel";
const dataChannelBinaryType = "arraybuffer";


async function createPeerConnection() {
    const peerConnection = new RTCPeerConnection();
    return createSignallingSocket(peerConnection, webSocketUrl).then(function (socket) {
        peerConnection.addEventListener('icecandidate', async event => {
            // triggered by setLocalDescription
            logMessage('Local ICE candidate: ', event.candidate);
            await setICEDescription(socket, event.candidate)
        });
        return {
            "socket": socket,
            "peerConnection": peerConnection
        }
    });
}


async function createPeerConnectionSendDataChannel(peerConnection) {
    const dataChannel = peerConnection.createDataChannel(dataChannelLabel);
    dataChannel.binaryType = dataChannelBinaryType;
    dataChannel.addEventListener('open', checkStateAndSendData(dataChannel.readyState));
    dataChannel.addEventListener('close', checkStateAndSendData(dataChannel.readyState));
    dataChannel.addEventListener('error', error => errorHandler(error));
    return dataChannel
}

async function createPeerConnectionReceiveDataChannel(peerConnection) {
    peerConnection.addEventListener('datachannel', receiveChannelCallback);
}

async function setSDPAnswer(socket, peerConnection, sdpOffer) {
    await peerConnection.setRemoteDescription(sdpOffer).then(function () {
        peerConnection.createAnswer().then(function (sdpAnswer) {
            sendSocketMessage(socket, sdpAnswer, setAction, SDPTypeKey, answerKey, uuidResourceKey).then(function(){
                peerConnection.setLocalDescription(sdpAnswer);
            });
        });
    });
}

function getSDPOffer(socket, resourceKey) {
    sendSocketMessage(socket, '', getAction, SDPTypeKey, offerKey, resourceKey);
}

async function setICEDescription(socket, iceCandidate) {
    // remote part must set this candidate with `addIceCandidate` method
    let iceSubType = null;
    const iceData = JSON.stringify(iceCandidate);
    if (iceData.includes(TCPKey)){
        iceSubType = TCPKey;
    } else if (iceData.includes(UDPKey)){
        iceSubType = UDPKey;
    }
    await sendSocketMessage(socket, iceData, setAction, ICETypeKey, iceSubType, uuidResourceKey)
}

async function addIceCandidates(peerConnection, candidatesData) {
    // remote part must set this candidate with `addIceCandidate` method
    $.each(candidatesData, function (index, candidate) {
        if (candidate && candidate !== "null") {
            const candidateDict = JSON.parse(candidate);
            peerConnection.addIceCandidate(candidateDict);
        }
    })
}

function unpackCacheKey(cacheKey) {
    const splitChar = ":";
    const resourceKey = cacheKey.split(splitChar)[0];
    const keyType = cacheKey.split(splitChar)[1];
    const keySubType = cacheKey.split(splitChar)[2];
    return {
        "resourceKey": resourceKey,
        "type": keyType,
        "subType": keySubType
    }
}

function errorHandler(error) {
    console.log('An error occurred!\n')
    console.log(error);

}


function logMessage(message){
    console.log(`Logger ${moment().format()}:\n`);
    console.log(message);
}



// TODO: refactor code below
// --------------------------------------------
function checkStateAndSendData(sendChannelState) {
    logMessage(`Send channel state is: ${sendChannelState}`);
    if (sendChannelState === 'open') {
        debugger;
        sendData();
    }
}

function sendData() {
    const bitrateDiv = $("#bitrate")[0];
    const file = fileInput.files[0];
    logMessage(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

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
        logMessage('FileRead.onload ', e);
        sendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        sendProgress.value = offset;
        if (offset < file.size) {
            readSlice(offset);
        }
    });

    const readSlice = o => {
        logMessage('readSlice ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
}


function receiveChannelCallback(event) {
    const receiveChannel = event.channel;
    receiveChannel.binaryType = dataChannelBinaryType;
    receiveChannel.onmessage = onReceiveMessageCallback;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;
    const receivedSize = 0;
    const bitrateMax = 0;
    const downloadAnchor = $("#download")[0];
    downloadAnchor.textContent = '';
    downloadAnchor.removeAttribute('download');
    if (downloadAnchor.href) {
        URL.revokeObjectURL(downloadAnchor.href);
        downloadAnchor.removeAttribute('href');
    }
}


function onReceiveMessageCallback(event) {
    console.log(`Received Message ${event.data.byteLength}`);
    receiveBuffer.push(event.data);
    receivedSize += event.data.byteLength;

    receiveProgress.value = receivedSize;

    // we are assuming that our signaling protocol told
    // about the expected file size (and name, hash, etc).
    const file = fileInput.files[0];
    if (receivedSize === file.size) {
        const received = new Blob(receiveBuffer);
        receiveBuffer = [];

        downloadAnchor.href = URL.createObjectURL(received);
        downloadAnchor.download = file.name;
        downloadAnchor.textContent =
            `Click to download '${file.name}' (${file.size} bytes)`;
        downloadAnchor.style.display = 'block';

        const bitrate = Math.round(receivedSize * 8 /
            ((new Date()).getTime() - timestampStart));
        bitrateDiv.innerHTML =
            `<strong>Average Bitrate:</strong> ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`;

        if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
        }

        closeDataChannels();
    }
}

async function onReceiveChannelStateChange() {
    const readyState = receiveChannel.readyState;
    console.log(`Receive channel state is: ${readyState}`);
    if (readyState === 'open') {
        timestampStart = (new Date()).getTime();
        timestampPrev = timestampStart;
        statsInterval = setInterval(displayStats, 500);
        await displayStats();
    }
}
