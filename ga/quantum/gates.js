function initGates(paulis,rotators,tqgs) {
    const maxGatesNeeded = 8

    let ag = arrowGeometry2()
    let am = new THREE.MeshPhongMaterial({ color: 0xFFA500 })
    let shellMat = new THREE.MeshPhongMaterial({ color: 0xAFEEEE, transparent: true, opacity: .5 })
    let shellGeo = new THREE.IcosahedronBufferGeometry(SHELL_RADIUS, 3)

    BlochShell = function (rect, onClick) {

        let shell = new THREE.Mesh(shellGeo, shellMat)
        scene.add(shell)
        thingsToRotate.push(shell)

        updateFunctions.push(() => {
            shell.position.copy(rect.position)
            shell.position.add(circuitHolder.position)
            shell.position.add(v0.copy(camera.position).sub(rect.position).setLength(SHELL_RADIUS * 1.2))
        })

        if (onClick !== undefined) {
            onClick.z = () => {
                mouse.raycaster.ray.closestPointToPoint(shell.position, v0)
                let rayDistToCenter = v0.distanceTo(shell.position)
                if (rayDistToCenter >= SHELL_RADIUS)
                    return -Infinity

                let v0ToSurfaceDist = Math.sqrt(SHELL_RADIUS * SHELL_RADIUS - rayDistToCenter * rayDistToCenter)
                return v0.distanceTo(camera.position) - v0ToSurfaceDist
            }
            onClicks.push(onClick)
        }

        shell.intersectMouseRay = (target) => {
            mouse.raycaster.ray.closestPointToPoint(shell.position, v0)
            let rayDistToCenter = v0.distanceTo(shell.position)
            if (rayDistToCenter >= SHELL_RADIUS) {
                target.copy(v0).sub(shell.position).setLength(SHELL_RADIUS).add(shell.position)
            }
            else {
                let v0ToSurfaceDist = Math.sqrt(SHELL_RADIUS * SHELL_RADIUS - rayDistToCenter * rayDistToCenter)

                target.copy(v0).sub(camera.position)
                target.setLength(target.length() - v0ToSurfaceDist)
                target.add(camera.position)
            }

            return target
        }

        return shell
    }

    BlochSphere = function (rect) {

        let bs = BlochShell(rect)

        let blochVec = new THREE.Mesh(ag, am)
        // blochVec.scale.multiplyScalar(SHELL_RADIUS)
        blochVec.matrixAutoUpdate = false
        blochVec.matrix.multiplyScalar(SHELL_RADIUS)
        blochVec.matrix.elements[15] = 1.
        bs.add(blochVec)

        bs.setVisibility = (newVisibility) => {
            bs.visible = newVisibility
            blochVec.visible = newVisibility
        }

        bs.setFrom2Vec = (numerator, denominator) => {
            complexToSphere(numerator, denominator, mv0)

            //maybe better way to do it
            // mv0[11] = 1.
            // let arrowPointingUpMv = mv1.point(0., 1., 0., 1.)
            // let ourRotor = mv2
            // arrowPointingUpMv.mul(mv0, ourRotor)
            // ourRotor.sqrtBiReflection(ourRotor)
            // ourRotor.toQuaternion(blochVec.quaternion)

            setRotationallySymmetricMatrix(mv0[14], mv0[13], mv0[12], blochVec.matrix)
            blochVec.matrix.multiplyScalar(SHELL_RADIUS)
            blochVec.matrix.elements[15] = 1.
        }

        return bs
    }

    CombinedBsKb = function(rect) {
        let bsKb = {}

        let kb = KleinBall()
        let bs = BlochSphere(rect)

        scene.add(kb)
        kb.scale.setScalar(SHELL_RADIUS)
        updateFunctions.push(() => {
            kb.position.copy(rect.position)
            kb.position.add(circuitHolder.position)
            kb.position.add(v0.copy(camera.position).sub(rect.position).setLength(SHELL_RADIUS))
        })

        bsKb.setFromAbcd = (a, b, c, d) => {
            let det = a.mul(d, c0).sub(b.mul(c, c1))
            if (frameCount === 1)
                log(det, det.approximatelyEquals(zeroComplex))

            //infinity gets mapped to a/c, 0 gets mapped to b/d
            //is it a choice of projection which one is infinity and which is 0?

            //it's problematic to have an if statement
            if (det.approximatelyEquals(zeroComplex)) {
                bs.setVisibility(true)
                kb.setVisibility(false)

                //yeah it's schmidt

                //ad = bc
                //a/b=c/d

                //ordinary:
                // 00 01
                // 10 11

                //here:
                // 00 10
                // 01 11

                //what you usually have:
                // 00 + 01 //probability of 0a
                // 10 + 11 //probability of 1a
                //what you want:
                // 00 + 10 //probability of 0b - should be 1. Square and add? Probably. This is why you have the silliness
                // 01 + 11 //probability of 1b

                //could use a/c or b/d. They're equal unless B is 100% known
                //Want whichever will give the most precision. That's probably the one where the magnitudes are higher

                //this is a temporary measure until we find a change of basis that puts more variability in a/c
                //but it "should" work because they should be the same
                if (a.squaredMagnitude() + c.squaredMagnitude() > b.squaredMagnitude() + d.squaredMagnitude())
                    bs.setFrom2Vec(c, a)
                else
                    bs.setFrom2Vec(d, b)

                // let aPlusB = new Complex().copy(a).add(b)
                // let cPlusD = new Complex().copy(c).add(d)
                // //so this is a density matrix
                // //under what circumstances is and isn't this equal to a/c?
                // bs.setFrom2Vec(cPlusD,aPlusB)
                // delete aPlusB
                // delete cPlusD
                // //sounds more like what z = 1 gets sent to
            }
            else {
                bs.setVisibility(false)
                kb.setVisibility(true)

                abcdToMotor(a, b, c, d, kb.stateMotor)
            }
        }

        return bsKb
    }

    function getGatePosition(v, rect) {
        let wireIndex = getWire(rect)
        if (wireIndex === -1)
            return

        // v.x = 0.
        v.z = WIRES[wireIndex].position.z
        v.y = WIRES[wireIndex].position.y

        let ourIndexAlong = circuitGates[wireIndex].indexOf(rect)
        let lengthWeUse = WIRE_LENGTH * .94
        let intendedX = (ourIndexAlong + .5) * (lengthWeUse / maxGatesPerWire) - lengthWeUse / 2.
        v.x += (intendedX - v.x) * .1
    }
    
    function SquareRectangle(params) {
        params.w = GATE_DIMENSION
        params.h = GATE_DIMENSION

        params.getPosition = getGatePosition

        let rect = Rectangle(params)
        return rect
    }

    let littleBallGeometry = new THREE.SphereGeometry(SHELL_RADIUS / 7.)
    let sp = new THREE.Mesh(littleBallGeometry, new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
    scene.add(sp)
    sp.position.y -= 999.
    
    let landmarkframe = new THREE.Object3D()
    {
        let landmarkMat = new THREE.MeshBasicMaterial({ color: 0x00FFFF })
        let landmarkMat2 = new THREE.MeshBasicMaterial({ color: 0xFF00FF })
        scene.add(landmarkframe)
        thingsToRotate.push(landmarkframe)
        landmarkframe.position.set(0., -999999., 0.)
        let coordNames = ["x", "y", "z"]
        function makeLandmark(mat) {
            let landmark = new THREE.Mesh(littleBallGeometry, mat ? landmarkMat : landmarkMat2)
            landmark.scale.setScalar(.9)
            landmarkframe.add(landmark)
            return landmark
        }
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 2; ++j) {
                let landmark = makeLandmark(0)
                landmark.position[coordNames[i]] = SHELL_RADIUS * (j ? 1. : -1.)
            }
        }
        let coord = SHELL_RADIUS / Math.SQRT2
        makeLandmark(1).position.set(coord, coord, 0.)
        makeLandmark(1).position.set(coord, -coord, 0.)
        makeLandmark(1).position.set(-coord, coord, 0.)
        makeLandmark(1).position.set(-coord, -coord, 0.)
        makeLandmark(1).position.set(coord, 0., coord)
        makeLandmark(1).position.set(coord, 0., -coord)
        makeLandmark(1).position.set(-coord, 0., coord)
        makeLandmark(1).position.set(-coord, 0., -coord)
        makeLandmark(1).position.set(0., coord, coord)
        makeLandmark(1).position.set(0., coord, -coord)
        makeLandmark(1).position.set(0., -coord, coord)
        makeLandmark(1).position.set(0., -coord, -coord)
    }

    //--------PAULI
    {
        let verts = []
        let numSnowflakes = 10
        for (let i = 0; i < numSnowflakes; ++i) {
            for (let j = 0; j < 3; ++j) {
                let vert1 = new THREE.Vector3(0., (i / (numSnowflakes - 1.)) * SHELL_RADIUS * 2. - SHELL_RADIUS, SHELL_RADIUS / 10.)
                let vert2 = vert1.clone()
                vert1.applyAxisAngle(yUnit, TAU / 6. * j)
                vert2.applyAxisAngle(yUnit, TAU / 6. * j + TAU / 2.)
                verts.push(vert1)
                verts.push(vert2)
            }
        }
        let lineReflectionGeo = new THREE.BufferGeometry().setFromPoints(verts)
        let lineReflectionMat = new THREE.LineBasicMaterial({ color: 0x000000 })

        //TODO should maybe have two different sides
        for (let i = 0; i < maxGatesNeeded; ++i) {
            let pauliBox = SquareRectangle({})
            pauliBox.position.y = -999.

            let pauliCoords = new THREE.Vector3(1., 1., 0.) //initialized to hadamard
            updateFunctions.push(() => {
                pauliCoords.normalize()
                setRotationallySymmetricMatrix(pauliCoords.x, pauliCoords.y, pauliCoords.z, pipeCleaner.matrix)
            })

            pauliBox.getMatrix = (target) => {
                target.copy(pauli1).multiplyScalar(-pauliCoords.x)
                c2m1.copy(pauli2).multiplyScalar(pauliCoords.z)
                target.add(c2m1)
                c2m1.copy(pauli3).multiplyScalar(-pauliCoords.y)
                target.add(c2m1)

                //decide on this AFTER you've sorted out whether pauli multiplication of a vector

                // reflection.inner(e1,mv0)[0]

                return target
            }

            let shell = BlochShell(pauliBox, {
                during: () => {
                    shell.intersectMouseRay(pauliCoords)

                    landmarkframe.position.copy(shell.position)
                    landmarkframe.updateMatrixWorld()
                    landmarkframe.worldToLocal(pauliCoords)
                    landmarkframe.children.forEach((landmark) => {
                        if (pauliCoords.distanceTo(landmark.position) < SHELL_RADIUS / 6.)
                            pauliCoords.copy(landmark.position)
                    })

                    // sp.position.copy(pauliCoords)
                    // landmarkframe.localToWorld(sp.position)
                },
                end: () => {
                    landmarkframe.position.set(0., -999999., 0.)
                }
            })
            let pipeCleaner = new THREE.LineSegments(lineReflectionGeo, lineReflectionMat)
            shell.add(pipeCleaner)
            pipeCleaner.matrixAutoUpdate = false

            //TODO visualize orientation for it

            paulis[i] = pauliBox
        }
    }

    //-------------TWO QUBITS
    //Are these directional in any sense? Unentangled A,B -> controlled not -> changing B impacts A?
    {
        let matToBeExponentiated = new ComplexMat(4)
        let plusVector = new Complex(1. / Math.sqrt(2.), 1. / Math.sqrt(2.))
        let minusITauOver4 = new Complex(0., -TAU / 4.)
        for (let i = 0; i < maxGatesNeeded / 2; ++i) {
            let tqg = Rectangle({
                h: WIRE_SPACING + GATE_DIMENSION,
                w: GATE_DIMENSION,
                getPosition: (v, rect) => {
                    getGatePosition(v, rect)
                    if (getWire(rect) !== -1)
                        v.y = 0.
                }
            })

            tqg.pX = 0.
            tqg.pY = 0.
            let indicator = new THREE.Mesh(littleBallGeometry, new THREE.MeshBasicMaterial({ color: 0x0000FF }))
            scene.add(indicator)
            updateFunctions.push(() => {
                indicator.position.x = (tqg.pX - .5) * lieAlgSpace.scale.x + lieAlgSpace.position.x
                indicator.position.y = (tqg.pY - .5) * lieAlgSpace.scale.y + lieAlgSpace.position.y

                indicator.position.add(circuitHolder.position)
            })

            let lieAlgSpaceWidth = GATE_DIMENSION * .9
            let lieAlgSpace = Rectangle({
                w: lieAlgSpaceWidth,
                h: lieAlgSpaceWidth, // * Math.sqrt(2.),
                // col: 0xFF0000,
                textureUrl: "data/lieAlg.png",
                haveFrame: false,
                getPosition: (v) => {
                    v.copy(tqg.position)
                    v.z += .001
                },
                onClick: {
                    during: () => {
                        lieAlgSpace.mousePosInOurScaledSpace(v0)
                        tqg.pX = clamp(v0.x + .5, 0., 1.)
                        tqg.pY = clamp(v0.y + .5, 0., 1.)

                        if (Math.abs(tqg.pX - .5) < .05)
                            tqg.pX = 0.5
                        if (Math.abs(tqg.pY - .5) < .05)
                            tqg.pY = 0.5
                    }
                }
            })

            tqg.getMatrix = (target) => {

                // if(tqg.pX < 0.5 && tqg.pY < 0.5)
                //     target.copy(identity4x4)
                // if (tqg.pX > 0.5 && tqg.pY < 0.5)
                //     target.copy(cnot)
                // if (tqg.pX < 0.5 && tqg.pY > 0.5)
                //     target.copy(iSwap)
                // if (tqg.pX > 0.5 && tqg.pY > 0.5)
                //     target.copy(swap)

                matToBeExponentiated.copy(zero4x4)

                let crazyMode = true
                if (!crazyMode) {
                    let tX = tqg.pX / 2. //goes half way into the cube
                    let tY = tqg.pY / 2.
                    let tZ = tqg.pY / 2.

                    c4m0.copy(XxX)
                    c4m0.multiplyScalar(tX)
                    matToBeExponentiated.add(c4m0)
                    c4m0.copy(YxY)
                    c4m0.multiplyScalar(tY)
                    matToBeExponentiated.add(c4m0)
                    c4m0.copy(ZxZ)
                    c4m0.multiplyScalar(tZ)
                    matToBeExponentiated.add(c4m0)
                }
                else {
                    c4m0.copy(logCnotOverMinusIHalfPi)
                    c4m0.multiplyScalar(tqg.pX)
                    matToBeExponentiated.add(c4m0)
                    c4m0.copy(logSwapOverMinusIHalfPi)
                    c4m0.multiplyScalar(tqg.pY)
                    matToBeExponentiated.add(c4m0)
                }

                matToBeExponentiated.multiplyComplex(minusITauOver4)
                matToBeExponentiated.exp(target)

                // magic.mul(c4m0,c4m1).mul(magicConjugateTranspose,target)
                // target.log("here it is")

                //just try it with three orthogonal disks, might be enough
                //then, an octahedron with corners at infinity
                //octahedron plus disks parallel to faces and through origin
                /*
                    Nice to have:
                        some that are parallel
                        some that meet

                    make something so you can build the thing
                */

                //maybe you want to exponentiate?
            }

            tqg.position.y = -9999.

            tqgs[i] = tqg
        }
    }

    //-----------ROTATION
    //TODO you actually want the full 720! Can have red 270 different to blue 90
    //also they're a line, not an area
    {
        // if(0)
        //drag moves it around, it's a 180/axis. Hold spacebar and it holds the thing in place and becomes a rotation
        let editingAngle = false
        bindButton("q", () => {
            editingAngle = true
        }, "", () => { }, false, () => {
            editingAngle = false
        })

        let axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., -SHELL_RADIUS, 0.), new THREE.Vector3(0., SHELL_RADIUS, 0.)])
        let axisMat = new THREE.LineBasicMaterial({ color: 0x000000 })
        let fanTopMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide })
        let fanBottomMat = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.DoubleSide })

        let numSegments = 14
        let fanFaces = []
        //using the clockwiseness of this may well make sense
        for (let i = 0; i < numSegments; ++i) {
            fanFaces.push(new THREE.Face3(i + 2, i + 1, 0))
        }

        for (let i = 0; i < maxGatesNeeded; ++i) {
            let rotator = SquareRectangle({
                onClick: () => {
                    log("this is a rotation")
                }
            })
            rotator.position.y = -999.
            rotators[i] = rotator

            let pauliCoords = new THREE.Vector3(1., 1., 0.) //initialized to hadamard
            let thetaOverTau = .5
            updateFunctions.push(() => {
                pauliCoords.normalize()
                setRotationallySymmetricMatrix(pauliCoords.x, pauliCoords.y, pauliCoords.z, axisAndFan.matrix)
            })

            rotator.getMatrix = (target) => {

                c2m1.copy(zero2x2)

                c2m0.copy(pauli1)
                c2m0.multiplyScalar(-pauliCoords.x)
                c2m1.add(c2m0)

                c2m0.copy(pauli2)
                c2m0.multiplyScalar(pauliCoords.z)
                c2m1.add(c2m0)

                c2m0.copy(pauli3)
                c2m0.multiplyScalar(-pauliCoords.y)
                c2m1.add(c2m0)

                let theta = thetaOverTau * TAU
                let minusHalfthetaI = new Complex(0., -theta / 2.)
                c2m1.multiplyComplex(minusHalfthetaI)
                delete minusHalfthetaI

                c2m1.exp(target)

                //maybe you want to exponentiate?
                return target
            }

            let shell = BlochShell(rotator, {
                during: () => {
                    if (!editingAngle) {
                        shell.intersectMouseRay(pauliCoords)

                        landmarkframe.position.copy(shell.position)
                        landmarkframe.updateMatrixWorld()
                        landmarkframe.worldToLocal(pauliCoords)
                        landmarkframe.children.forEach((landmark) => {
                            if (pauliCoords.distanceTo(landmark.position) < SHELL_RADIUS / 6.)
                                pauliCoords.copy(landmark.position)
                        })
                    }
                    else {
                        mouse.getZZeroPosition(v1)
                        thetaOverTau = 1.4 * v1.distanceTo(rotator.position)
                        while (thetaOverTau < -.5)
                            thetaOverTau += 1.
                        while (thetaOverTau > .4)
                            thetaOverTau -= 1.
                        for (let i = -.5; i <= .5; i += .125) {
                            if (Math.abs(thetaOverTau - i) < .04)
                                thetaOverTau = i
                        }
                    }
                },
                end: () => {
                    landmarkframe.position.set(0., -999999., 0.)
                }
            })

            let fanVerts = Array(numSegments)
            let fanGeo = new THREE.Geometry()
            fanGeo.vertices = fanVerts
            fanGeo.faces = fanFaces
            for (let i = 0; i < numSegments + 2; ++i)
                fanVerts[i] = new THREE.Vector3()

            let axisAndFan = new THREE.Object3D()
            scene.add(axisAndFan)
            updateFunctions.push(() => {
                let theta = thetaOverTau * TAU
                for (let i = 0; i < numSegments + 1; ++i) {
                    let ourAngle = i / numSegments * theta
                    fanVerts[i + 1].set(SHELL_RADIUS, 0., 0.)
                    fanVerts[i + 1].applyAxisAngle(yUnit, ourAngle)
                }
                fanGeo.verticesNeedUpdate = true
            })
            let axis = new THREE.LineSegments(axisGeo, axisMat)
            axisAndFan.add(
                new THREE.Mesh(fanGeo, fanTopMat),
                // new THREE.Mesh(fanGeo, fanBottomMat),
                axis
            )
            axisAndFan.children[0].position.y += .001
            shell.add(axisAndFan)
            axisAndFan.matrixAutoUpdate = false
        }
    }
}