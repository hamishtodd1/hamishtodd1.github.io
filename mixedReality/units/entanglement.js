/*
	Gates
        CNOT

    Ambitions
        Show:
            no-cloning
            teleportation
            free will

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



async function initEntanglement()
{
    let v0 = new THREE.Vector3()
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    let v3 = new THREE.Vector3()

    let rightHandPosition = new Mv()

    let planeCameraIsLookingAt = new Mv()
    updateFunctions.push(()=>{
        v0.set(0.,0.,-1.)
        v0.applyQuaternion( camera.quaternion )

        planeCameraIsLookingAt.fromVector(v0).dualSelf()

        rightHandPosition.fromVector(rightHand.position)
    })

    // initCircuit()

	//array of vector4s

    //could do cylinders and balls with instanced shit
    //balls (vertices) is simple, same for cylinders

    camera.position.z += 3.
    camera.position.y -= 1.
    camera.position.x += .2


    //current goal: face-on 16-cell
    let controlsArray = [
        e31,"j","l",
        e12,"a","d",
        e23,"t","g",

        e01,"f","h",
        e02,"i","k",
        e03,"w","s",
    ]

    for(let i = 0, il = controlsArray.length / 3; i < il; ++i) {
        let gate = controlsArray[i * 3].sqrtSimpleMotor().sqrtSimpleMotor()
        bindButton(controlsArray[i*3+1], () => {
            product(motor, gate, mv0)
            motor.copy(mv0)
        })
        bindButton(controlsArray[i*3+2], () => {
            let reverseGate = gate.reverse(mv1)
            product(motor, reverseGate, mv0)
            motor.copy(mv0)
        })
    }

    //so there are 600 * 6 / 5 = 720 edges, / 10 = 72 great circles

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

    //24-cell
    //hexagonal equators
    //24*12/3/6 = 16
    {
        //the edges of an octahedron and the great circles that are a cuboctahedron
        //


    }

    //600 cell (maybe)
    {
        let icoVerts = Array(12)
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
        let mul = Math.tan(TAU / 10.) / lengthOfTheseVertsWithoutMul
        for(let i = 0; i < icoVerts.length; ++i)
            icoVerts[i] = new Mv().point(coords[i*3+0] * mul, coords[i*3+1] * mul, coords[i*3+2] * mul).normalize()
        let edgeLen = distancePointPoint(icoVerts[0],icoVerts[2])

        //maybe all you're doing is making a nice interface for blender? Definitely worthwhile
        
        {
            initialVertexMvs.length = icoVerts.length
            icoVerts.forEach((v,i)=>{
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

        for (let i = 0, il = icoVerts.length; i < il; ++i) {
            let coordSum = icoVerts[i].x() + icoVerts[i].y() + icoVerts[i].z()
            if(coordSum > 0.)
                addLineAndItsDual(e123,icoVerts[i])

            for(let j = i+1, jl = icoVerts.length; j < jl; ++j) {
                if (distancePointPoint(icoVerts[i],icoVerts[j]) < edgeLen * 1.1)
                    addLineAndItsDual(icoVerts[i], icoVerts[j])
            }
        }
    }

    const motor = new Mv()
    motor[0] = 1.

    //so there'll be controlled not which is a screw motion, and the other screw motions are maybe controlled OR or something?

    {
        const displayedMotor = new Mv()
        updateFunctions.push(() => {
            for (let i = 0; i < 16; ++i)
                displayedMotor[i] += .03 * (motor[i] - displayedMotor[i])
            displayedMotor.normalize()
        })

        const mvGettingVisualized = new Mv()
        const dummy = new THREE.Object3D()

        {
            let radius = .07
            let geo = new THREE.SphereBufferGeometry(radius)
            const NUM_SPHERES = initialVertexMvs.length
            // let mesh = new THREE.InstancedMesh(geo, mat, NUM_SPHERES)
            let meshes = []
            // mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
            
            for(let i = 0; i < NUM_SPHERES; ++i) {
                let angle = Math.atan2(initialVertexMvs[i].y(), initialVertexMvs[i].z())
                let hue = (angle + Math.PI) / TAU
                let xNormalized = (initialVertexMvs[i].x() + 1.) / 2.
                let easedToReduceBlackAndWhite = Math.acos(-(xNormalized * 2. - 1.)) * 2. / TAU
                let lightness = easedToReduceBlackAndWhite
                let color = new THREE.Color().setHSL(hue, 1., lightness)
                
                meshes[i] = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color }))
                scene.add(meshes[i])
            }

            updateFunctions.push(() => {
                for (let i = 0; i < NUM_SPHERES; i++) {
                    displayedMotor.sandwich(initialVertexMvs[i], mvGettingVisualized)

                    mvGettingVisualized.toVector(meshes[i].position)

                    // if (mvGettingVisualized[14] !== 0.) {
                    //     mvGettingVisualized.toVector(dummy.position)
                    //     dummy.quaternion.identity()
                    // }
                    // else {
                    //     dummy.position.set(0.,0.,0.)
                    // }
                    // dummy.updateMatrix()
                    // mesh.setMatrixAt(i, dummy.matrix)
                }

                // mesh.instanceMatrix.needsUpdate = true;
            })
        }

        {
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
                    if (mvGettingVisualized[8] == 0. && mvGettingVisualized[9] == 0. && mvGettingVisualized[10] == 0.) {
                        mvGettingVisualized.copy(e12)

                        // let planeAtOriginThroughLine = join(e123, mvGettingVisualized, mv1)
                        // meet(planeCameraIsLookingAt, planeAtOriginThroughLine, mvGettingVisualized)

                        // mvGettingVisualized.normalize()
                    }

                    {
                        let thisLineAtOrigin = projectLineOnPoint(mvGettingVisualized, e123, mv1)
                        thisLineAtOrigin.normalize()
                        let rotorToThisLineAtOrigin = product(thisLineAtOrigin, e31, mv2).sqrtSimpleMotor(mv3)
                        rotorToThisLineAtOrigin.toQuaternion(dummy.quaternion)

                        let pos = projectPointOnLine(e123, mvGettingVisualized, mv4)
                        pos.toVector(dummy.position) //it works even if e123 part == 0.
                    }


                    dummy.updateMatrix()
                    mesh.setMatrixAt(i, dummy.matrix)
                }

                mesh.instanceMatrix.needsUpdate = true;
            })
        }
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
    function gridBoxLabelled(label, onClick) {
        let rect = Rectangle({
            frameThickness: .002,
            label,
            onClick: onClick === undefined ? null : onClick,
            w: gridDimension, h: gridDimension
        })

        rect.setText = function (t) {
            rect.textMeshes[0].material.setText(t)
        }

        return rect
    }

    let strings = [
        "|0>", "|1>", "H", "S", "T", "⊕"
    ]
    let symbolBoxes = []

    strings.forEach((str, i) => {
        let rect = gridBoxLabelled(str)
        symbolBoxes.push(rect)
    })
    updateFunctions.push(() => {
        symbolBoxes.forEach((sb, i) => {
            sb.position.copy(rightHand.position)
            sb.position.x += .12 * i
        })
    })

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

    // let NUM_QUBITS = 4
    // let wires = Array(NUM_QUBITS)
    // let padding = .04
    // let wireSpacing = (bgHeight - padding * 2.) / (NUM_QUBITS-1)
    // let wireThickness = .003
    // let wireLength = .25
    // let wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    // for(let i = 0; i < NUM_QUBITS; ++i) {
    //     wires[i] = Rectangle({
    //         h: wireThickness,
    //         w: wireLength,
    //         mat: wireMaterial,
    //         getPosition: (p) => {
    //             p.copy(rightHand.position)

    //             p.y -= wireSpacing * (wire.i - (NUM_QUBITS-1) / 2.)
    //         }
    //     })

    //     let wire = wires[i]
    //     wire.i = i
    // }

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