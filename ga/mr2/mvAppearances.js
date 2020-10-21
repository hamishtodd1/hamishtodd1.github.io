/*
    The disc / non-disc representation animation would be nice to see too

    need to have "make your own visualizations" for the boxes soon
*/

function initMvAppearances() {
    let numToDraw = 0
    let screenPositions = []
    let names = []
    addMvToRender = function(name, x, y) {
        screenPositions[numToDraw*2+0] = x
        screenPositions[numToDraw*2+1] = y
        names[numToDraw] = name
        ++numToDraw
    }

    let hexantColors = new Float32Array(3 * 6)
    let mvsAlreadyDrawn = []
    function drawBladeBatch(drawFunc) {
        for (let i = 0; i < numToDraw; ++i)
            mvsAlreadyDrawn[i] = false
        for (let i = 0; i < numToDraw; ++i) {
            if (mvsAlreadyDrawn[i] === false) {
                for(let j = i; j < numToDraw; ++j) {
                    if( names[j] === names[i] ) {
                        drawFunc(j)
                        mvsAlreadyDrawn[j] = true
                    }
                }
            }
        }
    }

    //points
    {
        let radius = .035
        let radialDivisions = 18

        let circumferencePoints = []
        for (let i = 0; i < radialDivisions; ++i)
        {
            let angle = TAU * i / radialDivisions
            circumferencePoints.push([Math.cos(angle) * radius, Math.sin(angle) * radius])
        }

        var pointVertBuffer = new Float32Array(3 * 4 * radialDivisions)
        for (let i = 0; i < radialDivisions; ++i)
        {
            pointVertBuffer[i * 3 * 4 + 0] = 0.
            pointVertBuffer[i * 3 * 4 + 1] = 0.
            pointVertBuffer[i * 3 * 4 + 2] = 0.
            pointVertBuffer[i * 3 * 4 + 3] = 1.

            pointVertBuffer[i * 3 * 4 + 4] = circumferencePoints[i][0]
            pointVertBuffer[i * 3 * 4 + 5] = circumferencePoints[i][1]
            pointVertBuffer[i * 3 * 4 + 6] = 0.
            pointVertBuffer[i * 3 * 4 + 7] = 1.

            pointVertBuffer[i * 3 * 4 + 8] = circumferencePoints[(i + 1) % radialDivisions][0]
            pointVertBuffer[i * 3 * 4 + 9] = circumferencePoints[(i + 1) % radialDivisions][1]
            pointVertBuffer[i * 3 * 4 + 10] = 0.
            pointVertBuffer[i * 3 * 4 + 11] = 1.
        }

        var pointColorIndexBuffer = new Float32Array(pointVertBuffer.length / 4)
        for (let i = 0, il = pointColorIndexBuffer.length; i < il; ++i)
            pointColorIndexBuffer[i] = Math.floor(i / il * 6)

        const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
            attribute vec4 vertA;
            varying vec4 p;
            
            uniform vec4 elements;
            uniform vec2 screenPosition;

            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            void main(void) {
                color = hexantColors[int(colorIndexA)];

                p = vertA;
                p.xyz += elements.xyz; //hmm
                gl_Position = p;
                gl_Position.xy += screenPosition;
            `
            + cameraAndFrameCountShaderStuff.footer
        const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
            varying vec3 color;
            varying vec4 p;

            void main(void) {
                if( abs(p.x)<.5 && abs(p.y)<.5 )
                    gl_FragColor = vec4(color,1.);
                else
                    discard; //unperformant!
            }
            `

        let program = Program(vsSource, fsSource)
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.addVertexAttribute("vert", pointVertBuffer, 4, false)
        program.addVertexAttribute("colorIndex", pointColorIndexBuffer, 1, true)

        program.locateUniform("screenPosition")
        program.locateUniform("hexantColors")

        program.locateUniform("elements")

        var drawPoints = () =>{
            gl.useProgram(program.glProgram);
            cameraAndFrameCountShaderStuff.transfer(program)
            program.doSomethingWithVertexAttribute("vert", pointVertBuffer)
            program.doSomethingWithVertexAttribute("colorIndex", pointColorIndexBuffer)

            drawBladeBatch((index) => {
                let mv = namedMvs[names[index]]
                if (pointX(mv) !== 0. || pointY(mv) !== 0. || pointZ(mv) !== 0. || pointW(mv) !== 0.) {
                    gl.uniform3fv(program.uniformLocations.hexantColors, nameToHexantColors(names[index], hexantColors))
                    gl.uniform2f(program.uniformLocations.screenPosition, screenPositions[index * 2 + 0], screenPositions[index * 2 + 1])

                    gl.uniform4f(program.uniformLocations.elements, pointX(mv), pointY(mv), pointY(mv), pointW(mv))

                    //probably want a light in the corner of these boxes so you can get angle of plane
                    gl.drawArrays(gl.TRIANGLES, 0, pointVertBuffer.length / 4)
                }
            })
        }
    }

    //realLine
    {
        const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
            attribute vec4 vertA;
            
            //might be better to work out ends in here
            uniform vec2 screenPosition;

            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            void main(void) {
                color = hexantColors[int(colorIndexA)];
                
                gl_Position = vertA;
                gl_Position.xy += screenPosition;
            `
            + cameraAndFrameCountShaderStuff.footer
        const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
            varying vec3 color;

            void main(void) {
                // vec3 color = hexantColors[int(floor(alongness*6.))];
                // gl_FragColor = vec4(0.,0.,0.,1.);
                gl_FragColor = vec4(color,1.);
            }
            `

        let program = Program(vsSource, fsSource)
        cameraAndFrameCountShaderStuff.locateUniforms(program)
        program.locateUniform("screenPosition")

        let endPoints = [new Float32Array(4), new Float32Array(4)]
        let vertsBuffer = new Float32Array(6*2*4)
        program.addVertexAttribute("vert", vertsBuffer, 4, true)

        let indexBuffer = new Float32Array(6*2)
        program.addVertexAttribute("colorIndex", indexBuffer, 1, false)
        for(let i = 0; i < 6; ++i) {
            indexBuffer[i*2+0] = i
            indexBuffer[i*2+1] = i
        }

        program.locateUniform("hexantColors")

        let planeByComponent = [planeX, planeY, planeZ]
        let pl = new Float32Array(16)
        let pt = new Float32Array(16)

        var drawRealLines = () =>
        {
            gl.useProgram(program.glProgram);
            cameraAndFrameCountShaderStuff.transfer(program)

            drawBladeBatch( (index) => {
                let mv = namedMvs[names[index]]

                if (realLineX(mv) !== 0. || realLineY(mv) !== 0. || realLineZ(mv) !== 0.) {
                    let boxSize = .5
                    let whichEnd = 0
                    for (let i = 0; i < 3; ++i) {
                        for (j = -1.; j <= 1. && whichEnd < 2; j += 2.) {
                            zeroMv(pl)
                            planeW(pl, 1.)
                            planeByComponent[i](pl, 1. / (boxSize * j))
                            meet(pl, mv, pt)

                            if (pointW(pt) !== 0.) {
                                wNormalizePoint(pt)

                                if (-boxSize <= pointX(pt) && pointX(pt) <= boxSize &&
                                    -boxSize <= pointY(pt) && pointY(pt) <= boxSize &&
                                    -boxSize <= pointZ(pt) && pointZ(pt) <= boxSize
                                 ) {
                                    endPoints[whichEnd][0] = pointX(pt)
                                    endPoints[whichEnd][1] = pointY(pt)
                                    endPoints[whichEnd][2] = pointZ(pt)
                                    endPoints[whichEnd][3] = pointW(pt)
                                    ++whichEnd
                                }
                            }
                        }
                    }
                    for(let i = 0; i < 6; ++i) {
                        vertsBuffer[i*8+0] = lerp(endPoints[0][0],endPoints[1][0],i/6.)
                        vertsBuffer[i*8+1] = lerp(endPoints[0][1],endPoints[1][1],i/6.)
                        vertsBuffer[i*8+2] = lerp(endPoints[0][2],endPoints[1][2],i/6.)
                        vertsBuffer[i*8+3] = lerp(endPoints[0][3],endPoints[1][3],i/6.)

                        vertsBuffer[i*8+4] = lerp(endPoints[0][0],endPoints[1][0],(i+1.)/6.)
                        vertsBuffer[i*8+5] = lerp(endPoints[0][1],endPoints[1][1],(i+1.)/6.)
                        vertsBuffer[i*8+6] = lerp(endPoints[0][2],endPoints[1][2],(i+1.)/6.)
                        vertsBuffer[i*8+7] = lerp(endPoints[0][3],endPoints[1][3],(i+1.)/6.)
                    }
                    program.doSomethingWithVertexAttribute("vert", vertsBuffer)
                    program.doSomethingWithVertexAttribute("colorIndex", indexBuffer)

                    gl.uniform3fv(program.uniformLocations.hexantColors, nameToHexantColors(names[index], hexantColors))
                
                    gl.uniform2f(program.uniformLocations.screenPosition, screenPositions[index * 2 + 0], screenPositions[index * 2 + 1])
                    gl.drawArrays(gl.LINES, 0, vertsBuffer.length / 4)
                }
            })
        }
    }

    //plane
    {
        //circular thing, cut it off outside the box
        //light can be built into shader
        //pretty important for points and lines to be poking out of planes they are precisely in
    }

    addRenderFunction(() => {
        drawPoints()

        drawRealLines()

        numToDraw = 0
    })
}