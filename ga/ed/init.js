/*
TODO
    For next presentation
        Dual quaternion skinning
            Bones as an In, in the mesh window
        Better error reporting
            Highlight where it was but just put the words at the bottom
        Adding Dqs
        Uniforms
            Mouse vec2 in final dw
            Time, Frame count, Frame duration (will be fun to see on scalarDw!)
            Textures dw
                uv map?
                May want to draw or copypaste
                Considered as Initial state of a simulation
                    "step" "play/pause" buttons. Can draw when paused
                2D texture
        User-created functions and for loops
            when you're looking at a function, it could have been called from various places!
                it gets inlined, so one run of it is qualitatively different from another
            There's a finite number of places it'll get called
                Can scroll, discretely, through those: build the possible values up into a selection, eg a point cloud
                debugger only lets you look at one point in time - want a fast way to look through ALL the state from a run!
                And yes if the input and outputs have less than 3 dimensions total, can visualize with some thing nice-looking
            for loops: 
                "for(let i = 0; ...) {stuff}" becomes:
                "function stuff(i){} stuff(0); stuff(1);..."
                for loops are this under the hood but handled differently:
                    outputter assignment is conditionalized on the index (es!) being a specific thing
                    the index could have crazy shit going on, it must be said. 
                        Just ignore that. Note loops get unrolled so don't feel bad
                    Whenever you highlight a mention in the loop, you also highlight the loop variable somehow, wherever it may be
    Bugs
        Possibly saw a bug with lines at infinity which was visible when just putting 1s and 0s in everything
        minus sign with sandwich
        Mobiuses are wrong way around, translations probably aren't working
        When you change rotation, idealLine2 flicks around
        Tab and enter make it so you can't ctrl+z
        Dragging the lines at infinity
        the dual quaternion dragging takes account of duplicates. Point mention scalar should too, as should others
    Workshop for kids at makespace
        Need EXCELLENT error reporting. This shit is all in YOUR head!!!
        Everyone's stuff goes into a VR sim, saved on a webpage forever
        Export(/import?):
            Game
            Ordinary shader
            threejs
            unity
            html page - EE
            export threejs function creating the thing it is with the appropriate uniforms
    GDC
        Arrange properly into vertex and fragment shader
        Windows appear when it's detected that a user has made a variable like that
            Then, they stay
        Label on blades saying their norm?
        "Teardrops" visualization. Once you've sorted out the meaning of that shit!
            Can turn off and on
        Connect up mentions that are "copies"
            Makes it nicer when eg you're editing control1 and it has no effect on the below because it's redefined after you edit it!
        Practical
            Make the transparent spotted dome
            3D print the shapes
        Ins work with function definitions that aren't main
        "Small domain and range function" dw
            This is fun but not necessarily useful for PGA
            Bezier curves have control points. Could they be in the same window?
            Maybe even visualized functions as curves for R^n -> R^m for (m+n) < 4
            Same with I^2 -> I^3 or less. Need windows for these
            implicit surfaces etc
            Want to detect eg vec3 f(in vec3)
        Dome window for 2D PGA. Overlay for vectorspace Dw?
        VR
            Single button to cycle through mentions
            Hand as a uniform
            Gestures: 
                Pointing motion for an ideal point, pinch for a euclidean point
                grip for a line, 
                flat palm for plane
        Suggestions
            You have a single shader calculate the whole lot of them
            Player is dragging eg a point around
            If a suggestion is close enough to snap, then you do that to the point
                (which results in the downstream things changing!)
            When player lets go, we do a special render, where we do not render the point
                instead we render, to a target, some pixels that can be read as "here's the line of code you want"
            When you snap it into place, what it's based on is highlighted (using the diagram things)
            They should take into account downstream stuff, if it's in the window
                eg:
                    I am editing p. p affects q but p does not affect b
                    p can take value p' is such that q == b. 
                This is tricky though
            When you click window, if not close to anything, perhaps point should be created?
        A puzzle game that is a series of "code this shader" challenges
        (2,1) halfplane window - v. important, lets you program with mouse
            This is the eventual destiny of the "float" window
            lerp as an example of a simple function to try it out with
            write some numbers on a line
            I can click or drag or whatever, and find the number I know I want
            Maybe move my carat through the line (4*8+5*2)/2 and see it animate
        Have a test framework. Just a series of shaders. Load them in, a few frames, move onto the next one
            move the mouse around
            make some mentions then delete them
        Documented API for making your own window visualizations
    Long term
        To make stateful games like pong:
            user creates updateState
            It gets all the previous values and modifies them to make all the new values
            the current values are accessible as uniforms
        Latex
            the "set inclusion" symbol means "has this type"
            Someone else's thing to draw and display it. Maybe desmos
        Conveniences
            Declarations should be visualized too, eg return vec4(0.,0.,0.,1); is still a point
            line connecting getVertex's return value to the output
            When hovering something in dw, its name in text window inflates
            Could make it so that when a new line is added, the whole thing scrolls so that that line is in place
            Or perhaps check whether the current line is just a straight redefinition like a = 5 - REPLACE lines like that
            Got many dws? they auto-rearrange
            Hovering "return" could be a good for the situation of return vec3(0.,0.,0.)
            Double click causes camera to whirl around so clicked variable is centered, whatever it is
            dragging a literal just edits that line instead of making a new one
            ctrl+z works. And maybe interacts with other things
            When things appear and reappear in dws, have a nice transition
                Eg they're of to the side and they come in
            If the variable hasn't changed value, would be nice if the versions of it that are the same as it are all highlighted
        Optimization
            Webworkers?
            See if it slows down after 100 compiles
            Rawshadermaterial
            A better solution than tubegeometrys is a vertex shader
        Grab and drag could be implemented by creating a motor and then applying it
            For this, should think of a manipulation method that works for point, line and plane
            Rotations is done by grabbing the infinity window
        Other events
            Live coding
            Festival of the spoken nerd
            Green man
        Hsv window
        Demonstration videos
            Volumetric rendering, can march through texture
        Maybe you have some point that goes weird places in 3D when you change some 1d or 2d variable
            Hold a button to make it so that the thing gets a trail
        

As a tablet notes-in-the-margin app... and if you were going to buy a tablet... want to:
    Say things into a mic
    Equation handwriting recognition
    Some way to hover?
    9.7 inch is pocketable. 10.3 is a stretch
    Searchability is nice
    Paste in images
        Edit
        Recognize their separate R G B channels as fields
            Edge detection

0D CGA = boolean logic? Possibly interesting for quantum shiz
    There's origin and infinity
    Origin is true, infinity false?
        Or maybe identity operation is true, 0 is false. Eg true is the operation that changes nothing, false changes to crap
            p AND q = p*q
            p OR q = 
    p = your value
    NOT p = inversion

Vague/philosophical
    Fuck labelling things in the window. You want lables? Hover
    If you have a matrix that is tagged as "known to have det=0"
        That's different from usual. That's 3 points at infinity maybe, instead of
    Projective geometry lets you give points in space as rationals easily
    throwing away the magnitudes might be bad because it's not reversible. Nature seems to want reversibility
    The right rep for colors is probably the RGB cube with three cutting planes
    What do people use desmos for? Can do better
    "Numbers are divided into adders and multipliers" thing:
        sometimes you take geometric mean, sometimes arithmetic
        you can visualize a point on the line. You can also picture a movement along that line. Two different things
        One's a blade and one's a versor

*/

