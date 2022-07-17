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
            outer.$menu.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
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
    }

    start() {       // 只会在第一帧执行一次
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let num = parseInt(Math.floor(Math.random() * 10));
            res += num;
        }

        return res;
    }

    update() {      // 每一帧都会执行一次
    }

    late_update() {
    }

    on_destroy(){   // 在被销毁之前执行一次
    }

    destroy() {     //删除该物体
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this){
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

    // 所有的obj最后渲染一次，从而使在数组后面的内容优先显示
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        obj.late_update();
    }
    // 更新完所有的object之后就让当前的这个时间点变成下一次判断建个的被减数
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);       // 通过递归不断地调用这个更新函数即可
}


requestAnimationFrame(AC_GAME_ANIMATION);        // 1s更新60次
class ChatField {
    constructor(playground) {
        this.playground= playground;
        this.$input = $(`
            <input type="text" class="ac-game-playground-chat-field-input"></input>
        `);
        this.$history = $(`<div class="ac-game-playground-chat-field-history">历史记录</div>`);
        this.$input.hide();
        this.$history.hide();
        this.playground.$playground.append(this.$input);
        this.playground.$playground.append(this.$history);

        this.func_id = null;

        this.start();
    }
    start() {
        this.add_listening_events();
    }

    show_input() {
        this.$input.show();
        this.$input.focus();
        this.show_history();
    }

    hide_input() {
        this.$input.hide();
        this.playground.$playground.focus();
    }

    add_listening_events() {
        let outer = this;
        this.$input.keydown(function(e){
            if (e.which === 13) {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    outer.playground.mps.send_message(username, text);
                    outer.add_message(username, text);
                }
            }
            if (e.which === 27) {
                outer.hide_input();
                return false;
            }
        })
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append($(`<div>${message}</div>`));
        // 滚条，才能不断产生新的内容
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();
        if (this.func_id) clearTimeout(this.func_id);
        // func_id表示的是当前的某一个function的id，settimeoute会传回来一个id
        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }
}

class GameMap extends AcGameObject {
    constructor(playground) {
        super();                // 调用基类的函数
        this.playground = playground;
        this.$canvas = $('<canvas tabindex=0></canvas>'); 
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
class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.text = "已就绪:0人";
    }
    start() {

    }
    update() {
        this.render();
    }

    // 重写text内容
    write(text) {
        this.text = text;
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";              // 居中放置
        this.ctx.fillText(this.text, this.playground.width / 2, 40);
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

        this.fireballs = []; // 火球术
        this.fireball_count = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.5;

        this.AI_attack_time = 0;
        if (this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
        // 注意只有说是我自己的时候才会有这个技能冷却时间，因此在后面的所有的关于技能冷却内容都是要加上"me"的判断
        if (this.character === "me") {
            this.fireball_coldtime = 3;     // 单位s
            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
            this.fireball_img = new Image();
            this.fireball_img.src= "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
        }
        this.cur_skill = null;
    }

    start(){
        let count = ++ this.playground.player_count;
        if (count >= 3) {
            this.playground.notice_board.write("Fighting");
            this.playground.state = "fighting";
        } else {
            this.playground.notice_board.write("已就绪:" + count + "人");
        }
        if (this.character === "me"){
            this.add_listening_events(this.character);
        }else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }

    }

