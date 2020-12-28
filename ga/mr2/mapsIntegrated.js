/*  
    So dymaxion, and the conic one, are functions of [0,1] that are flat at 1 and wrapped up at 0

    TODOs for projection
        plane projection
            Stereo: done!
            Ortho: project from infinity
            gnomic: Fix bug. It's about winding order! Just cull face back
                But what if you want to view it the other way? Maybe by drawing twice depending on which way you're looking at it?
        lambert: transcribe from notebook
        Sinusoidal/Bonne/werner: look in notebook
        interuppted: several sinusoidals (that then become 1)
        Dymaxion: min()
        craig retroazimuthal: crazy
            sin phi is projection onto the axis
            cos phi is projection onto the equatorial plane
            Maybe multiply out the two terms and visualize them
        Kavrayskiy
            Something to do with circles, possibly can conformally unroll first
        azimuthal equal area: in notebook
        Stretchy conformal unroll to your half cylinder
            equirectangular: conformal unroll
            cylindrical: project (but better to unroll first? Where else do you projecting from a line? If nowhere, project then unroll)
            Mercator: project then the exp thing (non-trivial)
            Gall-Peters: orth (project from a line)

    TODO
		+, cos, sin, exp
        Slice lat and lon
        Flight paths
*/

async function initGlobePictograms() {
    let globeVsStart = `
        attribute vec2 uvA;
        varying vec2 uv;
        uniform float globeTransform[16];

        void main(void) {
            uv = uvA;
            float lon = (uvA.x - .5) * TAU;
            float lat = (uvA.y - .5) * PI;
            
            float untransformedPointOnGlobe[16];
            point(untransformedPointOnGlobe,
                sin(-lon + PI) * cos(lat) * .5,
                sin(lat) * .5,
                cos(-lon + PI) * cos(lat) * .5,
                1.);

            float pointOnGlobe[16];
            sandwichBab(untransformedPointOnGlobe,globeTransform,pointOnGlobe);
            // assign(untransformedPointOnGlobe,pointOnGlobe);
        `

    let vs = gaShaderString + globeVsStart + `\nmvToPoint(pointOnGlobe,gl_Position);`
    let fs = `
        varying vec2 uv;
        uniform sampler2D sampler;

        void main(void) {
            gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
        `

    let yawAxis = new Float32Array(16)
    realLine(yawAxis,0.,1.,0.)
    let yaw = 0.
    let pitchAxis = new Float32Array(16)
    realLine(pitchAxis, 1., 0., 0.)
    let pitch = 0.
    let globeTransform = new Float32Array(16)
    globeTransform[0] = 1.

    let globeEditingStyle = {
        during: (name)=>{
            yaw += mouse.positionDelta.x * .6
            mvRotator(yawAxis, yaw, mv0)

            pitch -= mouse.positionDelta.y * .6
            pitch = clamp(pitch, -TAU/4.,TAU/4.)
            mvRotator(pitchAxis, pitch, mv1)

            gProduct(mv1, mv0, globeTransform)
        }
    }

    let pictogramDrawer = new PictogramDrawer(vs, fs)
    addType("globe", pictogramDrawer, globeEditingStyle)
    
    const eps = .00001 //sensetive, ugh
    const numDivisions = 256
    const uvBuffer = generateDividedUnitSquareBuffer(numDivisions, eps)
    pictogramDrawer.program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
    pictogramDrawer.program.locateUniform("sampler")
    pictogramDrawer.program.locateUniform("globeTransform")

    addRenderFunction(() => {
        gl.useProgram(pictogramDrawer.program.glProgram)
        pictogramDrawer.program.prepareVertexAttribute("uv")

        pictogramDrawer.finishPrebatchAndDrawEach((nameProperties,name) => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, nameProperties.texture);
            gl.uniform1i(pictogramDrawer.program.getUniformLocation("sampler"), 0);//hmm, why 0?
            gl.uniform1fv(pictogramDrawer.program.getUniformLocation("globeTransform"), globeTransform)

            gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2);
        })
    })

    {
        let vsStart = globeVsStart + `\nfloat target[16];`
        let vsEnd = `
            mvToPoint(target,gl_Position);
        `
        let projectionFs = `
            varying vec2 uv;
            uniform sampler2D sampler;
            void main(void) {
                // gl_FragColor = vec4(1.,0.,0.,1.);
                gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));
            `

        const eps = .00001 //sensetive, ugh
        const numDivisions = 256

        //better name might be "reusable"
        var ppWrappers = []
        function PpWrapper() {
            for (let i = 0; i < ppWrappers.length + 1; ++i) {
                if (ppWrappers[i] === undefined) {
                    ppWrappers[i] = this
                    break
                }
            }
            this.currentBody
            // debugger
            this.pictogramProgram = new PictogramProgram(gaShaderString + vsStart + vsEnd, projectionFs)

            this.usedThisFrame = true
            this.usedLastFrame = false
        }

        function predrawAndReturnProgram(nameProperties) {
            let ourPpWrapper = ppWrappers.find((ppWrapper) => {
                if (ppWrapper.currentBody !== nameProperties.body) //bit costly. Maybe turn the string into a single number or something?
                    return false
                else {
                    //go through nameProperties.namesWithLocalizationNeeded too, if there's a mismatch there this is no good either
                    return true
                }
            })
            if (ourPpWrapper === undefined) { //it'll also change if you're
                ourPpWrapper = ppWrappers.find((ppWrapper) => {
                    return ppWrapper.usedLastFrame === false
                })
                if (ourPpWrapper === undefined) {
                    // debugger
                    ourPpWrapper = new PpWrapper()
                }

                // debugger

                let uniformDeclarations = ""
                // nameProperties.namesWithLocalizationNeeded.forEach((name) => {
                //     uniformDeclarations += `uniform float ` + name + `[16];\n`
                // })

                //TODO needs to be updated whenever shit changes. Could have a variable called "version" that you check
                let allFwI = ""
                let fwiNames = Object.keys(functionsWithIr)
                fwiNames.forEach((fwiName) => {
                    let fwi = functionsWithIr[fwiName]
                    fwi.namesWithLocalizationNeeded.forEach((name) => {
                        uniformDeclarations += `uniform float ` + name + `[16];\n`
                    })
                    allFwI += fwi.glslBody + "\n\n"
                })

                let fullString = gaShaderString + uniformDeclarations + allFwI + vsStart + nameProperties.body + vsEnd
                let vsSource = vertexShaderToPictogramVertexShader(fullString)
                ourPpWrapper.pictogramProgram.changeShader(gl.VERTEX_SHADER, vsSource)

                ourPpWrapper.pictogramProgram.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
                ourPpWrapper.pictogramProgram.locateUniform("sampler")
                ourPpWrapper.pictogramProgram.locateUniform("globeTransform")

                //sampler could be in this too
                nameProperties.namesWithLocalizationNeeded.forEach((name) => {
                    ourPpWrapper.pictogramProgram.locateUniform(name)
                })

                ourPpWrapper.currentBody = nameProperties.body
            }
            ourPpWrapper.usedThisFrame = true

            let program = ourPpWrapper.pictogramProgram
            gl.useProgram(program.glProgram)
            program.prepareVertexAttribute("uv")

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, nameProperties.globeProperties.texture);
            gl.uniform1i(program.getUniformLocation("sampler"), 0);
            gl.uniform1fv(program.getUniformLocation("globeTransform"), globeTransform)

            nameProperties.namesWithLocalizationNeeded.forEach((name) => {
                gl.uniform1fv(program.getUniformLocation(name), getNameDrawerProperties(name).value)
            })

            return program
        }

        let pictogramDrawer = new PictogramDrawer()
        addType("globeProjection", pictogramDrawer, {})
        function draw() {
            gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2)
        }
        addRenderFunction(() => {
            ppWrappers.forEach((ppWrapper) => { ppWrapper.usedThisFrame = false })
            pictogramDrawer.drawEach(predrawAndReturnProgram, draw)
            ppWrappers.forEach((ppWrapper) => { ppWrapper.usedLastFrame = ppWrapper.usedThisFrame })
        })
    }
}

