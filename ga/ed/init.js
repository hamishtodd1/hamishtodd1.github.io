/*
TODO
    Short term
        Editing from the window
            Drag to a different space's window to change its type
            For points
            For colors
            When you move something, it could leave its current value behind
                And thereby have a suggestion based on that, like +=
                And maybe you're defining a transform
            When the user moves a point to an arbitrary place, you get the say in how it got there
                it's r*p*~r
                    If r*p*~r did not come from a suggestion, it probably makes r as well
        3D PGA apparatus
            Want oriented elements
                Planes that are colored on a side or not colored, comma or not comma
                Lines that have arrow along or around them
                Same with points
        Complex numbers window which allows you to see what's up with a motor
            Note that it's different from the conformal 2D euclidean space window
                because it's more about MULTIPLY by the complex number
                translations are ADDITIONS
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
        Uniforms
            Shadertoy-inspired
            Mouse ray in final dw is a variable
            VR hand
        Sphere at infinity dw
        Nicer thing might be
    Medium term
        Mobius strip dw because necessary to show double cover
            Intermediate between complex plane view of rotors
            Or maybe there's a clever strip showing whole thing
        If the variable hasn't changed value, would be nice if the versions of it that are the same as it are all highlighted
        If you have a nice pile of dws, and you go from line to line so different ones become relevant, nice transition
        (2,1) halfplane window - v. important, lets you program with mouse
            lerp as an example of a simple function to try it out with
            write some numbers on a line
            They appear in a  if my carat is on that line
            I can click or drag or whatever, and find the number I know I want
            Maybe move my carat through the line (4*8+5*2)/2 and see it animate
        Got many dws? they auto-rearrange
        Double click causes camera to whirl around so clicked variable is centered, whatever it is
        mentions are sensetive to for loops
            For loops have an early-escape integer
            For every mention in the loop body, we're cutting off the shader after that integer
        Maybe you have some point that goes weird places in 3D when you change some 1d or 2d variable
            Hold a button to make it so that the thing gets a trail
        Errors appear on lines they're referring to
        Draw curves in the window
            take fourier series etc
            Always recorded as an array with, say, 256 samples. Makes it easy to add them
    Long term
        Compiling from latex
            Someone else's thing to draw and display it. Maybe desmos
        Making your own window visualizations
        Optimization:
            threejs shaders have uv and normal built in. Irrelevant, use RawShader
        Demonstration videos
            Volumetric rendering, can march through texture
        A puzzle game that is a series of "code this shader" challenges
        Webworkers?
        Have a test framework. Just a series of shaders. Load them in, a few frames, move onto the next one
        Above is for fragment shaders(!)
            vertex shaders
            dropdown defining what this shader goes into:
                line, with 
                So there's a single variable that you could call "input", which is the vertex buffer
                Make your own bloody normals
            javascript eg threejs
            Bootstrapping new visualizations
        Export(/import?):
            threejs
            unity
            html page - EE
            export threejs function creating the thing it is with the appropriate uniforms
            Workshop for kids at makespace. Everyone's stuff goes into a VR sim

0D CGA = boolean logic?
    There's origin and infinity
    Origin is true, infinity false?
        Or maybe identity operation is true, 0 is false. Eg true is the operation that changes nothing, false changes to crap
            p AND q = p*q
            p OR q = 
    p = your value
    NOT p = inversion


Huh you are sort of making a desmos killer


For now, 
    "top" dw and 
    "just this line" dw, which you can engineer by mentioning several variables in a line
    And some are different "types" 
        (3,1)
        (3,0,1)
        Shader
    But, may want a scrollable series of dws
        Can scroll up and down, make a new one, delete them, drag them down, maybe merge them

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
*/

async function init() {

    init301()

    initCamera()


    // float myBiv[6] = float[6](3.4, 4.2, 5.0, 5.2, 0.3, 1.1);
    let initialText = 
`void mainImage( out vec4 fragColor ) {
    
    vec4 myPoint1 = vec4(1.2,1.5,0.,1.);
    vec4 myPoint2 = vec4(0.2,1.,0.,1.);

    fragColor = vec4( 1., .5, 0., 1. );
}`

    textarea.value = initialText
    updateSyntaxHighlighting(textarea.value)

    textarea.addEventListener('input', () => {
        updateSyntaxHighlighting(textarea.value)
        updateSyntaxHighlightingScroll(textarea)
    })
    textarea.addEventListener('scroll', () => {
        updateSyntaxHighlightingScroll(textarea)
    })
    textarea.addEventListener('keydown', checkIfKeyIsTab)

    // while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //     indices.push(index);
    //     startIndex = index + searchStrLen;
    // }    

    // initSound()
    // initMouse()

    let render = await initDws()

    initPgaDw()
    initMouseInteractions()

    await initCompilation()

    compile()
    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true)
            compile()
    })
    
    requestAnimationFrame(render)
}