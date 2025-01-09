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

    let posInbeliefSpaceScene = new THREE.Vector3()

    let heldFreeGaussianIndex = -1
    let freeGaussians = []
    let connectingArcs = []
    for (let i = 0; i < 6; ++i)
        connectingArcs.push(new CircleViz(0x000000))

    let rotatingMode = true
    document.addEventListener(`keydown`, e => { 
        if(e.key === ` `) 
            rotatingMode = !rotatingMode
    })

    updateRotations = () => {
        
        if(!rotater.visible)
            return
        
        let isDd = Math.abs(rotater.viz.mv.sqScalar()) < .01
        // log(isDd)
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

    document.addEventListener('mousemove', e => {

        beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))
        
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

            ppVizes[heldFreeGaussianIndex].gaussian.setMeanSd(posInbeliefSpaceScene.x, posInbeliefSpaceScene.y)
            resetRatIfExistent(ppVizes[heldFreeGaussianIndex])

            if (freeGaussians.length > 1) {

                let index = 0 
                let len = Math.min(4, freeGaussians.length)
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
        heldFreeGaussianIndex = -1
        holdingRotater = false
    })
}