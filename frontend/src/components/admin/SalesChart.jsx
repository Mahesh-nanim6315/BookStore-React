import React, { useEffect, useRef } from 'react'

const SalesChart = ({ months, sales }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !months.length || !sales.length) return
    const canvas = chartRef.current

    if (!window.Chart) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
      script.async = true
      script.onload = () => {
        createChart()
      }
      document.head.appendChild(script)
    } else {
      createChart()
    }

    function createChart() {
      const ctx = canvas.getContext('2d')
      const isMobile = window.matchMedia('(max-width: 640px)').matches

      if (canvas.chart) {
        canvas.chart.destroy()
      }

      canvas.chart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Monthly Sales',
              data: sales,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: isMobile ? 4 : 12,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback(value) {
                  return `Rs ${value.toLocaleString()}`
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: isMobile ? 'bottom' : 'top',
            },
            tooltip: {
              callbacks: {
                label(context) {
                  return `Sales: Rs ${context.parsed.y.toLocaleString()}`
                },
              },
            },
          },
        },
      })
    }

    return () => {
      if (canvas?.chart) {
        canvas.chart.destroy()
      }
    }
  }, [months, sales])

  return (
    <div className="dashboard-chart">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default SalesChart
