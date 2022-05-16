from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "1495"
    redirect_uri = quote("https://app1495.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/")       #  重定向到我们的接收授权码函数内部
    scope = "userinfo"
    state = get_state()
    cache.set(state, True, 7200)    # 前面的两个参数是key value对，有效时长为2小时
    return JsonResponse({
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
     })
