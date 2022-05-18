from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.core.cache import cache
from django.conf import settings


class MultiPlayer(AsyncWebsocketConsumer):
    # 逻辑是：一进来，前端拿到整个房间的信息（connect)，然后把自己添加进去其他玩家接收到当前进来的玩家的信息（receive），然后房间所有玩家都只要等待receive传回来新玩家的信息即可
    async def connect(self):
        self.room_name = None;

        for i in range(1000):
            name = "room-%d" % i
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return      # 说明房间数已经爆满，请等待;

        # 建立连接
        await self.accept()
        print('accept')

        # 如果说没有这个房间，那么就建立一个（这个时候房间数未满）
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)     # 一小时有效期

        for player in cache.get(self.room_name):
            # 把玩家加上去到房间里面
            # 每次传回去一个玩家然后再传下一个玩家，然后最后会前端会渲染一个一个传进来的玩家
            await self.send(text_data=json.dumps({
                'event': "create player",
                'uuid': player.get('uuid'),
                'username': player.get('username'),
                'photo': player.get('photo')
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)   # 把当前这个房间加到每一个频道里面，通过此告诉每一个频道里面的players、房间信息

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);

    # 创建函数的时候不要忘了传进参数self
    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        # 拿出来所有人的信息再加回去
        cache.set(self.room_name, players, 3600)        # 一小时有效期\
        await self.channel_layer.group_send(            # 新加进来的人的这条信息群发到每一个channel
            self.room_name,
            {
                'type': "group_create_player",          # 知识点：type里面是使用调用group_send()内其他信息的函数，并且是写在当前里面
                'event': "create player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )
    async def group_create_player(self, data):
        # 发送给前端当前的玩家信息，并且是一个一个发
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create player":
            print("receive")
            await self.create_player(data)
