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

        $.ajax ({
            url: "https://app1495.acapp.acwing.com.cn/settings/login/",
            type:"GET",
            data: {
                username:username,
                password:password,
            },
            success: function(resp) {
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
            type: "GET",
            data: {
                platform: outer.platform,
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
