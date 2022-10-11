/*
    Have buttons for showing:
        Number of dimensions of each window
        "Helper/Fake" shapes:
            Cone, circle, sphere, cross on 1,1 ambient space
            "Floor" planes
        "Show underside" - you usually don't need the lower cone
        Grids, maybe alternating black and white
        Labels of the names of each thing
        Showable as planes, points, or lines in 3D
                
    Script
        It's like a book opened at a right angle. Maybe the book of sand with an infinite number of pages
        Projective geo has a sophisticated view of infinity. Conformal is even more sophisticated
        Conformal transformations are very beautiful
        Computer graphics practitioners will have a rigorous foundation for
            Join formulae (but you could just ignore orientations)
            The rigorous way to extract distances from transformations (but you could just copypaste our iNorm)
            Sphere intersections for collision detection (but you could do it analytically)
            Camera projections (but it's only a bit of code, which you can get from the internet)
            Dynamics (but you could just use a library)
            Understanding Keenan Crane's crap? Maybe contact him to see if you could drop any remarks in
        Physicists will understand
            Classical mechanics (force lines dual to axis lines)
            Special relativity
            Conformal transformations for magnetic fields
            Cyclic conformal cosmology
            AdS/CFT (and conformal field theory generally? Well maybe, maybe not)
            Jodorowsky foil
        Mathematics
            Double cover of SL(2,R) (and SL(2,C)? H?)
            Connections between hyperbolic, elliptic, euclidean and associated groups
            Conformal group
            Lagrangian/Symplectic stuff because 2x2 matrix of quaternions?
            Is this a way to visualize covectors?
*/

async function init() {
    
    init41()

    canvas3d.width = window.innerWidth
    canvas3d.height = window.innerHeight

    let rendererSize = new THREE.Vector2()
    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.getSize(rendererSize)
    }
    document.addEventListener(`resize`, onWindowResize)
    onWindowResize()

    const dws = []
    let dwHeight = 170.
    let dwWidth = dwHeight
    let spacing = 10.
    class Dw {
        scene = new THREE.Scene()
        elem
        camera

        constructor(horizontalIndex, verticalIndex) {
            this.horizontalIndex = horizontalIndex
            this.verticalIndex = verticalIndex

            this.camera = new THREE.OrthographicCamera(-2.,2.,2.,-2., .1, 100.)
            this.camera.position.z = 3.

            let ambientLight = new THREE.AmbientLight()
            this.scene.add(ambientLight)

            // let box = new THREE.Mesh(new THREE.BoxGeometry(1., 1., 1.), new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
            // this.scene.add(box)

            if(dws[horizontalIndex] === undefined)
                dws[horizontalIndex] = []
            dws[horizontalIndex][verticalIndex] = this
        }
    }
    window.Dw = Dw

    renderToDw = (dw) => {
        let x = dw.horizontalIndex * (dwWidth + spacing) + spacing
        let y = rendererSize.y - (dw.verticalIndex+1) * (dwHeight + spacing)

        renderer.setScissor( x, y, dwWidth, dwHeight )
        renderer.setViewport(x, y, dwWidth, dwHeight )

        renderer.render(dw.scene, dw.camera)
    }

    initColumn0d()
    initColumn1d()
    initColumn2d()

    function render() {

        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        const width = canvas3d.clientWidth
        const height = canvas3d.clientHeight
        if (canvas3d.width !== width || canvas3d.height !== height)
            renderer.setSize(width, height, false)
        renderer.setScissorTest(false)
        renderer.setClearColor(0xFFFFFF, 0)
        renderer.clear(true, true)
        renderer.setScissorTest(true)
        renderer.setClearColor(0xCCCCCC, 1)

        dws.forEach((dwRow)=>{
            dwRow.forEach((dw)=>{
                renderToDw(dw)
            })
        })
        // renderToDw(dws.b)

        requestAnimationFrame(render)
    }

    render()
}