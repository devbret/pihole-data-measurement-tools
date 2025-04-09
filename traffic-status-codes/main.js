const svg = d3.select("svg"),
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom;

const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
  y = d3.scaleLinear().rangeRound([height, 0]),
  z = d3.scaleOrdinal(d3.schemeCategory10);

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("status_counts_by_hour.json").then((data) => {
  const keys = ["0", "1", "2", "3"];

  data.forEach((d) => {
    keys.forEach((key) => {
      d[key] = d[key] || 0;
    });
    d.total = keys.map((key) => d[key]).reduce((a, b) => a + b, 0);
  });

  x.domain(data.map((d) => d.hour));
  y.domain([0, d3.max(data, (d) => d.total)]).nice();
  z.domain(keys);

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter()
    .append("g")
    .attr("fill", (d) => z(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.data.hour))
    .attr("y", (d) => (isNaN(y(d[1])) ? 0 : y(d[1])))
    .attr("height", (d) => (isNaN(y(d[0]) - y(d[1])) ? 0 : y(d[0]) - y(d[1])))
    .attr("width", x.bandwidth())
    .append("title")
    .text((d) => `${d.data.hour}: ${d[1] - d[0]}`);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("dx", "0.71em")
    .attr("text-anchor", "start")
    .text("Hour of Day")
    .attr("class", "axis-label");

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(10, "s"))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Blocks Count")
    .attr("class", "axis-label");
});
