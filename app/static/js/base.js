
function closeDataChannels() {
    console.log('Closing data channels');
    sendChannel.close();
    console.log(`Closed data channel with label: ${sendChannel.label}`);
    if (receiveChannel) {
        receiveChannel.close();
        console.log(`Closed data channel with label: ${receiveChannel.label}`);
    }
    sendConnection.close();
    remoteConnection.close();
    sendConnection = null;
    remoteConnection = null;
    console.log('Closed peer connections');

    // re-enable the file select
    fileInput.disabled = false;
    abortButton.disabled = true;
    sendFileButton.disabled = false;
}

async function setDescriptions(sendConnection) {
    try {
        const offer = await sendConnection.createOffer();
        await sendConnection.setLocalDescription(offer).then(function(){
            getBESocket(rtcSetOfferUrl, sendConnection).then(function(socket){
                const jsonOffer = JSON.stringify(offer);
                socket.send(jsonOffer);
            });
        })
    } catch (e) {
        errorHandler(e);
    }
}

// display bitrate statistics.
async function displayStats() {
    if (remoteConnection && remoteConnection.iceConnectionState === 'connected') {
        const stats = await remoteConnection.getStats();
        let activeCandidatePair;
        stats.forEach(report => {
            if (report.type === 'transport') {
                activeCandidatePair = stats.get(report.selectedCandidatePairId);
            }
        });
        if (activeCandidatePair) {
            if (timestampPrev === activeCandidatePair.timestamp) {
                return;
            }
            // calculate current bitrate
            const bytesNow = activeCandidatePair.bytesReceived;
            const bitrate = Math.round((bytesNow - bytesPrev) * 8 /
                (activeCandidatePair.timestamp - timestampPrev));
            bitrateDiv.innerHTML = `<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`;
            timestampPrev = activeCandidatePair.timestamp;
            bytesPrev = bytesNow;
            if (bitrate > bitrateMax) {
                bitrateMax = bitrate;
            }
        }
    }
}
