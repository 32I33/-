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
            退出
        </div>
        <div class="ac-game-menu-field-warning ac-game-menu-field-warning-nopermission></div>

    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings-mode');
        this.$warning_nopermission = this.$menu.find('.ac-game-menu-field-warning-nopermission')
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
            outer.$menu.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings_mode!");
            let result = outer.root.settings.logout_on_remote();
            outer.$warning_nopermission.html(result);
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
        this.uuid = this.create_uuid();
        console.log(this.uuid);
    }

    start() {       // 只会在第一帧执行一次
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let num = Math.floor(Math.random() * 10);
            res += num;
        }

        return res;
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

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        // 这里是用于再更新一次这个画布，否则会执行render的时候会先变灰在变黑
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

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

        this.eps = 0.01;
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }


}
class Player extends AcGameObject {
    // speed 表示每秒移动的百分比是多少（长度和高度）, character判断一下是不是自己
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.radius = radius;
        this.color = color;
        this.move_length = 0;
        this.speed = speed;
        this.eps = 0.01;     // eps表示小于0.1就算0，因为会涉及浮点运算

        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.5;

        this.AI_attack_time = 0;
        if (this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
            if (character === "enemy") {
                console.log(this.img.src);
            }
        }
        this.cur_skill = null;
        console.log("The info:", this.uuid, this.username, this.photo);
    }

    start(){
        if (this.character === "me"){
            this.add_listening_events(this.character);
        }else {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }

    }

    add_listening_events(character) {
        let outer = this;

        this.playground.game_map.$canvas.on("contextmenu", function() {  // 暂时不知道这个是做什么的
            return false;});

        this.playground.game_map.$canvas.mousedown(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect(); // 从canvas里面获取这个画布的矩形框框
            let ee = e.which;
            let tx =(e.clientX - rect.left) / outer.playground.scale, ty = (e.clientY - rect.top) / outer.playground.scale; // 相对于画布上的坐标

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
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let damage = 0.01;        // 想当于玩家的0.05的百分之二十的血量
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
        this.update_move();
        this.render();
    }

    update_move() {
        this.AI_attack_time += this.timedelta / 1000;
        if (this.character === "robot" && this.AI_attack_time > 5 && Math.random() < 1 / 300 ) {

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
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
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

    }



    // 这里是渲染一个新的玩家，也就是一个圆形
    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
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
        this.eps = 0.01;

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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2 ,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        // 通过在playground的时候已经定义了this.mps = new MultiPlayerSocket了，并且定义了uuid(players[0])以及开启了onopen

        this.ws = new WebSocket("wss://app1495.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }
    // 前端这里收到后端传回来的信息
    receive() {
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);              // 把其重新字典化
            let event = data.event;
            let uuid = data.uuid;
            let username = data.username;
            let photo = data.photo;
            if (uuid == outer.uuid) return false;       // 表明当前的uuid是我自己
            if (event === "create player") {
                outer.receive_create_player(uuid, username, photo);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({            // 将其字符串化
            'event': "create player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }))
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );
        player.uuid = uuid;         // 注意这里还要加上我们这名玩家的uuid
        this.playground.players.push(player);
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $('<div class="ac-game-playground"></div>');


        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.players = [];
        this.colors = ["blue", "red", "yellow", "green", "purple"];

        // default hide();
        this.hide();

        this.start();
    };


    start() {
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }

    update(){
    }

    show(mode){         // 打开playground界面
        let outer = this;
        this.$playground.show();
        this.game_map = new GameMap(this);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.resize();

        // 加入玩家（单人模式则加入robot）
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode == "single mode"){
            for (let i = 0; i < 5; i ++ ) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.colors[Math.floor(Math.random() * 5)], 0.15, "robot"));
            }
        }
        else if (mode === "multi mode"){
            // 为什么在这里加入我们的玩家信息？由于我们里面的Socket只是一个链接，他可以帮助很多事件创立链接，不代表玩家的信息，因此需要再playground里面加入我们的玩家的信息，这个看具体业务具体逻辑
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;                // 玩家0一直是我们自己，只有说创建了连接之后才会把其他的玩家加进来
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
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
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <br>
        <div class="ac-game-settings-acwing">
            <img src="https://app1495.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <br>
        <div class="ac-game-settings-acwing">
            <img src="https://app1495.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
 `)

        this.$login = this.$settings.find('.ac-game-settings-login');
        this.$login_username = this.$login.find(`.ac-game-settings-username input`);
        this.$login_password = this.$login.find(`.ac-game-settings-password input`);
        this.$login_submit = this.$login.find(`.ac-game-settings-submit`);
        this.$login_option = this.$login.find(`.ac-game-settings-option`);
        this.$login_error_message = this.$login.find(`.ac-game-settings-error-message`);
        this.$login.hide();


        this.$register = this.$settings.find('.ac-game-settings-register');
        this.$register_username = this.$register.find(`.ac-game-settings-username input`);
        this.$register_password1 = this.$register.find(`.ac-game-settings-password-first input`);
        this.$register_password2 = this.$register.find(`.ac-game-settings-password-second input`);
        this.$register_option = this.$register.find(`.ac-game-settings-option`);
        this.$register_submit = this.$register.find(`.ac-game-settings-submit`);
        this.$register_error_message = this.$register.find(`.ac-game-settings-error-message`);
        this.$register.hide();

        this.$acwing_login = this.$settings.find(`.ac-game-settings-acwing img`);

        this.root.$ac_game.append(this.$settings);

        this.photo = "";
        this.username = "";

        this.start();
    }
    start(){
        if (this.platform === "WEB") {
            this.getinfo_web();
            this.add_listening_events();
        }
        else if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        }
    }

    add_listening_events() {
        this.add_listening_event_login();
        this.add_listening_event_register();

        // 点击acwing图标然后授权登录
        this.add_listening_event_acwing_login();
    }

    add_listening_event_login() {
        let outer = this;
        this.$login_option.click(function(){
            outer.$login.hide();
            outer.$register.show();
        })

        this.$login_submit.click(function() {
            outer.login_on_remote();
        })
    }

    add_listening_event_register() {
        let outer = this;
        this.$register_option.click(function(){
            outer.$register.hide();
            outer.$login.show();
        })

        this.$register_submit.click(function(){
            outer.register_on_remote();
        })
    }

    add_listening_event_acwing_login() {
        let outer = this;
        this.$acwing_login.click(function() {
            $.ajax({
                url:"https://app1495.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
                type: "GET",
                success: function(resp) {
                    console.log(resp);
                    if (resp.result === "success") {
                        console.log(resp);
                        window.location.replace(resp.apply_code_url);
                    }
                }
            })
        })
    }

    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        console.log(username, password);

        $.ajax ({
            url: "https://app1495.acapp.acwing.com.cn/settings/login/",
            type:"GET",
            data: {
                username:username,
                password:password,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        })
    }

    logout_on_remote() {
        let outer = this;
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();          // AcWing上面的窗口关闭
        } else {
            $.ajax({
                url: "https://app1495.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(resp){
                    if (resp.result === "success") {
                        // 刷新之后会回到登陆界面，因为是未授权状态
                        console.log("logout success");
                        location.reload();
                    } else {
                        return resp.result;
                    }
                }
            })
        }
    }

    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password1 = this.$register_password1.val();
        let password2 = this.$register_password2.val();
        console.log(username, password1, password2);
        if (password1 !== password2) {
            this.$register_error_message.html("密码与确认密码不一致");
            this.$register_password1.empty();
            this.$register_password2.empty();
            return;
        } else {
            $.ajax ({
                url:"https://app1495.acapp.acwing.com.cn/settings/register/",
                type: "GET",
                data: {
                    username: username,
                    password: password1,
                },
                success: function(resp) {
                    if (resp.result === "success") {
                        console.log("success register");
                        location.reload();
                    } else {
                        outer.$register_error_message.html(resp.result);
                    }
                }
            })
        }
    }

    register(){         // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }
    login(){            // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    // 这里的在这里进行的是用AcWing的api来进行拿到授权码之后拿访问令牌
    acapp_login(appid, redirect_uri, state, scope) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
            // 通过该函数(callback)来接受的内容
            console.log("called from acapp function");
            console.log(resp);
            if (resp.result === "success"){
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.$settings.hide();
                outer.root.menu.show();
            }
        })
    }

    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app1495.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid,resp.redirect_uri, resp.state, resp.scope);
                }
            }
        })
    }

    getinfo_web(){
        let outer = this;
        $.ajax({
            url: "https://app1495.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp){
                console.log(resp);

                if (resp.result === "success"){

                    outer.photo = resp.photo;
                    outer.username = resp.username;

                    outer.hide();
                    outer.$settings.hide();
                    outer.root.menu.show();
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
