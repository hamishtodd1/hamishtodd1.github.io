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

    //each "mention" will have variable and appearance

    let equationareaMentions = []
    class MentionEa {
        variable = null;
        appearance = null;

        x = 0.; y = 0.; w = 40.;

        constructor(variable,appearance) {
            equationareaMentions.push(this)
        }

        highlight() {
            highlightAppearance(this.appearance, this.variable.col, this.x, this.y, this.w)
        }
    }
    new MentionEa()

    hackyFunction = () => {
        return hoveredEquationMention
    }

    onMathJaxLoad = () => {
        let $element = document.getElementById(`someid`)

        $element.addEventListener(`mouseover`, (event) => {
            
            //just assigning it, this should have been done area
            let mention = variables.find((v)=>v.name === "e12").mentions[0]
            equationareaMentions[0].variable = mention.variable
            equationareaMentions[0].appearance = mention.appearance
            equationareaMentions[0].x = event.clientX
            equationareaMentions[0].y = event.clientY
            log(equationareaMentions[0])

            updateAppearanceVisibilitiesAndIndication(equationareaMentions[0])

            // indicatedMention.appearance.setVisibility(true)
            // highlightAppearance(indicatedMention.appearance, indicatedMention.variable.col, event.clientX, event.clientY, 40)
        })
        $element.addEventListener(`mouseleave`, (event) => {
            updateAppearanceVisibilitiesAndIndication(null,event.clientX,event.clientY)
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