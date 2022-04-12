async function initDws() {

    // let skyBgGeo = new THREE.SphereGeometry(50.)
    // let skyBgMat = new THREE.MeshBasicMaterial({color:0x88CEEC, side:THREE.BackSide })
    // const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)

    let perspectiveCamera = initCamera()

    {
        let rtScene = new THREE.Scene()

        let rtFsq = FullScreenQuad(new THREE.ShaderMaterial())
        rtScene.add(rtFsq)

        let pixelsWide = 1
        let rt = new THREE.WebGLRenderTarget(pixelsWide, 1)
        let outputsArray = new Uint8Array(pixelsWide * 4)
        getShaderOutput = (fragmentShader) => {
            rtFsq.material.fragmentShader = fragmentShader
            rtFsq.material.needsUpdate = true

            renderer.setRenderTarget(rt)
            renderer.render(rtScene, perspectiveCamera)
            
            renderer.readRenderTargetPixels(rt, 0, 0, pixelsWide, 1, outputsArray)
            renderer.setRenderTarget(null)

            return [outputsArray[0]/255.,outputsArray[1]/255.]
        }
    }

    const dws = {}
    function Dw(elem) {
        const scene = new THREE.Scene()

        let dw = {
            scene,
            elem,
            render: () => {
                // get the viewport relative position of this element
                const { left, right, top, bottom, width, height } =
                    elem.getBoundingClientRect()

                const isOffscreen =
                    bottom < 0 ||
                    top > renderer.domElement.clientHeight ||
                    right < 0 ||
                    left > renderer.domElement.clientWidth;

                if (isOffscreen)
                    return

                const positiveYUpBottom = renderer.domElement.clientHeight - bottom
                renderer.setScissor(left, positiveYUpBottom, width, height)
                renderer.setViewport(left, positiveYUpBottom, width, height)

                renderer.render(scene, perspectiveCamera)
            }
        }

        mentions.forEach( (viz) => {
            viz.addMeshToDw(dw)
        })
        return dw
    }
    
    dws.final = Dw(bottomRightDw)
    dws.allVariables = Dw(topRightDw)
    
    {
        let pedestalDimension = 4.
        const pedestal = new THREE.Mesh(
            new THREE.BoxGeometry(pedestalDimension, .01, pedestalDimension),
            new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
        )
        pedestal.position.y = -1.
        pedestal.receiveShadow = true
        dws.allVariables.scene.add(pedestal)

        const spotLight = new THREE.SpotLight()
        spotLight.penumbra = 0.5
        spotLight.castShadow = true
        spotLight.position.set(-.5, .5, .5)
        spotLight.lookAt(0.,0.,0.)
        dws.allVariables.scene.add(spotLight)

        let grid = GridAndSpike(8, 8, 1./4.)
        // grid.position.y = -1. + .01
        grid.rotation.x = TAU / 4.
        dws.allVariables.scene.add(grid)

        dws.allVariables.scene.add(new THREE.AmbientLight(0x666666))

        let skyBgGeo = new THREE.SphereGeometry(50.)
        let skyBgMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(.18431372, .18431372, .18431372), side:THREE.BackSide })
        const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)
        dws.allVariables.scene.add(skyBg)

        // renderer.outputEncoding = THREE.sRGBEncoding
    }

    function render() {

        //     let clockDelta = clock.getDelta()
        //     frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
    
        //     // mouse.updateFromAsyncAndCheckClicks()
    
        //     // for (var i = 0; i < updateFunctions.length; i++)
        //     //     updateFunctions[i]()
    
        //     ++frameCount

        const width = canvas3d.clientWidth
        const height = canvas3d.clientHeight
        if (canvas3d.width !== width || canvas3d.height !== height)
            renderer.setSize(width, height, false)

        renderer.setScissorTest(false)
        renderer.clear(true, true)
        renderer.setScissorTest(true)

        dws.allVariables.render()
        dws.final.render()

        requestAnimationFrame(render)
    }

    initCompilation(dws)

    return render
}

function GridAndSpike(numWide, numTall, spacing) {
    if (THREE.Geometry !== undefined)
        console.error("this function has been changed since this deprecation")

    let verticalExtent = numTall / 2 * spacing
    let horizontalExtent = numWide / 2 * spacing
    let vertices = []
    vertices.push(new THREE.Vector3(0.,0.,-1.))
    vertices.push(new THREE.Vector3(0.,0.,1.))
    for (let i = 0; i < numWide + 1; i++) {
        let x = (i - numWide / 2) * spacing
        vertices.push(new THREE.Vector3(x, -verticalExtent, 0), new THREE.Vector3(x, verticalExtent, 0))
    }
    for (let i = 0; i < numTall + 1; i++) {
        let y = (i - numTall / 2) * spacing
        vertices.push(new THREE.Vector3(-horizontalExtent, y, 0), new THREE.Vector3(horizontalExtent, y, 0))
    }

    let grid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(vertices),
        new THREE.LineBasicMaterial({
            linewidth: 0.01,
            color: 0x000000,
        }))

    return grid
}