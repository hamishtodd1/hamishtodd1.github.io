async function initMapsIntegrated() {

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
            // .x + 8./256. if you want Asia intact
            vec4 texelColor = texture2D(sampler, vec2(uv.x,1.-uv.y)); //1- because jfc opengl

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const program = Program(vsSource, fsSource)
    cameraAndFrameCountShaderStuff.locateUniforms(program)
    program.locateUniform("frameCount")
    locateUniformDualQuat(program, "transform")

    const texture = await Texture("data/earthColor.png")
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

    let axis = new DualQuat()
    axis.realLine[2] = 1.
    let ourTranslator = new DualQuat()
    let ourRotator = new DualQuat()
    let deltaRotator = new DualQuat()

    let mouseDelta = new Float32Array(16)
    let padPlane = new Float32Array(16)
    plane(padPlane, 0.,0.,1.,0.)

    rightMouseResponses.push({
        z: () => 0.,
        during: () => {
            point(mouseDelta, mouse.position.x - mouse.positionOld.x, mouse.position.y - mouse.positionOld.y, 0.,0.)
            if (pointIdealNorm(mouseDelta) > 0.) {
                
                dqToMv(ourRotator, mv0);
                reverse(mv0, mv0); //pretty sure reverse is inverse transformation
                gp(mv0, mouseDelta, mv1);
                reverse(mv0, mv0);
                gp(mv1, mv0, mv2); //mv2 is now transformed mouseDelta
                // debugger

                gp(mv2)
                debugger

                meet(dual(mouseDelta, mv2), padPlane, mv1)
                mvToDq(mv1, axis)

                normalizeDq(axis, axis)
                rotator(axis, -pointIdealNorm(mouseDelta), deltaRotator)
                normalizeDq(deltaRotator, deltaRotator)

                multiplyDq(ourRotator, deltaRotator, ourRotator)
            }
        }
    })

    drawEarth = (drawingPosition,tokenStart,tokenEnd) => {
        addColoredFrameToDraw(drawingPosition.x + .5, drawingPosition.y, 0.,0.,0.)
        
        ourTranslator.idealLine[0] = -.5 * (drawingPosition.x + .5)
        ourTranslator.idealLine[1] = -.5 *  drawingPosition.y
        normalizeDq(ourTranslator,ourTranslator)
        
        drawingPosition.x += 1.
        carat.moveOutOfToken(tokenStart, tokenEnd)
    }

    addRenderFunction(() => {
        gl.useProgram(program.glProgram);

        program.doSomethingWithVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniformLocations.sampler, 0);

        cameraAndFrameCountShaderStuff.transfer(program)
        gl.uniform1f(program.uniformLocations.frameCount, frameCount);

        multiplyDq(ourTranslator,ourRotator, transform)
        // assignDq(ourRotator,transform)
        transferDualQuat(transform, "transform", program)

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    })
}