function initSpecialRelativity()
{
    let viz = new THREE.Group()
    scene.add(viz)

    let littleScene = new THREE.Group()
    viz.add(littleScene)

    let spacecraft = new THREE.Mesh(new THREE.PlaneBufferGeometry(.1, .1), new THREE.MeshBasicMaterial({ transparent: true }))
    littleScene.add(spacecraft)
    let loader = new THREE.TextureLoader().setCrossOrigin(true)
    loader.load("data/spacecraft.png", function (texture)
    {
        spacecraft.material.map = texture
        spacecraft.material.needsUpdate = true
    }, function () { }, function (e) { console.error(e) })

    let tube = new THREE.Mesh(new THREE.CylinderBufferGeometry(.01, .01), new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.3
    }))
    tube.geometry.rotateZ(TAU / 4.)
    littleScene.add(tube)

    let bulbObj = null
    await new Promise(resolve =>
    {
        objLoader = new THREE.OBJLoader()
        objLoader.load("data/Lamp_Fluorescent_Illuminated.obj", function (obj)
        {
            bulbObj = obj
            resolve()
        }, function () { }, function (e) { console.log(e) })
    })
    function Bulb()
    {
        let bulb = new THREE.Group()

        littleScene.add(bulb)
        bulb.scale.multiplyScalar(0.0005)

        let bottom = bulbObj.children[0]
        bulb.add(new THREE.Mesh(bottom.geometry, new THREE.MeshStandardMaterial({
            color: 0x000000
        })))

        let bowlGeo = new THREE.Geometry().fromBufferGeometry(bulbObj.children[1].geometry)
        bowlGeo.mergeVertices()
        bowlGeo.computeFaceNormals()
        bowlGeo.computeVertexNormals()
        bulb.add(new THREE.Mesh(bowlGeo, new THREE.MeshLambertMaterial({
            color: 0xFFFFFF
        })))

        let screw = bulbObj.children[4]
        bulb.add(new THREE.Mesh(screw.geometry, new THREE.MeshStandardMaterial({ color: 0xCCCCCC })))

        bulb.lightBit = new THREE.Mesh(
            bulbObj.children[2].geometry.merge(bulbObj.children[3].geometry),
            new THREE.MeshLambertMaterial({ color: 0xFFFFFF }))
        bulb.add(bulb.lightBit)

        for (let i = 0; i < bulb.children.length; i++)
            bulb.children[i].position.y -= 90

        return bulb
    }

    let mouseLineInLittleScene = new THREE.Line3()
    let intersectionPlane = new THREE.Plane()
    intersectionPlane.normal.set(0., 0., 1.)
    intersectionPlane.constant = -.5

    littleScene.position.z = .5
    updateFunctions.push(() =>
    {
        if (mouse.clicking)
        {
            mouseLineInLittleScene.start.copy(mouse.rayCaster.ray.origin)
            mouseLineInLittleScene.end.copy(mouse.rayCaster.ray.direction).add(mouse.rayCaster.ray.origin)
            viz.worldToLocal(mouseLineInLittleScene.start)
            viz.worldToLocal(mouseLineInLittleScene.end)

            if (null === intersectionPlane.intersectLine(mouseLineInLittleScene, v1))
                log("no intersection")

            littleScene.position.copy(v1)
            littleScene.position.x = 0.

            littleScene.position.y = clamp(littleScene.position.y, -.5, .5)
        }

        littleScene.position.z -= .003 //advance time
        if (littleScene.position.z < -.5)
            littleScene.position.z = -.5

        let time = .5 - littleScene.position.z
        let velocity = littleScene.position.y
        spacecraft.position.x = time * velocity //top speed is .5 per 1, so half the speed of light
        
        let closestDist = Infinity
        let vertexIndex = -1
        for (let j = 0; j < bulbs[0].lines[0].geometry.vertices.length; j++)
        {
            let dist = Math.abs(bulbs[0].lines[0].geometry.vertices[j].y - velocity)
            if (dist < closestDist)
            {
                vertexIndex = j
                closestDist = dist
            }
        }

        for (let i = 0, il = bulbs.length; i < il; ++i)
        {
            let col = 0x808080
            
            //if flash duration seems too long or short it's because .1 needs to be lorenz adjusted, duh! really there are two events, on and off
            let timeRadius = .01
            for (let j = 0, jl = bulbs[i].lines.length; j < jl; ++j)
            {
                let dist = Math.abs(bulbs[i].lines[j].geometry.vertices[vertexIndex].z - littleScene.position.z)
                if (dist < timeRadius)
                    col = 0xFFFFFF
            }

            //contraction! when lines are curved bulbs will need to move too
            // bulbs[i].positionS

            v1.copy(bulbs[i].position).add(littleScene.position)

            bulbs[i].lightBit.material.color.setHex(col)
        }
    })

    let divisions = 7;
    let bulbs = Array(divisions + 1)
    for(let i = 0; i <= divisions; ++i)
    {
        let spacePosition = -.5 + i / divisions //it gets i because the bulbs are an array
        bulbs[i] = Bulb()
        bulbs[i].position.x = spacePosition
        bulbs[i].lines = []
        littleScene.add(bulbs[i])
        for(let j = 0; j <= divisions; j++)
        {
            let timePosition  = -.5 + j / divisions

            let mat = new THREE.MeshBasicMaterial({ color:0xFF0000})
            let l = new THREE.Line(new THREE.Geometry(), mat)
            bulbs[i].lines.push(l)
            for (let k = 0; k <= divisions; k++)
            {
                let rfPosition = -.5 + k / divisions
                let v = new THREE.Vector3(spacePosition, rfPosition, timePosition)
                l.geometry.vertices.push(v)
            }
            viz.add(l)
        }
    }
    viz.scale.setScalar(.2)
    viz.position.z = -.5
    viz.position.y = 1.6

    viz.rotation.y += -TAU/8.
    viz.rotation.x += TAU / 8.
}