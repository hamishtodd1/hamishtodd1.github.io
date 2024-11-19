/*
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

updateHyperbolic = () => { }
function initHyperbolic() {

    initVizes()

    //upper half plane
    let uhpPss = new CircleViz(0xFF0000)
    uhpPss.mv.copy(_e2)

    // initFlowViz()
    // return

    let hider = new THREE.Mesh(new THREE.PlaneGeometry(100., 50.), new THREE.MeshBasicMaterial({ color: 0x405B59 }))
    hider.position.y = 25.
    scene.add(hider)
    
    ///////////////
    // Gaussians //
    ///////////////
    let gaussianGroup = new THREE.Group()
    scene.add(gaussianGroup)
    // gaussianGroup.position.y = -1.
    let radius = .01
    let tubularSegments = 200
    {
        let mean = 0.
        let constant0 = -1.
        let constant1 = -1.
        function computeGaussianConstants(newMean, newSd) {
            // debugger
            mean = newMean
            let sd = newSd
            constant0 = 1. / (sd * Math.sqrt(2. * Math.PI))
            constant1 = -1. / (2. * sd * sd)
        }
        class GaussianCurve extends THREE.Curve {

            constructor() {
                super();
            }

            getPoint(t, optionalTarget = new THREE.Vector3()) {

                const x = (t - .5) * 5.
                const y = constant0 * Math.exp((x - mean) * (x - mean) * constant1)

                return optionalTarget.set(x, y, 0.)
            }
        }
        window.GaussianCurve = GaussianCurve
    }
    
    let vecs = [new THREE.Vector3(), new THREE.Vector3()]
    class Gaussian extends THREE.Group {
        
        constructor(color, mv) {
            const path = new GaussianCurve(10)

            computeGaussianConstants(0., 1.)
            const geometry = new THREE.TubeGeometry(path, tubularSegments, radius, 4, false)
            const material = new THREE.MeshBasicMaterial({ color })

            super()
            this.ordinary = new THREE.Mesh(geometry, material)
            this.add(this.ordinary)
            // this.diracDelta = new THREE.Mesh(geometry, material)
            
            gaussianGroup.add(this)

            obj3dsWithOnBeforeRenders.push(this)

            this.mv = mv || null
        }

        onBeforeRender() {
            if(this.mv) {
                this.mv.pointPairToVecs(vecs)
                let vec = vecs[0].y > vecs[1].y ? vecs[0] : vecs[1]
                this.setMeanSd(vec.x, vec.y)
            }
        }

        setMeanSd(newMean, newSd) {
            computeGaussianConstants(newMean, newSd)
            this.ordinary.geometry.regenerateAllSegments()
            this.ordinary.geometry.attributes.position.needsUpdate = true
            this.ordinary.geometry.attributes.normal.needsUpdate = true
        }
    }
    // let cv = new CircleViz()
    // cv.mv.copy(_e1)

    // let mousePpViz = new PtPairViz(true)
    // mousePpViz.mv.copy(_e1p)

    let connectingViz = new CircleViz(0x00FF00)
    let endPointsViz = new PtPairViz(false, 0xFF0000)
    let startGaussian = new Gaussian(0x0000FF)
    startGaussian.setMeanSd(0., 0.)
    // startGaussian.visible = false
    // let endGaussian = new Gaussian(0x00FFFF)
    // endGaussian.visible = false

    function vecToPosPp(v,mv) {
        v1.subVectors(v, vizGroup.position)
        let mouseZrc = mv0.vecToZrc(v1)
        mouseZrc.wedge(_e2, mv1).inner(_e12pm, mv) //so it's a rotation pp
        return mv.cheapNormalize(mv)
    }

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
            let endGaussian = new Gaussian(0x000000, endViz.mv)

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
                startCenter.y += vizGroup.position.y + 0.1
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
        
        updateGaussians()



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