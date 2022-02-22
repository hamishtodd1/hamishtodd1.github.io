/*
TODO
    hover the wire and the main view is the klein ball for that point
        Maybe even an animation
    Paulis/reflection planes. Click down somewhere and that's one point on the sphere, can drag around and put it somewhere
    Phase shift. Circle, snapping to pi/8s
    Talk to Grant Sanderson, Steve Mould, Dominic about script
    Measurement gate

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

Maybe what you really want is an animation, or something that accentuates
What do "changes of basis" look like for the klein ball?
Might be good to make, from arsenovich's gates, direct controls
You probably will need some that kiss on the boundary
Why no sqrt(Y)? Probably because there is one, but it rotates in a way where you can't see it
In some sense you might want a transformation such that you can do particular things with sets of bloch vectors

Futarchy: exceptionally good for transparency

For marketing QC companies
    make it so they can make a SUPER nice demo of their alg
    Make it so you can have an array of matrices and can embed a threejs demo

Does taking the transpose correspond to measuring the same thing in a different way? Surely

Philosophizing
    When you apply a pauli, the qubit has become entangled with the fact that there was a pauli-applier there and with that configuration
        That IS surely another kind of entanglement, which from your point of view looks like the qubit has continued to be mundane
    The sphere is... so featureless. True and false really are "just" directions
    A way to test that this is a good idea:
        known qubit a, unknown b, known entangling gate G. Apply G to (a,b) = known (c,d). Should be able to guess b
    Bell pairs seem focussed on one qubit too
    it's also like crossed pieces of wood for fencing that you can flex
    That the world is made of entanglements tells you that knowledge in your head is not there at a particular time due to computational complexity
        Every line in a logical argument is another fact becoming entangled with the facts already there
        Your mind has to expend energy to have the series of thoughts
        Yes, the thought process is probably logical (except you do make errors!).
        But that doesn't mean that the maths applies "all at once"
        In hardware design we have this function called "fetch". You wouldn't encounter fetch.

People to show when got controls
    Martti
        Ask him if he knows anyone in Cam
    Chris, Anthony
    QC discord
    Andrew Steane
    Michael Nielsen
    Basil Hiley
    Cambridge
        Jeremy Butterfield jb56@cam.ac.uk
        Ask Emily Adlam for others in town

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
    let maxGatesPerWire = 4
    for(let i = 0; i < maxGatesPerWire; ++i) {
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
        let intendedX = (ourIndexAlong + .5) * (lengthWeUse / maxGatesPerWire) - lengthWeUse / 2.
        v.x += (intendedX - v.x) * .1
    }

    let holder = new THREE.Object3D()
    scene.add(holder)
    // holder.position.y = .4
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

    let littleBallGeometry = new THREE.SphereGeometry(shellRadius / 7.)
    let sp = new THREE.Mesh(littleBallGeometry, new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
    scene.add(sp)
    sp.position.y -= 999.

    //-----------ROTATION
    let rotators = Array(12)
    {
        // if(0)
        //drag moves it around, it's a 180/axis. Hold spacebar and it holds the thing in place and becomes a rotation
        let editingAngle = false
        bindButton("q",()=>{
            editingAngle = true
        },"",()=>{},false,()=>{
            editingAngle = false
        })

        let axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., -shellRadius, 0.), new THREE.Vector3(0., shellRadius, 0.)])
        let axisMat = new THREE.LineBasicMaterial({ color: 0x000000 })
        let fanTopMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide })
        let fanBottomMat = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.DoubleSide })

        let numSegments = 14
        let fanFaces = []
        //using the clockwiseness of this may well make sense
        for (let i = 0; i < numSegments; ++i) {
            fanFaces.push(new THREE.Face3(i+2, i+1, 0))
        }
        
        for (let i = 0; i < rotators.length; ++i) {
            let rotator = SquareRectangle({
                onClick: () => {
                    log("this is a rotation")
                }
            })
            rotator.position.y = -999.
            rotators[i] = rotator

            let pauliCoords = new THREE.Vector3(1., 1., 0.) //initialized to hadamard
            let thetaOverTau = .5
            updateFunctions.push(() => {
                pauliCoords.normalize()
                setRotationallySymmetricMatrix(pauliCoords.x, pauliCoords.y, pauliCoords.z, axisAndFan.matrix)
            })

            rotator.getMatrix = (target) => {
                
                c2m1.copy(zero2x2)

                c2m0.copy(pauli1)
                c2m0.multiplyScalar(-pauliCoords.x)
                c2m1.add(c2m0)

                c2m0.copy(pauli2)
                c2m0.multiplyScalar(pauliCoords.z)
                c2m1.add(c2m0)

                c2m0.copy(pauli3)
                c2m0.multiplyScalar(-pauliCoords.y)
                c2m1.add(c2m0)

                let theta = thetaOverTau * TAU
                let minusHalfthetaI = new Complex(0., -theta / 2.)
                c2m1.multiplyComplex(minusHalfthetaI)
                delete minusHalfthetaI

                c2m1.exp(target)

                //maybe you want to exponentiate?
                return target
            }

            let shell = BlochShell(rotator, {
                during: () => {
                    if(!editingAngle) {
                        shell.intersectMouseRay(pauliCoords)
    
                        landmarkframe.position.copy(shell.position)
                        landmarkframe.updateMatrixWorld()
                        landmarkframe.worldToLocal(pauliCoords)
                        landmarkframe.children.forEach((landmark) => {
                            if (pauliCoords.distanceTo(landmark.position) < shellRadius / 6.)
                                pauliCoords.copy(landmark.position)
                        })
                    }
                    else {
                        mouse.getZZeroPosition(v1)
                        thetaOverTau = 1.4 * v1.distanceTo(rotator.position)
                        while (thetaOverTau < -.5)
                            thetaOverTau += 1.
                        while (thetaOverTau > .4)
                            thetaOverTau -= 1.
                        for(let i = -.5; i <= .5; i += .125) {
                            if (Math.abs(thetaOverTau -i) < .04)
                                thetaOverTau = i
                        }
                    }
                },
                end: () => {
                    landmarkframe.position.set(0., -999999., 0.)
                }
            })

            let fanVerts = Array(numSegments)
            let fanGeo = new THREE.Geometry()
            fanGeo.vertices = fanVerts
            fanGeo.faces = fanFaces
            for (let i = 0; i < numSegments + 2; ++i)
                fanVerts[i] = new THREE.Vector3()

            let axisAndFan = new THREE.Object3D()
            scene.add(axisAndFan)
            updateFunctions.push(() => {
                let theta = thetaOverTau * TAU
                for (let i = 0; i < numSegments + 1; ++i) {
                    let ourAngle = i / numSegments * theta
                    fanVerts[i + 1].set(shellRadius, 0., 0.)
                    fanVerts[i + 1].applyAxisAngle(yUnit, ourAngle)
                }
                fanGeo.verticesNeedUpdate = true
            })
            let axis = new THREE.LineSegments(axisGeo, axisMat)
            axisAndFan.add(
                new THREE.Mesh(fanGeo, fanTopMat),
                // new THREE.Mesh(fanGeo, fanBottomMat),
                axis
            )
            axisAndFan.children[0].position.y += .001
            shell.add(axisAndFan)
            axisAndFan.matrixAutoUpdate = false
        }
    }

    function putLowestUnusedGateOnWire(gateArray, wireIndex, indexInArray) {

        //HACK because we don't understand how to reverse a 4x4 we say all tqgs are in a certain direction
        if(gateArray === tqgs && wireIndex === 1)
            wireIndex = 0

        mouse.raycaster.intersectZPlane(0., v0)
        let positionAlongWire = v0.x + wireLength / 2.

        if(indexInArray === undefined)
            indexInArray = Math.floor( (positionAlongWire / wireLength) * maxGatesPerWire )
        if (circuitGates[wireIndex][indexInArray] === null) {
            let newGate = gateArray.find(p => getWire(p) === -1 )
            circuitGates[wireIndex][indexInArray] = newGate

            if(gateArray === tqgs)
                circuitGates[1-wireIndex][indexInArray] = null
            else {
                if (tqgs.indexOf(circuitGates[1 - wireIndex][indexInArray]) !== -1)
                    circuitGates[1 - wireIndex][indexInArray] = null
            }

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

    function BlochSphere(rect) {

        let bs = BlochShell(rect)

        let blochVec = new THREE.Mesh(ag, am)
        // blochVec.scale.multiplyScalar(shellRadius)
        blochVec.matrixAutoUpdate = false
        blochVec.matrix.multiplyScalar(shellRadius)
        blochVec.matrix.elements[15] = 1.
        bs.add(blochVec)

        bs.setVisibility = (newVisibility) => {
            bs.visible = newVisibility
            blochVec.visible = newVisibility
        }
        
        bs.setFrom2Vec = (numerator,denominator) => {
            complexToSphere(numerator, denominator, mv0)
            
            //maybe better way to do it
            // mv0[11] = 1.
            // let arrowPointingUpMv = mv1.point(0., 1., 0., 1.)
            // let ourRotor = mv2
            // arrowPointingUpMv.mul(mv0, ourRotor)
            // ourRotor.sqrtBiReflection(ourRotor)
            // ourRotor.toQuaternion(blochVec.quaternion)

            setRotationallySymmetricMatrix(mv0[14], mv0[13], mv0[12], blochVec.matrix)
            blochVec.matrix.multiplyScalar(shellRadius)
            blochVec.matrix.elements[15] = 1.
        }

        return bs
    }

    function CombinedBsKb(rect) {
        let bsKb = {}

        let kb = KleinBall()
        let bs = BlochSphere(rect)

        scene.add(kb)
        kb.scale.setScalar(shellRadius)
        updateFunctions.push(() => {
            kb.position.copy(rect.position)
            kb.position.add(holder.position)
            kb.position.add(v0.copy(camera.position).sub(rect.position).setLength(shellRadius))
        })

        bsKb.setFromAbcd = (a,b,c,d) => {
            let det = a.mul(d, c0).sub(b.mul(c, c1))
            if(frameCount === 1)
                log(det, det.approximatelyEquals(zeroComplex))

            //infinity gets mapped to a/c, 0 gets mapped to b/d
            //is it a choice of projection which one is infinity and which is 0?

            //it's problematic to have an if statement
            if (det.approximatelyEquals(zeroComplex)) {
                bs.setVisibility(true)
                kb.setVisibility(false)

                //ad = bc
                //a/b=c/d

                //ordinary:
                // 00 01
                // 10 11

                //here:
                // 00 10
                // 01 11

                //what you usually have:
                // 00 + 01 //probability of 0a
                // 10 + 11 //probability of 1a
                //what you want:
                // 00 + 10 //probability of 0b - should be 1. Square and add? Probably. This is why you have the silliness
                // 01 + 11 //probability of 1b

                //could use a/c or b/d. They're equal unless B is 100% known
                //Want whichever will give the most precision. That's probably the one where the magnitudes are higher

                //this is a temporary measure until we find a change of basis that puts more variability in a/c
                //but it "should" work because they should be the same
                if (a.squaredMagnitude() + c.squaredMagnitude() > b.squaredMagnitude() + d.squaredMagnitude() ) {
                    bs.setFrom2Vec(c, a)
                }
                else {
                    bs.setFrom2Vec(d, b)
                }

                // let aPlusB = new Complex().copy(a).add(b)
                // let cPlusD = new Complex().copy(c).add(d)
                // //so this is a density matrix
                // //under what circumstances is and isn't this equal to a/c?
                // bs.setFrom2Vec(cPlusD,aPlusB)
                // delete aPlusB
                // delete cPlusD
                // //sounds more like what z = 1 gets sent to
            }
            else {
                bs.setVisibility(false)
                kb.setVisibility(true)

                abcdToMotor(a, b, c, d, kb.stateMotor)
            }
        }

        return bsKb
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
                // if (initialStateBs.getLat() > 0.)
                //     initialStateBs.setLatLon(-TAU / 4., 0.)
                // else
                //     initialStateBs.setLatLon(TAU / 4., 0.)

                // if (initialState.el[0].re === 0. ) {
                //     initialState.el[0].re = 1.
                //     initialState.el[1].re = 0.
                // }
                // else {
                //     initialState.el[0].re = 0.
                //     initialState.el[1].re = 1.
                // }
                initialState.applyMatrix(pauli1)
                initialState.log()
            }
        })
        let initialState = new ComplexVector(2)
        wire.initialState = initialState
        // initialState.el[1].im = 1./Math.SQRT2
        // initialState.el[0].re = 1./Math.SQRT2
        initialState.el[0].re = 1.
        let initialStateBs = new BlochSphere(initialStateBox)

        updateFunctions.push(()=>{
            initialStateBs.setFrom2Vec(initialState.el[1], initialState.el[0])
        })

        let finalStateBox = Rectangle({
            w: gateDimension,
            h: gateDimension
        })
        wire.finalStateViz = new CombinedBsKb(finalStateBox)
    }

    circuitState = new ComplexVector(4) //or, matrix? but how to apply?
    let stepMat = identity4x4.clone()
    let cm2a = new ComplexMat(2)
    let cm2b = new ComplexMat(2)
    updateFunctions.push(() => {
        let q1 = wires[0].initialState.el
        let q2 = wires[1].initialState.el
        q1[0].mul(q2[0], circuitState.el[0])
        q1[0].mul(q2[1], circuitState.el[1])
        q1[1].mul(q2[0], circuitState.el[2])
        q1[1].mul(q2[1], circuitState.el[3])

        // let a = new Complex()
        // for(let )
        // log(circuitState.el[])

        // circuitState.log("before")

        for(let i = 0; i < maxGatesPerWire; ++i) {
            if (tqgs.indexOf(circuitGates[0][i]) !== -1 || 
                tqgs.indexOf(circuitGates[1][i]) !== -1 ) {
                //TODO allow them to be applied in the opposite direction
                //problem: need to show in the gate that it's from one wire to the other
                //for now A always controls B
                //note that A is unaffected by CNOT to B
                //haha, swap and swap back
                // debugger
                circuitGates[0][i].getMatrix(stepMat)
                // stepMat.copy(cnot)
            }
            else {
                // if (circuitGates[0][i] !== null )
                //     debugger
                let a = circuitGates[0][i] === null ? identity2x2 : circuitGates[0][i].getMatrix(cm2a)
                let b = circuitGates[1][i] === null ? identity2x2 : circuitGates[1][i].getMatrix(cm2b)
                // a.log("a")
                a.tensor(b, stepMat)
            }
            
            circuitState.applyMatrix(stepMat)
        }

        // circuitState.log("after")
        // circuitState.el[0].log()
        // circuitState.el[1].log()
        // circuitState.el[2].log()
        // circuitState.el[3].log()

        
        
        /*
            00 01
            10 11
            left qubit:
                00 / 10 if right qubit is 0, 
                01 / 11 if right qubit is 1

            right qubit: 

            a/c is only the projected bloch vector of left qubit if right qubit is 0
            Oooooookay. So find the basis in which the right qubit is indeed 0 (or "+")
            But in the entangled case, what is that qubit? If you're allowed to change basis, 

            Have to figure out how to break them apart in the separable case anyway, so 
            
            "a change of basis such that the result is separated if possible"            
                MAYBE schmidt decomposition? See SVD in complex
                    Really sounds like you have 
                Take the 4-vec and divide by c?

            is it definitely the case that you can extract |0>A / |1>A and |0>B / |1>B from the 4-vec?

            There's surely no definitive answer to "did A impact B or vice versa?"

            Qubit A doesn't care about what you've labelled as "up" and "down" for qubit B.
        */

        wires[0].finalStateViz.setFromAbcd(
            circuitState.el[0], circuitState.el[1],
            circuitState.el[2], circuitState.el[3]
        )
        // q1[1].div(q1[0]).log("about to see NaN or")
        // circuitState.el[3].div(circuitState.el[1]).log() // d/b
        // circuitState.el[2].div(circuitState.el[0]).log() // c/a
        
        wires[1].finalStateViz.setFromAbcd(
            circuitState.el[0], circuitState.el[2],
            circuitState.el[1], circuitState.el[3]
        )
        // circuitState.log()
        
        // q2[1].div(q2[0]).log("about to see NaN or")
        // circuitState.el[3].div(circuitState.el[2]).log() // d/b
        // circuitState.el[1].div(circuitState.el[0]).log() // c/a
    })

    let landmarkframe = new THREE.Object3D()
    {
        let landmarkMat = new THREE.MeshBasicMaterial({color:0x00FFFF})
        let landmarkMat2 = new THREE.MeshBasicMaterial({ color: 0xFF00FF })
        scene.add(landmarkframe)
        thingsToRotate.push(landmarkframe)
        landmarkframe.position.set(0., -999999., 0.)
        let coordNames = ["x", "y", "z"]
        function makeLandmark(mat) {
            let landmark = new THREE.Mesh(littleBallGeometry, mat ? landmarkMat : landmarkMat2)
            landmark.scale.setScalar(.9)
            landmarkframe.add(landmark)
            return landmark
        }
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 2; ++j) {
                let landmark = makeLandmark(0)
                landmark.position[coordNames[i]] = shellRadius * (j ? 1. : -1.)
            }
        }
        let coord = shellRadius / Math.SQRT2
        makeLandmark(1).position.set(coord,coord,0.)
        makeLandmark(1).position.set(coord,-coord,0.)
        makeLandmark(1).position.set(-coord,coord,0.)
        makeLandmark(1).position.set(-coord,-coord,0.)
        makeLandmark(1).position.set(coord,0.,coord)
        makeLandmark(1).position.set(coord,0.,-coord)
        makeLandmark(1).position.set(-coord,0.,coord)
        makeLandmark(1).position.set(-coord,0.,-coord)
        makeLandmark(1).position.set(0.,coord,coord)
        makeLandmark(1).position.set(0.,coord,-coord)
        makeLandmark(1).position.set(0.,-coord,coord)
        makeLandmark(1).position.set(0.,-coord,-coord)
    }

    //--------PAULI
    let paulis = Array(12)
    {
        let verts = []
        let numSnowflakes = 10
        for (let i = 0; i < numSnowflakes; ++i) {
            for (let j = 0; j < 3; ++j) {
                let vert1 = new THREE.Vector3(0., (i / (numSnowflakes - 1.)) * shellRadius * 2. - shellRadius, shellRadius / 10.)
                let vert2 = vert1.clone()
                vert1.applyAxisAngle(yUnit, TAU / 6. * j)
                vert2.applyAxisAngle(yUnit, TAU / 6. * j + TAU / 2.)
                verts.push(vert1)
                verts.push(vert2)
            }
        }
        let lineReflectionGeo = new THREE.BufferGeometry().setFromPoints(verts)
        let lineReflectionMat = new THREE.LineBasicMaterial({ color: 0x000000 })
        
        //TODO should maybe have two different sides
        for (let i = 0; i < paulis.length; ++i) {
            let pauliBox = SquareRectangle({})
            pauliBox.position.y = -999.

            let pauliCoords = new THREE.Vector3(1.,1.,0.) //initialized to hadamard
            updateFunctions.push(()=>{
                pauliCoords.normalize()
                setRotationallySymmetricMatrix(pauliCoords.x, pauliCoords.y, pauliCoords.z, pipeCleaner.matrix)
            })

            pauliBox.getMatrix = (target) => {
                target.copy(pauli1).multiplyScalar(-pauliCoords.x)
                c2m1.copy(pauli2).multiplyScalar(pauliCoords.z)
                target.add(c2m1)
                c2m1.copy(pauli3).multiplyScalar(-pauliCoords.y)
                target.add(c2m1)

                //decide on this AFTER you've sorted out whether pauli multiplication of a vector

                // reflection.inner(e1,mv0)[0]

                return target
            }

            let shell = BlochShell(pauliBox, {
                during: () => {                    
                    shell.intersectMouseRay(pauliCoords)
                    
                    landmarkframe.position.copy(shell.position)
                    landmarkframe.updateMatrixWorld()
                    landmarkframe.worldToLocal(pauliCoords)
                    landmarkframe.children.forEach((landmark)=>{
                        if (pauliCoords.distanceTo(landmark.position) < shellRadius / 6.)
                            pauliCoords.copy(landmark.position)
                    })

                    // sp.position.copy(pauliCoords)
                    // landmarkframe.localToWorld(sp.position)
                },
                end: ()=>{
                    landmarkframe.position.set(0.,-999999.,0.)
                }
            })
            let pipeCleaner = new THREE.LineSegments(lineReflectionGeo, lineReflectionMat)
            shell.add(pipeCleaner)
            pipeCleaner.matrixAutoUpdate = false

            //TODO visualize orientation for it
            
            paulis[i] = pauliBox
        }
    }

    //-------------TWO QUBITS
    //Are these directional in any sense? Unentangled A,B -> controlled not -> changing B impacts A?
    let tqgs = Array(5)
    {
        let matToBeExponentiated = new ComplexMat(4)
        let plusVector = new Complex(1./Math.sqrt(2.),1./Math.sqrt(2.))
        let minusITauOver4 = new Complex(0., -TAU / 4.)
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

            tqg.pX = 0.
            tqg.pY = 0.
            let indicator = new THREE.Mesh(littleBallGeometry, new THREE.MeshBasicMaterial({ color: 0x0000FF }))
            scene.add(indicator)
            updateFunctions.push(() => {
                indicator.position.x = (tqg.pX - .5) * lieAlgSpace.scale.x + lieAlgSpace.position.x
                indicator.position.y = (tqg.pY - .5) * lieAlgSpace.scale.y + lieAlgSpace.position.y

                indicator.position.add(holder.position)
            })

            let lieAlgSpaceWidth = gateDimension * .9
            let lieAlgSpace = Rectangle({
                w: lieAlgSpaceWidth,
                h: lieAlgSpaceWidth, // * Math.sqrt(2.),
                // col: 0xFF0000,
                textureUrl: "data/lieAlg.png",
                haveFrame: false,
                getPosition: (v) => {
                    v.copy(tqg.position)
                    v.z += .001
                },
                onClick: {
                    during: () => {
                        lieAlgSpace.mousePosInOurScaledSpace(v0)
                        tqg.pX = clamp(v0.x + .5, 0.,1.)
                        tqg.pY = clamp(v0.y + .5, 0., 1.)

                        if (Math.abs(tqg.pX-.5) < .05)
                            tqg.pX = 0.5
                        if (Math.abs(tqg.pY-.5) < .05)
                            tqg.pY = 0.5
                    }
                }
            })

            tqg.getMatrix = (target) => {

                // if(tqg.pX < 0.5 && tqg.pY < 0.5)
                //     target.copy(identity4x4)
                // if (tqg.pX > 0.5 && tqg.pY < 0.5)
                //     target.copy(cnot)
                // if (tqg.pX < 0.5 && tqg.pY > 0.5)
                //     target.copy(iSwap)
                // if (tqg.pX > 0.5 && tqg.pY > 0.5)
                //     target.copy(swap)

                matToBeExponentiated.copy(zero4x4)

                let crazyMode = true
                if (!crazyMode)
                {
                    let tX = tqg.pX / 2. //goes half way into the cube
                    let tY = tqg.pY / 2.
                    let tZ = tqg.pY / 2.

                    c4m0.copy(XxX)
                    c4m0.multiplyScalar(tX)
                    matToBeExponentiated.add(c4m0)
                    c4m0.copy(YxY)
                    c4m0.multiplyScalar(tY)
                    matToBeExponentiated.add(c4m0)
                    c4m0.copy(ZxZ)
                    c4m0.multiplyScalar(tZ)
                    matToBeExponentiated.add(c4m0)
                }
                else {
                    c4m0.copy(logCnotOverMinusIHalfPi)
                    c4m0.multiplyScalar(tqg.pX)
                    matToBeExponentiated.add(c4m0)
                    c4m0.copy(logSwapOverMinusIHalfPi)
                    c4m0.multiplyScalar(tqg.pY)
                    matToBeExponentiated.add(c4m0)
                }

                matToBeExponentiated.multiplyComplex(minusITauOver4)
                matToBeExponentiated.exp(target)

                // magic.mul(c4m0,c4m1).mul(magicConjugateTranspose,target)
                // target.log("here it is")

                //just try it with three orthogonal disks, might be enough
                //then, an octahedron with corners at infinity
                //octahedron plus disks parallel to faces and through origin
                /*
                    Nice to have:
                        some that are parallel
                        some that meet

                    make something so you can build the thing
                */

                //maybe you want to exponentiate?
            }

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
                let newTqg = putLowestUnusedGateOnWire(gateArray, closerWireIndex)
                if(newTqg !== null)
                    newTqg.position.y = bg.position.y
            }
        })
    })

    // wires[0].initialState.el[0].re = 0.
    // wires[0].initialState.el[1].re = 1.

    roundOffRectangleCreation()

    // putLowestUnusedGateOnWire(paulis, 0, 1)
    // putLowestUnusedGateOnWire(rotators, 0, 1)
    // putLowestUnusedGateOnWire(tqgs, 0, 2)
}