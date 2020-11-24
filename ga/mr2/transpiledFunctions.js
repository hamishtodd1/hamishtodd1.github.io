function initTranspiledFunctions() {

    //type as well?
    TranspiledFunction = function(name){

        transpiledFunctions[name] = this

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