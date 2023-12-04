/*
    TODO
        Hovering a thing shows its affecters
        Sculpting can create new things or add to what's already there, depending on whether your paint is touching it
        You can hold two and it shows you different ones you could create from them
        Change the way your hand movement changes heldTranslator
            You grab the thing, and its arrow moves such that its tip is where you just grabbed. It is frozen
            You move your hand, and that creates a further, separate arrow
            AND another arrow which is your current motion composed
            This is a good idea because it emphasizes to the user how they should think about things:
                movements create arrows, composing arrows is how you control things generally

    If you're     holding a  thing in your other hand and you hold the paint button
        it adds to that object
    If you're NOT holding anything in your other hand and you hold the paint button,
        it makes a new object 
        Probably if you press the grab button while holding the paint button, you're now holding the new object
    If you were holding a transform, great, we're adding it to that transform
    If you were holding a point/line/plane, erm, maybe not

    Probably want a delete action

    Other hand:
        Top finger: create point, line, plane, transform... scalar (appears on a double cover plot). First three act as a rigid bodies
        Transformation: Grab in one place, move hand. Most important, do first! This is animation!
        They snap. Use analogue stick to flick to different ones to snap to. Push in to turn off snapping
        Translations are arrows
            But there's the line at infinity to help stabilize thm ofc
            Possibly the start and end of them should be connected to that line

    Mouse:
        Mouse wheel press is for rotating the camera
        Joystick is joystick
        Click is index finger button
        Right click is side button (probably "hold"/grab)
        "Rewind" is A
        "Forward" is B
        Pushing in joystick is pushing in joystick 
        Wheel is rotating
        You do have that one other button just behind the mouswheel

    You probably want a laser, but not sure yet, and it raises many questions

    Your "go to next snap" button, if there IS no snap, could just try to do shit with whatever's visible
 */

function initControl() {

    //debug examples
    {
        // let verySimple = new DqViz()
        // verySimple.dq.copy(Translator(0., 1., 0.))
        // verySimple.markupPos.point(0., 0., 0.)

        let viz1 = new DqViz()
        snappables.push(viz1)
        viz1.dq.copy(Translator(.8, 0., 0.))
        viz1.markupPos.point(-.4, .9, 0.)

        var sclptable = new Sclptable()
        sclptable.brushStroke(fl0.point(0., 1.6, 0., 1.))

        let viz2 = new DqViz()
        snappables.push(viz2)
        viz2.dq.copy(Translator(0., .6, 0.))
        viz2.markupPos.point(-.4, 1.3, 0.)

        let viz3 = new DqViz()
        snappables.push(viz3)
        viz3.markupPos.point(-.8, 1., 0.)
        viz3.affecters[0] = viz2
        viz3.affecters[1] = viz1
        viz3.affecters[2] = 1
    }

    let heldTranslator = null
    let sclptableBeingSculpted = null
    let highlightedTranslator = null
    let highlightedSclptable = null

    function interdependencyExists(a, b) {
        return a.dependsOn(b) || b.dependsOn(a)
    }

    updateHighlighting = () => {
        
        // let dqVizWithCircuitShowing = highlightedTranslator || heldTranslator
        // if (dqVizWithCircuitShowing === null)
        //     hideCircuit()
        // else
        //     showCircuit(dqVizWithCircuitShowing)

        sclptables.forEach(sclptable => {
            sclptable.boxHelper.visible = sclptable === highlightedSclptable
            sclptable.dqViz.visible = 
                sclptable.boxHelper.visible ? true :
                highlightedTranslator === null ? false :
                interdependencyExists(sclptable.dqViz, highlightedTranslator)
            sclptable.dqViz.boxHelper.visible = sclptable.dqViz === highlightedTranslator  
        })

        snappables.forEach(snappable => {

            if(snappable.sclptable)
                return

            snappable.boxHelper.visible = snappable === highlightedTranslator
        })

        snappables.forEach(snappable => {
            snappable.circuitVisible = 
                highlightedTranslator === null ? 
                    false : 
                    snappable === highlightedTranslator ||
                    interdependencyExists(snappable, highlightedTranslator)
        })
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
                heldTranslator.markupPos.copy(handPosition)
        }
        else if(isLeftButton) {
            //this is about creation, depends on hand
            if (simulatingPaintingHand) {
                
                if (highlightedSclptable!==null)
                    sclptableBeingSculpted = highlightedSclptable
                else
                    sclptableBeingSculpted = new Sclptable()
            }
            else {
                heldTranslator = new DqViz()
                snappables.push(heldTranslator)
                heldTranslator.markupPos.copy(handPosition)
            }
        }
    })

    document.addEventListener("pointermove", event => {

        if (heldTranslator !== null) {
            highlightedTranslator = heldTranslator
            
            heldTranslator.dq.ptToPt(heldTranslator.markupPos, handPosition)
            snap(heldTranslator)
        }
        else {
            
            if (sclptableBeingSculpted !== null)
                highlightedTranslator = null
            else {
                let [nearestSnappable, nearestSnappableDist] = getNearestSnappableToPt(handPosition, false)
                let [nearestSclptable, nearestSclptableDist] = getNearestSclptableToPt(handPosition)

                if(nearestSnappableDist < nearestSclptableDist) {
                    highlightedTranslator = nearestSnappable
                    highlightedSclptable = null
                }
                else {
                    highlightedSclptable = nearestSclptable
                    highlightedTranslator = null
                }
            }
        }
    })

    document.addEventListener("pointerup", event => {

        let isLeftButton = event.button === 0
        let isRightButton = event.button === 2

        if (simulatingPaintingHand && isLeftButton)
            sclptableBeingSculpted = null
        else if ( heldTranslator !== null && (isRightButton||isLeftButton)) { //remember middle button exists

            if (heldTranslator.sclptable) {
                heldTranslator.dq
                    .getReverse(dq0)
                    .sandwich(
                        heldTranslator.dq.sandwich(heldTranslator.sclptable.com,fl0),
                        heldTranslator.markupPos)
            }

            heldTranslator = null
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

    function getNearestSnappableToPt(pt, includeSculptables) {

        let nearest = null
        let nearestDist = Infinity
        snappables.forEach(snappable => {

            if (!includeSculptables) {
                let isAttachedToSclptable = sclptables.find(sc=>sc.dqViz === snappable)
                if (isAttachedToSclptable)
                    return
            }

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
        let [nearestSnappable, nearestSnappableDist] = getNearestSnappableToPt(handPosition, true)
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