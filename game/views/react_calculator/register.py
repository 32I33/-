from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User

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
    # 这里没有用Player.object.create去做了因为不需要创建用户
    login(request, user)        # 这个到时候在考虑，注册完之后最好再去登陆一便
    return JsonResponse({
        'result': "success",
     })



