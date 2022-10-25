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

    let cylGeo = new THREE.CylinderBufferGeometry(tubeRadius, tubeRadius, 1000.)

    {
        var gridMvs = []
        let gridNumWide = 9
        for (let i = 0; i < gridNumWide; ++i) {
            mv0.copy(e01).naieveAxisToRotor(2. * (i / (gridNumWide-1) - .5))
            gridMvs.push(mv0.sandwich(e1, new Mv()))

            mv0.copy(e02).naieveAxisToRotor(2. * (i / (gridNumWide-1) - .5))
            gridMvs.push(mv0.sandwich(e2, new Mv()))
        }
        // gridMvs.push(e2.clone().add(nI))
        var gridCount = gridMvs.length
    }
    
    let hyperbolic = new Dw(2, 1, false, true)
    {
        //in this context, the y plane is ePlus. x is e1, z is e2
        //so lines through origin are e1Plus, e12, e2Plus
        //eMinus is your line at infinity
        //the pga pseudoscalar here is the north pole, the point e12*nO

        //in this space, the y plane is ePlus
        var hyperbolicOrigin = mul(e12,ePlus)
        {
            let sphereMat = new THREE.MeshPhongMaterial({
                // transparent: true,
                // opacity: .4,
                color: 0xFFFF00
            })
            let sphere = new THREE.Mesh(new THREE.SphereGeometry(1.), sphereMat)
            sphere.renderOrder = 1
            hyperbolic.scene.add(sphere)
        }

        hyperbolic.camera.position.set(1.,1.,2.).setLength(2.5)
        hyperbolic.camera.lookAt(zeroVector)
        hyperbolic.camera.fov = getFov(2.)
        hyperbolic.camera.updateProjectionMatrix()

        let planesGeo = new THREE.CircleGeometry(1.,30)
        let planesMat = new THREE.MeshPhongMaterial({ color: 0xFF00FF, side:THREE.DoubleSide })
        var gridPlanes = new THREE.InstancedMesh(planesGeo, planesMat, gridCount)
        hyperbolic.scene.add(gridPlanes)
    }

    {
        var ptPair = mul(ePlus, e1)
        mul(e1, nO, ptPair)
        // ptPair.copy(e12)
        var ptPairLineMesh = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({ color: 0x00FF00 }))
        ptPairLineMesh.matrixAutoUpdate = false
        hyperbolic.scene.add(ptPairLineMesh)

        //you also want a point pair on the plane

        hyperbolicOrigin.projectOn(mul(e1, nI), mv0).log("projection")
        
        let ptPairPtsGeo = new THREE.SphereGeometry(tubeRadius*3.)
        let ptPairPtsMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 })
        var ptPairPtsMeshes = [
            new THREE.Mesh(ptPairPtsGeo, ptPairPtsMat),
            new THREE.Mesh(ptPairPtsGeo, ptPairPtsMat)
        ]
        hyperbolic.scene.add(ptPairPtsMeshes[0])
        hyperbolic.scene.add(ptPairPtsMeshes[1])

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
        let conformal = new Dw(2,2)
        
        var lookPlane = ePlus.clone().sub(eMinus)

        conformal.camera.position.set(0., 1., 0.)
        conformal.camera.lookAt(0., -1., 0.)

        // var gridLines = new THREE.InstancedMesh(cylGeo,new THREE.MeshBasicMaterial({color: 0x0000FF}), gridCount)
        // conformal.scene.add(gridLines)

        let gridLinesVertexShader = gaShaderPrefix + `
                void cgaMulReduced1(in float y, in float[32] m, out float[32] target) {
                    target[0] = -m[6] - m[8] * y + m[9] * y; target[1] = m[2] + m[4] * y - m[5] * y; target[2] = -m[1] + m[17] * y - m[18] * y; target[3] = -m[16] + m[19] * y - m[20] * y; target[4] = -m[17] - m[1] * y - m[21] * y; target[5] = -m[18] - m[21] * y - m[1] * y; target[6] = m[0] - m[11] * y + m[12] * y; target[7] = m[10] - m[13] * y + m[14] * y; target[8] = m[11] + m[0] * y + m[15] * y; target[9] = m[12] + m[15] * y + m[0] * y; target[10] = -m[7] - m[26] * y + m[27] * y; target[11] = -m[8] + m[6] * y + m[28] * y; target[12] = -m[9] + m[28] * y + m[6] * y; target[13] = -m[26] + m[7] * y + m[29] * y; target[14] = -m[27] + m[29] * y + m[7] * y; target[15] = -m[28] - m[9] * y + m[8] * y; target[16] = m[3] + m[22] * y - m[23] * y; target[17] = m[4] - m[2] * y - m[24] * y; target[18] = m[5] - m[24] * y - m[2] * y; target[19] = m[22] - m[3] * y - m[25] * y; target[20] = m[23] - m[25] * y - m[3] * y; target[21] = m[24] + m[5] * y - m[4] * y; target[22] = -m[19] - m[16] * y - m[31] * y; target[23] = -m[20] - m[31] * y - m[16] * y; target[24] = -m[21] + m[18] * y - m[17] * y; target[25] = -m[31] + m[20] * y - m[19] * y; target[26] = m[13] + m[10] * y + m[30] * y; target[27] = m[14] + m[30] * y + m[10] * y; target[28] = m[15] - m[12] * y + m[11] * y; target[29] = m[30] - m[14] * y + m[13] * y; target[30] = -m[29] - m[27] * y + m[26] * y; target[31] = m[25] + m[23] * y - m[22] * y;
                }
                void cgaMulReduced2(in float[32] a, in float[32] b, out vec3 target ) {
                    float y1 = b[ 8] * a[ 0] + b[ 4] * a[ 1] - b[17] * a[ 2] - b[19] * a[ 3] - b[ 1] * a[ 4] - b[21] * a[ 5] + b[11] * a[ 6] + b[13] * a[ 7] + b[ 0] * a[ 8] + b[15] * a[ 9] - b[26] * a[10] - b[ 6] * a[11] - b[28] * a[12] - b[ 7] * a[13] - b[29] * a[14] - b[ 9] * a[15] - b[22] * a[16] - b[ 2] * a[17] - b[24] * a[18] - b[ 3] * a[19] - b[25] * a[20] - b[ 5] * a[21] + b[16] * a[22] + b[31] * a[23] + b[18] * a[24] + b[20] * a[25] - b[10] * a[26] - b[30] * a[27] - b[12] * a[28] - b[14] * a[29] + b[27] * a[30] + b[23] * a[31];
                    float y2 = b[ 9] * a[ 0] + b[ 5] * a[ 1] - b[18] * a[ 2] - b[20] * a[ 3] - b[21] * a[ 4] - b[ 1] * a[ 5] + b[12] * a[ 6] + b[14] * a[ 7] + b[15] * a[ 8] + b[ 0] * a[ 9] - b[27] * a[10] - b[28] * a[11] - b[ 6] * a[12] - b[29] * a[13] - b[ 7] * a[14] - b[ 8] * a[15] - b[23] * a[16] - b[24] * a[17] - b[ 2] * a[18] - b[25] * a[19] - b[ 3] * a[20] - b[ 4] * a[21] + b[31] * a[22] + b[16] * a[23] + b[17] * a[24] + b[19] * a[25] - b[30] * a[26] - b[10] * a[27] - b[11] * a[28] - b[13] * a[29] + b[26] * a[30] + b[22] * a[31];
                    target.y = (y1 + y2)*.5;

                    float x1 = b[11] * a[ 0] + b[17] * a[ 1] + b[ 4] * a[ 2] - b[22] * a[ 3] - b[ 2] * a[ 4] - b[24] * a[ 5] - b[ 8] * a[ 6] + b[26] * a[ 7] + b[ 6] * a[ 8] + b[28] * a[ 9] + b[13] * a[10] + b[ 0] * a[11] + b[15] * a[12] - b[10] * a[13] - b[30] * a[14] - b[12] * a[15] + b[19] * a[16] + b[ 1] * a[17] + b[21] * a[18] - b[16] * a[19] - b[31] * a[20] - b[18] * a[21] - b[ 3] * a[22] - b[25] * a[23] - b[ 5] * a[24] + b[23] * a[25] + b[ 7] * a[26] + b[29] * a[27] + b[ 9] * a[28] - b[27] * a[29] - b[14] * a[30] - b[20] * a[31];
                    float x2 = b[12] * a[ 0] + b[18] * a[ 1] + b[ 5] * a[ 2] - b[23] * a[ 3] - b[24] * a[ 4] - b[ 2] * a[ 5] - b[ 9] * a[ 6] + b[27] * a[ 7] + b[28] * a[ 8] + b[ 6] * a[ 9] + b[14] * a[10] + b[15] * a[11] + b[ 0] * a[12] - b[30] * a[13] - b[10] * a[14] - b[11] * a[15] + b[20] * a[16] + b[21] * a[17] + b[ 1] * a[18] - b[31] * a[19] - b[16] * a[20] - b[17] * a[21] - b[25] * a[22] - b[ 3] * a[23] - b[ 4] * a[24] + b[22] * a[25] + b[29] * a[26] + b[ 7] * a[27] + b[ 8] * a[28] - b[26] * a[29] - b[13] * a[30] - b[19] * a[31];
                    target.x = (x1 + x2)*.5;
                    
                    target.z = b[ 6] * a[ 0] + b[ 2] * a[ 1] - b[ 1] * a[ 2] + b[16] * a[ 3] + b[17] * a[ 4] - b[18] * a[ 5] + b[ 0] * a[ 6] - b[10] * a[ 7] - b[11] * a[ 8] + b[12] * a[ 9] + b[ 7] * a[10] + b[ 8] * a[11] - b[ 9] * a[12] - b[26] * a[13] + b[27] * a[14] + b[28] * a[15] + b[ 3] * a[16] + b[ 4] * a[17] - b[ 5] * a[18] - b[22] * a[19] + b[23] * a[20] + b[24] * a[21] + b[19] * a[22] - b[20] * a[23] - b[21] * a[24] + b[31] * a[25] - b[13] * a[26] + b[14] * a[27] + b[15] * a[28] - b[30] * a[29] + b[29] * a[30] + b[25] * a[31];
                }
                void sandwichMvWithPtOnE1(in float[32] m, in float y, out vec3 target) {
                    //m*(p*~m)
                    float[32] mReverse; reverse(m, mReverse);
                    float[32] intermediary; cgaMulReduced1( y, mReverse, intermediary);
                    cgaMulReduced2(m, intermediary, target);
                }

                uniform float[32] e1ToCircle;

                void main() {
                    //it's a series of flat points on e1, eg, e12 + e01 * y
                    //you transform them to the correct place
                    
                    vec3 spinePoint;
                    sandwichMvWithPtOnE1(e1ToCircle, position.y, spinePoint);

                    vec4 transformedPosition = vec4(spinePoint.x/spinePoint.z,0.,spinePoint.y/spinePoint.z,1.);
                    //and then we push it down a little
                    transformedPosition *= 2.;
                    transformedPosition.y = -1.;
                    transformedPosition.w = 1.;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * transformedPosition;
                }
            `

        // log(gaShaderPrefix)
        let stripMat = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                e1ToCircle: 5
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
        for (let i = 0; i < numVerts; ++i)
            verts[i] = new THREE.Vector3(0.,.0001 + (i-.5*(numVerts-1))*.9,0.)
        let lineGeo = new THREE.BufferGeometry().setFromPoints(verts)

        var gridLines = Array(gridCount)
        for(let i = 0; i < gridCount; ++i) {
            gridLines[i] = new THREE.Line(lineGeo, stripMat.clone())
            gridLines[i].material.uniforms.e1ToCircle.value = oneMv.clone()
            conformal.scene.add(gridLines[i])
        }
        
        //if you have problems, could consider projecting origin or whatever onto the circle/line
        //then mapping that point back to e1
        //then sending that point in as a uniform y amount to be added
    }

    function grade3ToVectorInHyperbolic(mv, target) {
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
        return grade3ToVectorInHyperbolic(getterMv0, target)
    }
    
    function getQuaternionTo(mv,originComparisonMv,target) {
        mv.projectOn(hyperbolicOrigin, getterMv0).normalize()
        //the origin in this space is still a bunch of planes that square to 1 so this is fine
        mul(getterMv0, originComparisonMv, getterMv1).naieveSqrt() //kiiiinda wrong way around
        target.set(getterMv1.e2Plus(), getterMv1.e12(), getterMv1.e1Plus(), getterMv1[0]).normalize()

        return target
    }

    function lineMvToCylGeoMatrix(lineMv, target) {
        // debugger
        getPositionVector(lineMv, v1)
        getQuaternionTo(lineMv, e12, q1)
        q1.y *= -1.

        target.compose(v1, q1, v2.set(1., 1., 1.))

        return target
    }

    updateFunctions.push(() => {
        
        gridMvs.forEach((gridMv, i) => {
            
            {
                //e2 is the z plane, ePlus is the y plane
                getQuaternionTo(gridMv, e2, q1)
                q1.y *= -1.
                getPositionVector(gridMv, v1)

                let radius = .05 + Math.sqrt(1. - v1.lengthSq())
                m1.compose(v1, q1, v2.set(radius, radius, radius))
                gridPlanes.setMatrixAt(i, m1)
            }

            {
                // meet(lookPlane, gridMv, mv0)
                // lineMvToCylGeoMatrix(mv0,m1)
                // gridLines.setMatrixAt(i, m1)

                mul(gridMv, e1, gridLines[i].material.uniforms.e1ToCircle.value).naieveSqrt()
            }
        })
        gridPlanes.instanceMatrix.needsUpdate = true
        // gridLines.instanceMatrix.needsUpdate = true


        {
            lineMvToCylGeoMatrix(ptPair, ptPairLineMesh.matrix)

            getPositionVector(ptPair, v1)
            let distanceToSurface = Math.sqrt(1. - v1.length())

            let directionToMoveIn = meet(ptPair, eMinus)
            grade3ToVectorInHyperbolic(directionToMoveIn, v2)
            ptPairPtsMeshes[0].position.copy(v1).addScaledVector(v2, distanceToSurface)
            ptPairPtsMeshes[1].position.copy(v1).addScaledVector(v2, -distanceToSurface)
        }
    })
}