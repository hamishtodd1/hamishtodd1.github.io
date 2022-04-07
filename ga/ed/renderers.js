async function initRenderers() {

    let bgGeo = new THREE.SphereGeometry(50.)
    let bgMat = new THREE.MeshBasicMaterial({color:0x88CEEC, side:THREE.BackSide })

    function Viz(elem) {
        const scene = new THREE.Scene()

        const fov = 45.
        const aspect = 1. //POTENTIALLY TO BE CHANGED
        const near = .1
        const far = 100.
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        camera.position.set(0, 0., 2)
        camera.lookAt(0, 0, 0)

        const bg = new THREE.Mesh(bgGeo, bgMat)
        scene.add(bg)

        let viz = {
            scene,
            camera,
            elem,
            render: () => {
                // get the viewport relative position of this element
                const { left, right, top, bottom, width, height } =
                    elem.getBoundingClientRect()

                const isOffscreen =
                    bottom < 0 ||
                    top > renderer.domElement.clientHeight ||
                    right < 0 ||
                    left > renderer.domElement.clientWidth;

                if (isOffscreen)
                    return

                const positiveYUpBottom = renderer.domElement.clientHeight - bottom
                renderer.setScissor(left, positiveYUpBottom, width, height)
                renderer.setViewport(left, positiveYUpBottom, width, height)

                renderer.render(scene, camera)
            }
        }
        return viz
    }

    const viz1 = Viz(document.querySelector('#topRightWindow'))
    
    const viz2 = Viz(document.querySelector('#inlineWindow'))
    viz2.scene.add(new THREE.Mesh(
        new THREE.SphereBufferGeometry(.8, 4, 2),
        new THREE.MeshBasicMaterial({ color: 0xFF0000 })))


    {
        let planeMat = new THREE.PlaneGeometry(1., 1.)

        compile = async () => {
            let currentMesh = viz1.scene.children[viz1.scene.children.length-1]
            if(currentMesh!==undefined) {
                viz1.scene.remove(currentMesh)

                let mat = currentMesh.material
                mat.dispose()
            }

            let mat = new THREE.ShaderMaterial({
                uniforms: {
                },
            })
            await assignShader("basicVertex", mat, "vertex")
            mat.fragmentShader = textarea.value

            let mesh = new THREE.Mesh(planeMat, mat)
            viz1.scene.add(mesh)
        }

        compile()
    }

    function render() {

        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (canvas.width !== width || canvas.height !== height)
            renderer.setSize(width, height, false)

        renderer.setScissorTest(false)
        renderer.clear(true, true)
        renderer.setScissorTest(true)

        viz1.render()
        viz2.render()

        requestAnimationFrame(render)
    }

    return render
}