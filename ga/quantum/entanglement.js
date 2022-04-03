/*
    Finish figuring out how to visualize measurements

    For sure superdense coding
        https://www.youtube.com/watch?v=w5rCn593Dig 
        alice is putting a gate into the two-qubit state depending on what pair of bits she wants to send

    Might make a good cover for New Scientist
    Klem/Piotr can probably hook you up with quantum folks
    It'd be good to have the bloch vec superimposed on the pauli while you're editing it

    two subsystems that partition a pure state are entangled if and only if their reduced states are mixed states
    The “Schmidt coefficients” are the square roots of the eigenvalues of the reduced density matrix and the states its eigenstates
    Are the schmidt coefficients

    Titles
        Einstein's bane: how this quantum state broke physics (EPR visualized)
        Einstein: quantum has to be nonsense, because you can do THIS
        This is what quantum entanglement looks like (devilish smile, pointing at it)
            The cool philosophy is: measurement is entanglement. An offhand remark! You're not in a place to give a full treatment
        Lean in to the metaphysics: yes, it's useful for MRI and crypto, but they're boring. "What is the world made of" is better
        
        Propose a numberphile vid:
            Hyperbolic geometry of quantum physics
        "Shorts", < 2m, "visual quantum computing" series. Some of these you dunno what they're for:
            X,Y,Z
            Other 1-qubit
            "Quantum weirdness: the square root of the NOT logic gate"
            what does the conjugate transpose of a gate look like? Answer: rotation in the opposite direction
            Hadamard
                Figure out, with a classical result, whether an input was i or -i
            Rotations
            CNOT classical, CNOT with craziness - direct to the entanglement video which talks about bell basis
            CNOT "effect is two way" thing https://en.wikipedia.org/wiki/Controlled_NOT_gate#Behaviour_in_the_Hadamard_transformed_basis 
            Each controlled gate
            Google's sycamore gate
            Teleportation
            Quantum weirdness: how to take the square root of... swapping?
            Wow, eraser with 2? https://quantumcomputing.stackexchange.com/questions/1568/what-is-the-quantum-circuit-equivalent-of-a-delayed-choice-quantum-eraser
            QFT on two qubits (just show it)
            CNOT + reverse CNOT + CNOT = Swap
            Dis-entanglement?
            Measurement gate (!)
            Mike and ike, no idea what they're for
                198
                385 "phase damping"
                256 Oracle??
                3 qubit QFT 220
            Toffoli/Deutsch (eh, bit nuts)
            lots of 3-qubit gates https://arxiv.org/pdf/1712.05642.pdf

    Mandelbrot
        https://www.youtube.com/watch?v=FFftmWSzgmk
        Put mandelbrot set on the sphere, repeatedly apply with 1 as denominator, the black goes to one place

    

    Definitely show:
        No hidden variables
            Bell basis, rotational invariance
            Maximal entanglement
            "if Alice measures her qubit in any basis, the state of Bob’s qubit collapses to whichever state she got for her qubit"
        Kochen specker "Not determined until you observe it"?
            How to read off the expectation values
                A "basis" is a way of looking at things and taking measurements on them
                Measuring device is probably some kind of angle-measurer-looking-thing
        no-cloning (ab != 0 <=> can't copy, very simple)
        
    Would be nice, if commisssioned, to show:
        teleportation - possibly only needs the two?
            And it allows you to connect to quantum cryptography
        Superdense coding
        Grover's algorithm
        Shor's alg
            https://en.wikipedia.org/wiki/Modular_exponentiation visualizable
            mn = g^p - 1 visualizable
        "negative probabilities" formulation https://cognitivemedium.com/assets/qm-interpretation/Feynman.pdf
        free will

    Wikipedia articles to add animation to:
        Cross ratio
        Entanglement
        CGA
        Mobius transformations
        Riemann sphere
        Bloch sphere
        Klein Disk
        Models of hyperbolic space

    Hadamard matrix should look like the map is flattened to gnomonic and doing a flip

    Think of it as... a nice spikey jewel, like a henry segerman thing
    Aaaaand it does have volumes, and when it's rested they're solid. But when you change it they fade in and out

    we want G such that G appears to be a reflection and G*swap = something you suspect is a rotation
    Problem is, it's probably a reflection that DOESN'T combine to become the X x I etc
    Though hmm, maybe hadamard is

    paulis x Id in 2-qubit = line reflections - Wanting this to work because got 6 similar things
        If you only have e1 and e2 and e3 is the SPHERE at infinity(!), that's it
        e123 is the center of the plane you're in
        e3 remains the sphere at infinity
        When you're thinking about one qubit, e1 acts as a hyperplane (line)
        but maybe e1 stays as a line (line reflection), e14?
        Anyway, to get from reflection to rotation you multiply by pss, e123, to get the point that Rx will rotate around
        Yes it works if e1 becomes e14 and pss is e1234 instead of e123
        Problem is this "stealing" thing, plus, e14 squares to -1, not 1

    If this was going to work, wouldn't it work in CGA? And wouldn't Chris have found it?
    "vectors are points" would have to be quite toxic
    
    Dodecahedral honeycomb
        So you're making trivectors with, what, the five-fold and threefold rotation of the dodecahedron?
        Aaaaaand then you have a translation as well?

    People have this idea of "the controlled not gate", and it's a particular set of 0s and 1s
    But clearly you should be able to change some -1s and "i"s or whatever and it's essentially doing the same thing
    i.e. surround it with some paulis
    And really what's going on is this rotational relation you can show
    I mean if you have some crazy business affecting qubit A, and after all that you apply it to the untouched B, what happens?


    Script - "But what does quantum entanglement LOOK LIKE?"
        What is truth? What is reality?

        This is a visualization of quantum entanglement, which is one of the most strange and important rules of rules of how the universe works
        Without quantum entanglement there would be no atoms
        And without our understanding of it, we'd be unable to create MRI machines, or small microchips for use in computers
        Even philosophy has a use for entanglement. In the schrodinger's cat paradox, two pieces of information become, somehow, linked to one another
        In the schrodinger's cat paradox that means the decay state of an atom and your knowledge of whether your cat has died have become related, which they aren't before you open the box

        
        Need some cute portable thing that's only ever 00 or 11. A pair of teenage girls where one of them has said she liked/didn't like the movie
        We're going to make a single object that exists in two separate pieces, like a pair of semi-matching socks

        "When" "you" measure "your" qubit, you join the universe where your qubit was that result,
        and you know what universe that's going to be for your partner



        You can say thank you for this video on patreon. It's actually taken more than two years of research to create this,
        and I have no academic position and support myself as a software engineer, so if you feel like

        Usually, two things can know about each other without impacting each other.
        Let's say you have Alice lives in Paris and Bob lives in New York
        Suppose someone says to Alice "there's a guy called Bob who lives in New York"
        And someone else says to Bob "there's a woman called Alice who lives in Paris"
        These two aren't necessarily impacted by that information (er, not the best example)

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

    Maybe a measurement is another thing that "splits" the state? You can summarize all the universes you aren't in...

    It's kinda like euler angles to have these damn complex numbers everywhere






    Is it actually true?
        Imagine an object superimposed on its rotation by 90 degrees. That is the unit complex number. 
        No phase necessary because you haven't had to choose "where the unit is". It does somewhat become that way because you say "well, *I* am looking at it at this angle...

        Maybe, Magnitude of p1 is angle1, magnitude of p2 is angle2? Buuuuut probably there's only one dof between them since they're on a circle, like they're sin and cos of some angle
        Leftover are 2 unit 4-vectors (unless one of them is zero!!!)
        Which correspond to points in your space
        Join those points, get a line, take the rotation by angle 1 and "translation" by angle 2 along that line?

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
    // camera.position.z += 3.
    // camera.position.y -= 1.
    // camera.position.x += .2

    let v0 = new THREE.Vector3()
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    let v3 = new THREE.Vector3()

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
    
    let cameraRotator = new Mv()
    let cameraTranslation = new Mv()
    let cameraEvenReflection = new Mv()

    let rotor = new Mv()
    function updateCamera() {
        
        cameraPoint.fromVector(camera.position)

        cameraPoint.mul(e123, mv0).sqrtBiReflection(cameraTranslation)
        cameraRotator.fromQuaternion(camera.quaternion)
        cameraRotator.mul( cameraTranslation, cameraEvenReflection )

        let horizontalFov = otherFov(camera.fov, camera.aspect, false)
        
        rotorFromAxisAngle(e23, camera.fov / 2., rotor)
        rotor.sandwich(e2,frustumPlanes.top)
        frustumPlanes.top.multiplyScalar(-1.)
        rotorFromAxisAngle(e23,-camera.fov / 2., rotor)
        rotor.sandwich(e2,frustumPlanes.bottom)
        rotorFromAxisAngle(e31, horizontalFov / 2., rotor)
        rotor.sandwich(e1,frustumPlanes.right)
        rotorFromAxisAngle(e31,-horizontalFov / 2., rotor)
        rotor.sandwich(e1,frustumPlanes.left)
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
            cameraEvenReflection.sandwich(frustumPlanes[pl], mv0)
            frustumPlanes[pl].copy(mv0)
        }
    }
    
    updateFunctions.push( updateCamera )

    // function pointInFrontOfCamera(pt) {
    //     return orientedDistancePointPlane(pt,cameraLookingPlane) > 0.
    // }

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

    const stateMotor = new Mv()
    stateMotor[0] = 1.
    const displayedMotor = new Mv()

    initDirectControlOfMotor(stateMotor)
    
    // initialized to 00
    let state = new ComplexVector(4)
    state.elements[0].re = 1.

    //parallel control
    {
        let equivalents = {
            cnot: new Mv(),
            pauliXFirstQubit: new Mv(),
            pauliYFirstQubit: new Mv(),
            pauliZFirstQubit: new Mv(),
            pauliXSecondQubit: new Mv(),
            pauliYSecondQubit: new Mv(),
            pauliZSecondQubit: new Mv(),
            hadamard: new Mv(),
            //not sure what to do about phase shift
            //If it all works discretely it's probably fine
        }

        //pretty sure it's this, check notes
        equivalents.cnot.copy(e1)
        equivalents.cnot.add(e2)
        equivalents.cnot.multiplyScalar(1./Math.sqrt(2.))

        // equivalents.pauliXFirstQubit.copy()
        // e12, etc

        //maybe worthwhile thinking about CL(3) and one qubit

        //how to check they're keeping up with each other?
        //maintain an array of all the states they've both been in
        //for all new states, compare with old ones. If matrix was same but mv is different, uh-oh

        //how to make a bell state with paulis and cnot?
    }
    
    //intuition is that the paulis should be rotations
    //so find a mapping that does that

    let mv0 = new Mv()
    updateFunctions.push(() => {
        
        //naieve
        if(0) {
            stateMotor.copy(zeroMv)

            stateMotor[0] = state.elements[0].re
            stateMotor[15] = state.elements[0].im
            stateMotor.add(mv0.copy(e12).multiplyScalar(state.elements[1].re))
            stateMotor.add(mv0.copy(e12).dualSelf().multiplyScalar(state.elements[1].im))
            stateMotor.add(mv0.copy(e23).multiplyScalar(state.elements[2].re))
            stateMotor.add(mv0.copy(e23).dualSelf().multiplyScalar(state.elements[2].im))
            stateMotor.add(mv0.copy(e31).multiplyScalar(state.elements[3].re))
            stateMotor.add(mv0.copy(e31).dualSelf().multiplyScalar(state.elements[3].im))
            stateMotor.normalize()
            // stateMotor.log()
        }

        if(0) {
            //from the thingy
            let alpha = state.elements[0]; let beta = state.elements[1]; let gamma = state.elements[2]; let delta = state.elements[3]

            let sinOmega = Math.sqrt(gamma.squaredMagnitude())
            let omega = Math.asin(sinOmega)

            alpha.getConjugate(c1)
            beta.getConjugate(c2)
            c1.mul(gamma,c3)
            c3.add(c2.mul(delta,c4))

            alpha.mul(delta, c5)
            c5.sub(beta.mul(gamma, c1))

            // stateMotor.add(mv0.copy(e12).dualSelf() .multiplyScalar( Math.cos(omega) ))
            // stateMotor.add(mv0.copy(e23)            .multiplyScalar( 2. * c3.re ))
            // stateMotor.add(mv0.copy(e23).dualSelf() .multiplyScalar( 2. * c3.im ))
            // stateMotor.add(mv0.copy(e31)            .multiplyScalar( 2. * c5.re ))
            // stateMotor.add(mv0.copy(e31).dualSelf() .multiplyScalar( 2. * c5.im ))

            stateMotor.copy(zeroMv)
            stateMotor[0] = Math.cos(omega)
            stateMotor.add(mv0.copy(e23)            .multiplyScalar( 2. * c3.re ))
            stateMotor.add(mv0.copy(e23).dualSelf() .multiplyScalar( 2. * c3.im ))
            stateMotor.add(mv0.copy(e31)            .multiplyScalar( 2. * c5.re ))
            stateMotor.add(mv0.copy(e31).dualSelf() .multiplyScalar( 2. * c5.im ))
            // stateMotor.log()
            // log(stateMotor)
            state.log()
            log(Math.cos(omega))
            c3.log()
            c5.log()

            

            //the e12 part of stateMotor is unchanged

        }
        
        //qubit 1 is known, you're at a pole: rotations by 180 around the origin
        //qubit 1= 0 or 1 is rotations clockwise or counterclockwise
        //qubit 2 is 0: 
        
        // for(let i = 1; i < 7; ++i) {
            //     let amplitude = state[Math.floor(i / 2)]
            //     stateMotor[i + 4] = i % 2 ? amplitude.im : amplitude.re
            // }
    })
    
    updateFunctions.push(() => {
        for (let i = 0; i < 16; ++i)
            displayedMotor[i] += .03 * (stateMotor[i] - displayedMotor[i])
        displayedMotor.normalize()
    })
    
    //so there'll be controlled not which is a screw motion, and the other screw motions are maybe controlled OR or something?
    const mvGettingVisualized = new Mv()
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

    createS3Scene(initialVertexMvs, initialEdgeMvs)

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
                    let rotorToThisLineAtOrigin = thisLineAtOrigin.mul(e31, mv2).sqrtBiReflection(mv3)
                    rotorToThisLineAtOrigin.toQuaternion(dummy.quaternion)

                    let pos = projectPointOnLine(cameraPoint, mvGettingVisualized, mv4)
                     //works even if e123 part == 0.
                    // log(dummy.position)

                    let orientedDistanceFromCamera = orientedDistancePointPlane( pos, cameraLookingPlane )
                    let isInFrontOfCameraAndMightBeTooFarToSee = orientedDistanceFromCamera > camera.far - .1
                    let isIdealLine = pos.equals(zeroMv)

                    if ( mvGettingVisualized.isIdealLine() || isInFrontOfCameraAndMightBeTooFarToSee ) {
                        let planeAtOriginThroughLine = join(cameraPoint, mvGettingVisualized, mv5)
                        meet(cameraLookingPlane, planeAtOriginThroughLine, mvGettingVisualized)

                        //yoooooou're gonna have a discontinuity
                        //could turn it into a single pixel wide line

                        // mvGettingVisualized.normalize()
                    }
                    else {
                    }
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
}





//so you're gonna get these vertices
//of the opposed ones, one will be in 3D space
//find the ones that 
//project them onto 

//consider the vertices directions
//if this were 3D... could take the dual
//every pair of opposing points should has a dual plane

function createS3Scene(initialVertexMvs)
{
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
                if (j === i)
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
                        if (indexThatIs1 > indexThatIs0)
                            continue

                        for (let signs = 0; signs < 16; ++signs) {

                            initialVertexMvs.push(new Mv().point(
                                (signs & 1 ? -1. : 1.) * coords1[i],
                                (signs & 2 ? -1. : 1.) * coords1[j],
                                (signs & 4 ? -1. : 1.) * coords1[k],
                                (signs & 8 ? -1. : 1.) * coords1[l]).normalize())

                            if ((coords0[i] === 0. && signs & 1) ||
                                (coords0[j] === 0. && signs & 2) ||
                                (coords0[k] === 0. && signs & 4) ||
                                (coords0[l] === 0. && signs & 8))
                                continue
                            initialVertexMvs.push(new Mv().point(
                                (signs & 1 ? -1. : 1.) * coords0[i],
                                (signs & 2 ? -1. : 1.) * coords0[j],
                                (signs & 4 ? -1. : 1.) * coords0[k],
                                (signs & 8 ? -1. : 1.) * coords0[l]).normalize())
                        }
                    }
                }
            }
        }
        log(initialVertexMvs.length)
    }

    //600 cell
    if (0) {
        let gr = (Math.sqrt(5.) + 1.) / 2.
        let lengthOfTheseVertsWithoutMul = Math.sqrt(1. + gr * gr)
        // Edge length in the 4D sphere is 360 / 10 = 36 degrees
        let coords = new Float32Array([
            0., 1., gr,
            gr, 0., 1.,
            0., -1., gr,
            -gr, 0., 1.,
            -1., gr, 0.,
            1., gr, 0.,
            gr, 0., -1.,
            1., -gr, 0.,
            -1., -gr, 0.,
            -gr, 0., -1.,
            0., 1., -gr,
            0., -1., -gr,
        ])
        let verts = Array(coords.length / 3)
        let mul = Math.tan(TAU / 10.) / lengthOfTheseVertsWithoutMul
        for (let i = 0; i < verts.length; ++i)
            verts[i] = new Mv().point(coords[i * 3 + 0] * mul, coords[i * 3 + 1] * mul, coords[i * 3 + 2] * mul).normalize()
        let edgeLen = distancePointPoint(verts[0], verts[2])

        //maybe all you're doing is making a nice interface for blender? Definitely worthwhile

        {
            initialVertexMvs.length = verts.length
            verts.forEach((v, i) => {
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
            if (coordSum > 0.)
                addLineAndItsDual(e123, verts[i])

            for (let j = i + 1, jl = verts.length; j < jl; ++j) {
                if (distancePointPoint(verts[i], verts[j]) < edgeLen * 1.1)
                    addLineAndItsDual(verts[i], verts[j])
            }
        }
    }
}

function initDirectControlOfMotor(stateMotor) {
    let controlsArray = [
        e31, "j", "l",
        e23, "t", "g",
        e03, "w", "s",
        
        e12, "a", "d",
        e01, "f", "h",
        e02, "i", "k",
        // 
    ]

    for (let i = 0, il = controlsArray.length / 3; i < il; ++i) {
        let gate = controlsArray[i * 3].sqrtBiReflection().sqrtBiReflection()
        bindButton(controlsArray[i * 3 + 1], () => {
            stateMotor.mul(gate, mv0)
            stateMotor.copy(mv0)
            // stateMotor.log()
        })
        bindButton(controlsArray[i * 3 + 2], () => {
            let reverseGate = gate.reverse(mv1)
            stateMotor.mul(reverseGate, mv0)
            stateMotor.copy(mv0)
        })
    }
}