const COUNTIES_DATA_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const EDUCATION_DATA_URL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

const w = 1100,
  h = 700,
  margin = { top: 30, right: 30, bottom: 30, left: 30 },
  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom,
  SCALE = 1.1;

const svg = d3
  .select('.choropleth-map')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

const tooltip = d3
  .select('.choropleth-map')
  .append('div')
  .attr('id', 'tooltip')
  .style('top', 30 + 'px');

(async () => {
  let countiesData = await d3.json(COUNTIES_DATA_URL);
  let educationData = await d3.json(EDUCATION_DATA_URL);

  let counties = topojson.feature(countiesData, countiesData.objects.counties)
    .features;

  let max = educationData.reduce((a, b) => Math.max(a, b.bachelorsOrHigher), 0);
  let min = educationData.reduce(
    (a, b) => Math.min(a, b.bachelorsOrHigher),
    max
  );

  for (let i = 0; i < counties.length; i++) {
    for (let j = 0; j < educationData.length; j++) {
      if (counties[i].id === educationData[j].fips) {
        counties[i].properties = educationData[j];
        educationData.splice(j, 1);
      }
    }
  }

  let projection = d3
    .geoIdentity()
    .translate([margin.left, margin.top])
    .scale(SCALE);
  let path = d3.geoPath().projection(projection);

  let colorScaleLin = d3
    .scaleLinear()
    .domain([min, max])
    .range(['#efe', '#060']);

  let countyShapes = svg
    .selectAll('path')
    .data(counties)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('data-fips', county => county.properties.fips)
    .attr('data-education', county => county.properties.bachelorsOrHigher)
    .attr('fill', county => colorScaleLin(county.properties.bachelorsOrHigher))
    .attr('stroke', 'gray')
    .attr('stroke-width', '0.2')
    .on('mouseover', county => {
      const {
        area_name: areaName,
        state,
        bachelorsOrHigher
      } = county.properties;
      let x = (county.geometry.coordinates[0][0][0] + margin.left) * SCALE + 20;
      let y = (county.geometry.coordinates[0][0][1] + margin.right) * SCALE;

      tooltip
        .html(`${areaName}, ${state}: ${bachelorsOrHigher}%`)
        .style('top', y + 'px')
        .style('left', x + 'px')
        .attr('data-education', bachelorsOrHigher)
        .transition()
        .duration(200)
        .style('opacity', 1);
    })
    .on('mouseout', county => {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0);
    });

  let ranges = [];
  for (let i = Math.round(min); i < Math.round(max); i += Math.round(max / 8)) {
    ranges.push({ color: colorScaleLin(i), percentage: i });
  }

  const legend = svg.append('g').attr('id', 'legend');

  legend
    .selectAll('rect')
    .data(ranges)
    .enter()
    .append('rect')
    .attr('width', 40)
    .attr('height', 10)
    .attr('fill', r => r.color)
    .attr('x', (r, i) => i * 41 + width / 1.7)
    .attr('y', r => margin.top);

  let tick = legend
    .selectAll('g')
    .data(d3.range(8))
    .enter()
    .append('g');

  tick
    .attr('class', 'tick')
    .attr('transform', (r, i) => `translate(${i * 41 + width / 1.7}, 30)`)
    .append('line')
    .attr('stroke', '#000')
    .attr('y2', r => 14);

  tick
    .attr('transform', (r, i) => `translate(${i * 41 + width / 1.7}, 30)`)
    .data(ranges)
    .append('text')
    .attr('fill', '#000')
    .attr('y', 30)
    .attr('dx', -6)
    .style('font-size', 14)
    .text(r => r.percentage + '%');
})();
