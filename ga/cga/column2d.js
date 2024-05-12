/*
    When you have a rotation-and-scale, that's a rotation around a line in 3D followed by, well, a translation-and-scale around its dual line

    The thing where it's flattened down on the plane is giving you the wrong impression
    Stuff does not stay on that plane
    New thought
        There's the camera "volume" / n-plane
            in the case of eg 1D CGA is a line
            in the case of 2D CGA is a plane
            Which you can skew around, maybe it always passes through nO pt(certainly if axes are through origin)
                and the various things which pass through the point nI cut it at the lines/points you see
                In particular the e0 plane will cut the camera volume, appearing as an n-1-plane
                "true points" aside from origin will disappear, though hey, they were just camera positions?
        There's the camera position, which for orthographic is a point at infinity
            That's the points which square to 1
            But you know, camera position, maybe it just doesn't matter?
                It's a matter of convention that perspective contracts towards you. Weird cutoffs are allowed

    Soooo, how would you make a camera system for 2D?
        Without loss of generality we can say you can render the stuff in the unit circle
        Obviously you'd make it so when you want it orthographic, you can be at any point at infinity
            And you'd make it so you can rotate the world around the origin
                That's scalars and e12 which can be made with (true) points at infinity or lines(planes) through origin
            And you can translate your orthographic camera by translating the world to that sphere
                That's scalars and lines through nI which can be made with lines(planes)

        For perspective projection you just need dolly zoom
        So in 2D, jyst
        


    Camera is a point at infinity, and these rotors "take it off the plane"


    vertex shader for the planes

    you really just want to show people the lines
    and what screws around the lines do

    !!!!!! THE LINES WILL NOT STAY LINES, THAT'S THE POINT!

    The goal of this thing was to check the ability to do camera transforms

    control scheme
    you want to make arbitrary lines, maybe even ones floating in space
    Then make screw motions with them

    
    
 */

