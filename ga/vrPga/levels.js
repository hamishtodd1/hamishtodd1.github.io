/*
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
        Orrery

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
    let levelSelectGroup = new THREE.Group()
    scene.add(levelSelectGroup)
    levelSelectGroup.scale.multiplyScalar(.03)
    comfortableLookPos(fl0).pointToGibbsVec(levelSelectGroup.position)
    levelSelectGroup.lookAt(camera.position)

    let a = text("level select", false, `#000000`)
    levelSelectGroup.add(a)
    let b = text("1", false, `#000000`)
    b.position.y -= 1.1
    levelSelectGroup.add(b)

}