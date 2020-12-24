/*
    Next make an angle visualizer because why not
    Hmm. If the only context in which you care about the magnitude of the scalar part is if it's an angle...


    Scalars appearance is context-dependent, sometimes a length, sometimes an area
    Maybe text really is the right representation. Allows exponential scaling, has innate unit, has minus

    The disc / non-disc representation animation would be nice to see too

    need to have "make your own visualizations" for the boxes soon

    Color
        Want to click and select a color, just like with a vector
        As with normal points, can visualize space as plane or disc. Disc gets you hue circle
*/

function initAnglePictograms() {
    let vs = `
        attribute vec4 vertA;
        varying vec2 p;
        void main(void) {
            gl_Position = vertA;
            p = gl_Position.xy;
        `
    let fs = `
        uniform float fullAngle;
        varying vec2 p;
        void main(void) {
            float angle = atan(-p.y,-p.x) + PI;
            if(angle > fullAngle)
                discard;
            gl_FragColor = vec4(.2,.2,.2,1.);
        `

    let editingStyle = {
        during: (name, x, y) => {
            getNameDrawerProperties(name).value = clamp(x, -1., 1.)
        },
    }

    var vertsBuffer = vertBufferFunctions.disc(.95, 62)

    let pd = new PictogramDrawer(vs, fs)
    addType("angle", pd, editingStyle)
    pd.program.addVertexAttribute("vert", vertsBuffer, 4)
    pd.program.locateUniform("fullAngle")

    addRenderFunction(() => {
        gl.useProgram(pd.program.glProgram)
        pd.program.prepareVertexAttribute("vert", vertsBuffer)

        pd.finishPrebatchAndDrawEach((nameProperties) => {
            //If it's from an mv, normalize its magnitude to 1 before taking the scalar part
            let angle = 2. * Math.acos(nameProperties.value)
            gl.uniform1f(pd.program.getUniformLocation("fullAngle"), angle)
            gl.drawArrays(gl.TRIANGLES, 0, vertsBuffer.length / 4)
        })
    })
}

