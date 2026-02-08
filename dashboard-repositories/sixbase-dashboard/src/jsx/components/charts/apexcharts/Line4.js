import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class ApexLine4 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: 'Produto A',
          data: [65, 65, 65, 120, 120, 80, 120, 100, 100, 120, 120, 120],
        },
        {
          name: 'Método Gestor de Tráfego',
          data: [50, 100, 35, 35, 50, 0, 80, 20, 40, 40, 40, 40],
        },
        {
          name: 'Produto B',
          data: [20, 40, 20, 80, 40, 40, 20, 60, 60, 20, 110, 60],
        },
      ],

      options: {
        xaxis: {
          type: 'text',
          categories: [
            '01/10/2021',
            '02/10/2021',
            '03/10/2021',
            '04/10/2021',
            '05/10/2021',
            '06/10/2021',
            '07/10/2021',
            '08/10/2021',
            '09/10/2021',
            '10/10/2021',
            '11/10/2021',
            '12/10/2021',
          ],
          labels: {
            formatter: function (value) {
              if (value) {
                return value.substr(0, 5);
              }
            },
          },
        },
        yaxis: {
          title: {
            text: '',
          },
          labels: {
            formatter: function (value) {
              return 'R$ ' + value;
            },
          },
        },
        chart: {
          fontFamily: 'poppins, sans-serif',
          height: 350,
          type: 'line',
          toolbar: {
            show: false,
          },
          zoom: false,
        },
        dataLabels: {
          enabled: false,
        },

        stroke: {
          width: [4, 4, 4],
          colors: ['#C046D3', '#1EA7C5', '#FF9432'],
          curve: 'straight',
        },
        legend: {
          show: false,
        },

        colors: ['#C046D3', '#1EA7C5', '#FF9432'],

        markers: {
          size: [8, 8, 6],
          strokeWidth: [0, 0, 4],
          strokeColors: ['#C046D3', '#1EA7C5', '#FF9432'],
          border: 0,
          colors: ['#C046D3', '#1EA7C5', '#fff'],
          hover: {
            size: 10,
          },
        },
      },
    };
  }

  render() {
    return (
      <div id='chart'>
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type='bar'
          height={250}
        />
      </div>
    );
  }
}

export default ApexLine4;
