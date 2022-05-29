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
            this.fireball_img = new Image();
            this.fireball_img.src= "/static/image/playground/fireball_img.png";
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
            const rect = outer.ctx.canvas.getBoundingClientRect(); // 从canvas里面获取这个画布的矩形框框
            let ee = e.which;
            let tx =(e.clientX - rect.left) / outer.playground.scale, ty = (e.clientY - rect.top) / outer.playground.scale; // 相对于画布上的坐标

            if (ee === 3)
            {
                outer.move_to(tx, ty);
                if (outer.playground.mode === "multi mode"){
                    console.log("multi move");
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
                }
            }
        });
        $(window).keydown(function(e) {                     // 这个是获取键盘输入按键的！
            if (e.which === 81) {       // q键
                if (outer.fireball_coldtime < outer.eps) {
                    console.log("get_skill")
                    outer.cur_skill = "fireball";
                    outer.fireball_count ++;
                    outer.fireball_coldtime = 3;
                    return false;
                }
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

    attacked(angle, damage) {
        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        else {
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

    receive_attacked(attacker, x, y, angle, damage, ball_uuid) {
        attacker.destroy_fireball(attacker, ball_uuid);
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
        this.update_fireball_coldtime();
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
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }

        }

    }

    update_fireball_coldtime() {
        if (this.character !== "me")
            return false;
        if (this.playground.state === "fighting" && this.fireball_coldtime > this.eps) {
            console.log(this.fireball_coldtime);
            this.fireball_coldtime -= this.timedelta / 1000;
            this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);
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
            this.render_fireball_coldtime();
        }
    }
    render_fireball_coldtime() {
        let x = 1.5, y = 0.9, r = 0.04;
        let scale = this.playground.scale;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (
    }
}