async function initDymaxion() {
    let indices = [
        //the one to rotate, the one opposing it, the two between them
        [6, 0, 1, 5],
        [12, 1, 6, 5],
        [11, 6, 12, 5],
        [13, 5, 6, 12],
        [18, 6, 13, 12],
        [17, 13, 18, 12],
        [19, 12, 13, 18],
        [7, 12, 6, 13],
        [2, 13, 6, 7],
        [14, 6, 7, 13],
        [8, 13, 7, 14],
        [3, 14, 7, 8],
        [4, 7, 3, 8],
        [15, 7, 8, 14],
        [20, 8, 15, 14],
        [9, 14, 8, 15],
        [16, 8, 9, 15],
        [10, 15, 9, 16],
        [21, 9, 16, 15],
        [0, -1, 5, 1],
    ]

    let numVerts = 22
    let animatedVertsBuffer = new Float32Array(numVerts * 4)
    // verticesDisplay(animatedVertsBuffer, gl.POINTS)
    let closedVertsBuffer = new Float32Array(numVerts * 4)

    let icosahedronDihedralAngle = Math.acos(-Math.sqrt(5.) / 3.)

    let verts = Array(numVerts)
    for (let i = 0; i < numVerts; ++i)
        verts[i] = new Float32Array(16)
    point(verts[5], -0.35578140, -0.40223423, 0.84358000, 1.);
    point(verts[0], -0.42015243, -0.90408255, -0.07814525, 1.);
    point(verts[1], -0.99500944, -0.04014717, 0.09134780, 1.);
    mvsToBeAffectedByRotation.push(verts[0])
    mvsToBeAffectedByRotation.push(verts[1])
    mvsToBeAffectedByRotation.push(verts[5])

    let axis = new Float32Array(16)
    let ourRotator = new Float32Array(16)
    function repositionVerts(angle, vertsBuffer) {
        // https://www.researchgate.net/publication/334307604_Dymaxion_Map_Transformations_-_Technical_White_Paper

        for (let i = 0, il = indices.length - 1; i < il; ++i) {
            let p = verts[indices[i][0]]
            assign(verts[indices[i][1]], p)
            join(verts[indices[i][2]], verts[indices[i][3]], axis)

            lineNormalize(axis)

            mvRotator(axis, angle, ourRotator)
            sandwichBab(p, ourRotator, p)
        }
        mvArrayToPointsBuffer(verts, vertsBuffer)
    }
    repositionVerts(icosahedronDihedralAngle, closedVertsBuffer)

    updateFunctions.push(() => {
        //hacky / doesn't work
        let invMag = 1. / Math.sqrt(sq(pointX(verts[0])) + sq(pointY(verts[0])) + sq(pointZ(verts[0])))
        point(verts[0], pointX(verts[0]) * invMag, pointY(verts[0]) * invMag, pointZ(verts[0]) * invMag, 1.)
        invMag = 1. / Math.sqrt(sq(pointX(verts[1])) + sq(pointY(verts[1])) + sq(pointZ(verts[1])))
        point(verts[1], pointX(verts[1]) * invMag, pointY(verts[1]) * invMag, pointZ(verts[1]) * invMag, 1.)
        invMag = 1. / Math.sqrt(sq(pointX(verts[5])) + sq(pointY(verts[5])) + sq(pointZ(verts[5])))
        point(verts[5], pointX(verts[5]) * invMag, pointY(verts[5]) * invMag, pointZ(verts[5]) * invMag, 1.)

        let angle = icosahedronDihedralAngle + (Math.PI - icosahedronDihedralAngle) * (.5 - .5 * Math.cos(frameCount * .03))
        repositionVerts(angle, animatedVertsBuffer)
    })

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec2 uvA;
        varying vec4 closedP;

        `
        + gaShaderString +
        `

        uniform vec4 animatedVerts[22];
        uniform vec4 closedVerts[22];

        uniform int blIndex;
        uniform int brIndex;
        uniform int tlIndex;

        uniform float transform[16];

        void main(void) {
            vec4 animatedP = animatedVerts[blIndex] +
                uvA.x * (animatedVerts[brIndex] - animatedVerts[blIndex]) +
                uvA.y * (animatedVerts[tlIndex] - animatedVerts[blIndex]);

            closedP = closedVerts[blIndex] +
                uvA.x * (closedVerts[brIndex] - closedVerts[blIndex]) +
                uvA.y * (closedVerts[tlIndex] - closedVerts[blIndex]);

            // if( .5 - .5 * cos(frameCount * .006) < .01)
            //     animatedP.xyz /= length(animatedP.xyz);

            float animatedPMv[16];
            pointToMv(animatedP,animatedPMv);
            float transformed[16];
            sandwichBab(animatedPMv, transform, transformed);
            mvToPoint(transformed,gl_Position);
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        varying vec2 uv;
        varying vec4 closedP;

        uniform sampler2D sampler;

        void main(void) {
            vec3 positionOnUnitSphere = closedP.xyz / length(closedP.xyz);

            float lat = 0.;
            float lon = 0.;
            {
                vec3 equatorialPlaneNormal = vec3(0.,1.,0.);

                vec3 projectionOntoNormal = equatorialPlaneNormal * dot(equatorialPlaneNormal,positionOnUnitSphere);
                projectionOntoNormal /= length(projectionOntoNormal);

                float angleFromNorthPole = acos(dot(equatorialPlaneNormal,positionOnUnitSphere));
                lat = PI/2. - angleFromNorthPole;

                vec3 projectionOntoPlane = positionOnUnitSphere - projectionOntoNormal;
                projectionOntoPlane /= length(projectionOntoPlane);
                //z is central meridian
                lon = atan(projectionOntoPlane.z,projectionOntoPlane.x);
            }

            gl_FragColor = texture2D(sampler, vec2(
                .5 + lon / PI / 2.,
                .5 - lat / PI));
        }
        `

    const program = new Program(vsSource, fsSource)
    cameraAndFrameCountShaderStuff.locateUniforms(program)
    program.locateUniform("transform")

    program.locateUniform("animatedVerts")
    program.locateUniform("closedVerts")

    program.locateUniform("blIndex")
    program.locateUniform("brIndex")
    program.locateUniform("tlIndex")

    const texture = await Texture("data/earthColor.png")
    program.locateUniform("sampler")

    {
        let numDivisions = 16
        const uvBuffer = []
        function pushUv(i, j) {
            uvBuffer.push(i / numDivisions)
            uvBuffer.push(j / numDivisions)
        }
        let eps = .00001
        for (let i = 0.; i < numDivisions; ++i) {
            for (let j = 0.; j < numDivisions - i; ++j) {
                pushUv(i + eps, j + eps)
                pushUv(i + eps, j + 1. - eps)
                pushUv(i + 1. - eps, j + eps)

                if (j + 1 < numDivisions - i) {
                    pushUv(i + eps, j + 1. - eps)
                    pushUv(i + 1. - eps, j + 1. - eps)
                    pushUv(i + 1. - eps, j + eps)
                }
            }
        }
        var numVertices = uvBuffer.length / 2

        program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
    }

    let transform = new Float32Array(16)
    transform[0] = 1.

    addRenderFunction(() => {
        gl.useProgram(program.glProgram);

        program.prepareVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.getUniformLocation("sampler"), 0);

        cameraAndFrameCountShaderStuff.transfer(program)
        gl.uniform1f(program.getUniformLocation("frameCount"), frameCount);

        gl.uniform1fv(program.getUniformLocation("transform"), transform)

        gl.uniform4fv(program.getUniformLocation("animatedVerts"), animatedVertsBuffer);
        gl.uniform4fv(program.getUniformLocation("closedVerts"), closedVertsBuffer);

        for (let i = 0; i < indices.length; ++i) {
            gl.uniform1i(program.getUniformLocation("blIndex"), indices[i][0])
            gl.uniform1i(program.getUniformLocation("brIndex"), indices[i][2])
            gl.uniform1i(program.getUniformLocation("tlIndex"), indices[i][3])

            gl.disable(gl.CULL_FACE);
            gl.drawArrays(gl.TRIANGLES, 0, numVertices);
            gl.enable(gl.CULL_FACE);
        }
    })
}