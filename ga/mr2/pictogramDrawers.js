/*
    A rule to prevent z fighting: whatever is further along the line of code, that gets drawn on top

    People need to make their own pictograms, maybe with an external tool

    Redesign: The right way to do all of this is a single gl program
        Run this idea by someone else
        You load in the state of every single javascript-side multivector
        Ok but what about attributes
            You might not be putting anything serious in the attributes?
            The assumption we're going on is that the only attributes you need might be samples from interval or I2
        It will surely increase compile time to have everything recompiled. On the other hand, you're recompiling the rest all the time too
        compile time flags in glsl could help
        Maybe no pictograms at all between starting typing and... what's a signal you're done, arrow keys maybe? Leaving the line?

    You kinda want to have eg points. But that doesn't sit perfectly with the rest

    The compile minimizing design plan:
        when you start hitting the keyboard, we don't compile until you've gone for more than .5 seconds without hitting another key
        If there's compiler errors, nothing is changed. Values aren't changed anywhere, gl programs aren't recompiled anywhere
*/

function initPictogramDrawers() {
    let vsHeader = cameraAndFrameCountShaderStuff.header + `
        varying vec2 preBoxPosition;
        uniform vec2 screenPosition;

        uniform float uniformScale;
        uniform float zAdditionForDw;
    `
    let vsFooter = `
        gl_Position.xyz *= uniformScale;
        preBoxPosition = gl_Position.xy / gl_Position.w;
        gl_Position.xy += screenPosition;
        gl_Position.z += -zAdditionForDw; //or +, one day
    `
    + cameraAndFrameCountShaderStuff.footer

    let fsHeader = cameraAndFrameCountShaderStuff.header + `
        varying vec2 preBoxPosition;
        uniform float clipBoxRadius;
    `
    let fsFooter = `    
        if( (abs(preBoxPosition.x) > clipBoxRadius || abs(preBoxPosition.y) > clipBoxRadius ) ) //|| abs(preBoxPosition.z) > clipBoxRadius
            discard; //unperformant!
    }
    `
    //it's bound by [-1,1]

    vertexShaderToPictogramVertexShader = (vsBody) => {
        return vsHeader + vsBody + vsFooter
    }

    PictogramProgram = function(vsBody,fsBody) {
        let vs = vertexShaderToPictogramVertexShader(vsBody)
        let fs = fsHeader + fsBody + fsFooter

        Program.call(this, vs, fs)

        cameraAndFrameCountShaderStuff.locateUniforms(this)
        this.locateUniform("uniformScale")
        this.locateUniform("zAdditionForDw")
        this.locateUniform("clipBoxRadius")
        this.locateUniform("screenPosition")
    }

    PictogramDrawer = function (vsBody, fsBody) {
        let numToDraw = 0
        let screenPositions = [] //Just screen position, if you want a quat put that in a wrapper
        let names = []
        this.add = function (x, y, name) {
            screenPositions[numToDraw * 2 + 0] = x
            screenPositions[numToDraw * 2 + 1] = y
            names[numToDraw] = name

            ++numToDraw
        }

        this.drawEach = function(predrawAndReturnProgram,draw) {
            for (let i = 0; i < numToDraw; ++i) {
                let nameProperties = getNameDrawerProperties(names[i])

                let program = predrawAndReturnProgram(nameProperties)

                cameraAndFrameCountShaderStuff.transfer(program)

                if (MODE !== PRESENTATION_MODE) {
                    gl.uniform1f(program.getUniformLocation("uniformScale"), .5 / RADIUS_IN_BOX)
                    gl.uniform1f(program.getUniformLocation("zAdditionForDw"), 0.)
                    gl.uniform1f(program.getUniformLocation("clipBoxRadius"), .5)
                    gl.uniform2f(program.getUniformLocation("screenPosition"), screenPositions[i * 2 + 0], screenPositions[i * 2 + 1])
                    draw(nameProperties, names[i])
                }

                displayWindows.forEach((dw) => {
                    if (dw.collectionY === screenPositions[i * 2 + 1]) {
                        gl.uniform1f(program.getUniformLocation("uniformScale"), dw.dimension * .5 / RADIUS_IN_BOX)

                        gl.uniform1f(program.getUniformLocation("zAdditionForDw"), dwOriginZ())
                        const overflowMultiple = 2.
                        gl.uniform1f(program.getUniformLocation("clipBoxRadius"), .5 * dw.dimension * overflowMultiple)
                        gl.uniform2f(program.getUniformLocation("screenPosition"), dw.position.x, dw.position.y)
                        draw(nameProperties,names[i])
                    }
                })
            }

            numToDraw = 0
        }

        //prebatch and useprogram come first
        if (fsBody !== undefined) {
            this.program = new PictogramProgram(vsBody, fsBody)

            this.finishPrebatchAndDrawEach = (draw) => {
                this.drawEach(() => { return this.program},draw)
            }
        }
    }

    pictogramTest()

    initAnglePictograms()
    initSliderPictograms()
}

function pictogramTest() {
    let vs = `
        attribute vec4 vertA;

        void main(void) {
            gl_Position = vertA;
        `
    let fs = `
        uniform float g;

        void main(void) {
            gl_FragColor = vec4(1.,g,0.,1.);
        `

    let testEditingStyle = {
        during: (name, x, y) => {
            getNameDrawerProperties(name).value = Math.abs(x)
        },
    }

    let pictogramDrawer = new PictogramDrawer(vs, fs)
    addType("test", pictogramDrawer, testEditingStyle)
    pictogramDrawer.program.addVertexAttribute("vert", 4, quadBuffer)
    pictogramDrawer.program.locateUniform("g")

    addRenderFunction(() => {
        gl.useProgram(pictogramDrawer.program.glProgram)
        pictogramDrawer.program.prepareVertexAttribute("vert")

        pictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
            gl.uniform1f(pictogramDrawer.program.getUniformLocation("g"), nameProperties.value)
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        })
    })
}