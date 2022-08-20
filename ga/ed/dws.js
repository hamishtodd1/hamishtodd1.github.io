/*
    Hover a color variable and dw switches to that kind of visualization
    Same with 
 */



async function initDws() {

    let DW_WIDTH = parseInt( getCssVar('dwWidth') )
    let DW_HEIGHT = parseInt( getCssVar('dwWidth') ) / eval(getCssVar('dwAspect'))
    let GENERAL_GAP = parseInt(getCssVar('generalGap'))

    let numDownSide = 0
    let numAlongTop = 0

    let borderRadius = Math.sqrt(2.) / 2.
    let borderGeo = new THREE.RingGeometry(borderRadius * .92, borderRadius, 4, 1, TAU/8.)
    borderGeo.translate(0., 0., -1.)
    let borderMat = new THREE.MeshBasicMaterial({color:0xFF0000})

    let camera2dMatrix = new THREE.Matrix4()
    camera2dMatrix.makeScale(camera2d.left*2.,camera2d.top*2.,1.)
    camera2dMatrix.setPosition(0., 0., camera2d.position.z - camera2d.near*1.1)

    class Dw {
        #scene = new THREE.Scene()
        elem
        nonMentionChildren = []
        camera
        hasLights

        border

        constructor(name, haveLights, ourCamera, mentionDw) { //do it as a "params" thing
            this.elem = document.createElement('div')
            this.elem.className = 'dwEl'
            document.body.appendChild(this.elem)

            if(mentionDw === undefined)
                mentionDw = true
            
            if(mentionDw) {
                let verticalPosition = numDownSide++
                this.elem.style.bottom = (verticalPosition * (DW_HEIGHT+GENERAL_GAP) ).toString() + "px"
                this.elem.style.right = "0px"
            }
            // else if(name === "final") {
            //     this.elem.style.top = "0px"
            //     this.elem.style.right = "0px"
            // }
            else {
                let horizontalPosition = numAlongTop++
                this.elem.style.left = (horizontalPosition * (DW_WIDTH+GENERAL_GAP) ).toString() + "px"
                this.elem.style.top = "0px"
            }

            this.camera = ourCamera || camera

            this.border = new THREE.Mesh(borderGeo, borderMat)
            // this.border.visible = false
            this.addNonMentionChild(this.border)
            this.border.matrixAutoUpdate = false
            if (this.camera === camera)
                this.border.matrix = FULL_SCREEN_QUAD_MATRIX
            else
                this.border.matrix = camera2dMatrix

            dws[name] = this
            
            if(haveLights)
                addLights(this)

            this.hasLights = haveLights
        }

        worldToWindow(vector3) {
            return this.camera.worldToWindow(vector3, this)
        }

        NewObject3D() {
            let ret = new THREE.Object3D()
            ret.visible = false
            this.#scene.add(ret)
            return ret
        }

        setBorderHighlight(isVisible,col) {
            this.border.visible = isVisible
            if(isVisible) {
                borderMat.color.copy(col)
                borderMat.needsUpdate = true
            }
        }

        NewMesh(geo,mat) {
            let ret = new THREE.Mesh(geo,mat)
            ret.visible = false
            this.#scene.add(ret)
            ret.castShadow = this.hasLights

            return ret
        }
        
        addNonMentionChild (ch) {
            this.nonMentionChildren.push(ch)
            this.#scene.add(ch)
        }
        removeNonMentionChild(ch) {
            this.nonMentionChildren.splice(this.nonMentionChildren.indexOf( ch ))
            this.#scene.remove(ch)
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
            renderer.setScissor( left, positiveYUpBottom, width, height)
            renderer.setViewport(left, positiveYUpBottom, width, height)

            renderer.render(this.#scene, this.camera)
        }

        getHoveredMention(clientX, clientY) {
            let closestMention = null
            let closestDist = Infinity
            forEachUsedMention((mention) => {
                if (!mention.appearance.isVisibleInDw(this)) //some of isVisible is about being used, which might be pointless checking
                    return

                let [elemX, elemY] = mention.appearance.getWindowCenter(this)
                if(elemX !== Infinity) {
                    let dist = Math.sqrt(sq(clientX - elemX) + sq(clientY - elemY))
    
                    if (dist < closestDist) {
                        closestMention = mention
                        closestDist = dist
                    }
                }
            })

            return closestMention
        }
    }
    window.Dw = Dw
    
    function addLights(dw)
    {
        const spotLight = new THREE.SpotLight()
        spotLight.penumbra = 0.5
        spotLight.castShadow = true
        spotLight.position.set(-.5, .5, .5)
        spotLight.lookAt(0.,0.,0.)
        dw.addNonMentionChild(spotLight)

        dw.addNonMentionChild(new THREE.AmbientLight(0xA0A0A0,1.))
        
        // const skyBg = new THREE.Mesh(skyBgGeo, skyBgMat)
        // dw.addNonMentionChild(skyBg)
    }

    renderAll = () => {

        // let clockDelta = clock.getDelta()
        // frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
    
        ++frameCount

        const width = canvas3d.clientWidth
        const height = canvas3d.clientHeight
        if (canvas3d.width !== width || canvas3d.height !== height)
            renderer.setSize(width, height, false)

        renderer.setScissorTest(false)
        renderer.setClearColor(0xFFFFFF,0)
        renderer.clear(true, true)
        renderer.setScissorTest(true)

        updateFunctions.forEach((uf)=>uf())

        renderer.setClearColor(0x272822,1)
        for(dwName in dws)
            dws[dwName].render()

        requestAnimationFrame(()=>{
            if ( keyOfProptInObject(true, animationStates) !== undefined )
                renderAll()
        })
    }

    forNonFinalDws = (func) => {
        for(dwName in dws) {
            if(dwName === "final")
                continue
            func(dws[dwName],dwName)
        }
    }
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