/*
    If you were to make a GA-products fighting game, what would it be like?
    Your avatars are flailing tentacle/cloud things, but there are bits you can lock onto
    

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

function initCompilation(dws)
{
    let finalMesh = FullScreenQuad(new THREE.ShaderMaterial())
    dws.final.scene.add(finalMesh)

    let nameRegex = /([a-zA-Z_$][a-zA-Z_$0-9]*)/g
    let glslReservedRegex = Prism.languages.glsl.keyword
    let lineDividingRegex = /^.*(\r?\n|$)/mg

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

        box = {x:0.,y:0.,w:0.};

        shader = "";

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

    gl_Position = projectionMatrix * modelViewMatrix * (vec4(position, 0.) + myVec4);
}`
    let mainImagePointToFragColorSuffix = `
uniform mat4 projectionMatrix;

void main() {
    vec4 myVec4;
    mainImage(myVec4);

    vec4 clipspacePos = projectionMatrix * viewMatrix * myVec4;

    //you get 4 values, each 8-bit

    vec2 minusOneToOne = clipspacePos.xy / clipspacePos.w;
    //the z value is correct but we don't need it

    gl_FragColor = vec4((minusOneToOne + vec2(1.))/2.,0.,0.);
}`
//alternatively: have camera X and Y axes. They're at its position
//and camera viewing direction. Join lines with that point to get two planes
//for a point, join it with those lines too. Take 
//And camera x and y lines, which these planes pass th

    {
        let measurer = document.getElementById("measurer")
        var characterWidth = parseInt(window.getComputedStyle(measurer).width) / 40.

        let style = window.getComputedStyle(textarea)
        let lineHeight = parseInt(style.lineHeight)

        let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like

        function setSvgLine(svgLine,x1,y1,x2,y2) {
            svgLine.x1.baseVal.value = x1
            svgLine.y1.baseVal.value = y1
            svgLine.x2.baseVal.value = x2
            svgLine.y2.baseVal.value = y2
        }

        function stringToScreen(index,line,target) {
            target.x = index * characterWidth + textAreaOffset
            target.y = line * lineHeight + textAreaOffset
        }

        textarea.addEventListener('mousemove', (event) => {
            setSvgLine(labelLine,  -10, -10, -10, -10)
            setSvgLine(labelSide1, -10, -10, -10, -10)
            setSvgLine(labelSide2, -10, -10, -10, -10)
            setSvgLine(labelSide3, -10, -10, -10, -10)
            setSvgLine(labelSide4, -10, -10, -10, -10)
            
            mentions.every((mention) => {
                let mb = mention.box
                let mouseInBox =
                    mb.x <= event.clientX && event.clientX < mb.x + mb.w &&
                    mb.y <= event.clientY && event.clientY < mb.y + lineHeight

                if (mouseInBox) {
                    let [xOnCanvas,yOnCanvas] = getShaderOutput(mention.shader + mainImagePointToFragColorSuffix)
                    let allVariablesRect = dws.allVariables.elem.getBoundingClientRect()

                    setSvgLine(labelLine, 
                        mb.x + mb.w, 
                        mb.y + lineHeight / 2.,
                        allVariablesRect.x + allVariablesRect.width * xOnCanvas,
                        allVariablesRect.y + allVariablesRect.height * (1.-yOnCanvas))

                    setSvgLine(labelSide1,mb.x, mb.y, mb.x + mb.w, mb.y)
                    setSvgLine(labelSide2,mb.x + mb.w, mb.y, mb.x + mb.w, mb.y + lineHeight)
                    setSvgLine(labelSide3,mb.x + mb.w, mb.y + lineHeight, mb.x, mb.y + lineHeight)
                    setSvgLine(labelSide4,mb.x, mb.y + lineHeight, mb.x, mb.y)
                }

                return !mouseInBox
            })
        })
    }

    compile = async () => {

        //could use this as a check for problems with the shader - don't do the below if it's bad
        //triggering a recompile isn't easy though
        finalMesh.material.fragmentShader = textarea.value + mainImageToFragColorSuffix
        finalMesh.material.needsUpdate = true

        
        mentions.forEach((mention) => {
            if (mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED)
            mention.presenceLevel = PRESENCE_LEVEL_UNCONFIRMED
        })
        
        let nameNumMentions = {}    
        
        let notConsideredNamesRegex = /\b(?:fragColor|mainImage|x|y|z|w)\b/
        
        let bracesDeep = 0
        let strSoFar = ""
        let lines = textarea.value.match(lineDividingRegex)

        lines.forEach((l,lineIndex) => {
            strSoFar += l

            //this doesn't even necessarily work
            //could break up by {,},;,
            if (l.indexOf("{") !== -1)
                ++bracesDeep
            if (l.indexOf("}") !== -1)
                --bracesDeep

            let matches = [...l.matchAll(nameRegex)]
            if(matches === null)
                return
            matches.forEach((match)=>{
                let name = match[0] //it's in 1 as well
                if ( glslReservedRegex.test(name) || notConsideredNamesRegex.test(name) )
                    return

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

                stringToScreen(match.index, lineIndex,mention.box)
                mention.box.w = name.length * characterWidth

                //this assumes, of course, that type is "point"
                //type has been specified by the user, along with the color

                mention.shader = strSoFar + `\nfragColor = ` + name + `;\n` + "}\n".repeat(bracesDeep)
            })
        })

        mentions.forEach((mention) => {
            if(mention.presenceLevel === PRESENCE_LEVEL_CONFIRMED) {
                if (mention.mat.vertexShader !== mention.shader + mainImageToSpherePositionSuffix) {
                    mention.mat.vertexShader = mention.shader + mainImageToSpherePositionSuffix
                    mention.mat.needsUpdate = true
                }
                mention.meshes.forEach((mesh) => {
                    if (mesh.parent === dws.allVariables.scene)
                        mesh.visible = true
                })
            }
            else if (mention.presenceLevel === PRESENCE_LEVEL_UNCONFIRMED) {
                mention.meshes.forEach((mesh) => { mesh.visible = false })
                mention.presenceLevel = PRESENCE_LEVEL_DELETED
            }
        })
        //this doesn't guarantee that you're using them as much as possible, just that they'll be cleared up on the next one

        //so, you're going to save this out
        //with information about the locations, on the page, of the mentions,
        //for the hover stuff
        //because what if you compile, it makes a picture, you change the code but don't compile, hover the picture...

        delete nameNumMentions
    }
}