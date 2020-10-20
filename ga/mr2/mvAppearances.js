/*
    The disc / non-disc representation animation would be nice to see too
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

    //points
    {
        let radius = .035
        let radialDivisions = 18

        let circumferencePoints = []
        for(let i = 0; i < radialDivisions; ++i) {
            let angle = TAU * i/radialDivisions
            circumferencePoints.push([Math.cos(angle)*radius, Math.sin(angle)*radius])
        }

        var pointVertBuffer = new Float32Array(3 * 4 * radialDivisions)
        for(let i = 0; i < radialDivisions; ++i) {
            pointVertBuffer[i * 3 * 4 + 0] = 0.
            pointVertBuffer[i * 3 * 4 + 1] = 0.
            pointVertBuffer[i * 3 * 4 + 2] = 0.
            pointVertBuffer[i * 3 * 4 + 3] = 1.

            pointVertBuffer[i * 3 * 4 + 4] = circumferencePoints[i][0]
            pointVertBuffer[i * 3 * 4 + 5] = circumferencePoints[i][1]
            pointVertBuffer[i * 3 * 4 + 6] = 0.
            pointVertBuffer[i * 3 * 4 + 7] = 1.

            pointVertBuffer[i * 3 * 4 + 8] = circumferencePoints[(i+1)%radialDivisions][0]
            pointVertBuffer[i * 3 * 4 + 9] = circumferencePoints[(i+1)%radialDivisions][1]
            pointVertBuffer[i * 3 * 4 +10] = 0.
            pointVertBuffer[i * 3 * 4 +11] = 1.
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
                gl_FragColor = vec4(color,1.);
            }
            `

        var pointProgram = Program(vsSource, fsSource)
        cameraAndFrameCountShaderStuff.locateUniforms(pointProgram)

        pointProgram.addVertexAttribute("vert", pointVertBuffer, 4, false)
        pointProgram.addVertexAttribute("colorIndex", pointColorIndexBuffer, 1, true)

        pointProgram.locateUniform("screenPosition")
        pointProgram.locateUniform("hexantColors")

        pointProgram.locateUniform("elements")
    }
    
    let hexantColors = new Float32Array(3 * 6)
    let mvsAlreadyDrawn = []
    function drawBlades(drawFunc) {
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

    addRenderFunction(() => {
        //point
        {
            gl.useProgram(pointProgram.glProgram);
            cameraAndFrameCountShaderStuff.transfer(pointProgram)
            pointProgram.doSomethingWithVertexAttribute("vert", pointVertBuffer)
            pointProgram.doSomethingWithVertexAttribute("colorIndex", pointColorIndexBuffer)

            drawBlades((index) => {
                let mv = namedMvs[names[index]]
                if (pointX(mv) !== 0. || pointY(mv) !== 0. || pointZ(mv) !== 0. || pointW(mv) !== 0.) {
                    gl.uniform3fv(pointProgram.uniformLocations.hexantColors, nameToHexantColors(names[index], hexantColors))
                    gl.uniform2f(pointProgram.uniformLocations.screenPosition, screenPositions[index * 2 + 0], screenPositions[index * 2 + 1])

                    gl.uniform4f(pointProgram.uniformLocations.elements, pointX(mv), pointY(mv), pointY(mv), pointW(mv))

                    //probably want a light in the corner of these boxes so you can get angle of plane
                    gl.drawArrays(gl.TRIANGLES, 0, pointVertBuffer.length / 4)
                }
            })
        }

        numToDraw = 0
    })
}