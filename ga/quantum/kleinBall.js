/*
    a/c - (ad-bc) / (c*c * (z+d/c))
*/



let stateMotor = null
async function initKleinBalls() {

    KleinBall = () => {
        //could just have cones for spikes
        //do you want the ridges?
        
        //buncha points in sphere. Line segments connecting them to where they get mapped? Naaah, need arcs
        //consider if it was just rotation
        //"the" four mirrors?
        /*
            NOT a mapping of something which looks a certain way under the identity

            Maybe it's iterated

            Need some spine to start with

            M*M different from M

            rotn / no-rotn
            mvmt / no-mvmt
            
               rotn    mvmt = Lots of spines
            no-rotn    mvmt = spines on one ridge?
               rotn no-mvmt = spines on many lines
            no-rotn no-mvmt = identity. A big 1 on the screen?


            The thing you were gonna do was check/ask whether changing the "global" phase of one qubit gets you difference in outcome
        */
        let spineGeo = new THREE.ConeGeometry(.05,1.,13,1,false)
        spineGeo.translate(0.,.5,0.)
        let spineMesh = new THREE.Mesh(spineGeo, niceMat(0))

        let numSpines = 50
        let spines = new THREE.InstancedMesh(spineGeo, niceMat(0), numSpines)
        
        let dummyMat = new THREE.Matrix4()
        for (let i = 0; i < numSpines; ++i) {
            spines.setMatrixAt(i, dummyMat)
        }
        setRotationallySymmetricMatrix(0.,-1.,0., dummyMat)
        spines.setMatrixAt(0, dummyMat)

        let kb = new THREE.Object3D()
        thingsToRotate.push(kb)
        let stateMotor = new Mv()
        stateMotor[0] = 1.
        kb.stateMotor = stateMotor

        kb.add(spines)

        let toAimAt = new Mv()
        let initial = new Mv().point(0., 0., 1. / Math.SQRT2, 1. / Math.SQRT2)
        updateFunctions.push( () => {

            kb.stateMotor.sandwich(initial,)

            delete initial
        })

        return kb
    }
    return


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

    var initialPlaneMvs = []
    insertPlanes(initialPlaneMvs)

    let shadowCasterGeo = new THREE.IcosahedronGeometry(1., 2)
    let shadowCasterMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: .00001
    })

    let diskGeometry = new THREE.CircleGeometry(1., 126)
    let diskMats = []
    let numPlanes = initialPlaneMvs.length
    for (let i = 0; i < numPlanes; ++i)
        diskMats[i] = niceMat(i / (numPlanes - 1.))

    function initDisks(kb) {
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

            // disk.initialMv = initialPlaneMvs[i]
        }

        updateFunctions.push(() => {
            disks.forEach((d) => {
                // if (disk.initialMv[1] !== 0.)
                //     debugger

                let mvToVisualize = mv4
                kb.stateMotor.sandwich(d.initialMv, mvToVisualize)
                mvToVisualize.normalize()
                
                // mvToVisualize.copy(e3)
                // for (let i = 0; i < diskIndex; ++i) {
                //     kb.stateMotor.sandwich(mvToVisualize, mv0)
                //     mvToVisualize.copy(mv0)
                // }

                let lineThroughOriginOrthogonalToPlane = mv0
                e123.inner(mvToVisualize, lineThroughOriginOrthogonalToPlane)

                let planeAtOrigin = mv1
                lineThroughOriginOrthogonalToPlane.mul(e123, planeAtOrigin)
                if (planeAtOrigin.equals(zeroMv))
                    d.visible = false
                else {
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
    }

    //you're going to get a series of points on the sphere
    //tube
    //Nicest would be a full cylindrical
    //triangles look fine
    {
        let heightSegments = 31
        let geo = new THREE.PlaneGeometry(1., 1., 1, heightSegments)

        function placeFromPts(start,tip) {
            //you take the start point, apply the mobius transformation
        }

        //yes, a shader would be nice

        //spine is on tangent to the sphere, sides are poking off surface slightly
    }

    let ptsMat = new THREE.PointsMaterial({
        size: .03
    })

    KleinBall = () =>
    {
        let kb = new THREE.Object3D()
        thingsToRotate.push(kb)
        let stateMotor = new Mv()
        stateMotor[0] = 1.
        kb.stateMotor = stateMotor

        //-----------PTS
        if(0)
        {
            let ptsGeo = new THREE.Geometry()

            let numPts = 1024
            let initialPts = Array(numPts)
            for (let i = 0; i < numPts; ++i) {
                ptsGeo.vertices.push(new THREE.Vector3())

                let pt = new Mv().point(0., 0., 0., 1.)

                let currentLength = Infinity
                while (currentLength >= 1.) {
                    pt[14] = (Math.random() - .5) * 2.
                    pt[13] = (Math.random() - .5) * 2.
                    pt[12] = (Math.random() - .5) * 2.

                    currentLength = sq(pt[14]) + sq(pt[13]) + sq(pt[12])
                }

                initialPts[i] = pt
            }

            updateFunctions.push(() => {
                //want motor M such that after one second, pt has done M

                frameDelta


                initialPts.forEach((pt, i) => {
                    stateMotor.sandwich(pt, mv0)
                    mv0.toVector(ptsGeo.vertices[i])
                })
                ptsGeo.verticesNeedUpdate = true
            })

            let flowPts = new THREE.Points(ptsGeo, ptsMat)
            scene.add(flowPts)
        }

        //----------DISKS
        // if(0)
        initDisks(kb)

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
        
        return kb
    }
}