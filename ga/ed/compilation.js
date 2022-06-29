/*
    //it's really ; that separates, not newline

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

        Also have the frag point in *3D* space
*/

async function initCompilation()
{
    let randomColor = new THREE.Color()

    class Variable {
        name
        col = new THREE.Color(0., 0., 0.)
        class
        lowestUnusedMention = 0
        mentions = []

        constructor(newName, newClass) {
            this.name = newName

            this.class = newClass

            randomColor.setHSL(Math.random(), 1., .5)
            this.col.r = randomColor.r; this.col.g = randomColor.g; this.col.b = randomColor.b;

            variables.push(this)
        }

        getLowestUnusedMention() {
            while(this.mentions.length <= this.lowestUnusedMention) {
                let newMention = new this.class(this)
                this.mentions.push(newMention)
            }

            return this.mentions[this.lowestUnusedMention++]
        }
    }

    const nameRegex = /(?<=[^a-zA-Z_$0-9])([a-zA-Z_$][a-zA-Z_$0-9]*)/g

    //if you want to use this, should probably replace with whitespace
    const commentNotNewlineRegex = /\/\/[^\n]*/gm

    //at the same time, EVEN IF YOU DO make a "variable has been edited on this line"
    //  just because it's not edited on that line doesn't mean you don't want to see it!
    //some amount of "you have to click it" is ok
    //or maybe, "if you've scrolled away from all those mentions". Maybe we go from top of window

    //used by three.js
    let errorBoxHidden = true
    hideErrorBoxIfNeeded = () => {
        if (!errorBoxHidden) {
            errorBox.style.top = "-200px" //TODO this is more for when you recompile
            errorBoxHidden = true
        }
    }

    let threejsIsCheckingForShaderErrors = false
    webglErrorThrower = (errorLine) => {

        if(!threejsIsCheckingForShaderErrors)
            return

        let errorParts = errorLine.split(":")
        //this could be a crazy number because who knows what's been prefixed for the first call
        const haphazardlyChosenNumber = 71
        let lineNumber = parseInt(errorParts[2]) - haphazardlyChosenNumber

        let errorContent = errorParts.slice(3).join(":")
        errorBox.textContent = errorContent
        errorBox.style.top = (lineToScreenY(.4 + lineNumber)).toString() + "px"
        errorBoxHidden = false

        threejsIsCheckingForShaderErrors = false
    }

    let types = Object.keys(mentionClasses)
    let declRegexes = {}
    types.forEach((type)=>{
        declRegexes[type] = new RegExp('(?<=[^a-zA-Z_$0-9])(' + type + ')\\s*[a-zA-Z_$][a-zA-Z_$0-9]*', 'gm')
    })

    compile = async () => {

        let text = textarea.value
        if (text.indexOf("/*") !== -1 || text.indexOf("*/") !== -1) {
            console.error("multi-line comments not supported")
            return
        }

        text = text.replace(commentNotNewlineRegex,"")
        
        let ignoringDueToStruct = false
        let textLines = text.split("\n")
        let finalChunks = Array(textLines.length)
        let outputterChunks = Array(textLines.length)
        let mentionIndex = 0
        //we assume that stuff is limited to a line
        //All that's relevant is on it
        //If we change it in its entirety, nothing will be lost
        textLines.forEach((l,lineIndex) => {

            if (!ignoringDueToStruct && l.indexOf("struct") !== -1)
                ignoringDueToStruct = true
            else if (l.indexOf("}") !== -1)
                ignoringDueToStruct = false
            if(ignoringDueToStruct)
                return

            finalChunks[lineIndex] = l
            outputterChunks[lineIndex] = l

            types.forEach((type) => {
                let indicesOfResults = [...l.matchAll(declRegexes[type])].map(a => a.index) //maybe don't make the regex anew every time...
                //bit concerned about types inside eg variable names
                indicesOfResults.forEach((index)=>{
                    let name = l.slice(index + type.length).match(nameRegex)[0]

                    let variable = variables.find((v) => v.name === name)
                    if (variable === undefined)
                        variable = new Variable(name, mentionClasses[type])
                    variable.lowestUnusedMention = 0
                })
            })

            //want a regex for each name you've found
            let matches = [...l.matchAll(nameRegex)]
            matches.forEach((match)=>{
                let name = match[0]
                let variable = variables.find((v) => v.name === name)
                if( variable === undefined)
                    return

                let mention = variable.getLowestUnusedMention()

                mention.lineIndex = lineIndex
                mention.mentionIndex = mentionIndex++

                let overrideAddition = `\n               if( overrideMentionIndex == ` + mention.mentionIndex + ` ) ` + 
                    mention.getReassignmentNew(true) + "; " 
                let outputAddition   = `\n               if( outputMentionIndex == ` + mention.mentionIndex + ` ) {\n` +
                    mention.getShaderOutputFloatString() + `}`
                finalChunks[lineIndex] += overrideAddition
                outputterChunks[lineIndex] += overrideAddition + outputAddition

                updateHorizontalBounds(match.index, name.length, mention.horizontalBounds)
            })
        })

        threejsIsCheckingForShaderErrors = true
        
        updateOutputterFragmentShader(outputterChunks.join("\n"))
        updateFinalDw(generalShaderPrefix + finalChunks.join("\n"))

        lowestChangedLineSinceCompile = Infinity
        updateChangedLineIndicator()

        mentions.forEach((mention) => {
            mention.updateFromShader()
        })
    }
}