/*
    a/c - (ad-bc) / (c*c * (z+d/c))
*/



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

        let translator = new Mv()
        function insertSeriesOfPlanes(startingPlane, n, sep) {
            for (let i = 0; i < n; ++i) {
                e4.mul(startingPlane, translator)
                translator.normalize()
                translator.multiplyScalar(sep * (i + .5 - n / 2.))
                translator[0] += 1.

                initialMvs.push(translator.sandwich(startingPlane).normalize())
            }
        }

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

        // icoverts.forEach((v, i) => {
        //     if (i % 2)
        //         return

        //     let im = new Mv()
        //     im[1] = v[0]
        //     im[2] = v[1]
        //     im[3] = v[2]
        //     im.normalize()

        //     insertSeriesOfPlanes(im, 4, .11)
        // })

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
            if(target === undefined)
                target = new Mv()

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
        // cubeTris.forEach((t, i) => { pushFromTri(cubeVerts,t,i)})

        

        //do that grid. Maybe octagon or hexagon

        // initialMvs.push(new Mv().plane(1., 0., 0., 0.))
        // initialMvs.push(new Mv().plane(0., 1., 0., 0.))
        // initialMvs.push(new Mv().plane(0., 0., 1., 0.))

        

        //----------------LATITUDE AND LONGTITUDE
        let numMeridians = 12
        for (let i = 0.; i < numMeridians / 2.; ++i)
            initialMvs.push(new Mv().plane(Math.cos(TAU*i/numMeridians), 0., Math.sin(TAU*i/numMeridians), 0.))
        insertSeriesOfPlanes(e2, 7, .18)

        // let numMeridians = 8
        // for (let i = 0; i < numMeridians / 2; ++i) {
        //     initialMvs.push(new Mv().plane(Math.cos(TAU * i / numMeridians), 0., Math.sin(TAU * i / numMeridians), 0.))
        //     initialMvs.push(new Mv().plane(0., Math.cos(TAU * i / numMeridians), Math.sin(TAU * i / numMeridians), 0.))
        //     initialMvs.push(new Mv().plane(Math.cos(TAU * i / numMeridians), Math.sin(TAU * i / numMeridians), 0., 0.))
        // }

        //----------------SMITH CHART
        if(0)
        {
            let tri1 = pointFromVertIndex(octaVerts, 2).join(pointFromVertIndex(octaVerts, 0)).join(pointFromVertIndex(octaVerts, 4)).normalize()
            let tri2 = pointFromVertIndex(octaVerts, 2).join(pointFromVertIndex(octaVerts, 1)).join(pointFromVertIndex(octaVerts, 5)).normalize()

            let surfaceMotor = tri2.mul(tri1)
            for(let i = 0; i < 28; ++i)
                surfaceMotor = surfaceMotor.sqrtBiReflection()
            surfaceMotor.log()

            let spineRotor = e31.sqrtBiReflection()

            let central = e1.clone().add(e3).normalize()
            for(let l = 0; l < 2; ++l)
            {
                for (let k = 0; k < 2; ++k) {
                    for (let i = 0; i < 11; ++i) {
                        let im = central.clone()
                        for (let j = 0; j < i; ++j) {
                            surfaceMotor.sandwich(im, mv0).normalize()
                            im.copy(mv0)
                        }
                        if(l)
                            im.copy(spineRotor.sandwich(im, mv0).normalize())
                        initialMvs.push(im)
                    }
                    surfaceMotor[0] *= -1.
                }
            }
        }
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

        // {
        //     dumbell = {}
        //     let dumbellMat = new THREE.MeshPhongMaterial({ color: 0x000000 })
        //     let dumbellRadius = .05
        //     let end1 = new THREE.Mesh(new THREE.SphereGeometry(dumbellRadius * 2.), dumbellMat)
        //     scene.add(end1)
        //     dumbell.end1 = end1
        //     let end2 = new THREE.Mesh(new THREE.SphereGeometry(dumbellRadius * 2.), dumbellMat)
        //     scene.add(end2)
        //     dumbell.end2 = end2
        //     let handle = new THREE.Mesh(new THREE.CylinderGeometry(dumbellRadius, dumbellRadius, 1.), dumbellMat)
        //     scene.add(handle)
        //     dumbell.handle = handle
        //     dumbell.setVisibility = (newVisibility)=>{
        //         handle.visible = newVisibility
            //     end1.visible = newVisibility
            //     end2.visible = newVisibility
            // }
            // let stateMotorAxis = new Mv()
            // updateFunctions.push(() => {
            //     stateMotor.selectGrade(2, stateMotorAxis)
            //     let hasBivectorPart = !(stateMotorAxis.equals(zeroMv))
            //     dumbell.setVisibility(hasBivectorPart)
            //     if (hasBivectorPart) {
            //         motorToThreejs(stateMotorAxis, dumbell.handle)

            //         // function motorToThreejs(line,targetObject3d) {
            //         //     let thisLineAtOrigin = projectLineOnPoint(line, e123, mv1)
            //         //     // thisLineAtOrigin.normalize()
            //         //     let rotorToThisLineAtOrigin = thisLineAtOrigin.mul(e31, mv2).sqrtBiReflection(mv3)
            //         //     rotorToThisLineAtOrigin.toQuaternion(targetObject3d.quaternion)
            //         //     log(targetObject3d.quaternion)

            //         //     let pos = projectPointOnLine(e123, line, mv4)
            //         //     pos.toVector(targetObject3d.position)
            //         // }
            //     }

            // })
        // }

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
        }

        updateFunctions.push(() => {

            disks.forEach((d)=>{
                // if (disk.initialMv[1] !== 0.)
                //     debugger

                let mvToVisualize = mv4
                stateMotor.sandwich(d.initialMv, mvToVisualize)
                mvToVisualize.normalize()

                let lineThroughOriginOrthogonalToPlane = mv0
                e123.inner(mvToVisualize, lineThroughOriginOrthogonalToPlane)

                let planeAtOrigin = mv1
                lineThroughOriginOrthogonalToPlane.mul(e123, planeAtOrigin)
                if (planeAtOrigin.equals(zeroMv))
                    d.visible = false
                else{
                    d.visible = true

                    planeAtOrigin.normalize()
                    //alternatively, e4 part = 0.
    
                    let zToMvRotor = mv2
                    planeAtOrigin.mul(e3, zToMvRotor)
                    zToMvRotor.sqrtBiReflection(zToMvRotor)
                    zToMvRotor.toQuaternion(d.quaternion)
    
                    let planePosition = mv3
                    lineThroughOriginOrthogonalToPlane.mul(mvToVisualize, planePosition)
                    planePosition.normalize()
                    // putSphereHereAtFrameCountZero(planePosition)
                    planePosition.toVector(d.position)
    
                    let diskRadius = Math.sqrt(1. - d.position.lengthSq())
                    d.scale.setScalar(diskRadius)
                }
            })
        })

        return kb
    }
}