/*
    Use of the algebra
        mercator(picture of a globe) = abs(log(centralCylindrical(picture of a globe)))
        linalg may be sufficient, since you are stuck at the origin

    Could just... show the things, then say at the end, here's where you can find the code
    A single "step forward" button like powerpoint
    And have a separate video for patrons where you step through the code


    TODO
        General
            Two dws side by side
            Clicker to go through them
            flight path
            make sure greenland works nicely
            ordinary pictures showing up
        Dymaxion

    Script 2
        Intro
            Very varied. Tell you something about geometry and about the different things people use maths for
            We will get onto the political controversy surrounding the relative sizes of Greenland and Africa (demonstrate it)
            but honestly, it's very useful and fun to understand the mathematics first

        ---------------------------------------
        NOT SURE WHAT ORDER

        Dymaxion
            Consciously ignores up/down, equator/poles
            Goode homolosine, myriahedral
            Flight path. People want one unbroken
        Azimuthal equidistant
            Al biruni
            North Korea's missile radii, UN
            Distorts shapes
        Sinusoidal-derived
            Area preserving, and length preserving along the parallels and meridians
            old pics
        Stereographic
            15th century map, astrolabe
            probably known to ancient egyptians
            Conformal: Wonderful for shapes+directions, crap for lengths and areas
        Lambert Conic
            Conformal like stereographic
        Lambert cylindrical equal area
            Rectangular, terrible idea
            Equator is the only place that it's right
            Arctic circle

        -----------------------------------
        Let's have a look at some politically incorrect ones.
        Central cylindrical
            Greenland huge, not what you were expecting
        Mercator
            Conformal, show flight path
            "Default"
            Greenland, madagascar, maybe canada Russia
        Gall-Peters
            Hugely distorts shapes. Back to mercator, they're ok
            There was a white guy who wanted to make a quick buck
            Instead of equator being correct, equator gets stretched and the one place it's ok is Germany
        equirectangular
            Simple
            Flight path
            Panorama, probably Siena, see below
            Show unwrap of panorama
            At least used by the chinese
        Wagner / Kavrayskiy
            Pills are a "compromise", no equal area
        Craig retroazimuthal
            Good for one purpose
            Doesn't aspire to realistically depict the earth
        Just be aware that there are different ways of doing it,
            whether you're trying to see how humans spread across the world,
            or find the direction to Mecca
            or showing climate or epidemeological data
            or navigate a boat or plane
        

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
    Credits
        https://www.istockphoto.com/photo/360-degree-equirectangularl-panorama-of-piazza-del-campo-siena-gm1209474588-350003697
        stereographic https://www.oldworldauctions.com/catalog/lot/171/13
        Paul Bourke and NASA for these textures
        https://alchetron.com/Arno-Peters
        https://www.pbs.org/wnet/americanmasters/r-buckminster-fuller-about-r-buckminster-fuller/599/
        Christopher Kitrick Dymaxion https://www.researchgate.net/publication/334307604_Dymaxion_Map_Transformations_-_Technical_White_Paper

    This is for viewers of:
        3b1b, Sebastian lague, Code parade, Inigo quilez, Chris deleon, Numberphile viewers
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

