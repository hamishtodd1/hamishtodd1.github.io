/*
TODO
    hover the wire and the main view is the klein ball for that point
    Klein balls at the ends of the things
    Just need a little grid on the wires for a few gates
    Two bloch spheres, can just click and edit, ideally snapping to equator, 1, and poles
    Paulis/reflection planes. Click down somewhere and that's one point on the sphere, can drag around and put it somewhere
        Snapping to X, Y, Z, H
    Maaaaaybe phase shift. Circle, snapping to pi/8s
    Rotation of whole thing, including podium, using right mouse
    Then two-qubit gates: the unfolded square from the weyl chamber. Top left of this https://threeplusone.com/pubs/on_weyl.pdf
        Corners are swap, cnot, identity, 
        Come on, probably they'll preserve a screw axis. Signify with that

Futarchy: exceptionally good for transparency

TOSEE (exciting!)
    The bell basis
    Gates
        NOT ("Pauli Z" or w/e)
        CNOT
        Ising coupling
        square root of not
        Tensor product of two states
        CNOT a->b, CNOT b->a, CNOT a->b = swap somehow
        Wasn't there a 3/5 one or something?

People to show when got controls
    Martti
    Chris, Anthony
    QC discord
    Andrew Steane
    Michael Nielsen
    Gavin Crooks

When video done
    A prof who could get you a frickin visa
    Alan Kay
    Emily Adlam
    Sean Carroll
    Tim Blaise
    Grant Sanderson
    Henry minutephysics
    Henry Segerman, Sabetta Matsumoto
    Simon Newey
    Andy Matuschak
    Hestenes
    Paul Simeon
    Future of coding community. Could do one on geometric algebra, one on


For marketing QC companies
    make it so they can make a SUPER nice demo of their alg
    Make it so you can have an array of matrices and can embed a threejs demo

Does taking the transpose correspond to measuring the same thing in a different way? Surely






Could consider the circle on the boundary getting mapped from a certain thing on the plane


Bell pairs are focussed on one qubit too...

For "actual tool", things to try to do:
    known qubit a, unknown b, known entangling gate G. Apply G to (a,b) = known (c,d). Should be able to guess b
    

*/


