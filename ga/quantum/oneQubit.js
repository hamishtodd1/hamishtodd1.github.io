/*
    Circuit viz
    specifying a point
    a line reflection
    a glide reflection even

    Figure out what the squared amplitudes look like in this view

    Current plan
    Work on viz of paulis and rotations and hadamard applied to one gate
    See what phase shift looks like

    left and right directions are 1 and 0, e1 is sigmaX is NOT

    Phase shift is unseen

    The fact that phase shift is like pauli-Z is very strange
    If you think about it, for points, it's like a point reflection

    Maybe you're multiplying by (not sandwiching!) - line reflection

    Do want to be able to pull camera back and see that it's actually 3D, lines are circles

    A rotor has a U(1) gauge. Both rot and trans (if in elliptic space certainly)
    Quadreflection has two surely?
*/

async function initOneQubit() {
    let texLoader = new THREE.TextureLoader().setCrossOrigin(true)

    let globeRadius = 1.

    stateMv = new Mv()
    stateMv[0] = 1.

    //surroundings
    {
        let portholeRadius = .147
        let hiderGeo = new THREE.RingGeometry(portholeRadius * 1.06, 20., 128, 1)
        var hider = new THREE.Mesh(hiderGeo, new THREE.MeshBasicMaterial({ color: 0xCCCCCC }))
        scene.add(hider)
        hider.position.z = camera.position.z - camera.near - .01

        let geo = new THREE.RingGeometry(portholeRadius, portholeRadius*1.03, 128, 1)
        var lineAtInfinityIndicator = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
        scene.add(lineAtInfinityIndicator)
        lineAtInfinityIndicator.position.z = hider.position.z + .005
    }

    let mousePosIndicator = new THREE.Group()//Mesh(new THREE.SphereBufferGeometry(.04))
    {
        let clockwiseMat = new THREE.MeshBasicMaterial({
            transparent: true,
            depthTest: false
        })
        texLoader.load("data/clockwise.png", function (texture) {
            clockwiseMat.map = texture
            clockwiseMat.needsUpdate = true
        })
        let anticlockwiseMat = new THREE.MeshBasicMaterial({
            transparent: true,
            depthTest: false
        })
        texLoader.load("data/anticlockwise.png", function (texture) {
            anticlockwiseMat.map = texture
            anticlockwiseMat.needsUpdate = true
        })

        let geo = new THREE.PlaneBufferGeometry(.15, .15)
        var clockwiseMesh = new THREE.Mesh(geo,clockwiseMat)
        var anticlockwiseMesh = new THREE.Mesh(geo, anticlockwiseMat)
        mousePosIndicator.add( clockwiseMesh, anticlockwiseMesh )
    }
    let clockwise = true
    bindButton("w",()=>{clockwise = !clockwise})
    let mousePosZZero = new THREE.Vector3()
    let mouseMv = e12.clone()
    scene.add(mousePosIndicator)
    updateFunctions.push(()=>{
        mouse.getZZeroPosition(mousePosZZero)
        
        let infinityRadius = 1.9
        let doingStuffAtInfinity = mousePosZZero.length() > infinityRadius
        if (doingStuffAtInfinity)
            mousePosZZero.setLength(infinityRadius)
        lineAtInfinityIndicator.visible = doingStuffAtInfinity

        mousePosIndicator.position.copy(mousePosZZero)
        mousePosIndicator.position.sub(camera.position).setLength(globeRadius).add(camera.position)

        let v = new THREE.Vector3()
        v.copy(mousePosIndicator.position).sub(camera.position)
        v.setLength(1.)

        ourVecToMv(v, mouseMv, doingStuffAtInfinity)
        if(!clockwise)
            mouseMv.multiplyScalar(-1.)

        clockwiseMesh.visible = clockwise
        anticlockwiseMesh.visible = !clockwise
    })

    function ourMvToVec(pointMv,targetVec) {
        //could have the thing about being inside thingy
        targetVec.z = -pointMv[8]
        targetVec.y = pointMv[9]
        targetVec.x = pointMv[10]
    }
    function ourVecToMv(vec, targetMv, ideal) {
        targetMv.copy(zeroMv)

        //e1 is x axis, e2 is y, e3 is z
        targetMv[9] = vec.y
        targetMv[10] = vec.x
        if (!ideal)
            targetMv[8] = -vec.z
        else
            targetMv[8] = 0.
    }

    {
        //want rotations really
        let ops = [
            "pauliX",
            "pauliX",
            "pauliY",
            "pauliY",
            "pauliX",
            "pauliZ",
            "hadamard",
            "hadamard",
            "hadamard",
            "pauliX",
            "pauliZ",
        ]
        let equivalents = {
            "pauliX": e1.clone(),
            "pauliY": e2.clone(),
            "pauliZ": e3.clone(),
            "hadamard": new Mv().copy(e1).add(e3).normalize(),
        }
        let stateMat = new ComplexMat(2, [
            [1., 0.], [0., 0.],
            [0., 0.], [1., 0.],
        ])
        let oldStateMats = Array(ops.length)
        for (let i = 0; i < ops.length; ++i)
            oldStateMats[i] = new ComplexMat(2)

        let oldStateMvs = Array(ops.length)
        for (let i = 0; i < ops.length; ++i)
            oldStateMvs[i] = new Mv()
            
        let stateMv = new Mv()
        stateMv[0] = 1.
        for(let i = 0; i < ops.length; ++i) {
            stateMat.mul(eval(ops[i]), oldStateMats[i])
            stateMat.copy(oldStateMats[i])

            // equivalents[ops[i]].sandwich(stateMv,mv0)
            stateMv.mul(equivalents[ops[i]],oldStateMvs[i])
            stateMv.copy(oldStateMvs[i])

            for(let j = 0; j < i; ++j) {
                if( stateMat.similarTo(oldStateMats[j]) &&
                    !stateMv.similarTo(oldStateMvs[j]) ) {
                    log("ERROR: Matrix multivector discrepancy. Current state:")
                    stateMat.log()
                    stateMv.log()

                    log("A previous state:")
                    oldStateMats[j].log()
                    oldStateMvs[j].log()
                }
            }
        }
    }

    {
        //really feels like an epicycle, but maybe when you perform a line reflection WHILE THINKING ABOUT A PLANE THE LINE IS IN
        //it acts like a plane reflection
    }

    //you want multiple things with a few gestures
    //rotation: click at a point and move your mouse around, rotates where you clicked
    //reflection: click and drag, 
    //glide reflection: click and drag
    //point reflection is rotation
    //remember you want to reflect around points at infinity
    //one thing that might be nice is a series of gestures giving you a series of things

    {
        var inside = true
        bindButton("z", () => { inside = !inside })
    
        var globe = new THREE.Mesh(new THREE.SphereBufferGeometry(globeRadius, 32, 32), new THREE.MeshBasicMaterial({
            side: THREE.BackSide
        }))
        globe.position.copy(camera.position)
        scene.add(globe)
        
        var fadeyGlobe = new THREE.Mesh(new THREE.SphereBufferGeometry(globeRadius, 32, 32), new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            transparent: true
        }))
        scene.add(fadeyGlobe)
        updateFunctions.push(() =>{
            fadeyGlobe.position.copy(globe.position)
            fadeyGlobe.quaternion.copy(globe.quaternion)
        })
    
        texLoader.load("../common/data/earthColor.png", function (texture) {
            globe.material.map = texture
            globe.material.needsUpdate = true
            fadeyGlobe.material.map = texture
            fadeyGlobe.material.needsUpdate = true
        })

        updateFunctions.push(() => {
            let dest = inside ? camera.position.z : -camera.position.z / 4.
            globe.position.z += (dest - globe.position.z) * .1
            fadeyGlobe.material.opacity += .03 * (inside ? -1. : 1.)
            fadeyGlobe.material.opacity = clamp(fadeyGlobe.material.opacity, 0., 1.)
        })

        let myMatrix = new THREE.Matrix4()
        let xColumn = new THREE.Vector3()
        let yColumn = new THREE.Vector3()
        let zColumn = new THREE.Vector3()
        let columns = [xColumn,yColumn,zColumn]
        // stateMv.copy(e12)
        updateFunctions.push(()=>{
            xColumn.set(1., 0., 0.)
            yColumn.set(0., 1., 0.)
            zColumn.set(0., 0., 1.)           

            columns.forEach((column,i)=>{
                // debugger
                // if(i===2)
                //     debugger
                ourVecToMv(column, mv1, false)
                stateMv.sandwich(mv1, mv2)
                if(stateMv.grade() === 1)
                    mv2.multiplyScalar(-1.)
                ourMvToVec(mv2, column)

                myMatrix.elements[i*4+0] = column.x
                myMatrix.elements[i*4+1] = column.y
                myMatrix.elements[i*4+2] = column.z
                // log(column)
            })
            // log(xColumn)

            myMatrix.elements[3 * 4 + 0] = globe.position.x
            myMatrix.elements[3 * 4 + 1] = globe.position.y
            myMatrix.elements[3 * 4 + 2] = globe.position.z

            myMatrix.decompose(globe.position, globe.quaternion, globe.scale) //xColumn unused
        })
    }

    {
        const torus = new THREE.Mesh(new THREE.TorusGeometry(globeRadius, .008, 16, 100), new THREE.MeshBasicMaterial({ color: 0xffff00 }))
        scene.add(torus);
        const torusLine = e1.clone() //a 1-reflection
        //an a rotation gate (which affects one qubit) is an orthogonal 2-reflection

        const mvToJoinTo = e12.clone()
        const initialMouseMv = new Mv()
        const e0MeetInitialMouse = new Mv()

        bindButton("q", () => {
            initialMouseMv.copy(mouseMv)
            meet(initialMouseMv, e0, e0MeetInitialMouse)
            mvToJoinTo.copy(e12)
        }, null, () => {
            if (!(mouseMv.equals(initialMouseMv)))
                mvToJoinTo.copy(mouseMv)
            join(e0MeetInitialMouse, mvToJoinTo, torusLine)
        },false,()=>{
            product(torusLine,stateMv,mv1)
            stateMv.copy(mv1)
            
            //sooooo, next might be visualizing the circuit
            //or the points being transformed by it
            //the mapping is:
        })

        updateFunctions.push(() => {
            torus.position.copy(globe.position)

            // mv0.copy(e3)
            // mv0.multiplyScalar(Math.sin(frameCount * .05))
            // add(e1, mv0, torusLine)
            torusLine.normalize()
            // torusLine.log()

            let e3Component = torusLine[4]
            if (e3Component === 1. || e3Component === -1.) {
                //maybe it's the rim
            }

            let torusRotorSquared = mv1
            torusRotorSquared.copy(e3)
            product(e3, torusLine, torusRotorSquared)

            let torusRotor = mv2
            torusRotorSquared.sqrtBiReflection(torusRotor)
            torusRotor.toQuaternion(torus.quaternion)
        })
    }
}