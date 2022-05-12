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
        this.$menu.hide();
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
            outer.root.playground.show("single mode");
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
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";

        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
// 这个是被打击之后产生的小颗粒

class Particle extends AcGameObject {
    constructor(playground, x, y, radius, speed, vx, vy, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = this.get_random_color();
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;

        this.eps = 10;
    }


    get_random_color() {
        let colors = ["blue", "grey", "red", "pink", "green", "yellow"];
        return colors[Math.floor(Math.random() * 6)];
    }

    start(){
        console.log("particle create");
    };
    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }else {
            let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.speed *= this.friction;
        }

        this.render();
    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }


}
class Player extends AcGameObject {
    // speed 表示每秒移动的百分比是多少（长度和高度）, is_me判断一下是不是自己
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.move_length = 0;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;     // eps表示小于0.1就算0，因为会涉及浮点运算

        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.5;

        this.AI_attack_time = 0;
        if (this.is_me){
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
        this.cur_skill = null;
    }

    start(){
        if (this.is_me){
            this.add_listening_events(this.is_me);
        }else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }

    }

    add_listening_events(is_me) {
        let outer = this;

        this.playground.game_map.$canvas.on("contextmenu", function() {  // 暂时不知道这个是做什么的
            return false;});

        this.playground.game_map.$canvas.mousedown(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect(); // 从canvas里面获取这个画布的矩形框框
            let ee = e.which;
            let tx = e.clientX - rect.left, ty = e.clientY - rect.top; // 相对于画布上的坐标

            if (ee === 3)
            {
                outer.move_to(tx, ty);
            }
            else if (ee === 1)
            {
                if (outer.cur_skill === "fireball")
                {
                    outer.shoot_fireball(tx, ty);
                }
                outer.cur_skill = null;
            }
        });
        $(window).keydown(function(e) {                     // 这个是获取键盘输入按键的！
            if (e.which === 81) {       // q键
                outer.cur_skill = "fireball";

                return false;
            }
        });

    };


    attacked(angle, damage) {
        this.radius -= damage;
        if (this.radius < this.eps) {
            console.log("destroy");
            this.destroy();
            return false;
        }else {
            this.damage_speed = damage * 20;
            this.damage_x = Math.cos(angle);
            this.damage_y = Math.sin(angle);
            this.speed *= 0.8;
        }
        for (let i = 0; i < 20 + Math.random() * 5; i ++ ) {
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, speed, vx, vy, move_length);
        }

    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        let damage = this.playground.height * 0.01;        // 想当于玩家的0.05的百分之二十的血量
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);

    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return (Math.sqrt(dx * dx + dy * dy));
    };

    // 由于有不同的攻击模式，所以要吧is_attacked()写到player里面

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);      // 注意这里y跟x要颠倒一下
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update(){
        this.AI_attack_time += this.timedelta / 1000;
        if (!this.is_me && this.AI_attack_time > 5 && Math.random() < 1 / 300 ) {

            let t = Math.floor(this.playground.players.length * Math.random());
            let target = this.playground.players[t];
            this.shoot_fireball(target.x, target.y);
        }
        // 收到伤害单位时间移动的距离就是伤害的速度
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed;
            this.y += this.damage_y * this.damage_speed;
            this.damage_speed *= this.friction;
        }
        // 每一次都要画一便，不画就会消失
        // 如果说移动的距离已经小于最小判断的浮点值了，那么就不移动了
        else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.is_me == false) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }else{
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
                // console.log(vx, vy);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }

        }
        this.render();
    }



    // 这里是渲染一个新的玩家，也就是一个圆形
    render() {
        if (this.is_me){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
}
class FireBall extends AcGameObject {
    // player表示是发出者
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1;

        this.damage = damage;
        this.cur_skill = null;              // 当前的技能为空
    }
    start(){
    }

    update(){

        let outer = this;

        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    is_collision(player) {
        return(this.radius + player.radius > this.get_dist(player.x, player.y));
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // 被攻击的角度跟伤害
        console.log("Damage: ",this.damage);
        console.log("player.x.y: ", player.x, player.y);

        player.attacked(angle, this.damage);
        // console.log("return: ", t);

        this.destroy();
        
    }

    get_dist(tx, ty){
        let dx = this.x - tx;
        let dy = this.y - ty;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2 ,false);
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
        this.colors = ["blue", "red", "yellow", "green", "purple"];

        this.start();
    };


    start(){
    }

    update(){
    }

    show(mode){         // 打开playground界面
        this.$playground.show();
        if (mode == "single mode"){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "blue", this.height * 0.15, true));

            for (let i = 0; i < 5; i ++ ) {
                this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.colors[Math.floor(Math.random() * 5)], this.height * 0.15, false));
            }
        }
    }
    hide(){
        this.$playground.hide();
    }
}
class Settings {
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-login-title">
            登录                                                                                                                                                                                                   
        </div>
        <div class="ac-game-settings-login-username">
            <div class="ac-game-settings-login-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-login-password">
            <div class="ac-game-settings-login-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-login-btn">
            <div class="ac-game-settings-login-item">
                <button>登录</button>
            </div>
        </div>
        <!-- <div class="ac-game-settings-login-error-message">用户名不存在</div> -->
        <div class="ac-game-settings-login-register">注册</div>
        <br>
        <div class="ac-game-settings-login-acwing">
            <img src="https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png">
            <div>acwing一键登录</div>
        </div>
    </div>
</div>
            `)

        this.root.$ac_game.append(this.$settings);

        this.photo = "";
        this.username = "";

        this.start();
    }
    start(){
        this.getinfo();
    }


    register(){         // 打开注册界面
    }
    login(){            // 打开登录界面
    }

    getinfo(){
        let outer = this;
        $.ajax({
            url: "https://app1495.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);
                outer.root.menu.show();
                if (resp.result === "success"){

                   // outer.photo = resp.photo;
                   // outer.username = resp.username;

                   // outer.hide();
                   // outer.root.menu.show();
                   outer.login();
                }else{
                    outer.login();
                }
            }
        })
    }
    hide(){

    }

    show(){

    }
}
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
