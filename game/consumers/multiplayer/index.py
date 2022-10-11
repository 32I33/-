from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.core.cache import cache
from django.conf import settings

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from game.models.player.player import Player
from channels.db import database_sync_to_async  #由于在数据库中的都是同步调用，而在create_player里面调用的时候是异步调用，因此也需要异步去操作数据库
from match_system.src.match_server.match_service import Match

class MultiPlayer(AsyncWebsocketConsumer):
    # 没有机制的匹配逻辑是：一进来，前端拿到整个房间的信息（connect)，然后把自己添加进去其他玩家接收到当前进来的玩家的信息（receive），然后房间所有玩家都只要等待receive传回来新玩家的信息即可
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name);

    # 创建函数的时候不要忘了传进参数self
    async def create_player(self, data):

        self.room_name = None  # 由于还没有匹配满人，因此先把房间名字定义出来
        self.uuid = data['uuid']

        transport = TSocket.TSocket('127.0.0.1', 9090)

        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        def db_get_player():            # 从数据库中获取username的player的信息
            return Player.objects.get(user__username=data['username'])  # 这里访问数据库是通过__来表示user中的username
        # 单线程变多线程，快速获取目标player，因为函数用的都是异步代码，这里如果想使用异步代码的话就要在访问数据库的时候把同步异步化
        player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()

        # 加入生产者队列

        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)

        # Close!
        transport.close()

    async def move_to(self, data):
        await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': "group_send_event",
                    "event": "move_to",
                    "uuid": data['uuid'],
                    "tx": data['tx'],
                    "ty": data['ty'],

                }
        )

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        "type": "group_send_event",
                        "event": "shoot_fireball",
                        "uuid": data['uuid'],
                        "tx": data['tx'],
                        "ty": data['ty'],
                        "ball_uuid": data['ball_uuid'],
                    }
        )

    async def attacked(self, data):
        # 后端判断是否有死亡，因此用了一个hp表示
        if not self.room_name:
            return

        players = cache.get(self.room_name)

        if not players:
            return

        for player in players:
            if player['uuid'] == data['attackee_uuid']:
                player['hp'] -= 25

        remain_cnt = 0

        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1

        if remain_cnt > 1:
            if self.room_name:
                cache.set(self.room_name, players, 3600)        # 重新把他set进去，因为重新拿了出来，重新设立一遍
       # else:
        #    def db_update_player_score(username, score):
         #       player = Player.objects.get(user__username)
          #      player.score += score
           #     player.save()
           # for player in players:
            #    if player['hp'] <= 0:
             #       await database_sync_to_async(db_update_player_score)(player['username'], -5)
              #  else:
               #     await database_sync_to_async(db_update_player_score)(player['username'], 10)


        await self.channel_layer.group_send(
                        self.room_name,
                        {
                            "type": "group_send_event",
                            "event": "attacked",
                            "uuid": data['uuid'],
                            "attackee_uuid": data['attackee_uuid'],
                            "x": data['x'],
                            "y": data['y'],
                            "angle": data['angle'],
                            "damage": data['damage'],
                            "ball_uuid": data['ball_uuid'],
                            }
                        )

    async def blink(self, data):
        await self.channel_layer.group_send(
                            self.room_name,
                            {
                                "type": "group_send_event",
                                "event": "blink",
                                "uuid": data['uuid'],
                                "tx": data['tx'],
                                "ty": data['ty'],
                                }
                            )

    async def send_message(self, data):
        await self.channel_layer.group_send(
                                self.room_name,
                                {
                                    "type": "group_send_event",
                                    "event": "send_message",
                                    "username": data['username'],
                                    "text": data['text'],
                                    }
                                )

    async def group_send_event(self, data):
        if not self.room_name:
            keys = cache.keys("*%s*" % (self.uuid))
            if keys:
                self.room_name = keys[0]
                print(keys)
        # 发送给前端当前的玩家信息，并且是一个一个发
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attacked":
            await self.attacked(data)
        elif event == "blink":
            await self.blink(data);
        elif event == "send_message":
            await self.send_message(data);
