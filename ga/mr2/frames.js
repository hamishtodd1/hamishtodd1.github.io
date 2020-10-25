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

        untriangledVertsBuffer[k * 8 + 4] = pointX(unchangingUnitSquareVertices[i]) * .92
        untriangledVertsBuffer[k * 8 + 5] = pointY(unchangingUnitSquareVertices[i]) * .92
        untriangledVertsBuffer[k * 8 + 6] = pointZ(unchangingUnitSquareVertices[i]) * .92
        untriangledVertsBuffer[k * 8 + 7] = pointW(unchangingUnitSquareVertices[i])
    }
    
    const vertsBuffer = new Float32Array(indices.length*4)
    for (let i = 0; i < indices.length; ++i) {
        vertsBuffer[i * 4 + 0] = untriangledVertsBuffer[indices[i]*4+0]
        vertsBuffer[i * 4 + 1] = untriangledVertsBuffer[indices[i]*4+1]
        vertsBuffer[i * 4 + 2] = untriangledVertsBuffer[indices[i]*4+2]
        vertsBuffer[i * 4 + 3] = untriangledVertsBuffer[indices[i]*4+3]
    }

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
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
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
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

    cameraAndFrameCountShaderStuff.locateUniforms(program)

    program.locateUniform("screenPosition")
    program.locateUniform("hexantColors")

    let framePositions = []
    let names = []
    let numToDraw = 0
    addFrameToDraw = function(x,y,name) {
        framePositions[numToDraw*2+0] = x
        framePositions[numToDraw*2+1] = y

        names[numToDraw] = name
        ++numToDraw
    }

    let hexantColors = new Float32Array(3 * 6)

    addRenderFunction( () => {
        gl.useProgram(program.glProgram);
        cameraAndFrameCountShaderStuff.transfer(program)

        program.doSomethingWithVertexAttribute("point", vertsBuffer)

        for(let i = 0; i < numToDraw; ++i) {
            gl.uniform3fv(program.uniformLocations.hexantColors, nameToHexantColors(names[i], hexantColors))
            gl.uniform2f(program.uniformLocations.screenPosition, framePositions[i*2+0], framePositions[i*2+1]);
            gl.drawArrays(gl.TRIANGLES, 0, vertsBuffer.length / 4);
        }
        numToDraw = 0
    },"end")
}