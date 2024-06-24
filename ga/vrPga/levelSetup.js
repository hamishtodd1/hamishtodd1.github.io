
function initLevelSetup() {

    let currentLevelUpdate = () => { }

    let levelSelectGroup = new THREE.Group()
    {
        scene.add(levelSelectGroup)
        levelSelectGroup.scale.multiplyScalar(.03)

        let title = text("level select", false, `#000000`)
        title.position.y += 1.1
        levelSelectGroup.add(title)
    }

    let victorySound = new Audio(`data/sfx/levelVictory.wav`)
    victorySound.volume = .14
    let victorySigns = []
    for (let i = 0; i < 4; ++i) {
        let victorySign = text("Level complete!", false, `#000000`)
        victorySign.position.z -= 5.
        victorySign.position.applyAxisAngle(yUnit, i * Math.PI / 2.)
        scene.add(victorySign)
        victorySigns.push(victorySign)
    }

    //3D model
    // let promise = new Promise(resolve => {

    //     const objLoader = new THREE.OBJLoader()

    //     function onGeoLoad(object) {

    //         new THREE.TextureLoader().load('data/TALTS.jpg', (tex) => {
    //             let mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    //             object.children.forEach(child => {
    //                 child.material = mat
    //             })

    //             scene.add(object)
    //             object.scale.multiplyScalar(.05)
    //             comfortableLookPos(fl0).pointToGibbsVec(object.position)
    //         })
    //     }

    //     objLoader.load('data/TAL16OBJ.obj', onGeoLoad)
    // })

    let levels = []
    let signZ = -2.
    class Level {
        constructor(parameters) {
            levels.push(this)

            if (parameters.winCondition !== undefined)
                this.winCondition = parameters.winCondition
            else
                this.winCondition = () => false

            this.init = parameters.init || null

            let self = this
            self.signs = []
            if (parameters.signNames !== undefined) {
                for (let i = 0; i < parameters.signNames.length; ++i) {
                    let sign = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ transparent: parameters.signNames.length > 1 ? true : false }))
                    self.signs.push(sign)
                    sign.position.z = signZ
                    sign.position.y = 1.4
                    textureLoader.load(`data/levelSigns/` + parameters.signNames[i] + `.png`, texture => {
                        sign.material.map = texture
                        sign.material.needsUpdate = true
                        sign.scale.x = sign.scale.y * texture.image.width / texture.image.height
                    })
                }
            }

            let n = levels.indexOf(this)
            this.levelBox = text(n, false, `#000000`)
            this.levelBox.position.y -= 1.1 * n
            levelSelectGroup.add(this.levelBox)
        }
    }
    window.Level = Level

    function switchLevel(increment) {

        snappables.forEach(s => {
            if( !s.backgroundSnappable )
                s.dispose()
        })

        currentLevel += increment
        if (currentLevel > levels.length)
            currentLevel = levels.length
        if (currentLevel < -1)
            currentLevel = -1

        levels.forEach((l, i) => {
            l.signs.forEach(sign => {
                scene.remove(sign)
            })
        })

        let level = levels[currentLevel]
        if (level === undefined)
            return

        if (level.signs.length > 0) {
            level.signs.forEach(sign => {
                scene.add(sign)
            })
        }

        if(level.init !== null) {
            currentLevelUpdate = level.init()
        }
        else {
            currentLevelUpdate = () => {}
        }

        //remove everything user has made
    }

    let congratulationsTimer = -1

    let selectBox = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true, opacity: 1. }))
    levelSelectGroup.add(selectBox)
    updateLevel = () => {

        if (levels.length <= currentLevel || currentLevel < 0) {
            selectBox.visible = false
            return
        }
        selectBox.visible = true

        let level = levels[currentLevel]

        //level selection
        {
            let levelBox = levels[currentLevel].levelBox
            selectBox.position.copy(levelBox.position)
            selectBox.position.z -= .01
            selectBox.scale.copy(levelBox.scale)
            selectBox.scale.x += .25
            selectBox.scale.y += .25

            levelSelectGroup.position.copy(hands[RIGHT].position)
            levelSelectGroup.position.x += .1
            levelSelectGroup.lookAt(camera.position)
        }

        let frameDuration = 1.1
        let sequenceDuration = frameDuration * level.signs.length
        if (level.signs.length > 1) {
            let signs = level.signs

            signs.forEach(sign => {
                sign.material.opacity = 0.
            })

            let time = clock.elapsedTime % sequenceDuration
            let proportionThrough = (time % frameDuration) / frameDuration
            let section = Math.floor(time / frameDuration)
            let nextSection = (section + 1) % signs.length
            signs[section].material.opacity = proportionThrough < .92 ? 1. : 1. - 4. * (proportionThrough - .92)
            signs[nextSection].material.opacity = 1. - level.signs[section].material.opacity
            signs[section].position.z = signZ
            signs[nextSection].position.z = signZ + .001
        }

        //level completion
        let totalCongratulation = 2.
        if (congratulationsTimer > -1) {
            congratulationsTimer += frameDelta

            selectBox.material.opacity = sq(Math.sin(congratulationsTimer * .06))

            victorySigns.forEach(vs => {
                vs.position.y = congratulationsTimer / totalCongratulation
                vs.material.opacity = 1. - congratulationsTimer / totalCongratulation
                vs.visible = true
                vs.lookAt(camera.position)
            })

            if (congratulationsTimer >= totalCongratulation) {
                switchLevel(1)
                congratulationsTimer = -1
            }
        }
        else {
            victorySigns.forEach(vs => {
                vs.visible = false
            })

            selectBox.material.opacity = 1.

            if (level.winCondition()) {
                victorySound.play()
                congratulationsTimer = 0

                victorySigns.forEach(vs => {
                    vs.position.y = 0.
                    vs.visible = true
                })
            }
        }

        currentLevelUpdate()
    }

    document.addEventListener("keydown", event => {
        if (event.key == "]")
            switchLevel(1)
        if (event.key == "[")
            switchLevel(-1)
    })

    let currentLevel = -1
    initLevels()
    switchLevel(1)
}