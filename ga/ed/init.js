/*
TODO
    For next presentation
        Labels for e012 etc on the iDw
        Uniforms
            Mouse ray in final dw!
            Shadertoy-inspired
            Textures dw
                May want to draw or copypaste
                Considered as Initial state of a simulation
                    "step" "play/pause" buttons. Can draw when paused
                2D texture
        Attributes
            Any variable that is different across manifold can be seen in thingy window
            Mesh window
                Has an indicator on it: "where attributes are currently coming from". Can move indicator with mouse
        Can you show dual quaternion skinning with it?
        User-created functions and for loops
            when you're looking at a function, it could have been called from multiple places!
                it gets inlined, so one run of it is qualitatively different from another
            There's a finite number of places it'll get called
                Can scroll, discretely, through those: build the possible values up into a selection, eg a point cloud
                debugger only lets you look at one point in time - want a fast way to look through ALL the state from a run!
                And yes if the input and outputs have less than 3 dimensions total, can visualize with some thing nice-looking
            for loops: 
                "for(let i = 0; ...) {stuff}" = "function stuff(i){} stuff(0); stuff(1);..."
                for loops are this under the hood but handled differently:
                    outputter assignment is conditionalized on the index (es!) being a specific thing
                    the index could have crazy shit going on, it must be said. 
                        Just ignore that. Note loops get unrolled so don't feel bad
                    Whenever you highlight a mention in the loop, you also highlight the loop variable somehow, wherever it may be
    Bugs
        Mobiuses are wrong way around, translations probably aren't working
        When you change rotation, idealLine2 flicks around
        minus sign with sandwich
        Tab and enter make it so you can't ctrl+z
        Declarations should be visualized too, eg return vec4(0.,0.,0.,1); is still a point
        Dragging the lines at infinity
    Workshop for kids at makespace
        Everyone's stuff goes into a VR sim, saved on a webpage forever
        Export(/import?):
            Ordinary shader
            threejs
            unity
            html page - EE
            export threejs function creating the thing it is with the appropriate uniforms
    GDC
        "Teardrops" visualization. Once you've sorted out the meaning of that shit!
            Can turn off and on
        Connect up mentions that are "copies"
            Makes it nicer when eg you're editing control1 and it has no effect on the below because it's redefined after you edit it!
        Practical
            Make the dome
            3D print the shapes
        Struct and function definitions
            Maybe even visualized functions as curves for R^n -> R^m for (m+n) < 4
            Same with I^2 -> I^3 or less. Need windows for these
            This is fun but not necessarily useful for PGA
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
            They appear in a  if my carat is on that line
            I can click or drag or whatever, and find the number I know I want
            Maybe move my carat through the line (4*8+5*2)/2 and see it animate
        Have a test framework. Just a series of shaders. Load them in, a few frames, move onto the next one
            move the mouse around
            make some mentions then delete them
        Documented API for making your own window visualizations
    Long term
        Conveniences
            A better solution than tubegeometrys is a vertex shader
            Could make it so that when a new line is added, the whole thing scrolls so that that line is in place
            Or perhaps check whether the current line is just a straight redefinition like a = 5 - REPLACE lines like that
            Got many dws? they auto-rearrange
            Hovering "return" could be a good for the situation of return vec3(0.,0.,0.)
            dragging a literal just edits that line instead of making a new one
        Rawshadermaterial
        Generate javascript game. Or maybe your own windows
        Grab and drag could be implemented by creating a motor and then applying it
            For this, should think of a manipulation method that works for point, line and plane
            Rotations is done by grabbing the infinity window
        When hovering something in dw, its name in text window inflates
        Other events
            Live coding
            Festival of the spoken nerd
            Green man
        ctrl+z gets rid of stuff stuck in there
        Hsv window
        Double click causes camera to whirl around so clicked variable is centered, whatever it is
        Compiling from latex
            Someone else's thing to draw and display it. Maybe desmos
        Demonstration videos
            Volumetric rendering, can march through texture
        When things appear and reappear in dws, have a nice transition
            Eg they're of to the side and they come in
        Maybe you have some point that goes weird places in 3D when you change some 1d or 2d variable
            Hold a button to make it so that the thing gets a trail
        If the variable hasn't changed value, would be nice if the versions of it that are the same as it are all highlighted
        Optimization:
            threejs shaders have uv and normal built in. Irrelevant, use RawShader
        Webworkers?

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
    await initVectorSpaceDw()
    new Dw("euclidean", true)
    initInfinityDw()
    initComplexDw()
    new Dw("scalar", false, false, camera2d)
    // dws.mobius.elem.style.display = 'none'
    // dws.scalar.elem.style.display = 'none'

    initVec3s()
    initFloats()
    initComplexNumbers()
    initPoints()
    initPlanes()
    initDqs()

    initMouseInteractions()

    window.addEventListener('resize', renderAll)

    await initCompilation() //after creation of mention classes

    initCaretInteractions()
    
    compile()
    updateMentionVisibilitiesAndIndication()
    setCaretPosition(246)
    await meshloadPromise
    renderAll()

    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true) {
            compile()
            updateMentionVisibilitiesAndIndication()
            renderAll()
        }
    })
}