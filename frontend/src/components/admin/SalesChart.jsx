import React, { useEffect, useRef } from 'react'

const SalesChart = ({ months, sales }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !months.length || !sales.length) return

    // Load Chart.js if not already loaded
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
      const ctx = chartRef.current.getContext('2d')
      
      // Destroy existing chart if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy()
      }

      chartRef.current.chart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Monthly Sales',
            data: sales,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₹' + value.toLocaleString()
                }
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return 'Sales: ₹' + context.parsed.y.toLocaleString()
                }
              }
            }
          }
        }
      })
    }

    return () => {
      if (chartRef.current?.chart) {
        chartRef.current.chart.destroy()
      }
    }
  }, [months, sales])

  return (
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default SalesChart
