/*
    a/c - (ad-bc) / (c*c * (z+d/c))

    see what these looks like for mob trans:
        unitarity
        outer product
        transpose
        transpose for a vector
        Conjugate
        Eigenvectors and eigenvalues
        special, non-special
        Hermitian
        Orthogonal
        1, -1 determinant
        Completeness relation: for any basis, the sum of the outer products of the elements with themselves is the identity

    ...and this is tremendously worthwhile, a visual perspective on much of abstract algebra
*/



let stateMotor = null
async function initKleinBalls() {

    let boogle = e12.clone()
    boogle.add(e41)
    projectPointOnLine(e123,boogle).log()

    

    function lineToCylinderTransform(line, targetObject3d) {
        let thisLineAtOrigin = projectLineOnPoint(line, e123, mv1)
        thisLineAtOrigin.normalize()
        let rotorToThisLineAtOrigin = thisLineAtOrigin.mul(e31, mv2).sqrt(mv3)
        rotorToThisLineAtOrigin.toQuaternion(targetObject3d.quaternion)

        let pos = projectPointOnLine(e123, line, mv4)
        pos.normalize()
        pos.toVector(targetObject3d.position)
        indicSphere.position.copy(targetObject3d.position)
        // log(indicSphere.position)
    }
    
    let dumbellMat = new THREE.MeshPhongMaterial({ color: 0x000000 })
    let indicSphere = new THREE.Mesh(new THREE.SphereGeometry(.06), dumbellMat)
    function makeDumbell(kb)
    {
        kb.add(indicSphere)

        let dumbellRadius = .02

        dumbell = {}
        // let end1 = new THREE.Mesh(new THREE.SphereGeometry(dumbellRadius * 2.), dumbellMat)
        // kb.add(end1)
        // dumbell.end1 = end1
        // let end2 = new THREE.Mesh(new THREE.SphereGeometry(dumbellRadius * 2.), dumbellMat)
        // kb.add(end2)
        // dumbell.end2 = end2
        let handle = new THREE.Mesh(new THREE.CylinderGeometry(dumbellRadius, dumbellRadius, 1.), dumbellMat)
        kb.add(handle)
        dumbell.handle = handle
        dumbell.setVisibility = (newVisibility) => {
            handle.visible = newVisibility
            // end1.visible = newVisibility
            // end2.visible = newVisibility
        }
        
        updateFunctions.push(() => {
            // kb.stateMotorLogged.log()
            let hasBivectorPart = kb.stateMotorLogged.hasGrade(2)

            dumbell.setVisibility(hasBivectorPart)
            if (hasBivectorPart)
                lineToCylinderTransform(kb.stateMotorLogged, dumbell.handle)
        })

        return dumbell
    }

    

    async function makeTrails(kb) {
        
        let numArcs = 60
        let arcs = Array(numArcs)

        //very instance-able
        let headMat = new THREE.MeshPhongMaterial({ color: 0xFF00FF })
        let headGeo = new THREE.SphereGeometry(.02)
        // let headExtent = .05
        // let headGeo = new THREE.ConeGeometry(headExtent/3., headExtent)
        // headGeo.translate(0.,-headExtent*.5,0.)

        var arcMat = new THREE.ShaderMaterial({
            uniforms: {
                "start": { value: new THREE.Vector3() },
                "stateMotorLogged": { value: new Float32Array(16) }
            },
        });
        await assignShader("basicVertex", arcMat, "vertex")
        await assignShader("basicFragment", arcMat, "fragment")

        for (let i = 0; i < numArcs; ++i) {
            let am = arcMat.clone()

            let start = am.uniforms.start.value
            let currentLength = Infinity
            while (currentLength >= 1.) {
                start.x = (Math.random() - .5) * 2.
                start.y = (Math.random() - .5) * 2.
                start.z = (Math.random() - .5) * 2.

                currentLength = start.lengthSq()
            }

            if (Math.random() < .3) //proportion of them that you want on the boundary
                start.normalize()

            let numVerts = 32
            let arcGeo = new THREE.BufferGeometry()

            const vertices = new Float32Array(numVerts * 3);
            arcGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

            let interp = new Float32Array(numVerts)
            for (let i = 0; i < numVerts; i++)
                interp[i] = i / (numVerts - 1)
            arcGeo.addAttribute('interp', new THREE.BufferAttribute(interp, 1))
            
            let arc = new THREE.Line(arcGeo, am)
            arcs[i] = arc
            kb.add(arc)
            
            arc.head = new THREE.Mesh(headGeo, headMat)
            kb.add(arc.head)
        }

        let almostStateMotor = new Mv()
        let tip = new Mv()
        let almostTip = new Mv()
        updateFunctions.push(() => {
            //need to figure out the 

            mv0.copy(kb.stateMotorLogged)
            mv0.multiplyScalar(.97)
            mv0.exp(almostStateMotor)
            
            arcs.forEach((arc) => {
                let logCopy = arc.material.uniforms.stateMotorLogged.value
                for (let i = 0; i < 16; ++i)
                    logCopy[i] = kb.stateMotorLogged[i]


                // head part
                let start = arc.material.uniforms.start.value
                let arcInitialPoint = mv0.fromVector(start)

                kb.stateMotor.sandwich(arcInitialPoint, tip)
                almostStateMotor.sandwich(arcInitialPoint, almostTip)

                tip.toVector(arc.head.position)

                //theeeeeen, put the cone at almostTip, pointing towards tip
            })
        })
    }

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

    function makeDisks(kb) {
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

            disk.initialMv = initialPlaneMvs[i]
        }

        updateFunctions.push(() => {
            disks.forEach((d,i) => {
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
                    zToMvRotor.sqrt(zToMvRotor)
                    zToMvRotor.toQuaternion(d.quaternion)

                    let planePosition = mv3
                    lineThroughOriginOrthogonalToPlane.mul(mvToVisualize, planePosition)
                    planePosition.normalize()
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
    function makePts(kb) {
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
            initialPts.forEach((pt, i) => {
                kb.stateMotor.sandwich(pt, mv0)
                mv0.toVector(ptsGeo.vertices[i])
            })
            ptsGeo.verticesNeedUpdate = true
        })

        let flowPts = new THREE.Points(ptsGeo, ptsMat)
        kb.add(flowPts)
    }

    KleinBall = async function()
    {
        let kb = new THREE.Object3D()
        thingsToRotate.push(kb)
        let stateMotor = new Mv()
        stateMotor[0] = 1.
        e12.exp(stateMotor)
        kb.stateMotor = stateMotor

        kb.stateMotorLogged = new Mv()
        updateFunctions.push(() => {
            stateMotor.logarithm(kb.stateMotorLogged)
            kb.stateMotorLogged.normalize()
        })

        // makeDumbell(kb)
        // await makeTrails(kb)
        makeDisks(kb)
        // makePts(kb)
        
        return kb
    }
}