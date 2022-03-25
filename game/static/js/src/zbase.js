export class AcGame {
    constructor(id) {
       console.log("create ac_game");
        this.id = id;
        this.$ac_game = $('#' + id);
        // this.menu = new AcGameMenu(this);
        
        this.playground = new AcGamePlayground(this);
    }

    // start就是一个构造函数的延申，通过他来做init
    start(){};

}
