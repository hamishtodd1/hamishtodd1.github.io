function initInvariants() {

    let mat = new THREE.MeshPhongMaterial({ color: 0xBD8ED2 })

    let majorRadius = 1.5 //.4 is infinitely small, 80. is infinitely big
    let minorRadius = Math.sqrt(majorRadius) * .37
    let spheres = Array(2)
    for (let i = 0; i < 2; ++i) {
        spheres[i] = new THREE.Mesh(new THREE.SphereGeometry(1.), new THREE.MeshPhongMaterial({ color: i ? 0xFFFFFF : 0x000000 }))
        scene.add(spheres[i])
    }
    let spherePositions = [spheres[0].position, spheres[1].position]
    let vectorPair = [v1, v2]

    let radialSegments = 16
    let tubularSegments = 40
    let torGeo = new THREE.TorusGeometry(majorRadius, minorRadius, radialSegments, tubularSegments)
    let tor = new THREE.Mesh(torGeo, mat)
    let cylGeo = new THREE.CylinderGeometry(1., 1., 1., radialSegments,1)
    let cyl = new THREE.Mesh(cylGeo, mat)
    tor.castShadow = true
    cyl.castShadow = true
    scene.add(tor,cyl)

    let dir = new THREE.Vector3().set(1., 0.26, -0.07).normalize()
    tor.quaternion.setFromUnitVectors(v1.set(0., 0., 1.), dir)

    mrh = _e15.multiplyScalar(50., new Even())
    mrh.normalize()

    let projector = new Even()
    let zrs = new Odd()


    let bivector = new Even()
    let square = new Even()
    let projectableUna = new Odd()
    updateInvariants = (transform) => {

        transform.selectGrade(2,bivector)

        bivector.mul(bivector,square)
        let isScalar = square.selectGrade(4, even0).isZero() && square.selectGrade(2, even0).isZero()
        
        if(!isScalar) {
            console.log("yo")
        }
        
        if(square[0] !== 0.)
            bivector.normalize()

        let incidentWithPointAtInf = bivector.mul( _e1230, even0 ).selectGrade(4, even1).isZero()
        
        if (square[0] > 0.) {
            // hyperbolic or scaling
            cyl.visible = false
            tor.visible = false

            bivector.pointPairToVector3s(spherePositions)

            for (let i = 0; i < 2; ++i)
                spheres[i].scale.setScalar(.75 / Math.sqrt(spheres[i].position.distanceTo(camera.position)))
        } 
        else if(incidentWithPointAtInf && square[0] <= 0.) {


            if(square[0] === 0.) {
                bivector.toDq(dq0)
                dq0.joinPt(camera.mvs.pos, fl0).meet(camera.frustum.far, dq1)
                bivector.fromDq(dq1)
            }

            // rotation
            cyl.visible = true
            tor.visible = false
            spheres[0].visible = false
            spheres[1].visible = false

            //TODO minorRadius needs to depend on distance from origin
            let radius = Math.max(.03, .37 * Math.sqrt(cyl.position.length()))
            cyl.scale.set(radius, 99999., radius)

            _e123.projectOn(bivector, odd0).flatPointToVector3(cyl.position)
            
            // debugger
            bivector.projectOn(_e123, even0).mulReverse(_e13,even1)
            even1.toQuaternion(cyl.quaternion)
            getSqrtQuaternion(cyl.quaternion, cyl.quaternion)
        }
        else if (!incidentWithPointAtInf && square[0] === 0.) {
            // parabolic
            cyl.visible = false
            tor.visible = true
            spheres[0].visible = true
            spheres[1].visible = true
        }
        else if (!incidentWithPointAtInf && square[0] < 0.) {
            // toroidal vortex
            cyl.visible = false
            tor.visible = true
            spheres[0].visible = false
            spheres[1].visible = false

            //carrier, ya big hipocrite!
            let circlePlane = bivector.inner(_e0,odd0)
            
            circlePlane.mulReverse(_e3,even0).toQuaternion(tor.quaternion)
            getSqrtQuaternion(tor.quaternion, tor.quaternion)
            
            let positionPp = bivector.inner(_e1230, even1).meet(circlePlane,odd1)
            let translationToCenter = positionPp.mulReverse(_e123, even2)
            translationToCenter[0] *= 2.
            translationToCenter.translationToVector3(tor.position)
            
            let favouriteSphere = bivector.inner(circlePlane, odd2)
            let favouriteSphereAtOrigin = translationToCenter.reverse(even3).sandwich(favouriteSphere, odd3)
            favouriteSphereAtOrigin.meet(_e12, odd4).pointPairToVector3s(vectorPair)
            majorRadius = .5 *vectorPair[0].distanceTo(vectorPair[1])

            minorRadius = Math.max(.03, .37 * Math.sqrt(tor.position.length()))

            const vertices = torGeo.attributes.position.array
            let index = 0
            for (let j = 0; j <= radialSegments; j++) {
                for (let i = 0; i <= tubularSegments; i++) {

                    const u = i / tubularSegments * (Math.PI * 2.);
                    const v = j / radialSegments * Math.PI * 2.;

                    v1.x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
                    v1.y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
                    v1.z = minorRadius * Math.sin(v);

                    v1.toArray(vertices, index * 3)

                    ++index
                }
            }

            torGeo.attributes.position.needsUpdate = true
            torGeo.attributes.normal.needsUpdate = true
        }

    }
}

