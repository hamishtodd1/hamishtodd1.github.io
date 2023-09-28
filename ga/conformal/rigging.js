/*
    Put your hand IN the bone and grab, you can move it
    Point at the bone and grab, you've made another
    That creates another line in the spreadsheet

    You don't want to have to put your hand inside one to pick it up
    One button for grabbing, one for making anew

    Sketching wise: to make bones is to make mesh, don't want to break with that
        One idea was "generalized triangle" patches defined by spheres
        Spheres isn't such a good idea, because spheres have positions and scales but not orientations
        Tetrahedrons better?
        Tubes may be a good starting point
        How about... plane-bundle-looking things, to which the surfaces attach
        Do you want surface to be partnerable to one bone or two?
        Triangles where it varies smoothly might be the way to go
        Yes, bones are on the outside
            But don't go thinking they're rivets, a rivet lacks an extra twist

        How do you lay down these triangles?
            When you make a new bone attached to an existing one, it makes a tube
            Not hard to make a tube-like tool, just two triangles together
            Just has two of the vertices on one of the bones, two on the other
            The radius of the tube is an arbitrary decision you, the designer, are going to make

        But then what? To edit, you manually peel away the triangles? Looong
        People do seem to want clay. But that's not attached to the bones

    Philosophical
        Is "bones" a restrictive idea, less fundamental than transforms?
        They have a position and an orientation, i.e. they split the thing up. That's kinda bad.

    Spore!

 */

updateRigging = () => {}

function initRigging() {

    let highlightedBone = null
    let bones = []
    let heldBone = null

    let unhighlightedColor = new THREE.Color(0xFFFFFF)
    let highlightedColor = new THREE.Color(0xFF0000)
    let boneGeo = new THREE.BoxGeometry(.25,.25,.25)
    // let boneMat = new THREE.MeshPhongMaterial()
    // addUserMeshData(`bone`, boneGeo, boneMat)

    {
        // let icoGeo = new THREE.IcosahedronBufferGeometry(.25, 0)
        // let p = icoGeo.attributes.position.array
        // let numTris = p.length / 9
        // let ptsArr = [] // Array(numTris * 8)
        // for (let i = 0; i < numTris; ++i) {
        //     v1.fromArray(p, i * 9 + 0)
        //     v2.fromArray(p, i * 9 + 3)
        //     v3.fromArray(p, i * 9 + 6)

        //     ptsArr.push(v1.clone(), v2.clone(), zeroVector.clone())
        //     ptsArr.push(v2.clone(), v3.clone(), zeroVector.clone())
        //     ptsArr.push(v3.clone(), v1.clone(), zeroVector.clone())
        // }
        // icoGeo.dispose()
        // var boneGeo = new THREE.BufferGeometry().setFromPoints(ptsArr)
        // ptsArr.length = 0
        // boneGeo.computeVertexNormals()

        // a point-reflection is implicitly a point AND a plane
            //it has e0 included (just the plane, not the line/point field e0), because it stays there
            //that sounds a fuck of a lot like the point-and-sphere you have for e123+
            //

        let xGeo = new THREE.CircleGeometry(1., 30)
        log(xGeo)
        xGeo.rotateY(TAU / 4.)
        let yGeo = new THREE.CircleGeometry(1., 30)
        yGeo.rotateX(TAU / 4.)
        let zGeo = new THREE.CircleGeometry(1., 30)
        scene.add(new THREE.Mesh(xGeo,boneMat))

        var boneMat = new THREE.MeshPhongMaterial({
            side:THREE.FrontSide, 
            envMap: scene.background,
            reflectivity: .75,
        })
    }

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
            // this.viz = new SphereViz()
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

            // bone.viz.sphere.copy(bone.colliderSphere)
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