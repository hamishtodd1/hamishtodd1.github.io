/*
    Hover a color variable and dw switches to that kind of visualization
    Same with 
 */

async function initDws() {

    let $mentionDwHeight = parseInt(getCssVar('mentionDwHeight'))
    let $ioDwWidth =       parseInt( getCssVar('ioDwWidth') )
    let GENERAL_GAP =     parseInt( getCssVar('generalGap') )

    let numUpSide = 0
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
        visible = false

        constructor(name, haveLights, ourCamera = camera, mentionDw = true) { //do it as a "params" thing
            this.elem = document.createElement('div')
            this.elem.style.display = 'none'
            this.elem.className = mentionDw ? `mentionDwEl` : `ioDwEl`
            document.body.appendChild(this.elem)

            if(mentionDw) {
                let verticalPosition = numUpSide++
                this.elem.style.bottom = (verticalPosition * ($mentionDwHeight + GENERAL_GAP) ).toString() + "px"
                this.elem.style.right = "0px"
            }
            else {
                let horizontalPosition = numAlongTop++
                this.elem.style.left = (horizontalPosition * ($ioDwWidth + GENERAL_GAP) ).toString() + "px"
                this.elem.style.top = "0px"
            }

            this.camera = ourCamera

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

        inScene(m) {
            return m.parent === this.#scene
        }

        worldToWindow(vector3) {
            return this.camera.worldToWindow(vector3, this)
        }

        setBorderHighlight(isVisible,col) {
            this.border.visible = isVisible
            if(isVisible) {
                borderMat.color.copy(col)
            }
        }

        NewGroup() {
            let ret = new THREE.Object3D()

            this.NewObject3d(ret)
            return ret
        }

        NewMesh(geo,mat,meshType = `Mesh`) {
            let ret = new THREE[meshType](geo,mat)
            ret.castShadow = this.hasLights

            this.NewObject3d(ret)

            return ret
        }

        NewObject3d(object3d) {
            if (object3d === undefined)
                object3d = new THREE.Object3D()

            object3d.visible = false
            this.#scene.add(object3d)

            if (!this.visible) {
                this.visible = true
                this.elem.style.display = ''
            }

            return object3d
        }
        
        addNonMentionChild (child) {
            this.nonMentionChildren.push(child)
            this.#scene.add(child)

            if (!this.visible) {
                this.visible = true
                this.elem.style.display = ''
            }
        }
        removeNonMentionChild(child) {
            this.nonMentionChildren.splice(this.nonMentionChildren.indexOf( child ))
            this.#scene.remove(child)
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