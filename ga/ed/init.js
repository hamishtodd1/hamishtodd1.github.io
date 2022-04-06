/*
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

//     // compileAndRun(textarea.value)
//     // document.addEventListener( 'keydown', (event) =>{
//     //     if (event.key === "Enter" && event.altKey === true) {
//     //         compileAndRun(textarea.value)
//     //     }
//     // })
    
//     document.addEventListener('dblclick',(event)=>{
//         console.log(document.getSelection().toString())
//     })


  

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



    function makeScene(elem) {
        const scene = new THREE.Scene();

        const fov = 45;
        const aspect = 1.; //POTENTIALLY TO BE CHANGED
        const near = 0.1;
        const far = 5;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 1, 2);
        camera.lookAt(0, 0, 0);

        return { scene, camera, elem };
    }

    function setupScene1() {
        const sceneInfo = makeScene(document.querySelector('#topRightWindow'));
        const geometry = new THREE.SphereBufferGeometry(.8, 4, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const mesh = new THREE.Mesh(geometry, material);
        sceneInfo.scene.add(mesh);
        sceneInfo.mesh = mesh;
        return sceneInfo;
    }

    function setupScene2() {
        const sceneInfo = makeScene(document.querySelector('#inlineWindow'));
        const geometry = new THREE.BoxBufferGeometry(1., 1., 1.);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        const mesh = new THREE.Mesh(geometry, material);
        sceneInfo.scene.add(mesh);
        sceneInfo.mesh = mesh;
        return sceneInfo;
    }

    const sceneInfo1 = setupScene1();
    const sceneInfo2 = setupScene2();

    function renderSceneInfo(sceneInfo) {
        const { scene, camera, elem } = sceneInfo;

        // get the viewport relative position of this element
        const { left, right, top, bottom, width, height } =
            elem.getBoundingClientRect();

        const isOffscreen =
            bottom < 0 ||
            top > renderer.domElement.clientHeight ||
            right < 0 ||
            left > renderer.domElement.clientWidth;

        if (isOffscreen)
            return

        const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        renderer.render(scene, camera);
    }

    function render() {

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height)
            renderer.setSize(width, height, false);

        renderer.setScissorTest(false);
        renderer.clear(true, true);
        renderer.setScissorTest(true);

        renderSceneInfo(sceneInfo1);
        renderSceneInfo(sceneInfo2);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}