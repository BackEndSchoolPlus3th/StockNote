import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';
import { useNavigate } from "react-router-dom";

const StockList = ({ stocks }) => {  // ✅ props로 stocks 받음
  const stompClient = useRef(null);
  const subscriptions = useRef({}); // 중복 구독 방지
  const navigate = useNavigate();

  // WebSocket 연결 및 구독 설정
  const connectWebSocket = () => {
    if (stompClient.current?.connected) {
      console.log('🛑 WebSocket already connected. Skipping re-connection.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token || stocks.length === 0) {
      console.log('Cannot connect:', { hasToken: !!token, stocksLength: stocks.length });
      return;
    }

    console.log('Connecting to WebSocket with stocks:', stocks);

    const socket = new SockJS('http://localhost:8090/ws', null, {
      transports: ['websocket'],
      timeout: 30000
    });

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
      onConnect: () => {
        console.log('✅ WebSocket Connected, subscribing to stocks');

        stocks.forEach(stock => {
          if (!subscriptions.current[stock.code]) { // 중복 구독 방지
            subscriptions.current[stock.code] = client.subscribe(
              `/topic/stocks/${stock.code}`,
              message => handleStockMessage(stock.code, message),
              { 'Authorization': `Bearer ${token}` }
            );
            console.log(`📩 Subscribed to stock ${stock.code}`);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      },
      onWebSocketClose: () => {
        console.log('⚠️ WebSocket connection closed');
      },
      onWebSocketError: (event) => {
        console.error('❌ WebSocket error:', event);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    try {
      client.activate();
      stompClient.current = client;
    } catch (error) {
      console.error('❌ Failed to activate STOMP client:', error);
    }
  };

  // ✅ stocks가 변경될 때만 WebSocket 연결
  useEffect(() => {
    if (stocks.length > 0) {
      connectWebSocket();
    }
  }, [stocks]);

  return (

    <div className="flex justify-center w-full">
      <div className="w-[805px] bg-[#b9dafc1a] rounded-[20px] border p-4 space-y-6">
        <div className="space-y-1.5">
          {stocks.map((stock) => (
            <Card 
              key={stock.code} 
              className="border border-variable-collection-gray shadow-[4px_4px_4px_#00000040]"
              onClick={() => navigate(`/stocks/${stock.code}`)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-0.5">
                      <h3 className="font-h3 text-xl text-black p-2.5">{stock.name}</h3>
                      <h3 className="font-h4 text-gray-400 p-2.5">{stock.code}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-h3 text-black p-2.5">
                        {stock.price ? `${stock.price.toLocaleString()}원` : "-"}
                      </span>
                      <span className={`font-h4 p-2.5 ${
                        stock.isPositive ? "text-red-500" : "text-blue-500"
                      }`}>
                        ({stock.change || "-"})
                      </span>
                    </div>
                  </div>
                  <button className="p-2">
                    <Star className="w-[22px] h-[21px] text-gray-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockList;
