/*
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
    let sign = text("? 4D :( ?", false)
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
        let planesMat = new THREE.MeshPhongMaterial({ color: 0xFF00FF, side:THREE.DoubleSide })
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

    {
        ptPair = mul(ePlus, e1)
        // mul(e1, nI, ptPair)
        // e01.add(e02,ptPair)q
        // meet(e2,nO,ptPair) //the interesting one
        // ptPair.copy(e01)
        var ptPairLineMesh = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({ color: 0x00FF00 }))
        ptPairLineMesh.matrixAutoUpdate = false
        hyperbolic.scene.add(ptPairLineMesh)

        //you also want a point pair on the plane
        //you want this effect where they cross

        hyperbolicOrigin.projectOn(mul(e1, nI), mv0).log("projection")
        
        let ptPairPtsMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 })
        var ptPairPtsSphereMeshes = [
            new THREE.Mesh(pointGeo, ptPairPtsMat),
            new THREE.Mesh(pointGeo, ptPairPtsMat)
        ]
        hyperbolic.scene.add(ptPairPtsSphereMeshes[0])
        hyperbolic.scene.add(ptPairPtsSphereMeshes[1])
        var ptPairPtsFloorMeshes = [
            new THREE.Mesh(pointGeo, ptPairPtsMat),
            new THREE.Mesh(pointGeo, ptPairPtsMat)
        ]
        conformal.scene.add(ptPairPtsFloorMeshes[0])
        conformal.scene.add(ptPairPtsFloorMeshes[1])

        let indicator = new THREE.Mesh(pointGeo)
        hyperbolic.scene.add(indicator)

        function applyToGrid(rotor) {
            gridMvs.forEach((gmv) => {
                rotor.sandwich(gmv, mv1)
                gmv.copy(mv1)
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
                mul(ptPair, ourPss, mv0).naieveAxisToRotor(-.01)
                applyToGrid(mv0)
            })
            bindButton(`k`, () => { }, ``, () => {
                mul(ptPair, ourPss, mv0).naieveAxisToRotor(.01)
                applyToGrid(mv0)
            })
            bindButton( `j`, () => {}, ``, () => {
                mv0.copy(ptPair).naieveAxisToRotor(.01)
                applyToGrid(mv0 )
            })
            bindButton(`l`, () => { }, ``, () => {
                mv0.copy(ptPair).naieveAxisToRotor(-.01)
                applyToGrid(mv0)
            })
            

            //just have the one line that you visualize

            //the pss for hyperbolic space is e12PlusMinus
        }
    }

    {
        let floorGeo = new THREE.CircleGeometry(9999.)
        floorGeo.rotateX(TAU / 4.)
        let floorPlane = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide }))
        floorPlane.position.y = -1.01
        conformal.scene.add(floorPlane)

        conformal.camera.position.set(0., 1., 0.)
        conformal.camera.lookAt(0., -1., 0.)

        let dragPoint = null
        conformal.onClick = (x, y) => {
            dragPoint = new THREE.Mesh(pointGeo,new THREE.MeshBasicMaterial({color:0x0000FF}))
            dragPoint.position.set(x / dwDimension * 8., -1., -y / dwDimension * 8.)
            addedPoints.push(dragPoint)
            conformal.scene.add(dragPoint)
        }
        conformal.onDrag = (x, y) => {
            dragPoint.position.set(x / dwDimension * 8., -1., -y / dwDimension * 8.)
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
 
                    vec3 projectionPoint = vec3(0.,1.,0.);
                    vec3 projectionDirection = -projectionPoint;
                    vec3 ppToOnSphere = onSphere - projectionPoint;
                    float amountAlongProjectionDirection = dot(ppToOnSphere, projectionDirection);
                    //you want that to be 2
                    float inflationFactor = 2. / amountAlongProjectionDirection;
                    vec3 projected = projectionPoint + ppToOnSphere * inflationFactor;
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
    function ptPairPtPosition(mv, positive, target) {
        getPositionVector(mv, midPoint)
        let distanceToSurface = Math.sqrt(1. - midPoint.lengthSq())

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
    hyperbolic.scene.add(debugPt)
    let debugPt2 = new THREE.Mesh(pointGeo)
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
                {
                    let lookPlaneIntersectionWithE12OnPlane = meet(e12OnPlane, nO, mv1)
                    hyperbolicGrade3ToPositionVector(lookPlaneIntersectionWithE12OnPlane, v3)
                    planeToSphere(v3, uniforms.initialVec.value)
                }

                //on the sphere
                {
                    inner(gridMv, hyperbolicOrigin, mv0) //plane to orthogonal line through origin
                    uniforms.axisBivector.value.set(mv0.e2Plus(), -mv0.e12(), mv0.e1Plus()).normalize()
                    // uniforms.axisBivector.value.copy(diskCenter).normalize() //slightly cooler way to do it
                }

                //on the plane
                {
                    //uniforms.initialVec.value is assumed to already be on the sphere
                    uniforms.axisBivector.value.addVectors(uniforms.initialVec.value,yUnit).normalize()
                }
            }
        })
        gridPlanes.instanceMatrix.needsUpdate = true
        // gridLines.instanceMatrix.needsUpdate = true


        {
            lineMvToCylGeoMatrix(ptPair, ptPairLineMesh.matrix)

            ptPairPtPosition(ptPair, true, ptPairPtsSphereMeshes[0].position)
            ptPairPtPosition(ptPair,false, ptPairPtsSphereMeshes[1].position)

            sphereToPlane(ptPairPtsSphereMeshes[0].position, ptPairPtsFloorMeshes[0].position)
            sphereToPlane(ptPairPtsSphereMeshes[1].position, ptPairPtsFloorMeshes[1].position)
        }
    })
}