async function init() {

    let timeBefore = -Infinity
    startBench = () =>{
        timeBefore = performance.now()
    }
    endBench = () => {
        const timeAfter = performance.now()
        console.log(`Took ${timeAfter - timeBefore} milliseconds.`)
    }

    let defaultTextFull = await getTextFile('shaders/default.glsl')
    let defaultText = defaultTextFull.slice(0, defaultTextFull.indexOf(`//END//`))    
    textarea.value = defaultText
    updateSyntaxHighlighting()

    // init41()
    await init301()

    // generateOptimizedSandwiches()
    // return

    initCamera()

    // while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //     indices.push(index);
    //     startIndex = index + searchStrLen;
    // }    

    // initSound()

    initMention()
    await initDws()

    await initShaderOutputAndFinalDw()

    let meshloadPromise = initMeshDw()
    initGltf()

    await initVectorSpaceDw()
    initEuclideanDw()
    // addPedestal(this)
    updateVertexMode = (vertexMode) => {
    }
    
    initInfinityDw()
    initComplexDw()
    new Dw(`scalar`, false, camera2d)
    // dws.mobius.elem.style.display = 'none'
    // dws.scalar.elem.style.display = 'none'

    initVec3s()
    initFloats()
    initComplexNumbers()
    initPoints()
    initPlanes()
    initDqs()

    initMouseInteractions()

    await initCompilation() //after creation of mention classes

    initCaretInteractions()
    
    await meshloadPromise
    compile()
    updateMentionVisibilitiesAndIndication()
    setCaretPosition(103)

    // new GLTFLoader().load('data/CesiumMan.gltf', (gltf) => {
    //     log(gltf.scene.children[0].children[0].children[0])
    //     log(gltf.scene.children[0].children[0].children[1])
    //     dws.mesh.addNonMentionChild(gltf.scene)
    // })

    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true) {
            compile()
            updateMentionVisibilitiesAndIndication()
        }
    })

    function render() {

        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount
        forEachAppearance((a)=>{
            if(a.variable.isUniform) {
                let update = true
                if(a.variable.name === `time`)
                    a.state[0] = clock.getElapsedTime()
                else if(a.variable.name === `frameDelta`)
                    a.state[0] = frameDelta
                else if(a.variable.name === `mouse`) {
                    let [xProportion, yProportion] = oldClientToDwNdc(dws.final)
                    a.state.x = xProportion
                    a.state.y = -yProportion
                }
                else
                    update = false

                if(update) {
                    a.updateAppearanceFromState()
                    a.updateUniformFromState()
                }
            }
        })

        updateMentionStatesFromRun()

        updateHighlight()

        const width = canvas3d.clientWidth
        const height = canvas3d.clientHeight
        if (canvas3d.width !== width || canvas3d.height !== height)
            renderer.setSize(width, height, false)
        renderer.setScissorTest(false)
        renderer.setClearColor(0xFFFFFF, 0)
        renderer.clear(true, true)
        renderer.setScissorTest(true)
        renderer.setClearColor(0x272822, 1)

        // updateFinals()

        for (dwName in dws)
            dws[dwName].render()

        requestAnimationFrame(render)
    }
    render()
}