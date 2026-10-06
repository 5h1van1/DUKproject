const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 3000;
const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Identity-Aware Network Attack Graph - All Attack Paths Dashboard</title>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
        header { background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid #334155; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        header h1 { font-size: 1.3rem; font-weight: 700; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        header .stats-badge { font-size: 0.85rem; background: #1e293b; padding: 0.4rem 0.8rem; border-radius: 9999px; border: 1px solid #475569; display: flex; gap: 1rem; }
        header .stats-badge span { color: #38bdf8; font-weight: 600; }
        
        .main-container { flex: 1; display: flex; height: calc(100vh - 65px); }
        .sidebar { width: 380px; background: #1e293b; border-right: 1px solid #334155; display: flex; flex-direction: column; overflow-y: auto; }
        .sidebar-header { padding: 1rem; border-bottom: 1px solid #334155; }
        .sidebar-header h2 { font-size: 1rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .path-list { flex: 1; overflow-y: auto; padding: 0.5rem; }
        .path-card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 0.8rem; margin-bottom: 0.6rem; cursor: pointer; transition: all 0.2s ease; }
        .path-card:hover, .path-card.active { border-color: #38bdf8; background: #1e293b; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15); }
        .path-card .card-title { font-size: 0.85rem; font-weight: 600; color: #f8fafc; display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
        .path-card .badge { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; }
        .badge-dc { background: #7f1d1d; color: #fca5a5; border: 1px solid #ef4444; }
        .badge-comp { background: #1e3a8a; color: #93c5fd; border: 1px solid #3b82f6; }
        .path-card .sequence { font-size: 0.75rem; color: #94a3b8; line-height: 1.4; word-break: break-all; }
        
        .viewport { flex: 1; position: relative; background: #0b0f19; }
        #network-graph { width: 100%; height: 100%; }
        
        .legend { position: absolute; bottom: 20px; right: 20px; background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(8px); border: 1px solid #334155; padding: 0.8rem 1.2rem; border-radius: 12px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.4rem; }
        .legend-item { display: flex; align-items: center; gap: 0.6rem; }
        .legend-color { width: 12px; height: 12px; border-radius: 50%; }

        .details-overlay { position: absolute; top: 20px; right: 20px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border: 1px solid #334155; border-radius: 12px; padding: 1.2rem; width: 340px; display: none; max-height: 400px; overflow-y: auto; }
        .details-overlay h3 { font-size: 0.95rem; margin-bottom: 0.6rem; color: #38bdf8; }
        .details-overlay p { font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.4rem; }
        .details-overlay ul { list-style: none; font-size: 0.78rem; color: #94a3b8; }
        .details-overlay li { padding: 0.3rem 0; border-bottom: 1px solid #1e293b; }
    </style>
</head>
<body>
    <header>
        <h1>IDENTITY-AWARE ATTACK GRAPH — ALL ATTACK PATHS</h1>
        <div class="stats-badge">
            <div>Sources: <span id="stat-sources">0</span></div>
            <div>Victims: <span id="stat-victims">0</span></div>
            <div>Total Paths: <span id="stat-paths">0</span></div>
            <div>DC Paths: <span id="stat-dc-paths">0</span></div>
        </div>
    </header>
    
    <div class="main-container">
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>All Discovered Attack Paths</h2>
            </div>
            <div class="path-list" id="path-list">
                <!-- Dynamically populated -->
            </div>
        </div>
        
        <div class="viewport">
            <div id="network-graph"></div>
            
            <div class="details-overlay" id="details-overlay">
                <h3 id="overlay-title">Path Steps</h3>
                <div id="overlay-content"></div>
            </div>

            <div class="legend">
                <div class="legend-item"><div class="legend-color" style="background:#ef4444;"></div> Initial Entry / Source Host</div>
                <div class="legend-item"><div class="legend-color" style="background:#3b82f6;"></div> Network Host</div>
                <div class="legend-item"><div class="legend-color" style="background:#f59e0b;"></div> Active Directory Computer</div>
                <div class="legend-item"><div class="legend-color" style="background:#8b5cf6;"></div> Domain Controller (DC)</div>
                <div class="legend-item"><div class="legend-color" style="background:#ec4899;"></div> Vulnerability (CVE)</div>
                <div class="legend-item"><div class="legend-color" style="background:#10b981;"></div> RUNS_ON Identity Link</div>
            </div>
        </div>
    </div>

    <script>
        let allPathsData = null;
        let fusedGraphData = null;
        let network = null;

        async function init() {
            const [pathsRes, fusedRes] = await Promise.all([
                fetch('/api/paths'),
                fetch('/api/fused-graph')
            ]);
            allPathsData = await pathsRes.json();
            fusedGraphData = await fusedRes.json();

            document.getElementById('stat-sources').innerText = allPathsData.summary.total_sources_evaluated;
            document.getElementById('stat-victims').innerText = allPathsData.summary.total_victims_evaluated;
            document.getElementById('stat-paths').innerText = allPathsData.summary.total_paths_found;
            document.getElementById('stat-dc-paths').innerText = allPathsData.summary.paths_to_dc_count;

            renderPathList();
            renderFullGraph();
        }

        function renderPathList() {
            const container = document.getElementById('path-list');
            container.innerHTML = '';

            allPathsData.paths.forEach((p, idx) => {
                const card = document.createElement('div');
                card.className = 'path-card';
                const isDC = p.target_label.includes('Domain Controller');
                card.innerHTML = \`
                    <div class="card-title">
                        <span>Path #\${p.path_id} (\${p.hop_length} hops)</span>
                        <span class="badge \${isDC ? 'badge-dc' : 'badge-comp'}">\${isDC ? 'DC VICTIM' : 'VICTIM'}</span>
                    </div>
                    <div class="sequence">\${p.source_node} &rarr; \${p.target_node}</div>
                \`;
                card.onclick = () => highlightPath(p, card);
                container.appendChild(card);
            });
        }

        function getNodeColor(node) {
            if (node.initial_condition === "YES") return '#ef4444';
            if (node.is_dc === true) return '#8b5cf6';
            if (node.type === "ADComputer") return '#f59e0b';
            if (node.type === "NetworkHost") return '#3b82f6';
            if (node.type === "CVE") return '#ec4899';
            return '#64748b';
        }

        function renderFullGraph() {
            if (typeof vis === 'undefined') {
                document.getElementById('network-graph').innerHTML = '<div style="color:#ef4444; padding:2rem; font-size:1.1rem;">Vis.js library loading failed. Please check internet connection or CDN availability.</div>';
                return;
            }

            const rawEdges = fusedGraphData.links || fusedGraphData.edges || [];

            const nodes = fusedGraphData.nodes.map(n => ({
                id: n.id,
                label: n.id,
                color: { background: getNodeColor(n), border: '#ffffff' },
                font: { color: '#ffffff', family: 'Outfit', size: 12 },
                shape: n.type === 'CVE' ? 'diamond' : 'dot',
                size: n.is_dc ? 28 : (n.type === 'ADComputer' || n.type === 'NetworkHost' ? 20 : 12)
            }));

            const edges = rawEdges.map(e => ({
                from: e.source,
                to: e.target,
                label: e.relationship || e.connection || '',
                color: e.relationship === 'RUNS_ON' || e.relationship === 'HOSTS_IDENTITY' ? '#10b981' : '#475569',
                arrows: 'to',
                width: e.relationship === 'RUNS_ON' || e.relationship === 'HOSTS_IDENTITY' ? 3 : 1
            }));

            const container = document.getElementById('network-graph');
            const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
            const options = {
                nodes: { borderWidth: 2 },
                edges: { smooth: { type: 'continuous' } },
                physics: {
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: { gravitationalConstant: -35, centralGravity: 0.01, springLength: 120, springConstant: 0.08 },
                    stabilization: { iterations: 150 }
                },
                interaction: { hover: true, tooltipDelay: 200, zoomView: true, dragView: true }
            };

            network = new vis.Network(container, data, options);
            
            // Auto fit graph in container after stabilization
            network.once('stabilizationIterationsDone', function() {
                network.fit();
            });
        }

        function highlightPath(pathObj, cardElement) {
            document.querySelectorAll('.path-card').forEach(c => c.classList.remove('active'));
            cardElement.classList.add('active');

            const pathNodes = new Set(pathObj.path_nodes);
            const pathNodeSeq = pathObj.path_nodes;

            // Compute path edges
            const pathEdgeKeys = new Set();
            for (let i = 0; i < pathNodeSeq.length - 1; i++) {
                pathEdgeKeys.add(\`\${pathNodeSeq[i]}->\${pathNodeSeq[i+1]}\`);
            }

            const updatedNodes = fusedGraphData.nodes.map(n => {
                const inPath = pathNodes.has(n.id);
                return {
                    id: n.id,
                    label: n.id,
                    color: {
                        background: inPath ? getNodeColor(n) : '#1e293b',
                        border: inPath ? '#38bdf8' : '#334155'
                    },
                    font: { color: inPath ? '#ffffff' : '#475569' },
                    opacity: inPath ? 1.0 : 0.25,
                    size: inPath ? (n.is_dc ? 28 : 22) : 10
                };
            });

            const updatedEdges = fusedGraphData.links.map(e => {
                const key = \`\${e.source}->\${e.target}\`;
                const inPath = pathEdgeKeys.has(key);
                return {
                    from: e.source,
                    to: e.target,
                    label: e.relationship || e.connection || '',
                    color: inPath ? '#ef4444' : '#1e293b',
                    width: inPath ? 4 : 1,
                    arrows: 'to'
                };
            });

            network.setData({ nodes: new vis.DataSet(updatedNodes), edges: new vis.DataSet(updatedEdges) });

            // Display step details
            const overlay = document.getElementById('details-overlay');
            const content = document.getElementById('overlay-content');
            overlay.style.display = 'block';

            let html = \`<p><strong>Source:</strong> \${pathObj.source_node}</p>\`;
            html += \`<p><strong>Target Victim:</strong> \${pathObj.target_node}</p>\`;
            html += \`<p><strong>Total Hops:</strong> \${pathObj.hop_length}</p><ul style="margin-top:0.6rem;">\`;

            pathObj.path_steps.forEach(s => {
                html += \`<li>Step \${s.step}: <strong>\${s.from_node}</strong> &rarr; <span style="color:#10b981;">[\${s.relationship}]</span> &rarr; <strong>\${s.to_node}</strong></li>\`;
            });
            html += '</ul>';
            content.innerHTML = html;
        }

        init();
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    } else if (req.url === '/api/paths') {
        const pathsFile = path.join(OUTPUTS_DIR, 'all_attack_paths.json');
        if (fs.existsSync(pathsFile)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            fs.createReadStream(pathsFile).pipe(res);
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "all_attack_paths.json not found" }));
        }
    } else if (req.url === '/api/fused-graph') {
        const graphFile = path.join(OUTPUTS_DIR, 'fused_attack_graph.json');
        if (fs.existsSync(graphFile)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            fs.createReadStream(graphFile).pipe(res);
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "fused_attack_graph.json not found" }));
        }
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`Attack Graph Interactive Visualizer Server running at http://localhost:${PORT}/`);
});
