const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const w = 1500,
  h = 610,
  padding = { top: 30, right: 100, bottom: 100, left: 100 };

const HEAT_MAP_COLORS = [
  { color: '#00f', range: { max: 5 } },
  { color: '#0ff', range: { min: 5, max: 6.5 } },
  { color: '#0f0', range: { min: 6.5, max: 8 } },
  { color: '#ff0', range: { min: 9, max: 9.5 } },
  { color: '#f00', range: { min: 9.5 } }
];

const svg = d3
  .select('.heat-map')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

const tooltip = d3
  .select('.heat-map')
  .append('div')
  .attr('id', 'tooltip');

d3.json(URL).then((dataset, err) => {
  if (err) throw err;

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset.monthlyVariance, d => d.year))
    .range([0, w - (padding.left + padding.right)]);
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.format('d'))
    .tickValues(d3.range(1760, 2015, 10))
    .tickSize(10)
    .tickSizeOuter(0);

  const yScale = d3
    .scaleTime()
    .domain([
      d3.min(d3.range(0, 12), (d, i) => new Date(1970, i, -15)),
      d3.max(d3.range(0, 12), (d, i) => new Date(1970, i, 15))
    ])
    .range([padding.top, h - padding.bottom]);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(d3.timeFormat('%B'))
    .tickSize(10)
    .tickSizeOuter(0);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${padding.left}, ${h - padding.bottom})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding.left}, 0)`)
    .call(yAxis);

  svg
    .selectAll('rect')
    .data(dataset.monthlyVariance)
    .enter()
    .append('rect')
    .attr('width', 5)
    .attr('height', 40) // svg height = (12 * 40) + (padding.top + padding.bottom)
    .attr('x', d => padding.left + xScale(d.year) + 1)
    .attr('y', d => (d.month - 1) * 40 + padding.top)
    .attr('class', 'cell')
    .attr('fill', d => {
      const temp = (dataset.baseTemperature + d.variance).toFixed(1);
      if (temp <= 5) {
        return HEAT_MAP_COLORS[0].color;
      } else if (temp > 5 && temp <= 6.5) {
        return HEAT_MAP_COLORS[1].color;
      } else if (temp > 6.5 && temp <= 8) {
        return HEAT_MAP_COLORS[2].color;
      } else if (temp > 8 && temp <= 9.5) {
        return HEAT_MAP_COLORS[3].color;
      } else {
        return HEAT_MAP_COLORS[4].color;
      }
    })
    .attr('data-month', d => d.month - 1)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => (dataset.baseTemperature + d.variance).toFixed(1))
    .on('mouseover', function(d) {
      let date = new Date(d.year, d.month - 1, 1);
      date = d3.timeFormat('%Y - %B')(date);

      let html = `${date}<br>${(dataset.baseTemperature + d.variance).toFixed(
        1
      )}°C<br>${d.variance.toFixed(1)}°C`;

      tooltip
        .attr('data-year', d.year)
        .html(html)
        .style('opacity', 1)
        .style('left', padding.left + Math.round(xScale(d.year)) + 20 + 'px')
        .style('top', d.month * 40 + 30 + 'px');
    })
    .on('mouseout', function(d) {
      tooltip.style('opacity', 0);
    });

  const legend = svg.append('g').attr('id', 'legend');
  const rect = legend
    .append('g')
    .attr('transform', `translate(${padding.left},${h - 50})`);
  const text = legend
    .append('g')
    .attr('transform', `translate(${padding.left},${h - 20})`);

  rect
    .selectAll('rect')
    .data(HEAT_MAP_COLORS)
    .enter()
    .append('rect')
    .attr('width', 120)
    .attr('height', 10)
    .attr('fill', c => c.color)
    .attr('x', (c, i) => i * 160);

  text
    .selectAll('text')
    .data(HEAT_MAP_COLORS)
    .enter()
    .append('text')
    .text(d => {
      if (!d.range.min) {
        return 'temp <= ' + d.range.max;
      } else if (!d.range.max) {
        return d.range.min + ' < temp';
      } else {
        return d.range.min + ' < temp <= ' + d.range.max;
      }
    })
    .attr('x', (c, i) => i * 160)
    .attr('dx', d => (!d.range.min || !d.range.max ? 25 : 10));
});
