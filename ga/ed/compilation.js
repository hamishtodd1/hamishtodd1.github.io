function initCompilation(dws,finalMesh)
{
    let pointGeo = new THREE.SphereBufferGeometry(.04, 32, 16)
    const PRESENCE_LEVEL_UNCONFIRMED = -1
    const PRESENCE_LEVEL_CONFIRMED = 1
    const PRESENCE_LEVEL_DELETED = 0
    class Viz {
        name;
        linesFromStart;
        linesFromEnd;

        presenceLevel = PRESENCE_LEVEL_DELETED;

        mat = new THREE.ShaderMaterial();
        meshes = [];

        addMeshToDw(dw) {
            let mesh = new THREE.Mesh(pointGeo, this.mat)
            mesh.castShadow = true
            mesh.visible = false
            dw.scene.add(mesh)
            this.meshes.push(mesh)
        };

        constructor() {
            this.mat.fragmentShader = basicFragment
            let self = this
            for(let dwName in dws) {
                self.addMeshToDw(dws[dwName])
            }
        }
    }

    let mainImageToFragColorSuffix = `
void main() {
    mainImage(gl_FragColor);
}`
    let mainImageToSpherePositionSuffix = `
void main() 
{
    vec4 myVec4;
    mainImage(myVec4);

    gl_Position = projectionMatrix * modelViewMatrix * (vec4(position, 1.) + myVec4);
}`

    // let declarationRegex = new RegExp("\s*vec4\s*[^\(]")
    // let nameRegex = new RegExp("[a-zA-Z_$][a-zA-Z_$0-9]*")
    let findNewNameRegex = /\s*vec4\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/

    compile = async () => {

        /*
            You're going to scan the thing for every single new variable
            Well let's say every vec4

            Currently we want:
                To get the name
                Make a subset of the shader which cuts off the shader on the line the user wants

            Bultins:
                Hand motor
                Things that shadertoy has:
                    uniform vec3 iResolution;
                    uniform float iTime;
                    uniform float iTimeDelta;
                    uniform float iFrame;
                    uniform float iChannelTime[4];
                    uniform vec4 iMouse;
                    uniform vec4 iDate;
                    uniform float iSampleRate;
                    uniform vec3 iChannelResolution[4];
                    uniform samplerXX iChanneli;
        */

        let lines = textarea.value.match(/^.*(\r?\n|$)/mg)
        // log(lines)
        let bracesDeep = 0

        vizes.forEach((viz) => {
            if (viz.presenceLevel === PRESENCE_LEVEL_CONFIRMED)
                viz.presenceLevel = PRESENCE_LEVEL_UNCONFIRMED
        })

        let strSoFar = ""
        let totalLines = lines.length
        lines.forEach((l, lineIndex) => {
            strSoFar += l

            if (l.indexOf("{") !== -1)
                ++bracesDeep
            if (l.indexOf("}") !== -1)
                --bracesDeep

            let matchResult = l.match(findNewNameRegex)
            if (matchResult !== null && matchResult[1] !== "fragColor") {

                //we're going to ASSUME this is a declaration line, no more, no less
                //we can do WHATEVER WE LIKE with it when user lets go of mouse

                let name = matchResult[1]

                let vertexShader = strSoFar
                vertexShader += `\nfragColor = ` + name + `;\n`
                for (let i = 0; i < bracesDeep; ++i)
                    vertexShader += "}\n"
                vertexShader += mainImageToSpherePositionSuffix

                let viz = vizes.find((v) =>
                    v.name === name &&
                    (v.linesFromStart === lineIndex ||
                        v.linesFromEnd === totalLines - lineIndex)
                    //could have... index from end as well as beginning
                    //vital to figure out which ones are "old"
                    //those are the ones you've decided you want in the windows
                )

                if (viz === undefined) {
                    viz = vizes.find((v) => v.presenceLevel === PRESENCE_LEVEL_DELETED)
                    if (viz === undefined) {
                        viz = new Viz()
                        vizes.push(viz)
                    }
                    viz.name = name
                    viz.linesFromStart = lineIndex
                    viz.linesFromEnd = totalLines - lineIndex
                }

                if (viz.mat.vertexShader !== vertexShader) {
                    viz.mat.vertexShader = vertexShader
                    viz.mat.needsUpdate = true
                }

                viz.presenceLevel = PRESENCE_LEVEL_CONFIRMED
                viz.meshes.forEach((mesh) => {
                    if (mesh.parent === dws.standard.scene)
                        mesh.visible = true
                })
            }
        })

        vizes.forEach((viz) => {
            if (viz.presenceLevel === PRESENCE_LEVEL_UNCONFIRMED) {
                viz.meshes.forEach((mesh) => { mesh.visible = false })
                viz.presenceLevel = PRESENCE_LEVEL_DELETED
            }
        })
        //this doesn't guarantee that you're using them as much as possible, just that they'll be cleared up on the next one

        finalMesh.material.fragmentShader = textarea.value + mainImageToFragColorSuffix
        finalMesh.material.needsUpdate = true
    }
}