/*
    The natural origin for meshes is hovering in front of your chest?
    Infrequently, it moves. When this happens, all the transforms move with it?
 */

async function initMeshes() {

    addUserMeshData = (name, geo, mat) => {
        userMeshesData[name] = { geo, mat }
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
            this.geometry = userMeshesData[name].geo
            this.material = userMeshesData[name].mat
        }

        onBeforeRender() {
            this.cga.toEga(ourEga).cast(ourDq).toMat4(this.matrix)
        }

        getMv() {
            return this.cga
        }
    }
    window.MeshViz = MeshViz

    objLoader.load(`data/cow.obj`, (obj) => {
        let geo = obj.children[0].geometry
        geo.scale(0.2, 0.2, 0.2)
        textureLoader.load(`data/cow.png`, (texture) => {
            let mat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide })
            addUserMeshData(`cow`, geo, mat)
        })
    })
}