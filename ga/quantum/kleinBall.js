/*
People to send to
    Emily Adlam
    Sean Carroll
    Tim Blaise!
    Grant Sanderson
    Henry minutephysics
    Henry Segerman, Sabetta Matsumoto
    Simon Newey
    Andy, absolutely Michael
    Hestenes

What's the motor taking C to C
    Easy enough to find, for a given point, the point it is sent to
    so you take two copies of point and rotate and move them up, and then add

az + b and cz + d are both rotation/translations
Well, what's 1/(cz+d)?

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

    // let slightlyOffOrigin = e4.clone().multiplyScalar(.003).add(e1)
    // let translator = new Mv()
    // slightlyOffOrigin.mul(e1,translator)
    // slightlyOffOrigin.normalize()

    
    // updateFunctions.push(()=>{
    //     stateMotor.mul(translator,mv0)
    //     stateMotor.copy(mv0)
    //     stateMotor.normalize()
    //     log(stateMotor.norm())
    //     stateMotor.log()
    // })

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
            transparent: true,
            opacity: .00001
        }))
        shadowCaster.castShadow = true
        shadowCaster.receiveShadow = false
        wholeThing.add(shadowCaster)
        await initLights(shadowCaster)
    }

    {
        var initialMvs = []

        //just the three planes
        // for (let i = 0; i < 3; ++i) {
        //     let im = new Mv()
        //     im.copy(zeroMv)
        //     im[i + 1] = 1.

        //     let a = im.dual()
        //     newPt[11] = 0.
        //     putSphereHereAtFrameCountZero(a)
            
        //     initialMvs[i] = im
        // }

        
        // let icoverts = [ [0., PHI,-1.]
        // [0., PHI, 1.]
        // [0.,-PHI,-1.]
        // [0.,-PHI, 1.]
        // [ PHI,-1.,0.]
        // [ PHI, 1.,0.]
        // [-PHI,-1.,0.]
        // [-PHI, 1.,0.]
        // [1.,0.,PHI]
        // [-1.,0.,PHI]
        // [1.,0.,-PHI]
        // [-1.,0.,-PHI] ]



        let fiveFoldAxis = new Mv()
        let PHI = (1. + Math.sqrt(5.)) / 2.
        fiveFoldAxis[5] = PHI
        fiveFoldAxis[6] = 1.
        fiveFoldAxis.normalize()
        let threeFoldAxis = new Mv()
        threeFoldAxis[5] = -1.
        threeFoldAxis[6] = -1.
        threeFoldAxis[8] = -1.
        threeFoldAxis.normalize()
        let r5 = rotorFromAxisAngle(fiveFoldAxis, TAU / 5.)
        let r3 = rotorFromAxisAngle(threeFoldAxis, TAU / 3.)
        let initialPt = new Mv()
        initialPt.point(PHI,0.,1.,0.)
        initialPt.normalize()
        initialPt[11] = .999999
        initialPt.normalize()

        let pts = []
        let num = 0
        let rotor = new Mv()
        let numRotors = 8
        let totalNums = Math.pow(3,numRotors)
        while (num <= totalNums ) {

            rotor.copy(oneMv)
            for(let i = 0; i < numRotors; ++i) {
                let trinaryDigit = Math.floor(num / Math.pow(3,i)) % 3
                if(trinaryDigit === 1)
                    rotor.copy( rotor.mul(r3, mv0) )
                if (trinaryDigit === 2)
                    rotor.copy(rotor.mul(r5, mv0))
            }
            let newPt = mv0
            newPt.copy(zeroMv)
            rotor.sandwich( initialPt, newPt )
            newPt[15] = 0.
            for(let i = 0; i < 11; ++i) {
                newPt[i] = 0.
            }
            newPt.normalize()
            
            let alreadyGot = false
            pts.forEach((pt) => {
                if (distancePointPoint(pt,newPt) < .01)
                    alreadyGot = true
            })
            if(!alreadyGot) {
                pts.push(newPt.clone())

                newPt.normalize()
                // newPt.log()
                let im = new Mv()
                im.log()
                newPt.possiblyProperDual(im)
                initialMvs.push(im)
            }

            num++
        }
    }

    function putSphereHereAtFrameCountZero(pt) {
        if(frameCount !== 0)
            return

        let m = new THREE.Mesh(new THREE.SphereGeometry(.05))
        pt.toVector(m.position)
        wholeThing.add(m)
    }

    {
        let disks = []
        let diskGeometry = new THREE.CircleGeometry(1., 126)

        let numPlanes = initialMvs.length
        for (let i = 0; i < numPlanes; ++i) {
            // let colorHex = numPlanes
            let disk = new THREE.Mesh(diskGeometry, niceMat(i / (numPlanes - 1.)))
            disk.castShadow = false
            disk.receiveShadow = false
            disks[i] = disk
            wholeThing.add(disk)

            disk.initialMv = initialMvs[i]

            updateFunctions.push(() => {
                // if (disk.initialMv[1] !== 0.)
                //     debugger

                let mvToVisualize = mv4
                // mvToVisualize.copy(disk.initialMv)
                stateMotor.sandwich(disk.initialMv, mvToVisualize)
                mvToVisualize.normalize()
                
                let lineThroughOriginOrthogonalToPlane = mv0
                e123.inner(mvToVisualize, lineThroughOriginOrthogonalToPlane)
                
                let planeAtOrigin = mv1
                lineThroughOriginOrthogonalToPlane.mul( e123, planeAtOrigin )
                planeAtOrigin.normalize()

                let zToMvRotor = mv2
                e3.mul(planeAtOrigin,zToMvRotor)
                zToMvRotor.sqrtBiReflection(zToMvRotor)
                zToMvRotor.toQuaternion(disk.quaternion)

                let planePosition = mv3
                lineThroughOriginOrthogonalToPlane.mul(mvToVisualize, planePosition)
                planePosition.normalize()
                // putSphereHereAtFrameCountZero(planePosition)
                // planePosition.toVector(disk.position)
                
                let diskRadius = Math.sqrt(1. - disk.position.lengthSq())
                disk.scale.setScalar(diskRadius)
            })
        }
    }
}