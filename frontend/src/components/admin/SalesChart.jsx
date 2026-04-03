import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const SalesChart = ({ months, sales }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !months.length || !sales.length) return
    const canvas = chartRef.current

    if (globalThis.Chart) {
      createChart()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
      script.async = true
      script.onload = () => {
        createChart()
      }
      document.head.appendChild(script)
    }

    function createChart() {
      const ctx = canvas.getContext('2d')
      const isMobile = globalThis.matchMedia('(max-width: 640px)').matches

      if (canvas.chart) {
        canvas.chart.destroy()
      }

      canvas.chart = new globalThis.Chart(ctx, {
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

SalesChart.propTypes = {
  months: PropTypes.arrayOf(PropTypes.string).isRequired,
  sales: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default SalesChart
