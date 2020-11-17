/*  
    So there's going to be a function equirectangular(a)
        if a is a vector, it returns a vector
        if a is a globe with a texture on it, it returns that globe mapped
        The globe and the projections are two different kinds of object? One's a texture and one's map projection?

        Aaand it might be the dymaxion
*/

async function initGlobeProjectionPictograms(globeNamedInstantiations) {
    /*
        Functions like mollweide are separate objects
        They have names. They don't themselves receive a visualization because you've not given them a s

        What are these functions? For glsl y
    */

    {
        function TranspiledFunction() {
            this.intermediateRepresentation = "" //valid js or glsl
            this.needsUpdate = true //Can be replaced every frame, just not in the gl
        }

        var transpiledFunctions = {
            sinusoidal: new TranspiledFunction()
        }
    }

    //do you give them names that the namedMvs don't have?
    //Just press the number 1 and it gives you the... lowestUnusedColorName
    let namedInstantiations = {
        y: {
            globe: globeNamedInstantiations["earthColor"],
            mapping: transpiledFunctions["sinusoidal"]
        }
    }

    let vs = `
        attribute vec4 vertA;
        void main(void) {
            gl_Position = vertA;
        `
    let fs = `
        void main(void) {
            gl_FragColor = vec4(1.,0.,0.,1.);
        `

    let globeProjectionPictogramDrawer = new PictogramDrawer(vs, fs, {})
    globeProjectionPictogramDrawer.program.addVertexAttribute("vert", quadBuffer, 4, true)
    addRenderFunction(() => {
        gl.useProgram(globeProjectionPictogramDrawer.program.glProgram)
        globeProjectionPictogramDrawer.program.prepareVertexAttribute("vert", quadBuffer)

        globeProjectionPictogramDrawer.prebatchAndDrawEach((name) => {
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        })
    })

    // updateFunctions.push(() => {
    //     globeProjectionPictogramDrawer.add(.7, -.7, "y")
    // })
}

async function initGlobePictograms() {
    let namedInstantiations = {}
    {
        let textureNames = ["earthColor", "ball", "cmb", "jupiter", "latAndLon"]

        for(let i = 0; i < textureNames.length; ++i) {
            namedInstantiations[textureNames[i]] = {
                texture: await Texture("data/" + textureNames[i] + ".png"),
                yaw: 0., pitch: 0.
            }
        }
    }

    let vs = `
        attribute vec2 uvA;
        varying vec2 uv;

        `+ gaShaderString +`
        uniform dualQuat transform;

        vec4 globe(float lon,float lat) {
            return vec4(
                sin(-lon + PI) * cos(lat),
                sin(lat),
                cos(-lon + PI) * cos(lat),
                1.
            );
        }

        void main(void) {
            uv = uvA;

            float lon = (uv.x - .5) * TAU;
            float lat = (uv.y - .5) * PI;

            vec4 p = globe(lon,lat);

            dqSandwich(p, transform);

            gl_Position = p;
        `
    let fs = `
        varying vec2 uv;
        uniform sampler2D sampler;

        void main(void) {
            gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
        `

    let yawAxis = new DualQuat()
    yawAxis.realLine[1] = 1.
    // let pitchAxis = new DualQuat()
    // pitchAxis.realLine[0] = 1.

    let globeEditingStyle = {
        during: (editingName)=>{
            namedInstantiations[editingName].yaw   += mouse.position.x - mouse.positionOld.x
            namedInstantiations[editingName].pitch += mouse.position.y - mouse.positionOld.y
        }
    }

    let pictogramDrawer = new PictogramDrawer(vs, fs, globeEditingStyle)
        
    const eps = .00001 //sensetive, ugh
    const numDivisions = 256
    const uvBuffer = generateDividedUnitSquareBuffer(numDivisions, eps)
    pictogramDrawer.program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
    
    pictogramDrawer.program.locateUniform("sampler")
    locateUniformDualQuat(pictogramDrawer.program, "transform")

    let transform = new DualQuat()
    addRenderFunction(() => {
        gl.useProgram(pictogramDrawer.program.glProgram)
        pictogramDrawer.program.prepareVertexAttribute("uv")

        pictogramDrawer.prebatchAndDrawEach((name) => {
            rotator(yawAxis, namedInstantiations[name].yaw, transform)
            transferDualQuat(transform, "transform", pictogramDrawer.program)

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, namedInstantiations[name].texture);
            gl.uniform1i(pictogramDrawer.program.getUniformLocation("sampler"), 0);//hmm, why 0?

            gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2);
        })
    })

    updateFunctions.push(() => {
        pictogramDrawer.add(-.5, .5, "cmb")
    })

    initGlobeProjectionPictograms(namedInstantiations)
}