/*
    A good control scheme might be to turn the points into ideal points if the mouse is taken outside the frame

    Hmm. If the only context in which you care about the magnitude of the scalar part is if it's an angle...


    Scalars appearance is context-dependent, sometimes a length, sometimes an area
    Maybe text really is the right representation. Allows exponential scaling, has innate unit, has minus

    The disc / non-disc representation animation would be nice to see too

    need to have "make your own visualizations" for the boxes soon


    Control scheme
        You want different things for different contexts
        Backsolving: could do one step. For example, you want a certain point to stay on a line.
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
    pd.program.addVertexAttribute("vert",4, vertsBuffer)
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

    {
        let xAxis = new Float32Array(16)
        let yawAngle = 0.
        realLineX(xAxis,1.)
        let yAxis = new Float32Array(16)
        let pitchAngle = 0.
        realLineY(yAxis,1.)

        adjustViewOnMvs = () => {
            pitchAngle += mouse.positionDelta.y * -0.27
            pitchAngle = clamp(pitchAngle, -TAU / 4., TAU / 4.)
            let pitchRotator = nonAlgebraTempMv1
            mvRotator(xAxis, pitchAngle, pitchRotator)

            yawAngle += mouse.positionDelta.x * 0.27
            let yawRotator = nonAlgebraTempMv2
            mvRotator(yAxis, yawAngle, yawRotator)

            gProduct(pitchRotator, yawRotator, viewRotor)
            reverse(viewRotor, inverseViewRotor)
        }

        rightMouseResponses.push({
            z: () => 0.,
            during: adjustViewOnMvs
        })
    }

    //snapping is extremely important, wanna make the vector (1,0,0) easily
    let slideStartMv = new Float32Array(16)
    let slideStartXy = {x: 0., y: 0.}
    let slideCurrentMv = new Float32Array(16)
    let editingStyle = {
        start: (editingName, x, y) => {
            point(nonAlgebraTempMv0, x, y, 0., 1.)
            sandwichBab(nonAlgebraTempMv0, inverseViewRotor, slideStartMv)
            slideStartXy.x = x
            slideStartXy.y = y
        },
        during: (editingName, x, y) => {
            let mv = getNameDrawerProperties(editingName).value

            point(nonAlgebraTempMv0, x, y, 0., 1.)
            sandwichBab(nonAlgebraTempMv0, inverseViewRotor, slideCurrentMv)

            let grade = getGrade(mv)
            switch(grade) {
                case 3: //point
                    if(pointW(mv) !== 0.) {
                        //alternatively, could keep it in whatever plane it's in?
                        assign(slideCurrentMv, mv)
                    }
                    else
                        displayWindowXyTo3dDirection(x,y,mv)
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
                    let normalDirection = nonAlgebraTempMv0
                    displayWindowXyTo3dDirection(x - slideStartXy.x, y - slideStartXy.y, normalDirection)
                    
                    let planeAtOrigin = nonAlgebraTempMv1
                    dual(normalDirection, planeAtOrigin)
                    assign(planeAtOrigin,mv)

                    //project onto the starting point
                    inner(nonAlgebraTempMv1, slideStartMv, nonAlgebraTempMv2)
                    gProduct(nonAlgebraTempMv2, slideStartMv, mv)
            }
        },
    }

    let hexantColors = new Float32Array(3 * 6)

    //POINT
    {
        //buffers
        {
            let radius = .1
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
        pointPictogramDrawer.program.addVertexAttribute("vert", 4, vertBuffer)
        pointPictogramDrawer.program.addVertexAttribute("colorIndex", 1)
        pointPictogramDrawer.program.locateUniform("hexantColors")
        pointPictogramDrawer.program.locateUniform("visualPosition")

        function renderPoints() {
            gl.useProgram(pointPictogramDrawer.program.glProgram)

            pointPictogramDrawer.program.prepareVertexAttribute("vert")

            pointPictogramDrawer.finishPrebatchAndDrawEach((nameProperties,name) => {
                let mv = nameProperties.value
                
                if (!containsGrade(mv, 3) || pointW(mv) === 0. )
                    return

                let transformedMv = nonAlgebraTempMv1
                sandwichBab(mv,viewRotor,transformedMv)

                gl.uniform3f(pointPictogramDrawer.program.getUniformLocation("visualPosition"), pointX(transformedMv)/pointW(transformedMv), pointY(transformedMv)/pointW(transformedMv), pointZ(transformedMv)/pointW(transformedMv))

                pointPictogramDrawer.program.prepareVertexAttribute("colorIndex", pointColorIndexBuffer)
                gl.uniform3fv(pointPictogramDrawer.program.getUniformLocation("hexantColors"), nameToHexantColors(name, hexantColors))
                gl.drawArrays(gl.TRIANGLES, 0, vertBuffer.length / 4)
            })
        }
    }

    //DIRECTION
    //translation and rotation could be visualized differently than lines
    //One idea for translation line is a circle with direction lines
    //TODO need perspective though seriously
    //there's kinda two things you're thinking about, controlling a direction and controling a point on the surface of a sphere
    //Is there some kind of thing where you could  grab a point and it backsolves to the direction it derives from and you edit that direction?
    {
        //buffers
        {
            //lathe this
            let vertsCoords = [
                0.,     0.,
                .05,   0.,
                .05,   .75,
                .1,     .75,
                0.,     1.
            ]
            let s2i = 1. / Math.sqrt(2.)
            let normalsCoords = [
                0.,  -1.,
                1.,   0.,
                1.,   0.,
                s2i, s2i,
                s2i, s2i,
            ]
            let radialSegments = 16
            let n = vertsCoords.length / 2
            var directionVertsBuffer = new Float32Array(radialSegments * n * 4 * 6)
            var directionNormalsBuffer = new Float32Array(radialSegments * n * 4 * 6)

            let p = nonAlgebraTempMv0
            let rotator = nonAlgebraTempMv1
            let result = nonAlgebraTempMv2
            let axis = nonAlgebraTempMv3
            realLineY(axis,1.)

            let index = 0
            function pushToBuffer(i,j,isNormals) {
                let coords = isNormals ? normalsCoords : vertsCoords
                let buffer = isNormals ? directionNormalsBuffer : directionVertsBuffer

                point(p, coords[i * 2 + 0], coords[i * 2 + 1], 0., 1.)

                mvRotator(axis, j / radialSegments * TAU, rotator)
                sandwichBab(p, rotator, result)

                buffer[index * 4 + 0] = pointX(result)
                buffer[index * 4 + 1] = pointY(result)
                buffer[index * 4 + 2] = pointZ(result)
                buffer[index * 4 + 3] = isNormals ? 0. : 1.
            }

            function doBoth(i,j) {
                pushToBuffer(i, j, true)
                pushToBuffer(i, j, false)
                ++index
            }

            for(let i = 0; i < n; ++i) {
                for(let j = 0; j < radialSegments; ++j) {
                    doBoth(i,j)
                    doBoth(i,j+1)
                    doBoth(i+1,j+1)

                    doBoth(i, j)
                    doBoth(i+1,j+1)
                    doBoth(i+1, j)
                }
            }
        }

        let vs = gaShaderString + `
            attribute vec4 vertA;
            attribute vec4 normalA;

            uniform float rotor[16];

            varying vec3 p;
            varying vec4 normal;

            void main(void) {
                pointToMv(vertA,nonAlgebraTempMv0);
                sandwichBab(nonAlgebraTempMv0,rotor,nonAlgebraTempMv1);
                mvToPoint(nonAlgebraTempMv1,gl_Position);

                p = gl_Position.xyz;

                pointToMv(normalA,nonAlgebraTempMv0);
                sandwichBab(nonAlgebraTempMv0,rotor,nonAlgebraTempMv1);
                mvToPoint(nonAlgebraTempMv1,normal);
        `
        let fs = `
            varying vec3 p;
            varying vec4 normal;

            void main(void) {
                // gl_FragColor = vec4(1.,0.,0.,1.);


                vec3 lightPosition = vec3(-1.,1.,-.5);
                vec3 lightDirectionFromHere = lightPosition - p;
                vec3 r = normalize(2. * dot(lightDirectionFromHere,normal.xyz) * normal.xyz - lightDirectionFromHere);
                
                vec3 viewerDirection = vec3(0.,0.,-1.); //sigh
                float shininessConstant = 8.;
                float specularContribution = pow(dot(r,viewerDirection),shininessConstant);

                vec3 col = vec3(1.,0.,0.);
                gl_FragColor = vec4(col + (1.-col) * specularContribution,1.);
        `

        var directionPictogramDrawer = new PictogramDrawer(vs, fs)
        directionPictogramDrawer.program.addVertexAttribute("vert", 4, directionVertsBuffer)
        directionPictogramDrawer.program.addVertexAttribute("normal", 4, directionNormalsBuffer)
        directionPictogramDrawer.program.locateUniform("rotor")

        let yDirectionDual = new Float32Array(16)
        planeY(yDirectionDual,1.)
        function renderDirections() {
            gl.useProgram(directionPictogramDrawer.program.glProgram)

            directionPictogramDrawer.program.prepareVertexAttribute("vert")
            directionPictogramDrawer.program.prepareVertexAttribute("normal")

            directionPictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
                let mv = nameProperties.value

                if (!containsGrade(mv, 3) || pointW(mv) !== 0. )
                    return

                let mvDualNormalized = nonAlgebraTempMv0
                dual(mv,mvDualNormalized)
                planeNormalize(mvDualNormalized)

                //"motor between planes"
                let toValueRotor = nonAlgebraTempMv1
                gProduct(mvDualNormalized, yDirectionDual, toValueRotor)
                toValueRotor[0] += 1.
                euclideanNormalizeMotor(toValueRotor)
                
                let rotor = nonAlgebraTempMv2
                gProduct(viewRotor,toValueRotor,rotor)
                gl.uniform1fv(directionPictogramDrawer.program.getUniformLocation("rotor"), rotor)

                gl.drawArrays(gl.TRIANGLES, 0, directionVertsBuffer.length / 4)
            })
        }
    }

    //LINE, both real and ideal apparently?
    //Lines are a subset of motors
    //The way to visualize motors is... a pair of reflec
    //need an indication of the order too
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
        linePictogramDrawer.program.addVertexAttribute("vert", 4)
        linePictogramDrawer.program.addVertexAttribute("colorIndex", 1, colorIndexBuffer)
        linePictogramDrawer.program.locateUniform("hexantColors")

        function renderLines() {
            gl.useProgram(linePictogramDrawer.program.glProgram)
            linePictogramDrawer.program.prepareVertexAttribute("colorIndex")

            linePictogramDrawer.finishPrebatchAndDrawEach((nameProperties,name) => {
                let mv = nameProperties.value
                if (!containsGrade(mv, 2))
                    return

                let transformedMv = nonAlgebraTempMv1
                sandwichBab(mv,viewRotor,transformedMv)

                //update buffer
                {
                    let whichEnd = 0
                    for (let i = 0; i < 3; ++i) {
                        for (j = -1.; j <= 1. && whichEnd < 2; j += 2.) {
                            zeroMv(pl)
                            planeW(pl, 1.)
                            planeByComponent[i](pl, 1. / (RADIUS_IN_BOX * j))
                            meet(pl, transformedMv, pt)

                            if (pointW(pt) !== 0.) {
                                wNormalizePoint(pt)

                                if (-RADIUS_IN_BOX <= pointX(pt) && pointX(pt) <= RADIUS_IN_BOX &&
                                    -RADIUS_IN_BOX <= pointY(pt) && pointY(pt) <= RADIUS_IN_BOX &&
                                    -RADIUS_IN_BOX <= pointZ(pt) && pointZ(pt) <= RADIUS_IN_BOX
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
            var planeVertBuffer = vertBufferFunctions.disc(radius, radialDivisions)//quadBuffer
        }

        let vs = gaShaderString + `
            attribute vec4 vertA;
            uniform float motorFromZPlane[16];

            varying vec3 p;

            void main(void) {
                pointToMv(vertA,nonAlgebraTempMv3);
                sandwichBab(nonAlgebraTempMv3,motorFromZPlane,nonAlgebraTempMv4);

                mvToPoint(nonAlgebraTempMv4,gl_Position);

                gl_Position /= gl_Position.w;

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
        planePictogramDrawer.program.addVertexAttribute("vert",4, planeVertBuffer)
        planePictogramDrawer.program.locateUniform("motorFromZPlane")
        planePictogramDrawer.program.locateUniform("normal")
        planePictogramDrawer.program.locateUniform("col")

        let motorFromZPlane = new Float32Array(16)
        let zPlane = new Float32Array(16) //what the disc is at
        plane(zPlane,0.,0.,1.,0.)
        function renderPlanes() {
            gl.useProgram(planePictogramDrawer.program.glProgram)

            planePictogramDrawer.program.prepareVertexAttribute("vert")

            gl.disable(gl.CULL_FACE)

            planePictogramDrawer.finishPrebatchAndDrawEach((nameProperties, name) => {
                let mv = nameProperties.value
                if (!containsGrade(mv,1))
                    return

                let transformedMv = nonAlgebraTempMv0
                sandwichBab(mv, viewRotor, transformedMv)

                planeNormalize(transformedMv)

                if (planeX(transformedMv) === 0. && planeY(transformedMv) === 0. && planeW(transformedMv) === 0.) {
                    zeroMv(motorFromZPlane)
                    motorFromZPlane[0] = 1.
                }
                else {
                    //you want the center of the disc to be on the normal line going to the origin
                    let orientedPlane = nonAlgebraTempMv1
                    assign(transformedMv,orientedPlane)
                    planeW(orientedPlane,0.)

                    let rotationMotor = nonAlgebraTempMv2
                    gProduct(orientedPlane,zPlane,rotationMotor)
                    rotationMotor[0] += 1.
                    euclideanNormalizeMotor(rotationMotor)

                    let translationMotor = nonAlgebraTempMv3
                    gProduct(transformedMv, orientedPlane, translationMotor)
                    translationMotor[0] += 1.
                    euclideanNormalizeMotor(translationMotor)

                    gProduct(translationMotor,rotationMotor,motorFromZPlane)
                    euclideanNormalizeMotor(motorFromZPlane) //probably unnecessary
                }

                gl.uniform1fv(planePictogramDrawer.program.getUniformLocation("motorFromZPlane"), motorFromZPlane)

                gl.uniform3f(planePictogramDrawer.program.getUniformLocation("normal"), 
                    planeX(transformedMv),
                    planeY(transformedMv),
                    planeZ(transformedMv))

                gl.uniform3f(planePictogramDrawer.program.getUniformLocation("col"), .2,.2,.2)

                gl.drawArrays(gl.TRIANGLES, 0, planeVertBuffer.length / 4)
            })
            gl.enable(gl.CULL_FACE)
        }
    }

    addType("mv", [pointPictogramDrawer, linePictogramDrawer, planePictogramDrawer,directionPictogramDrawer], editingStyle)
    assignMv = function(name) {
        assignTypeAndData(name, "mv", { value: new Float32Array(16) })
    }

    addRenderFunction(() => {
        renderPoints()
        renderDirections()
        renderLines()
        renderPlanes()
    })
}