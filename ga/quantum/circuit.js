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

People to show when working consistently
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

const NUM_QUBITS = 2
const GATE_DIMENSION = .4
const SHELL_RADIUS = GATE_DIMENSION * .9 * .5
const WIRE_SPACING = .66 / (NUM_QUBITS - 1) //padding is subjective
const maxGatesPerWire = 4
const circuitHolder = new THREE.Object3D()
const WIRE_LENGTH = 2.2
scene.add(circuitHolder)

const WIRES = Array(NUM_QUBITS)
const circuitGates = []

async function initCircuit() {

    // {
    //     let example = new ComplexMat(2, [
    //         [0., 0.], [0., -1.],
    //         [1./Math.SQRT2, 1./Math.SQRT2], [0., 0.],
    //     ])

    //     //take C = example*example transpose
    //     let exampleStar = example.conjugateStar()
    //     let exampleExampleStar = example.mul(exampleStar)
    //     let detEesMinusLambdaI = 

    //     return
    // }
    
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

    
    for(let j = 0; j < NUM_QUBITS; ++j) {
        circuitGates[j] = []
        for(let i = 0; i < maxGatesPerWire; ++i)
            circuitGates[j][i] = null
    }
    getWire = function(gate) {
        if (circuitGates[0].indexOf(gate) !== -1)
            return 0
        else if (circuitGates[1].indexOf(gate) !== -1)
            return 1
        else
            return -1
    }

    // circuitHolder.position.y = .4
    // circuitHolder.scale.setScalar(10.)
    initRectangles(circuitHolder)

    const bgWidth = 3.2
    const bgHeight = 1.5
    const bg = Rectangle({
        w: bgWidth, h: bgHeight,
        getPosition: (p) => {
            p.set(0., 0., -.001)
        }
    })
    bg.castShadow = true

    function putLowestUnusedGateOnWire(gateArray, wireIndex, indexInArray) {

        //HACK because we don't understand how to reverse a 4x4 we say all tqgs are in a certain direction
        if(gateArray === tqgs && wireIndex === 1)
            wireIndex = 0

        mouse.raycaster.intersectZPlane(0., v0)
        let positionAlongWire = v0.x + WIRE_LENGTH / 2.

        if(indexInArray === undefined)
            indexInArray = Math.floor( (positionAlongWire / WIRE_LENGTH) * maxGatesPerWire )
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

    let rotators = []
    let tqgs = []
    let paulis = []
    let gateTypes = [paulis, rotators, tqgs]
    initGates(paulis, rotators, tqgs)

    let wireThickness = .03
    let wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    for (let i = 0; i < NUM_QUBITS; ++i) {
        let wire = Rectangle({
            haveFrame: false,
            h: wireThickness,
            w: WIRE_LENGTH,
            mat: wireMaterial,
            getPosition: (p) => {
                p.set(0., 0., 0.)

                p.y -= WIRE_SPACING * (wire.i - (NUM_QUBITS - 1) / 2.)
                p.z = bg.position.z / 2.

                initialStateBox.position.set(
                    wire.position.x - (wire.scale.x / 2. + GATE_DIMENSION / 2.),
                    wire.position.y,
                    wire.position.z)
                finalStateBox.position.set(
                    wire.position.x + (wire.scale.x / 2. + GATE_DIMENSION / 2.),
                    wire.position.y,
                    wire.position.z)
            },

            onClick: () => {
                log("yes, clicked wire")
            }
        })
        wire.i = i
        WIRES[i] = wire

        let initialStateBox = Rectangle({
            w: GATE_DIMENSION,
            h: GATE_DIMENSION,
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
        let initialStateBs = new CombinedBsKb(initialStateBox)

        updateFunctions.push(()=>{
            c0.set(0.,0.)
            c1.set(0.,0.)
            initialStateBs.setFromAbcd(initialState.el[0], c0, initialState.el[1],c1)
        })

        let finalStateBox = Rectangle({
            w: GATE_DIMENSION,
            h: GATE_DIMENSION
        })
        wire.finalStateViz = new CombinedBsKb(finalStateBox)
    }

    circuitState = new ComplexVector(4) //or, matrix? but how to apply?
    let stepMat = identity4x4.clone()
    let cm2a = new ComplexMat(2)
    let cm2b = new ComplexMat(2)
    updateFunctions.push(() => {
        let q1 = WIRES[0].initialState.el
        let q2 = WIRES[1].initialState.el
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

        WIRES[0].finalStateViz.setFromAbcd(
            circuitState.el[0], circuitState.el[1],
            circuitState.el[2], circuitState.el[3]
        )
        
        WIRES[1].finalStateViz.setFromAbcd(
            circuitState.el[0], circuitState.el[2],
            circuitState.el[1], circuitState.el[3]
        )
    })

    let gateLayingButtons = ["a", "s", "d"]
    gateLayingButtons.forEach((key, i)=>{
        let gateArray = gateTypes[i]
        bindButton(key,()=>{
            mouse.raycaster.intersectZPlane(WIRES[0].position.z , v0)
            v0.y -= circuitHolder.position.y
            if (Math.abs(v0.x) < WIRES[0].scale.x / 2.) {
                let closerWireIndex = Math.abs(v0.y - WIRES[0].position.y) < Math.abs(v0.y - WIRES[1].position.y) ? 0 : 1
                let newTqg = putLowestUnusedGateOnWire(gateArray, closerWireIndex)
                if(newTqg !== null)
                    newTqg.position.y = bg.position.y
            }
        })
    })

    // WIRES[0].initialState.el[0].re = 0.
    // WIRES[0].initialState.el[1].re = 1.

    roundOffRectangleCreation()

    // putLowestUnusedGateOnWire(paulis, 0, 1)
    // putLowestUnusedGateOnWire(rotators, 0, 1)
    // putLowestUnusedGateOnWire(tqgs, 0, 2)
}