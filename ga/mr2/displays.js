function verticesDisplay(vertBuffer, mode, r,g,b)
{
    if (vertBuffer.length % 4 !== 0)
        console.error("needs to be 4vecs")

    r = r || 1.
    g = g || 0.
    b = b || 0.
    let rStr = r === Math.round(r) ? r.toString() + "." : r.toString()
    let gStr = g === Math.round(g) ? g.toString() + "." : g.toString()
    let bStr = b === Math.round(b) ? b.toString() + "." : b.toString()

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec4 vertA;

        void main(void) {
            gl_PointSize = 10.;
            gl_Position = vertA;
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        void main(void) {
            gl_FragColor = vec4(`+rStr+`,`+gStr+`,`+bStr+`,1.);
        }
        `

    const program = new Program(vsSource, fsSource)
    program.addVertexAttribute("vert", vertBuffer, 4, true)

    cameraAndFrameCountShaderStuff.locateUniforms(program)

    return function()
    {
        gl.useProgram(program.glProgram);

        cameraAndFrameCountShaderStuff.transfer(program)

        program.prepareVertexAttribute("vert", vertBuffer)

        gl.drawArrays(mode, 0, vertBuffer.length / 4);
    }
}

function verticesDisplayWithPosition(pointsBuffer, mode, r,g,b)
{
    if (pointsBuffer.length % 4 !== 0)
        console.error("needs to be 4vecs")

    r = r || 1.
    g = g || 0.
    b = b || 0.
    let rStr = r === Math.round(r) ? r.toString() + "." : r.toString()
    let gStr = g === Math.round(g) ? g.toString() + "." : g.toString()
    let bStr = b === Math.round(b) ? b.toString() + "." : b.toString()

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec4 pointA;
        uniform vec2 screenPosition;

        void main(void) {
            vec4 p = pointA;

            p.xy += screenPosition;

            gl_PointSize = 10.;

            gl_Position = p;
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        void main(void) {
            gl_FragColor = vec4(`+rStr+`,`+gStr+`,`+bStr+`,1.);
        }
        `

    const program = new Program(vsSource, fsSource)
    program.addVertexAttribute("point", pointsBuffer, 4, true)

    cameraAndFrameCountShaderStuff.locateUniforms(program)

    const screenPosition = new ScreenPosition()
    program.locateUniform("screenPosition")

    return {
        position: screenPosition,
        renderFunction: function ()
        {
            gl.useProgram(program.glProgram);

            cameraAndFrameCountShaderStuff.transfer(program)

            gl.uniform2f(program.getUniformLocation("screenPosition"), screenPosition.x, screenPosition.y);

            program.prepareVertexAttribute("point", pointsBuffer)

            gl.drawArrays(mode, 0, pointsBuffer.length / 4);
        }
    }
}