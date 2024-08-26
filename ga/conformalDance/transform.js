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
        constructor(name, pieces, linearTime = false) {
            this.pieces = pieces
            this.linearTime = linearTime
            this.bireflection = pieces.length === 2
            this.name = name
        }
    }

    let thingies = [
        new Thingy(
            `Reflect`,
            [
                // Clap your hands
                new Odd().copy(_e1),
            ]
        ),
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
        new Thingy(
            //7
            `Euclidean screw`,
            [
                // Let's see you screw (euclidean)
                new Odd().copy(_e1),
                _e1.addScaled(_e2, .7, new Odd()),
                new Odd().copy(_e3),
                _e3.addScaled(_e0, 3.8, new Odd()),
            ],
            // true
        ),
        new Thingy(
            `Elliptic screw`,
            [
                //elliptic screw
                new Odd().copy(_e1),
                _e1.addScaled(_e2, 1., new Odd()),
                new Odd().copy(_e3),
                _e3.addScaled(_e4.addScaled(_e0, 4.5, odd0), -.25, new Odd()).normalize(),
            ]
        ),
        new Thingy(
            `Parabolic screw`,
            [
                new Odd().copy(_e1),
                _e2.addScaled(_e1, 1., new Odd()),
                new Odd().copy(_e3),
                _e3.addScaled(_eo, 0.65, new Odd()),
            ]
        ),
        new Thingy(
            `Hyperbolic screw`,
            [
                // Rotate your dipole
                new Odd().copy(_e1),
                _e2.addScaled(_e1, 1., new Odd()),
                new Odd().copy(_e3),
                _e3.addScaled(_e5, .3, odd0).addScaled( _e0, .8, new Odd()),
            ]
        ),
        new Thingy(
            `Scale-rotation (similarity)`,
            [
                new Odd().copy(_e1),
                _e2.addScaled(_e1, 1., new Odd()),
                new Odd().copy(_e4),
                _e4.addScaled(_e5, .4, new Odd()),
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
        let thingy = thingies[thingyIndex]
        if (thingyIndexOld !== thingyIndex) {
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
        
        transform = thingy.pieces.length % 2 ? transformOdd : transformEven
        
        pieces = thingy.pieces
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

        if (pieces.length === 2) {
            transform.pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, transform)
        }
        else if (pieces.length === 3 && thingy.name !== `Point reflection`) {
            pieces[1].mul(pieces[0], even0).pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, even1)
            pieces[2].mul(even1, transform)
        }
        else if(pieces.length === 4) {
            pieces[1].mul(pieces[0], even0).pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, even1)
            pieces[3].mul(pieces[2], even2).pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, even3)
            even3.mul(even1,transform)
        }
        else if (pieces.length === 5) {
            pieces[1].mul(pieces[0], even0).pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, even1)
            pieces[3].mul(pieces[2], even2).pow(thingy.linearTime ? timeFactor : oscillatingTimeFactor, even3)
            even3.mul( even1, even4 )
            pieces[4].mul( even4, transform )
        }
        updateField(transform)
        
        // debugger
        // circlePairOffsetter.sandwich( _e23, even0 )
        // even0.log()
        // even0.mul( weirdStudy.multiplyScalar(timeFactor,even2), even1 ).exp(transform)

        
    }
}
