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
        this.ctx = this.game_map.ctx;
        this.resize();

        this.mode = mode;

        this.notice_board = new NoticeBoard(this);
        this.state = "waiting";
        this.player_count = 0;

        // 加入玩家（单人模式则加入robot）
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode == "single mode"){
            for (let i = 0; i < 5; i ++ ) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.colors[Math.floor(Math.random() * 5)], 0.15, "robot"));
            }
        }
        else if (mode === "multi mode"){
            // 为什么在这里加入我们的玩家信息？由于我们里面的Socket只是一个链接，他可以帮助很多事件创立链接，不代表玩家的信息，因此需要再playground里面加入我们的玩家的信息，这个看具体业务具体逻辑
            // 在这里用mps来代表socket好处是其他的函数move_to, shoot_fireball, attacked都可以直接从传进去的playground拿到
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

