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
        if( abs(preBoxPosition.x) > .5 || abs(preBoxPosition.y) > .5 || abs(preBoxPosition.z) > .5 )
            discard; //unperformant!
    }
    `

    let mouseDwEditingName = ""

    PictogramDrawer = function(vsBody, fsBody, prebatch, draw, editingStyle) {
        pictogramDrawers.push(this)

        let vs = vsHeader + vsBody + vsFooter
        // logShader(vs)
        let fs = fsHeader + fsBody + fsFooter
        // logShader(fs)
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

            // if(name === undefined)
                addUnnamedFrameToDraw(x, y)
            // else
            //     addNamedFrameToDraw(x, y, name)

            if (mouse.inSquare(x, y, .5))
                mouseDw.placeBasedOnHover(x, y, editingStyle, name)

            ++numToDraw
        }

        addRenderFunction(() => {
            gl.useProgram(program.glProgram);
            cameraAndFrameCountShaderStuff.transfer(program)
            gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), .5)

            prebatch()

            for(let i = 0; i < numToDraw; ++i) {
                gl.uniform2f(program.getUniformLocation("screenPosition"), screenPositions[i * 2 + 0], screenPositions[i * 2 + 1])
                draw(names[i])

                displayWindows.forEach((dw)=>{
                    if (dw.verticalPositionToRenderFrom === screenPositions[i * 2 + 1]) {
                        gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), dw.dimension / 2.)
                        gl.uniform2f(program.getUniformLocation("screenPosition"), dw.position.x,dw.position.y)
                        draw(names[i])

                        gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), .5)
                    }
                })
            }

            //and if it's in either of the display windows draw it
            //respond to mouse shiz elsewhere

            numToDraw = 0
        }, "end")
    }

    pictogramTest()
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
        "ourName": 0.
    }

    let testPrebatch = () => {
        testPictogramDrawer.program.prepareVertexAttribute("vert", quadBuffer)
    }
    let testDraw = (name) => {
        gl.uniform1f(testPictogramDrawer.program.getUniformLocation("g"), namedInstantiations[name])
        gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
    }
    let testEditingStyle = {
        during: (positionInWindow, editingName) => {
            namedInstantiations[editingName] = Math.abs(positionInWindow.x)
        },
    }

    let testPictogramDrawer = new PictogramDrawer(testVs, testFs, testPrebatch, testDraw, testEditingStyle)
    testPictogramDrawer.program.addVertexAttribute("vert", quadBuffer, 4, true)
    testPictogramDrawer.program.locateUniform("g")

    updateFunctions.push(() => {
        testPictogramDrawer.add(.7, .7, "ourName")
    })
}