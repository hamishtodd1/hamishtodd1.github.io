async function init() {
    let movingPiece = null
    let fall = false

    {
        let currentY = .8
        let texts = []
        function addText(str) {
            let mesh = text(str)
            texts.push(mesh)
            mesh.position.y = currentY
            mesh.position.x = -.5
            mesh.scale.multiplyScalar(.15)
            scene.add(mesh)

            currentY -= .12
        }

        addText("Polar Tetris")
        addText("Arrow keys to move")
        addText("Spacebar to toggle help")
        addText("Enter to toggle gravity")

        function removeText() {
            texts.forEach(text=>{
                scene.remove(text)
            })
        }

        bindButton(" ",()=>{
            if (tetrisGroup.parent === scene)
                scene.remove(tetrisGroup)
            else
                scene.add(tetrisGroup)

            removeText()
        })
        bindButton("Enter", () => {
            fall = !fall
        })

    }

    init201()

    let tetrisGroup = new THREE.Group()
    tetrisGroup.position.z = .1
    tetrisGroup.position.y = .5
    tetrisGroup.scale.multiplyScalar(.5)
    scene.add(tetrisGroup)

    let ptsPerSq = 1
    let squareGeo = ptsPerSq === 1 ?
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3()]) :
        new THREE.PlaneGeometry(.5, .5, Math.sqrt(ptsPerSq)-1, Math.sqrt(ptsPerSq)-1)
    let polarPts = Array(ptsPerSq * 2)
    for(let i = 0; i < ptsPerSq*2; ++i)
        polarPts[i] = new THREE.Vector3()

    let pieces = []
    let col = new THREE.Color()
    let point = new Pga()
    let line = new Pga()
    let cameraLinesHorizontal = [new Pga(), new Pga()]
    let cameraLinesVertical   = [new Pga(), new Pga()]
    cameraLinesHorizontal[0].line(0.,  1., camera.top)
    cameraLinesHorizontal[1].line(0.,  1., camera.bottom)
    cameraLinesVertical[0].line( 1., 0., camera.left)
    cameraLinesVertical[1].line( 1., 0., camera.right)
    class Piece extends THREE.Group {
        constructor(coords,hue) {
            super()
            let self = this
            pieces.push(this)
            tetrisGroup.add(this)
            this.scale.multiplyScalar(.1)

            this.apparentSelf = new THREE.Group()
            tetrisGroup.add(this.apparentSelf)
            this.apparentSelf.scale.copy(this.scale)

            let color = col.setHSL(hue||Math.random(),1.,.5).getHex()
            let squareMat = new THREE.PointsMaterial({ color, size: window.innerHeight / 100 })
            let polarMat = new THREE.LineBasicMaterial({ color })
            coords.forEach(coordPair=>{
                let square = new THREE.Object3D()
                self.add(square)
                square.position.set(coordPair[0], coordPair[1], 0.)
                
                square.apparentSquare = new THREE.Points(squareGeo, squareMat)
                self.apparentSelf.add(square.apparentSquare)
                square.apparentSquare.position.copy(square.position)

                let polarGeo = new THREE.BufferGeometry().setFromPoints(polarPts)
                square.polar = new THREE.LineSegments(polarGeo.clone(), polarMat)
                    
                scene.add(square.polar)
            })
        }

        updatePolars() {

            let self = this
            self.apparentSelf.updateMatrix()

            this.children.forEach(square => {
                
                square.apparentSquare.updateMatrix()
                square.polar.geometry.attributes.position.needsUpdate = true
                let geoPosArray = square.polar.geometry.attributes.position.array
                
                for (let i = 0; i < ptsPerSq; ++i) {

                    v1.set(0., 0., 0.)
                    v1.toArray(geoPosArray, i * 6)
                    v1.toArray(geoPosArray, i * 6 + 3)

                    v1.fromArray(squareGeo.attributes.position.array, i * 3)
                    v1.applyMatrix4(square.apparentSquare.matrix).applyMatrix4(self.apparentSelf.matrix)
                    v1.multiplyScalar(6.)
                    point.pointFromVec(v1)

                    point.dual(line)

                    v1.set(0.,0.,0.)
                    v2.set(0., 0., 0.)
                    let v = v1
                    cameraLinesHorizontal.forEach(cl => {
                        cl.meet(line, point)
                        if (point[6] !== 0.) {
                            point.pointToVec(v)
                            if (camera.left   - .001 < v.x && v.x < camera.right + .001 &&
                                camera.bottom - .001 < v.y && v.y < camera.top   + .001) 
                                v = v === v1? v2:v3
                        }
                    })
                    cameraLinesVertical.forEach(cl => {
                        cl.meet(line, point)
                        if (point[6] !== 0.) {
                            point.pointToVec(v)
                            if (camera.left   - .001 < v.x && v.x < camera.right + .001 &&
                                camera.bottom - .001 < v.y && v.y < camera.top + .001)
                                v = v === v1 ? v2 : v3
                        }
                    })

                    if(!v1.equals(zeroVector) && !v2.equals(zeroVector)) {
                        v1.toArray(geoPosArray, i * 6)
                        v2.toArray(geoPosArray, i * 6 + 3)
                    }
                }
            })
        }
    }
    let surroundingsHue = 1.
    let floorCoords = []
    let floorWidth = 12
    for(let i = 0; i < floorWidth; ++i)
        floorCoords[i] = [i-(floorWidth-1)/2.,.5]
    let floor = new Piece(floorCoords, surroundingsHue)
    floor.position.y = -1
    floor.apparentSelf.position.copy(floor.position)

    let wallCoords = []
    let wallHeight = 19

    for(let i = 0; i < wallHeight; ++i)
        wallCoords[i] = [-5.5,i+1.5]
    let leftWall = new Piece(wallCoords,surroundingsHue)
    leftWall.position.y = -1
    leftWall.apparentSelf.position.copy(leftWall.position)
    
    for (let i = 0; i < wallHeight; ++i)
        wallCoords[i][0] = 5.5
    let rightWall = new Piece(wallCoords,surroundingsHue)
    rightWall.position.y = -1
    rightWall.apparentSelf.position.copy(rightWall.position)
    
    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }))
    bg.scale.set(.1 * floorWidth, .1 * (wallHeight+1),1.)
    bg.position.z = -.1
    tetrisGroup.add(bg)
    tetrisGroup.position.x = camera.right - bg.scale.x / 2.
    
    function thereIsNowCollision() {
        let ret = false
        movingPiece.children.forEach(movingPieceSquare => {
            movingPieceSquare.getWorldPosition(v2)
            pieces.forEach(piece => {
                if (piece === movingPiece)
                    return

                piece.children.forEach(square => {
                    let distSq = square.getWorldPosition(v1).distanceToSquared(v2)
                    if (distSq < .001)
                        ret = true
                })
            })
        })
        return ret
    }

    let goneLeft = false
    let goneRight = false
    let rotated = false
    bindButton("ArrowLeft",()=>{
        movingPiece.position.x -= .1
        if(thereIsNowCollision())
            movingPiece.position.x += .1
        
        goneLeft = true
        if (goneLeft && goneRight && rotated )
            removeText()
    })
    bindButton("ArrowRight", () => {
        movingPiece.position.x += .1
        if (thereIsNowCollision())
            movingPiece.position.x -= .1
        
        goneRight = true
        if (goneLeft && goneRight && rotated)
            removeText()
    })
    bindButton("ArrowUp", () => {
        movingPiece.rotation.z += TAU / 4.
        if (thereIsNowCollision())
            movingPiece.rotation.z -= TAU / 4.
        
        rotated = true
        if (goneLeft && goneRight && rotated)
            removeText()
    })
    bindButton("ArrowDown",()=>{},``, () => {
        if(frameCount%5 !== 0)
            return
        
        moveDown()
    })

    function newRandomPiece() {
        let randomIndex = Math.floor(Math.random() * Object.keys(squareLayouts).length)
        let layout = squareLayouts[Object.keys(squareLayouts)[randomIndex]]
        movingPiece = new Piece(layout)
        // movingPiece = new Piece(squareLayouts.square)
        movingPiece.position.y = 1.
        movingPiece.apparentSelf.position.copy(movingPiece.position)
    }
    newRandomPiece()
    
    // let possibleYValues = 
    function moveDown() {
        movingPiece.position.y -= .1
        let collided = thereIsNowCollision()
        if (!collided)
            return

        movingPiece.position.y += .1

        if(thereIsNowCollision())
            window.location.reload()

        let ysToRemove = []
        for (let i = 0, il = leftWall.children.length; i < il; ++i) {
            leftWall.children[i].getWorldPosition(v2)
            let y = v2.y
            let deleteMe = true
            floor.children.forEach(fSquare => {
                fSquare.getWorldPosition(v3)
                let x = v3.x
                let gotThisOne = false
                pieces.forEach(piece => {
                    piece.children.forEach(square => {
                        square.getWorldPosition(v1)
                        if (Math.abs(v1.x - x) < .01 && Math.abs(v1.y - y) < .01)
                            gotThisOne = true
                    })
                })
                if (!gotThisOne)
                    deleteMe = false
            })
            if(deleteMe)
                ysToRemove.push(y)
        }
        for(let i = 0; i < ysToRemove.length; ++i) {
            let y = ysToRemove[i]
            pieces.forEach(piece => {
                if (piece === leftWall || piece === rightWall || piece === floor)
                    return
                for(let i = piece.children.length-1; i >-1; --i ) {
                    let square = piece.children[i]
                    square.getWorldPosition(v1)
                    if (Math.abs(v1.y - y) < .02) {
                        scene.remove(square.polar)
                        piece.remove(square)
                        piece.apparentSelf.remove(square.apparentSquare)
                    }
                }
            })
        }
        for (let i = 0; i < ysToRemove.length; ++i) {
            let y = ysToRemove[i]
            pieces.forEach(piece => {
                if (piece === leftWall || piece === rightWall || piece === floor)
                    return
                toAdd = v2.set(0.,-1.,0.)
                q1.copy(piece.quaternion)
                q1.invert()
                toAdd.applyQuaternion(q1)
                piece.children.forEach(square => {
                    square.getWorldPosition(v1)
                    if (v1.y > y) {
                        square.position.addVectors(square.position, toAdd)
                        square.apparentSquare.position.copy(square.position)
                    }
                })
            })
        }

        newRandomPiece()
    }

    updateFunctions.push(()=>{
        if (fall && frameCount % 55 === 0)
            moveDown()

        pieces.forEach(piece => {
            piece.updatePolars()

            piece.apparentSelf.position.lerp(piece.position, .1)
            piece.apparentSelf.quaternion.slerp(piece.quaternion, .1)
        })
    })
}

let squareLayouts = {
    squiggly: [
        [.5, .5],
        [-.5, 1.5],
        [.5, -.5],
        [-.5, .5]],
    reverseSquiggly: [
        [-.5, .5],
        [.5, 1.5],
        [-.5, -.5],
        [.5, .5]],
    square: [
        [ .5, .5],
        [-.5, .5],
        [ .5,-.5],
        [-.5, -.5]],
    L: [
        [.5, 1.5],
        [.5, .5],
        [.5, -.5],
        [-.5, -.5]],
    reverseL: [
        [-.5, 1.5],
        [-.5, .5],
        [-.5, -.5],
        [.5, -.5]],
    Line: [
        [.5, 1.5],
        [.5, .5],
        [.5, -.5],
        [.5, -1.5]],
}