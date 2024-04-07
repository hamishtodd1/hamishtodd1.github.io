/*
    Maybe the spreadsheet somehow summarizes plane and point as 0.8*plane+0.6*point
        and then when you have those on their own you see the reality

    Spreadsheet: comma, not +. You're not really giving people +!
        Midpoint is rarely needed. And gettable by other means?
 */

function initTestSpreadsheet() {
    let ss = new Spreadsheet()
    selectedSpreadsheet = ss
    selectCell(ss, 0)
    ss.quaternion.copy(camera.quaternion)
    comfortableLookPos(fl0, 0.).pointToGibbsVec(ss.position)
    // ss.makeExtraCell(`A ∧ B * · ∨`)
    // ss.makeExtraCell(`⟨C⟩ |C| A/B √`)
    let unadvancedCells = [
        `point`, //fish initial position
        `transform`, //fish transform
        `A2 applyTo A1`, //fish current position
        ` `,
        `point`,      //eye position
        `direction`,  //eye direction
        `A5 join A6`, //L1. Dual of duals?
        `A5 join A3`, //L2
        `A7 transformTo A8`, //eye transform / eye
        ` `,
        `rotoreflection`
    ]
    unadvancedCells.forEach(cell => ss.makeExtraCell(cell))

    let advancedCells = [
        `e123, 3e013, e023`,
        `0.8, 0.6e12`,
        `A2 * A1 * ~A2`,
        ` `,
        `e123, e012, e023`,
        `e023`, 
        `A5 V A6`,
        `A5 V A3`,
        `√ (A7 / A8)`,
        ` `,
        `0.8*plane + 0.6*point`
    ]
    // advancedCells.forEach(cell => ss.makeExtraCell(cell))
    document.addEventListener('keydown', e => {
        if(e.key === '=') {
            socket.emit("toggle advancedness")
        }
    })
    let advancedness = 0
    ss.visible = false
    socket.on("toggle advancedness", () => {

        advancedness = (advancedness + 1) % 3
        if (advancedness === 0)
            ++advancedness
        
        if(advancedness === 0)
            ss.visible = false
        else {
            ss.visible = true

            let oneToUse = advancedness === 1 ? unadvancedCells : advancedCells
            oneToUse.forEach((newContents, i) => {
                ss.cells[i].setText(newContents)
            })
        }
    })
}