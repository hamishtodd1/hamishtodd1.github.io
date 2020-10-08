/*
    The landmasses could be an implicit surface defined over S2 or equivalently the directions in 3D, eg trivectors without e123

	Title
        How racist is your map?
        Which is least racist?
        Can we make a less racist map? 
        Making the least racist map
		Top 8 map projections?

    Script
        orange peel first, very intuitive https://twitter.com/infowetrust/status/967105316272816128
            It so much feels like it shouldn't be hard, because when you look close up the world is flat
            but there's intrinsic curvature, comes about due to topology
            You HAVE to distort something: probably lengths, probably directions, and if you want to keep them you'll have to distort the hell out of areas, that's the controversial part
        Ancient egyptians knew stereographic
		Polyhedral
			"this one is great because it minimizes distortion of area and shape, like Africa here is basically the same size and shape as it really is" (or with a different one, early on)
            These ones have line discontinuities at the edges. If you know how to do complex analysis you can get rid of these!
        Bonne was VERY eurocentric. Show the old pic. Good for the arctic circle!
        "A map is defined by what you use it for"
            mecca one, later comparison with gall peters
            Mollweide
                And here's what climate scientists use to show temperature change! pretty important to see the poles :)
                CMB. When I was a kid I never realized this was a sky map that wraps up like this
        Leads onto the fact that maps are political
            Mercator
                So let's say you are a sea captain(Put on a sea captain hat)
                Wanting to make your fortune by acquiring spices in the bahamas and delivering them to royalty in sweden
                Literally all you have is a compass. You don't know where you are, you don't know how fast you're going
                The simplest course you can have is one where your compass is always pointing in the same direction
                Geometric proof of conformality http://www.quadibloc.com/maps/maz0202.htm
			You might say that the ultimate projection is this, a globe
				Well, don't be so fast. You have to show global information (human migration, gdp) *somehow*
				perspective projection, pick up the "clone" and show them it's a flat picture - it's still a projection folks, mind blown!
				But look, you do want to see the whole thing at once. And do you ever really look at it from all angles?
			Arno Peters
                Peters' objection is important of course, it's just not as clever as people sometimes act like it is.
                He's right: a world map isn't a mathematically perfect representation of reality, a map is affected by the priorities of the people who made it
				I would have loved Peters for ever, if he had recommended everyone use a non-piece of shit projection like Dymaxion I'd have loved him!
				Even if he had plaigarized Dymaxion! Instead he plaigarized a crap projection
				It's that he falsely claimed to have done something mathematically impossible...
				and implied that the reason that nobody had done what he had done before (even though they had done it before!)
				was that cartographers and publishers were biased europeans
            Probably mercator doesn't bias people that much, nobody thinks Greenland is THAT big
                One of the lessons Dymaxion is trying to teach is that there is no up or down
                Maps exist in a social context and that's important, but that doesn't mean they're objective.
                For a given task, there probably is one map that's perfect,
                    whether you're trying to see how humans spread across the world,
                    or find the direction to Mecca
                    or showing climate or epidemeological data
                    or navigate a boat or plane
                All of these things are mathematically perfect *for the task they do*, perfect in a way that can teach us some maths, and something about the people who made it
                And at the end of the day, that was Arno Peters' real crime:
                    denying us the variety, denying that you should think about projections other the one he came up with. 
                    Ignoring the contributions of the Egyptians and of ancient China. Fascistic, really!
        
    Could do a make it so you can grab and move points/lines on the projection
        One at a time maybe, other doc has many ideas for this
        bit of backsolving

	Projections
		Polyhedral
			Tet
			Oct
            Dymaxion
            Goode Homolosine...
            Healpix/cube
            Pretty much all the cuts are along lat/long
		azimuthal
			equidistant = rolling pin!
			central
            equal area - "tunnel distance", surprisingly! geologists use it
        Retroazimuthal
			??? Littrow - simple! Application though?
			"The direction from any point to the center of the map is the angle that a straight line connecting the two points makes with a vertical line."
				You're looking at a point on the sphere, there is a line connecting that point with its opposite pole
				For each point connect it to that opposite pole and look at the angle it makes,
			??? Two point equidistant
				Might be interesting, gotten in an ellipse-drawing-like way
		Axial - means you start out by turning the globe into a half-cylinder
			Central cylindrical
			Mercator
				Central point, peel out rhumb lines ending at the meridian opposite the point
				If you have to just reach in and stretch it, fine
				But how about an exponential curve away from the globe
				underrated, talk about directions (first! and then tell them it's mercator!)
				Buuuut pick up greenland too
			Gall peters!
			equirectangular
			Sinusoidal is very easy out of these dull diamond shaped ones
				Can do interrupted too! different distortion in different places, yuck
        Conic - cone involved
            Lambert conformal conic is nice according to Ian
            One of the ones that fan out
            polyconics
                Buncha cones
            Werner isn't there some way to connect to normal conic?
                p = TAU/4 - lat				[0,TAU/2]
                E = long * cos(lat) / p		[-TAU/2*]
                x = p * sin(E)
                y =-p * cos(E)
*/

