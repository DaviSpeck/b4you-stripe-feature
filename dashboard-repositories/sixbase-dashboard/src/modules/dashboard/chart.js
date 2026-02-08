import moment from 'moment';
import ReactApexChart from 'react-apexcharts';
import { getRGBA } from '../functions';
import ptBR from 'apexcharts/dist/locales/pt-br.json';

const Chart = ({ chartData }) => {
  const series = chartData.products;
  let categories = chartData.dates;

  if (categories.length > 0) {
    categories = categories.map((c) => moment(c, 'DD/MM/YYYY').toISOString());
  }

  let strokes = [];
  let colors = [];
  function lightOrDark(color) {
    let r, g, b;
    if (color.match(/^rgb/)) {
      color = color.match(
        /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
      );
      r = color[1];
      g = color[2];
      b = color[3];
    } else {
      color = +(
        '0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&')
      );
      r = color >> 16;
      g = (color >> 8) & 255;
      b = color & 255;
    }
    let hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    if (hsp > 127.5) {
      return 'light';
    } else {
      return 'dark';
    }
  }

  series.map((item) => {
    if (lightOrDark(item.hex_color) === 'light') {
      strokes.push('#24292f');
      colors.push(getRGBA('#24292f', 0.8));
    } else {
      strokes.push(item.hex_color);
      colors.push(getRGBA(item.hex_color, 0.8));
    }
  });

  const data = {
    series: series,
    options: {
      xaxis: {
        ticks: {
          minRotation: 88,
          autoskip: true,
          autoSkipPadding: 50,
        },
        type: 'datetime',
        categories: series.length > 0 ? categories : [],
        labels: {
          format: 'dd/MM',
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
        locales: [ptBR],
        defaultLocale: 'pt-br',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 3,
        colors: strokes,
        curve: 'straight',
      },
      legend: {
        show: true,
      },
      tooltip: {
        x: {
          format: 'dd/MM',
        },
      },
      colors: colors,
      markers: {
        size: [8, 8, 6],
        strokeWidth: [0, 0, 4],
        strokeColors: strokes,
        border: 0,
        colors: colors,
        hover: {
          size: 10,
        },
      },
      noData: {
        text: 'Sem vendas no período!',
        align: 'center',
        offsetY: -20,
        verticalAlign: 'middle',
      },
    },
  };

  return (
    <div id='chart'>
      <ReactApexChart
        options={data.options}
        series={data.series}
        type='bar'
        height={250}
      />
    </div>
  );
};

export default Chart;
