import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VolumeRankTable from './VolumeRankTable';
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';
import { Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const StockList = ({ 
  stocks,
  onAdd,
  onDelete,
  isDeleteMode,
  setIsDeleteMode 
}) => {
  const [selectedStockToDelete, setSelectedStockToDelete] = useState(null);
  const [favoritedStocks, setFavoritedStocks] = useState({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const stompClient = useRef(null);
  const subscriptions = useRef({});
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

  // Toggle favorite status for a stock
  const toggleFavorite = (stockCode) => {
    setFavoritedStocks(prev => ({
      ...prev,
      [stockCode]: !prev[stockCode]
    }));
  };

  const handleDeleteClick = (stockCode) => {
    setSelectedStockToDelete(stockCode);
  };

  const confirmDelete = () => {
    if (selectedStockToDelete) {
      onDelete(selectedStockToDelete);
      setSelectedStockToDelete(null);
      if (stocks.length === 1) {
        setIsDeleteMode(false);
      }
    }
  };
  const handleAddStock = async () => {
    await fetchStocks(); 
    setIsSearchOpen(false);
  };
  return (
    <div className="flex justify-center w-full">
      <div className="w-[500px] bg-[#b9dafc1a] rounded-[20px] border p-4 space-y-6">
        {stocks.length > 0 ? (
          <div className="space-y-1.5">
            {stocks.map((stock) => (
              <Card 
                key={stock.code} 
                className="border border-variable-collection-gray shadow-[4px_4px_4px_#00000040]"
                onClick={() => !isDeleteMode && navigate(`/stocks/${stock.code}`)}
              >
                <CardContent className="p-0">
                  <div className="flex justify-between items-center w-full">

                      <div className="flex items-center space-x-2">
                        <h3 className="font-h3 text-xl text-black p-3 ml-8 ">{stock.name}</h3>
                        <h3 className="font-h4 text-gray-400 p-1">{stock.code}</h3>
                  </div>
                  <div className="flex items-center justify-end flex-1 pr-4">
                  <span className="font-h3 text-lg text-black">
                      {stock.price ? `${stock.price.toLocaleString()}원` : "-"}
                    </span>
                    <span className={`font-h4 p-2.5 ${
                      stock.change?.startsWith('+') 
                        ? "text-red-500" 
                        : stock.change?.startsWith('-') 
                          ? "text-blue-500" 
                          : "text-red-500"
                    }`}>
                      ({stock.change || "-"})
                  </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* {!isDeleteMode && (
                        // <button 
                        //   className="p-2"
                        //   onClick={(e) => {
                        //     e.stopPropagation();
                        //     toggleFavorite(stock.code);
                        //   }}
                        // >
                        //   <Star 
                        //     className={`w-[22px] h-[21px] ${
                        //       favoritedStocks[stock.code] 
                        //         ? "text-yellow-500" 
                        //         : "text-gray-400"
                        //     }`} 
                        //   />
                        // </button>
                      )} */}
                      {isDeleteMode && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(stock.code);
                              }}
                            >
                              <Trash2 className="w-[22px] h-[21px] text-red-500" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>종목 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 이 종목을 삭제하시겠습니까?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="text-center space-y-4">
              <p className="text-xl font-semibold">관심 종목이 없습니다</p>
              <p className="text-sm text-gray-400">관심 종목을 추가해 보세요</p>
            </div>
          </div>
        )}
      </div>
      <VolumeRankTable />
    </div>
  );
}
export default StockList;