function initMvPictograms() {

    let hexantColors = new Float32Array(3 * 6)

    {
        adjustViewOnMvs = () => {
            let axis = nonAlgebraTempMv1
            // realLine(untransformedAxis, mouse.positionDelta.y, -mouse.positionDelta.x, 0.)
            // realLine(untransformedAxis, 0., -mouse.positionDelta.x, 0.)
            realLine(axis, mouse.positionDelta.y, 0., 0.)

            let angle = mouse.positionDelta.length() * 1.7
            let increment = nonAlgebraTempMv2
            mvRotator(axis, angle, increment)

            coloredNamesAlphabetically.forEach((name)=>{
                if(getNameType(name) === "mv") {
                    sandwichBab(getNameDrawerProperties(name).value,increment,mv0)
                    assign(mv0,getNameDrawerProperties(name).value)
                }
            })
        }

        rightMouseResponses.push({
            z: () => 0.,
            during: adjustViewOnMvs
        })
    }

    let slideStartMv = new Float32Array(16)
    let slideCurrentMv = new Float32Array(16)
    let editingStyle = {
        start: (editingName, x, y) => {
            point(slideStartMv, x, y, 0., 1.)
        },
        during: (editingName, x, y) => {
            let mv = getNameDrawerProperties(editingName).value

            point(slideCurrentMv, x, y, 0., 1.)

            //What's quite interesting is the "pad plane", which takes the plane z = 0 to the plane you're looking at
            //by the way you can take a lot from the pitch and yaw

            let grade = getGrade(mv)
            switch(grade) {
                case 3: //point
                    assign(slideCurrentMv, mv)
                    break

                case 2: //line
                    if (mvEquals(slideCurrentMv, slideStartMv)) {
                        let currentLineDotMousePosition = new Float32Array(16);
                        inner(mv, slideStartMv, currentLineDotMousePosition)
                        gProduct(currentLineDotMousePosition, slideStartMv, mv)
                        delete currentLineDotMousePosition
                    }
                    else
                        join(slideStartMv, slideCurrentMv, mv)
                    break

                case 1: //plane
                    let normalDirection = mv0
                    gSub(slideCurrentMv, slideStartMv, normalDirection)
                    pointZ(normalDirection, 1.) //urgh, -
                    dual(normalDirection, mv1) //mv1 is the plane, but it's at the origin
                    //better would be it continue to spin around as your mouse gets further and further away

                    //project onto the starting point
                    inner(mv1, slideStartMv, mv2)
                    gProduct(mv2, slideStartMv, mv)
            }
        },
    }

    //point
    {
        //buffers
        {
            let radius = .055
            let radialDivisions = 18
            var vertBuffer = vertBufferFunctions.disc(radius, radialDivisions)

            var pointColorIndexBuffer = new Float32Array(vertBuffer.length / 4)
            for (let i = 0, il = pointColorIndexBuffer.length; i < il; ++i)
                pointColorIndexBuffer[i] = Math.floor(i / il * 6)
        }

        let vs = `
            attribute vec4 vertA;
            uniform vec3 visualPosition;

            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            void main(void) {
                color = hexantColors[int(colorIndexA)];
                gl_Position = vec4( visualPosition + vertA.xyz, 1.);
        `
        let fs = `
            varying vec3 color;
            void main(void) {
                gl_FragColor = vec4(color,1.);
        `

        var pointPictogramDrawer = new PictogramDrawer(vs, fs)
        pointPictogramDrawer.program.addVertexAttribute("vert", vertBuffer, 4, false)
        pointPictogramDrawer.program.addVertexAttribute("colorIndex", pointColorIndexBuffer, 1, true)
        pointPictogramDrawer.program.locateUniform("hexantColors")
        pointPictogramDrawer.program.locateUniform("visualPosition")

        function renderPoints() {
            gl.useProgram(pointPictogramDrawer.program.glProgram)

            pointPictogramDrawer.program.prepareVertexAttribute("vert", vertBuffer)

            pointPictogramDrawer.finishPrebatchAndDrawEach((nameProperties,name) => {
                let mv = nameProperties.value
                if (!containsGrade(mv, 3))
                    return

                gl.uniform3f(pointPictogramDrawer.program.getUniformLocation("visualPosition"), pointX(mv)/pointW(mv), pointY(mv)/pointW(mv), pointZ(mv)/pointW(mv))

                pointPictogramDrawer.program.prepareVertexAttribute("colorIndex", pointColorIndexBuffer)
                gl.uniform3fv(pointPictogramDrawer.program.getUniformLocation("hexantColors"), nameToHexantColors(name, hexantColors))
                gl.drawArrays(gl.TRIANGLES, 0, vertBuffer.length / 4)
            })
        }
    }

    //line, both real and ideal apparently?
    {
        const vs = `
            attribute vec4 vertA;
            
            attribute float colorIndexA;
            uniform vec3 hexantColors[6];
            varying vec3 color;

            void main(void) {
                color = hexantColors[int(colorIndexA)];
                gl_Position = vertA;
            `
        const fs = `
            varying vec3 color;
            void main(void) {
                gl_FragColor = vec4(color,1.);
            `

        {
            var colorIndexBuffer = new Float32Array(6 * 2)
            for (let i = 0; i < 6; ++i) {
                colorIndexBuffer[i * 2 + 0] = i
                colorIndexBuffer[i * 2 + 1] = i
            }

            var planeByComponent = [planeX, planeY, planeZ]
            var pl = new Float32Array(16)
            var pt = new Float32Array(16)
            var endPoints = [new Float32Array(4), new Float32Array(4)]
            var vertsBuffer = new Float32Array(6 * 2 * 4)
        }

        var linePictogramDrawer = new PictogramDrawer(vs, fs)
        linePictogramDrawer.program.addVertexAttribute("vert", vertsBuffer, 4, true)
        linePictogramDrawer.program.addVertexAttribute("colorIndex", colorIndexBuffer, 1, false)
        linePictogramDrawer.program.locateUniform("hexantColors")

        function renderLines() {
            gl.useProgram(linePictogramDrawer.program.glProgram)
            linePictogramDrawer.program.prepareVertexAttribute("colorIndex", colorIndexBuffer)

            linePictogramDrawer.finishPrebatchAndDrawEach((nameProperties,name) => {
                let mv = nameProperties.value
                if (!containsGrade(mv, 2))
                    return

                //update buffer
                {
                    let boxRadius = 1.
                    let whichEnd = 0
                    for (let i = 0; i < 3; ++i) {
                        for (j = -1.; j <= 1. && whichEnd < 2; j += 2.) {
                            zeroMv(pl)
                            planeW(pl, 1.)
                            planeByComponent[i](pl, 1. / (boxRadius * j))
                            meet(pl, mv, pt)

                            if (pointW(pt) !== 0.) {
                                wNormalizePoint(pt)

                                if (-boxRadius <= pointX(pt) && pointX(pt) <= boxRadius &&
                                    -boxRadius <= pointY(pt) && pointY(pt) <= boxRadius &&
                                    -boxRadius <= pointZ(pt) && pointZ(pt) <= boxRadius
                                ) {
                                    endPoints[whichEnd][0] = pointX(pt)
                                    endPoints[whichEnd][1] = pointY(pt)
                                    endPoints[whichEnd][2] = pointZ(pt)
                                    endPoints[whichEnd][3] = pointW(pt)
                                    ++whichEnd
                                }
                            }
                        }
                    }
                    for (let i = 0; i < 6; ++i) {
                        for (let j = 0; j < 8; ++j)
                            vertsBuffer[i * 8 + j] = lerp(endPoints[0][j % 4], endPoints[1][j % 4], (i + (j < 4 ? 0. : 1.)) / 6.)
                    }
                }
                linePictogramDrawer.program.prepareVertexAttribute("vert", vertsBuffer)
                gl.uniform3fv(linePictogramDrawer.program.getUniformLocation("hexantColors"), nameToHexantColors(name, hexantColors))

                gl.drawArrays(gl.LINES, 0, vertsBuffer.length / 4)
            })
        }
    }

    //plane
    {
        //important for points and lines to be poking out of planes they are precisely in

        //buffers
        {
            let radius = 1.
            let radialDivisions = 32
            var planeVertBuffer = vertBufferFunctions.disc(radius, radialDivisions)
        }

        let vs = gaShaderString + `
            attribute vec4 vertA;
            uniform float motorFromZPlane[16];

            varying vec3 p;

            void main(void) {
                pointToMv(vertA,mv3);
                sandwichBab(mv3,motorFromZPlane,mv4);

                mvToPoint(mv4,gl_Position);

                p = gl_Position.xyz;
        `
        let fs = `
            varying vec3 p;

            uniform vec3 col;
            uniform vec3 normal;
                
            void main(void) {
                vec3 lightPosition = vec3(-1.,1.,-.5);
                vec3 lightDirectionFromHere = lightPosition - p;
                vec3 r = normalize(2. * dot(lightDirectionFromHere,normal) * normal - lightDirectionFromHere);
                
                vec3 viewerDirection = vec3(0.,0.,-1.); //sigh
                float shininessConstant = 8.;
                float specularContribution = pow(dot(r,viewerDirection),shininessConstant);

                gl_FragColor = vec4(col + (1.-col) * specularContribution,1.);
        `

        var planePictogramDrawer = new PictogramDrawer(vs, fs) //shouldn't it be a pictogram program? Bit unfortunate to do so much adding
        planePictogramDrawer.program.addVertexAttribute("vert", planeVertBuffer, 4, false)
        planePictogramDrawer.program.locateUniform("motorFromZPlane")
        planePictogramDrawer.program.locateUniform("normal")
        planePictogramDrawer.program.locateUniform("col")

        let motorFromZPlane = new Float32Array(16)
        let zPlane = new Float32Array(16) //what the disc is at
        plane(zPlane,0.,0.,1.,0.)
        function renderPlanes() {
            gl.useProgram(planePictogramDrawer.program.glProgram)

            planePictogramDrawer.program.prepareVertexAttribute("vert", planeVertBuffer)

            planePictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
                let mv = nameProperties.value
                if (!containsGrade(mv,1))
                    return

                let magnitude = planeNorm(mv)
                plane(mv,
                    planeX(mv)/magnitude,
                    planeY(mv)/magnitude,
                    planeZ(mv)/magnitude,
                    planeW(mv)/magnitude)

                if (planeX(mv) === 0. && planeY(mv) === 0. && planeW(mv) === 0.) {
                    zeroMv(motorFromZPlane)
                    motorFromZPlane[0] = 1.
                }
                else {
                    meet(zPlane, mv, mv0)
                    let angle = Math.asin(lineRealNorm(mv0))
                    lineNormalize(mv0)
                    mvRotator(mv0, angle, motorFromZPlane)
                }

                gl.uniform1fv(planePictogramDrawer.program.getUniformLocation("motorFromZPlane"), motorFromZPlane)
                let inverseNormalLength = 1./Math.sqrt(sq(planeX(mv)) + sq(planeY(mv)) + sq(planeZ(mv)) )
                gl.uniform3f(planePictogramDrawer.program.getUniformLocation("normal"), 
                    planeX(mv)*inverseNormalLength,
                    planeY(mv)*inverseNormalLength,
                    planeZ(mv)*inverseNormalLength)

                gl.uniform3f(planePictogramDrawer.program.getUniformLocation("col"), .2,.2,.2)

                //for performance, could do this disabling in the predraw
                // gl.disable(gl.CULL_FACE)
                // gl.cullFace(gl.FRONT_AND_BACK)
                // gl.cullFace(gl.BACK)
                gl.drawArrays(gl.TRIANGLES, 0, planeVertBuffer.length / 4)
                // gl.enable(gl.CULL_FACE)
            })
        }
    }

    addType("mv", [pointPictogramDrawer, linePictogramDrawer, planePictogramDrawer], editingStyle)
    assignMv = function(name) {
        assignTypeAndData(name, "mv", { value: new Float32Array(16) })
    }

    addRenderFunction(() => {
        renderPoints()
        renderLines()
        renderPlanes()
    })
}