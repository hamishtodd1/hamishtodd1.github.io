/*
    Put your hand IN the bone and grab, you can move it
    Point at the bone and grab, you've made another
 */

updateRigging = () => {}

function initRigging() {

    let highlightedBone = null
    let bones = []
    let heldBone = null

    let boneGeo = new THREE.BoxGeometry(.25,.25,.25)
    let highlightedColor = new THREE.Color(0xFF0000)
    let unhighlightedColor = new THREE.Color(0x000000)
   
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
    
    let bonesInstances = new THREE.InstancedMesh(boneGeo, new THREE.MeshPhongMaterial(),64)
    bonesInstances.setColorAt(0, unhighlightedColor)
    bonesInstances.count = 0
    scene.add(bonesInstances)
    class Bone {
        constructor() {
            bones.push(this)

            this.index = bonesInstances.count++
            this.colliderSphere = new Sphere()
            this.viz = new SphereViz()
            this.dq = new Dq().copy(oneDq)

            this.parent = null
        }
    }

    let mouseTransformDq = new Dq()
    let mouseTransformEga = new Ega()
    let mousePlane = new Cga()
    bonesInstances.onBeforeRender = () => {

        bones.forEach( bone=>{
            bone.colliderSphere.fromCenterAndRadius(0., 0., 0., .16)
    
            let boneDqCga = cga0.fromEga(bone.dq.cast(ega0))
            boneDqCga.sandwich( bone.colliderSphere.cast(cga1), cga2).cast(bone.colliderSphere)

            bone.dq.toMat4(m1)
            bonesInstances.setMatrixAt(bone.index, m1)

            bone.viz.sphere.copy(bone.colliderSphere)
        })

        getMousePositionAndWheelDq(mouseTransformDq)
        mouseTransformDq.cast(mouseTransformEga)
        mousePlane.fromEga(mouseTransformEga.sandwich(e2e, ega1))
        
        highlightedBone = null
        let lowestDistSq = Infinity
        bones.forEach(bone=>{

            if(bone === heldBone)
                return

            //project the mouse's plane onto the sphere center
            //see which way that goes and how far

            let inFront = sphereFullyInFrontOfPlane(bone.colliderSphere.cast(cga2), mousePlane)
            let lasered = sphereIntersectedByLine(bone.colliderSphere.cast(cga2), cga3.fromEga(selectorRay.cast(ega0)))

            if (inFront && lasered) {
                // debugger
                let handToBone = bone.dq.mul(mouseTransformDq.reverse(dq0), dq1)
                let distSq = handToBone.getDistanceSq()

                if (distSq < lowestDistSq) {
                    lowestDistSq = distSq
                    highlightedBone = bone
                }
            }
        })

        // log(highlightedBone)
        bones.forEach(bone=>{
            bonesInstances.setColorAt(bone.index, bone === highlightedBone ? 
                highlightedColor : 
                unhighlightedColor)
        })

        bonesInstances.instanceMatrix.needsUpdate = true
        bonesInstances.instanceColor.needsUpdate = true
    }

    updateRigging = () => {
        // mouse
        getMousePositionAndWheelDq(dq0)
        if(heldBone)
            heldBone.dq.copy(dq0)
    }

    document.addEventListener('mousedown', (event) => {
        if(event.button !== 0)
            return

        let clickedBone = bones.find( bone => bone !== heldBone && sphereCutsPp(bone.colliderSphere, cga2.fromEga(mousePlanePosition) ) )
        if (clickedBone)
            heldBone = clickedBone
        else {
            heldBone = new Bone()
            if(highlightedBone)
                heldBone.parent = highlightedBone
            
            resetMouseWheelTransform() //do you even need this?
        }
    })

    document.addEventListener('mouseup', (event) => {
        heldBone = null
    })
}