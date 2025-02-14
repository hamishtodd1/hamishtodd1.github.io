/*

*************************************************************************************
******  RIGHT BEFORE: Text and window and CURSOR size! Big as possible! Mouse size too!   ******
******  GESTURE at the windows people should look at!                          ******
*************************************************************************************

TODO
    GDC
        Have a button that looks for the next “//” and removes it
        Would be nice to have planes in iDw overlap correctly, eg small displacement
        Pointing at things in the initial window
        Euclidean dw stuff should appear in the io windows
            Axes, so that you can tell the difference between mous-rotating cow vs applying quat to her?
        Better error reporting
            Highlight where it was but just put the words at the bottom
        Pointing in the direction of the thing offscreen instead of just the frame
        Redo the handling of "visualizations from multiple places"
            One way of detecting whether a line only assigns to a variable is to see if any other variables are mentioned on it
            "const" detection
            Distracting when it injects code
            One variable = one appearance. Dqs are going silly with carat on one line and modifying it on another
            A MAYBE SIMPLE thing to do would be: IF you are mouse editing a line FAR above the caret line, the injection is just above the caret line
            Ugh that isn't simple. Maybe think of something simple.
        Flections
            Dotted line for the line part. Only in the thingy iDw
            Mobius and winding?
        While you're changing stuff, annotation lines of all shit should be visible
        Maybe import some railroad track models so you can do the thing you want to do
    "Someday" / for general release
        Better window hiding - they should grey out
            hide the output window when there's an error
        Bugs
            Vectors are just broken with the animation on
            Probably worth checking over absolutely all e31 vs 13 shit
            Sort out duplicates. At least in the senses that you need the damn things
            Enter makes it so you can't ctrl+z
            the dual quaternion dragging takes account of duplicates. Point mention scalar should too, as should others
        minus sign with sandwich
        Only one appearance for each variable. Ok MAYBE 2
            And injections go just before the line the caret is on
        could try to be a bit more sophisticated with isGrabbedAndWoundBackward
            When you grab identity and make it negative, it bounces
        Attempt -briefly- to compile every second or so, send straight to output window?
            but flash up an error which fades out when (99% of the time) it's wrong
            Eh, this is for graphics programmers
        The overrides should not be for "after this line that you can edit"
            They should be "before this line that your caret could be on"
            Maps better onto people's idea of a "current value"
            Allow shit to be on multiple lines
        Need EXCELLENT error reporting. This shit is all in YOUR head!!!
            Have a test framework
                A few examples. Load them in, a few frames, move onto the next one
                move the mouse around
                make some mentions then delete them
        Optimize axis markings
        Optimized sandwiches
        A series of "code this shader" challenges
        User-created functions
            Yes, can have some nice viz if the input and outputs have less than 3 dimensions total (or whatever)
                This is fun but not necessarily useful for PGA
                Bezier curves have control points. Could they be in the same window?
                Maybe even visualized functions as curves for R^n -> R^m for (m+n) < 4
                Same with I^2 -> I^3 or less. Need windows for these
                implicit surfaces etc
                Want to detect eg vec3 f(in vec3)
            when you're looking at a function, it could have been called from various places
                So, gotta assume the input could be anything
                So, what's the "in" that it gets?
                Presumably, it's related to the ins in other places, eg "where the debugger is"
                it gets inlined, so one run of it is qualitatively different from another
                There's a finite number of places it'll get called
                    Can scroll, discretely, through those: build the possible values up into a selection, eg a point cloud
                    debugger only lets you look at one point in time - want a fast way to look through ALL the state from a run!
    Live coding (festival of the spoken nerd, green man)
        https://twitter.com/joyoflivecoding
        for loops:
            "for(let i = 0; ...) {stuff}" becomes:
            "function stuff(i){} stuff(0); stuff(1);..."
            for loops are this under the hood but handled differently:
                outputter assignment is conditionalized on the index (es!) being a specific thing
                the index could have crazy shit going on, it must be said. 
                    Just ignore that. Note loops get unrolled so don't feel bad
                Whenever you highlight a mention in the loop, you also highlight the loop variable somehow, wherever it may be
        Structs:
            Are how you make your puppets, of course
        2D PGA. Overlay for vectorspace Dw?
            A new window. Nice to go between dome and
        Documented API for making your own window visualizations
        Export:
            Game
            Ordinary shader
            threejs
            unity
            html page (for EEs/blog posts)
            export threejs function creating the thing it is with the appropriate uniforms
        "Teardrops" visualization. Once you've sorted out the meaning of that shit!
            Can turn off and on
        Practiiiiiiiice! Make a date! And thereby find out which of these are good ideas
        Would be nice to hover the output window, have it reverse back to the initialVertex you're hovering
        (2,1) halfplane window - v. important, lets you program with mouse
            This is the eventual destiny of the "float" window
            lerp as an example of a simple function to try it out with
            write some numbers on a line
            I can click or drag or whatever, and find the number I know I want
            Maybe move my carat through the line (4*8+5*2)/2 and see it animate
        Color windows
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
        To make stateful games like pong:
            user creates updateState
            It gets all the previous values and modifies them to make all the new values
            the current values are accessible as uniforms
            Remember you want to have an entire texture as state sometimes
                Can draw on texture when paused
            "step" "play/pause" buttons
        Latex
            So, you are going to do this by HAND
                Take a load of equations from a book, 
                Code it up
                Manually draw rectangles over the box
                Put on a webpage
            the "set inclusion" symbol means "has this type"
            Could talk to people at mathpix?
        Conveniences
            Connect up mentions that are "copies"
                Makes it nicer when eg you're editing control1 and it has no effect on the below because it's redefined after you edit it!
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
    Long term
        General arrays?
        Optimization
            Webworkers?
            See if it slows down after 100 compiles
            Rawshadermaterial
            A better solution than tubegeometrys is a vertex shader
        Grab and drag could be implemented by creating a motor and then applying it
            For this, should think of a manipulation method that works for point, line and plane
            Rotations is done by grabbing the infinity window
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
    Projective plane. Things multiplied by -1 Is it a mobius strip and these objects are weirdly different?
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

If you were to make a GA-products fighting game, what would it be like?
    Your avatars are flailing tentacle/cloud things, but there are bits you can lock onto

In the puppet thing: you have a dome, and a plane on top
    It can do conformal stuff; centrally projected stuff; scalars; complex numbers

Possibly dqAppearances should get ANOTHER point in the 2D dw
    For (e12+e03), the point would be at (1,1), because (e12+e03) = e12(1+I)
    For e12 and (.28+.96e12), it'd be at (1,0), because e12 = (1+0I)
    For e03, hmm. = e12(0+I)

    Possibly need to take the log, that gets a bivector which may be a screw axis.
*/

