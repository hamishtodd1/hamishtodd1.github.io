/* 
 * The idea of the buttons is that, one day, you go into point-creating mode and click on an intersection and it creates the code that does that

    Would be nice if: the function signature puts into the dw the inputs and outputs and probably the constants it uses too
 */

function initExperiment() {
    /*
        it would be good to have shadows. And fun to do so fuck you
            so you're gonna do rendering to off screen buffer aight
        shading
            makes sense for planes. Could make points balls and lines cylinders
        you need perspective so time for perspective projection. Really perspective projection in the dw but not otherwise?
            it's not a DUMB idea because the space is much larger in these things
        could even have image defocus, look in buffer b of selfie girl

        SDF:
            Looks nice, softness
            Self shadowing/shadowing on each other, that's quite big
        Not sdf:
            Remember you can get nice coloring shading without thingy
            With sdf you have to concatenate everyone's fucking function into a single fucking shader jesus
                How would that work? Maybe not that hard given you're forgetting about colors
                "Just" have an array of points(spheres), cylinders, planes
            more flexible

        Probably you just need the one light pass, just make the light quite far away

        //the above is nicely done with sdfs, for sure!
    */
}

function initDisplayWindows() {
    

    let dimension = 5.;

    //background
    {
        const vsSource = 
            cameraAndFrameCountShaderStuff.header + `
            attribute vec4 vertA;
            uniform vec2 screenPosition;

            uniform float dwOriginZ;

            void main(void) {
                gl_Position = vertA;
                gl_Position.xy *= `+ toGlslFloatLiteral(dimension) + `;
                gl_Position.xy += screenPosition;
                gl_Position.z = -dwOriginZ + .5 * `+ toGlslFloatLiteral(dimension) + `;
            `
            + cameraAndFrameCountShaderStuff.footer
        const fsSource = 
            cameraAndFrameCountShaderStuff.header + `
            void main(void) {
                gl_FragColor = vec4(.45,.45,.45,1.);
            }
            `

        var backgroundProgram = new Program(vsSource, fsSource)
        backgroundProgram.addVertexAttribute("vert", quadBuffer, 4, true)
        cameraAndFrameCountShaderStuff.locateUniforms(backgroundProgram)
        backgroundProgram.locateUniform("screenPosition")

        backgroundProgram.locateUniform("dwOriginZ")
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
        render: function(drawBackground) {
            
            if ( drawBackground ) {
                gl.useProgram(backgroundProgram.glProgram)
                cameraAndFrameCountShaderStuff.transfer(backgroundProgram)
                backgroundProgram.prepareVertexAttribute("vert", quadBuffer)
                gl.uniform2f(backgroundProgram.getUniformLocation("screenPosition"), this.position.x, this.position.y);

                gl.uniform1f(backgroundProgram.getUniformLocation("dwOriginZ"), dwOriginZ())

                gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
            }

            renderAxes(this.position.x,this.position.y)

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
            mouseDw.render(true)
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

    rightMouseResponses.push({
        z: () => {
            if (mouseDw.mouseIsInside())
                return Infinity
            else
                return -Infinity
        },
        start: () => {
            mouseDw.slideOngoing = true
        },
        during: adjustViewOnMvs,
        end: () => {
            mouseDw.slideOngoing = false
        },
    })
    
    //-----Carat or presentation dw
    const PRESENTATION_MODE = false

    //GRID
    {
        const numDivisions = 4
        let gridBuffer = new Float32Array(4 * 2 * (numDivisions+1) * 2 + 8)

        let gridSize = dimension / 4.

        let vertIndex = 0
        for (let horizontal = 0; horizontal < 2; ++horizontal) {
            for(let i = 0; i <= numDivisions; ++i) {
                for(let end = 0; end < 2; ++end) {
                    gridBuffer[vertIndex * 4 + 0] = 0.
                    gridBuffer[vertIndex * 4 + 1] = 0.
                    gridBuffer[vertIndex * 4 + 2] = 0.
                    gridBuffer[vertIndex * 4 + 3] = 1.

                    let coordIndexEnds = horizontal ? 0 : 2
                    gridBuffer[vertIndex*4+coordIndexEnds] = (end ? -1. : 1.) * gridSize
                    let coordIndexLayer = horizontal ? 2 : 0
                    gridBuffer[vertIndex * 4 + coordIndexLayer] = ((i / numDivisions - .5) * 2.) * gridSize

                    ++vertIndex
                }
            }    
        }

        gridBuffer[vertIndex * 4 + 0] = 0.
        gridBuffer[vertIndex * 4 + 1] = 1. * gridSize
        gridBuffer[vertIndex * 4 + 2] = 0.
        gridBuffer[vertIndex * 4 + 3] = 1.
        ++vertIndex
        gridBuffer[vertIndex * 4 + 0] = 0.
        gridBuffer[vertIndex * 4 + 1] =-1. * gridSize
        gridBuffer[vertIndex * 4 + 2] = 0.
        gridBuffer[vertIndex * 4 + 3] = 1.

        const vs = cameraAndFrameCountShaderStuff.header + gaShaderString + `
            attribute vec4 vertA;

            uniform float viewRotor[16];

            uniform vec2 screenPosition;

            uniform float dwOriginZ;
            
            void main(void) {
                pointToMv(vertA,mv0);
                sandwichBab(mv0,viewRotor,mv1);
                mvToPoint(mv1,gl_Position);

                gl_Position.xy += screenPosition;
                gl_Position.z += -dwOriginZ;
            ` + cameraAndFrameCountShaderStuff.footer
        const fs = cameraAndFrameCountShaderStuff.header + `
            void main(void) {
                gl_FragColor = vec4(0.,1.,0.,1.);
            }
            `

        let program = new Program(vs, fs)
        program.addVertexAttribute("vert", gridBuffer, 4, true)
        cameraAndFrameCountShaderStuff.locateUniforms(program)

        program.locateUniform("viewRotor")
        program.locateUniform("screenPosition")

        program.locateUniform("dwOriginZ")

        function renderAxes(x,y) {
            gl.useProgram(program.glProgram)
            cameraAndFrameCountShaderStuff.transfer(program)
            program.prepareVertexAttribute("vert", gridBuffer)

            gl.uniform1fv(program.getUniformLocation("viewRotor"), viewRotor)
            gl.uniform2f(program.getUniformLocation("screenPosition"), x,y)

            gl.uniform1f(program.getUniformLocation("dwOriginZ"), dwOriginZ())

            gl.drawArrays(gl.LINES, 0, gridBuffer.length / 4)
        }
    }

    caratDw = new DisplayWindow()
    updateFunctions.push(()=>{
        if(PRESENTATION_MODE) {
            caratDw.position.x = -mainCamera.rightAtZZero + dimension / 2. + 2.
            caratDw.position.y = 0.
        }
        else {
            caratDw.position.x = mainCamera.rightAtZZero - dimension / 2. - .4
            caratDw.position.y = carat.position.y - dimension / 2. + .5
        }
    })
    addRenderFunction(() => {
        // renderAxes()

        caratDw.render(!PRESENTATION_MODE)
        caratDw.numMvs = 0
    })

    if (PRESENTATION_MODE === false) {
        let freeVariableButtons = []
        function FreeVariableButton(name, makerFunc) {
            let btn = new ClickableTextbox(name, () => {
                let lowestUnusedName = getLowestUnusedName()
                addStringAtCarat(lowestUnusedName)
                makerFunc(lowestUnusedName)
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

        FreeVariableButton("point", (name) => {
            assignMv(name)
            point(getNameDrawerProperties(name).value, 0., 0., 0., 1.);
        })
        FreeVariableButton("line", (name) => {
            assignMv(name)
            realLineX(getNameDrawerProperties(name).value, 1.);
        })
        FreeVariableButton("plane", (name) => {
            assignMv(name)
            planeZ(getNameDrawerProperties(name).value, 1.)
        })
        //could also have rotation and translation, click and drag for both

        // function rectangleWithPosition(halfFrameWidth, halfFrameHeight) {
        //     const frameVertsBuffer = new Float32Array([
        //         halfFrameWidth, halfFrameHeight, 0., 1.,
        //         -halfFrameWidth, halfFrameHeight, 0., 1.,
        //         -halfFrameWidth, halfFrameHeight, 0., 1.,
        //         -halfFrameWidth, -halfFrameHeight, 0., 1.,

        //         -halfFrameWidth, -halfFrameHeight, 0., 1.,
        //         halfFrameWidth, -halfFrameHeight, 0., 1.,
        //         halfFrameWidth, -halfFrameHeight, 0., 1.,
        //         halfFrameWidth, halfFrameHeight, 0., 1.,
        //     ])
        //     return verticesDisplayWithPosition(frameVertsBuffer, gl.LINES, 0., 0., 0.)
        // }
        // const enclosingFrame = rectangleWithPosition(1.8, 1.8 + .5 * freeVariableButtons.length)

        // addRenderFunction(() => {
        //     enclosingFrame.position.copy(caratDw.position)
        //     enclosingFrame.position.y -= .5 * freeVariableButtons.length

        //     enclosingFrame.renderFunction()
        // })
    }
}