// root是acgame

class AcGameMenu{
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings-mode">
            设置
        </div>

    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings-mode');
        this.start();
    }
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function() {
            console.log("click multi_mode!");
        });
        this.$settings.click(function(){
            console.log("click settings_mode!");
        });
    }
    show() {
        this.$menu.show();
    }
    hide() {
        this.$menu.hide();
    }
}
// 由于有一堆东西是要更新的，所以直接开一个class用于封装那些需要被更新的东西
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        // 标记一下看是否有被调用start函数，bool值
        this.has_called_start = false;
        this.timedelta = 0;     // 当前帧距离上一帧的时间间隔(ms)
    }

    start() {       // 只会在第一帧执行一次
    }

    update() {      // 每一帧都会执行一次
    }

    on_destroy(){   // 在被销毁之前执行一次
    }

    destroy() {     //删除该物体
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] == this){
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

// 上一次更新的时候
let last_timestamp;

// 这个是更新的动画
let AC_GAME_ANIMATION = function(timestamp) {       // 参数是该timestamp时候调用这个函数
    
    // 更新一下所有的objects来找到让他的时间更新到timestamp这个时刻
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        }
        else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    // 更新完所有的object之后就让当前的这个时间点变成下一次判断建个的被减数
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);       // 通过递归不断地调用这个更新函数即可
}


requestAnimationFrame(AC_GAME_ANIMATION);        // 1s更新60次
class GameMap extends AcGameObject {
    constructor(playground) {
        super();                // 调用基类的函数
        this.playground = playground;
        this.$canvas = $('<canvas></canvas>'); 
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        this.render();
    }

    start() {
    }
    update(){
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Player extends AcGameObject {
    // speed 表示每秒移动的百分比是多少（长度和高度）, is_me判断一下是不是自己
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;     // eps表示小于0.1就算0，因为会涉及浮点运算
    }

    start(){

    }
    update(){
        // 每一次都要画一便，不画就会消失
        this.render();
    }

    // 这里是渲染一个新的玩家，也就是一个圆形
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $('<div class="ac-game-playground"></div>');

        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        this.start();
    }

    start(){
        
    }

    update(){
    }

    show(){         // 打开playground界面
        this.$playground.show();
    }
    hide(){
        this.$playground.hide();
    }
}
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
