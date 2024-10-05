console.log("Hello, I'm injected!");

function onAccessApproved(stream) {
    let recorder = new MediaRecorder(stream);

    recorder.start();

    recorder.onstop = () => {
        stream.getTracks().forEach(track => {
            if (track.readyState === "live") {
                track.stop();
            }
        });
    };

    recorder.ondataavailable = event => {
        let recordedBlob = event.data;
        let url = URL.createObjectURL(recordedBlob);

        let a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "screen-recording.webm";

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === "request_recording") {
            console.log("Requesting recording");
            sendResponse(`Processed: ${message.action}`);

            navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: 9999999999,
                    height: 9999999999
                },
                audio: true
            }).then(stream => {
                onAccessApproved(stream);
            }).catch(error => {
                console.error("Error getting display media:", error);
                sendResponse(`Error: ${error.message}`);
            });
        }

        if (message.action === "stopvideo") {
            console.log("Stopping video");
            sendResponse(`Processed: ${message.action}`);
            
            if (!recorder) {
                console.log("No recorder found");
                return;
            }

            recorder.stop();
        }
    } catch (error) {
        console.error("Unexpected error:", error);
        sendResponse(`Error: ${error.message}`);
    }
});
