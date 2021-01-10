/*
    Use of the algebra
        mercator(picture of a globe) = abs(log(centralCylindrical(picture of a globe)))
        linalg may be sufficient, since you are stuck at the origin

    Could just... show the things, then say at the end, here's where you can find the code
    A single "step forward" button like powerpoint
    And have a separate video for patrons where you step through the code

    Distortion circle should have a cross in it. A little flying saucer beams it. It spins.


    Script 2
        Intro
            They're beautiful and varied
            We will get onto the political controversy surrounding the relative sizes of Greenland and Africa (demonstrate it). greenland is kind of our canary in the coalmine
            but honestly, it's very useful and fun to understand the mathematics first
        Dymaxion
        I want to start with my favourite map which is this one, the Dymaxion
        The problem is that people don't want to have maps like the 

        The rectangles
            Let me emphasize that this is a really awful idea

    Script
        Dymaxion
            One of the simplest to understand maps is this one, even though it ends up looking like a mess.
            This map can be wrapped up into a solid shape called an icosahedron, which is pretty close to being a sphere
            Very little distortion to lengths and areas. The angles only screw up at the edges
            Buckminster fuller was this very cool and eccentric guy in the 1960s who wanted to make a more equal world
            One of the nice things he did with it was this map of early human migration, where you can see that humans crossed from Russia to Alaska
            For general purposes though, this map is sort of too rebellious to be useful.
                It deliberately ignores the fact that the equator and the poles are special, because it wants to mess with your idea of "up and down"
                This is a very
            It also very consciously screws around with your idea of "up and down", this is part of the point, 
                all the other mathematical projections we'll look at treat the equator and the poles as being special
        Lat and lon (illustrate)
            Practically all other projections are based on taking the angle of every point from the equator, and the angle from some fixed point around the equator

        It's often said that making a map is like flattenning an orange peel https://twitter.com/infowetrust/status/967105316272816128
            It so much feels like it shouldn't be hard, because when you look close up the world is flat
            You HAVE to distort the surface somehow: probably lengths, probably directions
            and if you want to keep either of those you'll have to distort the hell out of areas, that's the controversial part
        Myriahedral https://www.win.tue.nl/~vanwijk/myriahedral/
            You can go even further with these severely chopped up ones
            but at this point it's really not giving you a sense of what the surface looks like
            It feels a bit arbitrary to be cutting up oceans. Like what if you find the Indian ocean very interesting?
            Or more likely, what if you're planning a route for a boat or a plane, which is one of the main uses of maps.
        Projection: slightly less intuitive but not too bad
            That part where we squashed the surface onto the flat parts? We're going to be smarter about that
            Can project from points, can move those points
            Ancient egyptians knew stereographic. They knew the world was round
            Geometric proof of conformality http://www.quadibloc.com/maps/maz0202.htm
            Gnomic/central
                Great circles are straight lines. Draw some.
            Lambert conformal conic
                Screws up the southern hemisphere. It's certainly big though!
            Central cylindrical
                Some of you might have been expecting this to look a bit different by the way, for reasons we'll get to later
            Conformal maps are generally much better at preserving the shape of a country,  generally less good at preserving size, but we'll get to that soon
        Specific purpose / compromise / mathematically inelegant
            While we've been looking at a lot of mathematically elegant things, in reality a lot of these maps are made by people deciding what they want and drawing a map off that
            mecca one, later comparison with gall peters
            Werner - Show the old pic.
                Good for the arctic circle!
                VERY eurocentric
                sinusoidal, bonne, bottomley
                Equal area!!!!
            Equidistant - rolling pin
                invented by al biruni, useful for showing North Korea's missile radii
                equirectangular - also useful for panoramas https://www.istockphoto.com/photos/equirectangular-panorama-beach?mediatype=photography&phrase=equirectangular%20panorama%20beach&sort=best
                    Note that it still ends up with a big greenland
                azimuthal equidstant
            equal area - "tunnel distance", surprisingly! geologists use it
        Leads onto the central controversy: Mercator, Gall Peters
        Mercator most famous, most controversial. We'll get to its mathematical construction in a second, but it's important to understand the story behind it first
            Transverse mercator: just rotate it 90 degrees
            demonstrate greenland again and madagascar, maybe canada and northern russia
            [improvise. China, his country being undistorted, mercator good for direction but not length/area]
            Greeks, Chinese, Persians, Egyptian, Russian
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
        Thank you to Paul Bourke and NASA for these textures
        Christopher Kitrick Dymaxion https://www.researchgate.net/publication/334307604_Dymaxion_Map_Transformations_-_Technical_White_Paper

        Gall Peters distorts Colombia

    Title (look at the existing ones...)
        4 ways to make a politically correct map - and 4 ways to make a politically incorrect one!
        How map projections ACTUALLY work
        Can we use math to make a non-racist map? (this video is mostly not about racism...)
        The actual geometry behind map projections
        Top 10 politically-correct world maps
        Top 10 world maps that avoid being racist
        Top 5 anti-racist world maps
        How racist is your map?
        Which is least racist?
        Can we make a less racist map?
        Making the least racist map
        Top 8 map projections?

    This is for viewers of:
        3b1b who don't like putting viz and equation together in their head
        Viewers of sebastian lague or code parade who, er, don't use unity?
        Viewers of inigo quilez or chris deleon shader coding videos who want something readable
        Numberphile viewers who want more viz
*/

