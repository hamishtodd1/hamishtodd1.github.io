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

hackyFunction = () => null

async function initEquations() {
    equationsShaders = [
        `
Plane e1 = Plane(0.,1.,0.,0.);
Plane e2 = Plane(0.,0.,1.,0.);
Dq e12 = Dq(0., 0.,0.,0., 1.,0.,0., 0.);
        `
    ]
    await init(true)
    zoomCameraToDist(3.7)
    // dws.untransformed.elem.style.display = `none`
    // dws.final.elem.style.display = `none`

    //ok, wanna hover

    hackyFunction = () => {
        return hoveredEquationMention
    }

    onMathJaxLoad = () => {
        let $element = document.getElementById(`someid`)
        $element.addEventListener(`mouseover`, (event) => {
            // let rect = $element.getBoundingClientRect()
            // setSvgLine(svgLine, rect.right, rect.top, -10, -10)

            let indicatedMention = variables.find((v)=>v.name === "e12").mentions[0]
            updateMentionVisibilitiesAndIndication(equationArea, event.clientX, event.clientY, indicatedMention)
        })
        $element.addEventListener(`mouseleave`, (event) => {
            updateMentionVisibilitiesAndIndication(equationArea, event.clientX, event.clientY, null)
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