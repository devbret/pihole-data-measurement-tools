const margin = { top: 0, right: 0, bottom: 0, left: 100 },
  width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom;

const gridSizeX = Math.floor(width / 144),
  gridSizeY = Math.floor(height / 7),
  days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 333]);

const svg = d3
  .select("#heatmap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 100)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

svg
  .selectAll(".dayLabel")
  .data(days)
  .enter()
  .append("text")
  .text((d) => d)
  .attr("x", 0)
  .attr("y", (d, i) => i * gridSizeY)
  .attr("class", "dayLabel")
  .attr("transform", `translate(-6,${gridSizeY / 1.5})`)
  .style("text-anchor", "end");

const times = d3.range(0, 24).map(function (d) {
  return `${d}:00`;
});

svg
  .selectAll(".timeLabel")
  .data(times)
  .enter()
  .append("text")
  .text((d) => d)
  .attr("x", (d, i) => i * 6 * gridSizeX)
  .attr("y", height + margin.top + 20)
  .attr("class", "timeLabel")
  .attr("transform", `translate(${gridSizeX * 3}, 0)`)
  .style("text-anchor", "middle");

const returnZero = () => "00";

d3.json("dns_heatmap_data.json").then((data) => {
  const counts = data.map((d) => d.count);
  const dataMin = d3.min(counts);
  const dataMax = d3.max(counts);

  svg
    .selectAll(".cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => d.time_slot * gridSizeX)
    .attr("y", (d) => days.indexOf(d.day) * gridSizeY)
    .attr("class", "cell")
    .attr("width", gridSizeX)
    .attr("height", gridSizeY)
    .style("fill", (d) => colorScale(d.count))
    .append("title")
    .text(
      (d) =>
        `${d.day}, ${Math.floor(d.time_slot / 6)}:${
          (d.time_slot % 6) * 10 > 0 ? (d.time_slot % 6) * 10 : returnZero()
        } - ${d.count} queries`
    );

  const legendWidth = 300;
  const legendHeight = 10;

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${width - legendWidth - 20},${height + margin.top + 40})`
    );

  const defs = svg.append("defs");

  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(dataMin));

  linearGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(dataMax));

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient)");

  const legendScale = d3
    .scaleLinear()
    .domain([dataMin, dataMax])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale).ticks(5);

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);
});

window.addEventListener("resize", function () {
  const newWidth = window.innerWidth - margin.left - margin.right;
  const newHeight = window.innerHeight - margin.top - margin.bottom;

  const newGridSizeX = Math.floor(newWidth / 144);
  const newGridSizeY = Math.floor(newHeight / 7);

  d3.select("svg")
    .attr("width", newWidth + margin.left + margin.right)
    .attr("height", newHeight + margin.top + margin.bottom + 100);

  svg
    .selectAll(".cell")
    .attr("x", (d) => d.time_slot * newGridSizeX)
    .attr("y", (d) => days.indexOf(d.day) * newGridSizeY)
    .attr("width", newGridSizeX)
    .attr("height", newGridSizeY);

  svg
    .selectAll(".dayLabel")
    .attr("y", (d, i) => i * newGridSizeY)
    .attr("transform", `translate(-6,${newGridSizeY / 1.5})`);

  svg
    .selectAll(".timeLabel")
    .attr("x", (d, i) => i * 6 * newGridSizeX)
    .attr("y", newHeight + margin.top + 20)
    .attr("transform", `translate(${newGridSizeX * 3}, 0)`);

  svg
    .select(".legend")
    .attr(
      "transform",
      `translate(${newWidth - legendWidth - 20},${newHeight + margin.top + 40})`
    );

  svg.select(".legend rect").attr("width", legendWidth);

  legendScale.range([0, legendWidth]);
  svg.select(".legend g").call(legendAxis);
});
