from django.http import HttpResponse



def index(request):
    a = 1
    b = 2
    total = a + b

    line = '<h1 style="text-align: center">欢迎来到炉石传说</h1>'
    gotoPlay = '<a href="/game/">进入游戏界面</a>'
    image = '<image src="https://blz.nosdn.127.net/1/tm/hearthstone/gameguide/voyage-to-the-sunken-city/minisite/logo.png" width=2000 />'

    return HttpResponse(line + gotoPlay + '<hr>'  + image)

def play(request):
    start = '<h1 style="text-align: center">游戏界面</h1>'
    goback = '<a href="/">返回主页面</a>'
    return HttpResponse(start + goback)

