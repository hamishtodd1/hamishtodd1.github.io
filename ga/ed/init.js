/*
Script
    "Why you should care"
    explain homogeneous coordinates using vec dw
    Just want to emphasize the fact that it's an exponentiation of an axis

TODO
    Team presentation
        Study window
            Dragging in it affects the line
        Dragging in the window itself moves the line as if it were a 180 / line reflection
        Overrides
        Applying dqs to lines
    Short term
        It's a bit of a mess with the points
        mvs that you get a displayable version of need to be updated with camera
        Currently, if a variable is uninitialized, you still get shown a point at 0,0,0 in the window
        When you click window, if not close to anything, perhaps point should be created?
        Hsv window
        When you move something, it could leave its current value behind
            And thereby have a suggestion based on that, like +=
            And maybe you're defining a transform
        When the user moves a point to an arbitrary place, you get the say in how it got there
            it's r*p*~r
                If r*p*~r did not come from a suggestion, it probably makes r as well
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
        Deal with struct definitions... somehow?
        Have a test framework. Just a series of shaders. Load them in, a few frames, move onto the next one
            move the mouse around
            make some mentions then delete them
        Highlight when carat is on mention
    Medium term
        When you're moving camera, label lines update when mouse is in dw, but not otherwise
        Mobius strip dw because for double cover
            The unit complex numbers are the edge
            Intermediate between complex plane view of rotors
            Or maybe there's a clever strip showing whole thing        
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
        If you have a nice pile of dws, and you go from line to line so different ones become relevant, nice transition
        Maybe you have some point that goes weird places in 3D when you change some 1d or 2d variable
            Hold a button to make it so that the thing gets a trail
        Errors appear on lines they're referring to
        Draw curves in the window
            It's just the same thing as painting a texture, it just gets recorded as vec2s in a 1D texture
            Always recorded as an array with, say, 256 samples. Makes it easy to add them
            Fourier series to interpolate or whatever
        If the variable hasn't changed value, would be nice if the versions of it that are the same as it are all highlighted
        A puzzle game that is a series of "code this shader" challenges
        Demonstration videos
            Volumetric rendering, can march through texture
        Things other than fragment shaders
            vertex shaders
            dropdown defining what this shader goes into:
                line, with 
                So there's a single variable that you could call "input", which is the vertex buffer
                Make your own bloody normals
            javascript eg threejs
            Bootstrapping new visualizations
    Long term
        
        Compiling from latex
            Someone else's thing to draw and display it. Maybe desmos
        Optimization:
            threejs shaders have uv and normal built in. Irrelevant, use RawShader
        Documented API for making your own window visualizations
        Webworkers?
        Export(/import?):
            threejs
            unity
            html page - EE
            export threejs function creating the thing it is with the appropriate uniforms
            Workshop for kids at makespace. Everyone's stuff goes into a VR sim

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

    // init41()
    init301()

    initCamera()

    // while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //     indices.push(index);
    //     startIndex = index + searchStrLen;
    // }    

    // initSound()

    let render = await initDws()

    initMention()

    initFinalDw()

    await initVectorSpaceDw()

    new Dw("euclidean", true)
    initInfinityDw()
    initStudyDw()
    initPgaVizes()

    initMouseInteractions()

    // float myBiv[6] = float[6](3.4, 4.2, 5.0, 5.2, 0.3, 1.1);
    let initialText =
// `void mainImage( out vec4 fragColor ) {
//     vec4 pt = vec4(.5,1.,0.,1.);
//     // vec3 pt2 = vec3(.5,1.,0.);

//     fragColor = pt;
// }`
//try eg 1 + e12 + e01234
//vec2 is a complex number
`void mainImage( out vec4 fragColor ) {

    vec2 complex = vec2(1.,1.);
    vec2 complex2 = complex * 1./length(complex);
    
    vec3 myVec = vec3(1.,1.,0.);

    Dq originL = Dq(0., 0.,0.,0., 0.,1.,0., 0.);
    Dq idealL  = Dq(0., 1.,0.,0., 0.,0.,0., 0.);

    Dq rotation = Dq(complex.x, 0.,0.,0., 0.,complex.y,0., 0.);
    
    vec4 idealPt = vec4( .2,0.,-1.,0.);
    vec4 realPt = vec4( .2,0., 1.,1.);

    vec4 transformedPt = applyDqToPt(rotation, realPt);

    fragColor = vec4(0.,complex.x,complex.y,1.);
}
`
    textarea.value = initialText
    updateSyntaxHighlighting(textarea.value)

    textarea.addEventListener('input', (event) => {
        updateSyntaxHighlighting(textarea.value)
        updateSyntaxHighlightingScroll(textarea)
    })
    textarea.addEventListener('scroll', () => {
        updateSyntaxHighlightingScroll(textarea)
    })
    textarea.addEventListener('keydown', checkIfKeyIsTab)

    await initCompilation()

    initCaretInteractions()

    compile()
    updateHighlightingAndDws()
    
    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true) {
            compile()
            updateHighlightingAndDws()
        }
    })
    
    requestAnimationFrame(render)
}