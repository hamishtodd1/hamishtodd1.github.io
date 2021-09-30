/*
	Ambitions
        Definitely show:
            CNOT
            Bell basis, rotational invariance
            NOT
            square root of not
            A "basis" is a way of looking at things and taking measurements on them
            "if Alice measures her qubit in any basis, the state of Bob’s qubit collapses to whichever state she got for her qubit"
        Would be nice to show:
            no-cloning
            teleportation
            free will

    Script - "But what does quantum entanglement LOOK LIK?"
        Quantum entanglement is, without exaggeration, one of the strangest things ever discovered.
        It's central to quantum physics so it's important if you want to understand why the periodic table has this shape, or how computer chips are made,
        But for me entanglement most intriguing because of its implications for philosophy, metaphysics, and epistemology. In a sense you can resolve the schrodinger's cat paradox
        In this video I want to give an intuitive sense for what entanglement is, which I'll do using this visualization of it

        If we take an ordinary sphere and imagine an ant on its surface, 

    Coooool: the fact that the dof grows quadratically rather than exponentially


    Volume-preserving transformations are nice for interpretability because you can always interpret the thing as a probability
    So maybe even ML shouldn't use matrices?

    The connection between circular exponential and scalar exponential might be illustrated by those large-gear-ratio things?

    Yes you can always find a change of basis such that it's a tensor product

    Maybe the series of qubits is like a long robot arm? each qubit a joint?
    Or like those gyroscopes where you control the gibals

    so it's still a complex 4-vector. It's just not a 4-vector that can be written as the tensor product of 2 2-vectors

    what's the inner product?
    cos(t) is defined by e(t) - e(-t), or maybe +

    Surely, surely as part of this you have a visualization of taking the squared norm of the probabilities
    Sphere to equilateral triangle

    No idea what controlled-not will look like as a rotation. It has to be something.

    Look, when you use any gate on the state, isn't the system now entangled with the machine because it knows you used that gate on it?

    Maybe a measurement is another thing that "splits" the state? You can summarize all the universes you aren't in...

    It's kinda like euler angles to have these damn complex numbers everywhere

    Two copies of the hue circle, one light one dark, connected by brightness variation

    "In 2D, if you give me some rotation around the origin and followed by movement in some direction...
        there is always some point I can find which, if rotated around that point, it gives you that full movement"
    That's true in 2D. In 3D...
    that's CLOSE to being true, but actually there is a way that you can fuck me over

    Laves graph https://blogs.ams.org/visualinsight/2016/10/15/laves-graph/
    Hypercube of monkeys
    Wanna have a complete set of quantum gates
    The 48-cell is interesting. Has 8-fold so long as you have the extra translation
    If you want to have a T-gate it's probably not one of the nice polytopes
    You want to rotate it around a line by 1/8 and have it look the same?
    Consider 16-cell, double the
    Whatever is dual to the truncated tesseract?

    You want something such that all the edges form great circles
    Something such that 
    Seems like a disphenoidal 288 cell, although it doesn't QUITE have that 8-fold symmetry
    Maybe if you're hiding alternate things?

    For the faces


    if it were 3D, an octahedron
    Each opposing point pair corresponds to a single point in plane


    Gonna have extracting the actual bits
    https://en.wikipedia.org/wiki/Monogamy_of_entanglement
*/

centerToFrameDistance = (fov, cameraDistance) => Math.tan(fov / 2. * (TAU / 360.)) * cameraDistance
fovGivenCenterToFrameDistance = (centerToFrame, cameraDistance) => 2. * Math.atan(centerToFrame / cameraDistance) * (360. / TAU)
function otherFov(inputFov, aspectRatio, inputIsVertical) {
    var centerToFrameInput = centerToFrameDistance(inputFov, 1.)
    var centerToFrameOutput = centerToFrameInput
    if (inputIsVertical)
        centerToFrameOutput *= aspectRatio
    else
        centerToFrameOutput /= aspectRatio
    var outputFov = fovGivenCenterToFrameDistance(centerToFrameOutput, 1.)
    return outputFov
}

