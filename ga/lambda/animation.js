function initAnimation() {

    let animationProgress = 0.
    let animationLength = 1.
    let superRing = null
    let trashPosition = new THREE.Vector3(0., 5., 0.)

    let labelCopies = []
    for (let i = 0; i < 12; ++i) {
        labelCopies[i] = new THREE.Mesh(unchangingUnitSquareGeometry)
        scene.add(labelCopies[i])
    }
    labelCopies.forEach((lc)=>lc.visible = false)
    function copyLabel(ring, lc) {
        lc.material = ring.label.material
        lc.scale.copy(ring.label.scale).multiplyScalar(ring.scale.x)
        lc.position.copy(ring.position)
        lc.position.z = .15
    }

    let cameraOffset = 0.
    function startScreenShake() {
        cameraOffset = .15
    }
    updateFunctions.push(()=>{
        cameraOffset -= frameDelta * .4
        if (cameraOffset < 0)
            cameraOffset = 0.
        camera.position.x = cameraOffset * Math.cos(frameCount * .7)
    })
    
    let nonAnimation = () => { }
    let currentAnimation = nonAnimation

    potentiallyAnimateOperation = () => {
        currentAnimation()
        if ( animationProgress >= animationLength)
            endAnimation()
    }

    endAnimation = () => {
        if (currentAnimation === nonAnimation)
            return

        while (superRing.subRings.length !== 0) {
            let sr = superRing.subRings.pop()
            sr.position.copy(trashPosition)
            sr.superRing = null
        }

        currentAnimation = nonAnimation

        superRing.label.visible = true
        labelCopies.forEach((lc) => lc.visible = false)
        arrows.forEach((arrow) => arrow.visible = false)

        rings.forEach((ring) => {
            ring.face.expression = `neutral`
        })
    }

    let arrows = [Arrow(), Arrow(), Arrow()]
    arrows.forEach((a)=>{
        a.visible = false
    })

    function windowTween(start,duration) {
        let end = start + duration
        let t = animationProgress < start ? 0. :
                animationProgress > end ? 1. :
                (animationProgress - start) / (end - start)
        return t
    }   
    function sineTween(start,duration) {
        let t2 = windowTween(start, duration) 
        return -(Math.cos(Math.PI * t2) - 1) / 2
    }
    
    let infixes = [`+`] //,`-`,`*`,`/`]

    let popsPlayed = 0
    let growPlayed = false
    function playPop() {
        playRandomPop()
        ++popsPlayed
    }

    commenceBetaReduction = (newSuperRing) => {
        let isThisAnimation = 
            newSuperRing.subRings.length === 3 &&
            getRingText(newSuperRing.subRings[0]) === "+" &&
            !isNaN(parseInt(getRingText(newSuperRing.subRings[1])) ) &&
            !isNaN(parseInt(getRingText(newSuperRing.subRings[2])))
        if(!isThisAnimation){
            return
        }

        superRing = newSuperRing

        if (currentAnimation !== nonAnimation) {
            //another animation has not finished, cut it short
            endAnimation()
        }
        animationProgress = 0.

        popsPlayed = 0
        growPlayed = false
        
        //the top ring consumes the bottom two
        //they leave the things they contain
        //copies of the numbers zoom over to be placed on the number line
        //if these were names, they'd already be marked, and the place down below would put a copy of itself on the name
        //+ considers them as translations, so you mark translations with arrows
        //+ then puts them end to end and marks the end of that
        //it's a + sign so it physically goes in the gap between them

        //then they become the result (which is a point, not a translation, this is casting)
        //and that goes back into the circle
        //probably looks like a bar chart with them all lined up

        //here is the part where you'd forEach -> commenceBetaReduction

        animationLength = 4.

        let orderedArguments = []
        {
            superRing.subRings.forEach((sr, i) => {
                //commenceBetaReduction(sr)
                orderedArguments[i] = getRingText(sr)
            })
            if ( infixes.indexOf( orderedArguments[0]) !== -1 ) {
                let temp = orderedArguments[0]
                orderedArguments[0] = orderedArguments[1]
                orderedArguments[1] = temp
            }
            let str = orderedArguments.join(``)
            setRingText(superRing, eval(str))
        }

        // ANIMATION
        superRing.subRings.forEach((sr, i) => {
            copyLabel(sr,labelCopies[i])
            
            //clearing it out
            labelCopies[i].visible = true
            sr.label.material = text(initialString, true)
            setRingText( sr, initialString)
        })

        copyLabel(superRing, labelCopies[3])
        superRing.label.visible = false

        superRing.face.expression = `surprised`
        
        //this is called last so it overrides any "defaults"
        currentAnimation = () => {

            animationProgress += frameDelta
            //update their positions, do particles and sound effects, etc
            //and when done, get rid of rings and setRingText

            let START = 0.
            superRing.subRings.forEach((sr, i) => {

                let lc = labelCopies[i]
                let asNum = parseInt(lc.material.getText())
                let isNum = !isNaN(asNum)

                //ring positions
                START = .3 + .1 * i
                let duration = .6
                getPositionInRing(superRing, i, sr.position)
                let t = windowTween(START, duration)
                sr.position.lerp(trashPosition, t)

                //labels
                
                let labelMvmtDur = .9
                if (isNum)
                    v1.set(asNum,0.,0.)
                else {
                    let firstArgumentAsNum = parseInt(labelCopies[1].material.getText())
                    v1.set(firstArgumentAsNum,1.,0.) //probably go somewhere between them
                }
                dwArea.localToWorld(v1)
                t = sineTween(START, labelMvmtDur)
                getPositionInRing(superRing, i, lc.position)
                lc.position.lerp(v1, t)
                lc.position.z = .15

                // argument arrows
                if(i > 0) {
                    START += .2
                    let arrowMvmtDur = .6
                    let arrow = arrows[i-1]
                    arrow.visible = animationProgress > START
                    if (arrow.visible && !growPlayed) {
                        sounds.grow.play()
                        growPlayed = true
                        superRing.face.expression = `quizzical`
                    }

                    t = sineTween(START, labelMvmtDur)
                    arrow.setLength(asNum * sineTween(START,arrowMvmtDur))

                    let currentPosition = v1.set(0., getArrowStackY(i),0.)
                    if(i === 2) {
                        START = START + arrowMvmtDur + .2
                        let endToEndDur = .4
                        t = sineTween(START, endToEndDur)

                        currentPosition.lerp(arrows[0].position,t)
                    }
                    arrow.setOrigin(currentPosition.x,currentPosition.y)
                }
            })

            {
                let result = parseInt(getRingText(superRing))

                //result arrow
                START = 2.4
                let arrow = arrows[2]
                arrow.visible = animationProgress > START
                arrow.setOrigin(0.,0.,.04)
                arrow.setLength(result)
                
                labelCopies[3].visible = animationProgress > START
                if (labelCopies[3].visible && popsPlayed < 1) {
                    playPop()
                    startScreenShake()
                    rings.forEach((ring)=>{
                        ring.face.expression = `surprised`
                    })
                }
                labelCopies[3].position.x = result
                dwArea.localToWorld(labelCopies[3].position)
                labelCopies[3].position.y = labelCopies[1].position.y

                v1.copy(superRing.label.position)
                superRing.localToWorld(v1)

                START += .4
                let t = sineTween(START, .7)
                labelCopies[3].position.lerp(v1, t)

                if(animationProgress > START) {
                    superRing.face.expression = `happy`
                    rings.forEach((ring) => {
                        if(ring !== superRing)
                            ring.face.expression = `neutral`
                        ring.face.intendedLookDirection.copy(labelCopies[3].position)
                    })
                }
            }
        }
        //by the time this is triggered, the things needed will be out in the world
        //when carat is inside a function
    }
}