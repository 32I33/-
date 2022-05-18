// 由于有一堆东西是要更新的，所以直接开一个class用于封装那些需要被更新的东西
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        // 标记一下看是否有被调用start函数，bool值
        this.has_called_start = false;
        this.timedelta = 0;     // 当前帧距离上一帧的时间间隔(ms)
        this.uuid = this.create_uuid();
        console.log(this.uuid);
    }

    start() {       // 只会在第一帧执行一次
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let num = Math.floor(Math.random() * 10);
            res += num;
        }

        return res;
    }

    update() {      // 每一帧都会执行一次
    }

    on_destroy(){   // 在被销毁之前执行一次
    }

    destroy() {     //删除该物体
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] == this){
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
    // 更新完所有的object之后就让当前的这个时间点变成下一次判断建个的被减数
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);       // 通过递归不断地调用这个更新函数即可
}


requestAnimationFrame(AC_GAME_ANIMATION);        // 1s更新60次
