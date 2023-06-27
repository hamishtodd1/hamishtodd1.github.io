//could use colors to indicate which group you're in

function initVizes(vizes, planeVizes) {
    
    let planeGeo = new THREE.CircleBufferGeometry(.4, 31)

    let displayableVersion = new Mv()
    class PlaneViz {
        mesh
        state
        groupOrigin

        constructor(initial, groupOrigin, groupColor) {
            let mat = new THREE.MeshStandardMaterial({ color: 0xFF0000, side: THREE.DoubleSide })
            mat.color.copy(groupColor)
            this.mesh = new THREE.Mesh(planeGeo, mat)
            
            if(groupOrigin !== undefined)
                this.groupOrigin = groupOrigin
            else
                this.groupOrigin = e123

            scene.add(this.mesh)
            this.mesh.castShadow = true
            this.mesh.position.y = 1.6 //because yeah

            if(initial !== undefined)
                this.state = initial
            else
                this.state = new Mv().plane(1., 0., 0., 0.)

            vizes.push(this)
            planeVizes.push(this)
        }

        updateMeshesFromState() {
            this.state.getDisplayableVersion(displayableVersion)

            this.groupOrigin.projectOn(displayableVersion, mv0).toVec(this.mesh.position)

            let planeOnE123 = displayableVersion.projectOn(e123, mv0)
            let e3ToPlaneRotor = mul(planeOnE123, e3, mv1).sqrtSelf()
            e3ToPlaneRotor.toQuaternion(this.mesh.quaternion)
        }
    }
    window.PlaneViz = PlaneViz
}