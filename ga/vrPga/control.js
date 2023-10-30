/*
    TODO
        Hovering a thing shows its affecters
        Sculpting can create new things or add to what's already there, depending on whether your paint is touching it
        You can hold two and it shows you different ones you could create from them

    You may well want a laser, but not sure yet, and it raises many questions

    To duplicate: grab an object with two hands, pull them apart, it makes a duplicate
    And press some button to increase the number of them you have between your hands
    Want some way of making a bunch of random displacements

    We want wires, in a camera plane

    Your "go to next snap" button, if there IS no snap, could just try to do shit with whatever's visible
 */

function initControl() {

    let heldTranslator = null
    let sclptableBeingSculpted = null
    let highlightedTranslator = null

    blankFunction = () => {
        snappables.forEach(translator => {
            if (translator === highlightedTranslator)
                translator.setColor(0x00FF00)
            else
                translator.setColor()
        })

        let dqVizWithCircuitShowing = highlightedTranslator || heldTranslator
        if (dqVizWithCircuitShowing === null)
            hideCircuit()
        else
            showCircuit(dqVizWithCircuitShowing)
    }

    updatePainting = () => {
        if (sclptableBeingSculpted && simulatingPaintingHand)
            sclptableBeingSculpted.brushStroke()
    }

    document.addEventListener("pointerdown", event => {

        let isLeftButton = event.button === 0
        let isRightButton = event.button === 2

        if (isRightButton) {//Grabbing is generic across both. Also you can grab two things eventually?
            //actually this was meant to be about lasers
            //maybe in mouse mode you should keep the controller in the bottom right and just be pointing it

            let nearest = getNearestThingToHand()

            heldTranslator = nearest.constructor === DqViz ? nearest : nearest.dqViz
            if (heldTranslator.dq.isScalarMultipleOf(oneDq))
                heldTranslator.arrowStart.copy(handPosition)
        }
        else if(isLeftButton) {
            //this is about creation, depends on hand
            if (simulatingPaintingHand) {
                //or could make a new one, if there's nothing in a certain radius
                let [nearestSclptable, nearestSclptableDist] = getNearestSclptableToPt(handPosition)
                sclptableBeingSculpted = nearestSclptable
            }
            else {
                heldTranslator = new DqViz()
                snappables.push(heldTranslator)
                heldTranslator.arrowStart.copy(handPosition)
            }
        }
    })

    document.addEventListener("pointermove", event => {

        if (heldTranslator !== null) {
            highlightedTranslator = heldTranslator
            
            heldTranslator.dq.ptToPt(heldTranslator.arrowStart, handPosition)
            snap(heldTranslator)
        }
        else {
            
            if (sclptableBeingSculpted !== null)
                highlightedTranslator = null
            else {
                //this should do sculptables too
                //it should only highlight if clicking would result in you picking up that thing
                let [nearestSnappable, nearestSnappableDist] = getNearestSnappableToPt(handPosition)
                highlightedTranslator = nearestSnappable
            }
        }
    })

    document.addEventListener("pointerup", event => {

        let isLeftButton = event.button === 0
        let isRightButton = event.button === 2

        if (simulatingPaintingHand && isLeftButton)
            sclptableBeingSculpted = null
        else if ( heldTranslator !== null && (isRightButton||isLeftButton)) { //remember middle button exists
            heldTranslator = null
            resetMarkup()
        }
    })

    //////////////////////
    // Helper functions //
    //////////////////////

    function getNearestSclptableToPt(pt) {
        
        let nearest = null
        let nearestDist = Infinity

        sclptables.forEach(sclptable => {

            if (sclptable.com[7] === 0.)
                return

            let normalizedCom = sclptable.getWorldCom(fl0).multiplyScalar(1. / fl0[7], fl0)

            let dist = pt.distanceToPt(normalizedCom)
            if (dist < nearestDist) {
                nearest = sclptable
                nearestDist = dist
            }
        })

        return [nearest, nearestDist]
    }

    function getNearestSnappableToPt(pt) {

        let nearest = null
        let nearestDist = Infinity
        snappables.forEach(snappable => {

            snappable.getArrowTip(fl0)
            let dist = pt.distanceToPt(fl0)

            if (dist < nearestDist) {
                nearest = snappable
                nearestDist = dist
            }

        })

        return [nearest, nearestDist]
    }

    function getNearestThingToHand() {
        let [nearestSnappable, nearestSnappableDist] = getNearestSnappableToPt(handPosition)
        let [nearestSclptable, nearestSclptableDist] = getNearestSclptableToPt(handPosition)

        if (nearestSnappableDist === Infinity && nearestSclptableDist === Infinity)
            return null
        else
            return nearestSnappableDist < nearestSclptableDist ? nearestSnappable : nearestSclptable
    }
}

//for SSC Joel:
/*
    For every object having a "position" and a "rotation" is a bad idea
    I could justify this in terms of classical physics,
        like the fact that while "torque about your center of mass" is a useful simplification for an undergrad,
        pure torque is very rare in the real world, so most angular momentum is NOT about an axis through the center of mass
        But it's more than that, it has made people dependent on the origin
 */