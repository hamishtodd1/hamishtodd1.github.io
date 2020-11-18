/*
    Other examples of things you'd want to define
        Adding and multiplying knots
            How would you construct this? You need an isomorphism from some string of symbols to knot pictures
        Adding and intersecting SDFs
        Superimposing / blending textures


    Scalars appearance is context-dependent, sometimes a length, sometimes an area
    Maybe text really is the right representation. Allows exponential scaling, has innate unit, has minus

    The disc / non-disc representation animation would be nice to see too

    need to have "make your own visualizations" for the boxes soon

    Color
        Want to click and select a color, just like with a vector
        As with normal points, can visualize space as plane or disc. Disc gets you hue circle
*/

function initMvPictograms() {

    let namedInstantiations = {
        "bgo": new Float32Array(16),
        "r": new Float32Array(16)
    }
    pointX(namedInstantiations["bgo"], .5);
    realLineX(namedInstantiations["r"], .5);
    let hexantColors = new Float32Array(3 * 6)

    let slideStartMv = new Float32Array(16)
    let slideCurrentMv = new Float32Array(16)
    var mvEditingStyle = {
        start: (editingName, x, y) => {
            point(slideStartMv, x, y, 0., 1.)
        },
        during: (editingName, x, y) => {
            point(slideCurrentMv, x, y, 0., 1.)

            let grade = getGrade(namedInstantiations[editingName])
            if (grade === 3)
                assign(slideCurrentMv, namedInstantiations[editingName])
            else if (grade === 2) {
                if (mvEquals(slideCurrentMv, slideStartMv)) {
                    let currentLineDotMousePosition = new Float32Array(16);
                    inner(namedInstantiations[editingName], slideStartMv, currentLineDotMousePosition)
                    gp(currentLineDotMousePosition, slideStartMv, namedInstantiations[editingName])
                    delete currentLineDotMousePosition
                }
                else
                    join(slideStartMv, slideCurrentMv, namedInstantiations[editingName])
            }
        },
    }

    //point
    {
        //buffers
        {
            let radius = .055
            let radialDivisions = 18
            var vertBuffer = vertBufferFunctions.disc(radius, radialDivisions)

            var pointColorIndexBuffer = new Float32Array(vertBuffer.length / 4)
            for (let i = 0, il = pointColorIndexBuffer.length; i < il; ++i)
                pointColorIndexBuffer[i] = Math.floor(i / il * 6)
        }

        let vs = `
            attribute vec4 vertA;
            uniform vec4 visualPosition;

            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            void main(void) {
                color = hexantColors[int(colorIndexA)];
                gl_Position = vec4( visualPosition.xyz + vertA.xyz, 1.);
        `
        let fs = `
            varying vec3 color;
            void main(void) {
                gl_FragColor = vec4(color,1.);
        `

        var pointPictogramDrawer = new PictogramDrawer(mvEditingStyle, vs, fs)
        pointPictogramDrawer.program.addVertexAttribute("vert", vertBuffer, 4, false)
        pointPictogramDrawer.program.addVertexAttribute("colorIndex", pointColorIndexBuffer, 1, true)
        pointPictogramDrawer.program.locateUniform("hexantColors")
        pointPictogramDrawer.program.locateUniform("visualPosition")

        addRenderFunction(() => {
            gl.useProgram(pointPictogramDrawer.program.glProgram)

            pointPictogramDrawer.program.prepareVertexAttribute("vert", vertBuffer)

            pointPictogramDrawer.finishPrebatchAndDrawEach((name) => {
                let mv = namedInstantiations[name]
                if (pointX(mv) === 0. && pointY(mv) === 0. && pointZ(mv) === 0. && pointW(mv) === 0.)
                    return

                pointPictogramDrawer.program.prepareVertexAttribute("colorIndex", pointColorIndexBuffer)
                gl.uniform3fv(pointPictogramDrawer.program.getUniformLocation("hexantColors"), nameToHexantColors(name, hexantColors))
                gl.uniform4f(pointPictogramDrawer.program.getUniformLocation("visualPosition"), pointX(mv), pointY(mv), pointZ(mv), pointW(mv))
                gl.drawArrays(gl.TRIANGLES, 0, vertBuffer.length / 4)
            })
        }, "end")
    }

    //line, both real and ideal apparently?
    {
        const vs = `
            attribute vec4 vertA;
            
            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            void main(void) {
                color = hexantColors[int(colorIndexA)];
                gl_Position = vertA;
            `
        const fs = `
            varying vec3 color;
            void main(void) {
                gl_FragColor = vec4(color,1.);
            `

        {
            var indexBuffer = new Float32Array(6 * 2)
            for (let i = 0; i < 6; ++i) {
                indexBuffer[i * 2 + 0] = i
                indexBuffer[i * 2 + 1] = i
            }

            var planeByComponent = [planeX, planeY, planeZ]
            var pl = new Float32Array(16)
            var pt = new Float32Array(16)
            var endPoints = [new Float32Array(4), new Float32Array(4)]
            var vertsBuffer = new Float32Array(6 * 2 * 4)
        }

        var linePictogramDrawer = new PictogramDrawer(mvEditingStyle, vs, fs)
        linePictogramDrawer.program.addVertexAttribute("vert", vertsBuffer, 4, true)
        linePictogramDrawer.program.addVertexAttribute("colorIndex", indexBuffer, 1, false)
        linePictogramDrawer.program.locateUniform("hexantColors")

        addRenderFunction(() => {
            gl.useProgram(linePictogramDrawer.program.glProgram)
            linePictogramDrawer.program.prepareVertexAttribute("colorIndex", indexBuffer)

            linePictogramDrawer.finishPrebatchAndDrawEach((name) => {
                let mv = namedInstantiations[name]
                if (realLineX(mv) === 0. && realLineY(mv) === 0. && realLineZ(mv) === 0.)
                    return

                //update buffer
                {
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
                    for (let i = 0; i < 6; ++i) {
                        for (let j = 0; j < 8; ++j)
                            vertsBuffer[i * 8 + j] = lerp(endPoints[0][j % 4], endPoints[1][j % 4], (i + (j < 4 ? 0. : 1.)) / 6.)
                    }
                }
                linePictogramDrawer.program.prepareVertexAttribute("vert", vertsBuffer)
                gl.uniform3fv(linePictogramDrawer.program.getUniformLocation("hexantColors"), nameToHexantColors(name, hexantColors))

                gl.drawArrays(gl.LINES, 0, vertsBuffer.length / 4)
            })
        }, "end")
    }

    //plane
    if (0) {
        //circular thing, cut it off outside the box
        //maybe target-like
        //light can be built into shader
        //pretty important for points and lines to be poking out of planes they are precisely in

        const vsSource = shaderHeaderWithCameraAndFrameCount + gaShaderString + `
            attribute vec4 vertA;
            varying vec4 p;

            void main(void) {
                p = vertA;

                gl_Position = p;
            ` + cameraAndFrameCountShaderStuff.footer
        const fsSource = shaderHeaderWithCameraAndFrameCount + gaShaderString + `
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

        const program = new Program(vsSource, fsSource)
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.addVertexAttribute("vert", quadBuffer, 4, true)

        program.locateUniform("elements")

        addRenderFunction(() => {
            gl.useProgram(program.glProgram);

            cameraAndFrameCountShaderStuff.transfer(program)

            program.prepareVertexAttribute("vert")

            gl.uniform4f(program.getUniformLocation("elements"), planeX(mv), planeY(mv), planeY(mv), planeW(mv))

            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4);
        })
    }

    updateFunctions.push(() => {
        pointPictogramDrawer.add(-.5, -1.5, "bgo")
        linePictogramDrawer.add(.5, -2.5, "r")
    })
}