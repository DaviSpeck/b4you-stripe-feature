import ReactApexChart from 'react-apexcharts';

const ApexChart = ({ series, options }) => {
  return (
    <ReactApexChart
      series={series}
      options={options}
      type='area'
      height={350}
    />
  );
};

export default ApexChart;
