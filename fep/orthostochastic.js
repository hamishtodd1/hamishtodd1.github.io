/*
    Bistochastic is linear combo of permutation matrices
*/

function initOrthostochastic() {

    let m = new THREE.Matrix3()

    let b = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0xFF0000 }))
    b.matrixAutoUpdate = false
    scene.add(b)

    let a = null
    textureLoader.load('https://hamishtodd1.github.io/fep/data/earthColor.png', (texture) => {
        let mat = new THREE.MeshBasicMaterial({ 
            map: texture
        })
        a = new THREE.Mesh(new THREE.SphereGeometry(1.), mat)
        a.position.x = 1.2
        scene.add(a)
    })

    let holding = false
    document.addEventListener('mouseup', (e) => {
        holding = false
    })
    document.addEventListener('mousedown', (e) => {
        holding = true
    })
    document.addEventListener('mousemove', (e) => {
        if(holding && a) {
            let angle = mousePosDiff.length() * .7
            v1.set(-mousePosDiff.y, mousePosDiff.x, 0.).normalize()
            q1.setFromAxisAngle(v1, angle)

            a.quaternion.premultiply(q1)
        }
    })

    updateOrthostochastic = () => {

        if(!a)
            return

        m.setFromMatrix4(m1.makeRotationFromQuaternion(a.quaternion))
        m.elements.forEach((e, i) => {
            m.elements[i] = Math.sqrt(Math.abs(m.elements[i]))
        })
        b.matrix.setFromMatrix3(m)
        b.matrix.elements[12] = -a.position.x
    }
}