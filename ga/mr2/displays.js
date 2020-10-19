function lineDisplay(line)
{
    let plane = new Float32Array(16)

    let p = new Float32Array(16)

    let endPoints = [new Float32Array(16), new Float32Array(16)]
    let endPointsBuffer = new Float32Array(2 * 4)
    verticesDisplay(endPointsBuffer, gl.LINES)

    let planeByComponent = [planeX, planeY, planeZ]

    updateFunctions.push(() =>
    {
        let boxSize = 1000.
        let endPointIndex = 0
        for (let i = 0; i < 3; ++i)
        {
            for (j = -1.; j <= 1. && endPointIndex < 2; j += 2.)
            {
                zeroMv(plane)
                planeW(plane, 1.)
                planeByComponent[i](plane, 1. / (boxSize * j))
                meet(plane, line, p)

                if (pointW(p) !== 0.)
                {
                    wNormalizePoint(p)

                    if (-boxSize <= pointX(p) && pointX(p) <= boxSize &&
                        -boxSize <= pointY(p) && pointY(p) <= boxSize &&
                        -boxSize <= pointZ(p) && pointZ(p) <= boxSize)
                    {
                        copyMv(p, endPoints[endPointIndex])
                        ++endPointIndex
                    }
                }
            }
        }
        mvArrayToPointsBuffer(endPoints, endPointsBuffer)
    })
}

function verticesDisplay(pointsBuffer, mode)
{
    if (pointsBuffer.length % 4 !== 0)
        console.error("needs to be 4vecs")

    const vsSource = shaderHeaderWithCameraAndFrameCount + `
        attribute vec4 pointA;

        void main(void) {
            vec4 p = pointA;

            //camera, "just" squashing so it goes on screen
            p.x /= rightAtZZero;
            p.y /= topAtZZero;
            p.z /= frontAndBackZ;

            gl_Position = p;
            gl_PointSize = 10.;
        }
        `
    const fsSource = shaderHeaderWithCameraAndFrameCount + `
        void main(void) {
            gl_FragColor = vec4(1.,1.,1.,1.);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("point", pointsBuffer, 4, true)

    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")

    return function()
    {
        gl.useProgram(program.glProgram);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);

        program.doSomethingWithVertexAttribute("point", pointsBuffer)

        gl.drawArrays(mode, 0, pointsBuffer.length / 4);
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

    const screenPosition = new ScreenPosition()

    const vsSource = shaderHeaderWithCameraAndFrameCount + `
        attribute vec4 pointA;
        uniform vec2 screenPosition;

        void main(void) {
            vec4 p = pointA;

            p.xy += screenPosition;

            //camera, "just" squashing so it goes on screen
            p.x /= rightAtZZero;
            p.y /= topAtZZero;
            p.z /= frontAndBackZ;

            gl_Position = p;
            gl_PointSize = 10.;
        }
        `
    const fsSource = shaderHeaderWithCameraAndFrameCount + `
        void main(void) {
            gl_FragColor = vec4(`+rStr+`,`+gStr+`,`+bStr+`,1.);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("point", pointsBuffer, 4, true)

    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")
    program.locateUniform("screenPosition")

    return {
        position: screenPosition,
        renderFunction: function ()
        {
            gl.useProgram(program.glProgram);

            gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
            gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
            gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);

            gl.uniform2f(program.uniformLocations.screenPosition, screenPosition.x, screenPosition.y);

            program.doSomethingWithVertexAttribute("point", pointsBuffer)

            gl.drawArrays(mode, 0, pointsBuffer.length / 4);
        }
    }
}