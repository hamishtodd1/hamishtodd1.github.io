async function initDymaxion() {

    // {
    //     let vs = `
    //     attribute vec4 vertA;

    //     void main(void) {
    //         gl_Position = vertA;
    //     `
    //     let fs = `
    //     uniform float g;

    //     void main(void) {
    //         gl_FragColor = vec4(1.,g,0.,1.);
    //     `

    //     let testEditingStyle = {
    //         during: (name, x, y) => {
    //             getNameDrawerProperties(name).value = Math.abs(x)
    //         },
    //     }

    //     let pictogramDrawer = new PictogramDrawer(vs, fs)
    //     addType("test", pictogramDrawer, testEditingStyle)
    //     pictogramDrawer.program.addVertexAttribute("vert", 4, quadBuffer)
    //     pictogramDrawer.program.locateUniform("g")

    //     addRenderFunction(() => {
    //         gl.useProgram(pictogramDrawer.program.glProgram)
    //         pictogramDrawer.program.prepareVertexAttribute("vert")

    //         pictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
    //             gl.uniform1f(pictogramDrawer.program.getUniformLocation("g"), nameProperties.value)
    //             gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4)
    //         })
    //     })
    // }

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

    //wanna vert 7 to here, vert 14 to here
    //14 and 9 are on either side
    const closedPosition7 = new Float32Array([0, -4.6196997338654455e-9, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.3817168176174164, 0.7672011256217957, -0.5154557824134827, 0.9999999403953552, 0])
    const closedPosition14 = new Float32Array([0, 2.2407400379620412e-9, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.8435798287391663, 0.40223437547683716, 0.35578155517578125, 1, 0])

    const axis = new Float32Array(16)
    const vertRotator = new Float32Array(16)
    function repositionVerts(angle, vertsBuffer) {
        // https://www.researchgate.net/publication/334307604_Dymaxion_Map_Transformations_-_Technical_White_Paper

        point(verts[5], -0.35578140, -0.40223423, 0.84358000, 1.);
        point(verts[0], -0.42015243, -0.90408255, -0.07814525, 1.);
        point(verts[1], -0.99500944, -0.04014717, 0.09134780, 1.);
        for (let i = 0, il = indices.length - 1; i < il; ++i) {
            let p = verts[indices[i][0]]
            assign(verts[indices[i][1]], p)
            join(verts[indices[i][2]], verts[indices[i][3]], axis)

            lineNormalize(axis)

            mvRotator(axis, angle, vertRotator)
            sandwichBab(p, vertRotator, p)
        }

        mvArrayToPointsBuffer(verts, vertsBuffer)
    }
    repositionVerts(icosahedronDihedralAngle, closedVertsBuffer)

    const vs = `
        attribute vec2 uvInBigTriangleA;
        varying vec2 uv;

        uniform int isPoints;
        uniform vec3 startDirection;
        uniform vec3 endDirection;
        varying float discardPoint;

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
                uvInBigTriangleA.x * (animatedVerts[brIndex] - animatedVerts[blIndex]) +
                uvInBigTriangleA.y * (animatedVerts[tlIndex] - animatedVerts[blIndex]);

            if(isPoints == 0) {
                vec4 closedP = closedVerts[blIndex] +
                    uvInBigTriangleA.x * (closedVerts[brIndex] - closedVerts[blIndex]) +
                    uvInBigTriangleA.y * (closedVerts[tlIndex] - closedVerts[blIndex]);

                vec3 positionOnSphere = closedP.xyz / length(closedP.xyz);
                
                vec3 equatorialPlaneNormal = vec3(0.,1.,0.);

                vec3 projectionOntoNormal = equatorialPlaneNormal * dot(equatorialPlaneNormal,positionOnSphere);
                projectionOntoNormal /= length(projectionOntoNormal);

                float angleFromNorthPole = acos(dot(equatorialPlaneNormal,positionOnSphere));
                float lat = PI/2. - angleFromNorthPole;

                vec3 projectionOntoPlane = positionOnSphere - projectionOntoNormal;
                projectionOntoPlane /= length(projectionOntoPlane);
                //z is central meridian
                float lon = atan(projectionOntoPlane.z,projectionOntoPlane.x);

                uv = vec2(
                    .5 + lon / PI / 2.,
                    .5 - lat / PI);
            }
            else {
                // gl_PointSize = 4.;

                // //except now, uvInBigTriangle is NOT uvInBigTriangle, it's on the globe's surface
                // //ok the core problem is that you get coords on a sphere and the place they're mapped to
                // //depends on

                // float lon = (uvInBigTriangleA.x - .5) * TAU;
                // float lat = (uvInBigTriangleA.y - .5) * PI;
                // vec3 closedP = vec3(
                //     sin(-lon + PI) * cos(lat),
                //     sin(lat),
                //     cos(-lon + PI) * cos(lat)
                //     );

                // //Your dual quat takes points from the closed triangle to the animated triangle
                // //"just" apply that dq to closedP
                
                // vec2 backsolved;

                // discardPoint = 0.;
                // if(abs(.z) > .1)
                //     discardPoint = 1;
                // if(backsolved.x < 0. || backsolved.y < 0. || backsolved.y > 1. - backsolved.x)
                //     discardPoint = 1.;

                //maybe unnecessary
                // vec4 animatedP = animatedVerts[blIndex] +
                // backsolved.x * (animatedVerts[brIndex] - animatedVerts[blIndex]) +
                // backsolved.y * (animatedVerts[tlIndex] - animatedVerts[blIndex]);
            }

            float animatedPMv[16];
            pointToMv(animatedP,animatedPMv);
            float transformed[16];
            sandwichBab(animatedPMv, transform, transformed);
            mvToPoint(transformed,gl_Position);

        `
    const fs = `
        varying vec2 uv;
        uniform sampler2D sampler;

        uniform int isPoints;
;        varying float discardPoint;

        void main(void) {
            if( isPoints == 0 ) {
                gl_FragColor = texture2D(sampler, uv);
            }
            else {
                gl_FragColor = vec4(1.,0.,0.,1.);
                
                if(discardPoint > .5)
                    discard;
            }
        `

    let pictogramDrawer = new PictogramDrawer(vs, fs)
    addOneOffPictogramDrawer(pictogramDrawer, "bpy")
    const program = pictogramDrawer.program

    // const program = new Program(
    //     cameraAndFrameCountShaderStuff.header + vs + cameraAndFrameCountShaderStuff.footer,
    //     cameraAndFrameCountShaderStuff.header + fs + `}`)
    // cameraAndFrameCountShaderStuff.locateUniforms(program)

    program.locateUniform("transform")

    program.locateUniform("animatedVerts")
    program.locateUniform("closedVerts")

    program.locateUniform("blIndex")
    program.locateUniform("brIndex")
    program.locateUniform("tlIndex")

    program.locateUniform("isPoints")
    program.locateUniform("startDirection")
    program.locateUniform("endDirection")

    const texture = await Texture("data/earthColor.png")
    program.locateUniform("sampler")

    {
        let numDivisions = 16
        const uvBufferArray = []
        function pushUv(i, j) {
            uvBufferArray.push(i / numDivisions)
            uvBufferArray.push(j / numDivisions)
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

        var uvBuffer = new Float32Array(uvBufferArray)
        program.addVertexAttribute("uvInBigTriangle",2)

        const numPathVertices = 10
        var pathBuffer = new Float32Array(numPathVertices * 2) //equator by default, equirectangularly
        {
            for (let i = 0; i < numPathVertices; ++i) {
                pathBuffer[i * 2 + 0] = i / numPathVertices
                pathBuffer[i * 2 + 1] = .5
            }
        }
    }

    let transform = new Float32Array(16)
    transform[0] = 1.

    let isPoints = false

    addRenderFunction(() => {
        gl.useProgram(program.glProgram);

        cameraAndFrameCountShaderStuff.transfer(program)

        gl.uniform1fv(program.getUniformLocation("transform"), viewRotor)

        let angle = icosahedronDihedralAngle + (Math.PI - icosahedronDihedralAngle) * (.5 - .5 * Math.cos(frameCount * .006))
        repositionVerts(angle, animatedVertsBuffer)

        gl.uniform4fv(program.getUniformLocation("animatedVerts"), animatedVertsBuffer);
        gl.uniform4fv(program.getUniformLocation("closedVerts"), closedVertsBuffer);

        if(isPoints) {
            gl.uniform1i(program.getUniformLocation("isPoints"), 1)

            program.prepareVertexAttribute("uvInBigTriangle", pathBuffer)
        }
        else {
            gl.uniform1i(program.getUniformLocation("isPoints"), 0)

            program.prepareVertexAttribute("uvInBigTriangle", uvBuffer)

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(program.getUniformLocation("sampler"), 0);
        }

        gl.disable(gl.CULL_FACE);
        pictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
            for (let i = 0; i < indices.length; ++i) {
                gl.uniform1i(program.getUniformLocation("blIndex"), indices[i][0])
                gl.uniform1i(program.getUniformLocation("brIndex"), indices[i][2])
                gl.uniform1i(program.getUniformLocation("tlIndex"), indices[i][3])

                //new plan: send in the dq between closed triangle's vertices and animated one's

                if (isPoints)
                    gl.drawArrays(gl.POINTS, 0, pathBuffer.length / 2);
                else
                    gl.drawArrays(gl.TRIANGLES, 0, uvBuffer.length / 2);
            }
        })
        gl.enable(gl.CULL_FACE);
    })
}