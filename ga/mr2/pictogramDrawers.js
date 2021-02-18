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
        const namesDrawnWithThisDrawer = []
        let screenPositions = []
        this.add = function (name, x, y) {
            let index = namesDrawnWithThisDrawer.indexOf(name)
            if(index === -1) {
                index = namesDrawnWithThisDrawer.length
                namesDrawnWithThisDrawer.push(name)
                screenPositions[index] = []
            }
            if(x !== undefined)
                screenPositions[index].push(x,y)
        }

        this.drawEach = function(predrawAndReturnProgram,draw) {
            namesDrawnWithThisDrawer.forEach((name,index)=>{
                let nameProperties = getNameDrawerProperties(name)

                //usually this is the same program again and again, sometimes not (map projections)
                let program = predrawAndReturnProgram(nameProperties)

                cameraAndFrameCountShaderStuff.transfer(program)

                if (MODE !== PRESENTATION_MODE && screenPositions[index] !== undefined) {
                    gl.uniform1f(program.getUniformLocation("uniformScale"), .5 / RADIUS_IN_BOX)
                    gl.uniform1f(program.getUniformLocation("zAdditionForDw"), 0.)
                    gl.uniform1f(program.getUniformLocation("clipBoxRadius"), .5)

                    for (let i = 0, il = screenPositions[index].length / 2; i < il; ++i) {
                        let x = screenPositions[index][i * 2 + 0]
                        let y = screenPositions[index][i * 2 + 1]

                        gl.uniform2f(program.getUniformLocation("screenPosition"), x, y)
                        draw(nameProperties, name)
                    }
                }
                screenPositions[index].length = 0

                //TODO
                //this should only happen if you're sure this name is drawn with this pictogram drawer
                //and it might have been reassigned. And type is kinda orthogonal to visualization
                displayWindows.forEach((dw) => {
                    if (dw.collection.indexOf(name) !== -1) {
                        gl.uniform1f(program.getUniformLocation("uniformScale"), dw.dimension * .5 / RADIUS_IN_BOX)
                        gl.uniform1f(program.getUniformLocation("zAdditionForDw"), dwOriginZ())

                        const overflowMultiple = 2.
                        gl.uniform1f(program.getUniformLocation("clipBoxRadius"), .5 * dw.dimension * overflowMultiple)
                        gl.uniform2f(program.getUniformLocation("screenPosition"), dw.position.x, dw.position.y)
                        draw(nameProperties, name)
                    }
                })
            })
        }

        //prebatch and useprogram will come first in their render functions
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

    assignTypeAndData("o", "test",  { value: 0. })
}

async function initImagesDisplayer() {
    let vs = `
        attribute vec4 vertA;
        varying vec2 uv;

        uniform float aspect;

        void main(void) {
            uv.x = vertA.x + .5;
            uv.y = 1.-(vertA.y + .5);

            gl_Position = vertA;
            gl_Position.xy *= 4.;
            gl_Position.x *= aspect;
        `
    let fs = `
        uniform sampler2D sampler;
        varying vec2 uv;

        void main(void) {
            gl_FragColor = texture2D(sampler, uv);
        `

    let currentImageIndex = 0
    let fileNames = [
        "arnoPeters.jpeg",
        "al-biruni.png",
        "bonne.png",
        "Map-heart-054.jpg"
    ]
    const textures = Array(fileNames.length)
    const aspects = Array(fileNames.length)
    for (let i = 0; i < fileNames.length; ++i) {
        aspects[i] = {value:1.}
        textures[i] = await Texture("data/" + fileNames[i],aspects[i])
    }

    let pictogramDrawer = new PictogramDrawer(vs, fs)
    addType("imageDisplayer", pictogramDrawer, {
        start: () => {
            ++currentImageIndex
            currentImageIndex = clamp(currentImageIndex,0,textures.length-1)
        },
    })
    assignTypeAndData("brw", "imageDisplayer", {})
    
    pictogramDrawer.program.addVertexAttribute("vert", 4, quadBuffer)
    pictogramDrawer.program.locateUniform("sampler")
    pictogramDrawer.program.locateUniform("aspect")

    addRenderFunction(() => {
        gl.useProgram(pictogramDrawer.program.glProgram)
        pictogramDrawer.program.prepareVertexAttribute("vert")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[currentImageIndex]);
        gl.uniform1i(pictogramDrawer.program.getUniformLocation("sampler"), 0);

        gl.uniform1f(pictogramDrawer.program.getUniformLocation("aspect"), aspects[currentImageIndex].value)

        pictogramDrawer.finishPrebatchAndDrawEach(() => {
            gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
        })
    })
}