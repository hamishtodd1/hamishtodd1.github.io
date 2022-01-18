/*
People to send to
    Michael Nielsen
    Gavin Crooks
    Andrew Steane
    Martti
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
    Dude you met that pontus told you the name of
    Future of coding community. Could do one on geometric algebra, one on

What's the motor taking C to C
    Easy enough to find, for a given point, the point it is sent to
    so you take two copies of point and rotate and move them up, and then add

For marketing QC companies
    make it so you can make a SUPER nice demo of your alg
    Make it so you can have an array of matrices and can embed a threejs demo

az + b and cz + d are both rotation/translations
Well, what's 1/(cz+d)?

Maybe think about its action on the unit circle

Does taking the transpose correspond to measuring the same thing in a different way? Surely




Two points are on the riemann sphere

as a bivector it'll be a point pair, you're exponentiating that

So picture 

f(4x4 C) {
    let mv = new Mv() //it's a quadreflection
    return mv
}

Could consider the circle on the boundary getting mapped from a certain thing on the plane

The function you're trying to make is... 

*/





let stateMotor = null
async function initKleinBall() {


    // matrixToMotor(identity2x2).log()
    // return
    //hooray, it works at least with identity

    stateMotor = new Mv()
    stateMotor[0] = 1.

    

    // if(0)
    {
        let ams = Array(arsenovichMatrices.length)
        arsenovichMatrices.forEach((matArray, i) => {
            ams[i] = new ComplexMat(2, matArray)
        })

        updateFunctions.push(()=>{
            let amIndex = frameCount % ams.length
            matrixToMotor(ams[amIndex], mv0)

            let problematic = false
            for(let i = 0; i < 16; ++i) {
                if (isNaN(mv0[i])) {
                    problematic = true
                    debugger
                    matrixToMotor(ams[amIndex], mv0)
                }
            }
            if (!problematic)
                stateMotor.copy(mv0)
        })
    }

    //niceish animations
    // updateFunctions.push(() => {

    //     let timeSpentOnEach = 9.
    //     let numPossibilities = 2

    //     let currentPossibility = Math.floor( (clock.elapsedTime / timeSpentOnEach) % numPossibilities )
    //     let timeThroughCurrent = clock.elapsedTime % timeSpentOnEach

    //     if (currentPossibility === 1 ) {
    //         let phase = Math.sin(timeThroughCurrent * .7 )

    //         let slightlyOffOrigin = e4.clone().multiplyScalar(phase).add(e3)
    //         slightlyOffOrigin.normalize()
    //         let translator = new Mv()
    //         slightlyOffOrigin.mul(e3, translator)

    //         stateMotor.copy(oneMv)
    //         stateMotor.mul(translator, mv0)
    //         stateMotor.copy(mv0)
    //         stateMotor.normalize()
    //     }
    //     if (currentPossibility === 0) {
    //         let ourTime = timeThroughCurrent * .7
    //         let phase = Math.sin(ourTime)

    //         let lineSlightlyOffOrigin = e41.clone().multiplyScalar(0.8).add(e31)
    //         lineSlightlyOffOrigin.normalize()
    //         lineSlightlyOffOrigin.multiplyScalar(phase)
    //         lineSlightlyOffOrigin[0] = Math.cos(ourTime)

    //         stateMotor.copy(oneMv)
    //         stateMotor.mul(lineSlightlyOffOrigin, mv0)
    //         stateMotor.copy(mv0)
    //         stateMotor.normalize()
    //     }
    // })

    let wholeThing = new THREE.Object3D()
    wholeThing.rotation.y += -TAU / 4.
    {
        scene.add(wholeThing)
    
        onClicks.push({
            start: () => { },
            during: () => {
                mouse.rotateObjectByGesture(wholeThing)
            },
            end: () => { },
            z: () => 0.
        })
    }

    {
        let shadowCaster = new THREE.Mesh(new THREE.IcosahedronGeometry(1., 2), new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: .00001
        }))
        shadowCaster.castShadow = true
        shadowCaster.receiveShadow = false
        wholeThing.add(shadowCaster)
        await initLights(shadowCaster)
    }

    {
        var initialMvs = []

        //just the three planes
        // for (let i = 0; i < 3; ++i) {
        //     let im = new Mv()
        //     im.copy(zeroMv)
        //     im[i + 1] = 1.
            
        //     initialMvs[i] = im
        // }

        
        let icoverts = [
            [0., PHI,-1.],
            [0., PHI, 1.],
            [0.,-PHI,-1.],
            [0.,-PHI, 1.],
            [ PHI,-1.,0.],
            [ PHI, 1.,0.],
            [-PHI,-1.,0.],
            [-PHI, 1.,0.],
            [ 1.,0., PHI],
            [-1.,0., PHI],
            [ 1.,0.,-PHI],
            [-1.,0.,-PHI]]

        let translator = new Mv()
        icoverts.forEach((v)=>{
            // if(initialMvs.length !== 0)
            //     return

            let im = new Mv()
            im[1] = v[0]
            im[2] = v[1]
            im[3] = v[2]
            im.normalize()

            for(let i = 0; i < 2; ++i) {
                
                e4.mul(im,translator)
                translator.normalize()
                translator.multiplyScalar(.11 * (i+.5))
                translator[0] += 1.

                let translated = translator.sandwich(im)

                initialMvs.push(translated)
            }
        })
    }

    function putSphereHereAtFrameCountZero(pt) {
        if(frameCount !== 0)
            return

        let m = new THREE.Mesh(new THREE.SphereGeometry(.05))
        pt.toVector(m.position)
        wholeThing.add(m)
    }

    // putSphereHereAtFrameCountZero(new Mv().point(1.,0.,0.,1.))
    // putSphereHereAtFrameCountZero(new Mv().point(0.,1.,0.,1.))
    // putSphereHereAtFrameCountZero(new Mv().point(0.,0.,1.,1.))
    // return

    {
        let disks = []
        let diskGeometry = new THREE.CircleGeometry(1., 126)

        // let sph = new THREE.Mesh(new THREE.SphereBufferGeometry(1.,64,64),new THREE.MeshPhongMaterial({
        //     transparent: true,
        //     opacity: .4
        // }))
        // wholeThing.add(sph)
        // wholeThing.rotation.y += Math.PI

        let numPlanes = initialMvs.length
        for (let i = 0; i < numPlanes; ++i) {
            // let colorHex = numPlanes
            let disk = new THREE.Mesh(diskGeometry, niceMat(i / (numPlanes - 1.)))
            disk.castShadow = false
            disk.receiveShadow = false
            disks[i] = disk
            wholeThing.add(disk)

            disk.initialMv = initialMvs[i]

            updateFunctions.push(() => {
                // if (disk.initialMv[1] !== 0.)
                //     debugger

                let mvToVisualize = mv4
                stateMotor.sandwich(disk.initialMv, mvToVisualize)
                mvToVisualize.normalize()
                
                let lineThroughOriginOrthogonalToPlane = mv0
                e123.inner(mvToVisualize, lineThroughOriginOrthogonalToPlane)
                
                let planeAtOrigin = mv1
                lineThroughOriginOrthogonalToPlane.mul( e123, planeAtOrigin )
                planeAtOrigin.normalize()
                //alternatively, e4 part = 0.

                let zToMvRotor = mv2
                planeAtOrigin.mul(e3,zToMvRotor)
                zToMvRotor.sqrtBiReflection(zToMvRotor)
                zToMvRotor.toQuaternion(disk.quaternion)

                let planePosition = mv3
                lineThroughOriginOrthogonalToPlane.mul(mvToVisualize, planePosition)
                planePosition.normalize()
                // putSphereHereAtFrameCountZero(planePosition)
                planePosition.toVector(disk.position)
                
                let diskRadius = Math.sqrt(1. - disk.position.lengthSq())
                disk.scale.setScalar(diskRadius)
            })
        }
    }
}