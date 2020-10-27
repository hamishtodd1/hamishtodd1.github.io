/*
    Scalar

    The disc / non-disc representation animation would be nice to see too

    need to have "make your own visualizations" for the boxes soon

    Color
        Want to click and select a color, just like with a vector
        As with normal points, can visualize space as plane or disc. Disc gets you hue circle
*/

function initMvAppearances() {
    let numToDraw = 0
    let screenPositions = []
    let spaceScales = []
    let names = []
    addMvToRender = function(name, x, y, containingBoxRadius, addFrame) {
        screenPositions[numToDraw*2+0] = x
        screenPositions[numToDraw*2+1] = y
        names[numToDraw] = name
        spaceScales[numToDraw] = containingBoxRadius

        if(addFrame)
            addFrameToDraw(x, y, name)
            
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
        let radius = .055
        let radialDivisions = 18
        let vertBuffer = vertBufferFunctions.disc(radius, radialDivisions)

        var pointColorIndexBuffer = new Float32Array(vertBuffer.length / 4)
        for (let i = 0, il = pointColorIndexBuffer.length; i < il; ++i)
            pointColorIndexBuffer[i] = Math.floor(i / il * 6)

        const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + gaShaderString + `
            attribute vec4 vertA;
            varying vec4 p;
            
            uniform vec4 visualPosition;
            uniform vec2 screenPosition;

            uniform float spaceScale;

            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;
            
            uniform float visualizeColor;

            void main(void) {
                color = hexantColors[int(colorIndexA)];

                p = vertA;

                vec3 actualPosition = visualPosition.xyz;

                p.xyz += actualPosition * spaceScale; //hmm
                gl_Position = p;
                gl_Position.xy += screenPosition;
            `
            + cameraAndFrameCountShaderStuff.footer
            // logShader(vsSource)
        const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
            varying vec3 color;
            varying vec4 p;

            uniform vec4 visualPosition;
            uniform float spaceScale;

            uniform float visualizeColor;

            void main(void) {
                if(visualizeColor == 0.) {
                    if( abs(p.x)<spaceScale && abs(p.y)<spaceScale )
                        gl_FragColor = vec4(color,1.);
                    else
                        discard; //unperformant!
                }
                else {
                    float hue = .5 + .5 * atan(visualPosition.y,visualPosition.x) / PI;

                    ` + hueToFragColorChunk + `

                    // gl_FragColor.rgb *= length(visualPosition.xy) * 2.;
                }
            }
            `

        let program = Program(vsSource, fsSource)
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.addVertexAttribute("vert", vertBuffer, 4, false)
        program.addVertexAttribute("colorIndex", pointColorIndexBuffer, 1, true)

        program.locateUniform("screenPosition")
        program.locateUniform("hexantColors")

        program.locateUniform("spaceScale")

        program.locateUniform("visualizeColor")

        program.locateUniform("visualPosition")

        let discPosition = new Float32Array(16)
        var drawPoints = () => {
            gl.useProgram(program.glProgram);
            cameraAndFrameCountShaderStuff.transfer(program)
            program.doSomethingWithVertexAttribute("vert", vertBuffer)
            program.doSomethingWithVertexAttribute("colorIndex", pointColorIndexBuffer)

            drawBladeBatch((index) => {
                let mv = namedMvs[names[index]]
                if (pointX(mv) !== 0. || pointY(mv) !== 0. || pointZ(mv) !== 0. || pointW(mv) !== 0.) {
                    gl.uniform3fv(program.uniformLocations.hexantColors, nameToHexantColors(names[index], hexantColors))
                    gl.uniform2f(program.uniformLocations.screenPosition, screenPositions[index * 2 + 0], screenPositions[index * 2 + 1])

                    gl.uniform1f(program.uniformLocations.spaceScale, spaceScales[index])

                    if ( colorPointValues[names[index]]) {
                        planeToBall(mv, discPosition)
                        gl.uniform4f(program.uniformLocations.visualPosition, pointX(discPosition) / pointW(discPosition), pointY(discPosition) / pointW(discPosition), pointZ(discPosition) / pointW(discPosition), 1.)
                        gl.uniform1f(program.uniformLocations.visualizeColor, 1.)
                    }
                    else {
                        //so ideal points just look like points
                        gl.uniform4f(program.uniformLocations.visualPosition, pointX(mv), pointY(mv), pointZ(mv), pointW(mv))
                        gl.uniform1f(program.uniformLocations.visualizeColor, 0.)
                    }

                    //probably want a light in the corner of these boxes so you can get angle of plane
                    gl.drawArrays(gl.TRIANGLES, 0, vertBuffer.length / 4)
                }
            })
        }
    }

    //line, both real and ideal apparently
    {
        const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
            attribute vec4 vertA;
            
            //might be better to work out ends in here
            uniform vec2 screenPosition;

            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            uniform float spaceScale;

            void main(void) {
                color = hexantColors[int(colorIndexA)];
                
                gl_Position = vertA;
                gl_Position.xyz *= spaceScale;
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

        program.locateUniform("spaceScale")

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
                    let boxRadius = 1.
                    let whichEnd = 0
                    for (let i = 0; i < 3; ++i) {
                        for (j = -1.; j <= 1. && whichEnd < 2; j += 2.) {
                            zeroMv(pl)
                            planeW(pl, 1.)
                            planeByComponent[i](pl, 1. / (boxRadius * j))
                            meet(pl, mv, pt)

                            if (pointW(pt) !== 0.) {
                                wNormalizePoint(pt)

                                if (-boxRadius <= pointX(pt) && pointX(pt) <= boxRadius &&
                                    -boxRadius <= pointY(pt) && pointY(pt) <= boxRadius &&
                                    -boxRadius <= pointZ(pt) && pointZ(pt) <= boxRadius
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

                    gl.uniform1f(program.uniformLocations.spaceScale, spaceScales[index])
                
                    gl.uniform2f(program.uniformLocations.screenPosition, screenPositions[index * 2 + 0], screenPositions[index * 2 + 1])
                    gl.drawArrays(gl.LINES, 0, vertsBuffer.length / 4)
                }
            })
        }
    }

    //plane
    if(0)
    {
        //circular thing, cut it off outside the box
        //light can be built into shader
        //pretty important for points and lines to be poking out of planes they are precisely in

        const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + gaShaderString + `
            attribute vec4 vertA;
            varying vec4 p;

            void main(void) {
                p = vertA;

                gl_Position = p;
            ` + cameraAndFrameCountShaderStuff.footer
        const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + gaShaderString + `
            varying vec4 p;

            uniform vec4 elements;

            void main(void) {
                //we make a line through this ray
                zeroMv(mv0); //plane
                mv0[1] = elements.w;
                mv0[2] = elements.x;
                mv0[3] = elements.y;
                mv0[4] = elements.z;

                meet(viewLine,mv0,mv1);
                vec4 rayPlaneIntersection;
                mvToPoint(mv1,rayPlaneIntersection);
                if( rayPlaneIntersection.w != 0. && abs(rayPlaneIntersection.z)<.5) {
                    gl_FragColor = vec4(1.,0.,0.,1.);
                    //and write to the depth buffer urgh
                }
                else
                    discard;
            }
        `

        const program = Program(vsSource, fsSource)
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.addVertexAttribute("vert", quadBuffer, 4, true)

        program.locateUniform("elements")

        addRenderFunction( ()=>
        {
            gl.useProgram(program.glProgram);

            cameraAndFrameCountShaderStuff.transfer(program)

            program.doSomethingWithVertexAttribute("vert")

            gl.uniform4f(program.uniformLocations.elements, planeX(mv), planeY(mv), planeY(mv), planeW(mv))

            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4);
        })
    }

    addRenderFunction(() => {
        drawPoints()

        drawRealLines()

        numToDraw = 0
    },"end")
}