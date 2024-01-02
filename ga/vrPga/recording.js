
updateRecording = () => {}

function initRecording() {

    let maxFrames = 200
    let currentRecording = null
    let currentStartingHandDq = new Dq()
    let recordings = []
    class Recording {
        constructor() {
            recordings.push(this)

            this.frames = Array(maxFrames)
            for (let i = 0; i < maxFrames; ++i)
                this.frames[i] = new Dq()

            this.viz = new DqViz()
            this.currentFrame = 0
            this.numFrames = 0
        }
    }

    let numFinishFrames = 3
    function finishRecording() {

        let lastRecordedFrame = currentRecording.frames[currentRecording.numFrames-1]
        for (let i = 0; i < numFinishFrames; ++i) {
            let t = i / numFinishFrames
            // debugger
            lastRecordedFrame.slerp(
                currentRecording.frames[0], 
                t,
                currentRecording.frames[currentRecording.numFrames])
            log(currentRecording.frames[currentRecording.numFrames])

            ++currentRecording.numFrames
        }

        currentRecording = null
        console.log('recording stopped')
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            if (currentRecording) {
                finishRecording()
            } else {
                currentRecording = new Recording()
                currentRecording.viz.markupPos.copy(handPosition)
                getHandDq(currentStartingHandDq)

                console.log('recording started')
            }
        }
    })

    updateRecording = () => {
        if (currentRecording) {
            let frame = currentRecording.frames[currentRecording.numFrames]
            getHandDq(dq0).mulReverse(currentStartingHandDq, frame)
            currentRecording.viz.dq.copy(frame)

            if (currentRecording.numFrames === maxFrames - numFinishFrames)
                finishRecording()
            else
                ++currentRecording.numFrames
        }
        
        recordings.forEach(recording => {
            if(recording === currentRecording)
                return

            recording.currentFrame = (recording.currentFrame + 1) % recording.numFrames
            recording.viz.dq.copy(recording.frames[recording.currentFrame])
        })
    }
}