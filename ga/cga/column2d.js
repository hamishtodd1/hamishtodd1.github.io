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

    let ourPss = mul(e12, ePlusMinus)
    ourPss.log()

    let conformal = new Dw(2, 2)
    let hyperbolic = new Dw(2, 1, false, true)

    let cylGeo = new THREE.CylinderBufferGeometry(tubeRadius, tubeRadius, 1000.)

    {
        var gridMvs = []
        let gridNumWide = 7
        // gridMvs.push(e1)
        // gridMvs.push(e1.clone().add(nI).normalize())
        // gridMvs.push(e1.clone().sub(nI).normalize())
        // gridMvs.push(e2.clone().sub(nI))
        for (let i = 0; i < gridNumWide; ++i) {
            let zeroToOne = i / (gridNumWide - 1)
            mv0.log()
            mv0.copy(e01).naieveAxisToRotor( .99 * 2. * (zeroToOne - .5))
            gridMvs.push(mv0.sandwich(e1, new Mv()))
            // if(i===0)
            //     mv0.sandwich(e1, new Mv()).log()
        }
        for (let i = 0; i < gridNumWide; ++i) {
            let zeroToOne = i / (gridNumWide - 1)
            mv0.copy(e02).naieveAxisToRotor(.99 * 2. * (zeroToOne - .5))
            gridMvs.push(mv0.sandwich(e2, new Mv()))
        }
        var gridCount = gridMvs.length
    }
    
    //hyperbolic
    {
        //in this context, the y plane is ePlus. x is e1, z is e2
        //so lines through origin are e1Plus, e12, e2Plus
        //eMinus is your line at infinity
        //the pga pseudoscalar here is the north pole, the point e12*nO

        hyperbolic.camera.position.set(1.,1.,2.).setLength(1.9)
        hyperbolic.camera.lookAt(zeroVector)
        hyperbolic.camera.fov = getFov(2.)
        hyperbolic.camera.updateProjectionMatrix()

        let planesGeo = new THREE.CircleGeometry(1.,30)
        let planesMat = new THREE.MeshPhongMaterial({ color: 0xFF00FF, side:THREE.DoubleSide })
        var gridPlanes = new THREE.InstancedMesh(planesGeo, planesMat, gridCount)

        //in this space, the y plane is ePlus
        var hyperbolicOrigin = mul(e12, ePlus)
        {
            let sphereMat = new THREE.MeshPhongMaterial({
                // transparent: true,
                // opacity: .4,
                color: 0xFFFF00
            })
            let sphere = new THREE.Mesh(new THREE.SphereGeometry(1.), sphereMat)
            sphere.renderOrder = 1
            // hyperbolic.scene.add(sphere)
        }
        hyperbolic.scene.add(gridPlanes)
    }

    {
        //you're modelling the vertices as point pairs with one at infinity
        //d

        var ptPair = mul(ePlus, e1)
        // mul(e1, nO, ptPair)
        // ptPair.copy(e12)
        var ptPairLineMesh = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({ color: 0x00FF00 }))
        ptPairLineMesh.matrixAutoUpdate = false
        hyperbolic.scene.add(ptPairLineMesh)

        //you also want a point pair on the plane

        hyperbolicOrigin.projectOn(mul(e1, nI), mv0).log("projection")
        
        let ptPairPtsGeo = new THREE.SphereGeometry(tubeRadius*3.)
        let ptPairPtsMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 })
        var ptPairPtsSphereMeshes = [
            new THREE.Mesh(ptPairPtsGeo, ptPairPtsMat),
            new THREE.Mesh(ptPairPtsGeo, ptPairPtsMat)
        ]
        hyperbolic.scene.add(ptPairPtsSphereMeshes[0])
        hyperbolic.scene.add(ptPairPtsSphereMeshes[1])
        var ptPairPtsFloorMeshes = [
            new THREE.Mesh(ptPairPtsGeo, ptPairPtsMat),
            new THREE.Mesh(ptPairPtsGeo, ptPairPtsMat)
        ]
        conformal.scene.add(ptPairPtsFloorMeshes[0])
        conformal.scene.add(ptPairPtsFloorMeshes[1])

        let indicator = new THREE.Mesh(ptPairPtsGeo)
        hyperbolic.scene.add(indicator)
        hyperbolic.onClick = (x,y)=>{
            log(x,y)
            let thingyX = x / dwDimension
            //you need the mouse ray
            //then
            // indicator.position.x = 
        }

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

            // let buttonsArr = [`i`, `k`, `j`, `l`] //, `PageDown`, `PageUp`]
            // let rotorsArr = [rotorUp, rotorDown, rotorRight, rotorLeft] //, rotorSplong, rotorSpling]
            // for (let i = 0; i < buttonsArr.length; ++i) {
            //     bindButton(buttonsArr[i], () => { }, ``, () => {
            //         applyToGrid(rotorsArr[i])
            //     })
            // }

            // log(ourPss.getFirstNonzeroIndex())
            bindButton( `f`, () => {}, ``, () => {
                mv0.copy(ptPair).naieveAxisToRotor(.01)
                applyToGrid(mv0 )
            })
            bindButton(`h`, () => { }, ``, () => {
                mv0.copy(ptPair).naieveAxisToRotor(-.01)
                applyToGrid(mv0)
            })
            bindButton(`t`, () => { }, ``, () => {
                mul(ptPair,ourPss,mv0).naieveAxisToRotor(-.01)
                applyToGrid(mv0)
            })
            bindButton(`g`, () => { }, ``, () => {
                mul(ptPair,ourPss,mv0).naieveAxisToRotor(.01)
                applyToGrid(mv0)
            })

            //just have the one line that you visualize

            //the pss for hyperbolic space is e12PlusMinus
        }
    }

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
        let mrh = e0.clone().add(e1).add(e2)

        leoPoincareDual(mrh).log()

        //so you can use this to get the dual of a translation (like e01+1) and see where its line is etc

        // var log = (R) => {
        //     // B*B = S + T*e1234
        //     var S = R[0] * R[0] - R[7] * R[7] - 1;
        //     var T = 2 * (R[0] * R[7])
        //     var norm = sqrt(S * S + T * T)
        //     var [x, y] = [0.5 * (1 + S / norm), -0.5 * T / norm];
        //     // lp is always a boost, lm a rotation
        //     var [lp, lm] = [sqrt(0.5 * S + 0.5 * norm), sqrt(-0.5 * S + 0.5 * norm)]
        //     var theta2 = lm == 0 ? 0 : atan2(lm, R[0]); var theta1 = atanh(lp / R[0]);
        //     var [w1, w2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
        //     var [A, B] = [(w1 - w2) * x + w2, w1 == 0 ? Math.atanh(-R[7] / lm) / lm : (w1 - w2) * y];
        //     return bivector(
        //         R[1] * A + R[6] * B, R[2] * A - R[5] * B, R[3] * A - R[4] * B,
        //         R[4] * A + R[3] * B, R[5] * A + R[2] * B, R[6] * A - R[1] * B
        //     )
        // }
    }

    {
        let floorGeo = new THREE.CircleGeometry(9999.)
        floorGeo.rotateX(TAU / 4.)
        let floorPlane = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide }))
        floorPlane.position.y = -1.01
        conformal.scene.add(floorPlane)
        
        var lookPlane = ePlus.clone().sub(eMinus)

        conformal.camera.position.set(0., 1., 0.)
        conformal.camera.lookAt(0., -1., 0.)

        // var gridLines = new THREE.InstancedMesh(cylGeo,new THREE.MeshBasicMaterial({color: 0x0000FF}), gridCount)
        // conformal.scene.add(gridLines)

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
                    vec3 onSphere = applyQuatToVec(myQuat, initialVec);

                    // vec3 northPole = vec3(0.,1.,0.);
                    // vec3 toOnSphere = onSphere - northPole;
                    // vec3 projected = northPole + toOnSphere * -2./toOnSphere.y;
                    // vec4 transformedPosition = vec4(projected,1.);

                    vec4 transformedPosition = vec4(onSphere,1.);
                    
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
            //uni
            vertexShader: gridLinesVertexShader,
            fragmentShader: `
                void main() {
                    gl_FragColor = vec4(0.,0.,1.,1.);
                }
            `
        })
        // stripMat.uniforms.e1ToCircle.value.copy(oneMv)
        let numVerts = 128
        let verts = Array(numVerts)
        for (let i = 0; i < numVerts; ++i) {
            let zeroToOne = i / (numVerts - 1)
            let approxMinusOneToOne = .99 * (-1. + 2. * zeroToOne)
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



    let northPoleToOnSphere = new THREE.Vector3()
    let northPoleToPlane = new THREE.Vector3()
    function sphereToPlane(vec, target) {
        northPoleToOnSphere.subVectors(vec, yUnit)
        northPoleToPlane.copy(northPoleToOnSphere).multiplyScalar(-2. / northPoleToOnSphere.y) //so y becomes -2
        target.addVectors(northPoleToPlane,yUnit)
        return target
    }
    function planeToSphere(vec, target) {
        let wiki = v1.set(vec.x / 2., 0., vec.z / 2.)
        target.set(2. * wiki.x, -1. + sq(wiki.x) + sq(wiki.z), 2.*wiki.z)
        target.multiplyScalar(1. / (1. + sq(wiki.x) + sq(wiki.z) ))
        return target
    }

    let debugPt = new THREE.Mesh(new THREE.SphereGeometry(tubeRadius*2))
    hyperbolic.scene.add(debugPt)
    let debugPt2 = new THREE.Mesh(new THREE.SphereGeometry(tubeRadius * 2))
    hyperbolic.scene.add(debugPt2)
    let diskCenter = new THREE.Vector3()
    updateFunctions.push(() => {
        
        gridMvs.forEach((gridMv, i) => {
            
            {
                //e2 is the z plane, ePlus is the y plane
                getQuaternionTo(gridMv, e2, q1)
                getPositionVector(gridMv, diskCenter)

                let radius = /*.05 +*/ Math.sqrt(1. - diskCenter.lengthSq())
                m1.compose(diskCenter, q1, v2.set(radius, radius, radius))
                gridPlanes.setMatrixAt(i, m1)
            }

            {
                // meet(lookPlane, gridMv, mv0)
                // lineMvToCylGeoMatrix(mv0,m1)
                // gridLines.setMatrixAt(i, m1)

                let uniforms = gridLines[i].material.uniforms

                e12.projectOn(gridMv, mv0) //point pair with point in floor plane
                meet(nO, mv0, mv1) //meet with floor plane, gets an actual point


                //fucked if it's a circle around the origin!
                hyperbolicGrade3ToPositionVector(mv1, uniforms.initialVec.value)
                // debugPt.position.copy(uniforms.initialVec.value)
                planeToSphere(uniforms.initialVec.value, uniforms.initialVec.value)
                // debugPt2.position.copy(uniforms.initialVec.value)
                if (frameCount === 2) {
                    // mv1.log()
                    // log(uniforms.initialVec.value) //want z=-1, getting z=
                }
                //need to unproject to the sphere

                inner(gridMv, hyperbolicOrigin, mv0) //plane to orthogonal line through origin
                // mv0.log()
                uniforms.axisBivector.value.set(mv0.e2Plus(),-mv0.e12(),mv0.e1Plus()).normalize()
                // uniforms.axisBivector.value.copy(diskCenter).normalize()

                // debugPt.position.copy(uniforms.axisBivector.value).negate()
                // debugPt2.position.copy(uniforms.initialVec.value).applyAxisAngle(uniforms.axisBivector.value,Math.PI)
                //should be a point piercing the middle!
            }
        })
        gridPlanes.instanceMatrix.needsUpdate = true
        // gridLines.instanceMatrix.needsUpdate = true


        {
            lineMvToCylGeoMatrix(ptPair, ptPairLineMesh.matrix)

            getPositionVector(ptPair, v1)
            let distanceToSurface = Math.sqrt(1. - v1.length())

            let directionToMoveIn = meet(ptPair, eMinus)
            hyperbolicGrade3ToPositionVector(directionToMoveIn, v2)
            ptPairPtsSphereMeshes[0].position.copy(v1).addScaledVector(v2, distanceToSurface)
            ptPairPtsSphereMeshes[1].position.copy(v1).addScaledVector(v2, -distanceToSurface)

            sphereToPlane(ptPairPtsSphereMeshes[0].position, ptPairPtsFloorMeshes[0].position)
            sphereToPlane(ptPairPtsSphereMeshes[1].position, ptPairPtsFloorMeshes[1].position)
        }
    })
}