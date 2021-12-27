/*
    Definitely show:
        No hidden variables
            Bell basis, rotational invariance
            Maximal entanglement
            "if Alice measures her qubit in any basis, the state of Bob’s qubit collapses to whichever state she got for her qubit"
        no-cloning (ab != 0 <=> can't copy, very simple)
        How to read off the expectation values
            A "basis" is a way of looking at things and taking measurements on them
            Measuring device is probably some kind of angle-measurer-looking-thing
        Gates
            NOT ("Pauli Z" or w/e)
            CNOT
            Ising coupling
            square root of not
            Tensor product of two states
            CNOT a->b, CNOT b->a, CNOT a->b = swap somehow
        teleportation - possibly only needs the two?
            And it allows you to connect to quantum cryptography
        Grover's algorithm
    Would be nice to show (maybe more qubits needed):
        "negative probabilities" formulation https://cognitivemedium.com/assets/qm-interpretation/Feynman.pdf
        free will

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

    Presentation style:
        Split screen
        Do have oculus tracker. Try doing it as if in a mirror. 

    If this was going to work, wouldn't it work in CGA? And wouldn't Chris have found it?
    "vectors are points" would have to be quite toxic
    
    Dodecahedral honeycomb
        So you're making trivectors with, what, the five-fold and threefold rotation of the dodecahedron?
        Aaaaaand then you have a translation as well?

    Metaphysics
        Is it that everything appears in experiment to be a rotation when actually some things are reflections?

    A problem might be that the CNOT is not a reflection in the unitary representation of pin
    In which case you're back to the previous square, because you don't know if unitary reps are 

    Take the quaternion pair. one is 1,e12,e23,e31 the other is that * I.

    How about showing ordinary logic? A classical CNOT

    People have this idea of "the controlled not gate", and it's a particular set of 0s and 1s
    But clearly you should be able to change some -1s and "i"s or whatever and it's essentially doing the same thing
    i.e. surround it with some paulis
    And really what's going on is this rotational relation you can show
    I mean if you have some crazy business affecting qubit A, and after all that you apply it to the untouched B, what happens?

    Separable = isoclinic?

    Visualizations
        The thing itself
        The gates. Even if you only have two qubit gates, nice for them to know notation / have something to keep track of what you've done
        Show ordinary hopf fibration obv. Quite interesting in pga view, set of lines
        Ordinary bloch sphere
        Ordinary 2D elliptic PGA sphere which you maniupulate by moving its projection around. Most informative thing you can have is probably latitude lines
        A measurement device that works across all of these?

    Script - "But what does quantum entanglement LOOK LIKE?"
        Quantum entanglement is, without exaggeration, one of the strangest things ever discovered.
        It's central to quantum physics so it's important if you want to understand why the periodic table has this shape, or how computer chips are made,
        But for me entanglement most intriguing because of its implications for philosophy, metaphysics, and epistemology. In a sense you can resolve the schrodinger's cat paradox
        In this video I want to give an intuitive sense for what entanglement is, which I'll do using this visualization of it

        The gnomonic projection is simply what you see if you're at the center of the globe (so maybe zoom in on the real viz?)
        We can do a sequence of moves on the surface of the globe by rotating around different points on it

        Need some cute portable thing that's only ever 00 or 11. A pair of teenage girls where one of them has said she liked/didn't like the movie
        We're going to make a single object that exists in two separate pieces, like a pair of semi-matching socks

        "When" "you" measure "your" qubit, you join the universe where your qubit was that result,
        and you know what universe that's going to be for your partner

        

        If we take an ordinary sphere and imagine an ant on its surface, 

    Coooool: the fact that the dof grows quadratically rather than exponentially

    "Partial trace" is one way of separating out states




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




    Is it actually true?
        Imagine an object superimposed on its rotation by 90 degrees. That is the unit complex number. No phase necessary because you haven't had to choose "where the unit is". It does somewhat become that way because you say "well, *I* am looking at it at this angle...

        Multiple dofs are probably tied up in "your choice of what the identity looks like"

        For each complex number, choose a screw axis, the phase gives the rotation around that axis and the magnitude gives the translation along it? HUUUUGE problem with magnitude is it has this bullshit about starting from 0 (from a "corner of the room". You're probably better off thinking about the real part and the imaginary part

        *****The real parts are constrained to a 3-sphere in 4D. The imaginary parts, well one of them doesn't exist. Sooooo, 3 imaginary parts = 3 euler angles ***** NO, 3 *PHASES*, YOU DO HAVE 4 IMAGINARY PARTS
        p1 = (Re(c1), Re(c2), Re(c3), Re(c4))
        p2 = (Im(c1), Im(c2), Im(c3), Im(c4))
        Both points in 4D. Magnitude constraint. Probably their magnitudes are like p1^2 + p2^2 = 1
        Maybe, Magnitude of p1 is angle1, magnitude of p2 is angle2? Buuuuut probably there's only one dof between them since they're on a circle, like they're sin and cos of some angle
        Leftover are 2 unit 4-vectors (unless one of them is zero!!!)
        Which correspond to points in your space
        Join those points, get a line, take the rotation by angle 1 and "translation" by angle 2 along that line?



        The effect of the magnitude constraint is going to have some split between impacting the real part and the imaginary part
        So, this whole shit will have some non-visualizable-as-a-motor part that you'll need to shift around to make it visualizable as a motor
        The hope is that in the case of unentangled that looks like translation or rotation, whereas if entangled, not so much





        In 4D, you have the 4 basis planes (of the 6!). Can distinguish eg


        Projectivizing: taking a space like R2 and adding a boundary to it that you can be on
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