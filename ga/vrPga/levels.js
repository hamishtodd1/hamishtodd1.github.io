/*
Make it so you can save your doodles!
    It is NOT FUN that so much logic is hidden!

    It will be exciting when you do infinite stuff for the first time, lead up to that

    SAVING MODELS INTO LEVELS!!
    Are you able to load... delete... load... delete...?

    Head turning to look at things
    airplane
    trammel of archimedes https://youtu.be/SwVWfrZ3Q50?t=102
    Orbiting planets
    Roller coasters
        helter skelter
        Teacups
        Corkscrew looping
        Water slide with turning tubes
        Evolution type https://en.wikipedia.org/wiki/Evolution_(ride)
        One that: has things haging from it; it starts spinning, the things move outwards, then it turns
    

    Exp is needed, and that means scalars

    Doodle!
    Kid on a swing
    Bicycle chain
    A tornado swaying from side to side while turning
    Stunt people on bikes
    The machinery you have on the wheels of trains
    Moon that is tidally locked
    Fire poi throwing sparks
    Anthony Howe kinetic masterpieces
    explosions
    Gears/clockwork, some of those weird gears maybe
    Some gyroscopy gimbals thing
    Double pendulum. Not the chaotic motion, just a thing swaying on another thing
    Some automata thing?
    car engine like? https://youtu.be/SwVWfrZ3Q50?t=443
    Catherine wheel
    Whip
    


    You are without-spreadsheet for a while

    Absent spreadsheet, the only way to make scalar
        Is point join plane. MAYBE line join line
        Cooooooooould do the scaling geometric algebra thing
            A scalar is a scaling away from the origin, so instead of 3 it is 1+3epm

    Snapping on by default, press the button to turn them off

    Signs need to be shown, and should be where the user looks
        Pics of the gestures to help you make them

    Need to make it easier/rigorous to do parenting
    userPow... not really needed

    Make it so you can doodle in your level designer
    Need to be able to detect when user has the answer
        This is for later though, in theory you could just not do that and say "you need to manually advance"
    Just a big menu saying "level select"

    Remove node shit so it can be hosted statically

    Just the controls
        Make a rotation/translation of any kind (it shows the button you need to hold)
        Make a sclptable
        Compose two rotations/translations
        Compose three of them

        Make a rototreflection/transflection of any kind
        Make a point?
        The various functions
            ProjectOn
            sandwich
        Make the translation from one point to another and the 180 connecting two points?

    Advanced
        Torus knot?
 */


        
function initLevels() {

    //Point projected on plane
    new Level({
        winCondition: () => {
            return false
        },
        init: () => {

            // let a = new FlViz(0xEADDCA, true)
            // a.fl.copy(e1)
            
            // let b = new FlViz(0xEADDCA, true)
            // b.fl.copy(e123)

            let lvlUpdate = () => {
                
            }
            return lvlUpdate
        }
    })

    //Rotation and translation composition
    new Level({
        winCondition: () => {
            return false
        },
        init: () => {

            let a = new DqViz(0xEADDCA, true)
            comfortableLookPos(a.markupPos, 0., 0.)

            let b = new DqViz(0xEADDCA, true)
            b.dq[0] = 1.
            b.dq[2] = -.1
            comfortableLookPos(b.markupPos, 0., 0.)

            let c = new DqViz(0xEADDCA, true)
            comfortableLookPos(c.markupPos, 0., 0.)

            let lvlUpdate = () => {
                let angle = .001 + .6 * (1. + Math.cos(frameCount * .04))
                a.dq[0] = Math.cos(angle)
                a.dq[5] = Math.sin(angle)

                a.dq.mul(b.dq, c.dq)
            }
            return lvlUpdate
        }
    })

    //Translation translation composition
    new Level({
        winCondition: () => {
            return false
        },
        init: () => {

            let a = new DqViz(0xEADDCA, true)
            comfortableLookPos(a.markupPos, 0., 0.)

            let b = new DqViz(0xEADDCA, true)
            b.dq[0] = 1.
            b.dq[2] = -.1
            comfortableLookPos(b.markupPos, 0., 0.)

            let c = new DqViz(0xEADDCA, true)
            comfortableLookPos(c.markupPos, 0., 0.)

            let lvlUpdate = () => {
                a.dq[0] = 1.
                let angle = frameCount * .04
                a.dq[1] = -.06 - .02 * Math.sin(angle)
                a.dq[2] = -.06 - .02 * Math.cos(angle)

                a.dq.mul(b.dq, c.dq)
            }
            return lvlUpdate
        }
    })

    new Level({
        winCondition: () => {
            return snappables.length > 2 && grabbees[0] === null && grabbees[1] === null
        },
        signNames: [`dq0`, `dq1`, `dq2`]
    })
    new Level({
        winCondition: () => {
            return false
        },
        signNames: [`test`]
    })
    
    
}