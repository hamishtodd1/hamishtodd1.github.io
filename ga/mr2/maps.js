/*
    Title
        How racist is your map?
        Which is least racist?
        Can we make a less racist map? 
        Making the least racist map
		Top 8 map projections?

    Script
        Intro
            They're beautiful and varied
            We will get onto the political controversy surrounding the relative sizes of Greenland and Africa (demonstrate it),
            but honestly, it's very useful and fun to understand the mathematics first
        Homolosine and polyhedral first, very intuitive
            orange peel https://twitter.com/infowetrust/status/967105316272816128
            It so much feels like it shouldn't be hard, because when you look close up the world is flat
            but there's intrinsic curvature, comes about due to topology
            You HAVE to distort something: probably lengths, probably directions, and if you want to keep them you'll have to distort the hell out of areas, that's the controversial part
            Dymaxion
                Buckminster fuller was this eccentric and very right-on guy in the 60s
                Very little distortion to lengths and areas. Angles only screw up at the edges
                There is no up or down
                Gives the impression that south america is far from africa, but it does preserve the arctic circle nicely
            Tet/oct/butterfly?
            You can go even further with these severely chopped up ones, but at this point it's really not giving you a sense of what the surface looks like
                they're not efficient of space
                paths look weird on them
                It feels a bit arbitrary to be cutting up oceans. Like what if you find the Indian ocean very interesting?
        Projection: slightly less intuitive but not too bad
            That part where we squashed the surface onto the flat parts? We're going to be smarter about that
            Can project from points, can move those points
            Ancient egyptians knew stereographic. They knew the world was round
            Geometric proof of conformality http://www.quadibloc.com/maps/maz0202.htm
            Gnomic/central
                Great circles are straight lines. Draw some.
            Lambert conformal conic
                Screws up the southern hemisphere
            Central cylindrical
                Some of you might have been expecting this to look a bit different by the way, for reasons we'll get to later
            Conformal maps are generally much better at preserving the shape of a country,  generally less good at preserving size, but we'll get to that soon
        Specific purpose / compromise / mathematically inelegant
            While we've been looking at a lot of mathematically elegant things, in reality a lot of these maps are made by people deciding what they want and drawing a map off that
            mecca one, later comparison with gall peters
            Winkel III, national geographic
            Mollweide
                And here's what climate scientists use to show temperature change! pretty important to see the poles :)
                CMB. When I was a kid I never realized this was a sky map that wraps up like this
            Werner - Show the old pic.
                Good for the arctic circle!
                VERY eurocentric
                sinusoidal, bonne
            Equidistant - rolling pin
                equirectangular
                azimuthal equidstant
            equal area - "tunnel distance", surprisingly! geologists use it
        Leads onto the central controversy: Mercator, Gall Peters
            Mercator most famous, most controversial. We'll get to its mathematical construction in a second, but it's important to understand the story behind it first
            demonstrate greenland again and madagascar, maybe canada and northern russia
            [improvise. China, his country being undistorted, mercator good for direction but not length/area]
            Let me round off with my personal viewpoint.
                It is true that map projection is a combination of mathematics and social context. No, there's no one perfect map.
                But for a given task, there probably is one map that's perfect,
                    whether you're trying to see how humans spread across the world,
                    or find the direction to Mecca
                    or showing climate or epidemeological data
                    or navigate a boat or plane
                All of these things are mathematically perfect *for the task they do*, perfect in a way that can teach us some maths, and something about the people who made it
                And at the end of the day, Arno Peters' real crime
                    wasn't that he was falsely claiming to have done something that was impossible
                    it was that he was denying the variety, denying that you should think about projections other the one he came up with. 
                    Ignoring the contributions of the cartographers who came before him, including the Egyptian and Chinese ones
*/

