/*

 */

let textGroups = []
let currentTextGroup = null

function initVoice() {

    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    let recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = `en-GB`
    
    startVoiceInput = () => {
        if (!currentTextGroup) {
            recognition.start()

            currentTextGroup = new THREE.Group()
            textGroups.push(currentTextGroup)
            scene.add(currentTextGroup)
            currentTextGroup.bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({
                color: 0xCCCCCC,
            }))
            currentTextGroup.bg.scale.set(0., 0., 0.)
            currentTextGroup.bg.position.z = -0.1
            currentTextGroup.add(currentTextGroup.bg)
        }
    }
    endVoiceInput = () => {
        recognition.stop()
        currentTextGroup = null
    }

    recognition.onresult = function (event) {

        if (currentTextGroup === null)
            return

        // log(event.results.length)
        // for(let i = 0; i < event.results.length; i++) {
        //     log(event.results[i])
        // }
        
        let interimTranscript = ``;
        for (let i = 0; i < event.results.length; ++i)
            interimTranscript += event.results[i][0].transcript
        
        interimTranscript = interimTranscript
            .replace(`in a product`, `inner product`)
            .replace(`In a product`, `inner product`)
            .replace(`duo`, `dual`)
            .replace(`duel`, `dual`)

        let linesInclEmpties = interimTranscript.split(/new line |uline |newline |you lying |you line |\n|new line|newline/g)
        let lines = linesInclEmpties.filter(line => line != ``)

        while(lines.length > currentTextGroup.children.length-1) {
            let newLine = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({
                transparent: true
            }))
            newLine.scale.set(0.25, 0.25, 1)
            currentTextGroup.add(newLine)
        }

        lines.forEach((line, index) => {

            let capitalized = line[0].toUpperCase() + line.slice(1)
            let finalLine = lines.length > 1 ? ` - `+capitalized : capitalized

            let mat = text(finalLine, true, 0xFFFFFF)
            let lineMesh = currentTextGroup.children[index+1]
            lineMesh.material.map = mat.map
            lineMesh.scale.x = mat.getAspect() * lineMesh.scale.y
            lineMesh.position.y = - index * 0.22
            lineMesh.position.x = lineMesh.scale.x / 2.
            
            mat.dispose()
            delete mat
        })

        recognition.onerror = function (event) {
            log(`Error occurred in recognition: ` + event.error)
        }
    }
}