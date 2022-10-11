# 这里相当于是总的urls所有被include到当前这个index里面
from django.urls import path, include
from game.views.index import index

urlpatterns = [
    path("", index, name="index"),
    path("menu/", include("game.urls.menu.index")),
    path("playground/", include("game.urls.playground.index")),
    path("settings/", include("game.urls.settings.index")),
    path("react_calculator/", include("game.urls.react_calculator.index")),
]
