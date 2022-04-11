/*
TODO
    Short term
        Hovering
            indicates, with lines, which mention is which visualization
            menu for:
                color
                what kind of object it is
        3,0,1 multivectors
            Since it's all in one shader anyway, could use sdfs. Nice lighting, including on plane
            {
                //do everything in the shader, calculating pts, lines, planes along the way
                //pass those to an sdf function that does spheres cylinders planes
            }
        Editing from the window
        suggestions
            You have a single shader calculate the whole lot of them
            Player is dragging eg a point around
            If a suggestion is close enough to snap, then you do that to the point
                (which results in the downstream things changing!)
            When player lets go, we do a special render, where we do not render the point
                instead we render, to a target, some pixels that can be read as "here's the line of code you want"
            When you snap it into place, what it's based on is highlighted (using the diagram things)
        3,0,1 sphere at infinity
    Medium term
        You don't necessarily want every single thing in one dw, you have to have
            Controlling what is in what dws
            Maybe making new dws
            Auto-scrolling to the correct dw?
        Compilation with a webworker
        Being selective about what 
        A dw that only shows the line your caret is on
        (2,1) halfplane window
            lerp as an example of a simple function to try it out with
            write some numbers on a line
            They appear in a  if my carat is on that line
            I can click or drag or whatever, and find the number I know I want
            Maybe move my carat through the line (4*8+5*2)/2 and see it animate
        mentions are sensetive to for loops
            For loops have an early-escape integer
            For every mention in the loop body, we're cutting off the shader after that integer
        Maybe you have some point that goes weird places in 3D when you change some 1d or 2d variable
            Hold a button to make it so that the thing gets a trail
    Long term
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
            html page
            export threejs function creating the thing it is with the appropriate uniforms
            Do a workshop for kids at makespace



For now, 
    "allVariables" dw and 
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
    let initialText = 
`void mainImage( out vec4 fragColor )
{
    vec4 myPoint = vec4(1.2,1.9,0.,1.);

    fragColor = vec4( 1., .5, 0., 1.);
}`
//half way 1.0653362070468535, 0.8803922415546626, 1.7062327591717965
    textarea.value = initialText
    updateSyntaxHighlighting(textarea.value)

    textarea.oninput = () => {
        updateSyntaxHighlighting(textarea.value)
        updateSyntaxHighlightingScroll(textarea)
    }
    textarea.onscroll = () => {updateSyntaxHighlightingScroll(textarea)}
    textarea.addEventListener('keydown', checkIfKeyIsTab)

    // while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //     indices.push(index);
    //     startIndex = index + searchStrLen;
    // }
    
    textarea.addEventListener('dblclick',(event)=>{
        // log(document.getSelection().toString())
    })

    

    // initSound()
    // initMouse()

    let render = await initDws()
    compile()
    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true)
            compile()
    })
    
    requestAnimationFrame(render)
}