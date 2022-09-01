function initAppearances() {

    let worldCenter = new THREE.Vector4()
    let scratchArray = new Float32Array(16)

    forEachUsedAppearance = (func) => {
        appearanceTypes.forEach((appearanceType) => {
            for (let i = 0; i < appearanceType.lowestUnusedAppearance; ++i)
                func(appearanceType.appearances[i])
        })
    }

    //the thing you want is to hover the "mat4[20] bones;" mention and see the skeleton

    class Appearance {
        variable //but, this.variable.type is not necessarily the type that created this =/
        state
        stateOld
        col = new THREE.Color() //why this bit of state?

        uniform = { value: null }

        visible

        meshes

        onGrab(dw) { }
        onLetGo(dw) { }

        updateFromState() {
            if (!this.stateEquals(this.stateOld)) {
                this.updateUniformFromState()
                this.updateMeshesFromState()
                this.stateCopyTo(this.stateOld)
            }
        }

        getLiteralAssignmentFromState() {
            this.stateToFloatArray(scratchArray)

            let commaSeparated = ""
            for (let i = 0, il = this.variable.type.numFloats; i < il; ++i) {
                let asStr = parseFloat(scratchArray[i].toFixed(2))
                if (asStr === Math.round(asStr))
                    asStr += "."
                commaSeparated += asStr + (i === il - 1 ? "" : ",")
            }

            return this.variable.type.glslName + "(" + commaSeparated + ")"
        }

        updateStateFromDrag(dw) {
            let result = this._updateStateFromDrag(dw)
            if (result === false)
                console.error(this.variable.name + " is not in dw " + keyOfProptInObject(dw, dws))
        }

        isVisibleInDw(dw) {
            if (!this.visible)
                return false

            if (this.variable.isIn && dw === dws.mesh)
                return true

            let ret = false
            // if (this.variable.name === `ourMats`)
            //     debugger
            this.meshes.forEach((m) => {
                if (!m.position.equals(OUT_OF_SIGHT_VECTOR3) && dw.inScene(m))
                    ret = true
            })

            return ret
        }
        setVisibility(newVisibility) {
            this.visible = newVisibility
            this.meshes.forEach((m) => {
                m.visible = newVisibility
            })
        }

        getWindowCenter(dw) {
            this.getWorldCenter(dw, worldCenter)
            return dw.worldToWindow(worldCenter)
        }

        getTextareaManipulationDw() {
            return this.variable.isIn ? dws.mesh : this._getTextareaManipulationDw()
        }

        //changed in array
        stateEquals(otherState) {
            // log(this.state,otherState)
            return this.state.equals(otherState)
        }
        stateCopyTo(toCopyTo) {
            toCopyTo.copy(this.state)
        }

        //These get overridden
        updateUniformFromState() { } //for most, uniform.value === state, so nothing need happen

        floatArrayToState(floatArray) {
            this.state.fromArray(floatArray)
        }
        stateToFloatArray(floatArray) {
            this.state.toArray(floatArray)
        }
    }
    window.Appearance = Appearance

    //note that this is agnostic of variables and mentions
    class AppearanceType {

        glslName
        numFloats
        constructAppearance
        outputAssignmentPropts
        declRegexes = {}
        literalAssignmentFromOverride

        //so this SHOULDN'T be a property of the variable, becaaaause, a variable can have both its array and its entries
        //a mention can be an array or an entry in that array, and that is two kinds of appearance
        isArray

        lowestUnusedAppearance = 0
        appearances = []

        nonArrayType = null
        arrayLowestUnusedAppearance = 0
        arrayAppearances = []

        constructor(glslName, numFloats, constructAppearance, getNewUniformValue, outputAssignmentPropts, omitPeriod, isArray) {
            this.glslName = glslName
            this.numFloats = numFloats
            this.constructAppearance = constructAppearance
            this.getNewUniformValue = getNewUniformValue
            
            this.isArray = isArray || false
            
            this.outputAssignmentPropts = Array(numFloats)
            if (outputAssignmentPropts !== undefined) {
                for (let i = 0; i < this.numFloats; ++i)
                    this.outputAssignmentPropts[i] = (omitPeriod ? `` : `.`) + outputAssignmentPropts[i]
            }
            else {
                for (let i = 0; i < this.numFloats; ++i)
                    this.outputAssignmentPropts[i] = `[` + i + `]`
            }

            this.declRegexes.function = new RegExp('(?<=[^a-zA-Z_$0-9])(' + glslName + ')\\s+[a-zA-Z_$][a-zA-Z_$0-9]*\\(', 'gm')
            if(!isArray) {
                this.declRegexes.uniform  = new RegExp('\\s*uniform\\s+('     + glslName + ')\\s', 'gm')
                this.declRegexes.in       = new RegExp('\\s*in\\s+('          + glslName + ')\\s', 'gm')
                this.declRegexes.all      = new RegExp('(?<=[^a-zA-Z_$0-9])(' + glslName + ')\\s+[a-zA-Z_$][a-zA-Z_$0-9]*', 'gm')
            }
            else {
                this.declRegexes.uniform  = new RegExp('\\s*uniform\\s+('     + glslName + ')\\[', 'gm')
                this.declRegexes.in       = new RegExp('\\s*in\\s+('          + glslName + ')\\[', 'gm')
                this.declRegexes.all      = new RegExp('(?<=[^a-zA-Z_$0-9])(' + glslName + ')\\[\\d+\\]\\s+[a-zA-Z_$][a-zA-Z_$0-9]*', 'gm')
            }
            //the declaration will be vec3 foo[31]

            let commaSeparated = ``
            for (let i = 0; i < this.numFloats; ++i)
                commaSeparated += `overrideFloats[` + i + `]` + (i === this.numFloats - 1 ? `` : `,`)
            this.literalAssignmentFromOverride = this.glslName + `(` + commaSeparated + `)`

            appearanceTypes.push(this)
        }

        getLowestUnusedAppearanceAndEnsureAssignmentToVariable(variable, uniformValue) {            
            let appearance = null
            let needNewOne = this.lowestUnusedAppearance === this.appearances.length
            if (!needNewOne)
                appearance = this.appearances[this.lowestUnusedAppearance]
            else {
                appearance = new this.constructAppearance(variable.arrayLength || -1, uniformValue)
                if (appearance.uniform.value !== appearance.state)
                    appearance.uniform.value = this.getNewUniformValue()
                this.appearances.push(appearance)
            }

            appearance.variable = variable
            appearance.col.copy(variable.col)

            ++this.lowestUnusedAppearance

            return appearance
        }
    }
    window.AppearanceType = AppearanceType
}