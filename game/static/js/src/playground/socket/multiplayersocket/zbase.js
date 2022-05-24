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
            } else if (event === "shoot fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
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
    send_move_to(uuid, tx, ty) {
        let outer = this;
        console.log(uuid);
        this.ws.send(JSON.stringify({
            'event': "move_to",
            "uuid": uuid,
            "tx": tx,
            "ty": ty
        }))
    }
    send_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot fireball",
            "uuid": uuid,
            "tx": tx,
            "ty": ty,
            "ball_uuid": ball_uuid,
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
        let player = get_player(uuid);
        let fireball = player.shoot_firball(tx, ty);
        fireball.uuid = ball_uuid;
    }
}