async function initWorldMap() {
    const header = 
        `precision mediump float;
        #define PI 3.14159265359
        #define TAU 6.28318530718
        `

    const vsSource = header + `
        uniform vec2 uProgramPosition;
        uniform float uRightAtZZero;
        uniform float uTopAtZZero;
        uniform float uFrameCount;

        attribute vec3 aPosition;
        varying vec3 vPosition;
        
        attribute vec2 aUv;
        varying vec2 vUv;

        vec3 globe(float lon,float lat) {
            return vec3(
                sin(-lon + PI) * cos(lat),
                sin(lat),
                cos(-lon + PI) * cos(lat)
            );
        }

        float cot(float theta) {
            return 1./tan(theta);
        }

        //sign shit too?
        float tanQuaterPiPlusHalfAngle(float angle) {
            return tan(PI/4.+angle/2.);
        }

        void main(void) {
            vec3 p = aPosition;

            float lon = (p.x - .5) * TAU;
            float lat = (p.y - .5) * PI;

            //ga is useful for bending the faces
            //for sending eg the projection point to infinity
            //for unifying surely
            //for complex analysis?

            // p.xyz = globe(lon,lat);

            //octahedral,GA is super useful for unfolding
            // p = globe(lon,lat);
            // vec3 orthogonalVector = normalize(sign(p));
            // float multiple = dot(p,orthogonalVector) / .5;
            // p /= multiple;

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

            // Goode Homolosine, basically
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
            //         if(aUv.x < cutoff/256. )
            //             centerIndex = cutoff/2.;
            //         else
            //             centerIndex = 158.;
            //     }
            //     else {
            //         float cutoff0 = 116.;
            //         float cutoff1 = 182.;
            //         if(aUv.x < cutoff0/256. )
            //             centerIndex = cutoff0/2.;
            //         else if(aUv.x < cutoff1/256.)
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

            //peirce quincuncial
            //something like this
            // float F() {
            //     float k = .5*sqrt(2.); //paper said so
            //     // https://en.wikipedia.org/wiki/Elliptic_integral#Incomplete_elliptic_integral_of_the_first_kind 
            //     float numericalIntegral = 0.;
            //     int i = numDivisions;
            //     for(int i = 0; i < numDivisions; ++i) {
            //         float t = something;
            //         numericalIntegral += 1./sqrt( (1.-t*t) * (1.-k*k*t*t) );
            //     }
            // }
            // float cosLat = cos(lat);
            // float cosLatSquared = cosLat*cosLat;
            // float sinLatSquared = 1. - cosLatSquared;
            // float lineA = cosLatSquared - 2.*sqrt(sinLatSquared+.25*pow(cos(sin(2.*lon)),4.));
            // float lineB = 2.*sin(lat) + cosLatSquared*cos(2.*lon);
            // p.x = .5*F(acos(lineA/lineB));
            // p.y = .5*F(acos(lineB/lineA));

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
            // float lat1 = PI / 2. * (.5+.5*sin(uFrameCount * .05));
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

            //orthographic, mercator, central cylindrical, gnomic, stereographic should all be unified

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



            //"transform"
            p.xy += uProgramPosition;

            //camera
            p.x /= uRightAtZZero;
            p.y /= uTopAtZZero;

            vUv = aUv;
            vPosition = aPosition.xyz;
            gl_Position.xyz = p;
            gl_Position.w = 1.;
        }
        `
    const fsSource = header + `
        varying vec2 vUv;
        varying vec3 vPosition;

        uniform sampler2D uSampler;

        void main(void) {
            // .x + 8./256. if you want Asia intact
            vec4 texelColor = texture2D(uSampler, vUv);

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addUniform("RightAtZZero")
    program.addUniform("TopAtZZero")
    program.addUniform("FrameCount")
    program.addUniform("ProgramPosition")

    const texture = await Texture("data/earthColor.png")
    program.addUniform("Sampler")

    let numDivisions = 256
    const positionBuffer = []
    const uvBuffer = []
    function pushPosition(i,j) {
        positionBuffer.push(i / numDivisions)
        positionBuffer.push(j / numDivisions)
        positionBuffer.push(0.)
    }
    function pushUv(i,j) {
        uvBuffer.push(i / numDivisions)
        uvBuffer.push((numDivisions-j) / numDivisions)
    }
    //you don't want anything on any precise lines like x = .5
    let eps = .00001 //sensetive, ugh
    for(let i = 0.; i < numDivisions; ++i) {
        for(let j = 0.; j < numDivisions; ++j) {
            pushPosition(i, j)
            pushUv(i+eps, j+eps)
            pushPosition(i + 1, j + 1)
            pushUv(i + 1 - eps, j + 1 - eps)
            pushPosition(i, j + 1)
            pushUv(i + eps, j + 1 - eps)

            pushPosition(i, j)
            pushUv(i+eps, j+eps)
            pushPosition(i + 1, j)
            pushUv(i + 1 - eps, j + eps)
            pushPosition(i + 1, j + 1)
            pushUv(i + 1 - eps, j + 1 - eps)
        }
    }

    //dymaxion mesh
    //siiiigh, this wasn't supposed to be about discreteness, that's why you said fuck arrays

    program.addVertexAttribute("Position", positionBuffer, 3)
    program.addVertexAttribute("Uv", uvBuffer, 2)
    let numVertices = positionBuffer.length / 3

    renderFunctions.push( () => {
        gl.useProgram(program.glProgram);

        program.enableVertexAttribute("Position")
        program.enableVertexAttribute("Uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniforms.Sampler, 0);

        gl.uniform1f(program.uniforms.RightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniforms.TopAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniforms.FrameCount, frameCount);
        gl.uniform2f(program.uniforms.ProgramPosition, programPosition.x, programPosition.y );

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    })

    const programPosition = { x: 0., y: 0. }
    updateFunctions.push(() => {
        // programPosition.y = .05*Math.sin(frameCount * .01)
    })
}

{
    //you have two ico verts' positions in 3D space
    //picture rigid icosahedron derived from them
    //divide into small triangles
    //get uvs by spherically projecting, getting lat and long, then scaling
}