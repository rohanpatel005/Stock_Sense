import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

const LiveChart = ({ chartsData }) => {
  const [activeInterval, setActiveInterval] = useState('1d');
  const [chartSeries, setChartSeries] = useState([]);
  
  const intervals = [
    { label: '1D', key: '1d' },
    { label: '5D', key: '5d' },
    { label: '1M', key: '1m' },
    { label: '3M', key: '3m' },
    { label: '6M', key: '6m' },
    { label: '1Y', key: '1y' },
    { label: '5Y', key: '5y' },
    { label: 'MAX', key: 'max' }
  ];

  useEffect(() => {
    if (chartsData && chartsData[activeInterval]) {
      const dataPoints = chartsData[activeInterval].map(pt => ({
        x: new Date(pt.time * 1000),
        y: pt.value
      }));
      setChartSeries([{ name: 'Close Price', data: dataPoints }]);
    }
  }, [chartsData, activeInterval]);

  const chartOptions = {
    chart: {
      id: 'live-chart',
      type: 'area',
      height: 380,
      zoom: { autoScaleYaxis: true },
      toolbar: { show: true, tools: { download: false, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
      foreColor: '#94a3b8',
      fontFamily: 'Inter, sans-serif'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5, colors: ['#0F766E'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95],
        colorStops: [
          { offset: 0, color: '#0F766E', opacity: 0.45 },
          { offset: 100, color: '#ffffff', opacity: 0.05 }
        ]
      }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: { colors: '#94a3b8', fontWeight: 600 }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`,
        style: { colors: '#94a3b8', fontWeight: 600 }
      }
    },
    tooltip: {
      theme: 'light',
      x: { format: 'dd MMM yyyy, hh:mm TT' },
      y: { formatter: (value) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
      style: { fontSize: '12px' }
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Historical Trend</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Interactive performance tracker</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto overflow-x-auto">
          {intervals.map((intv) => (
            <button
              key={intv.key}
              onClick={() => setActiveInterval(intv.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeInterval === intv.key ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {intv.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full min-h-[350px]">
        {chartSeries.length > 0 ? (
          <Chart options={chartOptions} series={chartSeries} type="area" height={380} />
        ) : (
          <div className="h-[380px] bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-bold">
            Generating Chart...
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChart;
