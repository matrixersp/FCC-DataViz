const url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const w = 1280,
  h = 500,
  barWidth = 4,
  padding = { left: 60, right: 60, top: 30, bottom: 40 };

const svg = d3
  .select('.chart')
  .append('svg')
  .style('width', w)
  .style('height', h);

svg
  .append('text')
  .text('Gross Domestic Product')
  .attr(
    'transform',
    `translate(${padding.left + 30}, ${h / 1.8}), rotate(-90)`
  );

const req = new XMLHttpRequest();
req.open('GET', url, true);
req.send();
req.onload = () => {
  const response = JSON.parse(req.responseText);
  const dataset = response.data;

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataset, d => d[0].split('-')[0]),
      d3.max(dataset, d => Number(d[0].split('-')[0]) + 1)
    ])
    .range([padding.left, w - padding.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, d => d[1])])
    .range([h - padding.bottom, padding.top]);

  const tooltip = d3
    .select('.chart')
    .append('div')
    .attr('id', 'tooltip')
    .style('top', h / 1.2 + 'px');

  drawXAxis(xScale);
  drawYAxis(yScale);
  plot(dataset, xScale, yScale, tooltip);
};

function drawXAxis(xScale) {
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

  svg
    .append('g')
    .attr('transform', `translate(0, ${h - padding.bottom})`)
    .attr('id', 'x-axis')
    .call(xAxis);
}

function drawYAxis(yScale) {
  const yAxis = d3.axisLeft(yScale);

  svg
    .append('g')
    .attr('transform', `translate(${padding.left}, ${0})`)
    .attr('id', 'y-axis')
    .call(yAxis);
}

function plot(dataset, xScale, yScale, tooltip) {
  svg
    .selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', d => {
      const [year, month] = d[0].split('-');
      return xScale(
        `${year}.${String(Math.ceil((month * 100) / 12)).padStart(2, '0')}`
      );
    })
    .attr('y', d => yScale(d[1]))
    .attr('width', barWidth)
    .attr('height', d => h - yScale(d[1]) - padding.bottom)
    .attr('fill', '#0ac')
    .attr('class', 'bar')
    .attr('data-date', d => d[0])
    .attr('data-gdp', d => d[1])
    .on('mouseover', d => {
      const [year, month] = d[0].split('-');
      let text = year + ' ';
      switch (month) {
        case '01':
          text += 'Q1';
          break;
        case '04':
          text += 'Q2';
          break;
        case '07':
          text += 'Q3';
          break;
        default:
          text += 'Q4';
          break;
      }

      tooltip
        .attr('data-date', d[0])
        .html(`${text}<br>$${d[1].toLocaleString()} Billion`)
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('left', Number(xScale(year)) + 50 + 'px');
    })
    .on('mouseout', d => {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0);
    });
}
