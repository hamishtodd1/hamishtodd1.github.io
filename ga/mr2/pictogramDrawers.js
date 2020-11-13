//they need a drawing method
//both for dw and for pictogramDrawer
//they probably all have a way to respond to the mouse too

function initPictogramDrawers() {

    initFrames()

    let vsHeader = shaderHeaderWithCameraAndFrameCount + `
        varying vec3 preBoxPosition;
        uniform vec2 screenPosition;

        uniform float boxRadius;
    `
    let vsFooter = `
        preBoxPosition = gl_Position.xyz;
        gl_Position.xyz *= boxRadius;
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

    {
        let testVs = `
            attribute vec4 vertA;

            void main(void) {
                gl_Position = vertA;
            `
        let testFs = `
            void main(void) {
                gl_FragColor = vec4(1.,0.,0.,1.);
            `
        let testPrebatch = () => {
            testPictogramDrawer.program.prepareVertexAttribute("vert", quadBuffer)
        }
        let testDraw = () => {
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        }
        let testPictogramDrawer = new PictogramDrawer(testVs, testFs, testPrebatch, testDraw)
        testPictogramDrawer.program.addVertexAttribute("vert", quadBuffer, 4, true)

        updateFunctions.push( () => {
            testPictogramDrawer.draw(.7, .7, "r")
        })
    }

    function PictogramDrawer(vsBody, fsBody, prebatch, draw) {
        pictogramDrawers.push(this)

        let vs = vsHeader + vsBody + vsFooter
        // logShader(vs)
        let fs = fsHeader + fsBody + fsFooter
        // logShader(fs)
        let program = Program(vs, fs)
        this.program = program
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.locateUniform("boxRadius")

        let numToDraw = 0
        let screenPositions = [] //Just screen position, if you want a quat put that in a wrapper
        this.draw = function (x, y, name) {
            screenPositions[numToDraw * 2 + 0] = x
            screenPositions[numToDraw * 2 + 1] = y

            if(name === undefined)
                addUnnamedFrameToDraw(x,y)
            else
                addNamedFrameToDraw(x, y, name)

            ++numToDraw
        }

        addRenderFunction(() => {
            gl.useProgram(program.glProgram);
            cameraAndFrameCountShaderStuff.transfer(program)
            gl.uniform1f(program.uniformLocations.boxRadius, .5)

            prebatch()

            for(let i = 0; i < numToDraw; ++i) {
                gl.uniform2f(program.uniformLocations.screenPosition, screenPositions[i * 2 + 0], screenPositions[i * 2 + 1])
                draw()
            }

            //and if it's in either of the display windows draw it
            //respond to mouse shiz elsewhere

            numToDraw = 0
        }, "end")
    }
}