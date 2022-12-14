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

