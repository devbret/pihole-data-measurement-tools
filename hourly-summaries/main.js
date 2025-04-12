const margin = { top: 20, right: 100, bottom: 50, left: 60 },
  width = window.innerWidth - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");
const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");
const x = d3.scaleTime().range([0, width]);

const metrics = [
  {
    key: "avg_reply_time",
    label: "Avg Reply Time",
    color: "steelblue",
    format: (d) => (d * 1000).toFixed(3) + " ms",
  },
  {
    key: "min_reply_time",
    label: "Min Reply Time",
    color: "green",
    format: (d) => (d * 1000).toFixed(3) + " ms",
  },
  {
    key: "max_reply_time",
    label: "Max Reply Time",
    color: "red",
    format: (d) => (d * 1000).toFixed(3) + " ms",
  },
  {
    key: "median_reply_time",
    label: "Median Reply Time",
    color: "orange",
    format: (d) => (d * 1000).toFixed(3) + " ms",
  },
  {
    key: "error_rate",
    label: "Error Rate",
    color: "purple",
    format: (d) => (d * 100).toFixed(2) + "%",
  },
  {
    key: "query_count",
    label: "Query Count",
    color: "brown",
    format: (d) => d,
  },
];

d3.json("hourly_metrics.json")
  .then((data) => {
    data.forEach((d) => {
      d.hour = parseDate(d.hour);
      d.avg_reply_time = +d.avg_reply_time;
      d.min_reply_time = +d.min_reply_time;
      d.max_reply_time = +d.max_reply_time;
      d.median_reply_time = +d.median_reply_time;
      d.error_rate = +d.error_rate;
      d.query_count = +d.query_count;
    });

    x.domain(d3.extent(data, (d) => d.hour));

    metrics.forEach((metric) => {
      const metricExtent = d3.extent(data, (d) => d[metric.key]);
      const y = d3.scaleLinear().domain(metricExtent).range([height, 0]).nice();

      const lineGen = d3
        .line()
        .x((d) => x(d.hour))
        .y((d) => y(d[metric.key]));

      svg
        .append("path")
        .datum(data)
        .attr("class", `line metric-${metric.key}`)
        .attr("d", lineGen)
        .attr("stroke", metric.color);

      svg
        .selectAll(`.dot-${metric.key}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `dot metric-${metric.key}`)
        .attr("cx", (d) => x(d.hour))
        .attr("cy", (d) => y(d[metric.key]))
        .attr("r", 5)
        .attr("fill", "transparent")
        .attr("opacity", 0)
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>${metric.label}</strong><br>Hour: ${d3.timeFormat(
                "%Y-%m-%d %H:%M"
              )(d.hour)}<br>Value: ${metric.format(d[metric.key])}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });
    });

    svg
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    const toggleContainer = d3.select("#toggle-controls");
    metrics.forEach((metric) => {
      const label = toggleContainer
        .append("label")
        .attr("for", "toggle-" + metric.key);
      label
        .append("input")
        .attr("type", "checkbox")
        .attr("id", "toggle-" + metric.key)
        .property("checked", true)
        .on("change", function () {
          const isChecked = this.checked;
          d3.selectAll(".metric-" + metric.key).style(
            "display",
            isChecked ? null : "none"
          );
        });
      label
        .append("span")
        .attr("class", "legend-color")
        .style("background-color", metric.color);
      label.append("span").text(" " + metric.label);
    });
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });
