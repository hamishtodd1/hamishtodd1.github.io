
let stateMotor = null
async function initKleinBalls() {

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

        let octaVerts = [
            [ 1.,0.,0.],
            [-1.,0.,0.],
            [0., 1.,0.],
            [0.,-1.,0.],
            [0.,0., 1.],
            [0.,0.,-1.],
        ]
        let octaTris = [ //counter clockwise
            [0,2,4],
            [1,4,2],
            [4,3,0],
            [2,0,5],

            [1,5,3],
            [0,3,5],
            [3,4,1],
            [5,1,2]
        ]

        function pointFromVertIndex(vertArray,i,target) {
            let v = vertArray[i]
            target.point(v[0], v[1], v[2],1.)
            return target
        }

        function pushFromTri(vertArray,t, i) {
            pointFromVertIndex(vertArray,t[0], mv0)
            pointFromVertIndex(vertArray,t[1], mv1)
            pointFromVertIndex(vertArray,t[2], mv2)
            mv0.join(mv1, mv3).join(mv2, mv4)

            initialMvs.push(mv4.clone())
        }

        // octaTris.forEach((t, i) => { pushFromTri(octaVerts,t,i)})

        // initialMvs.push(new Mv().plane(1.,1.,1.,0.))
        // initialMvs.push(new Mv().plane(-1.,1.,1.,0.))
        // initialMvs.push(new Mv().plane(1.,-1.,1.,0.))
        // initialMvs.push(new Mv().plane(1.,1.,-1.,0.))

        let cubeVerts = [
            [1.,1.,1.],

            [-1.,1.,1.],
            [1.,-1.,1.],
            [1.,1.,-1.],

            [1.,-1.,-1.],
            [-1.,1.,-1.],
            [-1.,-1.,1.],

            [-1.,-1.,-1.],
        ]
        cubeVerts.forEach((v) => { v[0] /= Math.sqrt(3.); v[1] /= Math.sqrt(3.); v[2] /= Math.sqrt(3.)})
        let cubeTris = [
            [0,1,2],
            [0,2,3],
            [0,3,1],

            [7,5,4],
            [7,6,5],
            [7,4,6]
        ]

        cubeTris.forEach((t, i) => { pushFromTri(cubeVerts,t,i)})

        // initialMvs.push(new Mv().plane(1., 0., 0., 0.))
        // initialMvs.push(new Mv().plane(0., 1., 0., 0.))
        // initialMvs.push(new Mv().plane(0., 0., 1., 0.))

        // let translator = new Mv()
        // icoverts.forEach((v)=>{
        //     let im = new Mv()
        //     im[1] = v[0]
        //     im[2] = v[1]
        //     im[3] = v[2]
        //     im.normalize()

        //     for(let i = 0; i < 2; ++i) {
                
        //         e4.mul(im,translator)
        //         translator.normalize()
        //         translator.multiplyScalar(.11 * (i+.5))
        //         translator[0] += 1.

        //         let translated = translator.sandwich(im)

        //         initialMvs.push(translated)
        //     }
        // })
    }

    let shadowCasterGeo = new THREE.IcosahedronGeometry(1., 2)
    let shadowCasterMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: .00001
    })

    let diskGeometry = new THREE.CircleGeometry(1., 126)
    let diskMats = []
    let numPlanes = initialMvs.length
    for (let i = 0; i < numPlanes; ++i)
        diskMats[i] = niceMat(i / (numPlanes - 1.))

    KleinBall = () =>
    {
        let kb = new THREE.Object3D()
        thingsToRotate.push(kb)
        let stateMotor = new Mv()
        stateMotor[0] = 1.
        kb.stateMotor = stateMotor

        let disks = []

        kb.setVisibility = (newVisibility) => {
            for (let i = 0; i < numPlanes; ++i) {
                disks[i].visible = newVisibility
            }    
        }

        for (let i = 0; i < numPlanes; ++i) {
            // let colorHex = numPlanes
            let disk = new THREE.Mesh(diskGeometry, diskMats[i])
            disk.castShadow = false
            disk.receiveShadow = false
            disks[i] = disk
            kb.add(disk)

            let shadowCaster = new THREE.Mesh(shadowCasterGeo, shadowCasterMat)
            shadowCaster.castShadow = true
            shadowCaster.receiveShadow = false
            kb.add(shadowCaster)

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

        return kb
    }
}