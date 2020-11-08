function ScreenPosition(x,y) {
    this.x = x || 0.
    this.y = y || 0.
}
Object.assign(ScreenPosition.prototype,{
    
    copy: function(sp) {
        this.x = sp.x
        this.y = sp.y
        return this
    },
    set: function (x,y) {
        this.x = x
        this.y = y
        return this
    },
    sub: function (sp) {
        this.x -= sp.x
        this.y -= sp.y
        return this
    },
    add: function (sp) {
        this.x += sp.x
        this.y += sp.y
        return this
    },
    length: function () {
        return Math.sqrt( this.lengthSq() )
    },
    lengthSq: function () {
        return sq(this.x) + sq(this.y)
    }
})