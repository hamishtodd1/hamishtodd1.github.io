updateGalton = () => {
    
}

function initGalton() {

    let pausePellets = false
    let plopModeTimer = -1

    galtonScene = new THREE.Scene()
    scene.add(galtonScene)
    simplyMoveableThings.push(galtonScene)

    galtonScene.scale.multiplyScalar(.7)
    beliefSpaceScene.scale.copy(galtonScene.scale)

    resetRatIfExistent = (ppViz) => {
        let rat = rats.find(r => r.gaussian.viz === ppViz)
        if(rat) {
            rat.samples.length = 0
            rat.interpolationVal = -1.
            // should remove all pellets on bottom
        }
    }

    makeBunchPlopOutFromGaussian = (gaussian) => {

        plopModeTimer = 0

        pelletsOnBottom.forEach(p => p.visible = false)

        for (let i = 0; i < maxSamples; ++i) {
            let U1 = Math.random()
            let U2 = Math.random()
            let z0 = Math.sqrt(-2. * Math.log(U1)) * Math.cos(TAU * U2)
            // let z1 = Math.sqrt(-2. * Math.log(U1)) * Math.sin(TAU * U2)

            let mean = gaussian.viz.positions[0].x
            let sd = gaussian.viz.positions[0].y

            //sample from the gaussian with that mean and standard deviation:
            let sample = z0 * sd + mean
            sample = pegSpacingX * Math.round(sample / pegSpacingX) //+ pegSpacingX / 2.
            settleOnBottom(pelletsOnBottom[i], sample)
        }
        for(let i = 0; i < maxSamples; ++i) {
            pelletsOnBottom[i].visible = false
        }

        pellets.forEach(p => {
            p.visible = false
            p.bounce = -1
        })
    }

    resetGalton = () => {
        pellets.forEach(p => p.visible = false)
        pellets.forEach(p => p.bounce = -1)
        rats.forEach(r => r.samples.length = 0)
        pelletsOnBottom.forEach(p => p.visible = false)
    }

    {
        let blocker = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x9CF7F6 }))
        textureLoader.load('https://hamishtodd1.github.io/fep/data/foodDispenser.png', (texture) => {
            blocker.material.map = texture
            blocker.material.transparent = true
            blocker.material.opacity = .9
            blocker.material.needsUpdate = true
            blocker.scale.y = 1.96
            blocker.scale.x = texture.image.width / texture.image.height * blocker.scale.y

            let mrh = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xA1B2F4 }))
            mrh.scale.x += .06
            mrh.scale.y += .1
            mrh.position.z = -.06
            blocker.add(mrh)
        })
        galtonScene.add(blocker)
        blocker.position.z = -.01
        blocker.position.y = 1.38

        let holdingBlocker = false
        document.addEventListener('keyup', e => {

            //pause
            if (e.key === `r`)
                pausePellets = !pausePellets

            //toggle dots
            if(e.key === `t`) {
                rats.forEach(r => {
                    r.verticalDotted.visible = !r.verticalDotted.visible
                    r.horizontalDotted.visible = !r.horizontalDotted.visible
                })
            }
        })
        document.addEventListener('mousemove', e => {
            if(holdingBlocker) {
                blocker.position.add(mousePosDiff)
            }
        })
    }

    //////////
    // Pegs //
    //////////
    
    let pegs = []
    let numBottomRow = 15
    let pegSpacingY = 1.8 / numBottomRow
    let pegSpacingX = pegSpacingY * 1.3
    {
        //instanceable
        let pegGeo = new THREE.CircleGeometry(.03, 14)
        let pegMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        let numInThisRow = 0
        let rows = 1
        let numPegs = numBottomRow * (numBottomRow + 1) / 2
        for(let i = 0; i < numPegs; ++i) {
            let peg = new THREE.Mesh(pegGeo, pegMat)
            galtonScene.add(peg)
    
            peg.position.x = (numInThisRow - (rows-1)/2.) * pegSpacingX
            peg.position.y = -rows * pegSpacingY + .46
            peg.position.z = -.02
            pegs.push(peg)
            numInThisRow++
            if(numInThisRow >= rows ) {
                numInThisRow = 0
                rows++
            }
        }
        pegs.forEach((peg, i) => {
            peg.position.y -= pegs[numPegs-1].position.y
            peg.position.y += .46
        })

        for(let i = 0; i < numBottomRow - 2; ++i) {
            for(let j = 0; j < (i%2===0?numBottomRow:(numBottomRow-1)); ++j) {
                let fakePeg = new THREE.Mesh(pegGeo, pegMat)
                galtonScene.add(fakePeg)
                fakePeg.position.copy(pegs[pegs.length - numBottomRow + j].position)
                fakePeg.position.y = pegs[Math.floor(i * (i + 1) * .5)].position.y
                if(i%2===1)
                    fakePeg.position.x += pegSpacingX * .5
            }
        }
    }


    /////////////
    // Pellets //
    /////////////

    let speed = 1.
    let bounceDuration = .5
    let g = -1.3
    let pelletRadius = .02
    let pelletGeo = new THREE.CircleGeometry(pelletRadius)
    pelletGeo.translate(0.,pelletRadius,0.)
    let pelletMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 })
    let pellets = []
    class Pellet extends THREE.Mesh {
        constructor() {
            super(pelletGeo, pelletMat)
            pellets.push(this)
            obj3dsWithOnBeforeRenders.push(this)
            this.position.z = -.02
            galtonScene.add(this)

            // initial FOR THIS BOUNCE
            this.posInitial = new THREE.Vector3()
            this.posFinal = new THREE.Vector3()
            this.reset()
            this.bounce = -1
            this.visible = false
        }

        reset() {
            this.bounce = 0
            this.visible = true
            this.timeThroughBounce = 0.
            this.posInitial.copy(pegs[0].position)
            this.posFinal.copy(pegs[Math.random() < .5 ? 1:2].position)
            this.posInitial.y += .03
            this.posFinal.y += .03
        }

        onBeforeRender() {

            if(this.bounce === -1 || pausePellets )
                return

            if(plopModeTimer !== -1) {
                this.visible = false
                return
            }

            // debugger
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

            if(this.position.y >= 0.) 
                this.position.x = this.posInitial.x + t * (this.posFinal.x - this.posInitial.x)
            else {

                let pelletOnBottom = pelletsOnBottom.find(p => !p.visible)
                
                settleOnBottom( pelletOnBottom, this.posFinal.x )

                rats.forEach((r, i) => {
                    let g = r.gaussian
                    if(!g.visible )
                        return

                    r.mvOld.copy(g.viz.mv)

                    r.samples.push(pelletOnBottom.position.x)
                    let len = r.samples.length
                    if(len > 1) {
                        let mean = r.samples.reduce((a, b) => a + b) / len
                        let sd = 0.
                        r.samples.forEach(s => {
                            sd += (s - mean) * (s - mean)
                        })
                        sd = Math.sqrt(sd / len)
                        
                        // if(isNaN(sd))
                        //     debugger
                        
                        meanSdToPosPp(mean, sd, mv0)
                        mv0.mulReverse(r.mvOld, mv1)
                        mv1.cheapSqrt(mv2).logarithm(r.axisBiv)
                        r.interpolationVal = 0.
                    }
                })

                if (isAnotherPelletWanted() )
                    this.reset()
                else {
                    this.visible = false
                    this.bounce = -1
                }
            }
        }
    }
    let pelletsOnBottom = []
    let maxSamples = 100
    for (let i = 0; i < maxSamples; ++i) {
        let pellet = new THREE.Mesh(pelletGeo, pelletMat)
        galtonScene.add(pellet)
        pelletsOnBottom.push(pellet)
        pellet.visible = false
    }

    let bottomSpacing = pelletRadius * 1.6
    function settleOnBottom(pelletOb, x) {
        pelletOb.visible = true
        pelletOb.position.y = 0.
        pelletOb.position.x = x
        pelletsOnBottom.forEach((pellet, i) => {
            let otherVisiblePelletInSamePlace = pellet.visible && pellet !== pelletOb && Math.abs(pelletOb.position.x - pellet.position.x) < .01
            if (otherVisiblePelletInSamePlace)
                pelletOb.position.y += bottomSpacing
        })
    }

    function isAnotherPelletWanted() {
        let numVisibleOnBottom = pelletsOnBottom.filter(p => p.visible).length
        let numComing = pellets.filter(p => p.bounce !== -1).length
        let numPellets = numVisibleOnBottom + numComing
        return numPellets < maxSamples
    }

    //////////
    // Rats //
    //////////

    let rats = []
    let length = 100
    let dottedGeo = new THREE.PlaneGeometry(1., length, 1, length / 1.5)
    dottedGeo.translate(0., length / 2., 0.)
    dottedGeo.scale(.02, .02, .02)
    let arr = dottedGeo.index.array
    for (let i = 0, il = arr.length / 3; i < il; ++i) {
        if (i % 4 > 1) {
            arr[i * 3 + 2] = 0
            arr[i * 3 + 1] = 0
            arr[i * 3 + 0] = 0
        }
    }
    class Rat extends THREE.Mesh {

        constructor(color) {

            let mat = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.,
                color,
                side: THREE.DoubleSide
            })

            super(unchangingUnitSquareGeometry, mat)
            rats.push(this)

            this.scale.y = .4
            this.scale.x = this.scale.y * 603. / 535.
            galtonScene.add(this)

            this.gaussian = new Gaussian(color)
            // this.gaussian.setMeanSd(Infinity, 0.)
            this.gaussian.setMeanSd(0., 1.2)
            this.gaussian.visible = false
            this.gaussian.viz.visible = false

            this.axisBiv = new Mv31()
            this.interpolationVal = -1.
            this.mvOld = new Mv31()

            this.horizontalDotted = new THREE.Mesh(dottedGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x000000, clippingPlanes: [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)] }))
            this.horizontalDotted.rotation.z = -TAU / 4.
            this.verticalDotted = new THREE.Mesh(dottedGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }))
            this.verticalDotted.rotation.z = TAU / 2.
            this.gaussian.viz.pt2.add(this.horizontalDotted, this.verticalDotted)
            this.verticalDotted.visible = false
            this.horizontalDotted.visible = false

            this.samples = []
        }

        onBeforeRender() {
            if(this.gaussian.viz.visible) {
                this.horizontalDotted.material.clippingPlanes[0].normal.x = this.gaussian.viz.pt2.position.x > 0. ? 1. : -1.
                this.horizontalDotted.rotation.z = TAU / 4. + TAU / 2. * (this.gaussian.viz.pt2.position.x > 0. ? 0. : 1.)
            }
        }
    }
    
    let grayRat = new Rat(0xFFFFFF)
    // grayRat.visible = false
    grayRat.position.x = -1.9
    
    // let coloredRats = []
    // let colors = [0xFF5555, 0x55FF55, 0x5555FF]
    // colors.forEach((color, i) => {
    //     let rat = new Rat(color)
    //     rat.scale.x = -rat.scale.x
        
    //     rat.position.x = -grayRat.position.x
    //     rat.position.y = .2 * i
    //     coloredRats.push(rat)
        
    //     rat.visible = false
    // })

    // textureLoader.load('https://hamishtodd1.github.io/fep/data/mouseHead.png', (texture) => {
    //     rats.forEach(r => {
    //         r.material.map = texture
    //         r.material.needsUpdate = true
    //     })
    // })

    for(let i = 0; i < 30; ++i) {
        new Pellet()
    }

    // new Pellet()
    updateGalton = () => {

        if (plopModeTimer !== -1) {
            plopModeTimer += 1
            pelletsOnBottom.forEach(p => {
                if (p.position.y < plopModeTimer * bottomSpacing)
                    p.visible = true
            })
        }

        if (isAnotherPelletWanted() && Math.random() < .04 ) {
            let p = pellets.find(p => !p.visible)
            if(p)
                p.reset()
        }

        rats.forEach((r, i) => {
            if(!r.gaussian.visible)
                return

            // if(frameCount > 150)
            //     debugger
            if (r.interpolationVal !== -1.) {
                r.axisBiv.multiplyScalar(r.interpolationVal, mv0).exp(mv1).sandwich( r.mvOld, r.gaussian.viz.mv )
                r.interpolationVal = Math.min(1., r.interpolationVal + frameDelta * 15.)
                r.gaussian.updateFromMv()
            }
        })
    }
}