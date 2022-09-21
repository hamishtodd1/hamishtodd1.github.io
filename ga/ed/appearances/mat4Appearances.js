//maybe nice if it has a big triangle in the iDw (related to determinant?)
//can grab the triangle to rotate the thing. Can also grab the corners
//dotted lines connecting the arrow tips to the origin's unit vectors 

function initMat4s() {
    let vDw = dws.vectorSpace
    let sDw = dws.scalar
    let uDw = dws.untransformed

    function getNewUniformValue() {
        return new THREE.Matrix4()
    }

    let outputAssignmentPropts = [ //row major!
        `[0][0]`, `[1][0]`, `[2][0]`, `[3][0]`,
        `[0][1]`, `[1][1]`, `[2][1]`, `[3][1]`,
        `[0][2]`, `[1][2]`, `[2][2]`, `[3][2]`,
        `[0][3]`, `[1][3]`, `[2][3]`, `[3][3]`
    ]

    let vectorSize = 1.
    camera.whenZoomChangeds.push((amt) => {
        vectorSize *= amt
    })

    let origin = new THREE.Vector3()
    let basisVector = new THREE.Vector3()
    let whenGrabbed = new THREE.Matrix4()
    class mat4Appearance extends Appearance {
        #xMesh
        #yMesh
        #zMesh
        #determinantMesh

        constructor(arrayLength,uniformValue) {
            super()

            if (uniformValue !== undefined)
                this.uniform.value = this.state = uniformValue
            else
                this.uniform.value = this.state = getNewUniformValue()
            
            this.stateOld = getNewUniformValue()
            this.stateOld.elements[0] = 2.

            let mat = new THREE.MeshPhongMaterial()
            mat.color = this.col

            this.#xMesh = vDw.ArrowHeadAndShaft( mat )
            this.#yMesh = vDw.ArrowHeadAndShaft( mat )
            this.#zMesh = vDw.ArrowHeadAndShaft( mat )

            this.#determinantMesh = sDw.NewMesh(downwardPyramidGeo, new THREE.MeshBasicMaterial())
            this.#determinantMesh.material.color = this.col
            
            this.meshes = [this.#xMesh, this.#yMesh, this.#zMesh, this.#determinantMesh]
        }

        onGrab(dw) {
            if (dw === sDw)
                whenGrabbed.copy(this.state)
            else if (dw === vDw) {
                v1.setFromMatrixPosition(this.state)
                mv0.fromVec(v1)
                setDragPlane(mv0)
            }
            else return false
        }

        _updateStateFromDrag(dw) {
            if (dw === vDw) {
                intersectDragPlane(getMouseRay(dw), mv0)
                mv0.toVector(v1)
                this.state.setPosition(v1)
            }
            else if(dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)
                let desiredDeterminant = v1.x
                if( desiredDeterminant === 0.)
                    desiredDeterminant = .0001

                let oldDeterminant = whenGrabbed.determinant()
                let multiple = Math.sqrt(Math.sqrt(Math.abs(desiredDeterminant / oldDeterminant)))
                multiple *= Math.sign(desiredDeterminant / oldDeterminant)
                this.state.copy(whenGrabbed).multiplyScalar(multiple)
            }
            else return false
        }

        updateMeshesFromState() {
            origin.setFromMatrixPosition(this.state)

            basisVector.setFromMatrixColumn(this.state, 0).multiplyScalar(vectorSize)
            this.#xMesh.setVec( basisVector, origin )
            basisVector.setFromMatrixColumn(this.state, 1).multiplyScalar(vectorSize)
            this.#yMesh.setVec( basisVector, origin )
            basisVector.setFromMatrixColumn(this.state, 2).multiplyScalar(vectorSize)
            this.#zMesh.setVec( basisVector, origin )

            this.#determinantMesh.position.x = this.state.determinant()
        }

        getWorldCenter(dw, target) {
            if (dw === sDw)
                target.copy(this.#determinantMesh.position)
            else if(dw === vDw) {
                v1.setFromMatrixPosition(this.state)
                target.set(v1.x,v1.y,v1.z,1.)
            }
        }

        _getTextareaManipulationDw() {
            return vDw
        }
    }

    ///////////
    // ARRAY //
    ///////////
    // They are transforms, think about it as transforms

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

    //a skeleton really has more things to be visualized. 
    // There's the bind pose skeleton
    //and there are, for each bone, a transformation taking it to its animated state
    //arguably there's the hierarchy itself
    //this is CPU side. But, your goal is to teach people how dqs work
    //is your visualization of them not good for understanding the one thing people most wish to use it for?

    //is there some way to see the vertex in the "local space of the bone"?
    //Is that necessary? Or is it a very non-covariant way of thinking? Maybe dqs get rid of it? Fucking hope so

    //is this even an appearance? It doesn't have a specific location in the window
    //it is applicable to showing the dqs
    class skeletonAppearance extends Appearance {

        constructor(arrayLength) {
            super()

            this.uniform.value = this.state = Array(arrayLength)
            this.stateOld = Array(arrayLength)
            
            this.meshes = Array(arrayLength)
            for(let i = 0; i < arrayLength; ++i) {
                let boneMesh = uDw.NewMesh(boneGeo,boneMat,`LineSegments`)
                boneMesh.matrixAutoUpdate = false
                this.meshes[i] = boneMesh
                
                this.state[i] = getNewUniformValue()
                this.stateOld[i] = getNewUniformValue()
                this.stateOld[i].elements[0] = 2.
            }
        }

        stateEquals(otherState) {
            let ret = true
            this.state.forEach((state,i)=>{
                if(!state.equals(otherState[i]))
                    ret = false
            })

            return ret
        }
        stateCopyTo(toCopyTo) {
            this.state.forEach((state,i)=>{
                toCopyTo[i].copy(state)
            })
        }

        _updateStateFromDrag() {
            //move them all around as if grabbed?
            //one day! Will be fun.
            //if they're not uniforms, need a way to override them, which will be a fucking nightmare
        }

        updateMeshesFromState() {
            //yeah this is the proper way to do it, including that length thing
        }
        
        getWorldCenter(dw,target) {
            return target.set(0.,0.,0.,1.)
        }
        _getTextareaManipulationDw() {
            return dws.untransformed
        }    
    }

    let nonArrayType = new AppearanceType(`mat4`, 16, mat4Appearance,      getNewUniformValue, outputAssignmentPropts, true, false)
    let arrayType    = new AppearanceType(`mat4`, 16, skeletonAppearance,  getNewUniformValue, outputAssignmentPropts, true, true )
    arrayType.nonArrayType = nonArrayType
}