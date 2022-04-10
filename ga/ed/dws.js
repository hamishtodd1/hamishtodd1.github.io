async function initDws() {

    const allVariablesDwElem = document.getElementById('topRightDw')

    // let skyBgGeo = new THREE.SphereGeometry(50.)
    // let skyBgMat = new THREE.MeshBasicMaterial({color:0x88CEEC, side:THREE.BackSide })
    // const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)

    {
        const fov = 60.
        const aspect = eval(getComputedStyle(allVariablesDwElem).aspectRatio)
        const near = 1.
        const far = 100.

        var perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        perspectiveCamera.position.set(.6, .7, 2.2)
        perspectiveCamera.position.multiplyScalar(1.5)
        perspectiveCamera.lookAt(0., 0., 0.)

        var orthographicCamera = new THREE.OrthographicCamera(-aspect,aspect,1.,-1.,near,far)
        orthographicCamera.position.z = 10.
    }

    const dws = {}
    function Dw(elem,isOrthographic) {
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

                if(isOrthographic)
                    renderer.render(scene, orthographicCamera)
                else
                    renderer.render(scene, perspectiveCamera)
            }
        }

        mentions.forEach( (viz) => {
            viz.addMeshToDw(dw)
        })
        return dw
    }
    
    dws.inline = Dw(document.getElementById("inlineDw"))
    {
        var inlineDwVisible = false

        dws.inline.scene.add(new THREE.Mesh(
            new THREE.SphereBufferGeometry(.8, 4, 2),
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })))
    }
    
    dws.allVariables = Dw(allVariablesDwElem)
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

    dws.final = Dw(document.getElementById('bottomRightDw'),true)
    let planeGeo = new THREE.PlaneGeometry(1., 1.)
    let finalMesh = new THREE.Mesh(planeGeo, new THREE.ShaderMaterial())
    finalMesh.material.vertexShader = basicVertex
    dws.final.scene.add(finalMesh)

    function render() {

        //     let clockDelta = clock.getDelta()
        //     frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
    
        //     // mouse.updateFromAsyncAndCheckClicks()
    
        //     // for (var i = 0; i < updateFunctions.length; i++)
        //     //     updateFunctions[i]()
    
        //     ++frameCount

        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (canvas.width !== width || canvas.height !== height)
            renderer.setSize(width, height, false)

        renderer.setScissorTest(false)
        renderer.clear(true, true)
        renderer.setScissorTest(true)

        dws.allVariables.render()
        dws.final.render()
        
        if(inlineDwVisible)
            dws.inline.render()

        requestAnimationFrame(render)
    }

    initCompilation(dws, finalMesh)

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