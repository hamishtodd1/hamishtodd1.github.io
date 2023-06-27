//notes were moved to ed version

async function init() {
    if(camera.isPerspectiveCamera)
        console.error("That's an orthographic camera")

    {
        var rainbowMat = new THREE.ShaderMaterial({
            uniforms: {
                "plane": { value: new Float32Array(16) },
            },
            //circle through 1 and -1 is the z plane
        });
        await assignShader("rainbowVert", rainbowMat, "vertex")
        await assignShader("rainbowFrag", rainbowMat, "fragment")
        
        let rainbowGeo = new THREE.PlaneGeometry(1.,1.,1,128)

        let rainbow = new THREE.Mesh(rainbowGeo,rainbowMat)
        scene.add(rainbow)

        // let rainbowPlane = new Mv().plane(0.,1.,0.,1.)
        //so you take this plane and intersect it with the line, that gets you a point pair
        //ehhhh, you want to draw the whole thing

        //The ticks on the number line are little planes

        //might be that
    }

    


    let notchGeo = new THREE.BoxGeometry(1.,1.,0.)
    let notchMat = new THREE.MeshBasicMaterial({color:0x000000})

    let notchHeight = .1
    let numberHeight = .1

    //really a line seen from above
    let projectionPointAxis = new Mv().copy(e31).add(e41)
    projectionPointAxis.multiplyScalar(1/Math.SQRT2)
    function NumberedNotch(n) {
        let notch = new THREE.Mesh(notchGeo, notchMat)
        notch.n = n
        notch.scale.set(.02, notchHeight, 1.)
        scene.add(notch)

        {
            let number = text(n, false, "#000000")
            number.scale.multiplyScalar(numberHeight)
            scene.add(number)

            updateFunctions.push(() => {
                number.position.copy(notch.position)
                number.position.y = 0. - notchHeight / 2. - numberHeight / 2.
            })
        }

        notch.initialPlane = e1.clone()
        {
            mv0.copy(projectionPointAxis)
            mv0.multiplyScalar(n)
            mv0.exp(mv1) //is now the rotor
            let currentPlane = mv1.sandwich(notch.initialPlane,mv2)

            currentPlane.normalize()
            e1.meet(currentPlane,mv3)
            mv3.log()

            //THIS IS HOW FAR YOU GET WITHOUT THE EXP AND LOG

            // mv3.normalize()
            //mv2 is our plane. Could intersect it with z plane, e3. Line's e43 part
            notch.position.x = mv3[10]
        }

        return notch
    }

    //probably the most on-brand lerp would be circle
    //you have your currentSpinor and you targetSpinor
    //can make it fun to play with/abuse in an educational way: 
    //      purposefully make it lerp towards a new state from something partway through division
    
    let notches = []
    NumberedNotch(1)
    // for(let i = -100; i <= 100; ++i) {
    //     let nn = NumberedNotch(i)
    //     nn.position.x = i * .1
    // }

    function respondToCommand(command) {
        if(typeof command === 'number') {
            //treated as new entry

            let marker = NumberedNotch(command)
            marker.position.x = command * .4
        }
        else {
            //gotta make a spinor I guess. That animates nicely.

            //it's a 3,1 spinor

            
            

            //there's
        }
    }

    // -------------SIMULATOR
    let simulating = true
    if(simulating)
    {
        let simulatedCommands = [
            // null,
            5,
            // {op:"+", arg:2}
        ]
        let framesBetweenSimulatedCommands = 30
        updateFunctions.push(() => {
            if (frameCount % framesBetweenSimulatedCommands === 0) {
                let index = Math.floor(frameCount / framesBetweenSimulatedCommands)
                if(index < simulatedCommands.length)
                    respondToCommand(simulatedCommands[index])
            }
        })
    }
    else {
        //buttons at bottom

        let reciprocalBtn = text("/", false, "#000000")
        reciprocalBtn.scale.setScalar(.4)
        reciprocalBtn.position.y = -.8 * camera.topAtZZero
        reciprocalBtn.position.x = -reciprocalBtn.scale.y * 1.1
        scene.add(reciprocalBtn)

        bindButton("r", () => {
            log("tak reciprocal")
        })

        let addBtn = text("+", false, "#000000")
        addBtn.scale.setScalar(.4)
        addBtn.position.y = -.8 * camera.topAtZZero
        scene.add(addBtn)

        let multiplyBtn = text("*", false, "#000000")
        multiplyBtn.scale.multiplyScalar(.4)
        multiplyBtn.position.y = -.8 * camera.topAtZZero
        multiplyBtn.position.x = multiplyBtn.scale.y * 1.1
        scene.add(multiplyBtn)

        let addMode = false
        let subtractMode = false

        updateFunctions.push(()=>{
            if (mouse.checkIfOnScaledUnitSquare(reciprocalBtn) && mouse.clicking && !mouse.oldClicking) {
                log("reciprocal")
            }


            if (mouse.checkIfOnScaledUnitSquare(addBtn) && mouse.clicking && !mouse.oldClicking)
                addMode = true
            if (mouse.checkIfOnScaledUnitSquare(multiplyBtn) && mouse.clicking && !mouse.oldClicking)
                multiplyMode = true

            if(!mouse.clicking) {
                addMode = false
                multiplyMode = false
            }

            if(addMode) {
                log(mouse.coords.x)
            }
            else if(multiplyMode) {
                log(mouse.coords.x)
            }
        })
    }
}