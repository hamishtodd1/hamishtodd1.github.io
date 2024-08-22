function initTransform() {
    
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
        constructor(pieces) {
            this.pieces = pieces
            this.linearTime = false
            this.bireflection = fals
        }
    }

    let pieceses = [
        [
            // Rotate your hands
            new Odd().copy(_e3),
            _e1.addScaled(_e3, .2, new Odd()),
        ],
        [
            // Rotate around a circle
            new Odd().copy(_e3),
            _e4.multiplyScalar(-1.,odd0).addScaled(_e3, .2, odd0).multiplyScalar(-1., new Odd()),
        ],
        [
            // Parabolic
            new Odd().copy(_e3),
            _eo.addScaled(_e3, 2.5, new Odd()),
        ],
        [
            // Dipole
            new Odd().copy(_e3),
            _e5.addScaled(_e3, 1.8, odd0).addScaled( _e0, .99, new Odd()),
        ],
        [
            // Scale
            new Odd().copy(_e4),
            _e5.addScaled(_e4, .2, new Odd()),
        ],
        // Go for a walk that's translating
        // Let's see you screw
        // Elliptic screw
        // Parabolic(screw)
        // Elliptic screw
        // Rotate your dipole
        // Scale your rotation
        // Point reflection
        // Rotoreflection
        // Dipole reflection
        // Sphere reflection
        // Scale - rotoreflection


        [
            //hyperbolic screw
            new Odd().copy(_e1),
            _e1.addScaled(_e5, .2, new Odd()),
            new Odd().copy(_e2),
            _e2.addScaled(_e3, .3, new Odd()),
        ],
        [
            //elliptic screw
            new Odd().copy(_e1),
            _e1.addScaled(_e4, 1., new Odd()),
            new Odd().copy(_e2),
            _e2.addScaled(_e3, 1., new Odd()),
        ],
        [
            new Odd().copy(_e1),
            _e1.addScaled(_e0, 1.2,new Odd())
        ]
    ]
    let thingies = pieceses.map(p=>new Thingy(p))
    for(let i = 0; i < 5; ++i)
        thingies[i].bireflection = true

    thingies[1].linearTime = true

    let thingToMoveThingies = new Even()
    thingToMoveThingies.addScaled(_one, Math.cos(TAU / 8. / 2.), thingToMoveThingies)
    thingToMoveThingies.addScaled(_e24, Math.sin(TAU / 8. / 2.), thingToMoveThingies)
    // thingies[0].forEach(a=>{
    //     debugger
    //     thingToMoveThingies.sandwich(a, odd0)
    //     a.copy(odd0)
    // })

    let weirdStudy = _one.addScaled(_e12.mul(_e34, even0), .2, new Even())
    let secondsPerThingy = 2.

    updateAndGetTransform = () => {

        // return _one

        let timeFactor = frameCount * .0075
        let oscillatingTimeFactor = Math.sin(frameCount * .030)
        // transform.zero()

        //     .addScaled(_one, 1., transform)
        //     .addScaled(_e20, timeFactor, transform)

        // .addScaled(_one, Math.cos(timeFactor), transform)
        // .addScaled(_e24, Math.sin(timeFactor), transform)

        // .addScaled(_one, Math.cosh(Math.sin(timeFactor)), transform)
        // .addScaled(_e25, Math.sinh(Math.sin(timeFactor)), transform)

        let time = clock.getElapsedTime()
        let thingyIndex = Math.floor(time / secondsPerThingy) % thingies.length
        thingyIndex = 1


        
        let thingy = thingies[thingyIndex]
        let pieces = thingy.pieces

        transform = pieces.length % 2 ? transformOdd : transformEven
        incrementalEven.copy(_one)
        // debugger
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
        
        if(transform === transformEven) {
            // debugger
            transform.normalize()
            transform.logarithm(even0).multiplyScalar(thingy.linearTime ? timeFactor:oscillatingTimeFactor, even0)
            even0.exp(transform)
        }
        
        // debugger
        // thingToMoveThingies.sandwich( _e23, even0 )
        // even0.log()
        // even0.mul( weirdStudy.multiplyScalar(timeFactor,even2), even1 ).exp(transform)

        sign.material.setText(transform.toString(2))

        return transform
    }
}