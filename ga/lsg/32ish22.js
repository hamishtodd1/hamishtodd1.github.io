update32ish22 = ()=>{}

function init32ish22() {

    let apparatus = new THREE.Group()
    scene.add(apparatus)

    // borders
    {
        let borderGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-limitsUpper.x, -limitsUpper.y, 0.),
            new THREE.Vector3(limitsUpper.x, -limitsUpper.y, 0.),
            new THREE.Vector3(limitsUpper.x, limitsUpper.y, 0.),
            new THREE.Vector3(-limitsUpper.x, limitsUpper.y, 0.),
        ])
        let borderMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF })
        let border = new THREE.LineLoop(borderGeo, borderMat)
        apparatus.add(border)

        document.addEventListener(`keydown`, event => {
            if (event.key === ` `)
                limitsUpper.z = limitsUpper.z === .1 ? limitsUpper.x : .1
        })
    }

    let numPts = 300
    {
        var ptsAttr = new THREE.Float32BufferAttribute(new Float32Array(numPts * 3), 3)
        let pts = ptsAttr.array
        function randomizePt(index) {
            pts[index * 3 + 0] = (Math.random()-.5) * limitsUpper.x * 2.
            pts[index * 3 + 1] = (Math.random()-.5) * limitsUpper.y * 2.
            pts[index * 3 + 2] = 0.
        }
        for (let i = 0; i < numPts; i++) {
            randomizePt(i)
        }
        let ptsGeo = new THREE.BufferGeometry()
        let ptsMat = new THREE.PointsMaterial({ color: 0xFF0000, size: 0.04 })
        let ptsObj3d = new THREE.Points(ptsGeo, ptsMat)
        apparatus.add(ptsObj3d)
        ptsGeo.setAttribute('position', ptsAttr)
    }

    let sign = null
    function newSign(str) {
        sign = text(str, false, `#000000`)
        sign.scale.multiplyScalar(.2)
        sign.position.y = limitsUpper.y + .2
        scene.add(sign)
    }
    newSign(`1`)

    let components = [new Tw()]
    let componentCurrent = components[0]
    componentCurrent.copy(_e1)
    document.addEventListener(`keydown`,event=>{

        function increment(vec,amt) {
            componentCurrent.addScaled(vec, amt, componentCurrent)
        }

        if(event.key === `Enter`) {
            if(components.length === 4)
                components.length = 1
            else
                components.push(new Tw())

            componentCurrent = components[components.length-1]
        }
        else if(event.key === `q`)
            increment(_em, 1./8.)
        else if(event.key === `a`)
            increment(_em, -1./8.)
        else if(event.key === `w`)
            increment(_ep, 1./8.)
        else if(event.key === `s`)
            increment(_ep, -1./8.)
        else if(event.key === `e`)
            increment(_e1, 1./8.)
        else if(event.key === `d`)
            increment(_e1, -1./8.)
        else if(event.key === `t`)
            increment(_et, 1./8.)
        else if(event.key === `g`)
            increment(_et, -1./8.)

        let oldMat = sign.material
        let signOld = sign
        scene.remove(signOld)
        oldMat.dispose()
        newSign(componentCurrent.toString())
    })
    update32ish22 = () => {
        if (frameCount % 100 === 0) {
            for (let i = 0; i < numPts; i++) {
                randomizePt(i)
            }
        }
        ptsAttr.needsUpdate = true
    }
    
}