async function initWorldMap() {
    const vsSource = shaderHeader + `
        attribute vec2 uvA;
        varying vec2 uv;
        varying vec4 p;

        `
        + gaShaderString +
        `

        uniform dualQuat transform;
        
        float cot(float theta) {
            return 1./tan(theta);
        }

        vec4 globe(float lon,float lat) {
            return vec4(
                sin(-lon + PI) * cos(lat),
                sin(lat),
                cos(-lon + PI) * cos(lat),
                1.
            );
        }

        //sign shit too?
        float tanQuaterPiPlusHalfAngle(float angle) {
            return tan(PI/4.+angle/2.);
        }

        void main(void) {
            uv = uvA;
            p = vec4(uv,0.,1.);

            float oscillatingNumber = .5 + .5 * sin(frameCount*.05);

            float lon = (p.x - .5) * TAU;
            float lat = (p.y - .5) * PI;

            //ga is useful for bending the faces
            //for sending eg the projection point to infinity
            //for unifying surely
            //for complex analysis?

            // p = globe(lon,lat);

            //dymaxion
            {

            }

            //tetrahedral
            // {
            //     p = globe(lon,lat);

            //     //could get the three points and join them to get the planes

                    //could project onto every face then get dot product to check if it's on that face
            
            //     dualQuat xAxis = DualQuat();
            //     xAxis.realLine[0] = 1.;
            //     dualQuat yAxis = DualQuat();
            //     xAxis.realLine[1] = 1.;
            //     dualQuat tetRotator = DualQuat();

            //     vec4 faceNormal = vec4(0.,1.,0.,0.);
            //     rotator(xAxis,TETRAHEDRAL_ANGLE,tetRotator);
            //     sandwich(faceNormal,tetRotator);


            //     float yRotationAngle = (floor(lon/PI.)-1.) * TAU/3.;
            //     float angleToFaceNormal = acos(dot(faceNormal,p)); //probably
            //     if(angleToFaceNormal < TETRAHEDRAL_ANGLE * .5)
            //         faceNormal = vec4(0.,1.,0.,0.)
            // }

            //octahedral,GA is super useful for unfolding
            // p = globe(lon,lat);
            // vec3 orthogonalVector = normalize(sign(p));
            // float multiple = dot(p,orthogonalVector) / .5;
            // p /= multiple;// + (1.-multiple)*oscillatingNumber;

            // mollweide
            // float theta = lat;
            // float piSinLat = PI*sin(lat);
            // for(int i = 0; i < 8; ++i) {
            //     float numerator = 2.*theta + sin(2.*theta) - piSinLat;
            //     float denominator = 2. + 2.*cos(2.*theta);
            //     theta -= numerator / denominator;
            // }
            // p.x = 2.*sqrt(2.) / PI * cos(theta) * lon;
            // p.y = sqrt(2.) * sin(theta);

            // Homolosine, basically
            // {
            //     float theta = lat;
            //     float piSinLat = PI*sin(lat);
            //     for(int i = 0; i < 8; ++i) {
            //         float numerator = 2.*theta + sin(2.*theta) - piSinLat;
            //         float denominator = 2. + 2.*cos(2.*theta);
            //         theta -= numerator / denominator;
            //     }
            //     //if lat = 0, theta = 0.
            //     p.y = sqrt(2.) * sin(theta);
            //     float centerIndex = 0.;
            //     if(lat > 0.) {
            //         float cutoff = 116.;
            //         if(uv.x < cutoff/256. )
            //             centerIndex = cutoff/2.;
            //         else
            //             centerIndex = 158.;
            //     }
            //     else {
            //         float cutoff0 = 116.;
            //         float cutoff1 = 182.;
            //         if(uv.x < cutoff0/256. )
            //             centerIndex = cutoff0/2.;
            //         else if(uv.x < cutoff1/256.)
            //             centerIndex = (cutoff0+cutoff1)/2.;
            //         else 
            //             centerIndex = 256. - (256.-cutoff1)/2.;
            //     }
            //     float center = TAU * centerIndex / 256. - PI;
            //     float centerMapped = 2. * sqrt(2.) / PI * center; //theta = 0 at center
            //     p.x = 2.*sqrt(2.) / PI * cos(theta) * (lon-center) + centerMapped;
            // }

            //Winkel III
            // float lat1 = acos(2./PI);
            // float alpha = acos(cos(lat) * cos(.5*lon));
            // float sincAlpha = sin(alpha) / alpha;
            // p.x = .5 * (lon*cos(lat1) + 2.*cos(lat)*sin(.5*lon) / sincAlpha);
            // p.y = .5 * (lat + sin(lat) / sincAlpha);

            // mecca/Craig retroazimuthal. Needs different mesh
            // float meccaLat = .00001;//0.37331021903;
            // float meccaLon = .00001;//0.69565158793;
            // p.x = lon - meccaLon;
            // p.y = p.x / sin(p.x) * (sin(lat)*cos(p.x)-tan(meccaLat)*cos(lat));

            //lambert conformal. Easy geometrically! Just a cone!
            {
                // float lat0 = 0.;
                // float lat1 = PI/3.;
                // float lat2 = PI/6.;
                // float n = log(cos(lat1)/cos(lat2))
                //         / log( tanQuaterPiPlusHalfAngle(lat2) / tanQuaterPiPlusHalfAngle(lat1) );
                // float F = cos(lat1) / n * pow(tanQuaterPiPlusHalfAngle(lat1),n);
                // float rho  = F * 1./pow(tanQuaterPiPlusHalfAngle(lat ),n);
                // float rho0 = F * 1./pow(tanQuaterPiPlusHalfAngle(lat0),n);
                // p.x = rho * sin(n*lon);
                // p.y = rho0 - rho * cos(n*lon);
            }

            // Bonne, covers sinusoidal and werner
            // float lat1 = PI / 2. * (.5+.5*sin(frameCount * .05));
            // if(abs(lat1) < .01) { //sinusoidal
            //     p.x = lon * cos(lat);
            //     p.y = lat;
            // }
            // else {
            //     float rho = cot(lat1) + lat1 - lat;
            //     float E = lon * cos(lat) / rho;
            //     p.x = rho * sin(E);
            //     p.y = cot(lat1) - rho * cos(E);
            // }

            //azimuthal equidistant
            // vec3 globeP = globe(lon,lat);
            // float angle = abs( acos(dot(globeP,vec3(0.,0.,-1.))) );
            // p = vec3(globeP.xy,0.);
            // p *= angle / length(p);

            //equirectangular
            // p.x = lon;
            // p.y = lat;

            //orthographic, mercator, central cylindrical, gnomonic, stereographic should all be unified

            //central cylindrical
            // p.x = lon;
            // p.y = sign(lat) * tan(abs(lat));

            //Gall peters
            // p.x = lon;
            // p.y = 2. * sin(lat);

            //mercator
            // p.x = lon;
            // p.y = sign(lat) * log(tan(PI / 4. + abs(lat) / 2.));

            //central/gnomic - use GA!
            //surely can have stereographic too, it's just a projection point

            sandwich(p, transform);

            //camera, "just" squashing so it goes on screen
            p.x /= rightAtZZero;
            p.y /= topAtZZero;
            p.z /= frontAndBackZ;

            gl_Position = p;
        }
        `
    logShader(vsSource)
    const fsSource = shaderHeader + `
        varying vec2 uv;
        varying vec4 p;

        uniform sampler2D sampler;

        void main(void) {
            // .x + 8./256. if you want Asia intact
            vec4 texelColor = texture2D(sampler, vec2(uv.x,1.-uv.y)); //1- because jfc opengl

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const program = Program(vsSource, fsSource)
    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")
    program.locateUniform("frameCount")
    locateUniformDualQuat(program, "transform")

    const texture = await Texture("data/earthColor.png")
    program.locateUniform("sampler")

    let numDivisions = 256
    const uvBuffer = []
    function pushUv(i,j) {
        uvBuffer.push(i / numDivisions)
        uvBuffer.push(j / numDivisions)
    }
    //you don't want anything on any precise lines like x = .5
    let eps = .00001 //sensetive, ugh
    for(let i = 0.; i < numDivisions; ++i) {
        for(let j = 0.; j < numDivisions; ++j) {
            pushUv(i + eps, j + eps)
            pushUv(i + 1. - eps, j + 1. - eps)
            pushUv(i + eps, j + 1. - eps)

            pushUv(i + eps, j + eps)
            pushUv(i + 1. - eps, j + eps)
            pushUv(i + 1. - eps, j + 1. - eps)
        }
    }
    program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
    let numVertices = uvBuffer.length / 2

    let transform = new DualQuat()
    let axis = new DualQuat()
    axis.realLine[2] = 1.
    updateFunctions.push(()=>{
        rotator(axis, frameCount * .0009, transform)
        rotator(axis, 0., transform)
    })

    renderFunctions.push( () => {
        gl.useProgram(program.glProgram);

        program.enableVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniformLocations.sampler, 0);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);
        gl.uniform1f(program.uniformLocations.frameCount, frameCount);

        transferDualQuat(transform,"transform",program)

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    })
}

async function initDymaxion()
{
    let indices = [
        //the one to rotate, the one opposing it, the two between them
        [ 6, 0, 1, 5],
        [12, 1, 6, 5],
        [11, 6, 12, 5],
        [13, 5, 6, 12],
        [18, 6, 13, 12],
        [17, 13, 18, 12],
        [19, 12, 13, 18],
        [ 7, 12, 6, 13],
        [ 2, 13, 6, 7],
        [14, 6, 7, 13],
        [ 8, 13, 7, 14],
        [ 3, 14, 7, 8],
        [ 4, 7, 3, 8],
        [15, 7, 8, 14],
        [20, 8, 15, 14],
        [ 9, 14, 8, 15],
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
    let axis = new Float32Array(16)
    let ourRotator = new Float32Array(16)
    function repositionVerts(angle,vertsBuffer) {
        let icoRadius = Math.sin(TAU / 5.)
        pointX(verts[0],-.5); pointY(verts[0],    HS3/3.); pointZ(verts[0], icoRadius); pointW(verts[0], 1.); 
        pointX(verts[1], .5); pointY(verts[1],    HS3/3.); pointZ(verts[1], icoRadius); pointW(verts[1], 1.);
        pointX(verts[5], 0.); pointY(verts[5],-HS3/3.*2.); pointZ(verts[5], icoRadius); pointW(verts[5], 1.);
        for (let i = 0, il = indices.length - 1; i < il; ++i) {
            let p = verts[indices[i][0]]
            copyMv(verts[indices[i][1]], p)
            join(verts[indices[i][2]], verts[indices[i][3]], axis )

            lineNormalize(axis)
            
            mvRotator(axis, angle, ourRotator)
            mvSandwich(p, ourRotator, p)
        }
        mvArrayToPointsBuffer(verts, vertsBuffer)

        //in theory you could have a set of dual quaternions
    }
    repositionVerts(icosahedronDihedralAngle,closedVertsBuffer)
    
    updateFunctions.push(()=>{
        let angle = icosahedronDihedralAngle + (Math.PI - icosahedronDihedralAngle) * (.5 - .5 * Math.cos(frameCount * .006))//icosahedronDihedralAngle
        
        repositionVerts(angle, animatedVertsBuffer)
    })

    const vsSource = shaderHeader + `
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

        uniform dualQuat transform;

        void main(void) {
            vec4 animatedP = animatedVerts[blIndex] +
                uvA.x * (animatedVerts[brIndex] - animatedVerts[blIndex]) +
                uvA.y * (animatedVerts[tlIndex] - animatedVerts[blIndex]);

            closedP = closedVerts[blIndex] +
                uvA.x * (closedVerts[brIndex] - closedVerts[blIndex]) +
                uvA.y * (closedVerts[tlIndex] - closedVerts[blIndex]);

            if( .5 - .5 * cos(frameCount * .006) < .01)
                animatedP.xyz /= length(animatedP.xyz);

            // sandwich(animatedP, transform);

            //camera, "just" squashing so it goes on screen
            animatedP.x /= rightAtZZero;
            animatedP.y /= topAtZZero;
            animatedP.z /= frontAndBackZ;

            gl_Position = animatedP;
        }
        `
    const fsSource = shaderHeader + `
        varying vec2 uv;
        varying vec4 closedP;

        uniform sampler2D sampler;

        void main(void) {
            vec3 normalizedP = closedP.xyz / length(closedP.xyz);

            float lat = 0.;
            float lon = 0.;
            {
                vec3 equatorialPlaneNormal = vec3(0.,1.,0.);

                vec3 projectionOntoNormal = equatorialPlaneNormal * dot(equatorialPlaneNormal,normalizedP);
                projectionOntoNormal /= length(projectionOntoNormal);

                float angleFromNorthPole = acos(dot(equatorialPlaneNormal,normalizedP));
                lat = PI/2. - angleFromNorthPole;

                vec3 projectionOntoPlane = normalizedP - projectionOntoNormal;
                projectionOntoPlane /= length(projectionOntoPlane);
                //z is central meridian
                lon = atan(projectionOntoPlane.z,projectionOntoPlane.x);
            }

            gl_FragColor = texture2D(sampler, vec2(
                .5 + lon / PI / 2.,
                .5 - lat / PI));
        }
        `
    logShader(fsSource)

    const program = Program(vsSource, fsSource)
    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")
    program.locateUniform("frameCount")
    locateUniformDualQuat(program, "transform")
    
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

                if(j+1 < numDivisions - i) {
                    pushUv(i + eps, j + 1. - eps)
                    pushUv(i + 1. - eps, j + 1. - eps)
                    pushUv(i + 1. - eps, j + eps)
                }
            }
        }
        program.addVertexAttribute("uv", new Float32Array(uvBuffer), 2)
        var numVertices = uvBuffer.length / 2
    }

    let transform = new DualQuat()

    renderFunctions.push( () => {
        gl.useProgram(program.glProgram);

        program.enableVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniformLocations.sampler, 0);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);
        gl.uniform1f(program.uniformLocations.frameCount, frameCount);

        transferDualQuat(transform,"transform",program)

        gl.uniform4fv(program.uniformLocations.animatedVerts, animatedVertsBuffer);
        gl.uniform4fv(program.uniformLocations.closedVerts, closedVertsBuffer);
        
        for(let i = 0; i < indices.length; ++i) {
            gl.uniform1i(program.uniformLocations.blIndex, indices[i][0])
            gl.uniform1i(program.uniformLocations.brIndex, indices[i][2])
            gl.uniform1i(program.uniformLocations.tlIndex, indices[i][3])

            gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        }
    })
}