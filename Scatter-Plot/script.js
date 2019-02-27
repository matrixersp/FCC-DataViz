const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const w = 1000,
  h = 520,
  padding = { top: 30, right: 60, bottom: 35, left: 60 };

d3.json(URL).then((dataset, err) => {
  if (err) throw err;

  dataset.forEach(d => {
    let [min, sec] = d.Time.split(':');
    d.Time = new Date();
    d.Time.setMinutes(min, sec);
  });

  const svg = d3
    .select('.graph')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  const tooltip = d3
    .select('.graph')
    .append('div')
    .attr('id', 'tooltip');

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(dataset, d => d.Year - 1),
      d3.max(dataset, d => d.Year + 1)
    ])
    .range([padding.left, w - padding.right]);

  const yScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, d => d.Time).reverse())
    .range([h - padding.bottom, padding.top]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

  svg
    .append('g')
    .attr('transform', `translate(0, ${h - padding.bottom})`)
    .attr('id', 'x-axis')
    .call(xAxis);

  svg
    .append('g')
    .attr('transform', `translate(${padding.left}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis);

  svg
    .selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => d.Time.toISOString())
    .attr('cx', d => xScale(d.Year))
    .attr('cy', d => yScale(d.Time))
    .attr('r', 8)
    .style('fill', d => (d.Doping ? '#38f' : '#f73'))
    .on('mouseover', d => {
      tooltip
        .html(
          `${d.Name}: ${d.Nationality}<br>${
            d.Year
          }, ${d.Time.getMinutes()}:${d.Time.getSeconds()}${
            d.Doping ? '<br><br>' + d.Doping : ''
          }`
        )
        .attr('data-year', d.Year)
        .style('left', Math.round(xScale(d.Year) + 35) + 'px')
        .style('top', Math.round(yScale(d.Time) + 50) + 'px');

      tooltip
        .transition()
        .duration(300)
        .style('opacity', 1);
    })
    .on('mouseout', d => {
      tooltip
        .transition()
        .duration(300)
        .style('opacity', 0);
    });

  const legend1 = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${w - padding.right},${h / 3})`);
  legend1
    .append('rect')
    .attr('width', '18')
    .attr('height', '18')
    .attr('fill', '#38f');
  legend1
    .append('text')
    .text('Riders with doping allegations')
    .style('text-anchor', 'end')
    .attr('x', '-5')
    .attr('y', '13');

  const legend2 = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${w - padding.right},${h / 3 + 24})`);
  legend2
    .append('rect')
    .attr('width', '18')
    .attr('height', '18')
    .attr('fill', '#f73');
  legend2
    .append('text')
    .text('No doping allegations')
    .style('text-anchor', 'end')
    .attr('x', '-5')
    .attr('y', '13');
});
