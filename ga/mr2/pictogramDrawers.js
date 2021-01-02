/*
    Other examples of things you'd want to define
        Adding and multiplying knots
            How would you construct this? You need an isomorphism from some string of symbols to knot pictures
        Adding and intersecting SDFs
        Superimposing / blending textures
        Angles with a from-the-x-axis convention
        solutions to PDEs
        zeroes of polynomials
*/

function initPictogramDrawers() {

    let vsHeader = cameraAndFrameCountShaderStuff.header + `
        varying vec2 preBoxPosition;
        uniform vec2 screenPosition;

        uniform float drawingSquareRadius;
        uniform float zAdditionForDw;
    `
    let vsFooter = `
        preBoxPosition = gl_Position.xy / gl_Position.w;
        gl_Position.xyz *= drawingSquareRadius;
        gl_Position.xy += screenPosition;
        gl_Position.z += -zAdditionForDw; //or +, one day
    `
    + cameraAndFrameCountShaderStuff.footer

    let fsHeader = cameraAndFrameCountShaderStuff.header + `
        varying vec2 preBoxPosition;
        uniform int clipSides;
    `
    let fsFooter = `
    
        if( clipSides == 1 && (abs(preBoxPosition.x) > 1. || abs(preBoxPosition.y) > 1. ) ) //|| abs(preBoxPosition.z) > 1.
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
        this.locateUniform("drawingSquareRadius")
        this.locateUniform("zAdditionForDw")
        this.locateUniform("clipSides")
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

                gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), .5)
                gl.uniform1f(program.getUniformLocation("zAdditionForDw"), 0.)
                gl.uniform1i(program.getUniformLocation("clipSides"), 1)
                gl.uniform2f(program.getUniformLocation("screenPosition"), screenPositions[i * 2 + 0], screenPositions[i * 2 + 1])
                draw(nameProperties,names[i])

                displayWindows.forEach((dw) => {
                    if (dw.verticalPositionToRenderFrom === screenPositions[i * 2 + 1]) {
                        gl.uniform1f(program.getUniformLocation("drawingSquareRadius"), dw.dimension * .5)

                        gl.uniform1f(program.getUniformLocation("zAdditionForDw"), dwOriginZ())
                        gl.uniform1i(program.getUniformLocation("clipSides"), 0)
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
    pictogramDrawer.program.addVertexAttribute("vert", quadBuffer, 4, true)
    pictogramDrawer.program.locateUniform("g")

    addRenderFunction(() => {
        gl.useProgram(pictogramDrawer.program.glProgram)
        pictogramDrawer.program.prepareVertexAttribute("vert", quadBuffer)

        pictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
            gl.uniform1f(pictogramDrawer.program.getUniformLocation("g"), nameProperties.value)
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        })
    })
}