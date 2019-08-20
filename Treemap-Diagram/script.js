const KICKSTARTER_PLEDGES_URL =
  'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json';
const MOVIE_SALES_URL =
  'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
const VIDEO_GAME_SALES_URL =
  'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';

const w = 1000,
  h = 600,
  margin = { top: 30, right: 30, bottom: 30, left: 30 },
  width = w - (margin.left + margin.right),
  height = h - (margin.top + margin.bottom);

const svg = d3
  .select('.treemap-container')
  .append('svg')
  .attr('id', 'treemap-diagram')
  .attr('width', w)
  .attr('height', h);

const tooltip = d3
  .select('.treemap-container')
  .append('div')
  .attr('id', 'tooltip');

let drawTreemap = async url => {
  data = await d3.json(url || VIDEO_GAME_SALES_URL);
  let treemap = d3.treemap().size([w, h]);

  let root = d3
    .hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap.padding(1)(root);

  let length = root.children.length;
  colors = getColors(length);

  let categories = [];
  let selection = svg.selectAll('g').data(root.leaves(), d => d.data.category);

  selection.exit().remove();

  selection
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

  svg
    .selectAll('g')
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .style('stroke', 'none')
    .style('fill', (d, i) => {
      if (!categories.some(c => c.category === d.data.category)) {
        categories.push({ category: d.data.category });
      }
      return colors[categories.length - 1];
    })
    .on('mousemove', d => {
      let { name, category, value } = d.data;
      let info = `${name}<br>${category}<br>${value}`;

      tooltip
        .html(info)
        .attr('data-value', value)
        .style('left', `${event.clientX + 15}px`)
        .style('top', `${event.offsetY + 35}px`)
        .transition()
        .duration(150)
        .style('opacity', 0.9);
    })
    .on('mouseout', d => {
      tooltip
        .transition()
        .duration(150)
        .style('opacity', 0);
    });

  svg
    .selectAll('g')
    .append('text')
    .selectAll('tspan')
    .data(d => {
      return d.data.name.split(/(?![A-Z])$|\s(?=[A-Za-z]{4,})/g);
    })
    .enter()
    .append('tspan')
    .text(d => d)
    .attr('x', 6)
    .attr('dy', 12)
    .attr('fill', '#222');

  categories.map((c, i) => (c.color = colors[i]));

  var elem = document.querySelector('#legend');
  if (elem) elem.remove();

  let legend = d3
    .select('.treemap-container')
    .append('svg')
    .attr('id', 'legend');

  selection = legend.selectAll('g').data(categories, d => d.category);

  selection.enter().append('g');

  legend
    .selectAll('g')
    .append('rect')
    .attr('class', 'legend-item')
    .attr('fill', item => item.color)
    .attr('height', 16)
    .attr('width', 16)
    .attr('x', (d, i) => {
      return i < Math.ceil(length / 3)
        ? 0
        : i >= Math.ceil(length / 3) * 2
        ? 280
        : 140;
    })
    .attr('y', (d, i) => {
      return (i % Math.ceil(length / 3)) * 28;
    });

  legend
    .selectAll('g')
    .append('text')
    .text(item => item.category)
    .style('font-size', 14)
    .attr('x', (d, i) => {
      return i < Math.ceil(length / 3)
        ? 25
        : i >= Math.ceil(length / 3) * 2
        ? 305
        : 165;
    })
    .attr('y', (d, i) => {
      return (i % Math.ceil(length / 3)) * 28;
    });

  let bb = legend.node().getBBox();
  let legendWidth = bb.x + bb.width;
  let legendHeight = bb.y + bb.height;
  legend.attr('width', legendWidth).attr('height', legendHeight);
};

drawTreemap();

function getColors(length) {
  let increment = 360 / length;
  let next = 0;
  let hue = 0;
  let colors = [];

  for (let i = 0; i < Math.ceil(length / 3); i++) {
    for (let j = 0; j < 3; j++) {
      colors.push(`hsl(${hue}, 60%, 62%)`);
      hue = (hue + 120) % 360;
    }

    hue = next += increment;
  }
  return colors;
}

const videoGamesBtn = document.getElementById('videoGames_btn');
const movieSalesBtn = document.getElementById('movieSales_btn');
const kickstarterBtn = document.getElementById('kickstarter_btn');

videoGamesBtn.onclick = e => drawTreemap(VIDEO_GAME_SALES_URL);
movieSalesBtn.onclick = e => drawTreemap(MOVIE_SALES_URL);
kickstarterBtn.onclick = e => drawTreemap(KICKSTARTER_PLEDGES_URL);
