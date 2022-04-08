/*
TODO
    Short term
        a window for holding a non-ideal point
            it compiles the entire shader up until the line you want it from
            then, it takes that particular vec3 as the 
    Medium term
        (2,1) halfplane window
            write some numbers on a line
            They appear in a  if my carat is on that line
            I can click or drag or whatever, and find the number I know I want
            Maybe move my carat through the line (4*8+5*2)/2 and see it animate
    Long term
        "Suggestions" eg snapping

        Above is for fragment shaders(!)
            vertex shaders
            javascript eg threejs
            Bootstrapping new visualizations
        Export(/import?):
            threejs
            unity
            export threejs function creating the thing it is with the appropriate uniforms

You have a single shader calculate the whole lot of them

Have an "export html page" button, and make everyone

Since it's all in one shader anyway, could use sdfs. Nice lighting, including on plane

So, you've made a variable, a free point. You want to move it

Maybe no dw inline. Maybe just menu choosing what kind of object it is, plus a color picker

The state of a given variable, if changing, is only changed on lines where that variable is mentioned (coz no globals!)
So, a GIVEN picture of a variable can be ascribed to a certain line on which it is mentioned
    Addendum! a given line AND A GIVEN VALUE FOR THE INDEX OF A FOR LOOP!
        This can potentially work because it's unrolled!
        So, for every for loop, if you have an index, that index has a "visualize early" index
        By default it's set to 0. Its maximum is the end of the loop

WHILE you're moving a free variable, you're overriding. It's just a picture. Fuck the calculation of anything in the shader
Except for a couple of things - the things in the window. Their values get calculated. In the vertex shader for your thing, too!

Probably every variable sent into the shader has an "override"

You have a scrollable series of visualizations
    Can scroll up and down, make a new one, delete them, drag them down, maybe merge them
    Which state does it represent, given state is mutable
        So for a given window, you have given variable values? Naah

Initially: you click a thing, it puts that thing in a window
Heh, you have to actually run the code!
Hover a variable, shows that variable in the current window
Accepts glsl and threejs. glsl first
write "vec4" and specify it to be a point and it suggests a bunch of things in the window
    which you can click and it sticks "a wedge b" or whatever

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

Parser
    figure out what variables are what
    potentially take excerpts of the code and run it, eg they've written a function
        you want the output of that though, so not in a shader

Fuck labelling things in the window. You want lables? Hover

Maybe you have some point that goes weird places in 3D when you change some 1d or 2d variable
    Hold a button to make it so that the thing gets a trail
    

The right rep for colors is probably the RGB cube with three cutting planes

pure float 1D CGA ideas
    lerp as an example of a simple function you want to try

https://stackoverflow.com/questions/16502319/overlay-a-canvas-over-a-div

hopefully you can get away with only parsing from a newline to a semicolon?
Oh who are you kidding, you have to compile the whole program
It's not the end of the world to not faithfully compile the whole thing

Don't write your own compiler. If you have to do that, something has gone wrong
how do you do your snapping/suggestions when it's all on the gpu?
    A single shader calculates all the shapes
    It then makes a list, yes, of all the suggestions
    And writes the correct one to a single pixel!   

If you have a matrix that is tagged as "known to have det=0"
    That's different from usual. That's 3 points at infinity maybe, instead of

Projective geometry lets you give points in space as rationals easily

If we were making a vertex shader (which we're probably not), dropdown defining what this shader goes into:
    line, with 
    So there's a single variable that you could call "input", which is the vertex buffer
    Make your own bloody normals

Have a test framework. Just a series of shaders. Load them in, a few frames, move onto the next one







Slightly philosophical:
    throwing away the magnitudes might be bad because it's not reversible. Nature seems to want reversibility

Old notes
    So if you were to make a threejs livecoding thing...
        Well, at least you'd dogfood it
    
    Two views. One is eeeeverything, one is the line your carat is on

    Hover an object in either and see which name in the code it corresponds to
        Also cause the things it is downstream of IN THE CURRENT WINDOW to glow
    Hover a variable name and see it connected to both
            
    You can't necessarily do all that in vscode

    But you don't LIKE text!!! This is a bit compromised, a last resort
*/

async function init() {
    let initialText = 
`void mainImage( out vec4 fragColor )
{
    vec4 myPoint = vec4(0.1,0.,0.,1.);
    
    fragColor = vec4( 1., 0., 0., 1.);
}`
    textarea.value = initialText
    updateSyntaxHighlighting(textarea.value)
    
    textarea.addEventListener('dblclick',(event)=>{
        console.log(document.getSelection().toString())
    })

    inlineDwElem.addEventListener("mousedown",(event)=>{
        log("yay")
    })

    

    // initSound()
    // initMouse()

    // function render() {
    //     let clockDelta = clock.getDelta()
    //     frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness

    //     // mouse.updateFromAsyncAndCheckClicks()

    //     // for (var i = 0; i < updateFunctions.length; i++)
    //     //     updateFunctions[i]()

    //     ++frameCount
    // }

    // canvas.addEventListener()

    let render = await initDws()
    compile()
    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === true) {
            compile()
        }
    })
    
    requestAnimationFrame(render)
}