function initSaccadic(state) {

    let saccadicScene = new THREE.Group()
    scene.add(saccadicScene)
    saccadicScene.rotation.y = TAU * .07

    let eyeballGeo = new THREE.SphereGeometry(.07)
    let lidGeo = new THREE.SphereGeometry(.08, 32, 16, 0., TAU, 0., Math.PI * .45)
    let lidMat = new THREE.MeshPhongMaterial({ color: 0x6D584F })
    let eyeballMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
    let pupilMat = new THREE.MeshPhongMaterial({ color: 0x000000 })
    let pupilGeo = new THREE.SphereGeometry(.076, 32, 16, 0., TAU, 0., Math.PI * .11)
    pupilGeo.rotateX(TAU * .25)

    let eyes = []
    let lids = []
    for (let i = 0; i < 2; ++i) {
        let eye = new THREE.Mesh(eyeballGeo, eyeballMat)
        eyes.push(eye)

        eye.position.x = .14 * (i?1.:-1.)
        eye.position.z = .47
        eye.position.y = .52

        let pupil = new THREE.Mesh(pupilGeo, pupilMat)
        eye.add(pupil)

        let lid = new THREE.Mesh(lidGeo, lidMat)
        lids[i] = lid
        lid.rotation.x = -TAU * .07
        lid.position.copy(eye.position)
    }

    let water = new THREE.Mesh(new THREE.CircleGeometry(.5), new THREE.MeshBasicMaterial({ color: 0x17777C }))
    water.rotation.x = -TAU * .25
    water.position.y = -.01
    water.position.z = -.6
    water.scale.set(3.8,5.2,1.)
    saccadicScene.add(water)
    let spacing = 1.5
    let lilypadGeo = new THREE.CircleGeometry(spacing * .45, 32, 0, TAU * .95)
    lilypadGeo.rotateX(-TAU * .25)
    let lilypadMat = new THREE.MeshBasicMaterial({ color: 0x729646 })
    for (let i = 0; i < 4; ++i) {
        let lilypad = new THREE.Mesh(lilypadGeo, lilypadMat)
        lilypad.rotation.y = Math.random() * TAU
        saccadicScene.add(lilypad)
        lilypad.position.x = spacing*(i%2?.5:-.5)
        lilypad.position.z = spacing*(i<2?.5:-.5)
    }
    let frogLilypad = new THREE.Mesh(lilypadGeo, lilypadMat)
    frogLilypad.position.z = -spacing * 1.6
    // frogLilypad.position.x = 0.
    saccadicScene.add(frogLilypad)

    let tongue = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, 1.), new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
    tongue.geometry.translate(0.,0.5,0.)
    tongue.geometry.scale(2.,1.,1.)
    tongue.position.z = frogLilypad.position.z + .52
    tongue.position.y = .4
    tongue.scale.y = 0.
    saccadicScene.add(tongue)

    let tongueTime = 0.
    let fly = new THREE.Mesh(
        new THREE.SphereGeometry(.04),
        new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }))
    fly.scale.x = 1.7
    fly.rotation.y = TAU *.2
    saccadicScene.add(fly)
    let wingGeo = new THREE.CircleGeometry(.04)
    wingGeo.scale(1.,2.,1.)
    wingGeo.translate(0.,0.04,0.)
    let wingMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide })
    let wings = []
    for(let i = 0; i < 2; ++i) {
        let wing = new THREE.Mesh(wingGeo, wingMat)
        wings.push(wing)
        fly.add(wing)
    }

    //view
    {
        let rtTexture = new THREE.WebGLRenderTarget(64, 64);
        let viewMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: rtTexture.texture });
        let view = new THREE.Mesh(unchangingUnitSquareGeometry, viewMat)
        view.scale.y = .95
        view.scale.x = view.scale.y
        view.position.x = -2.1
        view.position.y = -.65
        scene.add(view)
        
        let frame = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }))
        view.add(frame)
        frame.scale.copy(view.scale)
        frame.scale.multiplyScalar(1.08)
        frame.position.z = -.001

        let viewCamera = new THREE.PerspectiveCamera(14, 1., 0.01, 500)
        viewCamera.rotation.y = TAU * .5
        eyes[0].add(viewCamera)

        let usualRenderTarget = renderer.getRenderTarget()

        function renderView() {

            renderer.setRenderTarget(rtTexture)
            renderer.clear()
            renderer.render(scene, viewCamera)

            renderer.setRenderTarget(usualRenderTarget)
        }
    }

    let v4 = new THREE.Vector4()
    eating = false
    updateSaccadic = () => {

        // if(frameCount === 100) {
        //     camera.position.set(0.,0.,0.)
        //     camera.quaternion.identity()
        //     eyes[0].add(camera)
        //     camera.rotation.x = -TAU / 2.
        // }

        if(frameCount === 650)
            eating = true

        wings[0].rotation.x = TAU * .15 * (.8 + .5 * Math.sin(frameCount * .22))
        wings[1].rotation.x = -wings[0].rotation.x

        if(!eating) {
            if (frameCount % 50 === 1) {
                fly.position.x = .5 * (Math.random() < .5 ? -spacing : spacing)
                fly.position.z = .5 * (Math.random() < .5 ? -spacing : spacing)
                fly.position.y = .03
            }
            fly.getWorldPosition(v1)
            lookPos.lerpVectors(lookPos, v1, .1)
            eyes[0].lookAt(lookPos)
            eyes[1].lookAt(lookPos)

            v4.x = fly.position.x > 0. && fly.position.z > 0. ? 1. : 0.
            v4.y = fly.position.x < 0. && fly.position.z > 0. ? 1. : 0.
            v4.z = fly.position.x < 0. && fly.position.z < 0. ? 1. : 0.
            v4.w = fly.position.x > 0. && fly.position.z < 0. ? 1. : 0.
            state.p.lerpVectors(state.p, v4, .02)
        }
        if(eating) {
            
            tongueTime += frameDelta * 18.

            tongue.lookAt(fly.position)
            v1.subVectors(fly.position, tongue.position).normalize()
            tongue.quaternion.setFromUnitVectors(yUnit, v1)
            let tongueFactor = tongueTime < Math.PI ? Math.sin(tongueTime) : 0.
            tongue.scale.y = tongueFactor * tongue.position.distanceTo(fly.position)

            if (tongueTime > Math.PI / 2. && tongueTime < Math.PI)
                fly.position.copy(tongue.position).addScaledVector(v1, tongue.scale.y)
            else if(tongueTime > Math.PI) {
                fly.position.y = 1.
                fly.position.z = -8. + tongueTime * .2
                fly.position.x = 0.

                eyes[0].lookAt(saccadicScene.position)
                eyes[1].lookAt(saccadicScene.position)
            }

            if (tongueTime/18. > 2.) {
                tongueTime = 0.
                eating = false
            }
        }

        // saccadicScene.rotation.y = frameCount * .03

        renderView()
    }

    let organism = new THREE.Group()
    saccadicScene.add(organism)
    organism.position.copy(frogLilypad.position)
    organism.add(eyes[0], eyes[1], lids[0], lids[1])
    let lookPos = new THREE.Vector3()
    new THREE.OBJLoader().load('https://hamishtodd1.github.io/fep/data/Toad.obj', obj => {

        let mesh = obj.children[0]
        mesh.geometry.scale(.08,.08,.08)
        // mesh.geometry.translate(0.,-.26,0.)
        mesh.geometry.rotateX(-TAU * .25)
        organism.add(mesh)
        
        

        // organism.onBeforeRender = () => {
        //     eyes[0].lookAt(mousePos.x, mousePos.y, 2.)
        //     eyes[1].lookAt(mousePos.x, mousePos.y, 2.)
        // }

        

        textureLoader.load('https://hamishtodd1.github.io/fep/data/RatHead_BaseColor.png', texture => {
            mesh.material.map = texture
            mesh.material.needsUpdate = true
        })
    })

    return saccadicScene
}


