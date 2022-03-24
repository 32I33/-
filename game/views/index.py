# render就是用于渲染的
from django.shortcuts. import render

def index(reequest):
    # 这里是从multiends开始而不是从templetes开始原因是作者就是这样定义的!
    return render(request, "multiends/web.html")
