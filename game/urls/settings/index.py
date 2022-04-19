from django.urls import path
from game.views.settings.getinfo import getinfo

urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo")      # 第一个参数是路径名字，第二个参数名是函数，第三个是名字
]

