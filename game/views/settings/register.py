from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip()      # 保证密码前面的空格给删去，并且保证不能为空，如果为空等下判断会为空
    password = data.get("password", "").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
         })
        # 如果说用户名在后台已经有了

    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
         })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://img2.baidu.com/it/u=2161949891,656888789&fm=26&fmt=auto")
    #login(request, user)        # 这个到时候在考虑，注册完之后最好再去登陆一便
    return JsonResponse({
        'result': "success",
     })



