#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

from match_server.match_service import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from queue import Queue
from threading import Thread
from time import sleep

queue = Queue()

# 消费者
class Pool:
    def __init__(self):
        self.players = []
    def add_player(self, player):
        self.players.append(player)
    def check_match(self, a, b):
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif
    def match(self):
        while len(self.players) >= 3:
            self.players = sorted(self.players, key=lambda p: p.score)  # 以积分作为从小到大的排序目标
            flag = False
            for i in self.players - 2:      # 算法内容：
                a , b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(a, c):
                        match_success([a, b, c])
                        self.players = self.players[:i] + self.players[i + 3:]
                        flag = True
                        break
            if not flag:
                break
        # 对于剩余在players里面的都没有匹配成功，因此都给他们加一个匹配的等待时间
        self.increasing_waiting_time()

    def match_success(self, ps):        # 匹配成功之后还要加入到房间里面
        # 先看一下输出的信息
        print("Match success: %s %s %s" % (ps[0].username, ps[1].username, ps[2].username))

    def increasing_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

# 消费者从生产者中不断拿取，一个死循环

def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None

def worker():  # worker只会调用一次，因此pool也只会开一个
    pool = Pool()
    while True:
        player = get_player_from_queue()
        # 获取机制：有player就拿player，没有就在匹配池里面进行配对
        if player:
            print("Add player %s %d" % (player.username, player.score))
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)

# 生产者
class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0  # 等待时间从0开始

class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player = Player(score, uuid, username, photo, channel_name)
        # 加入到消费者队列里面
        queue.put(player)
        return 0  # 一定要return 0。可是为什么？

if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)  # 实例化一个thrift服务
    Thread(target=worker, daemon=True).start()      # 开启一个线程给worker工作去get消息队列中的内容

    print('Starting thrift server...')
    server.serve()  # 开启一个server
    print('done.')
