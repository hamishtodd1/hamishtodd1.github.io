/*
    Isn't the update rule "take the mean of the samples and the standard deviation"?
    Can certainly have them travel to the right place via a geodesic at least


    The story:
        need a potential function!
        So it literally costs energy to change your mind a certain way?
        "take the shortest path" - somehow this is related to moving from one point to another
            in a way where the points are "easy to mistake for one another"
        Suppose you were "interrupted half way through changing your mind"
            You would, in that instant, have a belief that would incorporate both

    Generate a fuckload of gaussians. See their graphs and their points
    Apply a bayesian update to them. You know what it looks like for the points, what about for the graphs?

    THIS IS A WASTE OF TIME UNTIL YOU HAVE A SCALAR FIELD ON THIS SPACE!

    Can show:
        a "rotation around" some gaussians - solenoidal - free-energy-constant
        a bunch of gaussians "reflect
        reflecting in a, er, geodesic of gaussians? Call it "line" of gaussians
            Simple: some that vary by standard deviation but same mean
                Reflection in a vertical line, has ddinf
            Complicated: circular arc. Could say defined by two dirac delta
            Metaphysically fucked: reflection in 
 */

updateHyperbolic = () => {}

function initHyperbolic() {

    flowBiv = new Mv31()
    flowBiv.zero()

    let gaussianGroup = new THREE.Group()
    scene.add(gaussianGroup)


    let vecs = [new THREE.Vector3(), new THREE.Vector3()]

    // return

    //upper half plane
    let uhpPss = new CircleViz(0xFF0000)
    uhpPss.mv.copy(_e2)

    // initFlowViz()
    // return

    
    
    ///////////////
    // Gaussians //
    ///////////////
    
    // let cv = new CircleViz()
    // cv.mv.copy(_e1)

    // let mousePpViz = new PtPairViz(true)
    // mousePpViz.mv.copy(_e1p)

    let connectingViz = new CircleViz(0x00FF00)
    let endPointsViz = new PtPairViz(false, 0xFF0000)
    let startGaussian = new Gaussian(0x0000FF)
    gaussianGroup.add(startGaussian)
    
    startGaussian.setMeanSd(0., 0.)
    // startGaussian.visible = false
    // let endGaussian = new Gaussian(0x00FFFF)
    // endGaussian.visible = false

    

    document.addEventListener(`keydown`, e => {
        if (e.key === "ArrowUp") {
        }
        if (e.key === "ArrowDown") {
        }
        if (e.key === "ArrowLeft") {
            angle += .02
        }
        if (e.key === "ArrowRight") {
            angle -= .02
        }
    })

    let startViz = new PtPairViz(false, 0x000000)
    let endViz = new PtPairViz(false, 0x000000)
    let holding = false
    document.addEventListener('mouseup', e => {
        if (e.button === 0) {
            holding = false
        }
    })
    document.addEventListener('mousedown', e => {
        if (e.button === 0) {
            holding = true            
            vecToPosPp(mousePos,startViz.mv)
        }
    })
    document.addEventListener('mousemove', e => {
        if (holding) {
            vecToPosPp(mousePos,endViz.mv)

            // if(frameCount > 100)
            //     debugger
            endViz.mv.mulReverse(startViz.mv, mv0).cheapSqrt(mv0).logarithm(flowBiv)
            flowBiv.inner(_e1pm, connectingViz.mv)

            endPointsViz.mv.copy(flowBiv)
            // flowBiv.multiplyScalar(.2, flowBiv)

        }
    })

    // if(0)
    {
        let numExampleGaussians = 5
        let exampleGaussians = []
        let examplePps = []
        let myCol = new THREE.Color()
        for (let i = 0; i < numExampleGaussians; ++i) {
            let col = myCol.setHSL(i / 8., 1., .5).getHex()
            let g = new Gaussian(col)
            gaussianGroup.add(g)
            exampleGaussians.push(g)
            // exampleGaussians[i].setMeanSd(Math.random() * .2-.1, Math.random() * .2 + .4)
            examplePps[i] = new PtPairViz(false, col)
            g.mv = examplePps[i].mv
        }

        let displaced = new Mv31()
        
        //boosting
        if(1)
        {
            let startGaussian = new Gaussian(0x000000, startViz.mv)
            gaussianGroup.add(startGaussian)
            let endGaussian = new Gaussian(0x000000, endViz.mv)
            gaussianGroup.add(endGaussian)

            let boost = new Mv31()
            let timeSinceMouseUp = -1.
            document.addEventListener('mouseup', e => {
                timeSinceMouseUp = 0.
            })
            document.addEventListener('mousedown', e => {
                timeSinceMouseUp = -1.
            })
            function updateGaussians() {
                
                let boostMultiple = .4 * timeSinceMouseUp
                flowBiv.multiplyScalar(boostMultiple, mv0).exp(boost)
                
                if(timeSinceMouseUp < 0. || boostMultiple >= 1.)
                    return

                startViz.mv.pointPairToVecs(vecs)
                let startCenter = (vecs[0].y > vecs[1].y ? vecs[0] : vecs[1])
                startCenter.y += beliefSpaceScene.position.y + 0.1
                vecToPosPp(startCenter,displaced)

                for (let i = 0; i < numExampleGaussians; ++i) {
                    let multiple = i * TAU / numExampleGaussians / 2.
                    let exampleStart = startViz.mv.multiplyScalar(multiple, mv0).exp(mv1).sandwich(displaced, mv2)

                    boost.sandwich(exampleStart, examplePps[i].mv)
                }

                timeSinceMouseUp += frameDelta
            }
        }
        else
        //circulating
        {
            let centerPp = new PtPairViz(false, 0x000000)
            let centerGaussian = new Gaussian(0x000000)
            gaussianGroup.add(centerGaussian)
            centerGaussian.mv = centerPp.mv
            _e1p.addScaled(_e1o, 2.7, centerPp.mv).cheapNormalize(centerPp.mv)

            centerPp.mv.addScaled(_e1o, 1.9, displaced).cheapNormalize(displaced)

            let angle = 0.
            function updateGaussians() {
                angle = frameCount * .013
                for (let i = 0; i < numExampleGaussians; ++i) {
                    let multiple = angle + i * TAU / numExampleGaussians / 2.
                    centerPp.mv.multiplyScalar(multiple, mv0).exp(mv1).sandwich(start, examplePps[i].mv)
                }
            }
        }
    }

    updateHyperbolic = () => {
        
        // vecToPosPp(mousePpViz.mv)

        // pt.position.copy(mousePos)
        // if ( .06 > Math.abs(pt.position.y - scalingLine.position.y)) {
        //     pt.position.y = scalingLine.position.y
        // }

        // pp.inner(_e0, ppCs[0])
        // ppCs[0].inner(pp, ppCs[1])

        // cv.mv.copy(_e1)
        // r.sandwich(cv.mv, cv.mv)

        // updateFlowViz()

        //want the two circles to cross at point
        //by default, they are diagonal at the point
        //or, maybe they should slowly circulate

        //rotate them 45 degrees
        //extract center with e0
        //extract radius
    }
}