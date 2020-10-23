function initDisplayWindows() {
    let dimension = 3.;

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec4 vertA;
        uniform vec2 screenPosition;

        const float dimension = `+ toGlslFloatLiteral(dimension) +`;

        void main(void) {
            gl_Position = vertA;
            gl_Position.xy *= dimension;
            gl_Position.xy += screenPosition;
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        void main(void) {
            gl_FragColor = vec4(.45,.45,.45,1.);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("vert", quadBuffer, 4, true)
    cameraAndFrameCountShaderStuff.locateUniforms(program)
    program.locateUniform("screenPosition")

    function drawDwBackground(x, y)
    {
        gl.useProgram(program.glProgram);

        cameraAndFrameCountShaderStuff.transfer(program)

        program.doSomethingWithVertexAttribute("vert", quadBuffer)

        gl.uniform2f(program.uniformLocations.screenPosition, x, y);

        gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
    }

    //------Mouse Dw
    function DisplayWindow() {
        this.position = new ScreenPosition()
        this.numMvs = 0
        this.mvNames = []
        this.slideOngoing = false

        let self = this
        let slideStartMv = new Float32Array(16)
        let slideCurrentMv = new Float32Array(16)
        let stringCurrentMv = new Float32Array(16)
        let mvToChangeTo = new Float32Array(16)
        mouseResponses.push({
            z: () => {
                if (self.numMvs > 0 && self.mouseIsInside())
                    return Infinity
            },
            start: () => {
                self.getPositionInWindow(slideStartMv)
                self.slideOngoing = true
            },
            end: () => {
                self.slideOngoing = false
            },
            during: () => {
                let literalStart = literalsPositionsInString[self.mvNames[0]]
                let literalLength = getLiteralLength(literalStart, namedMvs[name])

                parseMv(backgroundString.substr(literalStart, literalLength),stringCurrentMv)
                self.getPositionInWindow(slideCurrentMv)
                
                let grade = getGrade(stringCurrentMv)
                if ( grade === 3) {
                    backgroundStringSplice(literalStart, literalLength, mvToString(slideCurrentMv))
                }
                else if(grade === 2) {
                    // log(frameCount)
                    if (mvEquals(slideCurrentMv,slideStartMv)) {
                        let currentLineDotMousePosition = new Float32Array(16);
                        inner(stringCurrentMv,slideStartMv, currentLineDotMousePosition)
                        gp(currentLineDotMousePosition, slideStartMv, mvToChangeTo)
                        delete currentLineDotMousePosition
                    }
                    else
                        join(slideStartMv, slideCurrentMv, mvToChangeTo)

                    backgroundStringSplice(literalStart, literalLength, mvToString(mvToChangeTo))
                }
            }
        })
    }
    Object.assign( DisplayWindow.prototype, {
        render: function() {
            drawDwBackground(this.position.x, this.position.y)
            for (let i = 0; i < this.numMvs; ++i)
                addMvToRender(this.mvNames[i], this.position.x, this.position.y, dimension)
        },
        getPositionInWindow: function(target) {
            let x = (mouse.position.x - this.position.x) / dimension
            let y = (mouse.position.y - this.position.y) / dimension
            zeroMv(target)
            pointX(target, x)
            pointY(target, y)
            pointW(target, 1.)
        },
        mouseIsInside: function() {
            return mouse.inBounds(
                this.position.x - dimension/2.,
                this.position.x + dimension/2.,
                this.position.y + dimension/2.,
                this.position.y - dimension/2.)
        }
    })
    
    //-----Mouse dw
    let mouseDw = new DisplayWindow()
    boxHovered = (boxCenterX, boxCenterY, name) => {
        if (mouseDw.numMvs === 0) {
            mouseDw.position.x = boxCenterX - .5 + dimension / 2.
            mouseDw.position.y = boxCenterY + .5 - dimension / 2.

            mouseDw.mvNames[mouseDw.numMvs] = name
            ++mouseDw.numMvs
        }
    }
    addRenderFunction( () => {
        if (mouseDw.numMvs > 0)
            mouseDw.render()

        if (!mouseDw.mouseIsInside(mouseDw.position) && !mouseDw.slideOngoing)
            mouseDw.numMvs = 0
    })

    //-----Carat dw
    let caratDw = new DisplayWindow()
    updateFunctions.push(()=>{
        caratDw.position.x = mainCamera.rightAtZZero - dimension / 2. - .1
        caratDw.position.y = carat.position.y
    })
    addRenderFunction(()=>{
        caratDw.render()
    })
}