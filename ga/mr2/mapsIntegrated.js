/*  
    So there's going to be a function equirectangular(a)
        if a is a vector, it returns a vector
        if a is a globe with a texture on it, it returns that globe mappWrappered
        The globe and the projections are two different kinds of object? One's a texture and one's map projection?

        Aaand it might be the dymaxion
*/

async function initGlobeProjectionPictograms() {
    /*
        Functions like mollweide are separate objects
        They have names. They don't themselves receive a visualization because you've not given them a s

        What are these functions? For glsl y
    */



    let vsStart =  `
        attribute vec2 uvA;
        varying vec2 uv;

        attribute vec4 vertA;
        void main(void) {
            uv = uvA;
            float lon = (uvA.x - .5) * TAU;
            float lat = (uvA.y - .5) * PI;
            
            float pointOnGlobe[16];
            point(pointOnGlobe,
                sin(-lon + PI) * cos(lat),
                sin(lat),
                cos(-lon + PI) * cos(lat),
                1.);

            float outputMv[16];
            `
    let vsEnd = `
        mvToVec4(outputMv,gl_Position);
    `
    let fs = `
        varying vec2 uv;
        uniform sampler2D sampler;
        void main(void) {
            // gl_FragColor = vec4(1.,0.,0.,1.);
            gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
        `
        
    const eps = .00001 //sensetive, ugh
    const numDivisions = 256
    var uvBuffer = generateDividedUnitSquareBuffer(numDivisions, eps)

    var ppWrappers = []
    function PpWrapper() {
        for (let i = 0; i < ppWrappers.length + 1; ++i) {
            if (ppWrappers[i] === undefined) {
                ppWrappers[i] = this
                break
            }
        }
        this.currentHeader = ""
        this.currentMain
        this.pictogramProgram = new PictogramProgram(gaShaderString + vsStart + vsEnd, fs)

        this.usedThisFrame = true
        this.usedLastFrame = false
    }

    function predrawAndReturnProgram(nameProperties) {
        let ourPpWrapper = ppWrappers.find((ppWrapper) => 
            ppWrapper.currentHeader === nameProperties.header &&
            ppWrapper.currentMain === nameProperties.main ) //bit costly. Maybe turn the string into a single number or something?
        if (ourPpWrapper === undefined) {
            ourPpWrapper = ppWrappers.find((ppWrapper) => {
                return ppWrapper.usedLastFrame === false
            })
            if(ourPpWrapper === undefined)
                ourPpWrapper = new PpWrapper()
                
            let vsSource = vertexShaderToPictogramVertexShader(gaShaderString + nameProperties.header + vsStart + nameProperties.main + vsEnd)
            ourPpWrapper.pictogramProgram.changeShader(gl.VERTEX_SHADER, vsSource)

            ourPpWrapper.pictogramProgram.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
            ourPpWrapper.pictogramProgram.locateUniform("sampler")

            ourPpWrapper.currentHeader = nameProperties.header
            ourPpWrapper.currentMain = nameProperties.main
        }
        ourPpWrapper.usedThisFrame = true

        let program = ourPpWrapper.pictogramProgram
        gl.useProgram(program.glProgram)
        program.prepareVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, nameProperties.globeProperties.texture);
        gl.uniform1i(program.getUniformLocation("sampler"), 0);

        return program
    }

    let pictogramDrawer = new PictogramDrawer()
    pictogramDrawers.globeProjection = pictogramDrawer
    function draw() {
        gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2)
    }
    addRenderFunction(() => {
        ppWrappers.forEach((ppWrapper)=>{ppWrapper.usedThisFrame = false})
        pictogramDrawer.drawEach(predrawAndReturnProgram, draw)
        ppWrappers.forEach((ppWrapper)=> {ppWrapper.usedLastFrame = ppWrapper.usedThisFrame})
    })
}

async function initGlobePictograms() {
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
        during: (name)=>{
            let nameProperties = getNameDrawerProperties(name)
            nameProperties.yaw   += mouse.position.x - mouse.positionOld.x
            nameProperties.pitch += mouse.position.y - mouse.positionOld.y
        }
    }

    let pictogramDrawer = new PictogramDrawer(globeEditingStyle, vs, fs)
    pictogramDrawers.globe = pictogramDrawer
    
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

        pictogramDrawer.finishPrebatchAndDrawEach((nameProperties,name) => {
            rotator(yawAxis, nameProperties.yaw, transform)
            transferDualQuat(transform, "transform", pictogramDrawer.program)

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, nameProperties.texture);
            gl.uniform1i(pictogramDrawer.program.getUniformLocation("sampler"), 0);//hmm, why 0?

            gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2);
        })
    })

    initGlobeProjectionPictograms()
}