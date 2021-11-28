/*  
    Depth crap relating to which side is shown
        What you want: the thing is visible from both sides
        Another way of getting around it is to say fuck it and assume all projections get the right side all the time
        I mean the point of these things is to show the surface and if there's some surface missing it's not a projection, sooo
*/

async function initGlobePictograms() {

    //flight path
    {
        //spacing can help indicate length distortion
        //so probably you want them equally spaced along the globe

        let numVerts = 1024
        let exponentScalarBuffer = new Float32Array(numVerts)
        for(let i = 0; i < numVerts; ++i)
            exponentScalarBuffer[i] = i / numVerts
        let arcMotor = new Float32Array(16)

        let start = new Float32Array(16)
        let end = new Float32Array(16)
        let origin = new Float32Array(16)
        point(origin,0.,0.,0.,1)

        let cutOnPlane = new Float32Array(16)
        let cutOffPlane = new Float32Array(16)
        //check if you're between these?

        // let circleVerts = []
        // for(let i = 0; i < numCircleVerts; ++i) {
        //     circleVerts[i*2+0] = Math.cos(i/numCircleVerts * TAU)
        //     circleVerts[i*2+1] = Math.sin(i/numCircleVerts * TAU)
        // }

        //you only need the line I guess
        var flightPathEditingStyle = {
            start: (name,x,y) => {


                // //you put them all here
                // let dir = nonAlgebraTempMv0
                // join(origin,dir,start)
                // lineNormalize(start)
            },
            during: (name,x,y) => {


                // let dir = nonAlgebraTempMv0
                // displayWindowXyTo3dDirection(x, y, dir)
                // join(origin,dir,end)
                // lineNormalize(end)

                // gProduct(end,start,arcMotor)
                // sqrtMotor(arcMotor)

                //the cutoff at the end is a plane, probably
                //sheesh, so
            }
        }
    }

    const globeRotor = new Float32Array(16)
    globeRotor[0] = 1.

    const eps = .00001 //sensetive, ugh
    const numDivisions = 256
    const uvBuffer = new Float32Array(generateDividedUnitSquareBuffer(numDivisions, eps))

    const numPathVertices = 60
    const pathBuffer = new Float32Array(numPathVertices * 2) //equator by default, equirectangularly
    {
        for (let i = 0; i < numPathVertices; ++i) {
            pathBuffer[i*2+0] = i / numPathVertices
            pathBuffer[i*2+1] = .5
        }
    }

    let globeVsStart = `
        attribute vec2 uvA;
        varying vec2 uv;
        varying float discardPoint;

        uniform float ourRotor[16];
        uniform float viewRotor[16];

        uniform int isPoints;
        uniform vec3 startDirection;
        uniform vec3 endDirection;

        void main(void) {
            float lon = (uvA.x - .5) * TAU;
            float lat = (uvA.y - .5) * PI;
            
            float untransformedPointOnGlobe[16];
            //earth's axis is y axis
            //null island is at (0.,0.,-1.)
            point(untransformedPointOnGlobe,
                sin(-lon + PI) * cos(lat),
                sin(lat),
                cos(-lon + PI) * cos(lat),
                1.);

            float pointOnGlobe[16];

            //if it's a point, we transform the vertex, otherwise we transform the uv
            if(isPoints == 1) {
                sandwichBab(untransformedPointOnGlobe,ourRotor,pointOnGlobe);

                vec3 pointDirection = normalize(vec3( pointX(pointOnGlobe), pointY(pointOnGlobe), pointZ(pointOnGlobe) ));
                float angleToStart = acos(dot(startDirection,pointDirection));
                float angleToEnd = acos(dot(endDirection,pointDirection));
                float startEndAngle = acos(dot(startDirection,endDirection));

                if( startEndAngle == 0. || angleToStart + angleToEnd > startEndAngle + .01)
                    discardPoint = 1.;
                else
                    discardPoint = 0.;

                gl_PointSize = 4.;
            }
            else {
                assign(untransformedPointOnGlobe,pointOnGlobe);
                float uvPointOnGlobe[16];
                sandwichBab(untransformedPointOnGlobe,ourRotor,uvPointOnGlobe);

                float transformedLat = asin(pointY(uvPointOnGlobe));
                vec2 neq = normalize( vec2(pointZ(uvPointOnGlobe), -pointX(uvPointOnGlobe) ) );
                //normalized and in equatorial plane with null island at (1,0) (instead of (0,0,-1))
                float transformedLon = atan(neq.y,neq.x);
                uv.x = (transformedLon / TAU) + .5;
                uv.y = (transformedLat / PI) + .5;
            }
        `

    let fs = `
        varying vec2 uv;
        uniform sampler2D sampler;
        
        uniform int transparent;

        uniform int isPoints;
        varying float discardPoint;

        void main(void) {
            if( isPoints == 0 ) {
                gl_FragColor = texture2D(sampler, vec2(uv.x,1.-uv.y));

                if( transparent != 0 && gl_FragColor.g == 0.)
                    discard;
            }
            else {
                gl_FragColor = vec4(1.,0.,0.,1.);
                
                if(discardPoint > .5)
                    discard;
            }
        `

    function locateAll(program) {
        program.addVertexAttribute("uv", 2)
        program.locateUniform("sampler")
        program.locateUniform("ourRotor")
        program.locateUniform("viewRotor")
        program.locateUniform("transparent")
        
        program.locateUniform("isPoints")
        program.locateUniform("startDirection")
        program.locateUniform("endDirection")
    }

    function transferAll(program,globeProperties) {
        if( globeProperties.isPoints ) {
            program.prepareVertexAttribute("uv", pathBuffer)

            gl.uniform3f(program.getUniformLocation("startDirection"), pointX(startDirection), pointY(startDirection), pointZ(startDirection));
            gl.uniform3f(program.getUniformLocation("endDirection"), pointX(endDirection), pointY(endDirection), pointZ(endDirection));

            assign(startDirection, getNameDrawerProperties("bp").value)
            assign(endDirection, getNameDrawerProperties("oy").value)

            // debugger
            const startLine = nonAlgebraTempMv0
            join(origin, startDirection, startLine)
            let pathPlane = nonAlgebraTempMv1
            join(startLine, endDirection, pathPlane)
            planeNormalize(pathPlane)

            const yPlane = nonAlgebraTempMv2
            plane(yPlane, 0., 1., 0., 0.)
            
            const pathRotor = nonAlgebraTempMv3
            gProduct(pathPlane, yPlane, pathRotor)
            sqrtMotor(pathRotor)

            gl.uniform1fv(program.getUniformLocation("ourRotor"), pathRotor)

            gl.uniform1i(program.getUniformLocation("isPoints"), 1)
        }
        else {
            program.prepareVertexAttribute("uv",uvBuffer)

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, globeProperties.texture);
            gl.uniform1i(program.getUniformLocation("sampler"), 0); //hmm, why 0?

            gl.uniform1fv(program.getUniformLocation("ourRotor"), globeRotor)

            gl.uniform1i(program.getUniformLocation("isPoints"), 0)
        }

        gl.uniform1i(program.getUniformLocation("transparent"), globeProperties.transparent ? 1 : 0)

        gl.uniform1fv(program.getUniformLocation("viewRotor"), viewRotor)
    }

    //GLOBE
    {
        //can just be float32Arrays
        var startDirection = new Float32Array(16)
        point(startDirection, Math.random() - .5, Math.random() - .5, Math.random() - .5, 0.)
        directionNormalize(startDirection)
        var endDirection = new Float32Array(16)
        point(endDirection,Math.random() - .5,Math.random() - .5,Math.random() - .5,0.)
        directionNormalize(endDirection)

        let vs = gaShaderString + globeVsStart + `
            sandwichBab(pointOnGlobe,viewRotor,nonAlgebraTempMv0);
            mvToPoint(nonAlgebraTempMv0,gl_Position);`

        let yawAxis = new Float32Array(16)
        realLine(yawAxis, 0., 1., 0.)
        let yaw = 0.
        let pitchAxis = new Float32Array(16)
        realLine(pitchAxis, 1., 0., 0.)
        let pitch = 0.

        let globeEditingStyle = {
            start: (name,x,y) => {
                if(getNameDrawerProperties(name).isPoints) {
                    displayWindowXyTo3dDirection(x, y, startDirection)
                    assign(startDirection, getNameDrawerProperties("bp").value)
                }
            },
            during: (name,x,y) => {
                if (getNameDrawerProperties(name).isPoints) {
                    displayWindowXyTo3dDirection(x, y, endDirection)
                    assign(endDirection,getNameDrawerProperties("oy").value)
                }
                else {
                    yaw -= mouse.positionDelta.x * .6
                    pitch = clamp(pitch, -TAU / 2., TAU / 2.)
                    mvRotator(yawAxis, yaw, mv0)

                    pitch += mouse.positionDelta.y * .6
                    pitch = clamp(pitch, -TAU / 4., TAU / 4.)
                    mvRotator(pitchAxis, pitch, mv1)

                    gProduct(mv0, mv1, globeRotor)
                }
            }
        }

        let pictogramDrawer = new PictogramDrawer(vs, fs)
        addType("globe", pictogramDrawer, globeEditingStyle)

        locateAll(pictogramDrawer.program)

        addRenderFunction(() => {
            gl.useProgram(pictogramDrawer.program.glProgram)

            pictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
                transferAll(pictogramDrawer.program,nameProperties)

                if( nameProperties.isPoints )
                    gl.drawArrays(gl.POINTS, 0, pathBuffer.length / 2)
                else
                    gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2)
            })
        })
    }

    //PROJECTED GLOBE
    {
        let vsStart = globeVsStart + `\nfloat target[16];
            `
        let vsEnd = `
            sandwichBab(target,viewRotor,nonAlgebraTempMv0);
            mvToPoint(nonAlgebraTempMv0,gl_Position);
        `

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
            this.pictogramProgram = new PictogramProgram(gaShaderString + vsStart + vsEnd, fs)

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
                    ourPpWrapper = new PpWrapper()
                }

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

                locateAll(ourPpWrapper.pictogramProgram)

                nameProperties.namesWithLocalizationNeeded.forEach((name) => {
                    ourPpWrapper.pictogramProgram.locateUniform(name)
                })

                ourPpWrapper.currentBody = nameProperties.body
            }
            ourPpWrapper.usedThisFrame = true

            let program = ourPpWrapper.pictogramProgram
            gl.useProgram(program.glProgram)

            transferAll(program,nameProperties.globeProperties)

            nameProperties.namesWithLocalizationNeeded.forEach((name) => {
                gl.uniform1fv(program.getUniformLocation(name), getNameDrawerProperties(name).value)
            })

            return program
        }

        let pictogramDrawer = new PictogramDrawer()
        addType("globeProjection", pictogramDrawer, {})

        function draw(nameProperties,name) {
            if (nameProperties.globeProperties.isPoints)
                gl.drawArrays(gl.POINTS, 0, pathBuffer.length / 2)
            else
                gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2)
        }
        
        addRenderFunction(() => {
            gl.disable(gl.CULL_FACE);
            ppWrappers.forEach((ppWrapper) => { ppWrapper.usedThisFrame = false })

            pictogramDrawer.drawEach(predrawAndReturnProgram, draw)

            ppWrappers.forEach((ppWrapper) => { ppWrapper.usedLastFrame = ppWrapper.usedThisFrame })
            gl.enable(gl.CULL_FACE);
        })
    }

    {
        let textureNames = [
            "earthColor",

            "ball",
            "jupiter",
            "latAndLon2",
            "countries"
        ]
        for (let i = 0; i < textureNames.length; ++i) {
            let texture = await Texture("data/" + textureNames[i] + ".png")
            assignTypeAndData(coloredNamesAlphabetically[13 + i], "globe", {
                texture,
                isPoints: false,
                transparent: i ? true : false
            })
        }
        assignTypeAndData("bo", "globe", {
            texture: null,
            isPoints: true,
            transparent: false
        })
        //you don't actually need that blend shit since it's discard
    }
}