Highcharts.chart(`chart-${index + 1}`, {
  chart: {
    type: "column",
    width: 400,
    backgroundColor: "transparent",
  },
  credits: {
    enabled: false,
  },
  exporting: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
  title: {
    text: "Answer Analysis",
  },
  plotOptions: {
    column: {
      depth: 15,
      pointWidth: 30,
    },
  },

  xAxis: {
    categories: Object.keys(charArray),
    crosshair: true,
    title: {
      text: "Options",
      margin: 20,
    },
  },
  yAxis: {
    tickInterval: 1,
    min: 0,
    title: {
      text: "Number of people choosed",
      margin: 40,
    },
  },

  series: [
    {
      data: Object.values(charArray),
      colorByPoint: true,
      showInLegend: false,
    },
  ],
});
