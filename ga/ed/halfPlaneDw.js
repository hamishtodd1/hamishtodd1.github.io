/*
    All smoothly animated

    Interesting/maybe sad how you don't get to see what "units" are being made

    Animations:
        Addition and subtraction:
            Added number marked, do the transformation, 0 is now there. Also its negative is now at 0

        Multiplication:
            always preserves 0

    A reflection about 0 is x -> -1*x
    A reflection about n is x -> n-(x-n)=2n-x
        
    A double reflection 

    Shiiiit, but what does a translation look like?


    It's a way to learn algebra cancellation rules. a + 4 - 4 = a
    So people learn that a series of transformations can build up into a complicated one...
    ...but actually there's a top level of complexity, they aren't getting any worse
    intuitively show people how some things "cancel"
    push your viz philosophy: everything should be in the same space, comparable
    multiplication by -1 is a kind of division? Weeeird, but true

    

    this is the De Keninck view for toddlers

    Is this a project that ends up with GA being at the core? Maybe it's just a tool for thought. Which, nice.
    Hey, if GA is helping you do something you want to do, that's good

    Moons and rainbows

    Yo, why is it the case that the VECTOR for bringing in hyperbolic rotations is like an ordinary rotation spinor?
        Double cover: "I appear to be a reflection, but there's a larger context in which I can be seen, where I do something other than reflect"

    Reasons:
        You have to get used to division/mult in this way for:
            Complex numbers
            Units, eg m/s^2
        It's more like pinch-to-zoom
        No areas = no break between visualizing addition and subtraction as moving left and right
        Scales better to 
            complex numbers
            special relativity-type transformations
            geometry (certainly spinors)
            AdS/CFT
        Any phrase uttered allowed, "a divided by b plus c, all divided by d" could be turned into a transformation
            Any pauli estimate
            That "your answer is 50" thing
            Voice activated start by saying a number. It shows that on the screen, marked on a ruler
            Say your series of:
                "double it"
                "add 32"
                "halve it"
                "times 2"
                "add x, whole thing divided by 2"
                    as opposed to: "add x-divided-by-2" (x-over-2 said fast!)
                "and then five divided by *that*" - reverse polish?
            Can say "x" in there, and you get a point you can grab
        And if you don't want to use voice:
            Buttons at the bottom to "put into divide/add mode" I guess
        Even if it doesn't work, could make a video "a new way of seeing arithmetic"
        Could show this to Philipp?
        Wildcards: "thingy", "blank

*/

async function initHalfplane() {

    let dw = new Dw(`halfPlane`, false, camera2d)

    var rainbowMat = new THREE.ShaderMaterial({
        uniforms: {
            "plane": { value: new Float32Array(16) },
            "leftEnd": { value: -1. },
            "rightEnd": { value: 1. }
        },
        //circle through 1 and -1 is the z plane
    });
    await assignShader("shaders/rainbowVert", rainbowMat, "vertex")
    await assignShader("shaders/rainbowFrag", rainbowMat, "fragment")

    let rainbowGeo = new THREE.PlaneGeometry(1., 1., 1, 128)

    let rainbow = new THREE.Mesh(rainbowGeo, rainbowMat)
    dw.addNonMentionChild(rainbow)

    {
        let axisGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3(10., 0., 0.)])
        let notchGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(0., -.15, 0.)])

        const axisMat = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        })
        let axis = new THREE.Line(axisGeo, axisMat)
        axis.position.y -= 1.
        dw.addNonMentionChild(axis)

        let furthestMarkers = 3
        for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
            let marker = text(i.toString())
            marker.position.x = i
            marker.scale.multiplyScalar(.8)
            marker.position.y = axis.position.y - marker.scale.y * .7
            dw.addNonMentionChild(marker)

            let notch = new THREE.Line(notchGeo, axisMat)
            notch.position.x = i
            notch.position.y = axis.position.y
            dw.addNonMentionChild(notch)
        }
    }

    updateHalfplane = () => {
        rainbowMat.uniforms.leftEnd.value = Math.sin(clock.getElapsedTime())
    }
}