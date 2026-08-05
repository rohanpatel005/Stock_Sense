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
      style: { fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }
    },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
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
      theme: 'dark',
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const ohlc = w.config.series[seriesIndex].data[dataPointIndex].y;
        const rawDate = w.config.series[seriesIndex].data[dataPointIndex].x;
        const dateStr = new Date(rawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
          <div class="p-3 bg-[#0B1118]/90 border border-white/10 rounded-xl shadow-lg text-xs leading-relaxed text-slate-300 backdrop-blur-md">
            <div class="font-bold text-white border-b border-white/10 pb-1 mb-1.5">${dateStr}</div>
            <div><strong class="text-slate-400">Open:</strong> <span class="text-white">₹${ohlc[0].toFixed(2)}</span></div>
            <div><strong class="text-slate-400">High:</strong> <span class="text-[#00E0A4]">₹${ohlc[1].toFixed(2)}</span></div>
            <div><strong class="text-slate-400">Low:</strong> <span class="text-red-400">₹${ohlc[2].toFixed(2)}</span></div>
            <div><strong class="text-slate-400">Close:</strong> <span class="text-white">₹${ohlc[3].toFixed(2)}</span></div>
          </div>
        `;
      }
    }
  };

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] premium-glass-card hover-lift-card group transition-all duration-300">
      <div className="w-full min-h-[350px]">
        <Chart options={options} series={candleSeries} type="candlestick" height={380} />
      </div>
    </div>
  );
};

export default CandlestickChart;
