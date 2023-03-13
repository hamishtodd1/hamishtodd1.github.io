/*
    The purpose of this is just to go in the video
        Need a way to go between pages, maybe pageup and pagedown

    could check for consistency. Probably not a good idea here, better in equations.js

    You have to write it all out as code by hand
    Then, ascribe particular in the equation to the variables

    


    Show them vector algebra to get them used to things:
        matrix * vector
        vector . vector

    a ^ b, a*b, a.b for various things
    <A>n for various motors

    To show what you’re familiar with:
    a X b = (a ^ b) * e123 - God would never use the cross product. Why not b^a?
    angle from v to u = u_pt* ^ v_pt*


 */

pageParameters = {
    untransformed: false,
    final: false,
    complex: false,
    euclidean: true,
    infinity: true,
    scalar: true,
    vectorSpace: true
}

async function initEquations() {
    
    await init(document.getElementById('fragmentShader').textContent, true)

    initGauge()

    zoomCameraToDist(3.7)
    // dws.untransformed.elem.style.display = `none`
    // dws.final.elem.style.display = `none`

    //each "mention" will have variable and appearance

    

    let equationareaMentions = []
    class MentionEa {
        variable = null;
        appearance = null;

        x = 0.; y = 0.; w = 40.;

        constructor() {
            equationareaMentions.push(this)
        }

        highlight() {
            highlightAppearance(this.appearance, this.variable.col, this.x, this.y, this.w)
        }
    }

    onMathJaxLoad = () => {
        variables.forEach((v)=>{
            let name = v.name

            let $element = document.getElementById( name + `Id`)
            if($element === null)
                return

            let rect = $element.getBoundingClientRect()

            let mentionEa = new MentionEa()
            mentionEa.variable = v
            mentionEa.appearance = v.mentions[0].appearance //stateless
            mentionEa.x = rect.x
            mentionEa.y = rect.y - (lineHeight - rect.height) / 2.
            mentionEa.w = rect.width

            //would be nice to see other relevant elements too

            //possibly unperformant to have this many event listeners
            $element.addEventListener(`mouseover`, (event) => {
                updateAppearanceVisibilitiesAndIndication(mentionEa)
            })
            $element.addEventListener(`mouseleave`, (event) => {
                updateAppearanceVisibilitiesAndIndication(null, event.clientX, event.clientY)
            })
        })
    }

    //yes, hacky. But MathJax requires npm for any kind of callback
    //I mean, event listeners surely work this way anyhow
    let alreadyDone = false
    updateFunctions.push(()=>{
        if (alreadyDone)
            return

        let mathId = document.getElementById(`e1Id`)
        if(mathId === null)
            return
        else {
            onMathJaxLoad()
            alreadyDone = true
            //should remove this from update functions...
        }
    })
}