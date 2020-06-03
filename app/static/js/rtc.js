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

    dataChannel.onopen = checkStateAndSendData;
    dataChannel.onclose = checkStateAndSendData;
    dataChannel.onmessage = function(event) {
        logMessage(event);
    };
    dataChannel.addEventListener('error', error => errorHandler(error));
    return dataChannel
}

async function createPeerConnectionReceiveDataChannel(peerConnection) {
    peerConnection.addEventListener('datachannel', receiveChannelCallback);
}

async function setSDPAnswer(socket, peerConnection, sdpOffer) {
    await peerConnection.setRemoteDescription(sdpOffer).then(function () {
        peerConnection.createAnswer().then(function (sdpAnswer) {
            sendSocketMessage(socket, sdpAnswer, setAction, SDPTypeKey, answerKey, uuidResourceKey).then(function () {
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
    if (iceData.includes(TCPKey)) {
        iceSubType = TCPKey;
    } else if (iceData.includes(UDPKey)) {
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


function logMessage(message) {
    console.log(`Logger ${moment().format()}:\n`);
    console.log(message);
}

// --------------------------------------------
function checkStateAndSendData() {
    logMessage(`Send channel state is: ${this.readyState}`);
    if (this.readyState === 'open') {
        sendData(this);
    }
}

function sendData(sendChannel) {
    const fileInput = $("#fileInput")[0];
    const sendProgress = $('#sendProgress')[0];
    const file = fileInput.files[0];
    logMessage(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

    // Handle 0 size files.
    if (file.size === 0) {
        window.alert('File size is 0. Choose other file.')
        closeDataChannels();
        return;
    }
    sendProgress.max = file.size;
    tmpFileSize = file.size;
    // receiveProgress.max = file.size;
    // const chunkSize = 16384;
    const chunkSize = 99999999999999;  // force one chunk for now
    fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));

    fileReader.addEventListener('load', event => {
        logMessage('FileRead.onload ', event);
        sendChannel.send(event.target.result);
        offset += event.target.result.byteLength;
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
    receiveChannel.onmessage = onReceiveMessageCallback;  // when data is being received by data channel
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
    const receiveProgress = $("#receiveProgress")[0];
    let receiveBuffer = [];
    let receivedSize = 0;
    console.log(`Received Message ${event.data.byteLength}`);
    receiveBuffer.push(event.data);
    receivedSize += event.data.byteLength;
    receiveProgress.value = receivedSize;
    // TODO: assume signaling protocol told about the expected file size (and name, hash, etc).
    debugger;
    if (receivedSize > 0) {
        debugger;
        const downloadAnchor = $("#download")[0];
        const received = new Blob(receiveBuffer);
        receiveBuffer = [];
        downloadAnchor.href = URL.createObjectURL(received);
        downloadAnchor.download = 'strange_file';
        downloadAnchor.textContent =
            `Click to download something ;) - (${receivedSize} bytes)`;
        downloadAnchor.style.display = 'block';
        debugger;
        // TODO: display some stats
        closeDataChannels();
    }
}

async function onReceiveChannelStateChange(event) {
    logMessage(`Channel readyState: ${this.readyState}`)
}