function initColumn2d() {
    let ambient = new Dw(2, 0)
    let sign = text("4D", false)
    sign.scale.multiplyScalar(2.)
    ambient.scene.add(sign)

    let pointGeo = new THREE.SphereGeometry(tubeRadius * 2.)

    let addedPoints = []

    let ourPss = mul(e12, ePlusMinus)
    ourPss.log()

    let conformal = new Dw(2, 2)
    let hyperbolic = new Dw(2, 1, false, true)

    let cylGeo = new THREE.CylinderBufferGeometry(tubeRadius, tubeRadius, 1000.)

    {
        let multipliedByEuclideanOrigin = new Mv()
        let bracketedPart = new Mv()
        let nPart = new Mv()
        function leoPoincareDual(mv, target) {
            if (target === undefined)
                target = new Mv()

            nPart.copy(mv)
            for (let i = 0; i < 32; ++i) {
                //this only does planes for now
                if (i !== 1 && i !== 2 && i !== 6)
                    nPart[i] = 0.
            }

            let delta = .5 * (mv.ePlus() + mv.eMinus()) //a scalar!
            mul(nPart, nO, bracketedPart) //e1+ - e1-, grade 2
            bracketedPart[0] -= delta //grade 0 and 2
            mul(bracketedPart, e12, multipliedByEuclideanOrigin)
            meet(multipliedByEuclideanOrigin, nI, target)
            return target
        }
        let example = e0.clone().add(e1).add(e2)
        leoPoincareDual(example).log()

        //so you can use this to get the dual of a translation (like e01+1) and see where its line is etc
    }

    {
        var gridMvs = []
        let gridNumWide = 30
        // gridMvs.push(e1)
        // gridMvs.push(e1.clone().add(nI).normalize())
        // gridMvs.push(e1.clone().sub(nI).normalize())
        // gridMvs.push(e2.clone().sub(nI))

        //"frustum"
        // gridMvs.push(e1.clone().add(nI))
        // gridMvs.push(e1.clone().sub(nI))
        // gridMvs.push(e2.clone())
        // gridMvs.push(nI.clone().multiplyScalar(2.).add(e2))

        for (let i = 0; i < gridNumWide; ++i) {
            let zeroToOne = i / (gridNumWide - 1)
            mv0.copy(e01).naieveAxisToRotor( .001 + .99 * 30. * (zeroToOne - .5))
            gridMvs.push(mv0.sandwich(e1, new Mv()))
        }
        for (let i = 0; i < gridNumWide; ++i) {
            let zeroToOne = i / (gridNumWide - 1)
            mv0.copy(e02).naieveAxisToRotor( .001 + .99 * 30. * (zeroToOne - .5))
            gridMvs.push(mv0.sandwich(e2, new Mv()))
        }

        // gridMvs.forEach((gmv)=>{
        //     leoPoincareDual(gmv, mv0)
        //     gmv.copy(mv0)
        // })
        var gridCount = gridMvs.length

        //alright so the eric lengyel transformation is about
    }
    
    //hyperbolic
    {
        //in this context, the y plane is ePlus. x is e1, z is e2
        //so lines through origin are e1Plus, e12, e2Plus
        //eMinus is your line at infinity
        //the pga pseudoscalar here is the north pole, the point e12*nO

        hyperbolic.camera.position.set(1.,1.,2.).setLength(2.2)
        hyperbolic.camera.lookAt(zeroVector)
        hyperbolic.camera.fov = getFov(2.)
        hyperbolic.camera.updateProjectionMatrix()

        let planesGeo = new THREE.CircleGeometry(1.,30)
        let planesMat = new THREE.MeshPhongMaterial({ color: 0xff0000, side:THREE.DoubleSide })
        var gridPlanes = new THREE.InstancedMesh(planesGeo, planesMat, gridCount)

        //in this space, the y plane is ePlus
        var hyperbolicOrigin = mul(e12, ePlus)
        {
            let lightconeSphereMat = new THREE.MeshPhongMaterial({
                // transparent: true,
                // opacity: .4,
                color: 0xFFFF00
            })
            let lightconeSphere = new THREE.Mesh(new THREE.SphereGeometry(1.), lightconeSphereMat)
            lightconeSphere.renderOrder = 1
            hyperbolic.scene.add(lightconeSphere)
        }
        hyperbolic.scene.add(gridPlanes)
    }

    let justAxis = new Mv()
    function spinorViz(spinor, col) {
        var ptPairLineMesh = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({ color: col }))
        ptPairLineMesh.matrixAutoUpdate = false

        let ptPairPtsMat = new THREE.MeshBasicMaterial({ color: col })
        var ptPairPtsSphereMeshes = [
            new THREE.Mesh(pointGeo, ptPairPtsMat),
            new THREE.Mesh(pointGeo, ptPairPtsMat)
        ]
        // var ptPairPtsFloorMeshes = [
        //     new THREE.Mesh(pointGeo, ptPairPtsMat),
        //     new THREE.Mesh(pointGeo, ptPairPtsMat)
        // ]
        // conformal.scene.add(ptPairPtsFloorMeshes[0])
        // conformal.scene.add(ptPairPtsFloorMeshes[1])

        conformal.scene.add(ptPairPtsSphereMeshes[0])
        conformal.scene.add(ptPairPtsSphereMeshes[1])
        hyperbolic.scene.add(ptPairLineMesh)

        updateFunctions.push(() => {
            spinor.selectGrade(2, justAxis)

            lineMvToCylGeoMatrix(justAxis, ptPairLineMesh.matrix)

            ptPairPtPosition(justAxis, true, ptPairPtsSphereMeshes[0].position)
            ptPairPtPosition(justAxis, false, ptPairPtsSphereMeshes[1].position)

            //sphereToPlane(ptPairPtsSphereMeshes[0].position, ptPairPtsFloorMeshes[0].position)
            //sphereToPlane(ptPairPtsSphereMeshes[1].position, ptPairPtsFloorMeshes[1].position)
        })
    }

    let controlPtPair = e01.add(e02,new Mv())
    let mouseControlledPtPair = controlPtPair

    {
        let mouseControlledPtPair1 = null
        spinorViz(controlPtPair, 0x00FF00)

        // let mouseControlledPtPair1 = mul(ePlus, e2)
        // let mouseControlledPtPair2 = mul(e1, e2)
        // var octonionResultPtPair = mul(e1, e2)
        // spinorViz(mouseControlledPtPair1, 0xFF0000)
        // spinorViz(mouseControlledPtPair2, 0x0000FF)
        // spinorViz(octonionResultPtPair, 0x00FFFF)
        // updateFunctions.push(() => {
        //     octonionMul(mouseControlledPtPair1, mouseControlledPtPair2, octonionResultPtPair)
        // })

        let cameraUp = new THREE.Vector3()
        let rightwardVec = new THREE.Vector3()
        function getMousePt(x,y,target) {
            cameraUp.set(0., 1., 0.).applyQuaternion(hyperbolic.camera.quaternion)
            cameraUp.normalize()

            rightwardVec.crossVectors(cameraUp, hyperbolic.camera.position).normalize()
            v1.set(0., 0., 0.)
            v1.addScaledVector(cameraUp, 4. * y)
            v1.addScaledVector(rightwardVec, 4. * x)
            v1.addScaledVector(v2.copy(hyperbolic.camera.position).sub(v1).setLength(.97),1.)

            positionVectorToHyperbolicGrade3(v1, target)

            return target
        }

        
        let dualJoin = new Mv()
        let dualP = new Mv()
        let dualQ = new Mv()
        let startPt = new Mv()
        let currentPt = new Mv()
        hyperbolic.onClick = (x, y) => {
            getMousePt(x,y,startPt)
            if (mouseControlledPtPair1 !== null)
                mouseControlledPtPair = mouseControlledPtPair === mouseControlledPtPair1 ? mouseControlledPtPair2 : mouseControlledPtPair1
        }

        function join(p, q, target) {
            return mul(
                meet(
                    mul(p, pss, dualP),
                    mul(q, pss, dualQ),
                    dualJoin), pss,
                target )
        }
        hyperbolic.onDrag = (x, y) => {
            getMousePt(x,y,currentPt)
            
            join(startPt, currentPt, mouseControlledPtPair)
        }
    }

    {
        // mul(e1, nI, controlPtPair)
        // e01.add(e02,controlPtPair)q
        // meet(e2,nO,controlPtPair) //the interesting one
        // controlPtPair.copy(e01)
        
        function applyToGrid(rotor) {
            gridMvs.forEach((gmv) => {
                gmv.applyRotor(rotor)
            })
            addedPoints.forEach((ap)=>{
                ap.mv.applyRotor(rotor)
            })
        }


        {
            // let rotorSplong = mul(nO, e1).naieveAxisToRotor(-.01)
            // let rotorSpling = mul(nO, e1).naieveAxisToRotor(.01)
            let rotorDown = ePlusMinus.clone().naieveAxisToRotor(.02)
            let rotorUp = ePlusMinus.clone().naieveAxisToRotor(-.02)
            let rotorLeft = mul(e1, nI).clone().naieveAxisToRotor(-.03)
            let rotorRight = mul(e1, nI).clone().naieveAxisToRotor(.03)

            // let buttonsArr = [`t`, `g`, `f`, `h`] //, `PageDown`, `PageUp`]
            // let rotorsArr = [rotorUp, rotorDown, rotorRight, rotorLeft] //, rotorSplong, rotorSpling]
            // for (let i = 0; i < buttonsArr.length; ++i) {
            //     bindButton(buttonsArr[i], () => { }, ``, () => {
            //         applyToGrid(rotorsArr[i])
            //     })
            // }

            // log(ourPss.getFirstNonzeroIndex())
            bindButton(`i`, () => { }, ``, () => {
                mul(controlPtPair, ourPss, mv0).naieveAxisToRotor(-.01)
                applyToGrid(mv0)
            })
            bindButton(`k`, () => { }, ``, () => {
                mul(controlPtPair, ourPss, mv0).naieveAxisToRotor(.01)
                applyToGrid(mv0)
            })
            bindButton( `j`, () => {}, ``, () => {
                mv0.copy(controlPtPair).naieveAxisToRotor(.01)
                applyToGrid(mv0 )
            })
            bindButton(`l`, () => { }, ``, () => {
                mv0.copy(controlPtPair).naieveAxisToRotor(-.01)
                applyToGrid(mv0)
            })
            

            //just have the one line that you visualize

            //the pss for hyperbolic space is e12PlusMinus
        }
    }

    let pss = mul(e12, ePlusMinus)

    {
        let floorGeo = new THREE.CircleGeometry(9999.,32)
        floorGeo.rotateX(TAU / 4.)
        let floorPlane = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ color: 0xFF8000, side: THREE.DoubleSide }))
        floorPlane.position.y = -1.01
        hyperbolic.scene.add(floorPlane)
        conformal.scene.add(floorPlane)

        //e0
        let e0Viz = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ color: 0xFF00FF, side: THREE.DoubleSide }))
        e0Viz.position.y = 1.01
        e0Viz.scale.multiplyScalar(.00007)
        hyperbolic.scene.add(e0Viz)

        conformal.camera.position.set(0., 1., 0.)
        conformal.camera.lookAt(0., -1., 0.)

        // conformal.scene.add()

        let dragPoint = null
        //maybe
        let pointBasedOrigin = mul(e12, eMinus, mv0).multiplyScalar(-1.).add( hyperbolicOrigin, new Mv()).normalize()
        updateFunctions.push(()=>{
            addedPoints.forEach((ap)=>{
                hyperbolicGrade3ToPositionVector(ap.mv, ap.position)
            })
        })
        function xyToPointBasedPoint(x,y,target) {
            mul(e1, ePlusMinus, mv0).multiplyScalar( y * 8.)
            mul(e2, ePlusMinus, mv1).multiplyScalar(-x * 8.)
            mv0.add(mv1, mv2)
            // mv2.add(hyperbolicOrigin, target)
            if (Math.abs(x) < 1.2 && Math.abs(y) < 1.2 )
                mv2.add(pointBasedOrigin, target)
            else
                target.copy(mv2)

            target.normalize()
            return target
        }

        //to check if join works
        // {
        //     let startPoint = new Mv()
        //     conformal.onClick = (x,y)=>{
        //         xyToPointBasedPoint(x, y, startPoint).normalize()
        //     }
        //     conformal.onDrag = (x,y)=>{
        //         xyToPointBasedPoint(x, y, mv0).normalize()

        //         //geometric antiproduct? eg mul by pss first


        //         mul(mv0,startPoint,mv1)
        //         mul(mv1,pss,mv2).log()
        //         ptPair.copy(mv2)
        //         ptPair[0] = 0.
        //         ptPair.normalize()
        //     }
        // }

        //old version, dunno what it did
        if(false)
        {
            conformal.onClick = (x, y) => {
                dragPoint = new THREE.Mesh(pointGeo,new THREE.MeshBasicMaterial({color:0x0000FF}))
                dragPoint.mv = new Mv()
                conformal.scene.add(dragPoint)
                addedPoints.push(dragPoint)

                xyToPointBasedPoint(x, y, dragPoint.mv)
            }
            conformal.onDrag = (x, y) => {
                xyToPointBasedPoint(x, y, dragPoint.mv)
            }
        }

        //
        // if(false)
        {
            let gridWhenGrabbed = Array(gridMvs.length)
            gridMvs.forEach((gmv, i) => {
                gridWhenGrabbed[i] = new Mv()
            })

            let mouseDownMv = new Mv()
            conformal.onClick = (x, y) => {
                gridMvs.forEach((gmv, i) => {
                    gridWhenGrabbed[i].copy(gmv)
                })

                xyToPointBasedPoint(x * 99999., y * 99999., mouseDownMv)
                xyToPointBasedPoint(x, y, mouseDownMv)

                // xyToPointBasedPoint(x, y, mv0)
                // mouseDownMv.copy(mv0).addScaled(pointBasedOrigin,-1.)

                // join2d(mv0, pointBasedOrigin, ptPair)
            }
            conformal.onDrag = (x, y) => {
                xyToPointBasedPoint(x, y, mv0)
                // join2d(mouseDownMv, mv0, ptPair)

                // xyToPointBasedPoint(x * 99999., y * 99999., mouseDownMv)

                // mv0.log("current")
                // mouseDownMv.log("mouseDo")
                mul(mv0, mouseDownMv, mv1)//.naieveSqrt()
                
                gridMvs.forEach((gmv, i) => {
                    gmv.copy(gridWhenGrabbed[i])
                    gmv.applyRotor(mv1)
                })

                mv1[0] = 0.
                ptPair.copy(mv1).normalize()
                
                // mul(mv1, pss, ptPair) //this is the join of the point
            }
        }

        

        let gridLinesVertexShader = `
                uniform vec3 axisBivector;
                uniform vec3 initialVec;

                vec3 applyQuatToVec(in vec4 q, in vec3 v) {
                    float ix = q.w * v.x + q.y * v.z - q.z * v.y;
                    float iy = q.w * v.y + q.z * v.x - q.x * v.z;
                    float iz = q.w * v.z + q.x * v.y - q.y * v.x;
                    float iw = -q.x * v.x - q.y * v.y - q.z * v.z;

                    return vec3(
                        ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
                        iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
                        iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
                    );
                }

                void main() {
                    //it's a series of flat points on e1, eg, e12 + e01 * y
                    //you transform them to the correct place

                    float angle = position.y * 3.14159265359;
                    vec4 myQuat = vec4( sin(angle/2.) * axisBivector, cos(angle/2.) );
                    //could have the amount you go out be a cutoff to get rid of that gap
                    vec3 onSphere = applyQuatToVec(myQuat, initialVec);
                    //so that's a circle, somewhere on the sphere
 
                    vec3 projectionOrigin = vec3(0.,1.,0.);
                    vec3 projectionDirection = -projectionOrigin;
                    vec3 ppToOnSphere = onSphere - projectionOrigin;
                    float amountAlongProjectionDirection = dot(ppToOnSphere, projectionDirection);
                    //you want that to be 2
                    float inflationFactor = 2. / amountAlongProjectionDirection;
                    vec3 projected = projectionOrigin + ppToOnSphere * inflationFactor;
                    vec4 transformedPosition = vec4(projected,1.);

                    // vec4 transformedPosition = vec4(onSphere,1.);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * transformedPosition;
                }
            `

        // log(gaShaderPrefix)
        let stripMat = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                initialVec: 5,
                axisBivector: 3,
            },
            vertexShader: gridLinesVertexShader,
            fragmentShader: `
                void main() {
                    gl_FragColor = vec4(0.,0.,1.,1.);
                }
            `
        })
        // stripMat.uniforms.e1ToCircle.value.copy(oneMv)
        let numVerts = 64
        let verts = Array(numVerts)
        for (let i = 0; i < numVerts; ++i) {
            let zeroToOne = i / (numVerts - 1)
            let approxMinusOneToOne = .95 * (-1. + 2. * zeroToOne)
            verts[i] = new THREE.Vector3(0., approxMinusOneToOne, 0.)
        }
        let lineGeo = new THREE.BufferGeometry().setFromPoints(verts)

        var gridLines = Array(gridCount)
        for(let i = 0; i < gridCount; ++i) {
            gridLines[i] = new THREE.Line(lineGeo, stripMat.clone())
            gridLines[i].material.uniforms.initialVec.value = new THREE.Vector3()
            gridLines[i].material.uniforms.axisBivector.value = new THREE.Vector3()
            conformal.scene.add(gridLines[i])
        }
        
        //if you have problems, could consider projecting origin or whatever onto the circle/line
        //then mapping that point back to e1
        //then sending that point in as a uniform y amount to be added

        //you're modelling e1 as a series of point pairs where they're all joined with infinity
        //well, they SHOULDN'T be that way
        //it's a series of... actual points?
        //could stereographically project, starting with a set of points on a circle

        //don't forget the interesting discovery that if you're just intersecting these planes, it's Lengyel's result
    }
    function positionVectorToHyperbolicGrade3(vec, target) {
        target.copy(zeroMv)
        target.addScaled(e2PlusMinus, -vec.x)
        target.addScaled(e12Minus, vec.y)
        target.addScaled(e1PlusMinus, -vec.z)
        target.addScaled(e12Plus, 1.)
        return target
    }

    function hyperbolicGrade3ToPositionVector(mv, target) {
        target.set(
            -mv.e2PlusMinus(),
            mv.e12Minus(),
            -mv.e1PlusMinus(),
        )
        if (mv.e12Plus() === 0.)
            target.normalize() //normal
        else
            target.multiplyScalar(1. / mv.e12Plus()) //vertex
        return target
    }

    let getterMv0 = new Mv()
    let getterMv1 = new Mv()
    function getPositionVector(mv,target) {
        hyperbolicOrigin.projectOn(mv, getterMv0) //grade 3 part is the position
        return hyperbolicGrade3ToPositionVector(getterMv0, target)
    }
    
    function getQuaternionTo(mv,originComparisonMv,target) {
        mv.projectOn(hyperbolicOrigin, getterMv0).normalize()
        //the origin in this space is still a bunch of planes that square to 1 so this is fine
        mul(getterMv0, originComparisonMv, getterMv1).naieveSqrt() //kiiiinda wrong way around
        target.set(getterMv1.e2Plus(), -getterMv1.e12(), getterMv1.e1Plus(), getterMv1[0]).normalize()

        return target
    }

    function lineMvToCylGeoMatrix(lineMv, target) {
        // debugger
        getPositionVector(lineMv, v1)
        getQuaternionTo(lineMv, e12, q1)

        target.compose(v1, q1, v2.set(1., 1., 1.))

        return target
    }

    let midPoint = new THREE.Vector3()
    let directionToMoveInMv = new Mv()
    let directionToMoveInVec = new THREE.Vector3()
    ptPairPtPosition = (mv, positive, target) => {
        getPositionVector(mv, midPoint)
        let distanceToSurface = diskInUnitSphereRadius(midPoint)

        meet(mv, eMinus, directionToMoveInMv)
        hyperbolicGrade3ToPositionVector(directionToMoveInMv, directionToMoveInVec)

        target.copy(midPoint).addScaledVector(directionToMoveInVec, distanceToSurface * (positive ? 1. : -1.))
        return target
    }

    let northPoleToOnSphere = new THREE.Vector3()
    let northPoleToPlane = new THREE.Vector3()
    function sphereToPlane(vec, target) {
        northPoleToOnSphere.subVectors(vec, yUnit)
        northPoleToPlane.copy(northPoleToOnSphere).multiplyScalar(-2. / northPoleToOnSphere.y) //so y becomes -2
        target.addVectors(northPoleToPlane,yUnit)
        return target
    }
    function planeToSphere(vec, target) {
        let toOnYPlane = v1.subVectors(vec,yUnit)
        toOnYPlane.multiplyScalar(-1./toOnYPlane.y)

        let wiki = v2.set(toOnYPlane.x, 0., toOnYPlane.z)
        target.set(2. * wiki.x, -1. + sq(wiki.x) + sq(wiki.z), 2.*wiki.z)
        target.normalize()
        return target
    }

    let debugPt = new THREE.Mesh(pointGeo)
    let debugPt2 = new THREE.Mesh(pointGeo)
    hyperbolic.scene.add(debugPt)
    hyperbolic.scene.add(debugPt2)
    let diskCenter = new THREE.Vector3()
    updateFunctions.push(() => {
        
        gridMvs.forEach((gridMv, i) => {
            
            {
                //e2 is the z plane, ePlus is the y plane
                getQuaternionTo(gridMv, e2, q1)
                getPositionVector(gridMv, diskCenter)

                let radius = .03 + Math.sqrt(1. - diskCenter.lengthSq())
                m1.compose(diskCenter, q1, v2.set(radius, radius, radius))
                gridPlanes.setMatrixAt(i, m1)
            }

            {
                let uniforms = gridLines[i].material.uniforms

                let e12OnPlane = e12.projectOn(gridMv, mv0)
                
                //on the sphere
                {
                    ptPairPtPosition(e12OnPlane, true, v1)
                    ptPairPtPosition(e12OnPlane, false, v2)
                    uniforms.initialVec.value.copy(v1.y < v2.y ? v1 : v2)
                }

                //on the plane
                // {
                //     let lookPlaneIntersectionWithE12OnPlane = meet(e12OnPlane, nO, mv1)
                //     hyperbolicGrade3ToPositionVector(lookPlaneIntersectionWithE12OnPlane, v3)
                //     planeToSphere(v3, uniforms.initialVec.value)
                // }

                //on the sphere
                {
                    inner(gridMv, hyperbolicOrigin, mv0) //plane to orthogonal line through origin
                    uniforms.axisBivector.value.set(mv0.e2Plus(), -mv0.e12(), mv0.e1Plus()).normalize()
                    // uniforms.axisBivector.value.copy(diskCenter).normalize() //slightly cooler way to do it
                }

                //on the plane
                // {
                //     //uniforms.initialVec.value is assumed to already be on the sphere
                //     uniforms.axisBivector.value.addVectors(uniforms.initialVec.value,yUnit).normalize()
                // }
            }
        })
        gridPlanes.instanceMatrix.needsUpdate = true
        // gridLines.instanceMatrix.needsUpdate = true
    })
}