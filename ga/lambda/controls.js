/* 
    On touchscreen...
        Four arrows go a long way
        Ultimately it's perhaps more intuitive for down and up to go around the circle
        How many global variables and functions you gonna have? If a small amount, maybe drag and drop
        Except ugh so many buttons. Sounds like you need a keyboard!

    Tap a key twice and it skips the animation
    "shift+left/right arrows": highlight, copy, paste!
    "Enter": make a new variable (`\nlet `)?
    "delete"/"backspace": remove character
    "Scrollbar": go somewhere else, leaving caret in place
    "(" / ")" will open up another little circle?
    "pageup"/"pagedn" to do some kind of navigation of things at the same level in the stack
        OR, to leave the cursor where it is but to zoom out
        Maybe go out to the furthest-out visible ring
 */

function initControls() {
    
    function getSiblingRing(ring, amtDifferedBy) {
        let siblings = ring.superRing.subRings
        let siblingIndex = siblings.indexOf(ring) + amtDifferedBy
        return siblings[siblingIndex]
    }

    bindButton(`ArrowRight`, () => {
        //"step into"
        cursor.blinkStart = frameCount
        if (cursorRing.subRings.length > 0)
            updateCursorRing(cursorRing.subRings[0])
        else {
            addRingToRing(new Ring(), cursorRing)
            updateCursorRing(cursorRing.subRings[0])
        }
    }, ``, () => { }, true)
    bindButton(`ArrowLeft`, () => {
        cursor.blinkStart = frameCount
        if (cursorRing.superRing !== null) {
            updateCursorRing(cursorRing.superRing)
        }
        else {
            let newStartingRing = new Ring()
            newStartingRing.scale.setScalar(2.)
            addRingToRing(cursorRing, newStartingRing)
            updateCursorRing(newStartingRing)
        }
    }, ``, () => { }, true)
    bindButton(`ArrowRight`, () => {
        //this is like "step over"
        cursor.blinkStart = frameCount
        if (cursorRing.superRing === null) {
            if (cursorRing.subRings.length !== 0)
                updateCursorRing(cursorRing.subRings[0]) //or hey, maybe you wanted to step over the whole thing
        }
        else {
            let ringPoppedTo = cursorRing
            while (ringPoppedTo.superRing !== null) {
                let sibling = getSiblingRing(ringPoppedTo, 1)
                let isLastInSuperRing = sibling === undefined
                if(isLastInSuperRing)
                    ringPoppedTo = ringPoppedTo.superRing
                else {
                    updateCursorRing(sibling)
                    break
                }
            }

            let gotToSomething = ringPoppedTo.superRing !== null
            if (!gotToSomething && cursorRing.subRings.length !== 0)
                updateCursorRing(cursorRing.subRings[0])
        }
    }, ``, () => { }, false)
    bindButton(`ArrowLeft`, () => {
        //"step out of"
        cursor.blinkStart = frameCount
        if (cursorRing.superRing === null) {
            if (cursorRing.superRing !== null)
                updateCursorRing(cursorRing.superRing)
        }
        else {
            let sibling = getSiblingRing(cursorRing, -1)
            let isFirstInSuperRing = sibling === undefined
            if (!isFirstInSuperRing)
                updateCursorRing(sibling)
            else if (cursorRing.superRing !== null)
                updateCursorRing(cursorRing.superRing)
        }
    }, ``, () => { }, false)

    bindButton(`PageUp`, () => {
        if(focussedRing.superRing !== null)
            focussedRing = focussedRing.superRing
    }, ``, () => { }, false)

    bindButton(`PageDown`, () => {
        if (focussedRing.subRings.length > 0)
            focussedRing = cursorRing.subRings[0]
        // let currentRing = focussedRing
        // traverseChildren(focussedRing,(sr)=>{
        //     if(sr === cursorRing)

        // })
        // let 
        // while (currentRing.subRings.length !== 0) {
        //     currentRing.subRings.forEach((sr)=>{
        //         if(sr === )
        //     })
        //     currentRing = currentRing.superRing
        // }

        // focussedRing

        // //wanna go towards cursorRing
        // if (focussedRing.superRing !== null)
        //     focussedRing = focussedRing.superRing
    }, ``, () => { }, false)

    bindButton(`,`, () => { //or spacebar?
        cursor.blinkStart = frameCount
        if (cursorRing.superRing === null || cursorRing.superRing.subRings.length >= 8)
            return

        let ourPosition = cursorRing.superRing.subRings.indexOf(cursorRing)
        addRingToRing(new Ring(), cursorRing.superRing, ourPosition)
        updateCursorRing(getSiblingRing(cursorRing, -1))
    })
    bindButton(`Home`, () => {
        cursor.blinkStart = frameCount
        if (cursorRing.superRing === null)
            return
        let startRing = cursorRing.superRing.subRings[0]
        updateCursorRing(startRing)
    })
    bindButton(`End`, () => {
        cursor.blinkStart = frameCount

        if (cursorRing.superRing === null)
            return

        let endRing = cursorRing.superRing.subRings[cursorRing.superRing.subRings.length - 1]
        updateCursorRing(endRing)
    })

    let alphanumerics = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`
    for (let i = 0; i < alphanumerics.length; ++i) {
        bindButton(alphanumerics[i], () => {
            if (cursorRing.subRings.length === 0)
                putLetterInRing(cursorRing,alphanumerics[i])
        })
    }
}