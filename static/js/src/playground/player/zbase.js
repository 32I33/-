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
