from django.urls import path
from game.views.BigScreenApp.index import index

urlpatterns = [
    path("", index, name = "BigScreenApp_index")
]
