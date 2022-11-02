/*

    You have to write it all out as code by hand
    Then, ascribe particular in the equation to the variables

    The purpose of this is just to go in the video


    Show them vector algebra to get them used to things:
        matrix * vector
        vector . vector

    a ^ b, a*b, a.b for various things
    <A>n for various motors

    To show what you’re familiar with:
    a X b = (a ^ b) * e123 - God would never use the cross product. Why not b^a?
    angle from v to u = u_pt* ^ v_pt*


 */

async function initEquations() {
    equationsShaders = [
        `
float a = 2.;
float b = 1.;
float c = a + b;
        `
    ]
    await init(true)
    // dws.untransformed.elem.style.display = `none`
    // dws.final.elem.style.display = `none`

    onMathJaxLoad = () => {
        let mathId = document.getElementById(`someid`)
        mathId.addEventListener(`mouseover`, () => {
            log(`in`)
        })
        mathId.addEventListener(`mouseleave`, () => {
            log(`out`)
        })
    }

    //yes, hacky. But MathJax requires npm for any kind of callback.
    let alreadyDone = false
    updateFunctions.push(()=>{
        if (alreadyDone)
            return

        let mathId = document.getElementById(`someid`)
        if(mathId === null)
            return
        else {
            onMathJaxLoad()
            alreadyDone = true
        }
    })
}