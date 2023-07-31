/*
    Put your hand IN the bone and grab, you can move it
    Point at the bone and grab, you've made another
    That creates another line in the spreadsheet

    You don't want to have to put your hand inside one to pick it up
    One button for grabbing, one for making anew

 */

updateRigging = () => {}

function initRigging() {

    let highlightedBone = null
    let bones = []
    let heldBone = null

    let unhighlightedColor = new THREE.Color(0x000000)
    let highlightedColor = new THREE.Color(0xFF0000)
    let boneGeo = new THREE.BoxGeometry(.25,.25,.25)
    let boneMat = new THREE.MeshPhongMaterial()
    // addUserMeshData(`bone`, boneGeo, boneMat)

    function sphereFullyInFrontOfPlane(sphereCga, planeCga) {
        sphereCga.transformToSquared(planeCga, cga0)

        cga0.selectGrade(2, cga1)
        let scalar = cga0[0]
        let bivNorm = cga1.selfSelfReverseScalar()

        return Math.sign(scalar) === 1. && Math.sign(bivNorm) === -1.
    }

    function sphereIntersectedByLine( sphere, line ) {
        let num = sphere.meet(line, cga0).selectGrade(3,cga1).selfSelfReverseScalar()
        return num > 0.
    }

    function sphereCutsPp (sphere,pp) {
        let num = sphere.cast(cga1).meet(pp, cga0).selfSelfReverseScalar()
        return num > 0.
    }
    
    let bonesInstances = new THREE.InstancedMesh(boneGeo, boneMat,64)
    bonesInstances.setColorAt(0, unhighlightedColor)
    bonesInstances.count = 0
    scene.add(bonesInstances)
    let worldGettingDq = new Dq()
    let parentDq = new Dq()
    class Bone {
        constructor() {
            bones.push(this)

            this.index = bonesInstances.count++
            this.colliderSphere = new Sphere()
            this.viz = new SphereViz()
            this.dq = new Dq().copy(oneDq)

            this.parent = null
        }

        getWorldDq(dq) {
            dq.copy(this.dq)
            let parent = this.parent
            while(parent) {
                parent.dq.mul(dq, worldGettingDq)
                dq.copy(worldGettingDq)
                parent = parent.parent
            }

            return dq
        }

        getParentReverse(target) {
            parentDq.copy(oneDq)
            if( heldBone.parent )
                heldBone.parent.getWorldDq(parentDq)
            parentDq.reverse(target)
            
            return target
        }

        //if your hand is exactly on the bone, this is what you'd apply
        getDirect(target) {
            this.getParentReverse(dq1).mul(handDq, target)
            return target
        }
    }

    let handEga = new Ega()
    let mousePlane = new Cga()
    let gap = new Dq()
    updateRigging = () => {

        // mouse
        if (heldBone) {
            let direct = heldBone.getDirect(dq0)
            direct.mul(gap, heldBone.dq)
        }

        bones.forEach( bone=>{

            bone.colliderSphere.fromCenterAndRadius(0., 0., 0., .16)

            let worldDq = bone.getWorldDq(dq0)
    
            let boneDqCga = cga0.fromEga(worldDq.cast(ega0))
            boneDqCga.sandwich( bone.colliderSphere.cast(cga1), cga2).cast(bone.colliderSphere)

            worldDq.normalize()
            worldDq.toMat4(m1)
            bonesInstances.setMatrixAt(bone.index, m1)

            bone.viz.sphere.copy(bone.colliderSphere)
        })

        handDq.cast(handEga)
        mousePlane.fromEga(handEga.sandwich(e2e, ega1))

        bones.forEach(bone => {
            bonesInstances.setColorAt(bone.index, unhighlightedColor)
        })

        //highlighting
        if (!heldBone) {
            highlightedBone = null
            let lowestDistSq = Infinity
            bones.forEach(bone => {

                if (bone === heldBone)
                    return

                //project the mouse's plane onto the sphere center
                //see which way that goes and how far

                let inFront = sphereFullyInFrontOfPlane(bone.colliderSphere.cast(cga2), mousePlane)
                let lasered = sphereIntersectedByLine(bone.colliderSphere.cast(cga2), cga3.fromEga(selectorRay.cast(ega0)))

                if (inFront && lasered) {
                    // debugger
                    let handToBone = bone.dq.mul(handDq.reverse(dq0), dq1)
                    let distSq = handToBone.getDistanceSq()

                    if (distSq < lowestDistSq) {
                        lowestDistSq = distSq
                        highlightedBone = bone
                    }
                }
            })

            if (highlightedBone !== null)
                bonesInstances.setColorAt(highlightedBone.index, highlightedColor)
        }

        bonesInstances.instanceMatrix.needsUpdate = true
        bonesInstances.instanceColor.needsUpdate = true
    }

    document.addEventListener('pointerdown', (event) => {

        //Make new
        if(event.button === 0) {
            heldBone = new Bone()
            if (highlightedBone)
                heldBone.parent = highlightedBone

            gap.copy(oneDq)
        }
        //grab existing
        else if(event.button === 2) {
            if (highlightedBone) {
                heldBone = highlightedBone

                let direct = heldBone.getDirect(dq0)
                direct.reverse(direct).mul(heldBone.dq, gap)
            }
        }

        //how do you say "I want to parent this one to that one?
        //well, in a very general sense it is taking two objects, a bone and a transform, and 

        // let clickedBone = bones.find( bone => 
        //     bone !== heldBone && 
        //     sphereCutsPp(bone.colliderSphere, cga2.fromEga(handPosition) ) )

        event.preventDefault()
    })

    document.addEventListener('pointerup', (event) => {
        heldBone = null
    })
}