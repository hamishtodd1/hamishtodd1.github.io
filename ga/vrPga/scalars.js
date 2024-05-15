function initScalars() {
    // let tetGeo = new THREE.TetrahedronGeometry(.1)
    // log(tetGeo)
    // let indices = [
    //     [-1, 0, 0, 0],
    //     [0, -1, 2, 1],
    //     [1, 2, 1, -1],
    //     [2, 1, -1, 2],
    // ]
    // for (let face = 0; face < 4; ++face) {
    //     let faceCorner = indices[3][face]
    //     if (faceCorner === -1)
    //         continue
    //     // if(face !== 2)
    //     //     continue
    //     log((face * 3 + faceCorner) * 3)
    //     v1.fromArray(tetGeo.attributes.position.array, (face * 3 + faceCorner) * 3)
    //     v1.y += .15
    //     v1.toArray(tetGeo.attributes.position.array, (face * 3 + faceCorner) * 3)
    // }
    let opaqueGeo = new THREE.BoxGeometry(1., 1., 1.)
    let transparentGeo = opaqueGeo.clone()
    transparentGeo.scale(1.01, 1.01, 1.01)
    opaqueGeo.translate(0.5, 0.5, 0.5)
    transparentGeo.translate(1.01 / 2., 1.01 / 2., 1.01 / 2.)
    
    let edgeVecs = [
        new THREE.Vector3(1., 1., 0.),
        new THREE.Vector3(0., 1., 0.),
        new THREE.Vector3(0., 0., 1.)
    ]

    class ScalarViz extends THREE.Group {
        constructor(color) {
            super()
            let opaque = new THREE.Mesh(opaqueGeo, new THREE.MeshPhongMaterial({
                color: color,
                side: THREE.BackSide
            }))
            let transparent = new THREE.Mesh(transparentGeo, new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: .3,
                side: THREE.FrontSide
            }))
            this.add(opaque, transparent)
            this.matrixAutoUpdate = false
            this.matrix.makeBasis(edgeVecs[0], edgeVecs[1], edgeVecs[2])
            this.matrix.setPosition(0., 0., -2.)

            //idea is to have this at the center of the thing
            //Worry about it later because it should NOT be added to the parallelipiped
            // this.sign = new ChangeableText()
            // this.sign.scale.multiplyScalar(.4)
            // this.add(this.sign) //NO!!!!
        }
    }
    window.ScalarViz = ScalarViz
    
    let scalarBgMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
    class ChangeableText extends THREE.Group {

        constructor() {

            super()

            this.canvas = document.createElement("canvas")
            this.material = new THREE.MeshBasicMaterial({
                map: new THREE.CanvasTexture(this.canvas),
                transparent: true
            })

            let font = "Arial"
            let padding = 43
            let textSize = 85
            this.canvas.height = textSize + padding
            this.canvas.width = 200. //more an estimate of the required resolution

            let currentText = ""
            this.setText = function (text) {
                if (currentText === text)
                    return

                let context = this.canvas.getContext("2d")

                context.font = "bold " + textSize + "px " + font
                context.textAlign = "center"
                context.textBaseline = "middle"

                context.clearRect(
                    0, 0,
                    this.canvas.width,
                    this.canvas.height)
                context.fillStyle = "#000000"
                context.fillText(text, this.canvas.width / 2., this.canvas.height / 2. + 8) //8 is eyeballed. These are numbers

                let textWidth = context.measureText(text).width + padding
                bg.scale.x = bg.scale.y * textWidth / this.canvas.height

                this.material.map.needsUpdate = true

                currentText = text
            }

            let bg = new THREE.Mesh(unchangingUnitSquareGeometry, scalarBgMat)
            bg.position.z = -.01
            this.add(bg)
            let sign = new THREE.Mesh(unchangingUnitSquareGeometry, this.material);
            sign.scale.x = this.canvas.width / this.canvas.height
            this.add(sign)
        }

        dispose() {
            this.remove(this.children[0])
            this.remove(this.children[0])
            this.material.map.dispose()
            this.material.dispose()
        }
    }
}