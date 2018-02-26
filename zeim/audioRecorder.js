//yeah, wav is pretty big, but it streams.

function initAudioRecorder(audio)
{
    var audioRecorder = {};
    var internalRecorder;

    var onSuccess = function(s)
    {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(s);
        internalRecorder = new Recorder(mediaStreamSource);
        internalRecorder.record();
    }

    var onFailure = function(e)
    {
        console.log("Couldn't get user media", e);
    }

    audioRecorder.startRecording = function()
    {
        navigator.getUserMedia({audio: true}, onSuccess, onFailure);
    }

    audioRecorder.stopRecording = function()
    {
        internalRecorder.stop();
    }

    audioRecorder.sendRecording = function()
    {
        internalRecorder.exportWAV(function(blob)
        {
            var url = window.URL.createObjectURL(blob);
            audio.src = url;
            var downloadObject = document.createElement("a");
            document.body.appendChild(downloadObject);
            downloadObject.style = "display: none";
            downloadObject.href = url;
            downloadObject.download = "record";
            downloadObject.click();
        });
    }

    return audioRecorder;
}