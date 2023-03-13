//could have two or three lines, lower ones are zoom-ins
//possibly when you hover .x, .y .z, you can manipulate them individually here

function initFloats() {
    
    let sDw = dws.scalar

    let linearY = 0.//1.2
    let logarithmicY = -.9
    {

        let axisGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3(10., 0., 0.)])
        let notchGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(0.,-.15, 0.)])

        const axisMat = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        })

        let furthestMarkers = 3
        function makeMarkedNotch(string, x, y) {
            let marker = text(string)
            marker.position.x = x
            marker.scale.multiplyScalar(.65)
            marker.position.y = y
            marker.position.y -= marker.scale.y * .7

            let notch = new THREE.Line(notchGeo, axisMat)
            notch.position.y = y
            notch.position.x = x

            return [marker, notch]
        }
        for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
            let [marker, notch] = makeMarkedNotch(i.toString(), i, linearY)
            sDw.addNonMentionChild(marker)
            sDw.addNonMentionChild(notch)
        }

        let linearAxis = new THREE.Line(axisGeo, axisMat)
        linearAxis.position.y = linearY
        sDw.addNonMentionChild(linearAxis)

        // for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
        //     let val = Math.pow(10, i)
        //     let [marker, notch] = makeMarkedNotch(val.toString(), i, logarithmicY)
        //     sDw.addNonMentionChild(marker)
        //     sDw.addNonMentionChild(notch)
        // }

        // let logarithmicAxis = new THREE.Line(axisGeo, axisMat)
        // logarithmicAxis.position.y = logarithmicY
        // sDw.addNonMentionChild(logarithmicAxis)
    }

    //could make little disks going along the vector space's notches as a way of poking fun

    function getNewUniformDotValue() {
        return 0.
    }

    impartScalarMeshes = (appearance, mat) => {
        appearance.scalarMeshLinear = sDw.NewMesh(downwardPyramidGeo, mat)
        appearance.meshes.push(appearance.scalarMeshLinear)
        // appearance.scalarMeshLogarithmic = sDw.NewMesh(downwardPyramidGeo, mat)
        // appearance.meshes.push(appearance.scalarMeshLogarithmic)
    }

    updateScalarMeshes = (appearance, scalar) => {
        appearance.scalarMeshLinear.position.set(scalar, linearY, 0.)
        // if (scalar === 0.)
        //     appearance.scalarMeshLogarithmic.position.copy(OUT_OF_SIGHT_VECTOR3)
        // else {
        //     let logarithmState = Math.log10(Math.abs(scalar))
        //     appearance.scalarMeshLogarithmic.position.set(logarithmState, logarithmicY, 0.)
        // }
    }

    getScalarMeshesPosition = (appearance, target) => {
        // let positionToUse = Math.abs(appearance.scalarMeshLinear.position.x) < camera2d.right ?
        //     appearance.scalarMeshLinear.position :
        //     appearance.scalarMeshLogarithmic.position
        return target.copy(appearance.scalarMeshLinear.position)
    }

    class floatAppearance extends Appearance {

        constructor() {
            super()
            
            this.state = new ScalarMv(1) //because it is nice to have the "float(3.2)" thing, in case it's an int
            this.stateOld = new ScalarMv(1)
            this.stateOld[0] = Number.MAX_VALUE *.5 //nicer would be to force an update! Or set it up this way!

            let mat = new THREE.MeshBasicMaterial()
            mat.color = this.col
            
            impartScalarMeshes(this, mat)
        }

        _updateStateFromDrag(dw) {
            if (dw === sDw) {
                getOldClientWorldPosition(dw, v1)
                this.state[0] = v1.x
            }
            else return false
        }

        updateMeshesFromState() {
            updateScalarMeshes(this, this.state[0])
        }

        getWorldCenter(dw, target) {
            if(dw === dws.scalar)
                return getScalarMeshesPosition(this, target)
            else
                console.error("scalars not in that window")
        }

        _getTextareaManipulationDw() {
            return sDw
        }

        //------------

        updateUniformFromState() {
            this.uniform.value = this.state[0]
        }
    }

    new AppearanceType("float", 1, floatAppearance, getNewUniformDotValue, [``], true)
}