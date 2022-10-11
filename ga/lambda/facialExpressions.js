function initFacialExpressions() {
    let whiteRadius = 1.
    let pupilRadius = .4
    let pupilGeo = new THREE.CircleGeometry(pupilRadius, 31)
    let whiteGeo = new THREE.CircleGeometry(1., 31)
    let closedLashGeo = new THREE.RingGeometry(1., whiteRadius * 1.1,16,1,TAU*0.1,TAU*.33)
    let outlineGeo = new THREE.CircleGeometry(whiteRadius * 1.1,31)
    let whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    let blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 })

    let browGeo = new THREE.PlaneGeometry(.12, .02)
    let browMat = new THREE.MeshBasicMaterial({ color: 0x00000 })

    class Eye extends THREE.Object3D {
        white = new THREE.Mesh(whiteGeo, whiteMat)
        pupil = new THREE.Mesh(pupilGeo, blackMat)
        outline = new THREE.Mesh(outlineGeo, blackMat)
        closedLash = new THREE.Mesh(closedLashGeo, blackMat)
        brow = new THREE.Mesh(browGeo, browMat)
        
        constructor() {
            super()
            this.pupil.position.z = this.white.position.z + .01
            this.outline.position.z = this.white.position.z - .01
            this.closedLash.position.y -= whiteRadius
            this.add(this.white)
            this.add(this.pupil)
            this.add(this.outline)
            this.add(this.closedLash)
            scene.add(this)
        }
    }

    let browPositions = {
        "quizzical": [[0.,0.],[-.02,.02],false],
        "surprised": [[.05, -.05], [.02, .02], false],
        "angry": [[-.2, .2], [0., 0.], false],
        "neutral": [[0., 0.], [.0, .0], false],
    }

    class Face extends THREE.Object3D {
        leftEye = new Eye()
        rightEye = new Eye()
        eyes = []
        expression = "neutral"

        #lookDirection = new THREE.Vector3()
        intendedLookDirection = new THREE.Vector3()

        constructor() {
            super()

            this.eyes.push(this.leftEye,this.rightEye)

            this.leftEye.scale.multiplyScalar(.08)
            this.leftEye.position.x = -.07
            this.add(this.leftEye)
            this.rightEye.scale.multiplyScalar(.08)
            this.rightEye.position.x = .07
            this.rightEye.position.z += .01
            this.add(this.rightEye)

            this.add(this.rightEye.brow)
            this.add(this.leftEye.brow)
            this.rightEye.brow.position.y = .035 + this.rightEye.position.y + this.rightEye.scale.y
            this.rightEye.brow.position.x = this.rightEye.position.x
            this.leftEye.brow.position.y = .035 + this.leftEye.position.y + this.leftEye.scale.y
            this.leftEye.brow.position.x = this.leftEye.position.x
            this.rightEye.brow.position.x = this.rightEye.position.x
            this.leftEye.brow.position.x = this.leftEye.position.x

            updateFunctions.push(()=>{
                if(this.expression === `surprised`) {
                    //lookDirection becomes irrelevant
                    this.eyes.forEach((eye) => {
                        eye.pupil.position.set(0.,0.,0.)
                    })
                }
                else {
                    this.#lookDirection.lerp(this.intendedLookDirection, .2)
                    this.eyes.forEach((eye) => {

                        v2.copy(this.#lookDirection)
                        v2.sub(eye.getWorldPosition(v1))
                        v2.setLength(whiteRadius - pupilRadius)

                        eye.pupil.position.x = v2.x
                        eye.pupil.position.y = v2.y
                    })
                }

                if(this.expression === `happy`) {
                    this.eyes.forEach((eye,i)=>{
                        eye.pupil.visible = false
                        eye.brow.visible = false
                        eye.closedLash.visible = true
                    })
                }
                else {
                    let bp = browPositions[this.expression]

                    this.eyes.forEach((eye,i) => {
                        eye.pupil.visible = true
                        eye.brow.visible = true
                        eye.closedLash.visible = false

                        eye.brow.position.y = .035 + eye.position.y + eye.scale.y
                        eye.brow.position.y += bp[1][i]
                        eye.brow.rotation.z = bp[0][i]
                    })
                }
            })
        }
    }
    window.Face = Face
}