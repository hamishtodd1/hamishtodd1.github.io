/*
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

function initCompilation(dws,finalMesh)
{
    let nameRegex = /([a-zA-Z_$][a-zA-Z_$0-9]*)/g
    let glslReservedRegex = Prism.languages.glsl.keyword

    //it's totally impractical to have a "mention" for literally every mention
    //at the same time, EVEN IF YOU DO make a "variable has been edited on this line"
    //  just because it's not edited on that line doesn't mean you don't want to see it!
    //some amount of "you have to click it" is ok
    //or maybe, "if you've scrolled away from all those mentions". Maybe we go from top of window

    let pointGeo = new THREE.SphereBufferGeometry(.07, 32, 16)
    const PRESENCE_LEVEL_UNCONFIRMED = -1
    const PRESENCE_LEVEL_CONFIRMED = 1
    const PRESENCE_LEVEL_DELETED = 0
    class Mention {
        name;
        
        mentionsFromStart;

        presenceLevel = PRESENCE_LEVEL_DELETED;

        mat = new THREE.ShaderMaterial();
        meshes = [];

        addMeshToDw(dw) {
            let mesh = new THREE.Mesh(pointGeo, this.mat)
            mesh.castShadow = true
            mesh.visible = false
            mesh.matrixAutoUpdate = false
            dw.scene.add(mesh)
            this.meshes.push(mesh)
        };

        constructor() {
            this.mat.fragmentShader = basicFragment
            let self = this
            for(let dwName in dws)
                self.addMeshToDw(dws[dwName])
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

    compile = async () => {

        //could use this as a check for problems with the shader - don't do the below if it's bad
        //triggering a recompile isn't easy though
        finalMesh.material.fragmentShader = textarea.value + mainImageToFragColorSuffix
        finalMesh.material.needsUpdate = true

        let lines = textarea.value.match(/^.*(\r?\n|$)/mg)
        
        mentions.forEach((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED)
                mention.presenceLevel = PRESENCE_LEVEL_UNCONFIRMED
        })
        
        let nameNumMentions = {}    
        
        let notConsideredNamesRegex = /\b(?:fragColor|mainImage|x|y|z|w)\b/
        
        let bracesDeep = 0
        let strSoFar = ""
        lines.forEach((l) => {
            strSoFar += l

            //this doesn't even necessarily work
            //could break up by {,},;,
            if (l.indexOf("{") !== -1)
                ++bracesDeep
            if (l.indexOf("}") !== -1)
                --bracesDeep

            let possibleNames = l.match(nameRegex)
            if(possibleNames === null)
                return
            possibleNames.forEach((name)=>{
                if ( glslReservedRegex.test(name) || notConsideredNamesRegex.test(name) )
                    return

                log(name)

                //we assume that stuff is limited to a line
                //All that's relevant is on it
                //If we change it in its entirety, nothing will be lost

                if (nameNumMentions[name] === undefined)
                    nameNumMentions[name] = 0
                ++nameNumMentions[name]

                //in *theory* you could avoid having to recompile stuff that's below an edit. Hard!
                var mention = mentions.find((v) => v.name === name && v.mentionsFromStart === nameNumMentions[name])
                if (mention === undefined) {
                    mention = mentions.find((v) => v.presenceLevel === PRESENCE_LEVEL_DELETED)
                    if (mention === undefined) {
                        mention = new Mention()
                        mentions.push(mention)
                    }

                    mention.name = name
                    mention.mentionsFromStart = nameNumMentions[name]
                }
                
                mention.presenceLevel = PRESENCE_LEVEL_CONFIRMED

                //----------could move the below elswhere

                //this assumes, of course, that type is "point"
                //which has been specified by the user, along with the color
                let vertexShader = strSoFar
                vertexShader += `\nfragColor = ` + name + `;\n`
                for (let i = 0; i < bracesDeep; ++i)
                    vertexShader += "}\n"
                vertexShader += mainImageToSpherePositionSuffix

                if (mention.mat.vertexShader !== vertexShader) {
                    mention.mat.vertexShader = vertexShader
                    mention.mat.needsUpdate = true
                }
                mention.meshes.forEach((mesh) => {
                    if (mesh.parent === dws.allVariables.scene)
                        mesh.visible = true
                })
            })
        })

        mentions.forEach((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_UNCONFIRMED) {
                mention.meshes.forEach((mesh) => { mesh.visible = false })
                mention.presenceLevel = PRESENCE_LEVEL_DELETED
            }
        })
        //this doesn't guarantee that you're using them as much as possible, just that they'll be cleared up on the next one

        delete nameNumMentions
    }
}