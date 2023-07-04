function initMeshes() {

    let matGeoPairs = {}
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

    // new THREE.OBJLoader().load(`data/spot.obj`,(obj)=>{
    //     let spotGeo = obj.children[0].geometry
    //     spotGeo.scale(.5, .5, .5)
    //     new THREE.TextureLoader().load(`data/spot.png`, (texture) => {
            
    //         let spotMat = new THREE.MeshPhongMaterial({ map: texture })

    //         matGeoPairs.spot = { mat: spotMat, geo: spotGeo }

    //         let cell = selectedSpreadsheet.makeExtraCell()
    //         cell.setText(`e12 > spot`)
    //         selectCell(cell)

    //     })
    // })
    
}