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

    class Section {
        constructor(name, pieces, linearTime = false, slowdown = 1.) {
            this.pieces = pieces
            this.linearTime = linearTime
            this.name = name
            this.slowdown = slowdown
        }
    }

    let sections = [
        // new Section(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Rotate`,
        //     [
        //         // Rotate your hands
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e2, .3, new Odd()),
        //     ],
        //     true
        // ),
        // new Section(
        //     `Toroidal Vortex`,
        //     [
        //         // Rotate around a circle
        //         new Odd().copy(_e3),
        //         _e4.addScaled(_e0, 1.2, new Odd()).normalize(),
        //     ],
        //     true,
        //     .2
        // ),
        // new Section(
        //     `Transversion`,
        //     [
        //         //5
        //         // Parabolic
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_eo, -0.45, new Odd()),
        //     ],
        // ),
        // new Section(
        //     `Hyperbolic translation`,
        //     [
        //         // Dipole
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e5, .3, odd0).addScaled( _e0, .8, new Odd()),
        //     ],
        //     true
        // ),
        // new Section(
        //     `Scale`,
        //     [
        //         // Scale
        //         new Odd().copy(_e4),
        //         _e4.addScaled(_e5, .4, new Odd()),
        //     ],
        // ),
        // new Section(
        //     `Translate`,
        //     [
        //         // Go for a walk that's translating
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e0, 1.8, new Odd()),
        //     ],
        // ),
        // new Section(
        //     `Euclidean screw`,
        //     [
        //         // Let's see you screw (euclidean)
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e0, 1.8, new Odd()),
        //         new Odd().copy(_e1),
        //         _e1.addScaled(_e2, 1., new Odd()),
        //     ],
        //     // true
        // ),
        new Section(
            `Elliptic screw`,
            [
                //10
                //elliptic screw
                new Odd().copy(_e3),
                _e4.addScaled(_e2,  1., new Odd()).normalize(),
                new Odd().copy(_e1),
                _e2.addScaled(_e4, -1., new Odd()),
            ],
            // true
        ),
        // new Section(
        //     `Parabolic screw`,
        //     [
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_eo, -0.07, new Odd()),
        //         new Odd().copy(_e1),
        //         _e1.addScaled(_e2, .5, new Odd()),
        //     ]
        // ),
        // new Section(
        //     `Hyperbolic screw`,
        //     [
        //         // Rotate your dipole
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e5, .3, odd0).addScaled(_e0, .8, new Odd()),
        //         new Odd().copy(_e1),
        //         _e1.addScaled(_e2, 1., new Odd()),
        //     ],
        //     // true
        // ),
        // new Section(
        //     `Scale-rotation (similarity)`,
        //     [
        //         new Odd().copy(_e4),
        //         _e4.addScaled(_e5, .4, new Odd()),
        //         new Odd().copy(_e1),
        //         _e1.addScaled(_e2, 1., new Odd()),
        //     ]
        // ),
        // new Section(
        //     `Point reflection`,
        //     [
        //         new Odd().copy(_e2),
        //         new Odd().copy(_e3),
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Rotoreflection`,
        //     [
        //         _e3.addScaled(_e2, .3, new Odd()),
        //         new Odd().copy(_e3),
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Transversion`,
        //     [
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_eo, 0.45, new Odd()),
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Hyperbolic glide reflection`,
        //     [
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e5, .3, odd0).addScaled( _e0, .8, new Odd()),
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Sphere reflection`,
        //     [
        //         _e4.addScaled(_e5, 0.7, new Odd()),
        //     ]
        // ),
        // new Section(
        //     `Scale-rotoreflection`,
        //     [
        //         new Odd().copy(_e4),
        //         _e4.addScaled(_e5, .4, new Odd()),
        //         new Odd().copy(_e3),
        //         _e3.addScaled(_e2, .3, new Odd()),
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
        // ),
        // new Section(
        //     `Reflect`,
        //     [
        //         // Clap your hands
        //         new Odd().copy(_e1),
        //     ]
        // ),
    ]


    let updateSpheres = initSpheres()
    // let extraOdd = new SphereViz(0xFF0000)
    let extraOdd = new Odd()
    let justExtraOdd = [extraOdd]
    initInvariants()
    // let field = null
    let field = initField()

    // let circlePairOffsetter = new Even()
    // circlePairOffsetter.addScaled(_one, Math.cos(TAU / 8. / 2.), circlePairOffsetter)
    // circlePairOffsetter.addScaled(_e24, Math.sin(TAU / 8. / 2.), circlePairOffsetter)
    // sections[0].forEach(a=>{
    //     debugger
    //     circlePairOffsetter.sandwich(a, odd0)
    //     a.copy(odd0)
    // })

    let lerpedPieces = [
        [],
        [new Odd()],
        [new Odd(), new Odd()],
        [new Odd(), new Odd(), new Odd()],
        [new Odd(), new Odd(), new Odd(), new Odd()],
        [new Odd(), new Odd(), new Odd(), new Odd(), new Odd()],
    ]


    update = () => {

        // return _one

        let time = clock.getElapsedTime()
        let timeFactor = frameCount * .014
        let oscillatingTimeFactor = Math.sin(2.*TAU * time / secondsPerThingy)
        // log(oscillatingTimeFactor)
        // transform.zero()

        //     .addScaled(_one, 1., transform)
        //     .addScaled(_e20, timeFactor, transform)

        // .addScaled(_one, Math.cos(timeFactor), transform)
        // .addScaled(_e24, Math.sin(timeFactor), transform)

        // .addScaled(_one, Math.cosh(Math.sin(timeFactor)), transform)
        // .addScaled(_e25, Math.sinh(Math.sin(timeFactor)), transform)

        let sectionIndex = (skipTo+Math.floor(time / secondsPerThingy)) % sections.length
        sectionIndex = stickOn === -1 ? sectionIndex : stickOn
        let section = sections[sectionIndex]

        let timeThroughThingy = time - sectionIndex * secondsPerThingy
        //not that we're actually using the transition
        let factorThroughTransition = Math.max(0., timeThroughThingy - (secondsPerThingy - transitionTime)) / transitionTime

        let transitionable = sections[sectionIndex + 1] !== undefined && sections[sectionIndex].pieces.length === sections[sectionIndex + 1].pieces.length

        let pieces = null
        if ( !transitionable || factorThroughTransition === 0. ) {
            if(field !== null)
                field.visible = true
            pieces = section.pieces
        }
        else {
            if(field !== null)
                field.visible = false
            pieces = lerpedPieces[section.pieces.length]
            
            let nextThingy = sections[sectionIndex+1]
            for (let i = 0; i < section.pieces.length; ++i)
                section.pieces[i].lerp( nextThingy.pieces[i], factorThroughTransition,pieces[i] )
        }
        
        transform = section.pieces.length % 2 ? transformOdd : transformEven
        
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
        // sign.material.setText(transform.toString(2))
        sign.material.setText(section.name)

        // debugger
        if( pieces.length % 2 === 0 )
            updateVizesEven(pieces, transform)
        else
            updateVizesOdd(pieces, transform)

        let power = section.slowdown * (section.linearTime ? timeFactor : oscillatingTimeFactor)
        if(transitionable) {
            let power0 = section.slowdown * (section.linearTime ? timeFactor : oscillatingTimeFactor)
            let power1 = sections[sectionIndex+1].slowdown * (sections[sectionIndex+1].linearTime ? timeFactor : oscillatingTimeFactor)
            power = power0 * (1. - factorThroughTransition) + power1 * factorThroughTransition
        }

        if(pieces.length === 1) {
            extraOdd.copy(pieces[0])
        }
        else if (pieces.length === 2) {
            // extraOdd.visible = false
            transform.pow(power, transform)
            extraOdd.copy(_e5)
        }
        else if (pieces.length === 3 && section.name !== `Point reflection`) {
            pieces[1].mul(pieces[0], even0).pow(power, even1)
            pieces[2].mul(even1, transform)

            extraOdd.copy(pieces[2])
        }
        else if(pieces.length === 4) {
            pieces[1].mul(pieces[0], even0).pow(power, even1)
            pieces[3].mul(pieces[2], even2).pow(power, even3)
            even3.mul(even1,transform)

            transform.selectGrade(4,even4).mul(_e12345,odd0)
            if(!odd0.isZero() && odd0.mul(odd0,even0)[0] > 0.) {
                extraOdd.copy(odd0)
            }
            else extraOdd.copy(_e5)
        }
        else if (pieces.length === 5) {
            pieces[1].mul(pieces[0], even0).pow(power, even1)
            pieces[3].mul(pieces[2], even2).pow(power, even3)
            even3.mul( even1, even4 )
            pieces[4].mul( even4, transform )

            extraOdd.copy(pieces[4])
            
        }

        updateField(transform)

        if(section.name === `Point reflection`) {
            extraOdd.copy(_e5)
        }

        updateSpheres(justExtraOdd)
        updateSpheres(pieces)
        
        
        // debugger
        // circlePairOffsetter.sandwich( _e23, even0 )
        // even0.log()
        // even0.mul( weirdStudy.multiplyScalar(timeFactor,even2), even1 ).exp(transform)
        
    }

    fieldMode = false
    toggle = () => {
        fieldMode = !fieldMode
        setSpheresVisibility(!fieldMode)
        setFieldVisibility(fieldMode)
    }
    toggle()
}