async function initWorldMap() {
    const vsSource = cameraAndFrameCountShaderStuff.header + `
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

            // p = globe(lon,lat);

            // Interrupted sinusoidal is better in terms of thinking about the pole, and more compatible with GA, and easier
            {
                float stripIndex = 0.;
                if(lat > 0.) {
                    float cutoff = 116.;
                    if(uv.x < cutoff/256. )
                        stripIndex = cutoff/2.;
                    else
                        stripIndex = 158.;
                }
                else {
                    float cutoff0 = 116.;
                    float cutoff1 = 182.;
                    if(uv.x < cutoff0/256. )
                        stripIndex = cutoff0/2.;
                    else if(uv.x < cutoff1/256.)
                        stripIndex = (cutoff0+cutoff1)/2.;
                    else 
                        stripIndex = 256. - (256.-cutoff1)/2.;
                }
                float stripCenterAtEquatorLon = TAU * stripIndex / 256. - PI;
                float stripCenterAtEquatorMapped = stripCenterAtEquatorLon;

                p.x = (lon-stripCenterAtEquatorLon) * cos(lat) + stripCenterAtEquatorMapped;
                p.y = lat;
            }

            //Wagner VI
            // p.x = lon * sqrt(1.-1.*sq(lat/PI));
            // p.y = lat;

            //al-biruni: azimuthal equidistant

            // mecca/Craig retroazimuthal. Needs different mesh
            // float osscilating = .5 + .5 * sin(frameCount * .01);
            // float meccaLat = 0.37331021903; //* oscillating;
            // float meccaLon = 0.69565158793;
            // p.x = lon - meccaLon;
            // p.y = p.x / sin(p.x) * (sin(lat)*cos(p.x)-tan(meccaLat)*cos(lat));
            // p.xy *= 3.;
            //assume lon = meccalon
            // sin(lat)-tan(meccaLat)*cos(lat)
            // 

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

            // Bonne, sinusoidal, werner
            // float lat1 = PI / 2. * (.5+.5*sin(frameCount * .05));
            // if(abs(lat1) < .01) { //sinusoidal. Seems projective!
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

            dqSandwich(p, transform);
            
            gl_Position = p;
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = cameraAndFrameCountShaderStuff.header + `
        varying vec2 uv;
        varying vec4 p;

        uniform sampler2D sampler;

        void main(void) {
            // .x + 8./256. if you want Asia intact
            vec4 texelColor = texture2D(sampler, vec2(uv.x,1.-uv.y)); //1- because jfc opengl

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const program = new Program(vsSource, fsSource)
    cameraAndFrameCountShaderStuff.locateUniforms(program)
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
        // transform.idealLine[0] = Math.sin(frameCount*0.01)
    }) 

    addRenderFunction( () => {
        gl.useProgram(program.glProgram);

        program.prepareVertexAttribute("uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.getUniformLocation("sampler"), 0);

        cameraAndFrameCountShaderStuff.transfer(program)
        gl.uniform1f(program.getUniformLocation("frameCount"), frameCount);

        transferDualQuat(transform,"transform",program)

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    })
}

