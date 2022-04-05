/*
Initially: you click a thing, it puts that thing in a window
Heh, you have to actually run the code!
Hover a variable, shows that variable in the current window
Accepts glsl and threejs. glsl first
write "vec4" and specify it to be a point and it suggests a bunch of things in the window
    which you can click and it sticks "a wedge b" or whatever

The reason not to do this as a vscode extension is...
    they'll have their own weird internal representation of the code
    it might run slowly
    not all computer graphics people use vscode
    you want to make something like shadertoy where people can just get in and go

Parsing
    It may be better to use vscode parser. Here's what you need to do if not:
    figure out what variables are what
    potentially take excerpts of the code and run it, eg they've written a function
        you want the output of that though, so not in a shader

Fuck labelling things in the window. You want lables? Hover
    

The right rep for colors is probably the RGB cube with three cutting planes

pure float 1D CGA ideas
    lerp as an example of a simple function you want to try

https://stackoverflow.com/questions/16502319/overlay-a-canvas-over-a-div

hopefully you can get away with only parsing from a newline to a semicolon?
Oh who are you kidding, you have to compile the whole program
It's not the end of the world to not faithfully compile the whole thing

If you have a matrix that is tagged as "known to have det=0"
    That's different from usual. That's 3 points at infinity maybe, instead of

Projective geometry lets you give points in space as rationals easily

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

function init() {
    let textarea = document.getElementById("editing")

    let initial = 
    `void main() 
{
    gl_FragColor = vec4(1.,0.,0.,1.);
}`
    textarea.value = initial
    updateSyntaxHighlighting(textarea.value)

    compileAndRun(textarea.value)

    document.addEventListener( 'keydown', (event) =>{
        if (event.key === "Enter" && event.altKey === true) {
            compileAndRun(textarea.value)
        }
    })  
    
    document.addEventListener('dblclick',(event)=>{
        console.log(document.getSelection().toString())
    })
}

function compileAndRun(str) {
    str.split()
}