function initErrorHighlight() {

    let farBackQuadBuffer = new Float32Array(quadBuffer.length)
    for(let i = 0; i < quadBuffer.length; ++i) {
        farBackQuadBuffer[i] = quadBuffer[i]
        if( i % 4 === 2 )
            farBackQuadBuffer[i] = mainCamera.frontAndBackZ
        if( i % 4 === 0) {
            if (farBackQuadBuffer[i] < 0.)
                farBackQuadBuffer[i] = 0.
            else
                farBackQuadBuffer[i] = 1000.
        }
    }

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec4 pointA;
        uniform vec2 screenPosition;

        void main(void) {
            vec4 p = pointA;

            p.xy += screenPosition;

            gl_Position = p;
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        void main(void) {
            gl_FragColor = vec4(1.,0.,0.,1.);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("point", farBackQuadBuffer, 4, true)

    cameraAndFrameCountShaderStuff.locateUniforms(program)

    program.locateUniform("screenPosition")

    let screenPositions = []
    let numHighlights = 0
    placeErrorHighlight = function (drawingPosition) {
        screenPositions[numHighlights * 2 + 0] = drawingPosition.x
        screenPositions[numHighlights * 2 + 1] = drawingPosition.y
        ++numHighlights
    }

    addRenderFunction(() => {
        gl.useProgram(program.glProgram);
        program.prepareVertexAttribute("point", farBackQuadBuffer)
        cameraAndFrameCountShaderStuff.transfer(program)

        for(let i = 0; i < numHighlights; ++i) {
            gl.uniform2f(program.uniformLocations.screenPosition, screenPositions[i*2+0], screenPositions[i*2+1]);
            gl.drawArrays(gl.TRIANGLES, 0, farBackQuadBuffer.length / 4);
        }
        numHighlights = 0
    })
}