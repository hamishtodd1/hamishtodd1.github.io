function initNotation() {
    let typeableSymbols = `()*+-_~ .0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
    let specialSymbols = `∧∨·⤻` //Σ√
    let specialStandin = `^&'>` //£#
    let subscriptables = [`0`, `1`, `2`, `3`, `4`, `5`, `p`, `m`, `o`]
    let subscripts = [`₀`, `₁`, `₂`, `₃`, `₄`, `₅`, `ₚ`, `ₘ`, `𝅘`]

    let subscriptify = false
    function translateChar (char) {

        if (subscriptables.includes(char) && subscriptify) {
            let index = subscriptables.indexOf(char)
            return index === -1 ? char : subscripts[index]
        }
        else {

            if (char === `e`)
                subscriptify = true
            else
                subscriptify = false

            if (specialStandin.indexOf(char) !== -1)
                return specialSymbols[specialStandin.indexOf(char)]
            else if (typeableSymbols.indexOf(char) !== -1)
                return char
            else
                return ``

        }
    }

    translateExpression = (expression) => {
        subscriptify = false
        return expression.replace(/./g, translateChar)
    }
}