async function initEntanglement()
{
    // initCircuit()
    // return

    camera.position.z += 3.
    camera.position.y -= 1.
    camera.position.x += .2

    updateFunctions.push(()=>{
        rightHandPosition.fromVector(rightHand.position)
    })

    let v0 = new THREE.Vector3()
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    let v3 = new THREE.Vector3()

    let rightHandPosition = new Mv()

    let cameraPoint = new Mv()
    let frustumPlanes = {
        left: new Mv(),
        right: new Mv(),
        top: new Mv(),
        bottom: new Mv(),
        far: new Mv(),
        near: new Mv()
    }
    //take the forwards direction, and rotate it by half a fov up, down, left, right
    
    let rotator = new Mv()
    let cameraRotor = new Mv()
    let cameraMotor = new Mv()
    let cameraTranslation = new Mv()

    function updateCamera() {
        
        cameraPoint.fromVector(camera.position)

        product(cameraPoint, e123, mv0).sqrtSimpleMotor(cameraTranslation)
        cameraRotor.fromQuaternion(camera.quaternion)
        product( cameraRotor, cameraTranslation, cameraMotor )

        let horizontalFov = otherFov(camera.fov, camera.aspect, false)
        
        rotorFromAxisAngle(e23, camera.fov / 2., rotator)
        rotator.sandwich(e2,frustumPlanes.top)
        frustumPlanes.top.multiplyScalar(-1.)
        rotorFromAxisAngle(e23,-camera.fov / 2., rotator)
        rotator.sandwich(e2,frustumPlanes.bottom)
        rotorFromAxisAngle(e31, horizontalFov / 2., rotator)
        rotator.sandwich(e1,frustumPlanes.right)
        rotorFromAxisAngle(e31,-horizontalFov / 2., rotator)
        rotator.sandwich(e1,frustumPlanes.left)
        frustumPlanes.left.multiplyScalar(-1.)

        frustumPlanes.far.copy(zeroMv)
        frustumPlanes.far[1] = -(camera.far * .99)
        frustumPlanes.far[4] = 1.
        frustumPlanes.far.normalize()
        frustumPlanes.near.copy(zeroMv)
        frustumPlanes.near[1] = camera.near
        frustumPlanes.near[4] = 1.
        frustumPlanes.near.normalize()

        for (let pl in frustumPlanes) {
            cameraMotor.sandwich(frustumPlanes[pl], mv0)
            frustumPlanes[pl].copy(mv0)
        }
    }
    
    updateFunctions.push( updateCamera)

    // function pointInFrontOfCamera(pt) {
    //     return orientedDistancePointPlane(pt,cameraLookingPlane) > 0.
    // }

    {
        let controlsArray = [
            e31, "j", "l",
            e12, "a", "d",
            e23, "t", "g",

            e01, "f", "h",
            e02, "i", "k",
            e03, "w", "s",
        ]

        for (let i = 0, il = controlsArray.length / 3; i < il; ++i) {
            let gate = controlsArray[i * 3].sqrtSimpleMotor().sqrtSimpleMotor()
            bindButton(controlsArray[i * 3 + 1], () => {
                product(motor, gate, mv0)
                motor.copy(mv0)
            })
            bindButton(controlsArray[i * 3 + 2], () => {
                let reverseGate = gate.reverse(mv1)
                product(motor, reverseGate, mv0)
                motor.copy(mv0)
            })
        }
    }

    let initialEdgeMvs = []
    let initialVertexMvs = []
    if (0) {
        for (let i = 0; i < 2; ++i)
            initialEdgeMvs[i] = e31.clone()
        let planeJustOff = e1.clone()
        planeJustOff.multiplyScalar(.05)
        add(e0, planeJustOff, planeJustOff)
        meet(e3, planeJustOff, initialEdgeMvs[1])
    }

    const motor = new Mv()
    motor[0] = 1.
    const displayedMotor = new Mv()
    const mvGettingVisualized = new Mv()

    updateFunctions.push(() => {
        for (let i = 0; i < 16; ++i)
            displayedMotor[i] += .03 * (motor[i] - displayedMotor[i])
        displayedMotor.normalize()
    })

    //so there'll be controlled not which is a screw motion, and the other screw motions are maybe controlled OR or something?
    {
        let radius = .07
        let pointGeo = new THREE.SphereBufferGeometry(radius)

        function visiblePoint(persistentPoint, color) {
            if (color === undefined)
                color = new THREE.Color(0., 0., 0.)

            let mesh = new THREE.Mesh(pointGeo, new THREE.MeshPhongMaterial({ color }))
            scene.add(mesh)
            updateFunctions.push(() => {
                displayedMotor.sandwich(persistentPoint, mvGettingVisualized)

                mesh.visible = mvGettingVisualized[14] > 0.
                mvGettingVisualized.toVector(mesh.position)
            })
        }
    }

    //24-cell
    //hexagonal equators
    //24*12/3/6 = 16
    {
        //the edges of an octahedron and the great circles that are a cuboctahedron
        //


    }

    //truncating the lines to the frustum
    //could check their distance from the camera? No
    //Ok so you get this series of points

    //how about, for an intersection point, check which side of all the other planes it is on?
    {
        // initialEdgeMvs.push(e31)

        // let pointMvs = [new Mv(), new Mv()]
        // visiblePoint(pointMvs[0])
        // visiblePoint(pointMvs[1])
        // updateFunctions.push(()=>{
        //     let currentLine = displayedMotor.sandwich(initialEdgeMvs[i], mv0)
        //     pointMvs[0].point( 999999999999.,0.,0.)
        //     pointMvs[1].point(-999999999999.,0.,0.)

        //     //no, this doesn't work. You probably need to check distance from the center


        //     for(let i = 0; i < 2; ++i) {
        //         let pointMv = pointMvs[i]
        //         let otherPointMv = pointMvs[1-i]
        //         for (let pl in frustumPlanes) {
        //             let currentDistToOther = distancePointPoint(pointMv, otherPointMv)

        //             meet(currentLine, frustumPlanes[pl], mv1)
        //             let distToOther = distancePointPoint(mv1, otherPointMv)
        //             if (distToOther < currentDistToOther)
        //                 pointMv.copy(mv1)
        //         }
        //     }
        // })
    }

    //48-cell
    {
        let coords0 = [2. + Math.sqrt(2.), 2. + Math.sqrt(2.), 0., 2. + 2. * Math.sqrt(2.)]
        let coords1 = [1. + Math.sqrt(2.), 1. + Math.sqrt(2.), 1., 3. + 2. * Math.sqrt(2.)]
        let index = 0
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                if(j === i)
                    continue
                for (let k = 0; k < 4; ++k) {
                    if (k === i || k === j)
                        continue
                    for (let l = 0; l < 4; ++l) {
                        if (l === i || l === j || l === k)
                            continue
                        
                        //if you've done 0,1,2,3 you don't need 1,0,2,3
                        //if you've done 3,1,2,0 you don't need 3,0,2,1
                        let indexThatIs0 = i === 0 ? 0 : j === 0 ? 1 : k === 0 ? 2 : 3
                        let indexThatIs1 = i === 1 ? 0 : j === 1 ? 1 : k === 1 ? 2 : 3
                        if(indexThatIs1 > indexThatIs0)
                            continue

                        for(let signs = 0; signs < 16; ++signs) {

                            initialVertexMvs.push(new Mv().point(
                                (signs & 1 ? -1.:1.) * coords1[i], 
                                (signs & 2 ? -1.:1.) * coords1[j], 
                                (signs & 4 ? -1.:1.) * coords1[k], 
                                (signs & 8 ? -1.:1.) * coords1[l]).normalize())

                            if ((coords0[i] === 0. && signs & 1) ||
                                (coords0[j] === 0. && signs & 2) ||
                                (coords0[k] === 0. && signs & 4) ||
                                (coords0[l] === 0. && signs & 8) )
                                continue
                            initialVertexMvs.push(new Mv().point(
                                (signs & 1 ? -1.:1.) * coords0[i], 
                                (signs & 2 ? -1.:1.) * coords0[j], 
                                (signs & 4 ? -1.:1.) * coords0[k], 
                                (signs & 8 ? -1.:1.) * coords0[l]).normalize())
                        }
                    }
                }
            }
        }
        log(initialVertexMvs.length)
    }

    //600 cell
    if(0)
    {
        let gr = (Math.sqrt(5.) + 1.) / 2.
        let lengthOfTheseVertsWithoutMul = Math.sqrt(1.+gr*gr)
        // Edge length in the 4D sphere is 360 / 10 = 36 degrees
        let coords = new Float32Array([
            0., 1., gr,
            gr, 0., 1.,
            0.,-1., gr,
           -gr, 0., 1.,
           -1., gr, 0.,
            1., gr, 0.,
            gr, 0.,-1.,
            1.,-gr, 0.,
           -1.,-gr, 0.,
           -gr, 0.,-1.,
            0., 1.,-gr,
            0.,-1.,-gr,
        ])
        let verts = Array(coords.length/3)
        let mul = Math.tan(TAU / 10.) / lengthOfTheseVertsWithoutMul
        for(let i = 0; i < verts.length; ++i)
            verts[i] = new Mv().point(coords[i*3+0] * mul, coords[i*3+1] * mul, coords[i*3+2] * mul).normalize()
        let edgeLen = distancePointPoint(verts[0],verts[2])

        //maybe all you're doing is making a nice interface for blender? Definitely worthwhile
        
        {
            initialVertexMvs.length = verts.length
            verts.forEach((v,i)=>{
                initialVertexMvs[i] = v.clone()
            })
            //aaaaand the other 120 - 12?

            // icosidodecahedron (edge centers)
            // compound of five octahedra
            // pentakis dodecahedron
            // icosahedron
        }

        function addLineAndItsDual(p1, p2) {
            let theJoin = join(p1, p2).normalize()
            initialEdgeMvs.push(theJoin)
            initialEdgeMvs.push(theJoin.dual().normalize())
        }

        for (let i = 0, il = verts.length; i < il; ++i) {
            let coordSum = verts[i].x() + verts[i].y() + verts[i].z()
            if(coordSum > 0.)
                addLineAndItsDual(e123,verts[i])

            for(let j = i+1, jl = verts.length; j < jl; ++j) {
                if (distancePointPoint(verts[i],verts[j]) < edgeLen * 1.1)
                    addLineAndItsDual(verts[i], verts[j])
            }
        }
    }

    {
        const dummy = new THREE.Object3D()

        let radius = .003
        let geo = new THREE.CylinderBufferGeometry(radius, radius, 9999., 15, 1, true)
        let mat = new THREE.MeshPhongMaterial({ color: 0x888888 })
        const NUM_CYLINDERS = initialEdgeMvs.length
        let mesh = new THREE.InstancedMesh(geo, mat, NUM_CYLINDERS)
        scene.add(mesh)
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

        updateFunctions.push(() => {
            for (let i = 0; i < NUM_CYLINDERS; i++) {

                displayedMotor.sandwich(initialEdgeMvs[i], mvGettingVisualized)

                //line at infinity
                // if (mvGettingVisualized[8] == 0. && mvGettingVisualized[9] == 0. && mvGettingVisualized[10] == 0.) {
                //     mvGettingVisualized.copy(e12)

                    
                // }

                {
                    //so what you want are the five planes defining the camera's pyramid
                    //And you want to get the start and end points of your line
                    //initialize them to being very far away

                    //for each of the 4 camera planes, meet with line, get the meet-points closest to the camera
                    //for those two points, get the lines joining them with cameraPoint
                    //meet those lines with the far plane. If meet points are closer, they override

                    let thisLineAtOrigin = projectLineOnPoint(mvGettingVisualized, e123, mv1)
                    thisLineAtOrigin.normalize()
                    let rotorToThisLineAtOrigin = product(thisLineAtOrigin, e31, mv2).sqrtSimpleMotor(mv3)
                    rotorToThisLineAtOrigin.toQuaternion(dummy.quaternion)

                    let pos = projectPointOnLine(cameraPoint, mvGettingVisualized, mv4)
                     //works even if e123 part == 0.
                    // log(dummy.position)

                    // let orientedDistanceFromCamera = orientedDistancePointPlane( pos, cameraLookingPlane )
                    // let isInFrontOfCameraAndMightBeTooFarToSee = orientedDistanceFromCamera > camera.far - .1
                    // let isIdealLine = pos.equals(zeroMv)

                    // if ( mvGettingVisualized.isIdealLine() || isInFrontOfCameraAndMightBeTooFarToSee ) {
                    //     let planeAtOriginThroughLine = join(cameraPoint, mvGettingVisualized, mv5)
                    //     meet(cameraLookingPlane, planeAtOriginThroughLine, mvGettingVisualized)

                    //     //yoooooou're gonna have a discontinuity
                    //     //could turn it into a single pixel wide line

                    //     // mvGettingVisualized.normalize()
                    // }
                    // else {
                    // }
                    pos.toVector(dummy.position)
                }


                dummy.updateMatrix()
                mesh.setMatrixAt(i, dummy.matrix)
            }

            mesh.instanceMatrix.needsUpdate = true;
        })
    }
    
    for (let i = 0, il = initialVertexMvs.length; i < il; ++i) {
        let angle = Math.atan2(initialVertexMvs[i].y(), initialVertexMvs[i].z())
        let hue = (angle + Math.PI) / TAU
        let xNormalized = (initialVertexMvs[i].x() + 1.) / 2.
        let easedToReduceBlackAndWhite = Math.acos(-(xNormalized * 2. - 1.)) * 2. / TAU
        let lightness = easedToReduceBlackAndWhite
        let color = new THREE.Color().setHSL(hue, 1., lightness)

        visiblePoint(initialVertexMvs[i], color)
    }


    // the icosahedron, or whatever, at each vertex
    //yeah but can you be bothered to get the fucking GA code in the shader?
    //the purpose of the things is just to keep track of the location of the nodes, the lines do the 
    // {
    //     let material = new THREE.ShaderMaterial({
    //         uniforms: {

    //         },
    //     });
    //     await assignShader("entanglementNodesVert", material, "vertex")
    //     await assignShader("entanglementNodesFrag", material, "fragment")

    //     let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.1, 0.1, 10, 10), material);
    //     plane.position.y = 1.6
    //     plane.position.z = -0.45;
    //     scene.add(plane);
    // }


    //probably going to need some buffer attribute coming from the points
}

