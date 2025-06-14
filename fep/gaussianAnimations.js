function initRotations() {

    let bg = beliefSpaceScene.children[0]
    
    let rotater = new Gaussian(0xFCF300)
    let holdingRotater = false
    rotater.visible = false
    rotater.viz.visible = false
    let rotatees = []
    let startPoint = new Mv31()
    let frameOfLastRotaterMovement = -1
    let circleNums = [5, 7, 9]
    circleNums.forEach((n,j) => {
        let col = col0.setHSL(j/circleNums.length, 1., .5).getHex()
        for (let i = 0; i < n; ++i) {
            let rotatee = new Gaussian(col)
            rotatee.visible = false
            rotatee.viz.visible = false
            rotatees.push(rotatee)
        }
    })

    function randomizeGaussian(gaussian) {
        gaussian.setMeanSd(bg.scale.x * (Math.random() - .5), Math.random() * bg.scale.y / 2.)
    }

    let posInbeliefSpaceScene = new THREE.Vector3()

    let heldFreeGaussianIndex = -1
    let freeGaussians = []
    let connectingArcs = []
    for (let i = 0; i < 6; ++i)
        connectingArcs.push(new CircleViz(0x000000))

    let rotatingMode = false
    let connectingArcsVisible = false
    let randomTransformBiv = new Mv31()
    let tRandomTransform = -1.
    document.addEventListener(`keydown`, e => { 
        if (e.key === 's')
            connectingArcsVisible = !connectingArcsVisible
        if (e.key === 'd') {
            if (tRandomTransform !== -1)
                tRandomTransform = -1.
            else
                tRandomTransform = 1.1
        }
        if(e.key === `f`) {
            for(let i = 0; i < 7; ++i) {
                let gaussian = new Gaussian(col0.setHSL(Math.random(), 1., .5).getHex())
                randomizeGaussian(gaussian)
                gaussian.visible = true
                gaussian.viz.visible = true
                freeGaussians.push(gaussian)
            }
        }
        if (e.key === `ArrowLeft`) {

            if (demoTransform.isZero())
                resetDemoTransform()

            demoTransformDirection = -1.

            if (demoTransformFactor === 0.)
                demoTransformFactor = 1.
        }
        if (e.key === `ArrowRight`) {

            if (demoTransform.isZero())
                resetDemoTransform()

            demoTransformDirection = 1.

            if (demoTransformFactor === 1.)
                demoTransformFactor = 0.
        }
    })

    updateGaussianAnimations = () => {
        
        if(rotater.visible) {

            let isDd = Math.abs(rotater.viz.mv.sqScalar()) < .01
            let biv = rotater.viz.mv
            let timeAngle = (frameCount * .003) % TAU
            if(isDd)
                timeAngle = (frameCount-frameOfLastRotaterMovement) * .003
            let rotateeIndex = 0
            circleNums.forEach((n, i) => {
    
                if(!isDd) {
                    let yProportion = 1. - (i + 1) / (circleNums.length + 1)
                    meanSdToPosPp(rotater.viz.positions[0].x, Math.abs(rotater.viz.positions[0].y) * yProportion, startPoint)
                }
                else {
                    meanSdToPosPp(rotater.viz.positions[0].x, sq(i+1) * .13, startPoint)
                }
                startPoint.cheapNormalize(startPoint)
    
                for (let j = 0; j < n; ++j) {
    
                    let angle = 
                        isDd ? 
                        j * .12 + timeAngle * .2 - .5 : 
                        j * TAU / n + timeAngle
                    biv.multiplyScalar(angle, mv0).exp(mv1).sandwich(startPoint, mv2)
                    rotatees[rotateeIndex].viz.mv.copy(mv2)
                    rotatees[rotateeIndex].updateFromMv()
                    
                    rotatees[rotateeIndex].visible = !isDd || i !== 0
                    rotatees[rotateeIndex].viz.visible = rotatees[rotateeIndex].visible
                    ++rotateeIndex
                }
            })
        }

        //////////////////
        // Arc segments //
        //////////////////
        if (freeGaussians.length > 1) {

            let index = 0
            let len = Math.min(4, freeGaussians.length)
            if (!connectingArcsVisible) {
                for (let i = 0, il = connectingArcs.length; i < il; ++i)
                    connectingArcs[i].visible = false
            }
            else {
                for (let i = 0; i < len; ++i) {
                    for (let j = i + 1; j < len; ++j) {
                        connectingArcs[index].setFromStartEnd(freeGaussians[i].viz, freeGaussians[j].viz)
                        connectingArcs[index].visible = true
                        ++index
                    }
                }
                for (let i = index, il = connectingArcs.length; i < il; ++i)
                    connectingArcs[i].visible = false
            }
        }

        ////////////////////
        // Demo transform //
        ////////////////////
        if (demoTransformDirection !== 0.) {

            mv0.copy(demoTransform)
            if (demoTransformDirection === -1.)
                mv0.getReverse(mv0)

            demoTransformFactor += frameDelta * demoTransformDirection * 4.

            if (demoTransformFactor > 1.) {
                demoTransformFactor = 1.
                demoTransformDirection = 0.
            }
            if (demoTransformFactor < 0.) {
                demoTransformFactor = 0.
                demoTransformDirection = 0.
            }
            freeGaussians.forEach(fg => {
                if (fromToGaussians.indexOf(fg) === -1) {
                    fg.viz.mv.copy(mv0.sandwich(fg.viz.mv, mv1))
                    fg.updateFromMv()
                }
            })
        }

        ///////////////////////
        // Random transforms //
        ///////////////////////

        // if (tRandomTransform !== -1.) {

        //     //attempt at resetting
        //     // freeGaussians.forEach(fg => {
        //     //     // if(frameCount > 150)
        //     //     //     debugger    
        //     //     let inSpace = 
        //     //         fg.viz.positions[0].x < bg.scale.x / 2. &&
        //     //         fg.viz.positions[0].x > -bg.scale.x / 2. //&&
        //     //         // fg.viz.positions[0].y < bg.scale.y / 2. &&
        //     //         // fg.viz.positions[0].y > 0.
        //     //     if (!inSpace) {
        //     //         log("y")
        //     //         randomizeGaussian(fg)
        //     //     }
        //     // })

        //     tRandomTransform += frameDelta * .8

        //     if( tRandomTransform >= 1. ) {
        //         tRandomTransform = 0.
                
        //         // sometimes parabolic
        //         // sometimes rotation
        //         // sometimes hyperbolic
        //         let r = Math.random()
        //         if(r < .2) {
        //             log("rotation")
        //             meanSdToPosPp((Math.random() - .5), .4 + .2 * Math.random(), randomTransformBiv).cheapNormalize(randomTransformBiv)
        //             if(Math.random() < .5 )
        //                 randomTransformBiv.negate()
        //         }
        //         else if(r < .5) {
        //             log("hyperbolic")
        //             meanSdToPosPp((Math.random() - .5), .6 * Math.random(), mv0)
        //             meanSdToPosPp((Math.random() - .5), .6 * Math.random(), mv1)
        //             mv0.mulReverse(mv1, mv2).cheapSqrt(mv3).logarithm(randomTransformBiv).cheapNormalize(randomTransformBiv)
        //         }
        //         else if(r < .8) {
        //             log("scaling")
        //             let x = (Math.random() - .5)
        //             // debugger
        //             meanSdToPosPp(x, 1., mv0)
        //             meanSdToPosPp(x, 1.1, mv1)
        //             mv0.mulReverse(mv1, mv2).cheapSqrt(mv3).logarithm(randomTransformBiv)
        //             randomTransformBiv.cheapNormalize(randomTransformBiv).multiplyScalar(Math.random()>.5?.3:-.3, randomTransformBiv)
        //         }
        //         else {
        //             log("parabolic")
        //             let location = .87 * (Math.random() - .5)
        //             _one.addScaled(_e10, location, mv0)
        //             mv0.sandwich(_e1o, mv1)
        //             let speed = .5 * (Math.random() < .5 ? 1. : -1.)
        //             mv1.multiplyScalar(speed, randomTransformBiv)
        //         }
        //         //translation?
        //     }

        //     randomTransformBiv.multiplyScalar( .01, mv0).exp(mv1)
        //     freeGaussians.forEach(fg => {
        //         fg.viz.mv.copy(mv1.sandwich(fg.viz.mv, mv2))
        //         fg.updateFromMv()
        //     })
        // }
    }

    let isoContours = [
        new CircleViz(0xff0000), new CircleViz(0xff0000), new CircleViz(0xff0000), new CircleViz(0xff0000), new CircleViz(0xff0000), new CircleViz(0xff0000),
        new CircleViz(0x0000ff), new CircleViz(0x0000ff), new CircleViz(0x0000ff), new CircleViz(0x0000ff), new CircleViz(0x0000ff), new CircleViz(0x0000ff),
    ]
    isoContours.forEach((isoContour,i) => {
        isoContour.visible = true
    })

    document.addEventListener('mousemove', e => {

        beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))

        log(heldFreeGaussianIndex)
        
        if (heldFreeGaussianIndex !== -1) {

            if (posInbeliefSpaceScene.y > bg.scale.y / 2.)
                posInbeliefSpaceScene.y = bg.scale.y / 2.
            if (posInbeliefSpaceScene.y < 0.)
                posInbeliefSpaceScene.y = 0.
            if (posInbeliefSpaceScene.x > bg.scale.x / 2.) {
                posInbeliefSpaceScene.x = bg.scale.x / 2.
                //maybe infinity?
            }
            if (posInbeliefSpaceScene.x < -bg.scale.x / 2.) {
                posInbeliefSpaceScene.x = -bg.scale.x / 2.
                //maybe infinity?
            }

            let y = posInbeliefSpaceScene.y < .03 ? 0. : posInbeliefSpaceScene.y
            ppVizes[heldFreeGaussianIndex].gaussian.setMeanSd(posInbeliefSpaceScene.x, y)
            resetRatIfExistent(ppVizes[heldFreeGaussianIndex])

            if(fromToGaussians[0] && fromToGaussians[1] && fromToGaussians[0].viz.visible && fromToGaussians[1].viz.visible) {
                if(fromToGaussians[0].viz === ppVizes[heldFreeGaussianIndex] || fromToGaussians[1].viz === ppVizes[heldFreeGaussianIndex]) 
                    resetDemoTransform()
            }
        }
        else if(holdingRotater) {
            frameOfLastRotaterMovement = frameCount
            let isDd = posInbeliefSpaceScene.y < .03
            // log(posInbeliefSpaceScene.y, isDd)
            if(!isDd) {
                rotater.setMeanSd(posInbeliefSpaceScene.x, posInbeliefSpaceScene.y)
                rotater.viz.mv.cheapNormalize(rotater.viz.mv)
            }
            else {
                // if(frameCount > 150)
                //     debugger
                rotater.setMeanSd(posInbeliefSpaceScene.x, 0.)
                rotater.viz.mv.multiplyScalar(.001, rotater.viz.mv)
            }
        }
    })
    document.addEventListener('mousedown', e => {

        if(e.button !== 0)
            return

        beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))
        let inFrame = Math.abs(posInbeliefSpaceScene.x) < bg.scale.x / 2. && Math.abs(posInbeliefSpaceScene.y) < bg.scale.y / 2.
        if (!inFrame)
            return

        if (rotatingMode) {
            holdingRotater = true
            rotater.visible = true
            rotater.viz.visible = true
            rotatees.forEach(r => {
                r.visible = true
                r.viz.visible = true
            })
        }
        else {
            
            heldFreeGaussianIndex = -1
            let lowestDist = Infinity
            let minDist = .15
            ppVizes.forEach((ppv, i) => {
                if (ppv.visible === false)
                    return
                let dist = posInbeliefSpaceScene.distanceTo(ppv.positions[0].y > 0. ? ppv.positions[0] : ppv.positions[1])
                if (dist < lowestDist && dist < minDist) {
                    lowestDist = dist
                    heldFreeGaussianIndex = i
                }
            })
    
            if (heldFreeGaussianIndex === -1) {
                col0.setHSL(Math.random(), 1., .5)
                let gaussian = new Gaussian(col0.getHex())
                heldFreeGaussianIndex = ppVizes.indexOf(gaussian.viz)
                gaussian.setMeanSd(posInbeliefSpaceScene.x, posInbeliefSpaceScene.y)
    
                gaussian.visible = true
                gaussian.viz.visible = true
    
                freeGaussians.push(gaussian)
            }
        }

    })
    document.addEventListener('mouseup', e => {

        if(heldFreeGaussianIndex !== -1) {
            let g = gaussians.find(g => g.viz === ppVizes[heldFreeGaussianIndex])
            g.buzzStart = frameCount
            makeBunchPlopOutFromGaussian(g)
    
            heldFreeGaussianIndex = -1
            holdingRotater = false
        }
    })

    let demoTransformFactor = 0.
    let demoTransformDirection = 0.
    let demoTransformCircle = new CircleViz(0x000000)
    demoTransformCircle.visible = false
    let demoTransform = new Mv31() 
    let fromToGaussians = [null,null]
    let toward = new Mv31()
    let vecs = [new THREE.Vector3(), new THREE.Vector3()]
    function resetDemoTransform() {
        if(freeGaussians.length > 1) {
            fromToGaussians[0] = freeGaussians[0]
            fromToGaussians[1] = freeGaussians[1]
            fromToGaussians[1].viz.mv.mulReverse(fromToGaussians[0].viz.mv, toward).logarithm(mv2).multiplyScalar(.005, mv2).exp(demoTransform)
            // toward.pow(.01,demoTransform)
            demoTransformFactor = 0.

            mv2.inner(_e1pm, demoTransformCircle.mv).cheapNormalize(demoTransformCircle.mv)
            // demoTransformCircle.mv.copy(_ep)

            for(let i = 0; i < 2; ++i) {
                for (let j = 0, jl = isoContours.length / 2; j < jl; ++j) {
                    let isoContour = isoContours[i * jl + j]
                    toward.pow(.5*(j+1) / (jl + 1), mv0)
                    mv0.sandwich(fromToGaussians[i].viz.mv, mv1).pointPairToVecs(vecs)
                    let v = vecs[0].y > vecs[1].y ? vecs[0] : vecs[1]
                    mv2.vecToZrc(v)
                    let pointor = mv2.mul(_e12pm, mv3)
                    pointor.inner(fromToGaussians[i].viz.mv, isoContour.mv)
                    // debugger
                }
            }
        }

        // demoTransformCircle.visible = true
    }

    

    function setIsoContour(index, center, radius) {
        let isoContour = isoContours[i * jl + j]
        toward.pow(radius, mv0)
        mv0.sandwich(fromToGaussians[i].viz.mv, mv1).pointPairToVecs(vecs)
        let v = vecs[0].y > vecs[1].y ? vecs[0] : vecs[1]
        mv2.vecToZrc(v)
        let pointor = mv2.mul(_e12pm, mv3)
        pointor.inner(fromToGaussians[i].viz.mv, isoContour.mv)
    }

    {
        let grabbed = false
        let grabStart = new Mv31()
        let rotationAngle = 0.
        let initialGaussianMvs = []
        document.addEventListener('mousedown', e => {
            if (e.button === 1 && mousePos.y < -.3) {
                grabbed = true
                beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))
                let y = posInbeliefSpaceScene.y < .03 ? 0. : posInbeliefSpaceScene.y
                meanSdToPosPp(posInbeliefSpaceScene.x, y, grabStart)

                while (initialGaussianMvs.length < freeGaussians.length)
                    initialGaussianMvs.push(new Mv31())

                freeGaussians.forEach((fg, i) => {
                    initialGaussianMvs[i].copy(fg.viz.mv)
                })
            }
        })
        document.addEventListener('mouseup', e => {
            if (e.button === 1) {
                grabbed = false
                rotationAngle = 0.
            }
        })
        document.addEventListener('mousewheel', e => {
            if (grabbed) {
                rotationAngle += e.deltaY * .0003
                updateGrab()
                e.stopImmediatePropagation()
            }
        })
        document.addEventListener('mousemove', e => {
            if (grabbed)
                updateGrab()
        })

        function updateGrab() {
            mv3.copy(grabStart).cheapNormalize(mv3).multiplyScalar(rotationAngle, mv3).exp(mv3)

            beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))
            let y = posInbeliefSpaceScene.y < .03 ? 0. : posInbeliefSpaceScene.y
            let grabCurrent = meanSdToPosPp(posInbeliefSpaceScene.x, y, mv0)

            grabCurrent.mulReverse(grabStart, mv1).cheapSqrt(mv2).mul(mv3, mv4)
            _one.mul(mv3, mv4)

            freeGaussians.forEach((fg, i) => {
                mv4.sandwich(initialGaussianMvs[i], fg.viz.mv)
                fg.updateFromMv()
            })
        }
    }
}