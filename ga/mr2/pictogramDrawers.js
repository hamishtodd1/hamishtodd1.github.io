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
    //it's bound by [-1,1]

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

            addUnnamedFrameToDraw(x, y)
            // if (name === undefined)
            // else
            //     addNamedFrameToDraw(x, y, name)

            if (mouse.inSquare(x, y, .5))
                mouseDw.placeBasedOnHover(x, y, editingStyle, name)

            ++numToDraw
        }

        //prebatch and useprogram come first
        this.prebatchAndDrawEach = (draw) => {
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
        "r": 0.
    }

    let testEditingStyle = {
        during: (editingName,x,y) => {
            namedInstantiations[editingName] = Math.abs(x)
        },
    }

    let testPictogramDrawer = new PictogramDrawer(testVs, testFs, testEditingStyle)
    testPictogramDrawer.program.addVertexAttribute("vert", quadBuffer, 4, true)
    testPictogramDrawer.program.locateUniform("g")

    addRenderFunction(()=>{
        gl.useProgram(testPictogramDrawer.program.glProgram)
        testPictogramDrawer.program.prepareVertexAttribute("vert", quadBuffer)

        testPictogramDrawer.prebatchAndDrawEach((name) => {
            gl.uniform1f(testPictogramDrawer.program.getUniformLocation("g"), namedInstantiations[name])
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        })
    },"end")

    updateFunctions.push(() => {
        testPictogramDrawer.add(.5, -.5, "r")
    })
}