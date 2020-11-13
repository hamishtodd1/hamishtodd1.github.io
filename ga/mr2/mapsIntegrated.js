/*  
    So there's going to be a function equirectangular(a)
        if a is a vector, it returns a vector
        if a is a globe with a texture on it, it returns that globe mapped
        The globe and the projections are two different kinds of object? One's a texture and one's map projection?

        Aaand it might be the dymaxion
*/

async function initMapsIntegrated() {

    let glslMappingFunction = `
        float lat = asin(dot(p,vec3()));
    `

    {
        let texturedGlobePictograms = ["cmb", "ball", "earthColor", "jupiter"]
        texturedGlobePictograms.addToRenderList = () => {

        }
        pictogramTypeArrays.push(texturedGlobePictograms)

        let mapProjectionPictograms = []
        //you'll add eg "equirectangular" to that
        //that gets compiled to a vertex shader
        //these are a type that can only be output by a vertex mapping function applied to a texturedGlobe
        mapProjectionPictograms.addToRenderList = (projectionFunction, texturedGlobe) => {

        }
        pictogramTypeArrays.push(mapProjectionPictograms)
    }
    
    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec2 uvA;
        varying vec2 uv;
        varying vec4 p;

        `
        + gaShaderString +
        `

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
            p = vec4(uv,0.,1.);

            float lon = (p.x - .5) * TAU;
            float lat = (p.y - .5) * PI;

            p = globe(lon,lat);
            p.xyz *= .5;

            dqSandwich(p, transform);
            
            gl_Position = p;
        `
        + cameraAndFrameCountShaderStuff.footer
    // logShader(vsSource)
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        varying vec2 uv;
        varying vec4 p;

        uniform sampler2D sampler;

        void main(void) {
            vec4 texelColor = texture2D(sampler, vec2(uv.x,1.-uv.y)); //1- because jfc opengl

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const program = Program(vsSource, fsSource)
    cameraAndFrameCountShaderStuff.locateUniforms(program)
    program.locateUniform("frameCount")

    let sphereTextureFilenames = [
        "earthColor",
        "ball",
        "cmb",
        "jupiter",
    ]
    const texture = await Texture("data/" + sphereTextureFilenames[0] + ".png")
    program.locateUniform("sampler")

    let numDivisions = 256
    const uvBuffer = []
    function pushUv(i, j) {
        uvBuffer.push(i / numDivisions)
        uvBuffer.push(j / numDivisions)
    }
    //you don't want anything on any precise lines like x = .5
    let eps = .00001 //sensetive, ugh
    for (let i = 0.; i < numDivisions; ++i) {
        for (let j = 0.; j < numDivisions; ++j) {
            pushUv(i + eps, j + eps)
            pushUv(i + 1. - eps, j + 1. - eps)
            pushUv(i + eps, j + 1. - eps)

            pushUv(i + eps, j + eps)
            pushUv(i + 1. - eps, j + eps)
            pushUv(i + 1. - eps, j + 1. - eps)
        }
    }
    program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
    let numVertices = uvBuffer.length / 2

    let transform = new DualQuat()
    locateUniformDualQuat(program, "transform")

    //mouse shit
    {
        // let axis = new DualQuat()
        // axis.realLine[2] = 1.
        // let ourTranslator = new DualQuat()
        // let ourRotator = new DualQuat()
        // let deltaRotator = new DualQuat()

        // let mouseDelta = new Float32Array(16)
        // let padPlane = new Float32Array(16)
        // plane(padPlane, 0.,0.,1.,0.)

        // rightMouseResponses.push({
        //     z: () => 0.,
        //     during: () => {
        //         point(mouseDelta, mouse.position.x - mouse.positionOld.x, mouse.position.y - mouse.positionOld.y, 0.,0.)
        //         if (pointIdealNorm(mouseDelta) > 0.) {

        //             dqToMv(ourRotator, mv0);
        //             reverse(mv0, mv0); //pretty sure reverse is inverse transformation
        //             gp(mv0, mouseDelta, mv1);
        //             reverse(mv0, mv0);
        //             gp(mv1, mv0, mv2); //mv2 is now transformed mouseDelta
        //             // debugger

        //             gp(mv2)
        //             debugger

        //             meet(dual(mouseDelta, mv2), padPlane, mv1)
        //             mvToDq(mv1, axis)

        //             normalizeDq(axis, axis)
        //             rotator(axis, -pointIdealNorm(mouseDelta), deltaRotator)
        //             normalizeDq(deltaRotator, deltaRotator)

        //             multiplyDq(ourRotator, deltaRotator, ourRotator)
        //         }
        //     }
        // })
    }

    drawEarth = (drawingPosition) => {
        addUnnamedFrameToDraw(drawingPosition.x + .5, drawingPosition.y, 0.,0.,0.)
        
        transform.idealLine[0] = -.5 * (drawingPosition.x + .5)
        transform.idealLine[1] = -.5 *  drawingPosition.y
        normalizeDq(transform,transform)
    }

    addRenderFunction(() => {
        gl.useProgram(program.glProgram);

        program.prepareVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniformLocations.sampler, 0);

        cameraAndFrameCountShaderStuff.transfer(program)
        gl.uniform1f(program.uniformLocations.frameCount, frameCount);

        // multiplyDq(ourTranslator,ourRotator, transform)
        // assignDq(ourRotator,transform)
        transferDualQuat(transform, "transform", program)

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    })
}