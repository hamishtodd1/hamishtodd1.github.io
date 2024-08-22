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

    let thingies = [
        [
            // Rotate your hands
            new Odd().copy(_e3),
            _e1.addScaled(_e3, .2, new Odd()),
        ],
        [
            // Rotate around a circle
            new Odd().copy(_e3),
            _e4.addScaled(_e3, .2, new Odd()),
        ],
        [
            // Parabolic
            new Odd().copy(_e3),
            _eo.addScaled(_e3, 2.5, new Odd()),
        ],
        [
            // Dipole
            new Odd().copy(_e3),
            _e5.addScaled(_e3, .8, new Odd()),
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

    thingToMoveThingies = new Even()
    thingToMoveThingies.addScaled(_one, Math.cos(TAU / 8. / 2.), thingToMoveThingies)
    thingToMoveThingies.addScaled(_e24, Math.sin(TAU / 8. / 2.), thingToMoveThingies)
    // thingies[0].forEach(a=>{
    //     debugger
    //     thingToMoveThingies.sandwich(a, odd0)
    //     a.copy(odd0)
    // })

    let weirdStudy = _one.addScaled(_e12.mul(_e34, even0), .2, new Even())
    let framesPerThingy = 250

    updateAndGetTransform = () => {

        let timeFactor = frameCount * .01
        let oscillatingTimeFactor = Math.sin(frameCount * .025)
        transform.zero()

            .addScaled(_one, 1., transform)
            .addScaled(_e20, timeFactor, transform)

        // .addScaled(_one, Math.cos(timeFactor), transform)
        // .addScaled(_e24, Math.sin(timeFactor), transform)

        // .addScaled(_one, Math.cosh(Math.sin(timeFactor)), transform)
        // .addScaled(_e25, Math.sinh(Math.sin(timeFactor)), transform)

        
        let thingyIndex = Math.floor(frameCount / framesPerThingy) % thingies.length
        thingyIndex = 2
        let thingy = thingies[thingyIndex]
        transform = thingy.length % 2 ? transformOdd : transformEven
        incrementalEven.copy(_one)
        // debugger
        for(let i = 0; i < thingy.length; ++i) {
            if(i%2) {
                thingy[i].mul(incrementalOdd, incrementalEven)
                if (i === thingy.length - 1)
                    transform.copy(incrementalEven)
            }
            else {
                thingy[i].mul(incrementalEven,incrementalOdd)
                if(i === thingy.length-1)
                    transform.copy(incrementalOdd)
            }
        }
        
        if(transform === transformEven) {
            transform.normalize()
            transform.logarithm(even0).multiplyScalar(oscillatingTimeFactor, even0)
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