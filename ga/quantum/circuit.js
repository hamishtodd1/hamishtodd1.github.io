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

    // let circuitGates = [[],[]]
    // let gatesPerWire = 4
    // for(let i = 0; i < gatesPerWire; ++i) {
    //     circuitGates[0][i] = null
    //     circuitGates[1][i] = null
    // }

    let holder = new THREE.Object3D()
    scene.add(holder)
    // holder.scale.setScalar(10.)
    initRectangles(holder)
    let gateDimension = .4
    let ag = arrowGeometry()
    let am = new THREE.MeshPhongMaterial({ color: 0xFFA500 })
    let shellMat = new THREE.MeshPhongMaterial({ color: 0xAFEEEE, transparent: true, opacity: .5 })
    let shellRadius = gateDimension * .9 * .5
    let shellGeo = new THREE.IcosahedronBufferGeometry(shellRadius, 3)
    function SquareRectangle(wire,params) {
        params.w = gateDimension
        params.h = gateDimension

        params.getPosition = (v,rect) => {
            if (rect.wire === null)
                return

            // v.x = 0.
            v.z = rect.wire.position.z
            v.y = rect.wire.position.y
        }

        let rect = Rectangle(params)
        rect.wire = wire
        return rect
    }

    //ROTATION
    // let rotators = Array(12)
    // {
    //     let truncatedDiskGeo = new THREE.CircleGeometry(shellRadius,31)
    //     let width = shellRadius / 2.
    //     truncatedDiskGeo.vertices.forEach((v,i)=>{
    //         if (Math.abs(v.x) > width)
    //             v.x = Math.sign(v.x) * width
    //     })

    //     let a = new THREE.Mesh(truncatedDiskGeo)
    //     scene.add(a)

    //     let mat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })

    //     for (let i = 0; i < rotators.length; ++i) {
    //         let gate = SquareRectangle(null,{
    //             onClick: () => {
    //                 log("this is a rotation")
    //             }
    //         })
    //         gate.position.y = -999.

    //         let shell = BlochShell(gate, {
    //             during: () => {
    //                 shell.intersectMouseRay(v1)
    //                 sp.position.copy(v1)
    //             }
    //         })
    //         let plane = new THREE.Mesh(diskGeometry, mat)
    //         plane.rotation.x = TAU / 8.
    //         shell.add(plane)

    //         rotators[i] = gate
    //     }
    // }
    // return

    function putLowestUnusedGateOnWire(gateArray, wire) {
        let newGate = gateArray.find(p => p.wire === null)
        newGate.wire = wire
        mouse.raycaster.intersectZPlane(0., newGate.position)

        return newGate
    }

    let bgWidth = 3.
    let bgHeight = 1.5
    let bg = Rectangle({
        w: bgWidth, h: bgHeight,
        getPosition: (p) => {
            p.set(0., 0., -.001)
        },
        onClick: () => {
            mouse.raycaster.intersectZPlane(wires[0].position.z , v0)
            if (Math.abs(v0.x) < wires[0].scale.x / 2.) {
                let closerWireIndex = Math.abs(v0.y - wires[0].position.y) < Math.abs(v0.y - wires[1].position.y) ? 0 : 1
                let newTqg = putLowestUnusedGateOnWire(tqgs, wires[closerWireIndex])
                newTqg.position.y = bg.position.y
            }
        }
    })

    function BlochShell(rect, onClick) {

        let shell = new THREE.Mesh(shellGeo, shellMat)
        scene.add(shell)
        thingsToRotate.push(shell)

        updateFunctions.push(() => {
            shell.position.copy(rect.position)
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
    let wireLength = 2.
    let wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    for (let i = 0; i < NUM_QUBITS; ++i) {
        let wire = Rectangle({
            haveFrame: false,
            h: wireThickness,
            w: wireLength,
            mat: wireMaterial,
            getPosition: (p) => {
                p.set(0., 0., 0.)

                p.x += .01
                p.y -= wireSpacing * (wire.i - (NUM_QUBITS - 1) / 2.)
                p.z = bg.position.z / 2.
            },

            onClick: () => {
                putLowestUnusedGateOnWire(paulis, wire)
            }
        })
        wire.i = i
        wires[i] = wire

        let initialStateBox = SquareRectangle(wire,{
            onClick: () => {
                if (initialState.getLat() > 0.)
                    initialState.setLatLon(-TAU / 4., 0.)
                else
                    initialState.setLatLon(TAU / 4., 0.)
            }
        })
        initialStateBox.position.x = wire.position.x - (wire.scale.x / 2. + gateDimension / 2.)
        let initialState = blochSphere(initialStateBox)

        let finalStateBox = SquareRectangle(wire, {})
        finalStateBox.position.x = wire.position.x + (wire.scale.x / 2. + gateDimension / 2.)
        let finalState = blochSphere(finalStateBox)
        updateFunctions.push(() => {
            finalState.setLatLon(initialState.getLat(), initialState.getLon(),)
        })
    }

    //--------PAULI
    let paulis = Array(12)
    {
        //you want instaaaaaanced
        let diskGeometry = new THREE.CircleBufferGeometry(shellRadius * .96, 31)
        let diskMat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
        for (let i = 0; i < paulis.length; ++i) {
            let pauli = SquareRectangle(null,{
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

    let sp = new THREE.Mesh(new THREE.SphereGeometry(shellRadius / 7.), new THREE.MeshBasicMaterial({color:0xFF0000}))
    scene.add(sp)

    //1 to place pauli, 2 to place rotation, 3 for thingy

    //-------------TWO QUBITS
    //Are these directional in any sense? Unentangled A,B -> controlled not -> changing B impacts A?
    let tqgs = Array(5)
    {
        for (let i = 0; i < tqgs.length; ++i) {
            let tqg = Rectangle({
                h: wireSpacing + gateDimension,
                w: gateDimension
            })
            tqg.wire = null

            tqg.position.y = -9999.

            tqgs[i] = tqg
        }
    }

    roundOffRectangleCreation()
}

//better would be generating the vertices first then using them
//but that is barely any better. Really you want a different way of re-using the different arrays in drawing
function arrowGeometry() {
    let shaftRadius = .06

    //ah no no, you want the end to always be the same size
    let headRadius = shaftRadius * 2.5
    let shaftLength = .75

    let vecGeometry = new THREE.Geometry()

    let radialSegments = 15
    let heightSegments = 30 //we want two between y = 0 and y = -shaftRadius
    vecGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
    vecGeometry.faces = Array(radialSegments * heightSegments)

    for (let j = 0; j <= heightSegments; j++) {
        for (let i = 0; i <= radialSegments; i++) {
            v1.y = j <= 8 ?
                shaftRadius * (-1. + j / 8.) :
                j / heightSegments

            v1.x = shaftRadius
            if (v1.y >= shaftLength) {
                let proportionAlongHead = 1. - (v1.y - shaftLength) / (1. - shaftLength)
                v1.x = headRadius * proportionAlongHead
            }
            else if (v1.y <= 0.)
                v1.x = Math.sqrt(sq(shaftRadius) - sq(v1.y))

            v1.z = 0.
            v1.applyAxisAngle(yUnit, i / radialSegments * TAU)
            vecGeometry.vertices[j * (radialSegments + 1) + i] = v1.clone()

            if (i < radialSegments && j < heightSegments) { // there are one fewer triangles along both axes
                vecGeometry.faces[(j * radialSegments + i) * 2 + 0] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 0) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    new THREE.Vector3()
                )
                vecGeometry.faces[(j * radialSegments + i) * 2 + 1] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 0),
                    new THREE.Vector3()
                )
            }
        }
    }

    vecGeometry.computeFaceNormals()
    vecGeometry.computeVertexNormals()

    return vecGeometry
}