function initTransform() {

    let skipTo = 0
    let stickOn = 5
    
    let totalBars = 37
    let totalTime = 64.5
    let secondsPerThingy = 2. * totalTime / totalBars
    let transitionTime = .7
    
    let transform = new Even()

    let incrementalOdd = new Odd()
    let incrementalEven = new Even()
    let transformOdd = new Odd()
    let transformEven = new Even()

    let sign = text(transform.toString(), false, "#000000")
    sign.position.z = -18
    sign.position.y = 7.5
    camera.add(sign)
    scene.add(camera)

    class Thingy {
        constructor(name, pieces, linearTime = false) {
            this.pieces = pieces
            this.linearTime = linearTime
            this.bireflection = pieces.length === 2
            this.name = name
        }
    }

    let thingies = [
        // new Thingy(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ],
        //     true
        // ),
        new Thingy(
            `Rotate`,
            [
                // Rotate your hands
                new Odd().copy(_e3),
                _e3.addScaled(_e2, .3, new Odd()),
            ],
            true
        ),
        new Thingy(
            `Toroidal Vortex`,
            [
                // Rotate around a circle
                new Odd().copy(_e3),
                _e3.addScaled(_e4.addScaled(_e0,4.5,odd0), -.15, new Odd()).normalize(),
            ],
            true
        ),
        new Thingy(
            `Parabolic`,
            [
                // Parabolic
                new Odd().copy(_e3),
                _e3.addScaled(_eo, 0.45, new Odd()),
            ],
        ),
        new Thingy(
            `Hyperbolic translation`,
            [
                // Dipole
                new Odd().copy(_e3),
                _e3.addScaled(_e5, .3, odd0).addScaled( _e0, .8, new Odd()),
            ],
        ),
        new Thingy(
            `Scale`,
            [
                // Scale
                new Odd().copy(_e4),
                _e4.addScaled(_e5, .4, new Odd()),
            ],
        ),
        new Thingy(
            `Translate`,
            [
                // Go for a walk that's translating
                new Odd().copy(_e3),
                _e3.addScaled(_e0, 1.8, new Odd()),
            ],
        ),
        // new Thingy(
        //     `Euclidean screw`,
        //     [
        //         // Let's see you screw (euclidean)
        //         new Odd().copy(_e1),
        //         _e1.addScaled(_e2, 1., new Odd()),
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e0, 3.8, new Odd()),
        //     ],
        //     // true
        // ),
        // new Thingy(
        //     `Elliptic screw`,
        //     [
        //         //elliptic screw
        //         new Odd().copy(_e1),
        //         _e1.addScaled(_e2, 1., new Odd()),
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e4.addScaled(_e0, 4.5, odd0), -.25, new Odd()).normalize(),
        //     ]
        // ),
        // new Thingy(
        //     `Parabolic screw`,
        //     [
        //         new Odd().copy(_e1),
        //         _e2.addScaled(_e1, 1., new Odd()),
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_eo, 0.65, new Odd()),
        //     ]
        // ),
        // new Thingy(
        //     `Hyperbolic screw`,
        //     [
        //         // Rotate your dipole
        //         new Odd().copy(_e1),
        //         _e2.addScaled(_e1, 1., new Odd()),
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e5, .3, odd0).addScaled(_e0, .8, new Odd()),
        //     ]
        // ),
        // new Thingy(
        //     `Scale-rotation (similarity)`,
        //     [
        //         new Odd().copy(_e1),
        //         _e2.addScaled(_e1, 1., new Odd()),
        //         new Odd().copy(_e4),
        //         _e4.addScaled(_e5, .4, new Odd()),
        //     ]
        // ),
        // new Thingy(
        //     `Point reflection`,
        //     [
        //         new Odd().copy(_e1),
        //         new Odd().copy(_e2),
        //         new Odd().copy(_e3),
        //     ]
        // ),
        // Point reflection
        // Rotoreflection
        // Dipole reflection
        // Poincare screw
        // Sphere reflection
        // Hyperideal reflection
    ]

    // let circlePairOffsetter = new Even()
    // circlePairOffsetter.addScaled(_one, Math.cos(TAU / 8. / 2.), circlePairOffsetter)
    // circlePairOffsetter.addScaled(_e24, Math.sin(TAU / 8. / 2.), circlePairOffsetter)
    // thingies[0].forEach(a=>{
    //     debugger
    //     circlePairOffsetter.sandwich(a, odd0)
    //     a.copy(odd0)
    // })

    let weirdStudy = _one.addScaled(_e12.mul(_e34, even0), .2, new Even())
    
    let lerpedPieces = [new Odd(), new Odd()]

    let thingyIndexOld = -1
    updateAndGetTransform = () => {

        // return _one

        let timeFactor = frameCount * .03
        let oscillatingTimeFactor = Math.sin(frameCount * .030)
        // transform.zero()

        //     .addScaled(_one, 1., transform)
        //     .addScaled(_e20, timeFactor, transform)

        // .addScaled(_one, Math.cos(timeFactor), transform)
        // .addScaled(_e24, Math.sin(timeFactor), transform)

        // .addScaled(_one, Math.cosh(Math.sin(timeFactor)), transform)
        // .addScaled(_e25, Math.sinh(Math.sin(timeFactor)), transform)

        let time = clock.getElapsedTime()
        let thingyIndex = (skipTo+Math.floor(time / secondsPerThingy)) % thingies.length
        thingyIndex = stickOn === -1 ? thingyIndex : stickOn
        let thingy = thingies[thingyIndex]
        if (thingyIndexOld !== thingyIndex) {
            log(thingy.name)
            thingyIndexOld = thingyIndex
        }

        let pieces = null
        // if(thingies[thingyIndex].bireflection && thingyIndex+1 < thingies.length-1 && thingies[thingyIndex+1].bireflection) {
        //     let timeThroughThingy = time - thingyIndex * secondsPerThingy
        //     let factorThroughTransition = Math.max(0., timeThroughThingy - (secondsPerThingy - transitionTime)) / transitionTime
            
        //     let nextThingy = thingies[thingyIndex+1]
        //     for(let i = 0; i < 2; ++i)
        //         thingy.pieces[i].lerp(nextThingy.pieces[i],factorThroughTransition,lerpedPieces[i])
        //     pieces = lerpedPieces
        // }
        // else
        pieces = thingy.pieces

        transform = pieces.length % 2 ? transformOdd : transformEven
        incrementalEven.copy(_one)

        for(let i = 0; i < pieces.length; ++i) {
            if(i%2) {
                pieces[i].mul(incrementalOdd, incrementalEven)
                if (i === pieces.length - 1)
                    transform.copy(incrementalEven)
            }
            else {
                pieces[i].mul(incrementalEven,incrementalOdd)
                if(i === pieces.length-1)
                    transform.copy(incrementalOdd)
            }
        }
            
        if(transform === transformEven)
            transform.pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, transform)

        
        
        // debugger
        // circlePairOffsetter.sandwich( _e23, even0 )
        // even0.log()
        // even0.mul( weirdStudy.multiplyScalar(timeFactor,even2), even1 ).exp(transform)

        sign.material.setText(transform.toString(2))

        return transform
    }
}