//one idea for arrays is a block of boxes
//ints are entries there

//need it as an appearance in order to have text highlight, and to put shit in uniforms
//eh, can't you have a variable and mention... without an appearance?

function initSkeletons() {
    let uDw = dws.untransformed
    
    let boneMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    let boneGeo = new THREE.WireframeGeometry(new THREE.OctahedronGeometry(1.))
    let arr = boneGeo.attributes.position.array
    for (let i = 1, il = arr.length; i < il; i += 3) {
        if (i % 3 === 1) { //y coordinate
            if (arr[i] < 0.) arr[i] = 0.
            else if (arr[i] === 0.) {
                arr[i] = .2
                arr[i - 1] *= .2
                arr[i + 1] *= .2
            }
        }
    }

    //send in the bind pose matrices too
    //also, it lets you illustrate the dq version of "transform the vertex into the joint space"

    function getNewUniformDotValue() {
        return []
    }
    
    class arrayMat4Appearance extends Appearance {

        constructor(arrayLength) {
            super()

            this.uniform.value = this.state = Array(arrayLength)
            this.stateOld = Array(arrayLength)
            
            this.meshes = Array(arrayLength)
            for(let i = 0; i < arrayLength; ++i) {
                let boneMesh = uDw.NewMesh(boneGeo,boneMat,`LineSegments`)
                boneMesh.matrixAutoUpdate = false
                this.meshes[i] = boneMesh
                
                this.state[i] = new THREE.Matrix4()
                this.stateOld[i] = new THREE.Matrix4()
                this.stateOld[i].elements[0] = 2.
            }
        }

        _updateStateFromDrag() {
            //move them all around as if grabbed?
            //one day! Will be fun
            //if they're not uniforms, need a way to override them, which will be a fucking nightmare
        }

        updateFromState() {
            updateBoneMeshes()
        }
        
        getWorldCenter(dw,target) {
            return target.set(0.,0.,0.,1.)
        }
        _getTextareaManipulationDw() {
            return dws.untransformed
        }    
    }

    new AppearanceType(`mat4`, 16, arrayMat4Appearance,  getNewUniformDotValue, null, false, true )

    class arrayDqAppearance extends Appearance {

        constructor(arrayLength) {
            super()

            this.uniform.value = this.state = Array(arrayLength)
            this.stateOld = Array(arrayLength)

            this.meshes = Array(arrayLength)
            for (let i = 0; i < arrayLength; ++i) {
                let boneMesh = uDw.NewMesh(boneGeo, boneMat, `LineSegments`)
                boneMesh.matrixAutoUpdate = false
                this.meshes[i] = boneMesh

                this.state[i] = new THREE.Matrix4()
                this.stateOld[i] = new THREE.Matrix4()
                this.stateOld[i].elements[0] = 2.
            }
        }

        updateFromState() {
            updateBoneMeshes()
        }

        _updateStateFromDrag() {
        }

        getWorldCenter(dw, target) {
            return target.set(0., 0., 0., 1.)
        }
        _getTextareaManipulationDw() {
            return dws.untransformed
        }
    }

    new AppearanceType(`Dq`, 8, arrayDqAppearance, getNewUniformDotValue, null, false, true)
}