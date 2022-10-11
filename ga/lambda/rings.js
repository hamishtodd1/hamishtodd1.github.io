/*
    TODO
        *def* using cartoony guys

    what's the relationship between "where execution is" and where the carat is?
        can't edit stuff before program execution
        When you highlight, your caret is always taken to be at the start

    Key questions with this version (because probably want it in rust)
        What does animated beta reduction look like?
        What about looking from the side
        Just use it on scalars, maybe the halfplane (to test adders and multipliers)

    should proooobably work on background string
        if it's gl, can iterate through that and draw, less stateful
    
    Animations
        Eg F 4 5, with f having previously been defined as f = (a,b)=>{let c=2*a; return (c+b)/c}
        F is somewhere else on the screen. A copy of it gets made, and moves over to replaces the name "F"
        The 4 and 5 move from where they are possibly being duplicated, and slot into place in F
        Simultaneously, F grows to fill up the whole circle
        When it's an animatable function like wedge, arguments flash and so on

    Variables/state
        But there is a difference between variables that go away when scope closes and globals
        WHEN do they go away? They have to have some attachment to the scope
        "def", takes a name and a value (not a function!) and puts it in your number area or func area
        When they're named in a function, they stay as names in its visualization, 
            until they're turned into the current value/visualization
        Ones in more "distant" scopes are faded out
        A variable name is connected to a value
        After the "def" happens, there's a thing out there in the world, outside the circles
            To be called upon as you please
        A named variable is still connected to a scope though, and they get destroyed eventually        

    Monsters
        The scopes
            Little coral plant things so it can be on their head
            Color changes depending what scope you're in but nothing apart from that
        The variables and functions
            Designed very distinctively
        That take your stuff when you've made
        They go off screen, along with scopes, when "done"
        They are attached to scopes, "friends" with them

    What do function definitions look like?
        global and permanent
        Whenever you write code, you are editing SOME saved, named function
        To use them: You write their names in place. It stays as a name until the time comes
        The colored line reaches out and takes a copy, and draws that in to replace the name
        No names, monster takes it

    Higher level arrangment
        Probably want two side-by-side panels
        Much of the arrangement into files will be done with the separation into meshes

    VR
        Yes pallett was elegant, no it is not scalable
        Voice control to enter names of variables and ctrl+f
        One Joystick will control carat, other will be like scrollbar
        Shift, ctrl, comma/space/enter, home, end, copy, paste, delete/backspace, ctrl+f

    The arrangement
        Circle may sound bad, but it beats a vertical line
        Circles solve the problem of infixes. plus is above A and B in a way that makes it look right
        Spiralling out of the center? Maybe getting smaller?
            whole tree could do that. Little rolled up things
        Square may be better? Draw it
        Can have a side-on view, a tree

    
        Comments go in the middle?
 */



function initRings() {

    let innerRadius = .92
    let ringGeo = new THREE.RingBufferGeometry(innerRadius,1., 64) //they are always 2 wide, radius 1
    
    class Ring extends THREE.Mesh {
        subRings = []
        superRing = null
        label = null
        face = null

        constructor() {
            let mat = new THREE.MeshBasicMaterial({color:0xFF0000})
            super(ringGeo, mat)

            let face = new Face()
            this.face = face
            this.add(face)
            face.position.y = 1.06
            face.position.z = .05
            updateFunctions.push(()=>{
                face.intendedLookDirection.copy(cursor.position)
                // let currentText = labelMaterial.getText()
                // face.visible = currentText === `` || currentText === initialString
            })

            let labelMaterial = text(initialString, true)
            this.label = new THREE.Mesh(unchangingUnitSquareGeometry,labelMaterial)
            this.add(this.label)

            scene.add(this)

            rings.push(this)
        }
    }
    window.Ring = Ring

    getRingText = (ring) => {
        return ring.label.material.getText()
    }
    setRingText = (ring, newText) =>{
        let label = ring.label
        label.material.setText(newText)
        let height = 1.
        label.scale.set(label.material.getAspect() * height, height, 1.)
    }
    putLetterInRing = (ring, letter) => {
        let label = ring.label
        let oldText = label.material.getText() === initialString ? `` : label.material.getText()
        let newText = oldText + letter
        setRingText(ring,newText)
    }

    let scaleRatios = [.36,.36,.36,.36,.36,.32,.29,.26,.24] //.6,.85,.44, .41

    getPositionInRing = (superRing,index,positionTarget) => {
        let numSubRings = superRing.subRings.length
        let scaleRatio = scaleRatios[numSubRings >= scaleRatios.length ? scaleRatios.length - 1 : numSubRings]

        let proportion = index / numSubRings
        positionTarget.set(0., superRing.scale.y * ((innerRadius - scaleRatio - .03)), 0.)
        positionTarget.applyAxisAngle(zUnit, TAU * proportion)
        positionTarget.add(superRing.position)
    }

    repositionSubRings = (superRing) => {
        let numSubRings = superRing.subRings.length
        let scaleRatio = scaleRatios[numSubRings >= scaleRatios.length ? scaleRatios.length - 1 : numSubRings]

        superRing.subRings.forEach((subRing, i) => {
            getPositionInRing(superRing,i,subRing.position)
        })
        
        superRing.subRings.forEach((subRing, i) => {
            subRing.scale.copy(superRing.scale).multiplyScalar(scaleRatio)
            repositionSubRings(subRing)
        })
    }

    traverseParents = (ring,func) => {
        let currentRing = ring
        while (currentRing.superRing !== null) {
            func(ring)
            currentRing = currentRing.superRing
        }
    }
    traverseChildren = (ring, func) => {
        ring.subRings.forEach((sr) => {
            func(sr)
            traverseChildren(sr, func)
        })
    }

    let silverRatio = 1. / ((Math.sqrt(5.) + 1.) / 2.)
    setRingColor = (ring) => {
        let levelsDeep = 0
        traverseParents(ring,()=>{++levelsDeep})

        let hue = silverRatio * levelsDeep
        hue = hue - Math.floor(hue)
        ring.material.color.setHSL(hue, 1., .5)
        ring.material.needsUpdate = true
    }
    
    addRingToRing = (subRing,superRing, position) => {
        if(position === undefined)
            position = superRing.subRings.length
        if (subRing.superRing !== null)
            subRing.superRing.subRings.splice(subRing.superRing.indexOf(subRing),1) //remove from old superRing
        subRing.superRing = superRing
        superRing.subRings.splice(position, 0, subRing)

        setRingColor(subRing)
    }

    updateCursorRing = (ring) => {
        endAnimation()
        if (ring.superRing !== null) {
            let cursorRingIndex = ring.superRing.subRings.indexOf(ring)
            ring.superRing.subRings.forEach((sr,i) => {
                if (i < cursorRingIndex && sr.subRings.length !== 0)
                    commenceBetaReduction(sr)
            })
        }

        cursorRing = ring
        focussedRing = cursorRing.superRing === null? cursorRing : cursorRing.superRing
    }

    updateCursorPosition = () => {
        cursorRing.getWorldPosition(v1)
        v1.x -= cursorRing.scale.x //* 1.05

        v1.sub(cursor.position).multiplyScalar(.5)
        cursor.position.add(v1)
    }

    cursor.blinkStart = 0
    updateFunctions.push(() => {
        cursor.visible = Math.round((frameCount - cursor.blinkStart) / 40) % 2 ? false : true
    })
}