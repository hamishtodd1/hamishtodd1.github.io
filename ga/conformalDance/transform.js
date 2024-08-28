function initTransform() {

    let skipTo = 0
    let stickOn = -1
    
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
        constructor(name, pieces, linearTime = false, slowdown = 1.) {
            this.pieces = pieces
            this.linearTime = linearTime
            this.name = name
            this.slowdown = slowdown
        }
    }

    let thingies = [
        // new Thingy(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Thingy(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Thingy(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
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
                _e4.addScaled(_e0, 1.2, new Odd()).normalize(),
            ],
            true,
            .2
        ),
        new Thingy(
            `Parabolic`,
            [
                //5
                // Parabolic
                new Odd().copy(_e3),
                _e3.addScaled(_eo, -0.45, new Odd()),
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
        new Thingy(
            `Euclidean screw`,
            [
                // Let's see you screw (euclidean)
                new Odd().copy(_e3),
                _e3.addScaled(_e0, 1.8, new Odd()),
                new Odd().copy(_e1),
                _e1.addScaled(_e2, 1., new Odd()),
            ],
            // true
        ),
        new Thingy(
            `Elliptic screw`,
            [
                //10
                //elliptic screw
                new Odd().copy(_e3),
                _e4.addScaled(_e0, 1.2, new Odd()).normalize(),
                new Odd().copy(_e1),
                _e1.addScaled(_e2, 1., new Odd()),
            ]
        ),
        new Thingy(
            `Parabolic screw`,
            [
                new Odd().copy(_e3),
                _e3.addScaled(_eo, -0.45, new Odd()),
                new Odd().copy(_e1),
                _e1.addScaled(_e2, 1., new Odd()),
            ]
        ),
        new Thingy(
            `Hyperbolic screw`,
            [
                // Rotate your dipole
                new Odd().copy(_e3),
                _e3.addScaled(_e5, .3, odd0).addScaled(_e0, .8, new Odd()),
                new Odd().copy(_e1),
                _e1.addScaled(_e2, 1., new Odd()),
            ]
        ),
        new Thingy(
            `Scale-rotation (similarity)`,
            [
                new Odd().copy(_e4),
                _e4.addScaled(_e5, .4, new Odd()),
                new Odd().copy(_e1),
                _e1.addScaled(_e2, 1., new Odd()),
            ]
        ),
        new Thingy(
            `Point reflection`,
            [
                new Odd().copy(_e2),
                new Odd().copy(_e3),
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Rotoreflection`,
            [
                _e3.addScaled(_e2, .3, new Odd()),
                new Odd().copy(_e3),
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Parabolic Transflection`,
            [
                new Odd().copy(_e3),
                _e3.addScaled(_eo, 0.45, new Odd()),
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Hyperbolic transflection`,
            [
                new Odd().copy(_e3),
                _e3.addScaled(_e5, .3, odd0).addScaled( _e0, .8, new Odd()),
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Sphere reflection`,
            [
                _e4.addScaled(_e5, 0.7, new Odd()),
            ]
        ),
        new Thingy(
            `Scale-rotoreflection`,
            [
                new Odd().copy(_e4),
                _e4.addScaled(_e5, .4, new Odd()),
                new Odd().copy(_e3),
                _e3.addScaled(_e2, .3, new Odd()),
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Reflect`,
            [
                // Clap your hands
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Reflect`,
            [
                // Clap your hands
                new Odd().copy(_e1),
            ]
        ),
        new Thingy(
            `Reflect`,
            [
                // Clap your hands
                new Odd().copy(_e1),
            ]
        ),
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
    
    let lerpedPieces = [
        [],
        [new Odd()],
        [new Odd(), new Odd()],
        [new Odd(), new Odd(), new Odd()],
        [new Odd(), new Odd(), new Odd(), new Odd()],
        [new Odd(), new Odd(), new Odd(), new Odd(), new Odd()],
    ]

    let updateSpheres = initSpheres()

    let thingyIndexOld = -1
    update = () => {

        // return _one

        let time = clock.getElapsedTime()
        let timeFactor = frameCount * .03
        let oscillatingTimeFactor = Math.sin(2.*TAU * time / secondsPerThingy)
        // log(oscillatingTimeFactor)
        // transform.zero()

        //     .addScaled(_one, 1., transform)
        //     .addScaled(_e20, timeFactor, transform)

        // .addScaled(_one, Math.cos(timeFactor), transform)
        // .addScaled(_e24, Math.sin(timeFactor), transform)

        // .addScaled(_one, Math.cosh(Math.sin(timeFactor)), transform)
        // .addScaled(_e25, Math.sinh(Math.sin(timeFactor)), transform)

        let thingyIndex = (skipTo+Math.floor(time / secondsPerThingy)) % thingies.length
        thingyIndex = stickOn === -1 ? thingyIndex : stickOn
        log(thingyIndex)
        let thingy = thingies[thingyIndex]
        if (thingyIndexOld !== thingyIndex) {
            thingyIndexOld = thingyIndex
        }

        let timeThroughThingy = time - thingyIndex * secondsPerThingy
        //not that we're actually using the transition
        let factorThroughTransition = Math.max(0., timeThroughThingy - (secondsPerThingy - transitionTime)) / transitionTime

        let transitionable = thingies[thingyIndex + 1] !== undefined && thingies[thingyIndex].pieces.length === thingies[thingyIndex + 1].pieces.length

        let pieces = null
        if ( !transitionable || factorThroughTransition === 0. )
            pieces = thingy.pieces
        else {
            pieces = lerpedPieces[thingy.pieces.length]
            
            let nextThingy = thingies[thingyIndex+1]
            for(let i = 0; i < 2; ++i)
                thingy.pieces[i].lerp( nextThingy.pieces[i], factorThroughTransition,pieces[i] )
        }
        
        transform = thingy.pieces.length % 2 ? transformOdd : transformEven
        
        incrementalEven.copy(_one)
        for (let i = 0; i < pieces.length; ++i) {
            if (i % 2) {
                pieces[i].mul(incrementalOdd, incrementalEven)
                if (i === pieces.length - 1)
                    transform.copy(incrementalEven)
            }
            else {
                pieces[i].mul(incrementalEven, incrementalOdd)
                if (i === pieces.length - 1)
                    transform.copy(incrementalOdd)
            }
        }
        sign.material.setText(transform.toString(2))
            
        updateVizes(pieces, transform)

        let power = thingy.slowdown * (thingy.linearTime ? timeFactor : oscillatingTimeFactor)
        if(transitionable) {
            let power0 = thingy.slowdown * (thingy.linearTime ? timeFactor : oscillatingTimeFactor)
            let power1 = thingies[thingyIndex+1].slowdown * (thingies[thingyIndex+1].linearTime ? timeFactor : oscillatingTimeFactor)
            power = power0 * (1. - factorThroughTransition) + power1 * factorThroughTransition
        }


        if (pieces.length === 2) {
            transform.pow(power, transform)
        }
        else if (pieces.length === 3 && thingy.name !== `Point reflection`) {
            pieces[1].mul(pieces[0], even0).pow(power, even1)
            pieces[2].mul(even1, transform)
        }
        else if(pieces.length === 4) {
            pieces[1].mul(pieces[0], even0).pow(power, even1)
            pieces[3].mul(pieces[2], even2).pow(power, even3)
            even3.mul(even1,transform)
        }
        else if (pieces.length === 5) {
            pieces[1].mul(pieces[0], even0).pow(power, even1)
            pieces[3].mul(pieces[2], even2).pow(power, even3)
            even3.mul( even1, even4 )
            pieces[4].mul( even4, transform )
        }
        updateField(transform)

        updateSpheres(pieces)
        
        
        // debugger
        // circlePairOffsetter.sandwich( _e23, even0 )
        // even0.log()
        // even0.mul( weirdStudy.multiplyScalar(timeFactor,even2), even1 ).exp(transform)

        
    }
}
