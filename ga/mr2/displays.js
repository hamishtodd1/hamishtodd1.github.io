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

async function verticesDisplay(pointsBuffer, mode)
{
    if (pointsBuffer.length % 4 !== 0)
        console.error("needs to be 4vecs")

    const vsSource = shaderHeader + `
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
    const fsSource = shaderHeader + `
        void main(void) {
            gl_FragColor = vec4(1.,0.,0.,1.);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("point", pointsBuffer, 4, true)

    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")

    renderFunctions.push(() =>
    {
        gl.useProgram(program.glProgram);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);

        program.enableVertexAttribute("point", pointsBuffer)

        gl.drawArrays(mode, 0, pointsBuffer.length / 4);
    })
}