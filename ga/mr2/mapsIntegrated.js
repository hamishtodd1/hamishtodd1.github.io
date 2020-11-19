/*  
    So there's going to be a function equirectangular(a)
        if a is a vector, it returns a vector
        if a is a globe with a texture on it, it returns that globe mapped
        The globe and the projections are two different kinds of object? One's a texture and one's map projection?

        Aaand it might be the dymaxion
*/

async function initGlobeProjectionPictograms(globeNamedInstantiations) {
    /*
        Functions like mollweide are separate objects
        They have names. They don't themselves receive a visualization because you've not given them a s

        What are these functions? For glsl y
    */

    {
        function TranspiledFunction() {
            let intermediateRepresentation = "" //valid js or glsl
            this.setIntermediateRepresentation = function(newIr) {
                if(newIr !== intermediateRepresentation) {
                    intermediateRepresentation = newIr
                    this.justUpdated = true
                }
            }
            this.getIntermediateRepresentation = () => intermediateRepresentation

            this.justUpdated = true //Can be replaced every frame, just not in the gl
        }

        //something else you make
        var transpiledFunctions = {
            alternating: new TranspiledFunction()
        }

        updateFunctions.splice(0,0,() => {
            (Object.keys(transpiledFunctions)).forEach((key)=>{
                transpiledFunctions[key].justUpdated = false
            })

            transpiledFunctions.alternating.setIntermediateRepresentation(
                Math.floor(frameCount / 50) % 2 ? `p.x -= .4;` : ``
            )
        })
    }

    let vsStart = `
        attribute vec2 uvA;
        varying vec2 uv;

        attribute vec4 vertA;
        void main(void) {
            uv = uvA;
            vec4 p = vec4(uvA,0.,1.);
            `
    let vsEnd = `
        gl_Position = p;
    `
    let vs = vsStart + vsEnd
    let fs = `
        varying vec2 uv;
        uniform sampler2D sampler;
        void main(void) {
            // gl_FragColor = vec4(1.,0.,0.,1.);
            gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
        `
        
    const eps = .00001 //sensetive, ugh
    const numDivisions = 256
    const uvBuffer = generateDividedUnitSquareBuffer(numDivisions, eps)

    {
        let program = new PictogramProgram(vs, fs)
        program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
        program.locateUniform("sampler")

        //do you give them names that the namedMvs don't have?
        //Just press the number 1 and it gives you the... lowestUnusedColorName
        var namedInstantiations = {
            y: {
                globe: globeNamedInstantiations["earthColor"],
                mapping: transpiledFunctions["alternating"],
                program: program
                //this is made at runtime
            },

            x: {
                globe: globeNamedInstantiations["cmb"],
                mapping: transpiledFunctions["alternating"],
                program: program
            }
        }
    }

    function predrawAndReturnProgram(name) {
        let program = namedInstantiations[name].program

        if (namedInstantiations[name].mapping.justUpdated) {
            let vsSource = vertexShaderToPictogramVertexShader(vsStart + namedInstantiations[name].mapping.getIntermediateRepresentation() + vsEnd)
            program.changeShader(gl.VERTEX_SHADER, vsSource)
        }

        gl.useProgram(program.glProgram)
        program.prepareVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, namedInstantiations[name].globe.texture);
        gl.uniform1i(program.getUniformLocation("sampler"), 0);

        return program
    }

    function draw() {
        gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2)
    }

    let editingStyle = {}
    let globeProjectionPictogramDrawer = new PictogramDrawer(editingStyle)
    addRenderFunction(() => {
        globeProjectionPictogramDrawer.drawEach(predrawAndReturnProgram, draw)
    },"end")

    updateFunctions.push(() => {
        globeProjectionPictogramDrawer.add(.5, -.5, "y")
        globeProjectionPictogramDrawer.add(-2.5, -1.5, "x")
    })
}

async function initGlobePictograms() {
    let namedInstantiations = {}
    {
        let textureNames = ["earthColor", "ball", "cmb", "jupiter", "latAndLon"]

        for(let i = 0; i < textureNames.length; ++i) {
            namedInstantiations[textureNames[i]] = {
                texture: await Texture("data/" + textureNames[i] + ".png"),
                yaw: 0., pitch: 0.
            }
        }
    }

    let vs = `
        attribute vec2 uvA;
        varying vec2 uv;

        `+ gaShaderString +`
        uniform dualQuat transform;

        vec4 globe(float lon,float lat) {
            return vec4(
                sin(-lon + PI) * cos(lat),
                sin(lat),
                cos(-lon + PI) * cos(lat),
                1.
            );
        }

        void main(void) {
            uv = uvA;

            float lon = (uv.x - .5) * TAU;
            float lat = (uv.y - .5) * PI;

            vec4 p = globe(lon,lat);

            dqSandwich(p, transform);

            gl_Position = p;
        `
    let fs = `
        varying vec2 uv;
        uniform sampler2D sampler;

        void main(void) {
            gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
        `

    let yawAxis = new DualQuat()
    yawAxis.realLine[1] = 1.
    // let pitchAxis = new DualQuat()
    // pitchAxis.realLine[0] = 1.

    let globeEditingStyle = {
        during: (editingName)=>{
            namedInstantiations[editingName].yaw   += mouse.position.x - mouse.positionOld.x
            namedInstantiations[editingName].pitch += mouse.position.y - mouse.positionOld.y
        }
    }

    let pictogramDrawer = new PictogramDrawer(globeEditingStyle, vs, fs)
        
    const eps = .00001 //sensetive, ugh
    const numDivisions = 256
    const uvBuffer = generateDividedUnitSquareBuffer(numDivisions, eps)
    pictogramDrawer.program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
    pictogramDrawer.program.locateUniform("sampler")
    
    locateUniformDualQuat(pictogramDrawer.program, "transform")

    let transform = new DualQuat()
    addRenderFunction(() => {
        gl.useProgram(pictogramDrawer.program.glProgram)
        pictogramDrawer.program.prepareVertexAttribute("uv")

        pictogramDrawer.finishPrebatchAndDrawEach((name) => {
            rotator(yawAxis, namedInstantiations[name].yaw, transform)
            transferDualQuat(transform, "transform", pictogramDrawer.program)

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, namedInstantiations[name].texture);
            gl.uniform1i(pictogramDrawer.program.getUniformLocation("sampler"), 0);//hmm, why 0?

            gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2);
        })
    })

    updateFunctions.push(() => {
        pictogramDrawer.add(-.5, .5, "earthColor")
    })

    initGlobeProjectionPictograms(namedInstantiations)
}