//one idea for arrays is a block of boxes
//ints are entries there

//need it as an appearance in order to have text highlight, and to put shit in uniforms
//eh, can't you have a variable and mention... without an appearance?

//could point to the first element and the last element

function initSkeletons() {
    let uDw = dws.untransformed

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
            
            for(let i = 0; i < arrayLength; ++i) {
                this.state[i] = new THREE.Matrix4()
                this.stateOld[i] = new THREE.Matrix4()
                this.stateOld[i].elements[0] = 2.
            }

            this.meshes = []
        }

        updateFromState() {
        }

        getWorldCenter(dw,target) {
            return target.set(0.,0.,0.,1.)
        }
        isVisibleInDw(dw){
            return dw === uDw
        }
        _getTextareaManipulationDw() {
            return uDw
        }    
    }

    new AppearanceType(`mat4`, 16, arrayMat4Appearance,  getNewUniformDotValue, null, false, true )

    class arrayDqAppearance extends Appearance {

        constructor(arrayLength) {
            super()

            this.uniform.value = this.state = Array(arrayLength)
            this.stateOld = Array(arrayLength)

            for (let i = 0; i < arrayLength; ++i) {
                this.state[i] = new Dq()
                this.stateOld[i] = new Dq()
                this.stateOld[i][1] = 1.
            }

            this.meshes = []
        }

        updateFromState() {
        }

        getWorldCenter(dw, target) {
            return target.set(0., 0., 0., 1.)
        }
        isVisibleInDw(dw){
            return dw === uDw
        }
        _getTextareaManipulationDw() {
            return uDw
        }
    }

    new AppearanceType(`Dq`, 8, arrayDqAppearance, getNewUniformDotValue, null, false, true)
}