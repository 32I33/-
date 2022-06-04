from django.db import models                # 这个就是数据库的基类
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) #当user删除的时候，与其关联的player一杠删掉
    photo = models.URLField(max_length=256, blank=True)
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    score = models.IntegerField(default=1500)
    def __str__(self):
        return str(self.user)
