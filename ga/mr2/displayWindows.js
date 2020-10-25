function initDisplayWindows() {
    let dimension = 3.;

    {
        const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec4 vertA;
        uniform vec2 screenPosition;

        const float dimension = `+ toGlslFloatLiteral(dimension) + `;

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

        var drawBackground = function(x, y)
        {
            gl.useProgram(program.glProgram);

            cameraAndFrameCountShaderStuff.transfer(program)

            program.doSomethingWithVertexAttribute("vert", quadBuffer)

            gl.uniform2f(program.uniformLocations.screenPosition, x, y);

            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        }
    }

    function DisplayWindow() {
        this.position = new ScreenPosition(2000.,2000.)
        this.numMvs = 0
        this.mvNames = []
        this.slideOngoing = false
        this.lineToRenderMvsFrom = -1

        displayWindows.push(this)
    }
    Object.assign( DisplayWindow.prototype, {
        render: function() {
            drawBackground(this.position.x, this.position.y)
            
            for (let i = 0; i < this.numMvs; ++i)
                addMvToRender(this.mvNames[i], this.position.x, this.position.y, dimension, false)
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
        },
        addMv: function(name) {
            this.mvNames[this.numMvs] = name
            ++this.numMvs
        }
    })
    
    //-----Mouse dw
    mouseDw = new DisplayWindow()
    mouseDw.editingName = ""
    let visible = true
    mouseDw.respondToHover = (boxCenterX, boxCenterY, lineNumber, name) => {
        if (!visible) {
            mouseDw.position.x = boxCenterX - .5 + dimension / 2.
            mouseDw.position.y = boxCenterY + .5 - dimension / 2.

            mouseDw.lineToRenderMvsFrom = lineNumber
            mouseDw.editingName = name
        }
    }
    addRenderFunction( () => {
        visible = mouseDw.mouseIsInside(mouseDw.position) || mouseDw.slideOngoing

        if (visible )
            mouseDw.render()
        else {
            mouseDw.position.x = 2000.;
            mouseDw.lineToRenderMvsFrom = -1
        }
    })

    let slideStartMv = new Float32Array(16)
    let slideCurrentMv = new Float32Array(16)
    let stringCurrentMv = new Float32Array(16)
    let mvToChangeTo = new Float32Array(16)
    mouseResponses.push({
        z: () => {
            if (mouseDw.mouseIsInside())
                return Infinity
            else
                return -Infinity
        },
        start: () => {
            mouseDw.getPositionInWindow(slideStartMv)
            mouseDw.slideOngoing = true
        },
        end: () => {
            mouseDw.slideOngoing = false
        },
        during: () => {
            if (literalsPositionsInString[mouseDw.editingName] !== undefined) {
                let literalStart = literalsPositionsInString[mouseDw.editingName]
                let literalLength = getLiteralLength(literalStart)

                parseMv(backgroundString.substr(literalStart, literalLength), stringCurrentMv)
                mouseDw.getPositionInWindow(slideCurrentMv)

                let grade = getGrade(stringCurrentMv)
                if (grade === 3) {
                    backgroundStringSplice(literalStart, literalLength, mvToString(slideCurrentMv))
                }
                else if (grade === 2) {
                    // log(frameCount)
                    if (mvEquals(slideCurrentMv, slideStartMv)) {
                        let currentLineDotMousePosition = new Float32Array(16);
                        inner(stringCurrentMv, slideStartMv, currentLineDotMousePosition)
                        gp(currentLineDotMousePosition, slideStartMv, mvToChangeTo)
                        delete currentLineDotMousePosition
                    }
                    else
                        join(slideStartMv, slideCurrentMv, mvToChangeTo)

                    backgroundStringSplice(literalStart, literalLength, mvToString(mvToChangeTo))
                }
            }
        }
    })
    
    //-----Carat dw
    caratDw = new DisplayWindow()
    updateFunctions.push(()=>{
        caratDw.position.x = mainCamera.rightAtZZero - dimension / 2. - .1
        caratDw.position.y = carat.position.y - dimension / 2. + .5
    })
    addRenderFunction(()=>{
        caratDw.render()
        caratDw.numMvs = 0
    })
}