from django.shortcuts import render

def index(request):
    return render(request, "react_calculator/index.html")
