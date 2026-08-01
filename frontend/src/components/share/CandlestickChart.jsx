import React from 'react';
import Chart from 'react-apexcharts';

const CandlestickChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Format candlestick series
  const candleSeries = [{
    name: 'Candles',
    data: data.map(item => ({
      x: new Date(item.time * 1000),
      y: [item.open, item.high, item.low, item.close]
    }))
  }];

  const options = {
    chart: {
      type: 'candlestick',
      height: 380,
      id: 'candles',
      foreColor: '#94a3b8',
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: true,
        tools: { download: false, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }
      }
    },
    title: {
      text: 'OHLC Candlestick Chart (1 Year Daily)',
      align: 'left',
      style: { fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: { colors: '#94a3b8', fontWeight: 600 }
      }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: (value) => `₹${value.toFixed(1)}`,
        style: { colors: '#94a3b8', fontWeight: 600 }
      }
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#10B981', downward: '#EF4444' },
        wick: { useFillColor: true }
      }
    },
    tooltip: {
      theme: 'light',
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const ohlc = w.config.series[seriesIndex].data[dataPointIndex].y;
        const rawDate = w.config.series[seriesIndex].data[dataPointIndex].x;
        const dateStr = new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
          <div class="p-3 bg-white border border-slate-100 rounded-xl shadow-lg text-xs leading-relaxed text-slate-600">
            <div class="font-bold text-slate-800 border-b border-slate-150 pb-1 mb-1.5">${dateStr}</div>
            <div><strong>Open:</strong> ₹${ohlc[0].toFixed(2)}</div>
            <div><strong>High:</strong> ₹${ohlc[1].toFixed(2)}</div>
            <div><strong>Low:</strong> ₹${ohlc[2].toFixed(2)}</div>
            <div><strong>Close:</strong> ₹${ohlc[3].toFixed(2)}</div>
          </div>
        `;
      }
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="w-full min-h-[350px]">
        <Chart options={options} series={candleSeries} type="candlestick" height={380} />
      </div>
    </div>
  );
};

export default CandlestickChart;
