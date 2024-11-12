/*
    TODO
        Making nodes
        editing nodes
        Grab an edge and you can change the value of the variable it represents
        making connections
        just console.log the result for now
        Can generate a random fg

    "Look at markov blanket" mode - hover a node...
        Everything that node cannot have access to is marginalized out

    It's about FACTORIZING the graph, that's a nice thing to do and surely tractable
    
    But what about belief space?

    TODO
        Instead of code, boxes could also have a picture of an equation in latex
            represented as code under the hood
        
*/

function initGraph() {

    let nodes = []

    //Circles
    let defaultValue = `return 0.5;`
    let circles = []
    {
        var circleMat = new THREE.MeshBasicMaterial({ color: 0x564937 })
        var circleMatHighlighted = new THREE.MeshBasicMaterial({ color: 0xb5e5cf })
        let geo = new THREE.SphereGeometry(.05)

        class CircularNode extends THREE.Mesh {
            constructor() {
                super(geo, circleMat)
                circles.push(this)
                scene.add(this)
                nodes.push(this)

                this.value = `return 0.5;`

                this.intendedPosition = new THREE.Vector3()
            }
        }
        window.CircularNode = CircularNode

        for(let i = 0; i < 3; i++) {
            let c = new CircularNode()

            do {
                c.position.x = .8 * (Math.random()-.5)
                c.position.y = .8 * (Math.random()-.5)
            }
            while (circles.some(c2 => c2 !== c && c2.position.distanceTo(c.position) < .2))
        }
    }

    //Squares
    {
        let geo = new THREE.PlaneGeometry(.1, .1)
        let mat = new THREE.MeshBasicMaterial({ color: 0xfcb5ac })

        class Square extends THREE.Mesh {
            constructor() {
                super(geo, mat)
                scene.add(this)
                nodes.push(this)

                this.intendedPosition = new THREE.Vector3()
            }
        }
        window.Square = Square

        let a = new Square()
        let b = new Square()

        a.position.x = .4
        a.position.y = -.4
        b.position.x = .6
    }

    let arrows = []
    {
        let arrowMat = new THREE.MeshBasicMaterial({ color: 0xb99095 })

        let headRadius = .03
        let headHeight = headRadius * 3.4
        let headGeo = new THREE.ConeGeometry(headRadius, headHeight)
        headGeo.translate(0., headHeight * .17, 0.)

        //yes, might want splines, but on the other hand might want right angles only
        let shaftRadius = headRadius * .3
        let shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, 1.)
        shaftGeo.translate( 0., .5, 0. )

        class Arrow extends THREE.Group {
            constructor(source,sink) {

                super()
                arrows.push(this)

                this.head = new THREE.Mesh(headGeo, arrowMat)
                this.add(this.head)
                
                this.source = source || null
                this.sink = sink || null

                this.shaft = new THREE.Mesh(shaftGeo, arrowMat)
                this.add(this.shaft)

                scene.add(this)
            }

            pointAtPosition(pos) {
                v1.subVectors(pos, this.source.position).normalize()
                this.quaternion.setFromUnitVectors(yUnit, v1)

                this.shaft.scale.y = pos.distanceTo(this.source.position)
                this.head.position.y = .5 * this.shaft.scale.y
            }

            update() {

                if(this.source !== null) {
                    this.position.copy(this.source.position)
                    this.position.z -= .02
                }

                if(this.sink !== null) {
                    this.pointAtPosition(this.sink.position)
                }
            }
        }
        window.Arrow = Arrow
    }

    let intersections = []
    new Arrow(nodes[0],nodes[1])
    updateGraph = () => {

        // nodes[1].position.y = .3 * Math.sin(frameCount * .02)

        //determining correct positions
        // {
        //     let integerDimension = Math.floor(Math.sqrt(nodes.length))
        //     let spacing = .2
        //     let totalWidth = (integerDimension-1) * spacing
        //     nodes.forEach((n,i) => {
        //         n.intendedPosition.x = (i%integerDimension) * spacing
        //         n.intendedPosition.y = Math.floor(i/integerDimension) * spacing
        //         n.intendedPosition.x -= (totalWidth) / 2.
        //         n.intendedPosition.y -= (totalWidth) / 2.
        //     })

        //     //repositioning
        //     nodes.forEach(n=>{
        //         n.position.lerp( n.intendedPosition, 10.*frameDelta )
        //     })
        // }

        arrows.forEach(a => a.update())

        if(heldArrow)
            heldArrow.pointAtPosition(mousePos)

        intersections.length = 0
        raycaster.intersectObjects(nodes, false, intersections)

        circles.forEach(c => c.material = circleMat)
        if (intersections[0] && circles.indexOf(intersections[0].object) !== -1)
            intersections[0].object.material = circleMatHighlighted
    }


    let heldArrow = null
    renderer.domElement.addEventListener('mousedown', (event) => {
        if(event.button === 0) {
            intersections.length = 0
            raycaster.intersectObjects(nodes, false, intersections)
            if (intersections[0]) {
                heldArrow = new Arrow()
                heldArrow.source = intersections[0].object
            }
            else {
                let newNode = new CircularNode()
                newNode.position.copy(mousePos)
            }
        }
    })

    let editingNode = null
    renderer.domElement.addEventListener('mouseup', (event) => {
        if (event.button === 0 && heldArrow !== null) {
            intersections.length = 0
            raycaster.intersectObjects(nodes, false, intersections)

            if (intersections[0] && intersections[0].object !== heldArrow.source) {
                heldArrow.sink = intersections[0].object
            }
            else {

                if (intersections[0] && intersections[0].object === heldArrow.source) {
                    editingNode = intersections[0].object
                    textarea.style.visibility = ""
                    textarea.value = editingNode.value
                    // errorBox.style.visibility = ""
                    //open the editor!
                }

                scene.remove(heldArrow)
            }

            heldArrow = null
        }
    })

    renderer.domElement.addEventListener('mousewheel', (event) => {
        // raycaster.setFromCamera(mouse, camera)
        if(event.deltaY < 0.)
            camera.position.z *= 1.1
        if (event.deltaY > 0.)
            camera.position.z *= (1./1.1)
    })

    evaluateWholeGraph = () => {
        let result = 1.
        circles.forEach(n=>{
            result *= eval(`()=>{` + n.value + `}`)()
        })
        // log(result)
        errorBox.innerHTML = result
        errorBox.style.visibility = ""
    }

    // textarea.style.visibility = "hidden"
    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.key === "Enter") {

            if( textarea.style.visibility === "hidden")
                textarea.style.visibility = ""
            else {
                textarea.style.visibility = "hidden"
            }

            try {
                let ret = eval(`()=>{` + textarea.value + `}`)()

                errorBox.style.visibility = "hidden"
                // textarea.style.visibility = "hidden"

                editingNode.value = textarea.value

                evaluateWholeGraph()
            } catch (e) {
                // +3 because `err` has the line number of the `eval` line plus two.
                errorBox.style.visibility = ""

                let lines = e.message.split(`\n`)
                errorBox.innerHTML = lines[0]
            }
        }
    })

    evaluateWholeGraph()
}