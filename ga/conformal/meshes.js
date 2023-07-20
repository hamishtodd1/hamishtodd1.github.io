async function initMeshes() {

    let matGeoPairs = {}
    registerMesh = (name, geo, mat) => {
        matGeoPairs[name] = { geo, mat }
    }
    isMeshName = (name) => {
        return matGeoPairs[name] !== undefined
    }

    let ourEga = new Ega()
    let ourDq = new Dq()
    let defaultMat = new THREE.MeshBasicMaterial({color:0xFF0000})
    class MeshViz extends THREE.Mesh {
        constructor() {
            super(unchangingUnitSquareGeometry, defaultMat)
            
            scene.add(this)
            this.castShadow = true

            this.cga = new Cga().copy(oneCga)
            this.visible = false
            this.matrixAutoUpdate = false
        }

        set(name) {
            this.geometry = matGeoPairs[name].geo
            this.material = matGeoPairs[name].mat
        }

        onBeforeRender() {
            this.cga.toEga(ourEga).cast(ourDq).toMat4(this.matrix)
        }

        getMv() {
            return this.cga
        }
    }
    window.MeshViz = MeshViz
}