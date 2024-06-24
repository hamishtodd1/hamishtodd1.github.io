
//bultInVizes had better be at the start!
function initSaving(builtInVizes) {

    let numBuiltIn = builtInVizes.length
    if(numBuiltIn !== 2)
        console.error("LOADING IS GONNA BREAK BECAUSE DIFFERENT NUMBER OF BUILT INS!")

    function getSavable(index) {

        let sn = snappables[index]

        // debugger
        let savable = {
            type: sn.constructor === DqViz ? 'dq' : 'fl',
            values: sn.mv.toArray([]).toString(),
            affecterIndices: Array(3),
            markupPos: sn.markupPos.toArray([]).toString(),
            color: sn.constructor === DqViz ?
                sn.rotAxisMesh.material.color.getHex() :
                sn.pointMesh.material.color.getHex(),
            cses: sn.sclptable === null ? null : Array(sn.sclptable.children.length),
            csCounts: sn.sclptable === null ? null : Array(sn.sclptable.children.length)
        }

        //affecters
        savable.affecterIndices[0] = sn.affecters[0] === null ? -1 : snappables.indexOf(sn.affecters[0]) - numBuiltIn
        savable.affecterIndices[1] = sn.affecters[1] === null ? -1 : snappables.indexOf(sn.affecters[1]) - numBuiltIn
        savable.affecterIndices[2] = sn.affecters[2]
        
        //sclptable
        if (sn.sclptable !== null) {
            sn.sclptable.children.forEach((cs, csIndex) => {

                if (cs.geometry.drawRange.count === 0) {
                    savable.csCounts[csIndex] = 0
                    savable.cses[csIndex] = ``
                }
                else {
                    savable.csCounts[csIndex] = cs.geometry.drawRange.count
                    let posArr = cs.geometry.attributes.position.array
                    savable.cses[csIndex] = posArr.slice(0, 3 * cs.geometry.drawRange.count).toString()
                }
            })
        }

        return savable
    }

    saveMostRecent = () => {
        return JSON.stringify(getSavable(snappables.length - 1))
    }

    saveAll = ()=> {
        let arr = []
        for(let i = builtInVizes.length; i < snappables.length; ++i)
            arr.push(getSavable(i))

        // log(arr)

        return JSON.stringify(arr)
    }
    socket.on(`saveAll`, msg => {
        socket.emit(`saveAll`, JSON.stringify(arr))
    })

    getFromVr = () => socket.emit(`getFromVr`)
    socket.on(`getFromVr`, () => socket.emit(`saveFromVr`, saveAll()))
    socket.on(`saveFromVr`, msg => log(msg))

    loadMultiple = (arrStr)=>{
        
        let startIndex = snappables.length
        
        let parsed = JSON.parse(arrStr)
        log(parsed)
        parsed.forEach((savable, index) => {
            loadSavable(savable, startIndex)
        })
    }

    loadSingle = (saveStr)=> {
        loadSavable(JSON.parse(saveStr), snappables.length)
    }

    loadSavable = (savable, startIndex) => {

        let sn = null
        if (savable.type === 'dq')
            sn = new DqViz(savable.color)
        else
            sn = new FlViz(savable.color)
        sn.mv.fromArray(savable.values.split(`,`))
        sn.markupPos.fromArray(savable.markupPos.split(`,`))

        log(savable)
        sn.affecters[0] = savable.affecterIndices[0] === -1 ? null : snappables[savable.affecterIndices[0]+startIndex]
        sn.affecters[1] = savable.affecterIndices[1] === -1 ? null : snappables[savable.affecterIndices[1]+startIndex]
        sn.affecters[2] = savable.affecterIndices[2]

        //sclptable
        if (savable.type === 'dq') {
            if (savable.cses === null)
                sn.sclptable = null
            else {
                sn.sclptable = new Sclptable(sn)

                savable.cses.forEach((csArrStr, csIndex) => {
                    let cs = sn.sclptable.children[csIndex]
                    cs.geometry.drawRange.count = savable.csCounts[csIndex]
                    if (savable.csCounts[csIndex] !== 0) {
                        let arr = csArrStr.split(`,`)
                        for (let i = 0, il = savable.csCounts[csIndex]; i < il; ++i)
                            cs.fillCubePositionIfEmpty(v1.set(parseFloat(arr[i * 3 + 0]), parseFloat(arr[i * 3 + 1]), parseFloat(arr[i * 3 + 2])))
                    }
                })
                updateBoxHelper(sn.sclptable.boxHelper, sn.sclptable.boundingBox)
            }
        }

        return sn
    }

}