    add_listening_events(character) {
        if (this.character !== "me")
            return false;
        let outer = this;

        this.playground.game_map.$canvas.on("contextmenu", function() {  // 暂时不知道这个是做什么的
            return false;});

        this.playground.game_map.$canvas.mousedown(function(e){
            if (outer.playground.player_count < 3) {
                return false;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect(); // 从canvas里面获取这个画布的矩形框框
            let ee = e.which;
            let tx =(e.clientX - rect.left) / outer.playground.scale, ty = (e.clientY - rect.top) / outer.playground.scale; // 相对于画布上的坐标

            if (ee === 3)
            {
                outer.move_to(tx, ty);
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(outer.uuid, tx, ty);
                }
            }
            else if (ee === 1)
            {
                if (outer.cur_skill === "fireball")
                {
                    outer.fireball_count --;
                    let fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(outer.uuid, tx, ty, fireball.uuid);
                    }
                    if (outer.fireball_count <= 0) {
                        outer.cur_skill = null;
                    }
                } else if (outer.cur_skill === "blink") {
                    outer.blink(tx, ty);
                    outer.cur_skill = "blink";
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(outer.uuid, tx, ty);
                    }
                    outer.cur_skill = null;
                }
            }
        });
        this.playground.game_map.$canvas.keydown(function(e) {                     // 这个是获取键盘输入按键的！
            if (e.which === 81) {       // q键
                if (outer.fireball_coldtime < outer.eps && outer.playground.state === "fighting") {
                    outer.cur_skill = "fireball";
                    outer.fireball_count ++;
                    outer.fireball_coldtime = 0.1;
                    return false;
                }
            }
            if (e.which === 70) {
                if (outer.blink_coldtime < outer.eps && outer.playground.state === "fighting") {
                    outer.cur_skill = "blink";
                    outer.blink_coldtime = 5;

                    return false;
                }
            }
            if (e.which === 13) {
                outer.playground.chat_field.show_input();
                return false;
            }
            if (e.which === 27) {
                outer.playground.chat_field.hide_input();
            }

        });

    };

    destroy_fireball(attacker, uuid) {
        for (let i = 0; i < attacker.fireballs.length; i ++ ) {
            let fireball = attacker.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }
    // 闪现
    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
    }

    attacked(angle, damage) {
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
        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_speed = damage * 20;
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.speed *= 0.8;
    }

    receive_attacked(attacker, x, y, angle, damage, ball_uuid) {
        attacker.destroy_fireball(attacker, ball_uuid);  // 攻击者的火消失
        this.x = x;
        this.y = y;

        this.attacked(angle, damage);
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
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
        this.fireballs.push(fireball);

        // 逻辑是通过真正发射得哪个地方广播到所有的player，使接收到shoot_fireball的players里面找到这个发射者，然后再在使当前的player shoot_fireball，这个时候shoot出来的uuid是不一样的，所以要传到过去真正shoot_fireball的那个fireball的uuid
        // 因此要返回这个fireball给到
        // 1. 发射的时候传socket到后端
        // 2. socket从而改变当前的uuid
        return fireball;
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
        this.update_coldtime();
        this.update_win();
        this.render();
    }

    update_win() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
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
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }

        }

    }
    // 冷却时间
    update_coldtime() {
        if (this.character !== "me")
            return false;
        if (this.playground.state === "fighting") {
            this.fireball_coldtime -= this.timedelta / 1000;
            this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);
            this.blink_coldtime -= this.timedelta / 1000;
            this.blink_coldtime = Math.max(this.blink_coldtime, 0);
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
        if (this.character === "me") {
            this.render_coldtime();
        }
    }
    render_coldtime() {
        // 火球
        let fireball_coldtime_x = 1.5, fireball_coldtime_y = 0.9;
        let r = 0.04;
        let scale = this.playground.scale;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(fireball_coldtime_x * scale, fireball_coldtime_y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (fireball_coldtime_x - r) * scale, (fireball_coldtime_y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(fireball_coldtime_x * scale, fireball_coldtime_y * scale);
            this.ctx.arc(fireball_coldtime_x * scale, fireball_coldtime_y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(fireball_coldtime_x * scale, fireball_coldtime_y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        // 闪现
        let blink_coldtime_x = 1.6, blink_coldtime_y = 0.8;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(blink_coldtime_x * scale, blink_coldtime_y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (blink_coldtime_x - r) * scale, (blink_coldtime_y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(blink_coldtime_x * scale, blink_coldtime_y * scale);
            this.ctx.arc(blink_coldtime_x * scale, blink_coldtime_y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(blink_coldtime_x * scale, blink_coldtime_y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        if (this.character === "me") {
            if (this.playground.state === "fighting") {         // 是我自己并且处于战斗状态
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }
        // 找到当前的这个player，然后把他删掉
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}

class ScoreBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null;

        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";
        this.lose_img = new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";

        this.start();
    }
    start() {
    }

    add_listening_events() {
        let outer = this;
        if (this.playground.game_map) {
            let $canvas = this.playground.game_map.$canvas;
            $canvas.on('click', function() {
                outer.playground.hide();
                outer.playground.root.menu.show();
            })
        }
    }

    win() {
        this.state = "win";

        let outer = this;

        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";
        let outer = this;

        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len/ 2, len, len);
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
        this.update_attack();
        this.update_move();

        this.render();
    }
    update_attack() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player != player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }
    }

    update_move() {
        let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    is_collision(player) {
        return(this.radius + player.radius > this.get_dist(player.x, player.y));
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // 被攻击的角度跟伤害
        if (this.player.character !== "enemy") {       // 如果说当前的这个窗口发出的这个火球判断是enemy发的就不用受伤)
            player.attacked(angle, this.damage);
            if (this.playground.mode === "multi mode") {
                this.playground.mps.send_attacked(this.playground.players[0].uuid, player.uuid, player.x, player.y, angle, this.damage, this.uuid);
            }
        }

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
    };
    // 其属于是在destroy之前执行
    on_destroy(uuid) {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i ++ ) {
            let fireball = fireballs[i];
            if (fireball[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
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

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ ) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
    }

    // 前端这里收到后端传回来的信息
    receive() {
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);              // 把其重新字典化
            let event = data.event;
            let uuid = data.uuid;
            if (uuid == outer.uuid) return false;       // 表明当前的uuid是我自己
            if (event === "create player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attacked") {
                outer.receive_attacked(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "send_message" && outer.playground.root.settings.username !== data.username) {
                outer.receive_message(data.username, data.text);
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
    send_move_to(uuid, tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }))
    }
    send_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            "uuid": uuid,
            "tx": tx,
            "ty": ty,
            "ball_uuid": ball_uuid,
        }))
    }
    send_attacked(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "attacked",
            'uuid': uuid,           // attacker的uuid
            "attackee_uuid": attackee_uuid,
            "x": x,
            "y": y,
            "angle": angle,
            "damage": damage,
            "ball_uuid": ball_uuid,
        }))
    }
    send_blink(uuid, tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify(
            {
                "event": "blink",
                "uuid": uuid,
                "tx": tx,
                "ty": ty,
            }
        ));
    }

    send_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event": "send_message",
            "username": username,
            "text": text,
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

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.move_to(tx, ty);
        }

    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        // 接受了fireball之后放进去当前的fireballs里面
        let player = this.get_player(uuid);
        let fireball = player.shoot_fireball(tx, ty);
        fireball.uuid = ball_uuid;
    }

    receive_attacked(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        attackee.receive_attacked(attacker, x, y, angle, damage, ball_uuid);     // 传给副窗口告诉他删掉他自己的fireballs里面的当前的这个ball_uuid的fireball
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        player.blink(tx, ty)
    }

    receive_message(username, text) {
        this.playground.chat_field.show_history();
        this.playground.chat_field.add_message(username, text);
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

    // 在这里可以获取我们当前的playground的uuid
    create_uuid() {
        let res = '';
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start() {
        let outer = this;
        let uuid = this.create_uuid();     // 通过uuid可以判断我们当前的这个界面

        $(window).on(`resize.${uuid}`, function() {
            outer.resize();
        });

        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uuid}`);
            })
        }
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
        this.ctx = this.game_map.ctx;
        this.resize();

        this.mode = mode;

        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.state = "waiting";
        this.player_count = 0;

        // 加入玩家（单人模式则加入robot）
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode == "single mode"){
            for (let i = 0; i < 2; i ++ ) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.colors[Math.floor(Math.random() * 5)], 0.15, "robot"));
            }
        }
        else if (mode === "multi mode"){
            // 为什么在这里加入我们的玩家信息？由于我们里面的Socket只是一个链接，他可以帮助很多事件创立链接，不代表玩家的信息，因此需要再playground里面加入我们的玩家的信息，这个看具体业务具体逻辑
            // 在这里用mps来代表socket好处是其他的函数move_to, shoot_fireball, attacked都可以直接从传进去的playground拿到
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;                // 玩家0一直是我们自己，只有说创建了连接之后才会把其他的玩家加进来
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }
    }
    // 是在玩家死亡之后点击屏幕任意位置回到菜单界面
    hide(){
        // 把所有的内容删掉
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }
        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }
        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        this.$playground.empty();
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
            if (this.root.access) {
                this.getinfo_web();
            } else {
                this.login();
            }
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
                    if (resp.result === "success") {
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
        try {
            $.ajax ({
                url: "https://app1495.acapp.acwing.com.cn/settings/token/",
                type:"post",
                data: {
                    username:username,
                    password:password,
                },
                success: resp => {
                    console.log(resp);
                    this.root.access = resp.access;
                    this.root.refresh = resp.refresh;
                    this.getinfo_web();
                },
                error: () => {
                    this.$login_error_message.html("用户名或者密码错误");
                }
            })
        } catch {

        }
    }

    logout_on_remote() {
        let outer = this;
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();          // AcWing上面的窗口关闭
        } else {
            this.root.access = "";
            this.root.refresh = "";
            location.href = "/";            // 重定向到首页
        }
    }

    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password1 = this.$register_password1.val();
        let password2 = this.$register_password2.val();
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
            if (resp.result === "success"){
                console.log(resp);
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
            type: "get",
            data: {
                platform: outer.platform,
            },
            headers: {
                'Authorization': "Bearer " + this.root.access,          // 头名字这里的Bearer是自己定义在settings.py里面定义的
            },
            success: function(resp){

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
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
export class AcGame {
    constructor(id, AcWingOS, access, refresh) {     // AcWingOS就是用于判断当前的前端是不是AcWing，现在暂时认为有这个参数就是在AcWingOS里面执行的，否则就是在WEB里面执行的
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
