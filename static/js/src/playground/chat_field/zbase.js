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
