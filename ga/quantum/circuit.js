async function initCircuit() {

    let circuitJson;
    {
        await new Promise(resolve => {
            let xhr = new XMLHttpRequest()
            xhr.open("GET", "quirkExample.json", true)
            xhr.onload = function (e) {
                circuitJson = JSON.parse(xhr.response)
                resolve()
            }
            xhr.onerror = function () {
                console.error(fullFileName, "didn't load")
            }
            xhr.send()
        })
    }
    log(circuitJson)

    // for (let i = 0, il = circuitJson.cols.length; i < il; ++i) {

    // }

    let myThing = new THREE.Object3D()
    scene.add(myThing)
    myThing.scale.setScalar(10.)
    initRectangles(myThing)

    let bgWidth = .3
    let bgHeight = .2
    let bg = Rectangle({
        haveFrame: true,
        w: bgWidth, h: bgHeight,
        getPosition: (p) => {
            p.set(0., 0., -.001)
        },
        onClick: () => {
            // log("yo")
        }
    })

    // percentageDisplay.textMeshes[0].material.setText(

    let gridDimension = .04
    function SymbolRectangle(params) {
        params.frameThickness = .002
        params.w = gridDimension
        params.h = gridDimension
        return Rectangle(params)
    }

    function setRectText(rect,t) {
        rect.textMeshes[0].material.setText(t)
    }

    // let strings = [
    //     "|0>", "|1>", "H", "S", "T", "⊕"
    // ]
    // let symbolBoxes = []

    // strings.forEach((str, i) => {
    //     let rect = SymbolRectangle(str)
    //     symbolBoxes.push(rect)
    // })
    // updateFunctions.push(() => {
    //     symbolBoxes.forEach((sb, i) => {
    //         sb.position.copy(rightHand.position)
    //         sb.position.x += .12 * i
    //     })
    // })

    

    let gateMeshes = {
        H: [], Swap: [],
        X: [], Y: [], Z: [],
        CNOT: [],
    }
    let NUM_GATES_EACH = 20
    for (gm in gateMeshes) {
        for (let i = 0; i < NUM_GATES_EACH; ++i) {
            gateMeshes[gm][i] = SymbolRectangle({ label: gm })
        }
    }

    //try out visualization of C^2 first

    let NUM_QUBITS = circuitJson.init.length
    let wires = Array(NUM_QUBITS)
    let padding = .04
    let wireSpacing = (bgHeight - padding * 2.) / (NUM_QUBITS-1)
    let wireThickness = .003
    let wireLength = .2
    let wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    let possibleInitialStates = ["0","1","+","-"]
    for(let i = 0; i < NUM_QUBITS; ++i) {
        wires[i] = Rectangle({
            h: wireThickness,
            w: wireLength,
            mat: wireMaterial,
            getPosition: (p) => {
                p.set(0.,0.,0.)

                p.x += .01
                p.y -= wireSpacing * (wire.i - (NUM_QUBITS-1) / 2.)
            }
        })

        let wire = wires[i]
        wire.i = i

        wire.initialState = SymbolRectangle({
            label: "|" + circuitJson.init[i] + ">",
            onClick: () => {
                let newIndex = (possibleInitialStates.indexOf(wire.initialState.val) + 1) % possibleInitialStates.length
                wire.initialState.val = possibleInitialStates[newIndex]
                setRectText(wire.initialState, "|" + wire.initialState.val + ">")
            },
            getPosition:(v)=>{
                v.z = 0.
                v.x = wire.position.x - wire.scale.x / 2. - gridDimension / 2.
                v.y = wire.position.y
            }
        })
        wire.initialState.val = circuitJson.init[i]
    }

    roundOffRectangleCreation()
}