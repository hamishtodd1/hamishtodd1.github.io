function initPictogramDrawers() {

    let vsHeader = shaderHeaderWithCameraAndFrameCount + `
        varying vec3 preBoxPosition;
        uniform vec2 screenPosition;

        uniform float drawingSquareRadius;
    `
    let vsFooter = `
        preBoxPosition = gl_Position.xyz;
        gl_Position.xyz *= drawingSquareRadius;
        gl_Position.xy += screenPosition;
    `
    + cameraAndFrameCountShaderStuff.footer

    let fsHeader = shaderHeaderWithCameraAndFrameCount + `
        varying vec3 preBoxPosition;
    `
    let fsFooter = `
        if( abs(preBoxPosition.x) > 1. || abs(preBoxPosition.y) > 1. || abs(preBoxPosition.z) > 1. )
            discard; //unperformant!
    }
    `

    PictogramDrawer = function (vsBody, fsBody, editingStyle) {
        pictogramDrawers.push(this)

        let vs = vsHeader + vsBody + vsFooter
        let fs = fsHeader + fsBody + fsFooter
        let program = Program(vs, fs)
        this.program = program
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.locateUniform("drawingSquareRadius")
        program.locateUniform("screenPosition")

        let numToDraw = 0
        let screenPositions = [] //Just screen position, if you want a quat put that in a wrapper
        let names = []
        this.add = function (x, y, name) {
            screenPositions[numToDraw * 2 + 0] = x
            screenPositions[numToDraw * 2 + 1] = y
            names[numToDraw] = name

            if (name === undefined)
                addUnnamedFrameToDraw(x, y)
            else
                addNamedFrameToDraw(x, y, name)

            if (mouse.inSquare(x, y, .5))
                mouseDw.placeBasedOnHover(x, y, editingStyle, name)

            ++numToDraw
        }

        //prebatch and useprogram come first
        this.transferAndDrawEach = (draw) => {
            cameraAndFrameCountShaderStuff.transfer(program)
            gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), .5)

            for (let i = 0; i < numToDraw; ++i) {
                gl.uniform2f(program.getUniformLocation("screenPosition"), screenPositions[i * 2 + 0], screenPositions[i * 2 + 1])
                draw(names[i])

                displayWindows.forEach((dw) => {
                    if (dw.verticalPositionToRenderFrom === screenPositions[i * 2 + 1]) {
                        gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), dw.dimension / 2.)
                        gl.uniform2f(program.getUniformLocation("screenPosition"), dw.position.x, dw.position.y)
                        draw(names[i])

                        gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), .5)
                    }
                })
            }

            numToDraw = 0
        }
    }

    initMvPictograms()
    // pictogramTest()
}

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

        var pointPictogramDrawer = new PictogramDrawer(vs, fs, mvEditingStyle)
        pointPictogramDrawer.program.addVertexAttribute("vert", vertBuffer, 4, false)
        pointPictogramDrawer.program.addVertexAttribute("colorIndex", pointColorIndexBuffer, 1, true)
        pointPictogramDrawer.program.locateUniform("hexantColors")
        pointPictogramDrawer.program.locateUniform("visualPosition")

        addRenderFunction(() => {
            gl.useProgram(pointPictogramDrawer.program.glProgram)

            pointPictogramDrawer.program.prepareVertexAttribute("vert", vertBuffer)

            pointPictogramDrawer.transferAndDrawEach((name) => {
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
            var vertsBuffer = new Float32Array(6 * 2 * 4)
            
            var indexBuffer = new Float32Array(6 * 2)
            for (let i = 0; i < 6; ++i) {
                indexBuffer[i * 2 + 0] = i
                indexBuffer[i * 2 + 1] = i
            }
            
            let planeByComponent = [planeX, planeY, planeZ]
            let pl = new Float32Array(16)
            let pt = new Float32Array(16)
            let endPoints = [new Float32Array(4), new Float32Array(4)]

            function updateVertsBuffer(mv)
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
        }

        var linePictogramDrawer = new PictogramDrawer(vs, fs, mvEditingStyle)
        linePictogramDrawer.program.addVertexAttribute("vert", vertsBuffer, 4, true)
        linePictogramDrawer.program.addVertexAttribute("colorIndex", indexBuffer, 1, false)
        linePictogramDrawer.program.locateUniform("hexantColors")

        addRenderFunction(()=>{
            gl.useProgram(linePictogramDrawer.program.glProgram)
            linePictogramDrawer.program.prepareVertexAttribute("colorIndex", indexBuffer)

            linePictogramDrawer.transferAndDrawEach((name) => {
                let mv = namedInstantiations[name]
                if ( realLineX(mv) === 0. && realLineY(mv) === 0. && realLineZ(mv) === 0. )
                    return

                updateVertsBuffer(mv)
                linePictogramDrawer.program.prepareVertexAttribute("vert", vertsBuffer)
                gl.uniform3fv(linePictogramDrawer.program.getUniformLocation("hexantColors"), nameToHexantColors(name, hexantColors))

                gl.drawArrays(gl.LINES, 0, vertsBuffer.length / 4)
            })
        },"end")
    }

    updateFunctions.push(() => {
        pointPictogramDrawer.add(-.7, -.7, "bgo")
        linePictogramDrawer.add(.7, .7, "r")
    })
}

function pictogramTest()
{
    let testVs = `
        attribute vec4 vertA;

        void main(void) {
            gl_Position = vertA;
        `
    let testFs = `
        uniform float g;

        void main(void) {
            gl_FragColor = vec4(1.,g,0.,1.);
        `

    let namedInstantiations = {
        "r": 0.
    }

    let testEditingStyle = {
        during: (positionInWindow, editingName) => {
            namedInstantiations[editingName] = Math.abs(positionInWindow.x)
        },
    }

    let testPictogramDrawer = new PictogramDrawer(testVs, testFs, testEditingStyle)
    testPictogramDrawer.program.addVertexAttribute("vert", quadBuffer, 4, true)
    testPictogramDrawer.program.locateUniform("g")

    updateFunctions.push(() => {
        testPictogramDrawer.add(.7, .7, "r")
    })

    addRenderFunction(()=>{
        gl.useProgram(testPictogramDrawer.program.glProgram)

        testPictogramDrawer.program.prepareVertexAttribute("vert", quadBuffer)

        testPictogramDrawer.transferAndDrawEach((name) => {
            gl.uniform1f(testPictogramDrawer.program.getUniformLocation("g"), namedInstantiations[name])
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        })
    },"end")
}