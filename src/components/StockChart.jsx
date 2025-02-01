import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockChart = ({ chartData }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (chartData && chartData.candles) {
      console.log("📊 차트 컴포넌트 내부 차트 데이터 확인:", chartData);

      // ✅ 날짜 형식을 변경 (YYYY-MM-DD)
      const labels = chartData.candles.map((candle) =>
        `${candle.time.substring(0, 4)}-${candle.time.substring(4, 6)}-${candle.time.substring(6, 8)}`
      );
      const prices = chartData.candles.map((candle) => candle.close);

      setData({
        labels,
        datasets: [
          {
            label: "주가 변화",
            data: prices,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
            fill: false,
          },
        ],
      });
    }
  }, [chartData]);

  if (!data) {
    return <p>📈 차트 데이터를 불러오는 중...</p>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h2 className="text-xl font-semibold mb-2">📈 주가 차트</h2>
      <Line data={data} />
    </div>
  );
};

export default StockChart;


