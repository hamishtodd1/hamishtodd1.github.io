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
        let fs = `
            varying vec2 uv;
            uniform sampler2D sampler;
            void main(void) {
                // gl_FragColor = vec4(1.,0.,0.,1.);
                gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
            `
            
        const eps = .00001 //sensetive, ugh
        const numDivisions = 256
        var uvBuffer = generateDividedUnitSquareBuffer(numDivisions, eps)
        
        function updateGlobeProjectionProgram(tf) {
            if (tf.globeProjectionProgram === null)
                tf.globeProjectionProgram = new PictogramProgram(vsStart + vsEnd, fs)
            else {
                let vsSource = vertexShaderToPictogramVertexShader(vsStart + tf.getIntermediateRepresentation() + vsEnd)
                tf.globeProjectionProgram.changeShader(gl.VERTEX_SHADER, vsSource)
            }

            tf.globeProjectionProgram.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
            tf.globeProjectionProgram.locateUniform("sampler")
        }

        var alternatingTf = new TranspiledFunction("alternating")
        alternatingTf.addIrUpdater(updateGlobeProjectionProgram)

        //simulates the transpiler
        updateFunctions.splice(0, 0, () => {
            alternatingTf.setIntermediateRepresentation(
                Math.floor(frameCount / 50) % 2 ? `p.x -= .4;` : ``
            )
        })
        
    }
    var namedInstantiations = {
        y: {
            globe: globeNamedInstantiations["earthColor"],
            tf: alternatingTf,
            //this is made at runtime
        },

        x: {
            globe: globeNamedInstantiations["cmb"],
            tf: alternatingTf,
        }
    }

    function predrawAndReturnProgram(name) {
        let program = namedInstantiations[name].tf.globeProjectionProgram

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
        // globeProjectionPictogramDrawer.add(.5, -.5, "y")
        // globeProjectionPictogramDrawer.add(-2.5, -1.5, "x")
    })
}

async function initGlobePictograms() {
    let namedInstantiations = {}
    {
        let textureNames = ["earthColor", "ball", "cmb", "jupiter", "latAndLon2"]

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
        pictogramDrawer.add(-.5, .5, "latAndLon2")
    })

    initGlobeProjectionPictograms(namedInstantiations)
}