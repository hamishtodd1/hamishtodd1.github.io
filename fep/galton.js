updateGalton = () => {
    
}
function initGalton() {

    // document.addEventListener('keydown', e => {
    // })

    let galtonScene = new THREE.Scene()
    scene.add(galtonScene)
    simplyMoveableThings.push(galtonScene)

    galtonScene.scale.multiplyScalar(.7)

    {
        let blocker = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xFAAD9D }))
        blocker.scale.set(2.4, 2.43, 1.)
        // galtonScene.add(blocker)
        blocker.position.z = .1
        blocker.position.y = .88

        let holdingBlocker = false
        document.addEventListener('keyup', e => {
            if(e.key === "q")
                holdingBlocker = !holdingBlocker
            if(e.key === "w") {
                let ch = coloredHeads.find(h => !h.visible)
                if(!ch) {
                    coloredHeads.forEach(h => h.visible = false)
                    coloredHeadsGaussians.forEach(h => {
                        h.visible = false
                        h.viz.visible = false
                    })
                }
                else {
                    ch.visible = true
                    coloredHeadsGaussians[coloredHeads.indexOf(ch)].visible = true
                    coloredHeadsGaussians[coloredHeads.indexOf(ch)].viz.visible = true
                }
            }
        })
        document.addEventListener('mousemove', e => {
            if(holdingBlocker) {
                blocker.position.add(mousePosDiff)
            }
        })
    }

    let pegs = []
    let pelletsOnBottom = []
    //instanceable
    let pegGeo = new THREE.CircleGeometry(.03, 14)
    let pegMat = new THREE.MeshBasicMaterial({ color: 0xF9A720 })
    let numInThisRow = 0
    let rows = 1
    let numBottomRow = 15
    let pegSpacingY = 1.8 / numBottomRow
    let pegSpacingX = pegSpacingY * 1.3
    let numPegs = numBottomRow * (numBottomRow + 1) / 2
    for(let i = 0; i < numPegs; ++i) {
        let peg = new THREE.Mesh(pegGeo, pegMat)
        galtonScene.add(peg)

        peg.position.x = (numInThisRow - (rows-1)/2.) * pegSpacingX
        peg.position.y = -rows * pegSpacingY
        pegs.push(peg)
        numInThisRow++
        if(numInThisRow >= rows ) {
            numInThisRow = 0
            rows++
        }
    }
    pegs.forEach((peg, i) => {
        peg.position.y -= pegs[numPegs-1].position.y
    })

    let speed = 1.
    let pileUp = true

    let bounceDuration = .5
    let g = -1.3
    let bottom = -.46
    let pelletRadius = .02
    let pelletGeo = new THREE.CircleGeometry(pelletRadius)
    pelletGeo.translate(0.,pelletRadius,0.)
    let pelletMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    let pellets = []
    class Pellet extends THREE.Mesh {
        constructor() {
            super(pelletGeo, pelletMat)
            pellets.push(this)
            obj3dsWithOnBeforeRenders.push(this)
            this.position.z = .01
            galtonScene.add(this)

            // initial FOR THIS BOUNCE
            this.posInitial = new THREE.Vector3()
            this.posFinal = new THREE.Vector3()
            this.reset()
        }

        reset() {
            this.bounce = 0
            this.timeThroughBounce = 0.
            this.posInitial.copy(pegs[0].position)
            this.posFinal.copy(pegs[Math.random() < .5 ? 1:2].position)
            this.posInitial.y += .03
            this.posFinal.y += .03
        }

        onBeforeRender() {

            if(this.bounce === -1)
                return

            this.timeThroughBounce += frameDelta * speed
            if (this.timeThroughBounce > bounceDuration && this.bounce < numBottomRow -1) {
                this.timeThroughBounce -= bounceDuration
                this.bounce++

                this.posInitial.copy(this.posFinal)
                this.posFinal.y -= pegSpacingY
                this.posFinal.x += pegSpacingX * (Math.random() > .5 ? .5 : -.5)
            }

            let t = this.timeThroughBounce / bounceDuration

            let u = (this.posFinal.y - this.posInitial.y) - 0.5 * g
            this.position.y = this.posInitial.y + t * u + 0.5 * g * t * t
            
            if(this.position.y < bottom) {

                let pelletOnBottom = new THREE.Mesh(pelletGeo, pelletMat)
                galtonScene.add(pelletOnBottom)
                pelletsOnBottom.push(pelletOnBottom)
                pelletOnBottom.position.x = this.posFinal.x
                pelletOnBottom.position.y = bottom

                if(pileUp) {
                    pelletsOnBottom.forEach((pellet, i) => {
                        if (Math.abs(pellet.position.x - pelletOnBottom.position.x) < .01)
                            pelletOnBottom.position.y += pelletRadius * 1.6
                    })
                }

                if(pelletsOnBottom.length < 50 )
                    this.reset()
                else {
                    this.visible = false
                    this.bounce = -1
                }
            }
            else
                this.position.x = this.posInitial.x + t * (this.posFinal.x - this.posInitial.x)
        }
    }

    let colors = [0xFF5555, 0x55FF55, 0x5555FF]
    let coloredHeads = []
    let coloredHeadsGaussians = []
    textureLoader.load('https://hamishtodd1.github.io/fep/data/mouseHead.png', (texture) => {
        let mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            // color: 0xFF0000
        })
        let yHead = .4
        let xHead = yHead * 603. / 535.
        let grayHead = new THREE.Mesh(unchangingUnitSquareGeometry, mat)
        grayHead.scale.x = xHead
        grayHead.scale.y = yHead
        galtonScene.add(grayHead)
        grayHead.position.x = -1.2
        grayHead.position.y = bottom
        let grayGaussian = new Gaussian(0xAAAAAA)
        grayGaussian.position.y = bottom
        galtonScene.add(grayGaussian)
        grayGaussian.setMeanSd(0., .5)

        colors.forEach((color, i) => {
            let head = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ 
                color, 
                side: THREE.DoubleSide,
                map: texture,
                transparent: true
            }))
            head.visible = false
            head.scale.x = -xHead
            head.scale.y = yHead
            galtonScene.add(head)
            head.position.x = -grayHead.position.x + .39 * i
            head.position.y = bottom
            coloredHeads.push(head)

            let gaussian = new Gaussian(color)
            gaussian.position.y = bottom
            gaussian.viz.visible = false
            gaussian.visible = false
            coloredHeadsGaussians.push(gaussian)
            galtonScene.add(gaussian)
            gaussian.setMeanSd(0.3*(i+1), .5)
        })
    })

    // new Pellet()
    updateGalton = () => {
        
        if(Math.random() < .04 && pellets.length < 80)
            new Pellet()
    }

    return galtonScene
}