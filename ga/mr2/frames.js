function initFrames() {
    let indices = []
    let oneSideIndices = [0,1,2,  1,3,2]
    for(let i = 0; i < 4; ++i) {
        for(let j = 0; j < oneSideIndices.length; ++j) {
            indices.push((i * 2 + oneSideIndices[j])%8)
        }
    }

    let untriangledVertsBuffer = Array()
    for(let i = 0; i < unchangingUnitSquareVertices.length; ++i) {
        let k = i < 2 ? 1-i : i
        untriangledVertsBuffer[k * 8 + 0] = pointX(unchangingUnitSquareVertices[i])
        untriangledVertsBuffer[k * 8 + 1] = pointY(unchangingUnitSquareVertices[i])
        untriangledVertsBuffer[k * 8 + 2] = pointZ(unchangingUnitSquareVertices[i])
        untriangledVertsBuffer[k * 8 + 3] = pointW(unchangingUnitSquareVertices[i])

        untriangledVertsBuffer[k * 8 + 4] = pointX(unchangingUnitSquareVertices[i]) * .85
        untriangledVertsBuffer[k * 8 + 5] = pointY(unchangingUnitSquareVertices[i]) * .85
        untriangledVertsBuffer[k * 8 + 6] = pointZ(unchangingUnitSquareVertices[i]) * .85
        untriangledVertsBuffer[k * 8 + 7] = pointW(unchangingUnitSquareVertices[i])
    }
    
    const vertsBuffer = new Float32Array(indices.length*4)
    for (let i = 0; i < indices.length; ++i) {
        vertsBuffer[i * 4 + 0] = untriangledVertsBuffer[indices[i]*4+0]
        vertsBuffer[i * 4 + 1] = untriangledVertsBuffer[indices[i]*4+1]
        vertsBuffer[i * 4 + 2] = untriangledVertsBuffer[indices[i]*4+2]
        vertsBuffer[i * 4 + 3] = untriangledVertsBuffer[indices[i]*4+3]
    }

    const vsSource = shaderHeader + `
        attribute vec4 pointA;
        varying vec2 pointV;

        uniform vec2 screenPosition;

        void main(void) {
            vec4 p = pointA;
            pointV = p.xy;

            p.xy += screenPosition;

            //camera, "just" squashing so it goes on screen
            p.x /= rightAtZZero;
            p.y /= topAtZZero;
            p.z /= frontAndBackZ;

            gl_Position = p;
            gl_PointSize = 10.;
        }
        `
    const fsSource = shaderHeader + `
        varying vec2 pointV;
        uniform vec3 hexantColors[6];

        void main(void) {
            float angle = atan(pointV.y,pointV.x);
            int nonConstantIndex = int(floor((angle / TAU + .5) * 6.));

            //you might think you could just use the damn integer, but it's not constant. You're meant to put it in a texture
            for(int i = 0; i < 6; ++i) {
                if(i == nonConstantIndex )
                    gl_FragColor = vec4(hexantColors[i],1.);
            }
        }
        `
    // logShader(fsSource)

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("point", vertsBuffer, 4, true)

    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")
    program.locateUniform("screenPosition")
    program.locateUniform("hexantColors")

    let framePositions = []
    let frameColors = []
    let numFramesToDraw = 0
    addFrameToDraw = function(x,y,name) {
        framePositions[numFramesToDraw*2+0] = x
        framePositions[numFramesToDraw*2+1] = y

        if (frameColors[numFramesToDraw] === undefined)
            frameColors[numFramesToDraw] = new Float32Array(3*6)
        for(let i = 0; i < 6; ++i) {
            let letter = name[ Math.floor(i / 6. * name.length) ]
            frameColors[numFramesToDraw][i*3+0] = colors[letter][0]
            frameColors[numFramesToDraw][i*3+1] = colors[letter][1]
            frameColors[numFramesToDraw][i*3+2] = colors[letter][2]
        }
        ++numFramesToDraw
    }

    addRenderFunction( () => {
        gl.useProgram(program.glProgram);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);

        program.doSomethingWithVertexAttribute("point", vertsBuffer)

        for(let i = 0; i < numFramesToDraw; ++i) {
            gl.uniform3fv(program.uniformLocations.hexantColors,frameColors[i])
            gl.uniform2f(program.uniformLocations.screenPosition, framePositions[i*2+0], framePositions[i*2+1]);
            gl.drawArrays(gl.TRIANGLES, 0, vertsBuffer.length / 4);
        }
        numFramesToDraw = 0
    },"end")
}