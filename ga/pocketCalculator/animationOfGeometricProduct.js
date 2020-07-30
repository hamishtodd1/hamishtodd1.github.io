/*
*/

async function initMultivectorAppearances_()
{
    let vectorRadius = .19
    let vectorGeometry = new THREE.CylinderBufferGeometry(0., vectorRadius, 1., 16, 1, false);
    vectorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0., 1., 0.))
    let vectorMaterial = new THREE.MeshStandardMaterial()

    function vec()
    {
        let newVec = new THREE.Mesh(vectorGeometry, vectorMaterial)
        newVec.matrixAutoUpdate = false
        scene.add(newVec)

        newVec.vecPart = new THREE.Vector3()
        let vecOrthX = new THREE.Vector3()
        let vecOrthZ = new THREE.Vector3()
        updateFunctions.push(function ()
        {
            randomPerpVector(newVec.vecPart, vecOrthX)
            vecOrthX.normalize()
            vecOrthZ.copy(newVec.vecPart).cross(vecOrthX).normalize().negate();
            newVec.matrix.makeBasis(vecOrthX, newVec.vecPart, vecOrthZ);
            newVec.matrix.setPosition(newVec.vecPart.multiplyScalar(-.5))
        })

        return newVec
    }

    let a = vec()
    let b = vec()

    function rect()
    {   
        let rect = new THREE.Group()
        scene.add(rect)
        rect.material = new THREE.MeshBasicMaterial({ color: 0x00FF00 })

        rect.thickness = .1
        for (let i = 0; i < 4; i++)
        {
            let r = new THREE.Mesh(unchangingUnitSquareGeometry, rect.material)
            rect.add(r)
            if (i < 2)
            {
                r.position.x = .5 - rect.thickness * .5
                r.scale.x = rect.thickness
            }
            else
            {
                r.position.y = .5 - rect.thickness * .5
                r.scale.y = rect.thickness
            }
            if (i % 2)
                r.position.multiplyScalar(-1.);
            r.position.z = .01
        }

        rect.setSize = function(width, height)
        {
            width = Math.max(Math.abs(width),.001)
            height = Math.max(Math.abs(height), .001)
            for (let i = 0; i < rect.children.length; i++)
            {
                rect.children[i].position.x = Math.sign(rect.children[i].position.x) * width / 2.
                rect.children[i].position.y = Math.sign(rect.children[i].position.y) * height / 2.

                rect.children[i].scale.x = rect.children[i].scale.x === rect.thickness ? rect.thickness : width + rect.thickness
                rect.children[i].scale.y = rect.children[i].scale.y === rect.thickness ? rect.thickness : height + rect.thickness
            }
        }

        return rect
    }
    
    let wedgeRect = rect()
    let dotRect = rect()
    dotRect.material.color.setRGB(0.,1.,1.)

    updateFunctions.push(function ()
    {
        let t = frameCount * .03
        a.vecPart.set(
            2.*Math.sin(t),
            1. + 3.*Math.cos(t),
            0.)
        b.vecPart.set(6., 0., 0.)

        wedgeRect.position.x = b.vecPart.x / 2.
        wedgeRect.position.y = a.vecPart.y / 2.
        wedgeRect.setSize(wedgeRect.position.x * 2., wedgeRect.position.y * 2.)

        wedgeRect.material.color.r = wedgeRect.position.y > 0. ? 1.:0.

        dotRect.position.x = a.vecPart.x / 2.
        dotRect.position.y = b.vecPart.x / 2.
        dotRect.setSize(dotRect.position.x * 2., dotRect.position.y * 2.)

        dotRect.material.color.r = dotRect.position.x > 0. ? 1. : 0.
    })
}