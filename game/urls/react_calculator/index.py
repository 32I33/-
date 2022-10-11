from django.urls import path, include,re_path
from game.views.react_calculator.login import signin
from game.views.react_calculator.logout import signout
from game.views.react_calculator.register import register
from game.views.react_calculator.get_status import get_status
from game.views.react_calculator.index import index

urlpatterns = [
        path("login/", signin, name="react_calculator_login"),
        path("logout/", signout, name="react_calculator_logout"),
        path("register/", register, name="react_calculator_register"),
        path("get_status", get_status, name="react_calculator_get_status"),
        re_path(r".*", index, name="react_calculator_index"),
]

