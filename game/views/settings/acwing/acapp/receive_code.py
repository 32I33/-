from django.http import JsonResponse
from django.core.cache import cache
import requests                 # 因为要请求其他的url
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint


def receive_code(request):
    data = request.GET          # 这里的GET相当于acwing来访问我们的网络, 传回来给我们code（授权码）

    if "errcode" in request:
        return JsonResponse({
            'result': "fail to apply code",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
         })
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return JsonResponse({
            'result': "state not exist",
         })
    cache.delete(state)
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "1495",
        'secret': "dcef24ccfa8e49f98e6ff23b29744d30",
        'code': code,
    }
    access_token_res = requests.get(apply_access_token_url, params=params).json()
    print(access_token_res) # 测试
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    # id判断是否已经在里面了
    player = Player.objects.filter(openid=openid)
    if player.exists():
        player = players[0] # 当前的用户就是player[0]，为什么？
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })

    getinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid,
     }
    getinfo_res = requests.get(getinfo_url, params=params).json()
    username = getinfo_res['username']
    photo = getinfo_res['photo']

    # 如果说重名的话，就在后面加数字，每次都加一个数字，这样加多个数字之后他相同名字的概率就小之又小
    while User.objects.filter(username=username).exists():
        username += str(randint(0,9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })
