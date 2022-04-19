### models用于存储我们扩充的数据库的内容的表  即数据库里面的表对应的就是在django里面的class
### 可以登录: "https://app1495.acapp.acwing.com.cn/admin/"
### 在上述链接可以看到GAME下面有一个Player就是一个表

#### 对于每个问扩充的文件夹都可以仿照线面的Player（文件夹）进行模仿的写
#### 对于每个不懂的库都可以去python3 manage.py shell 里面去尝试他的自动补全

#### 对于每次搞定的注册表之后（即写完了models里面的然后放到admin.py里面之后）都要进行
``` python3 manage.py makemigrations
``` python3 manage.py migrate
