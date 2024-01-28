async function initEga() {

    //newEga is not a variable name. It is equivalent to `new Ega()`
    
    var strToEval = `(()=>{`
    let declarations = ``
    let i = 0
    function newify(startStr) {

        startStr = startStr.slice(startStr.indexOf(`{`) + 1, startStr.indexOf(`/*END*/}`))

        function replacementNews(bigStr, str) {
            return bigStr.replaceAll(`new` + str, () => {
                declarations += `\n    let new` + str + i + ` = new ` + str + `()`
                return `new` + str + (i++)
            })
        }
        strToEval += replacementNews(replacementNews(startStr, `Dq`), `Fl`)
    }

    newify(initMultivectorWithoutDeclarations.toString())

    let fullFuncString = initEgaWithoutDeclarations.toString()
    let funcString = fullFuncString
        .replace(`/*flVerbose*/`, flVerbose)
        .replace(`/*dqVerbose*/`, dqVerbose)
    newify(funcString)

    strToEval += declarations + `})()`
    // log(strToEval)
    eval(strToEval)

    //////////
    // GLSL //
    //////////

    function generalReplacements(str) {
        return `void ` + str
            .replaceAll(`\n    if (target === undefined)\n        target = new Fl()\n`, ``)
            .replaceAll(`\n    if (target === undefined)\n        target = new Dq()\n`, ``)
            .replaceAll(`}\n\n`, `}\n\nvoid `)
            .replaceAll(`\n\n    return target`, ``)
            .replaceAll(`target)`, `out float[8] target)`)
            .replaceAll(`(b`, `( in float[8] b`)
            .replaceAll(`(`,  `( in float[8] a,`)
            .replaceAll(`this[`, `a[`)
    }

    egaVerboseGlsl =
        generalReplacements(flVerbose)
        .replaceAll(`Dq(`, `FlDq(`)
        .replaceAll(`Fl(`, `FlFl(`)
        .replace(`getReverse`,`getReverseFl`)
        .replace(`getDual`,`getDualFl`)
        .replace(`joinPt`,`joinFlPt`)
        + generalReplacements(dqVerbose)
        .replaceAll(`Dq(`, `DqDq(`)
        .replaceAll(`Fl(`, `DqFl(`)
        .replace(`getReverse`,`getReverseDq`)
        .replace(`getDual`,`getDualDq`)
        .replace(`joinPt`,`joinDqPt`)

    // log(egaVerboseGlsl)
}

function initDqMeshes()
{
    let dqMeshes = []
    let finalDq = new Dq()
    class DqMesh extends THREE.Mesh {

        constructor(geo, mat) {
            super(geo, mat)
            this.matrixAutoUpdate = false
            this.dq = new Dq().copy(oneDq)
            this.dqParent = scene

            dqMeshes.push(this)
        }

        onBeforeRender() {
            finalDq.copy(oneDq)
            this.prependTransform(finalDq) //umm, what? Maybe something about parenting?

            finalDq.normalize()
            finalDq.toMat4(this.matrix)
        }

        // getPosition(target) {

        // }

        prependTransform(target) {
            target.prepend(this.dq)
            if (this.dqParent !== scene)
                this.dqParent.prependTransform(target)
            return target
        }
    }
    window.DqMesh = DqMesh
}