var rectangles = []

function initRectangles(thingToAddTo) {
    if (thingToAddTo === undefined)
        thingToAddTo = scene

    let unitSquareGeo = new THREE.PlaneBufferGeometry()

    let blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    let tblr = "tblr"

    let invisibleMaterial = new THREE.MeshBasicMaterial({ visible: false })

    let materials = []
    let materialRects = []

    let unitCoords = [
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0,

        0.5, 0.5, 0.0,
        -0.5, 0.5, 0.0,
        -0.5, -0.5, 0.0
    ]
    let unitUvs = [
        0., 0.,
        1., 0.,
        1., 1.,

        1., 1.,
        0., 1.,
        0., 0.
    ]

    roundOffRectangleCreation = () => {
        materials.forEach((mat, i) => {
            if (mat === invisibleMaterial)
                return

            let rects = materialRects[i]
            let numRects = rects.length

            if (numRects === 1) {
                var mesh = new THREE.Mesh(unitSquareGeo, mat)
                thingToAddTo.add(mesh)

                updateFunctions.push(() => {
                    mesh.position.copy(rects[0].position)
                    mesh.scale.copy(rects[0].scale)
                    mesh.visible = rects[0].visible

                    mesh.rotation.z = rects[0].rotationZ
                })
            }
            else {
                let bufferMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat)
                let coords = new Float32Array(3 * 3 * 2 * numRects)
                let uvs = new Float32Array(3 * 2 * 2 * numRects)
                bufferMesh.geometry.addAttribute("position", new THREE.BufferAttribute(coords, 3))
                bufferMesh.geometry.addAttribute("uv", new THREE.BufferAttribute(uvs, 2))
                thingToAddTo.add(bufferMesh)

                rects.forEach((rect, j) => {
                    for (let k = 0; k < 12; ++k) {
                        uvs[(j * 6 + k) * 2 + 0] = unitUvs[k * 2 + 0]
                        uvs[(j * 6 + k) * 2 + 1] = unitUvs[k * 2 + 1]
                    }
                })

                updateFunctions.push(() => {
                    rects.forEach((rect, j) => {
                        for (let k = 0; k < 12; ++k) {
                            if (rect.visible === false) {
                                coords[(j * 6 + k) * 3 + 0] = 0.
                                coords[(j * 6 + k) * 3 + 1] = 900.
                                coords[(j * 6 + k) * 3 + 2] = -900.
                            }
                            else {
                                coords[(j * 6 + k) * 3 + 0] = unitCoords[k * 3 + 0] * rect.scale.x + rect.position.x
                                coords[(j * 6 + k) * 3 + 1] = unitCoords[k * 3 + 1] * rect.scale.y + rect.position.y
                                coords[(j * 6 + k) * 3 + 2] = rect.position.z
                            }
                        }
                    })

                    bufferMesh.geometry.attributes.position.needsUpdate = true
                })
            }
        })

        Rectangle = () => { console.error("this isn't meant to be called after init") }
    }

    //starting out with 1700 materials, this binning takes it down to 270
    //Rectangle only gets called 40 times so that should mean it can go down to that
    //then some could even be merged, using vertex colors
    //ones with textures need their own

    Rectangle = function (params) {
        if (frameCount > 1)
            log("yo")

        if (params === undefined)
            params = {}

        const rect = {}
        rectangles.push(rect)

        rect.getEdgeCenter = function (edge, target) {
            target.y = this.position.y
            if (edge === "t" || edge === "b")
                target.y += this.scale.y * .5 * (edge === "b" ? -1. : 1.)

            target.x = this.position.x
            if (edge === "l" || edge === "r")
                target.x += this.scale.x * .5 * (edge === "l" ? -1. : 1.)

            return target
        }

        rect.goToIntendedPosition = () => {
            rect.position.x = rect.intendedPosition.x
            rect.position.y = rect.intendedPosition.y
        }

        rect.getCorner = function (corner, target) {
            target.x = this.position.x
            target.y = this.position.y

            target.y += this.scale.y / 2. * (corner[0] === "t" ? 1. : -1.)
            target.x += this.scale.x / 2. * (corner[1] === "l" ? -1. : 1.)
        }
        //the bets are all the same length as the money they're worth

        rect.setPositionFromEdge = function (edge, x, y) {
            rect.position.x = 0
            rect.position.y = 0
            rect.getEdgeCenter(edge, v0)

            rect.position.x = x - v0.x
            rect.position.y = y - v0.y
        }
        rect.setPositionFromCorner = function (corner, x, y) {

            let xAddition = (corner[1] === "l" ? 1. : -1.) * this.scale.x / 2.
            this.position.x = x + xAddition

            if (y !== undefined) {
                let yAddition = (corner[0] === "t" ? -1. : 1.) * this.scale.y / 2.
                this.position.y = y + yAddition
            }

            if (this.intendedPosition !== undefined) {
                this.intendedPosition.x = this.position.x
                this.intendedPosition.y = this.position.y
            }
        }

        {
            let mat = null
            if (params.mat)
                mat = params.mat
            else if (params.frameOnly || params.getScaleFromLabel)
                mat = invisibleMaterial
            else
                mat = new THREE.MeshBasicMaterial()

            rect.material = mat

            if (materials.indexOf(mat) === -1) {
                materials.push(mat)
                materialRects.push([])
            }
            materialRects[materials.indexOf(mat)].push(rect)

            if (params.label) {
                let labelLines = typeof params.label === "string" ? [params.label] : params.label

                rect.textMeshes = Array(labelLines.length)
                labelLines.forEach((line, i) => {
                    rect.textMeshes[i] = rectangleText(line, false)
                    thingToAddTo.add(rect.textMeshes[i])
                })

                updateFunctions.push(() => {
                    let widestTextMesh = null
                    let widestVal = -Infinity
                    rect.textMeshes.forEach((tm) => {
                        if (tm.scale.x > widestVal) {
                            widestVal = tm.scale.x
                            widestTextMesh = tm
                        }
                    })
                    if (!widestTextMesh)
                        return
                    const widestWidth = widestTextMesh.scale.x
                    const intendedWidth = rect.scale.x
                    const scaleMultiple = intendedWidth / widestWidth
                    rect.textMeshes.forEach((tm, i) => {
                        tm.position.x = rect.position.x
                        tm.position.y = rect.position.y + tm.scale.y * -(i - (rect.textMeshes.length - 1.) / 2.)
                        tm.position.z = rect.position.z + .05

                        tm.visible = rect.visible

                        tm.scale.multiplyScalar(scaleMultiple)

                        tm.position.z = rect.position.z
                    })

                    if (params.getScaleFromLabel) {
                        let widestAspect = -1.
                        rect.textMeshes.forEach((tm) => {
                            widestAspect = Math.max(widestAspect, tm.material.getAspect())
                        })
                        rect.scale.x = widestAspect * rect.scale.y / rect.textMeshes.length
                    }
                })
            }

            if (params.map)
                mat.map = params.map

            if (params.col)
                mat.color.setHex(params.col)

            if (params.opacity) {
                mat.transparent = true
                mat.opacity = params.opacity
            }

            rect.rotationZ = 0.
            rect.setRotationZ = (newRotationZ) => {
                rect.rotationZ = newRotationZ
                //TODO if you want to do this with something with more than one material...
            }

            {
                rect.position = new THREE.Vector3()
                rect.scale = new THREE.Vector3(1., 1., 1.)
                rect.color = new THREE.Color()

                rect.visible = true
                if (params.visible !== undefined)
                    rect.visible = params.visible

                updateFunctions.push(() => {
                    if (rect.edges) {
                        rect.edges.forEach((edge) => {
                            edge.visible = rect.visible
                        })
                    }
                })

                rect.toggleVisibility = () => {
                    let newVal = !rect.visible
                    rect.visible = newVal
                    if (rect.textMeshes !== undefined)
                        rect.textMeshes.forEach((tm) => { tm.visible = newVal })
                }
            }
        }

        {
            if (params.x)
                rect.position.x = params.x
            if (params.y)
                rect.position.y = params.y
            if (params.z)
                rect.position.z = params.z
            if (params.w)
                rect.scale.x = params.w
            if (params.h)
                rect.scale.y = params.h

            if (params.getPosition) {
                updateFunctions.push(() => {
                    params.getPosition(rect.position,rect)
                })
            }
            if (params.getScale) {
                updateFunctions.push(() => {
                    params.getScale(rect.scale)
                })
            }

            if (params.haveIntendedPosition) {
                rect.intendedPosition = new THREE.Vector3().copy(rect.position)
                let settlementRate = params.settlementRate || .1
                updateFunctions.push(() => {
                    rect.position.x += (rect.intendedPosition.x - rect.position.x) * settlementRate * (60. * frameDelta)
                    rect.position.y += (rect.intendedPosition.y - rect.position.y) * settlementRate * (60. * frameDelta)
                })
            }

            if (params.haveIntendedScale) {
                rect.intendedScale = new THREE.Vector3().copy(rect.scale)
                updateFunctions.push(() => {
                    rect.scale.x += (rect.intendedScale.x - rect.scale.x) * .1
                    rect.scale.y += (rect.intendedScale.y - rect.scale.y) * .1
                })
            }
        }

        if (params.frameThickness || params.haveFrame !== false ) {
            rect.frameThickness = params.frameThickness || .02
            rect.edges = Array(4)
            for (let i = 0; i < 4; ++i) {
                const edge = tblr[i]
                let frameR = Rectangle({
                    haveFrame: false,
                    mat: blackMaterial
                })
                rect.edges[i] = frameR

                updateFunctions.push(() => {
                    rect.getEdgeCenter(edge, frameR.position)

                    frameR.position.z = params.frameZ === undefined ? rect.position.z : params.frameZ
                    if (edge === "l" || edge === "r") {
                        frameR.position.x += rect.frameThickness * .5 * (edge === "l" ? -1. : 1.)
                        frameR.scale.x = rect.frameThickness
                        frameR.scale.y = rect.scale.y + rect.frameThickness * 2.
                    }

                    if (edge === "t" || edge === "b") {
                        frameR.position.y += rect.frameThickness * .5 * (edge === "t" ? 1. : -1.)
                        frameR.scale.y = rect.frameThickness
                        frameR.scale.x = rect.scale.x + rect.frameThickness * 2.
                    }
                })
            }
        }

        {
            if (params.onClick){
                onClicks.push({
                    z: () => {
                        mouse.raycaster.intersectZPlane(rect.position.z, v0)

                        v0.x -= rect.position.x
                        v0.y -= rect.position.y
                        v0.x /= rect.scale.x
                        v0.y /= rect.scale.y
                        
                        let inside = -.5 < v0.x && v0.x < .5 &&
                            -.5 < v0.y && v0.y < .5

                        if (inside)
                            return rect.position.z
                        else
                            return -Infinity 
                    },
                    start: params.onClick
                })
            }
        }

        return rect
    }

    function rectangleText(initialText, materialOnly) {
        if (materialOnly === undefined)
            materialOnly = false

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        let material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) });

        let currentText = ""
        material.getText = function () {
            return currentText
        }


        let backGroundColor = "#FFFFFF"

        material.setColor = function (newColor) {
            if (newColor[0] !== "#")
                console.error("play by the html rules")

            backGroundColor = newColor
        }

        material.setText = function (text) {
            if (currentText === text)
                return

            currentText = text

            let font = "Trebuchet"
            let backgroundMargin = 50;
            let textSize = 100;
            context.font = textSize + "pt " + font;
            let textWidth = context.measureText(text).width;
            canvas.width = textWidth + backgroundMargin;
            canvas.height = textSize + backgroundMargin;

            context.font = textSize + "pt " + font;
            context.textAlign = "center";
            context.textBaseline = "middle";

            context.fillStyle = backGroundColor;
            context.fillRect(
                canvas.width / 2 - textWidth / 2 - backgroundMargin / 2,
                canvas.height / 2 - textSize / 2 - backgroundMargin / 2,
                textWidth + backgroundMargin,
                textSize + backgroundMargin);

            let textColor = "#000000"
            context.fillStyle = textColor;
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            this.map.needsUpdate = true;

            if (materialOnly === false)
                sign.scale.x = material.getAspect() * sign.scale.y;
        }

        material.getAspect = function () {
            return canvas.width / canvas.height
        }

        if (materialOnly) {
            material.setText(initialText);
            return material
        }

        var sign = new THREE.Mesh(unitSquareGeo, material);
        material.setText(initialText);
        sign.scale.x = material.getAspect() * sign.scale.y;
        //so the question is "how wide is it?"

        return sign;
    }
}