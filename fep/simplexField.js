/*
    Alright the metric is diag(1/p1, 1/p2, 1/p3, 1/p4)

    Could have colored lines connected them to the sides
        Which then animate into a 4-bar bar chart

    "Geometry of quantum states"
        "majorization"
        Uniformity is kinda interesting. Maximal ignorance

    Taking the triangle and applying similar logic to the CGA viz...
        If you go outside the triangle, it's just like you've reflected in it with an elliptic reflection

    Orthostochastics
        Just, Bij = Oij ^ 2
            There exist quite a few O's for every B
            Plausibly one of them is easiest
            Some stochastic matrices are uninvertible, so they're a monoid
        Each positive point is associated with 7 others
        A cuboid I suppose
            Consider the edges of that cuboid
            They are connected by edges that are orthogonal to the simplex boundaries
            So that's a 3D object
        What are the "axes"?

    Read geometry of quantum states
*/

function initSimplexField() {

    let simplexScene = new THREE.Group()
    scene.add(simplexScene)

    let holding = false
    document.addEventListener('mousedown', (event) => { 
        if(event.button == 0)
            holding = true 
    })
    document.addEventListener('mouseup', (event) => { 
        if(event.button == 0)
            holding = false 
    })
    document.addEventListener('mousemove', (event) => {
        if (holding && mousePosDiff.lengthSq() > 0) {
            let angle = mousePosDiff.length() * .7
            v1.copy(mousePosDiff).normalize()
            q1.x = -v1.y * Math.sin(angle / 2.)
            q1.y = v1.x * Math.sin(angle / 2.)
            q1.z = 0.
            q1.w = Math.cos(angle / 2.)
            q2.copy(simplexScene.quaternion)
            simplexScene.quaternion.multiplyQuaternions(q1, q2)
        }
    })

    updateSimplexField = () => {
        let sample = generateSample()
        // log(sample)

        states.forEach( state => state.update(sample) )
    }

    normalizeProbability = (p) => {
        if(p.x < 0.) p.x = 0.
        if(p.y < 0.) p.y = 0.
        if(p.z < 0.) p.z = 0.
        if(p.w < 0.) p.w = 0.
        let total = p.x + p.y + p.z + p.w
        p.multiplyScalar(1. / total)
        return p
    }

    let uniform = new THREE.Vector4().setScalar(.25)
    let vec4 = new THREE.Vector4()
    let x4 = new THREE.Vector4().set(1.-.25, 0.-.25, 0.-.25, 0.-.25)
    let y4 = new THREE.Vector4().set(0.-.25, 1.-.25, 0.-.25, 0.-.25)
    let z4 = new THREE.Vector4().set(0.-.25, 0.-.25, 1.-.25, 0.-.25)
    let w4 = new THREE.Vector4().set(0.-.25, 0.-.25, 0.-.25, 1.-.25)
    let fimInverse = new THREE.Matrix4()

    function generateSample() {
        let s = Math.floor(7 * Math.random())
        //strong bias toward 3
        return Math.min(s, 3)
    }

    let stateRadius = .1
    let stateGeo = new THREE.SphereGeometry(stateRadius)
    let eyeballGeo = new THREE.SphereGeometry(stateRadius * .4)
    let eyeballMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
    let pupilMat = new THREE.MeshPhongMaterial({ color: 0x000000 })
    let pupilGeo = new THREE.SphereGeometry(stateRadius * .45, 32, 16, 0.,TAU, 0.,Math.PI * .08)
    let lineMat = new THREE.LineBasicMaterial({ color: 0x000000 })
    let numTrailVerts = 2000
    let states = []
    let gradient = new THREE.Vector4()
    class SimplexState extends THREE.Mesh {
        constructor() {
            super(stateGeo, new THREE.MeshPhongMaterial())
            states.push(this)
            this.castShadow = true
            simplexScene.add(this)
            obj3dsWithOnBeforeRenders.push(this)

            this.p = new THREE.Vector4().copy(uniform)
            this.p.set(.5,.5,0.,0.)

            let lineGeo = new THREE.BufferGeometry()
            let linePos = new Float32Array(numTrailVerts * 3 * 2)
            lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
            this.trail = new THREE.LineSegments(lineGeo, lineMat)
            simplexScene.add(this.trail)

            this.eyes = []
            for(let i = 0; i < 2; ++i) {
                let eyeball = new THREE.Mesh(eyeballGeo, eyeballMat)
                this.eyes.push(eyeball)
                // this.add(eyeball)
                let pupil = new THREE.Mesh(pupilGeo, pupilMat)
                pupil.rotation.x = -TAU / 4.
                eyeball.add(pupil)
                eyeball.position.x = stateRadius * .28
                eyeball.position.z = -stateRadius * .96
            }

            this.trailIndex = 0
                
            this.eyes[1].position.x *= -1.

            obj3dsWithOnBeforeRenders.push(this)
        }

        update(sample)  {


            /*
                Correct thing to do given p:
                    compute M = FIM and its inverse
                    Calculate the ordinary gradient g =-log(P(d|p)
                    p' = p - eps * M^-1 * g

            */

            normalizeProbability(this.p)

            //inverse (?) of the Fisher information matrix
            m1.identity()
            m1.elements[ 0] = this.p.getComponent(0)
            m1.elements[ 5] = this.p.getComponent(1)
            m1.elements[10] = this.p.getComponent(2)
            m1.elements[15] = this.p.getComponent(3)

            // let logLikelihood = -Math.log( this.p.getComponent(sample) )
            gradient.set(0., 0., 0., 0.)
            gradient.setComponent(sample, 1. / this.p.getComponent(sample))
            gradient.applyMatrix4(m1)

            this.p.addScaledVector(gradient, -.01) //why negative? Because we want to go down the gradient
            // log(this.p)

            // this.position.x += .03 * (Math.random() - .5)
            // this.position.y += .03 * (Math.random() - .5)
            // this.position.z += .03 * (Math.random() - .5)
        }

        onBeforeRender() {

            // debugger

            normalizeProbability(this.p)

            {
                vec4.subVectors(this.p, uniform)

                this.position.set(0., 0., 0.)
                this.position.addScaledVector(corners[0].position, vec4.dot(x4))
                this.position.addScaledVector(corners[1].position, vec4.dot(y4))
                this.position.addScaledVector(corners[2].position, vec4.dot(z4))
                this.position.addScaledVector(corners[3].position, vec4.dot(w4))
            }

            this.position.toArray(this.trail.geometry.attributes.position.array, this.trailIndex * 3 * 2)
            this.position.toArray(this.trail.geometry.attributes.position.array, (this.trailIndex * 2 + 1) * 3)
            this.trailIndex = (this.trailIndex + 1) % numTrailVerts
            this.trail.geometry.attributes.position.needsUpdate = true

            this.material.color.setRGB(.5, .5, .5)
            corners.forEach(corner => {
                let dist = this.position.distanceTo(corner.position)
                let coefficient = 1. - dist / 2.
                this.material.color.r += coefficient * corner.material.color.r
                this.material.color.g += coefficient * corner.material.color.g
                this.material.color.b += coefficient * corner.material.color.b
            })
            // let closest = corners.reduce((a, b) => this.position.distanceToSquared(a.position) < this.position.distanceToSquared(b.position) ? a : b)
            // this.lookAt(closest.position)
        }
    }
    window.SimplexState = SimplexState

    let tetGeo = new THREE.TetrahedronGeometry(3./Math.sqrt(3))
    const wireframeGeo = new THREE.WireframeGeometry(tetGeo)
    
    let tet = new THREE.LineSegments(wireframeGeo, new THREE.LineBasicMaterial({ color: 0x000000 }))
    simplexScene.add(tet)
    let backs = new THREE.Mesh(tetGeo, new THREE.MeshLambertMaterial({ color: 0xCCCCCC, side: THREE.BackSide }))
    simplexScene.add(backs)
    backs.receiveShadow = true

    let corners = Array(4)
    for(let i = 0; i < 4; i++) {
        let mat = new THREE.MeshPhongMaterial()
        corners[i] = new THREE.Mesh(stateGeo, mat)
        simplexScene.add(corners[i])
        corners[i].position.setScalar(1.)///Math.sqrt(3.))
    }
    corners[0].material.color.setHex(0xFFFFFF)
    corners[1].material.color.setHex(0xFF0000)
    corners[2].material.color.setHex(0x00FF00)
    corners[3].material.color.setHex(0x0000FF)
    corners[1].position.x *= -1.
    corners[1].position.y *= -1.
    corners[2].position.y *= -1.
    corners[2].position.z *= -1.
    corners[3].position.z *= -1.
    corners[3].position.x *= -1.

    // let numStates = 1
    // for (let i = 0; i < numStates; i++) {
    //     let s = new SimplexState()
    //     s.p.set(
    //         .1+.15*Math.random(), 
    //         .1+.15*Math.random(), 
    //         .1+.15*Math.random(), 
    //         .1+.15*Math.random())
    // }

    return simplexScene
}