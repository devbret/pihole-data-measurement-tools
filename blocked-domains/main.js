const jsonFile = "tlds_blocked_counts.json";

fetch(jsonFile)
  .then((response) => response.json())
  .then((data) => {
    const values = Object.values(data);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const wordData = Object.keys(data).map((key) => ({
      text: key,
      size: 10 + ((data[key] - minValue) / (maxValue - minValue)) * (100 - 10),
      value: data[key],
    }));

    generateWordCloud(wordData);
  })
  .catch((error) => console.error("Error loading the JSON file:", error));

function generateWordCloud(data) {
  var svg = d3.select("svg"),
    width = document.body.clientWidth,
    height = document.body.clientHeight;

  var tooltip = d3.select("body").append("div").attr("class", "tooltip");

  var layout = d3.layout
    .cloud()
    .size([width, height])
    .words(data)
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .font("Impact")
    .fontSize((d) => d.size)
    .on("end", draw);

  layout.start();

  function draw(words) {
    svg
      .attr("width", layout.size()[0])
      .attr("height", layout.size()[1])
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (d) => d.size + "px")
      .style("font-family", "Impact")
      .style("fill", (d, i) => d3.schemeCategory10[i % 10])
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
      )
      .text((d) => d.text)
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html("TLD: " + d.text + "<br>" + "Blocked: " + d.value + " times")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  }
}
