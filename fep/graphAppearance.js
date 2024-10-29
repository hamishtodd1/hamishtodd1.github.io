

function initGraph() {

    let nodes = []

    //Squares
    {
        let geo = new THREE.PlaneGeometry(.1, .1)
        let mat = new THREE.MeshBasicMaterial({ color: 0x0000FF })

        let a = new THREE.Mesh(geo, mat)
        a.position.x -= .4
        scene.add(a)

        let b = new THREE.Mesh(geo, mat)
        b.position.x = .6
        scene.add(b)

        nodes.push(a, b)
    }

    //Circles
    {
        let geo = new THREE.CircleGeometry(.05)
        let mat = new THREE.MeshBasicMaterial({ color: 0x00FF00 })

        let a = new THREE.Mesh(geo, mat)
        a.position.y = .3
        a.position.x = -.3
        scene.add(a)

        let b = new THREE.Mesh(geo, mat)
        b.position.x = .3
        b.position.y = .5
        scene.add(b)

        nodes.push(a, b)
    }

    //Arrows
    {
        let headRadius = .03
        let headHeight = headRadius * 3.4
        let headGeo = new THREE.ConeGeometry(headRadius, headHeight)
        headGeo.translate(0., -headHeight*.5,0.)

        let arrowMat = new THREE.MeshBasicMaterial({color:0xFF0000})
        
        class Arrow extends THREE.Mesh {
            constructor(source,sink) {

                super(headGeo, arrowMat)
                
                this.source = source || null
                this.sink = sink || null

                let shaft = new THREE.Mesh(shaftGeo, arrowMat)
                shaft.position.y = -headHeight
                this.add(shaft)

                scene.add(this)
            }

            update() {
                if (this.sink === null || this.source === null)
                    this.visible = false
                else {
                    this.visible = true

                    this.position.copy(this.sink.position)
                    this.updateMatrixWorld()

                    v1.subVectors(nodes[1].position, this.position).normalize()
                    this.quaternion.setFromUnitVectors(yUnit, v1)
                }
            }
        }
        window.Arrow = Arrow

        //yes, might want splines, but on the other hand might want right angles only
        let shaftRadius = headRadius * .3
        let shaftGeo = new THREE.CylinderGeometry(shaftRadius,shaftRadius,1.)
        shaftGeo.translate(0.,-.5,0.)
        shaftGeo.scale(1.,.2,1.)
    }

    let intersections = []
    let myArrow = new Arrow(nodes[0],nodes[1])
    updateGraph = () => {

        // nodes[1].position.y = .3 * Math.sin(frameCount * .02)

        myArrow.update()        

        intersections.length = 0
        raycaster.intersectObjects(nodes, false, intersections)
        if (intersections[0])
            log(intersections[0])
    }
}