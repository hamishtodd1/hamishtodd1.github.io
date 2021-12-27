/*
Rendering
    disks, maybe chop off fragments wiht fragment shader?
*/


/*

Make a thing showing the sphere
Aaaaand then the bloch vector. Might be simple


Could project it back onto the riemann sphere at the origin
If it's unentangled it'll be a single point, it'll be the bloch sphere
You're picking up the plane and moving it around
Where do you move it such that it goes back to being a bloch sphere? Maybe make it and try to find that

Transpose sounds a lot like a reflection


You have the operator space and the planar space
But why have both? Maybe you don't need them

The current projection is also movement taking the identity to that location

I mean you make a choice of "texture". That is the identity


unentangled: either all positive except
for some fixed a and d, amplitudes of |00> and |11>
for fixed b there is unique c, and vice versa
so button to adjust b
there exists c such that ad-bc = 0
and for fixed c there exists
Humm so some unentangled send everything to infinity, some to 0

Want to test the hypothesis that "it's a question of orienting the plane"
It looks like just a labelling. You can do swaps of the 0 and 1 labels and A and B. Swaps matrix horizontally or vertically
If it's unentangled you get a/c, which at least gives info about |0>A / |1>A
You do get a choice of how the matrix is to represent the state

a hope might be that for every unentangled state, the nearby entangled states might all be similar

unentangled states, naievely, aren't functions, they send all the points somewhere specific

Unentangled states are S3xS3
There's some manifold Cl(3,1)+ U Cl(3)+ x Cl(3)+. It's divided into those parts



Mightn't 3,2 be worth exploring? Can you take an algebra p,q, then take p,q+1 and find an isomorphism to p,q over C?


Hmm, you get reflected presumably when you apply a translation bivector from 3,1

In the most extreme case, you could potentially visualize Cl(4,2)+, thinking of rotors as partway-reflections

It'd be lovely if it could turn out that unentangled is stuff like sphere-infinitely-far-away in some direction?

How to do it
    Vertex shader could do a pic

Soooo, shader?
Could transfer in an array of multivectors, and for each pixel, you test "how close am I to this line/circle?""

donuts is a vertex shader job


Make a choice of a qubit to care about and, er, whether to end up with |0>/|1> or |1>/|0>

There's a point

Could be, you have the sphere's dq and the plane's dq
Since it's CGA the plane is a sphere

Mkay, for any unentangled state, interpolate it towards the identity matrix

For shirts:
    Penrose / Girih
    Amman beenker
    Conformal looking stuff
    Cohomology fractal
    Mandelbrot

You've chosen a certain bell state as your identity,  |00> + |11>
If you'd only chosen another 

*/

function initMobTransState() {
    //yo maybe the gates should be rank 4
    //or 2x2 with quaternions?

    let mobiusMat = new ComplexMat(2)

    let s = 1./Math.sqrt(2.)
    mobiusTarget = new ComplexMat(2, [
        [0., 0.], [1., 0.],
        [0., 0.], [0., 0.],
    ])

    let mat1 = new ComplexMat(2)
    //|00> + |11> identity
    //|00> - |11> identity and 180 / point reflection
    //|01> + |10> circle inversion
    //|01> - |10> circle inversion and 180 / point reflection
    //eg you can change between them by changing your projection point?

    //it looks like all the unentangled states, if you perturb them towards |00> + |11>, are different/distinguishable
    //might be worth looking at all unentangled states perturbed a little towards that.

    // mobiusMat.copy(alt)

    //random unentangled state
    //that you're gonna interpolate to identity matrix!
    
    // let mobiusMatrixSwapped = new ComplexMat(2, [
    //     [1., 0.], [0., 0.],
    //     [0., 0.], [1., 0.],
    // ])
    // let swappedHorizontally = false //is a/c concerned with qubit a or qubit b?
    // let swappedVertically = false
    // mobiusMat.forEachElement( (row,col,el) => {
    //     if(swappedHorizontally)
    //         row = 1 - row
    //     if (swappedVertically)
    //         col = 1 - col
        
    //     mobiusMatrixSwapped.set(row,col,el)
    // })


    let transpose = false

    let timeSinceStart = 0.
    let paused = false
    bindButton("y",()=>{paused = !paused})
    bindButton("t",()=>{transpose = !transpose})
    function meanderComplex(c, revsPerSecond, wobblesPerSecond) {
        let theta = revsPerSecond * TAU * timeSinceStart
        let r = Math.cos(wobblesPerSecond * timeSinceStart)
        c.setRTheta(r, theta)
    }

    let rands = []
    for(let i = 0; i < 8; ++i)
        rands[i] = Math.random()

    let cm = new ComplexMat(2)

    let myRot = rz(.04)
    updateFunctions.push(() => {
        if (paused)
            return

        cm.copy(mobiusMat)
        // cm.mul(myRot,mobiusMat)
        
        let zeroToOne = Math.sin(frameCount*.02) * .5 + .5
        if(zeroToOne < .01)
            log("this is about it")
        mobiusMat.forEachElement( (row,col,el) => {
            el.lerp(zeroToOne, mobiusTarget.get(row, col),identity2x2.get(row,col))
        })

        // for(let i = 0; i < 4; ++i)
        //     meanderComplex(mobiusMat.elements[i], (rands[i * 2 + 0] + .3) * 0.3, (rands[i * 2 + 0] + .3) * .3 )
        // if(transpose) {
        //     mobiusMat.transpose(mat1)
        //     mobiusMat.copy(mat1)
        // }
    })

    let cv0 = new ComplexVector(2)
    let cv1 = new ComplexVector(2)
    let c = new Complex()

    let radius = .035
    let pointGeo = new THREE.SphereBufferGeometry(radius)

    let pts = []

    let fullThing = new THREE.Object3D()
    fullThing.add(new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.25),new THREE.MeshPhongMaterial({color:0xF0FF00})))
    scene.add(fullThing)

    let sphere = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(1.,3),new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: .2,
        color: 0x90FF90
    }))
    fullThing.add(sphere)

    //if you know where infinity, 1, and 0 are, you're good
    
    onClicks.push({
        start:() => {},
        during:() => {
            mouse.rotateObjectByGesture(fullThing)
        },
        end: () => {},
        z:() => 0.
    })

    let dim = 20
    let spacing = .4
    for (let i = 0; i < dim; ++i) {
        for(let j = 0; j < dim; ++j) {
            let x = (i - dim / 2. + .5) * spacing
            let y = (j - dim / 2. + .5) * spacing

            let angle = Math.atan2(y, x)
            let hue = (angle + Math.PI) / TAU
            let lightness = 1. - Math.sqrt(x*x+y*y) * .15
            let color = new THREE.Color().setHSL(hue, 1., lightness)

            let mesh = new THREE.Mesh(pointGeo, new THREE.MeshPhongMaterial({color}))
            mesh.initial = new Complex(x,y)
            pts.push(mesh)
            fullThing.add(mesh)
            updateFunctions.push(() => {
                // if (pts.indexOf(mesh) === 15)
                //     debugger
                cv0.elements[0].copy(mesh.initial)
                cv0.elements[1].set(1.,0.)

                // if (pts.indexOf(mesh) === 15)
                //     cv0.log()
                cv0.applyMatrix(mobiusMat, cv1)

                //so elements[1] could be 0!
                cv1.elements[0].div(cv1.elements[1],c)

                // if (pts.indexOf(mesh) === 15)
                //     cv1.log()

                mesh.position.set(c.re, c.im, 0.)
            })
        }
    }
}