async function initCircuit() {

    // {
    //     let segmentsAroundTube = 15
    //     let segmentsAroundWhole = 31

    //     let ringGeo = new THREE.TorusGeometry(1., .1, segmentsAroundTube, segmentsAroundWhole)
    //     for (let i = 0; i < segmentsAroundWhole; ++i) {
    //         for (let j = 0; j < segmentsAroundTube; ++j) {
    //     }
    //     }
    //     let a = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({ color: 0xFF0000 }))
    //     scene.add(a)
    // }

    let circuitGates = [[],[]]
    let gatesPerWire = 4
    for(let i = 0; i < gatesPerWire; ++i) {
        circuitGates[0][i] = null
        circuitGates[1][i] = null
    }
    function getWire(gate) {
        if (circuitGates[0].indexOf(gate) !== -1)
            return 0
        else if (circuitGates[1].indexOf(gate) !== -1)
            return 1
        else
            return -1
    }

    function getGatePosition(v, rect) {
        let wireIndex = getWire(rect)
        if (wireIndex === -1)
            return

        // v.x = 0.
        v.z = wires[wireIndex].position.z
        v.y = wires[wireIndex].position.y

        let ourIndexAlong = circuitGates[wireIndex].indexOf(rect)
        let lengthWeUse = wireLength * .94
        let intendedX = (ourIndexAlong + .5) * (lengthWeUse / gatesPerWire) - lengthWeUse / 2.
        v.x += (intendedX - v.x) * .1
    }

    let holder = new THREE.Object3D()
    scene.add(holder)
    holder.position.y = .4
    // holder.scale.setScalar(10.)
    initRectangles(holder)
    let gateDimension = .4
    let ag = arrowGeometry2()
    let am = new THREE.MeshPhongMaterial({ color: 0xFFA500 })
    let shellMat = new THREE.MeshPhongMaterial({ color: 0xAFEEEE, transparent: true, opacity: .5 })
    let shellRadius = gateDimension * .9 * .5
    let shellGeo = new THREE.IcosahedronBufferGeometry(shellRadius, 3)
    function SquareRectangle(params) {

        params.w = gateDimension
        params.h = gateDimension

        params.getPosition = getGatePosition

        let rect = Rectangle(params)
        return rect
    }

    //-----------ROTATION
    let rotators = Array(12)
    {
        let truncatedDiskGeo = new THREE.CircleGeometry(shellRadius,31)
        let truncatedDiskMat = niceMat(0.)
        let width = shellRadius / 2.
        truncatedDiskGeo.vertices.forEach((v,i)=>{
            if (Math.abs(v.x) > width)
                v.x = Math.sign(v.x) * width
        })

        for (let i = 0; i < rotators.length; ++i) {
            let rotator = SquareRectangle({
                onClick: () => {
                    log("this is a rotation")
                }
            })
            rotator.position.y = -999.

            let shell = BlochShell(rotator, {
                during: () => {
                    shell.intersectMouseRay(v1)
                    sp.position.copy(v1)
                }
            })
            let p1 = new THREE.Mesh(truncatedDiskGeo, truncatedDiskMat)
            p1.rotation.x = TAU / 8.
            shell.add(p1)
            let p2 = new THREE.Mesh(truncatedDiskGeo, truncatedDiskMat)
            p2.rotation.x = TAU / 8.
            p2.rotation.y = TAU / 16.
            shell.add(p2)

            rotators[i] = rotator
        }
    }

    function putLowestUnusedGateOnWire(gateArray, wire) {
        mouse.raycaster.intersectZPlane(0., v0)
        let positionAlongWire = v0.x + wireLength / 2.
        let indexInArray = Math.floor( (positionAlongWire / wireLength) * gatesPerWire )
        if (circuitGates[wires.indexOf(wire)][indexInArray] === null) {
            let newGate = gateArray.find(p => getWire(p) === -1 )
            newGate.position.copy(v0)
            circuitGates[wires.indexOf(wire)][indexInArray] = newGate

            if(gateArray === tqgs) {
                circuitGates[1-wires.indexOf(wire)][indexInArray] = newGate
            }

            log(circuitGates)

            return newGate
        }

        return null
    }

    let bgWidth = 3.2
    let bgHeight = 1.5
    let bg = Rectangle({
        w: bgWidth, h: bgHeight,
        getPosition: (p) => {
            p.set(0., 0., -.001)
        }
    })

    function BlochShell(rect, onClick) {

        let shell = new THREE.Mesh(shellGeo, shellMat)
        scene.add(shell)
        thingsToRotate.push(shell)

        updateFunctions.push(() => {
            shell.position.copy(rect.position)
            shell.position.add(holder.position)
            shell.position.add(v0.copy(camera.position).sub(rect.position).setLength(shellRadius))
        })

        if(onClick !== undefined) {
            onClick.z = () => {
                mouse.raycaster.ray.closestPointToPoint(shell.position, v0)
                let rayDistToCenter = v0.distanceTo(shell.position)
                if (rayDistToCenter >= shellRadius)
                    return -Infinity

                let v0ToSurfaceDist = Math.sqrt(shellRadius * shellRadius - rayDistToCenter * rayDistToCenter)
                return v0.distanceTo(camera.position) - v0ToSurfaceDist
            }
            onClicks.push(onClick)
        }

        shell.intersectMouseRay = (target) => {
            mouse.raycaster.ray.closestPointToPoint(shell.position, v0)
            let rayDistToCenter = v0.distanceTo(shell.position)
            if (rayDistToCenter >= shellRadius) {
                target.copy(v0).sub(shell.position).setLength(shellRadius).add(shell.position)
            }
            else {
                let v0ToSurfaceDist = Math.sqrt(shellRadius * shellRadius - rayDistToCenter * rayDistToCenter)

                target.copy(v0).sub(camera.position)
                target.setLength(target.length() - v0ToSurfaceDist)
                target.add(camera.position)
            }

            return target
        }

        return shell
    }

    function blochSphere(rect) {

        let bs = BlochShell(rect)

        let blochVec = new THREE.Mesh(ag, am)
        blochVec.scale.multiplyScalar(shellRadius)
        bs.add(blochVec)

        bs.setLatLon = (lat, lon) => {
            blochVec.rotation.x = TAU / 4. + lat
            blochVec.rotation.y = lon
        }
        bs.getLat = () => blochVec.rotation.x - TAU / 4.
        bs.getLon = () => blochVec.rotation.y

        return bs
    }

    let NUM_QUBITS = 2
    let wires = Array(NUM_QUBITS)
    let padding = .42
    let wireSpacing = (bgHeight - padding * 2.) / (NUM_QUBITS - 1)
    let wireThickness = .03
    let wireLength = 2.2
    let wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    for (let i = 0; i < NUM_QUBITS; ++i) {
        let wire = Rectangle({
            haveFrame: false,
            h: wireThickness,
            w: wireLength,
            mat: wireMaterial,
            getPosition: (p) => {
                p.set(0., 0., 0.)

                p.y -= wireSpacing * (wire.i - (NUM_QUBITS - 1) / 2.)
                p.z = bg.position.z / 2.

                initialStateBox.position.set(
                    wire.position.x - (wire.scale.x / 2. + gateDimension / 2.),
                    wire.position.y,
                    wire.position.z)
                finalStateBox.position.set(
                    wire.position.x + (wire.scale.x / 2. + gateDimension / 2.),
                    wire.position.y,
                    wire.position.z)
            },

            onClick: () => {
                log("yes, clicked wire")
            }
        })
        wire.i = i
        wires[i] = wire

        let initialStateBox = Rectangle({
            w: gateDimension,
            h: gateDimension,
            onClick: () => {
                if (wire.initialState.getLat() > 0.)
                    wire.initialState.setLatLon(-TAU / 4., 0.)
                else
                    wire.initialState.setLatLon(TAU / 4., 0.)
            }
        })
        wire.initialState = blochSphere(initialStateBox)

        let finalStateBox = Rectangle({
            w: gateDimension,
            h: gateDimension
        })
        wire.finalState = blochSphere(finalStateBox)
    }

    let actualState = new ComplexVector(4) //or, matrix? but how to apply?
    updateFunctions.push(() => {
        // actualState[0] = 

        wires.forEach((w)=>{
            w.finalState.setLatLon(w.initialState.getLat(), w.initialState.getLon(),)
        })
    })

    //--------PAULI
    let paulis = Array(12)
    { 
        //you want instaaaaaanced
        let diskGeometry = new THREE.CircleBufferGeometry(shellRadius * .96, 31)
        let diskMat = niceMat(0.)
        for (let i = 0; i < paulis.length; ++i) {
            let pauli = SquareRectangle({
                onClick: () => {
                    log("edit it as a pauli")
                }
            })
            pauli.position.y = -999.

            let shell = BlochShell(pauli, {
                during: () => {
                    shell.intersectMouseRay(v1)
                    sp.position.copy(v1)
                }
            })
            let plane = new THREE.Mesh(diskGeometry, diskMat)
            plane.rotation.x = TAU / 8.
            shell.add(plane)
            
            paulis[i] = pauli
        }
    }

    let indicatorGeometry = new THREE.SphereGeometry(shellRadius / 7.)
    let sp = new THREE.Mesh(indicatorGeometry, new THREE.MeshBasicMaterial({color:0xFF0000}))
    scene.add(sp)

    //-------------TWO QUBITS
    //Are these directional in any sense? Unentangled A,B -> controlled not -> changing B impacts A?
    let tqgs = Array(5)
    {
        for (let i = 0; i < tqgs.length; ++i) {
            let tqg = Rectangle({
                h: wireSpacing + gateDimension,
                w: gateDimension,
                getPosition: (v,rect)=>{
                    getGatePosition(v,rect)
                    if(getWire(rect) !== -1)
                        v.y = 0.
                }
            })

            tqg.x = 0.
            tqg.y = 0.
            //identity, swap, cnot, iSwap/dcnot
            //on way to iSwap you have QFT, Sycamore, 

            let width = gateDimension * .9
            let thingOnTop = Rectangle({
                w: width,
                h: width * Math.sqrt(2.),
                col: 0xFF0000,
                haveFrame: false,
                getPosition: (v) => {
                    v.copy(tqg.position)
                    v.z += .001
                },
                onClick: {
                    during: () => {
                        thingOnTop.mousePosInOurScaledSpace(v0)
                        tqg.x = clamp(v0.x + .5, 0.,1.)
                        tqg.y = clamp(v0.y + .5, 0., 1.)
                    }
                }
            })

            let indicator = new THREE.Mesh(indicatorGeometry, new THREE.MeshBasicMaterial({ color: 0x0000FF }))
            scene.add(indicator)
            updateFunctions.push(() => {
                indicator.position.x = (tqg.x - .5) * thingOnTop.scale.x + thingOnTop.position.x
                indicator.position.y = (tqg.y - .5) * thingOnTop.scale.y + thingOnTop.position.y

                indicator.position.add(holder.position)
            })

            tqg.position.y = -9999.

            tqgs[i] = tqg
        }
    }

    let gateLayingButtons = ["a", "s", "d"]
    let gateTypes = [paulis, rotators, tqgs]
    gateLayingButtons.forEach((key, i)=>{
        let gateArray = gateTypes[i]
        bindButton(key,()=>{
            mouse.raycaster.intersectZPlane(wires[0].position.z , v0)
            v0.y -= holder.position.y
            if (Math.abs(v0.x) < wires[0].scale.x / 2.) {
                let closerWireIndex = Math.abs(v0.y - wires[0].position.y) < Math.abs(v0.y - wires[1].position.y) ? 0 : 1
                let newTqg = putLowestUnusedGateOnWire(gateArray, wires[closerWireIndex])
                if(newTqg !== null)
                    newTqg.position.y = bg.position.y
            }
        })
    })

    roundOffRectangleCreation()
}