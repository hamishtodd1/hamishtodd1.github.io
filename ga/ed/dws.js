/*
    Hover a color variable and dw switches to that kind of visualization
    Same with 
 */

async function initDws() {

    {
        let rtScene = new THREE.Scene()

        let rtFsq = FullScreenQuad(new THREE.ShaderMaterial())
        rtScene.add(rtFsq)

        let pixelsWide = 8
        let rt = new THREE.WebGLRenderTarget(pixelsWide, 1)
        let outputsArray = new Uint8Array(pixelsWide * 4)
        let outputterPrefix = await getTextFile('floatOutputter.glsl')
        getShaderOutput = (fragmentShader, target) => {

            rtFsq.material.fragmentShader = outputterPrefix + fragmentShader
            rtFsq.material.needsUpdate = true

            renderer.setRenderTarget(rt)
            renderer.render(rtScene, camera)
            
            renderer.readRenderTargetPixels(rt, 0, 0, pixelsWide, 1, outputsArray)
            renderer.setRenderTarget(null)

            let floatArray = new Float32Array(outputsArray.buffer)

            for(let i = 0; i < target.length; ++i)
                target[i] = floatArray[i]

            delete floatArray

            return target
        }
    }

    class Dw {
        constructor(newElem) {
            this.elem = newElem
        };
        scene = new THREE.Scene();
        elem;
        nonMentionChildren = [];
        
        addNonMentionChild (ch) {
            this.nonMentionChildren.push(ch)
            this.scene.add(ch)
        }
        render() {
            // get the viewport relative position of this element
            const { left, right, top, bottom, width, height } =
                this.elem.getBoundingClientRect()

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

            renderer.render(this.scene, camera)
        }
    }
    
    let skyBgGeo = new THREE.SphereGeometry(camera.far * .9)
    let skyBgMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(.18431372, .18431372, .18431372), side: THREE.BackSide })
    let pedestalDimension = 4.
    let pedestalGeo = new THREE.BoxGeometry(pedestalDimension, .01, pedestalDimension)
    let pedestalMat = new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
    async function add3dStuffToDw(dw)
    {
        const pedestal = new THREE.Mesh( pedestalGeo, pedestalMat)
        pedestal.position.y = -1.
        pedestal.receiveShadow = true
        dw.addNonMentionChild(pedestal)

        const spotLight = new THREE.SpotLight()
        spotLight.penumbra = 0.5
        spotLight.castShadow = true
        spotLight.position.set(-.5, .5, .5)
        spotLight.lookAt(0.,0.,0.)
        dw.addNonMentionChild(spotLight)

        dw.addNonMentionChild(new THREE.AmbientLight(0x666666))
        
        const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)
        dw.addNonMentionChild(skyBg)
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

        updateFunctions.forEach((uf)=>uf())

        for(dwName in dws)
            dws[dwName].render()

        requestAnimationFrame(render)
    }

    dws.final = new Dw(bottomDwEl)

    dws.second = new Dw(secondDwEl)
    add3dStuffToDw(dws.second)
    let hsvApparatus = await initHsv()
    dws.second.addNonMentionChild(hsvApparatus)

    dws.top = new Dw(topDwEl)
    add3dStuffToDw(dws.top)
    // let pgaApparatus = await initPga()
    // dws.top.addNonMentionChild(pgaApparatus)

    return render
}

function GridAndSpike(numWide, numTall, spacing) {
    if (THREE.Geometry !== undefined)
        console.error("this function has been changed since this deprecation")

    let verticalExtent = numTall / 2 * spacing
    let horizontalExtent = numWide / 2 * spacing
    let vertices = []
    vertices.push(new THREE.Vector3(0., 0., -1.))
    vertices.push(new THREE.Vector3(0., 0., 1.))
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