function irToCode(bodyAndMaybeMore,glslInsteadOfJs, numTmvs, namesWithLocalizationNeeded, internalDeclarations) {
    if (glslInsteadOfJs) {

        for (let i = 0; i < numTmvs; ++i)
            bodyAndMaybeMore.body = `float tMv` + i.toString() + `[16];\n`
                + bodyAndMaybeMore.body

        copyStringArray(namesWithLocalizationNeeded, bodyAndMaybeMore.namesWithLocalizationNeeded)

        if (internalDeclarations !== undefined) {
            internalDeclarations.forEach((declaredName) => {
                bodyAndMaybeMore.body = `float ` + declaredName + `[16];\n`
                    + bodyAndMaybeMore.body
            })
        }
    }
    else {
        for (let i = 0; i < numTmvs; ++i)
            bodyAndMaybeMore.body = `let tMv` + i.toString() + ` = new Float32Array(16);\n`
                + bodyAndMaybeMore.body
                + `\ndelete tMv` + i.toString() + `;`

        namesWithLocalizationNeeded.forEach((name) => {
            bodyAndMaybeMore.body = `let ` + name + ` = getNameDrawerProperties("` + name + `").value;\n`
                + bodyAndMaybeMore.body
        })

        if (internalDeclarations !== undefined) {
            internalDeclarations.forEach((declaredName) => {
                bodyAndMaybeMore.body = `let ` + declaredName + ` = new Float32Array(16);\n`
                    + bodyAndMaybeMore.body
                    + `\ndelete ` + declaredName + `;`
            })
        }

        (Object.keys(functionsWithIr)).forEach((name) => {
            bodyAndMaybeMore.body = "let " + name + " = functionsWithIr." + name + ".jsFunction;\n"
                + bodyAndMaybeMore.body
        })
    }
}

function initFunctionWithIrs() {

    //ok so you want to have fMv0 used as py

    FunctionWithIr = function(name) {
        this.ir = "UNUSED"
        this.stillDefinedInProgram = true
        this.glslBody = ""
        this.jsFunction = null

        this.maxTmvs = -1,

        this.length = -1
        this.internalDeclarations = []
        this.namesWithLocalizationNeeded = []
        this.argumentsInSignature = []

        this.name = name
        functionsWithIr[name] = this
    }
    FunctionWithIr.prototype.setIr = function (transpilingFunctionProperties) {
        // debugger
        this.stillDefinedInProgram = true

        let tfp = transpilingFunctionProperties
        if (tfp.ir === this.ir)
            return
            
        if(tfp.internalDeclarations.length < 1)
            return
        
        copyStringArray(tfp.internalDeclarations, this.internalDeclarations)
        copyStringArray(tfp.argumentsInSignature, this.argumentsInSignature)
        
        this.length = tfp.argumentsInSignature.length + 1 // because target. Urgh, fairly dumb name

        this.ir = tfp.ir

        this.maxTmvs = tfp.maxTmvs

        this.irToFunctionString(true, tfp.namesWithLocalizationNeeded)
        this.irToFunctionString(false, tfp.namesWithLocalizationNeeded)

        //and rewrite the stuff it gets used in?
        //the shaders should know where they're getting it from

        //for more aribtrary types defined in the editor, you could compile the function into a string containing stuff like "gl.uniform1f" and so on
    }
    FunctionWithIr.prototype.irToFunctionString = function(glslInsteadOfJs, namesWithLocalizationNeeded) {

        let finalAssignment = this.internalDeclarations.length !== 0 ?
            "\nassign(" + this.internalDeclarations[this.internalDeclarations.length - 1] + ",target);" :
            "\nzeroMv(target);"

        let self = this
        let chunks = {
            body: self.ir + finalAssignment,
            namesWithLocalizationNeeded: self.namesWithLocalizationNeeded
        }
        //using the last declared variable makes more sense than "return", because you deffo want to see the result
        // if(this.name === "stereographic" &&glslInsteadOfJs === false)
        //     debugger
        irToCode(chunks, glslInsteadOfJs, this.maxTmvs, namesWithLocalizationNeeded, this.internalDeclarations)

        let numNonTargetArguments = this.argumentsInSignature.length
        let signature = ""
        if (glslInsteadOfJs) {
            signature += `void ` + this.name + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `in float ` + this.argumentsInSignature[i] + `[16],` //altenratively, the actual names
            signature += `out float target[16])`
        }
        else {
            signature += `function ` + this.name + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += this.argumentsInSignature[i] + `,`
            signature += `target)`
        }

        let str = signature +
            "\n{\n" +
            chunks.body +
            "\n}"

        if(glslInsteadOfJs) {
            this.glslBody = str
        }
        else {
            //fairly insane
            // debugger
            eval(str)
            this.jsFunction = eval(this.name)
        }
    }

    new FunctionWithIr("reflectHorizontally")
    functionsWithIr["reflectHorizontally"].setIr({
        internalDeclarations: ["fMv0", "fMv1", "fMv2"],
        namesWithLocalizationNeeded: [],
        argumentsInSignature: ["ourInput"],
        maxTmvs: 0,
        ir:
            `
            plane(fMv0,1.,0.,0.,0.);
            gProduct(fMv0,ourInput,fMv1);
            gProduct(fMv1,fMv0,fMv2);
            `
    })

    // new FunctionWithIr("craig")
    // functionsWithIr["craig"].setIr({
    //     internalDeclarations: ["fMv0"],
    //     namesWithLocalizationNeeded: [],
    //     argumentsInSignature: ["ourInput"],
    //     maxTmvs: 0,
    //     ir:
    //         `
    //     //need lat and lon

    //         pointX(fMv0,lon - 0.69565158793); //meccaLon
    //         pointY(fMv0,pointX(tMv2) / sin(pointX(tMv2)) * (sin(lat)*cos(pointX(tMv2))-tan(0.37331021903)*cos(lat)))


    //         // float osscilating = .5 + .5 * sin(frameCount * .01);
    //         // float meccaLat = 0.37331021903; //* oscillating;
    //         // float meccaLon = 0.69565158793;
    //         // p.x = lon - meccaLon;
    //         // p.y = p.x / sin(p.x) * (sin(lat)*cos(p.x)-tan(meccaLat)*cos(lat));
    //         // p.xy *= 3.;
    //         // 
    //         `
    // })
}