/*
    Conor
        https://pymdp-rtd.readthedocs.io/en/latest/notebooks/active_inference_from_scratch.html

    Lancelot
        https://github.com/lancelotdacosta/pymdp
        https://github.com/infer-actively/pymdp/blob/master/examples/tmaze_demo.ipynb
*/
function initTMaze() {

    let tMazeGroup = new THREE.Group()
    scene.add(tMazeGroup)
    
    let geo = new THREE.BoxGeometry(1., 1., 1.)
    let floorThickness = .02
    let width = .5 //"corridor"
    let armLength = .8

    let bottom = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0xFF8888}))
    bottom.scale.z = floorThickness
    bottom.scale.x = width
    bottom.scale.y = 1.3
    bottom.position.y = -bottom.scale.y / 2. - width / 2.
    tMazeGroup.add(bottom)

    let middle = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x88FF88}))
    middle.scale.z = floorThickness
    middle.scale.x = width
    middle.scale.y = width
    tMazeGroup.add(middle)

    let arms = []
    for(let i = 0; i < 2; ++i) {
        let arm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: i?0x8888FF:0x88FFFF}))
        arms.push(arm)
        arm.scale.z = floorThickness
        arm.scale.x = armLength
        arm.scale.y = width
        arm.position.x = (i?-1:1)*(armLength / 2. + width / 2.)
        tMazeGroup.add(arm)
    }
}