// class sizeMinimizingArray() {
//     #arr = []
//     lowestUnused = 0

//     getLowestUnusedElement() {
//         return this.#arr[this.lowestUnused]
//     }
// }

async function init( textareaValueDefault, hideInputAndOutputWindows = false) {

    let timeBefore = -Infinity
    startBench = () =>{
        timeBefore = performance.now()
    }
    endBench = () => {
        const timeAfter = performance.now()
        console.log(`Took ${timeAfter - timeBefore} milliseconds.`)
    }

    let style = window.getComputedStyle(textarea)
    const lineHeight = parseInt(style.lineHeight)
    log(lineHeight)
    window.lineHeight = lineHeight
    initSvgLines()

    textarea.value = textareaValueDefault
    updateSyntaxHighlighting()

    await init301()

    // generateOptimizedSandwiches()
    // return

    initCamera()

    // while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //     indices.push(index);
    //     startIndex = index + searchStrLen;
    // }

    // initSound()

    initMentions()
    initAppearances()
    await initDws()

    if (!hideInputAndOutputWindows)
        new Dw(`untransformed`, true, camera, false)
        
    await initShaderOutput()

    if (!hideInputAndOutputWindows)
        initInitialAndFinalDws()

    let importedModel = {
        promise: new Promise(resolve=>resolve()),
        updateAnimation:()=>{}
    }
    if(!hideInputAndOutputWindows)
        importedModel = initMeshDw(false)

    // await initHalfplane()

    initEuclideanDw()
    
    // initWeightsWindow()
    initInfinityDw()
    initComplexDw()
    new Dw(`scalar`, false, camera2d)
    // dws.complex.elem.style.display = 'none'
    // dws.scalar.elem.style.display = 'none'

    initVectorSpaceDw()

    initVec3s()
    initMat4s()
    initFloats()
    initComplexNumbers()
    initPoints()
    initPlanes()
    initFlecs()
    initDqs() //could hide winding arrows
    initSkeletons()

    initMouseInteractions()

    await initCompilation() //after creation of mention classes

    initCaretInteractions()
    
    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true) {
            compile(false)
            updateAppearanceVisibilitiesAndIndication()
        }
    })

    function render() {

        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        importedModel.updateAnimation()

        variables.forEach((v)=>{
            if(v.isUniform) {
                let needsUpdate = true
                
                let a = v.mentions[0].appearance
                if(v.name === `time`)
                    a.state[0] = clock.getElapsedTime()
                else if(v.name === `frameDelta`)
                    a.state[0] = frameDelta
                else if(v.name === `mouse`) {
                    let [xProportion, yProportion] = oldClientToDwNdc(dws.final)
                    a.state.x = xProportion
                    a.state.y = -yProportion
                }
                else
                    needsUpdate = false

                if(needsUpdate)
                    a.updateUniformFromState()
            }
        })
        
        // updateHalfplane()

        updateMentionStatesFromRun()
        forEachUsedMention((m) => {
            if (m.appearance.visible && (m.variable.isUniform || m.variable.isIn))
                m.appearance.updateFromState()
        })

        updateHighlight()

        const width = canvas3d.clientWidth
        const height = canvas3d.clientHeight
        if (canvas3d.width !== width || canvas3d.height !== height)
            renderer.setSize(width, height, false)
        renderer.setScissorTest(false)
        renderer.setClearColor(0xFFFFFF, 0)
        renderer.clear(true, true)
        renderer.setScissorTest(true)
        renderer.setClearColor(0x252525, 1)

        updateFunctions.forEach((uf)=>uf())

        for (dwName in dws)
            dws[dwName].render()

        requestAnimationFrame(render)
    }

    await importedModel.promise
        
    compile(false)
    updateAppearanceVisibilitiesAndIndication()

    setCaretPosition(47)
    addToCameraLonLat(0., 0.)
    
    render()
}