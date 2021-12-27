/*
Make your viz of the planes, hopefully the mapping will come in due time

What's the motor taking C to C
    Easy enough to find, for a given point, the point it is sent to
    so you take two copies of point and rotate and move them up, and then add


Maybe think about its action on the unit circle

Does taking the transpose correspond to measuring the same thing in a different way? Surely

Two points are on the riemann sphere

as a bivector it'll be a point pair, you're exponentiating that

So picture 

f(4x4 C) {
    let mv = new Mv() //it's a quadreflection
    return mv
}

Could consider the circle on the boundary getting mapped from a certain thing on the plane

The function you're trying to make is... 

*/

let stateMotor = null
async function initKleinBall() {
    stateMotor = new Mv()
    stateMotor[0] = 1.

    let slightlyOffOrigin = e4.clone().multiplyScalar(.003).add(e1)
    let translator = new Mv()
    slightlyOffOrigin.mul(e1,translator)
    slightlyOffOrigin.normalize()

    updateFunctions.push(()=>{
        stateMotor.mul(translator,mv0)
        stateMotor.copy(mv0)
        stateMotor.normalize()
        log(stateMotor.norm())
        stateMotor.log()
    })

    let wholeThing = new THREE.Object3D()
    {
        scene.add(wholeThing)
    
        onClicks.push({
            start: () => { },
            during: () => {
                mouse.rotateObjectByGesture(wholeThing)
            },
            end: () => { },
            z: () => 0.
        })
    }

    {
        let shadowCaster = new THREE.Mesh(new THREE.IcosahedronGeometry(1., 2), new THREE.MeshBasicMaterial({
            color: 0x606060,
            transparent: true,
            opacity: .00001
        }))
        shadowCaster.castShadow = true
        shadowCaster.receiveShadow = false
        wholeThing.add(shadowCaster)
        await initLights(shadowCaster)
    }

    {
        let numDisks = 3
        let disks = []
        let diskGeometry = new THREE.CircleGeometry(1., 126)

        for (let i = 0; i < numDisks; ++i) {
            // let colorHex = numDisks
            let disk = new THREE.Mesh(diskGeometry, niceMat(i / (numDisks - 1.)))
            disk.castShadow = false
            disk.receiveShadow = false
            disks[i] = disk
            wholeThing.add(disk)

            disk.initialMv = new Mv()
            disk.initialMv.copy(zeroMv)

            //more elaborate stuff to come
            disk.initialMv[i+1] = 1.

            updateFunctions.push(() => {
                let mvToVisualize = mv4
                stateMotor.sandwich(disk.initialMv,mv4)
                
                let lineThroughOriginOrthogonalToPlane = mv0
                e123.inner(mvToVisualize, lineThroughOriginOrthogonalToPlane)
                
                let planeAtOrigin = mv1
                lineThroughOriginOrthogonalToPlane.mul( e123, planeAtOrigin )

                let zToMvRotor = mv2
                e3.mul(mvToVisualize,zToMvRotor)
                zToMvRotor.sqrtBiReflection(zToMvRotor)
                zToMvRotor.toQuaternion(disk.quaternion)

                let planePosition = mv3
                lineThroughOriginOrthogonalToPlane.mul(mvToVisualize, planePosition)
                planePosition.toVector(disk.position)
                
                let diskRadius = Math.sqrt(1. - disk.position.lengthSq())
                disk.scale.setScalar(diskRadius)
            })
        }
        // updateFunctions.push(()=>{
        //     disks[2].mv[4] = Math.cos(frameCount*.01)
        // })
    }
}

