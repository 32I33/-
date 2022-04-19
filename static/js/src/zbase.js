export class AcGame {
    constructor(id, AcWingOS) {     // AcWingOS就是用于判断当前的前端是不是AcWing，现在暂时认为有这个参数就是在AcWingOS里面执行的，否则就是在WEB里面执行的
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    // start就是一个构造函数的延申，通过他来做init
    start(){};

}