function initCircuit() {
    initRectangles()

    let bgWidth = .3
    let bgHeight = .2
    let bg = Rectangle({
        haveFrame: true,
        w: bgWidth, h: bgHeight,
        getPosition: (p) => {
            p.copy(rightHand.position)
            p.z -= .001
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

    //keep this out of the way. It causes the outlines above to work. What the fuck.
    let hadamard = Rectangle({
        frameThickness: .002,
        // label: "B",
        // w: .04, h: .04,
        getPosition: (p) => {
            p.copy(rightHand.position)
            p.y += 2.
        }
    })

    let NUM_QUBITS = 2
    let wires = Array(NUM_QUBITS)
    let padding = .04
    let wireSpacing = (bgHeight - padding * 2.) / (NUM_QUBITS-1)
    let wireThickness = .003
    let wireLength = .25
    let wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    for(let i = 0; i < NUM_QUBITS; ++i) {
        wires[i] = Rectangle({
            h: wireThickness,
            w: wireLength,
            mat: wireMaterial,
            getPosition: (p) => {
                p.copy(rightHand.position)

                p.y -= wireSpacing * (wire.i - (NUM_QUBITS-1) / 2.)
            }
        })

        let wire = wires[i]
        wire.i = i

        wire.initialState = SymbolRectangle({
            label:"|0>",
            onClick: ()=>{

                wire.initialState.val = 1 - wire.initialState.val
                setRectText(wire.initialState, "|" + wire.initialState.val + ">")
            },
            getPosition:(v)=>{
                v.copy(rightHand.position)
                v.x = wire.position.x - wire.scale.x / 2.
                v.y = wire.position.y
            }
        })
        wire.initialState.val = 0
    }

    roundOffRectangleCreation()
}

function generateEvenPermutations(A)
{
    // http://eusebeia.dyndns.org/epermute
    
    function reverseFrom(start) {
        let numSwaps = 0
        for (let i = start, il = start + (A.length-start) / 2; i < il; ++i) {
            let temp = A[i]
            A[i] = A[A.length - 1 - i]
            A[A.length - 1 - i] = temp
            
            ++numSwaps
        }
        
        return numSwaps
    }
    
    let parityFlip = false
    let getOut = 0
    while(true) {
        let specialIndex = -1
        for (let i = A.length - 2; i > -1; --i) {
            if (A[i] < A[i + 1]) {
                specialIndex = i
                break
            }
        }

        if (specialIndex === -1) {
            reverseFrom(0)

            let criticalNumber = Math.floor(A.length / 2)
            if (criticalNumber % 2 === 1)
                parityFlip = !parityFlip
        }
        else {
            let specialIndex2 = -1
            for (let j = A.length - 1; j > -1; --j) {
                if (A[specialIndex] < A[j]) {
                    specialIndex2 = j
                    break
                }
            }
            if(specialIndex2 === -1)
                console.error("they implied this wouldn't happen")
            else {
                let temp = A[specialIndex]
                A[specialIndex] = A[specialIndex2]
                A[specialIndex2] = temp
                parityFlip = !parityFlip
    
                let numSwaps = reverseFrom(specialIndex + 1)
                if (Math.floor(numSwaps) % 2 === 1)
                    parityFlip = !parityFlip
            }
        }
        log(A)

        if (!parityFlip)
            break

        if (getOut > 10000) {
            log("yeah, bug")
            break
        }
        ++getOut
    }

    log(A)
}
// generateEvenPermutations([2,3,5,7])

//so you're gonna get these vertices
//of the opposed ones, one will be in 3D space
//find the ones that 
//project them onto 

//consider the vertices directions
//if this were 3D... could take the dual
//every pair of opposing points should has a dual plane