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
        this.$login_username = this.$login.find(`.ac-game-settings-username`);
        this.$login_password = this.$login.find(`.ac-game-settings-password`);
        this.$login_submit = this.$login.find(`.ac-game-settings-submit`);
        this.$login_option = this.$login.find(`.ac-game-settings-option`);
        this.$login_error_message = this.$login.find(`.ac-game-settings-error-message`);
        this.$login.hide();


        this.$register = this.$settings.find('.ac-game-settings-register');
        this.$register_username = this.$register.find(`.ac-game-settings-username`);
        this.$register_password = this.$register.find(`.ac-game-settings-password-first`);
        this.$register_pswdconfirm = this.$register.find(`.ac-game-settings-password-second`);
        this.$register_option = this.$register.find(`.ac-game-settings-option`);
        this.$register_submit = this.$register.find(`.ac-game-settings-submit`);
        this.$register_error_message = this.$register.find(`.ac-game-settings-error-message`);
        this.$register.hide();

        this.root.$ac_game.append(this.$settings);

        this.photo = "";
        this.username = "";

        this.start();
    }
    start(){
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events() {
        this.add_listening_event_login();
        this.add_listening_event_register();
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
                console.log(username);
                console.log(password);
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        })
    }

    register_on_remote() {
        let outer = this;
        
    }

    register(){         // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }
    login(){            // 打开登录界面
        this.$register.hide();
        this.$login.show();
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

                if (resp.result === "success"){

                    outer.photo = resp.photo;
                    outer.username = resp.username;

                    outer.hide();
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
