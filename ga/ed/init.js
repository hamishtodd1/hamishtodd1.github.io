/*

TODO
    For next presentation
        Any variable that is different across manifold can be seen in thingy window
        Vec3 gets a scalar part as well, which you can use to adjust length
            Drag it to negative and it's off in the other direction
        Planes
            it's a new struct: vec3 normal, float displacement. So not a vec4. This is ok since you rarely add them
        Double cover dw
            Instead of points, arcs from (1,0)
            It's a mobius strip
            If it's a translation, it cuts up differently?
                It'll be up and down the lines s = 1 or s = -1
        Vertex shaders
        Mesh window, containing stanford bunny
            Has an indicator on it: "where attributes are currently coming from". Can move indicator with mouse
            Has a slider on it too, for animating
        Uniforms / attributes
            Mouse ray in final dw
            Shadertoy-inspired
            Window for texture attributes
                May want to draw or copypaste
                Considered as Initial state of a simulation
                    "step" "play/pause" buttons. Can draw when paused
                2D texture
    Bugs
        dragging ideal point, it can point somewhere very weird in the eDw
        minus sign with sandwich
        Currently, if a variable is uninitialized, you still get shown a point at 0,0,0 in the window
        When you're finished changing something, caret goes on a line that allows you to see your handiwork
            Could make it so that when a new line is added, the whole thing scrolls so that that line is in place
            Or perhaps check whether the current line is just a straight redefinition like a = 5 - REPLACE lines like that
        Got many dws? they auto-rearrange
        When you grab an ideal point, should be dragged on the infinity dw
        Tab and enter make it so you can't ctrl+z
    GDC
        Definitely need it to be that if you edit the "b" in "a = b + 1", you change the a in there
        Declarations should be visualized too, eg return vec4(0.,0.,0.,1); is still a point
        Maybe: if you move mouse over a window and there's nothing on the line
        mentions are sensetive to for loops
            For loops have an early-escape integer
            For every mention in the loop body, we're cutting off the shader after that integer
        Dome window for 2D PGA. Overlay for vectorspace Dw?
        Export(/import?):
            threejs
            unity
            html page - EE
            export threejs function creating the thing it is with the appropriate uniforms
            Workshop for kids at makespace. Everyone's stuff goes into a VR sim
        Optional "teardrops" visualization. Once you've sorted out the meaning of that shit!
            3D print the shapes
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
        Struct and function definitions
            Maybe even visualized functions as curves for R^n -> R^m for (m+n) < 4
            Same with I^2 -> I^3 or less. Need windows for these
            This is fun but not necessarily useful for PGA
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

0D CGA = boolean logic?
    There's origin and infinity
    Origin is true, infinity false?
        Or maybe identity operation is true, 0 is false. Eg true is the operation that changes nothing, false changes to crap
            p AND q = p*q
            p OR q = 
    p = your value
    NOT p = inversion


Huh you are sort of making a desmos killer

Parser
    potentially take excerpts of the code and run it, eg they've written a function
        you want the output of that though, so not in a shader    

Vague/philosophical
    Fuck labelling things in the window. You want lables? Hover
    If you have a matrix that is tagged as "known to have det=0"
        That's different from usual. That's 3 points at infinity maybe, instead of
    Projective geometry lets you give points in space as rationals easily
    throwing away the magnitudes might be bad because it's not reversible. Nature seems to want reversibility
    The right rep for colors is probably the RGB cube with three cutting planes

"Numbers are divided into adders and multipliers" thing:
    sometimes you take geometric mean, sometimes arithmetic
    you can visualize a point on the line. You can also picture a movement along that line. Two different things
    One's a blade and one's a versor


Against vscode:
    they'll have their own weird internal representation of the code
    it might run slowly
    not all computer graphics people use vscode
    you want to make something like shadertoy where people can just get in and go    
    May be hard to draw windows over the code
In favor of vscode:
    built in parser
    maybe more people use it
    has the home comforts you like

the rules seem to be:
    NOT allowed to just have them be arrays, that requires [] crap
    you have to have your thing be a struct, not an array
    a vec4 we can cast to a point, fine
    vec2 is probably going to become a complex number
    float is on the 1D CGA

Because it helps portability to ordinary shaders:
    vec4 is a point
    vec3 is a vector/rgb color
    vec2 is complex number

*/

async function init() {

    let initialTextFull = await getTextFile('shaders/initialText.glsl')
    let initialText = initialTextFull.slice(0, initialTextFull.indexOf(`//END//`))    
    textarea.value = initialText
    VERTEX_MODE = initialText.indexOf("getColor") === -1
    updateSyntaxHighlighting()

    // init41()
    init301()

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
    initStudyDw()
    new Dw("scalar", false, false, camera2d)
    // dws.study.elem.style.display = 'none'
    // dws.scalar.elem.style.display = 'none'

    initVec3s()
    initFloats()
    initStudyNumbers()
    initPoints()
    initDqs()

    initMouseInteractions()

    window.addEventListener('resize', renderAll)

    await initCompilation() //after creation of mention classes

    initCaretInteractions()
    
    compile()
    updateMentionVisibilitiesAndIndication()
    setCaretPosition(198)
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