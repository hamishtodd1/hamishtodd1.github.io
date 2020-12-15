/* Would be good to go back to that thing where you are in point-creating mode or line-creating mode
 * 
 */

function initDisplayWindows() {
    let dimension = 3.;

    {
        const vsSource = 
            shaderHeaderWithCameraAndFrameCount + `
            attribute vec4 vertA;
            uniform vec2 screenPosition;

            void main(void) {
                gl_Position = vertA;
                gl_Position.xy *= `+ toGlslFloatLiteral(dimension) + `;
                gl_Position.xy += screenPosition;
                gl_Position.z = -3.; //or 3.
            `
            + cameraAndFrameCountShaderStuff.footer
        const fsSource = 
            shaderHeaderWithCameraAndFrameCount + `
            void main(void) {
                gl_FragColor = vec4(.45,.45,.45,1.);
            }
            `

        var program = new Program(vsSource, fsSource)
        program.addVertexAttribute("vert", quadBuffer, 4, true)
        cameraAndFrameCountShaderStuff.locateUniforms(program)
        program.locateUniform("screenPosition")
    }

    function DisplayWindow() {
        this.position = new ScreenPosition(2000.,2000.)
        this.numMvs = 0
        this.dimension = dimension
        this.mvNames = []
        this.slideOngoing = false
        this.verticalPositionToRenderFrom = Infinity

        displayWindows.push(this)
    }
    Object.assign( DisplayWindow.prototype, {
        render: function() {
            gl.useProgram(program.glProgram)
            cameraAndFrameCountShaderStuff.transfer(program)
            program.prepareVertexAttribute("vert", quadBuffer)
            gl.uniform2f(program.getUniformLocation("screenPosition"), this.position.x, this.position.y);
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)

            for (let i = 0; i < this.numMvs; ++i)
                addMvToRender(this.mvNames[i], this.position.x, this.position.y, dimension / 2., false)
        },
        getPositionInWindow: function(target) {
            target.x = (mouse.position.x - this.position.x) / (dimension / 2.)
            target.y = (mouse.position.y - this.position.y) / (dimension / 2.)
        },
        mouseIsInside: function() {
            return mouse.inBounds(
                this.position.x - dimension/2.,
                this.position.x + dimension/2.,
                this.position.y + dimension/2.,
                this.position.y - dimension/2.)
        },
        addMv: function(name) {
            if(this.mvNames.indexOf(name) !== -1) {
                this.mvNames[this.numMvs] = name
                ++this.numMvs
            }
        }
    })
    
    //-----Mouse dw
    mouseDw = new DisplayWindow()
    mouseDw.editingStyle = null
    let editingName = ""
    mouseDw.placeBasedOnHover = (boxCenterX, boxCenterY, style, name) => {
        if (mouseDw.verticalPositionToRenderFrom === Infinity) {
            mouseDw.position.x = boxCenterX - .5 + dimension / 2.
            mouseDw.position.y = boxCenterY + .5 - dimension / 2.

            mouseDw.verticalPositionToRenderFrom = boxCenterY
            mouseDw.editingStyle = style
            editingName = name
        }
    }
    addRenderFunction( () => {
        if( mouseDw.mouseIsInside(mouseDw.position) || mouseDw.slideOngoing )
            mouseDw.render()
        else {
            mouseDw.verticalPositionToRenderFrom = Infinity
            mouseDw.position.y = Infinity
        }
    })

    let positionInWindow = new ScreenPosition()
    function potentiallyEdit(section) {
        if (mouseDw.editingStyle[section] !== undefined) {
            mouseDw.getPositionInWindow(positionInWindow)
            mouseDw.editingStyle[section](editingName, positionInWindow.x, positionInWindow.y)
        }
    }

    mouseResponses.push({
        z: () => {
            if (mouseDw.mouseIsInside())
                return Infinity
            else
                return -Infinity
        },
        start: () => {
            potentiallyEdit("start")
            mouseDw.slideOngoing = true
        },
        during: () => {
            potentiallyEdit("during")
        },
        end: () => {
            potentiallyEdit("end")
            mouseDw.slideOngoing = false
        },
    })
    
    //-----Carat dw
    caratDw = new DisplayWindow()
    updateFunctions.push(()=>{
        caratDw.position.x = mainCamera.rightAtZZero - dimension / 2. - .4
        caratDw.position.y = carat.position.y - dimension / 2. + .5
    })
    addRenderFunction(() => {
        caratDw.render()
        caratDw.numMvs = 0
    })

    let freeVariableButtons = []
    function FreeVariableButton(name, maker) {
        let btn = new ClickableTextBox(name, () => {
            let lowestUnusedName = getLowestUnusedName()
            addStringAtCarat(lowestUnusedName)
            maker(lowestUnusedName)
        })

        btn.relativePosition = new ScreenPosition(0., -dimension / 2. - .75 - freeVariableButtons.length)
        freeVariableButtons.push(btn)
    }
    updateFunctions.push(() => {
        freeVariableButtons.forEach((btn) => {
            btn.position.copy(caratDw.position)
            btn.position.add(btn.relativePosition)
        })
    })

    FreeVariableButton("point",(name)=>{
        assignMv(name)
        point(getNameDrawerProperties(name).value, 0., 0., 0., 1.);
    })
    FreeVariableButton("line", (name) => {
        assignMv(name)
        realLineX(getNameDrawerProperties(name).value, 1.);
    })

    function rectangleWithPosition(halfFrameWidth, halfFrameHeight) {
        const frameVertsBuffer = new Float32Array([
            halfFrameWidth, halfFrameHeight, 0., 1.,
            -halfFrameWidth, halfFrameHeight, 0., 1.,
            -halfFrameWidth, halfFrameHeight, 0., 1.,
            -halfFrameWidth, -halfFrameHeight, 0., 1.,

            -halfFrameWidth, -halfFrameHeight, 0., 1.,
            halfFrameWidth, -halfFrameHeight, 0., 1.,
            halfFrameWidth, -halfFrameHeight, 0., 1.,
            halfFrameWidth, halfFrameHeight, 0., 1.,
        ])
        return verticesDisplayWithPosition(frameVertsBuffer, gl.LINES, 0., 0., 0.)
    }
    let wholeFrame = rectangleWithPosition(1.8, 1.8 + .5 * freeVariableButtons.length)

    addRenderFunction(() => {
        wholeFrame.position.copy(caratDw.position)
        wholeFrame.position.y -= .5 * freeVariableButtons.length

        wholeFrame.renderFunction()
    })

    // let littleFrame = rectangleWithPosition(1., .5)
    // addRenderFunction(() => {
    //     littleFrame.renderFunction()
    // })
}