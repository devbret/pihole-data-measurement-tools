(async function () {
  const $chart = document.getElementById("chart");
  const width = $chart.clientWidth;
  const height = $chart.clientHeight;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  const gZoom = svg.append("g").attr("class", "zoom-layer");
  const tooltip = d3.select("#tooltip");

  const $searchDomain = document.getElementById("searchDomain");
  const $clientSelect = document.getElementById("clientSelect");
  const $minEdge = document.getElementById("minEdge");
  const $minEdgeVal = document.getElementById("minEdgeVal");
  const $maxNodes = document.getElementById("maxNodes");
  const $maxNodesVal = document.getElementById("maxNodesVal");
  const $strength = document.getElementById("strength");
  const $strengthVal = document.getElementById("strengthVal");
  const $linkDist = document.getElementById("linkDist");
  const $linkDistVal = document.getElementById("linkDistVal");
  const $labelMode = document.getElementById("labelMode");
  const $linkOpacity = document.getElementById("linkOpacity");
  const $linkOpacityVal = document.getElementById("linkOpacityVal");

  const $resetView = document.getElementById("resetView");
  const $reheat = document.getElementById("reheat");
  const $exportPNG = document.getElementById("exportPNG");
  const $clearFocusBtn = document.getElementById("clearFocusBtn");
  const $clearSearchBtn = document.getElementById("clearSearchBtn");

  const $selEmpty = document.getElementById("selectionEmpty");
  const $selWrap = document.getElementById("selection");
  const $selDomain = document.getElementById("selDomain");
  const $selCount = document.getElementById("selCount");
  const $selIn = document.getElementById("selIn");
  const $selOut = document.getElementById("selOut");
  const $predList = document.getElementById("predList");
  const $succList = document.getElementById("succList");
  const $sparkline = document.getElementById("sparkline");
  const $sessionsList = document.getElementById("sessionsList");
  const $sessionLimitLabel = document.getElementById("sessionLimitLabel");
  const $focusBtn = document.getElementById("focusBtn");
  const $centerNodeBtn = document.getElementById("centerNodeBtn");
  const $headerStats = document.getElementById("headerStats");

  const transitions = await d3.json("out/transitions.json");
  const sessions = await d3.json("out/sessions.json").catch(() => []);
  const byClient = await d3
    .json("out/transitions_by_client.json")
    .catch(() => null);

  const clients = Array.from(new Set(sessions.map((d) => d.client))).sort();
  clients.forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    $clientSelect.appendChild(o);
  });

  const domainToSessions = new Map();
  sessions.forEach((s) => {
    if (!Array.isArray(s.domains)) return;
    s.domains.forEach((dom) => {
      if (!domainToSessions.has(dom)) domainToSessions.set(dom, []);
      domainToSessions.get(dom).push(s);
    });
  });

  const totalQueries = d3.sum(transitions.nodes, (d) => d.count);
  const totalDomains = transitions.nodes.length;
  const totalLinks = transitions.links.length;
  const totalSessions = sessions.length;
  const totalClients = clients.length;

  $headerStats.innerHTML = `
    <div class="stat-pill"><span>Domains</span><b>${totalDomains.toLocaleString()}</b></div>
    <div class="stat-pill"><span>Transitions</span><b>${totalLinks.toLocaleString()}</b></div>
    <div class="stat-pill"><span>Queries</span><b>${(
      totalQueries || 0
    ).toLocaleString()}</b></div>
    <div class="stat-pill"><span>Clients</span><b>${totalClients.toLocaleString()}</b></div>
    <div class="stat-pill"><span>Sessions</span><b>${totalSessions.toLocaleString()}</b></div>
  `;

  const zoom = d3
    .zoom()
    .scaleExtent([0.2, 8])
    .on("zoom", (event) => gZoom.attr("transform", event.transform));
  svg.call(zoom);

  let focusNodeId = null;
  let selectedNode = null;
  let sim = null;

  const getId = (x) => (typeof x === "object" ? x.id : x);

  const cloneLinks = (links) =>
    links.map((l) => ({
      source: getId(l.source),
      target: getId(l.target),
      value: l.value,
    }));

  function getActiveTransitions() {
    const client = $clientSelect.value;
    if (client !== "__all__" && byClient) {
      const edges = byClient[client] || [];

      const domainToId = new Map(
        transitions.nodes.map((n) => [n.domain, n.id])
      );

      const links = edges
        .map((e) => ({
          source: domainToId.get(e.source),
          target: domainToId.get(e.target),
          value: e.value,
        }))
        .filter((e) => e.source != null && e.target != null);

      return { nodes: transitions.nodes, links };
    }
    return transitions;
  }

  function buildGraph() {
    const active = getActiveTransitions();
    const minEdge = +$minEdge.value;
    const maxNodes = +$maxNodes.value;
    const q = $searchDomain.value.trim().toLowerCase();

    let links = cloneLinks(active.links || transitions.links).filter(
      (l) => l.value >= minEdge
    );

    const degree = new Map();
    links.forEach((l) => {
      degree.set(l.source, (degree.get(l.source) || 0) + l.value);
      degree.set(l.target, (degree.get(l.target) || 0) + l.value);
    });

    let nodes = transitions.nodes
      .map((n) => ({ ...n }))
      .filter((n) => degree.has(n.id));

    if (q) {
      const matches = new Set(
        nodes.filter((n) => n.domain.includes(q)).map((n) => n.id)
      );
      const neighbors = new Set();
      links.forEach((l) => {
        if (matches.has(l.source) || matches.has(l.target)) {
          neighbors.add(l.source);
          neighbors.add(l.target);
        }
      });
      const keep = new Set([...matches, ...neighbors]);
      nodes = nodes.filter((n) => keep.has(n.id));
      links = links.filter((l) => keep.has(l.source) && keep.has(l.target));
    }

    if (focusNodeId != null) {
      const keep = new Set([focusNodeId]);
      links.forEach((l) => {
        if (l.source === focusNodeId || l.target === focusNodeId) {
          keep.add(l.source);
          keep.add(l.target);
        }
      });
      nodes = nodes.filter((n) => keep.has(n.id));
      links = links.filter((l) => keep.has(l.source) && keep.has(l.target));
    }

    nodes.sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0));
    nodes = nodes.slice(0, maxNodes);
    const keepIds = new Set(nodes.map((n) => n.id));
    links = links.filter((l) => keepIds.has(l.source) && keepIds.has(l.target));

    const inW = new Map(),
      outW = new Map();
    links.forEach((l) => {
      outW.set(l.source, (outW.get(l.source) || 0) + l.value);
      inW.set(l.target, (inW.get(l.target) || 0) + l.value);
    });

    nodes.forEach((n) => {
      n.in = inW.get(n.id) || 0;
      n.out = outW.get(n.id) || 0;
      n.balance = (n.out - n.in) / Math.max(1, n.in + n.out);
      n.degree = degree.get(n.id) || 0;
    });

    return { nodes, links };
  }

  function render() {
    const graph = buildGraph();

    if (!graph.nodes.length || !graph.links.length) {
      gZoom.selectAll("*").remove();

      gZoom
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(230,237,243,0.8)")
        .attr("font-size", 14)
        .text("No data matches these filters.");

      if (sim) sim.stop();
      return;
    }

    gZoom.selectAll("*").remove();

    const linkOpacity = +$linkOpacity.value;

    const linkScale = d3
      .scaleSqrt()
      .domain(d3.extent(graph.links, (d) => d.value))
      .range([0.6, 7]);

    const nodeScale = d3
      .scaleSqrt()
      .domain(d3.extent(graph.nodes, (d) => d.count))
      .range([3, 24]);

    const color = d3.scaleDiverging(d3.interpolatePuOr).domain([-1, 0, 1]);

    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "glow");
    glow
      .append("feGaussianBlur")
      .attr("stdDeviation", "3.2")
      .attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const link = gZoom
      .append("g")
      .attr("stroke", "rgba(125,211,252,0.25)")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(graph.links)
      .join("line")
      .attr("stroke-width", (d) => linkScale(d.value))
      .attr("opacity", linkOpacity);

    const node = gZoom
      .append("g")
      .selectAll("circle")
      .data(graph.nodes, (d) => d.id)
      .join("circle")
      .attr("r", (d) => nodeScale(d.count))
      .attr("fill", (d) => color(d.balance))
      .attr("stroke", (d) =>
        d.id === focusNodeId ? "white" : "rgba(230,237,243,0.25)"
      )
      .attr("stroke-width", (d) => (d.id === focusNodeId ? 2.2 : 1))
      .attr("filter", (d) =>
        d.degree >
        d3.quantile(graph.nodes.map((n) => n.degree).sort(d3.ascending), 0.95)
          ? "url(#glow)"
          : null
      )
      .style("cursor", "grab");

    const labelMode = $labelMode.value;
    const degreeSorted = graph.nodes.map((d) => d.degree).sort(d3.ascending);
    const topCut =
      labelMode === "auto" ? d3.quantile(degreeSorted, 0.8) : -Infinity;

    const label = gZoom
      .append("g")
      .selectAll("text")
      .data(graph.nodes, (d) => d.id)
      .join("text")
      .text((d) =>
        d.domain.length > 30 ? d.domain.slice(0, 27) + "…" : d.domain
      )
      .attr("font-size", 11)
      .attr("fill", "rgba(230,237,243,0.92)")
      .attr("paint-order", "stroke")
      .attr("stroke", "#04090f")
      .attr("stroke-width", 3)
      .attr("pointer-events", "none")
      .attr("opacity", (d) => {
        if (labelMode === "none") return 0;
        if (labelMode === "all") return 1;
        return d.degree >= topCut ? 1 : 0;
      });

    const strength = +$strength.value;
    const linkDist = +$linkDist.value;
    sim = d3
      .forceSimulation(graph.nodes)
      .force(
        "link",
        d3
          .forceLink(graph.links)
          .id((d) => d.id)
          .distance(linkDist)
          .strength(0.12 + strength * 0.25)
      )
      .force("charge", d3.forceManyBody().strength(-70 - strength * 170))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide().radius((d) => nodeScale(d.count) + 3)
      )
      .on("tick", ticked);

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label.attr("x", (d) => d.x + 8).attr("y", (d) => d.y + 4);
    }

    node
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
          })
      )
      .on("dblclick", (event, d) => {
        d.fx = null;
        d.fy = null;
        sim.alpha(0.4).restart();
      });

    node
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1).html(`
          <div class="t1 mono">${d.domain}</div>
          <div class="muted">queries: <b>${d.count}</b></div>
          <div class="muted">in: ${d.in} &nbsp; out: ${d.out}</div>
          <div class="muted">degree: ${d.degree}</div>
          <div class="muted">balance: ${(d.balance * 100).toFixed(1)}%</div>
        `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.offsetX + "px")
          .style("top", event.offsetY + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .on("click", (event, d) => {
        selectedNode = d;
        if (event.shiftKey) {
          focusNodeId = d.id;
          render();
          updateSelection(d);
          return;
        }
        updateSelection(d, graph);
      });

    if (focusNodeId != null) {
      link
        .attr("stroke", (l) =>
          l.source.id === focusNodeId || l.target.id === focusNodeId
            ? "rgba(167,139,250,0.75)"
            : "rgba(125,211,252,0.12)"
        )
        .attr("opacity", (l) =>
          l.source.id === focusNodeId || l.target.id === focusNodeId ? 1 : 0.28
        );

      node.attr("opacity", (n) => {
        const neighbor = graph.links.some(
          (l) =>
            (l.source.id === focusNodeId && l.target.id === n.id) ||
            (l.target.id === focusNodeId && l.source.id === n.id)
        );
        return n.id === focusNodeId || neighbor ? 1 : 0.35;
      });
      label.attr("opacity", (n) => node.attr("opacity"));
    }

    if (selectedNode) {
      const still = graph.nodes.find((n) => n.id === selectedNode.id);
      updateSelection(still || selectedNode, graph);
    }
  }

  function updateSelection(d, graphOverride = null) {
    if (!d) return;
    const graph = graphOverride || buildGraph();
    const domain = d.domain;

    $selEmpty.style.display = "none";
    $selWrap.style.display = "block";

    $selDomain.textContent = domain;
    $selCount.textContent = d.count ?? "—";
    $selIn.textContent = d.in ?? "—";
    $selOut.textContent = d.out ?? "—";

    const pred = new Map(),
      succ = new Map();
    graph.links.forEach((l) => {
      if (l.target.id === d.id)
        pred.set(l.source.domain, (pred.get(l.source.domain) || 0) + l.value);
      if (l.source.id === d.id)
        succ.set(l.target.domain, (succ.get(l.target.domain) || 0) + l.value);
    });

    const predTop = Array.from(pred.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const succTop = Array.from(succ.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    $predList.innerHTML =
      predTop
        .map(
          ([name, val]) => `
      <div class="item">
        <div class="name mono">${name}</div>
        <div class="val">${val}</div>
      </div>
    `
        )
        .join("") ||
      `<div class="small">No predecessors in current filter.</div>`;

    $succList.innerHTML =
      succTop
        .map(
          ([name, val]) => `
      <div class="item">
        <div class="name mono">${name}</div>
        <div class="val">${val}</div>
      </div>
    `
        )
        .join("") ||
      `<div class="small">No successors in current filter.</div>`;

    const client = $clientSelect.value;
    let sList = domainToSessions.get(domain) || [];
    if (client !== "__all__") sList = sList.filter((s) => s.client === client);

    const seen = new Set();
    sList = sList.filter((s) => {
      const key =
        s.id ?? `${s.client}|${s.start}|${s.end}|${s.domains?.length}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const scored = sList
      .map((s) => {
        const idxs = [];
        s.domains.forEach((dd, i) => {
          if (dd === domain) idxs.push(i);
        });
        const occurrences = idxs.length;
        const span = occurrences > 1 ? idxs[idxs.length - 1] - idxs[0] + 1 : 1;
        const compactness = occurrences / span;
        const score =
          occurrences * 2 + compactness + Math.log(1 + s.domains.length);
        return { s, occurrences, compactness, score };
      })
      .sort((a, b) => b.score - a.score);

    const limit = 8;
    $sessionLimitLabel.textContent = limit;
    $sessionsList.innerHTML = "";
    scored.slice(0, limit).forEach(({ s, occurrences }) => {
      const card = document.createElement("div");
      card.className = "session-card";
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${s.client} • ${new Date(
        s.start
      ).toLocaleString()} → ${new Date(s.end).toLocaleTimeString()} • ${
        s.domains.length
      } steps • ${occurrences} hits`;
      const ol = document.createElement("ol");
      s.domains.forEach((dom) => {
        const li = document.createElement("li");
        li.textContent = dom;
        if (dom === domain) li.classList.add("hl");
        ol.appendChild(li);
      });
      card.appendChild(meta);
      card.appendChild(ol);
      $sessionsList.appendChild(card);
    });

    renderSparkline(scored.map((x) => x.s));

    const selId = d.id;
    gZoom
      .selectAll("circle")
      .attr("stroke-width", (n) =>
        n.id === selId ? 2.8 : n.id === focusNodeId ? 2.2 : 1
      )
      .attr("stroke", (n) =>
        n.id === selId
          ? "white"
          : n.id === focusNodeId
          ? "white"
          : "rgba(230,237,243,0.25)"
      );

    gZoom
      .selectAll("line")
      .attr("stroke", (l) =>
        l.source.id === selId || l.target.id === selId
          ? "rgba(125,211,252,0.95)"
          : focusNodeId != null &&
            (l.source.id === focusNodeId || l.target.id === focusNodeId)
          ? "rgba(167,139,250,0.75)"
          : "rgba(125,211,252,0.12)"
      )
      .attr("opacity", (l) =>
        l.source.id === selId || l.target.id === selId ? 1 : 0.4
      );
  }

  function renderSparkline(sessionList) {
    $sparkline.innerHTML = "";
    if (!sessionList.length) {
      $sparkline.innerHTML = `<div class="small" style="padding:8px;">No sessions in current filter.</div>`;
      return;
    }

    const starts = sessionList.map((s) => new Date(s.start));
    const extent = d3.extent(starts);
    const bins = d3.bin().domain(extent).thresholds(d3.timeHour.every(6))(
      starts
    );

    const w = $sparkline.clientWidth;
    const h = $sparkline.clientHeight;

    const ssvg = d3
      .select($sparkline)
      .append("svg")
      .attr("viewBox", [0, 0, w, h]);

    const x = d3
      .scaleTime()
      .domain(extent)
      .range([6, w - 6]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (b) => b.length)])
      .nice()
      .range([h - 8, 6]);

    const line = d3
      .line()
      .x((d) => x(d.x0))
      .y((d) => y(d.length))
      .curve(d3.curveMonotoneX);

    ssvg
      .append("path")
      .datum(bins)
      .attr("fill", "none")
      .attr("stroke", "rgba(125,211,252,0.9)")
      .attr("stroke-width", 2)
      .attr("d", line);

    ssvg
      .selectAll("circle")
      .data(bins)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.x0))
      .attr("cy", (d) => y(d.length))
      .attr("r", 2.6)
      .attr("fill", "rgba(167,139,250,0.9)");

    ssvg
      .append("line")
      .attr("x1", 6)
      .attr("x2", w - 6)
      .attr("y1", h - 8)
      .attr("y2", h - 8)
      .attr("stroke", "rgba(159,176,192,0.25)");
  }

  function syncLabels() {
    $minEdgeVal.textContent = $minEdge.value;
    $maxNodesVal.textContent = $maxNodes.value;
    $strengthVal.textContent = $strength.value;
    $linkDistVal.textContent = $linkDist.value;
    $linkOpacityVal.textContent = $linkOpacity.value;
  }
  syncLabels();

  [
    $searchDomain,
    $clientSelect,
    $minEdge,
    $maxNodes,
    $strength,
    $linkDist,
    $labelMode,
    $linkOpacity,
  ].forEach((el) => {
    el.addEventListener("input", () => {
      syncLabels();
      render();
    });
    el.addEventListener("change", () => {
      syncLabels();
      render();
    });
  });

  $resetView.addEventListener("click", () => {
    svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
  });
  $reheat.addEventListener("click", () => {
    if (sim) sim.alpha(0.9).restart();
  });

  $clearFocusBtn.addEventListener("click", () => {
    focusNodeId = null;
    render();
  });
  $clearSearchBtn.addEventListener("click", () => {
    $searchDomain.value = "";
    render();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      focusNodeId = null;
      selectedNode = null;
      $searchDomain.value = "";
      $selWrap.style.display = "none";
      $selEmpty.style.display = "block";
      render();
    }
  });

  $focusBtn.addEventListener("click", () => {
    if (!selectedNode) return;
    focusNodeId = selectedNode.id;
    render();
  });

  $centerNodeBtn.addEventListener("click", () => {
    if (!selectedNode) return;
    const t = d3.zoomTransform(svg.node());
    const scale = t.k;
    const x = selectedNode.x,
      y = selectedNode.y;
    const translate = d3.zoomIdentity
      .translate(width / 2 - x * scale, height / 2 - y * scale)
      .scale(scale);
    svg.transition().duration(350).call(zoom.transform, translate);
  });

  $exportPNG.addEventListener("click", () => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg.node());
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor || "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = "dns-markov-explorer.png";
      a.click();
    };
    img.src = url;
  });

  render();
})();
