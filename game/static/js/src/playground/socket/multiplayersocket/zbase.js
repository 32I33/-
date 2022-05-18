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
