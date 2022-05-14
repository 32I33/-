from django.http import JsonResponse
from django.contrib.auth import logout

def signout(request):
    user = request.user;            # 这里应该是自动拿到user的信息
    if not user.is_authenticated:       # 如果没有被授权
        return JsonResponse({
            'result':"用户没有被授权",  # 返回失败
         })
    logout(request)
    return JsonResponse({
        'result': "success",
     })

