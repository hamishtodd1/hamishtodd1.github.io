function initTranspiledFunctions() {

    let transpiledFunctions = []
    let transpiledFunctionNames = []

    getTranspiledFunction = (name) => {
        return transpiledFunctions[transpiledFunctionNames.indexOf(name)]
    }

    TranspiledFunction = function(name){

        transpiledFunctions.push(this)
        transpiledFunctionNames.push(name)

        let intermediateRepresentation = "" //eventually valid js or glsl

        let irUpdaters = []
        this.addIrUpdater = (updater) => {
            updater(this)
            irUpdaters.push(updater)
        }
        this.getIntermediateRepresentation = () => intermediateRepresentation

        this.setIntermediateRepresentation = function (newIr) {
            if (newIr !== intermediateRepresentation) {
                intermediateRepresentation = newIr

                for (let i = 0; i < irUpdaters.length; ++i)
                    irUpdaters[i](this)
            }
        }

        this.globeProjectionProgram = null
    }
}