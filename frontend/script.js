let history = [];
let myChart = null;

async function analyze() {
    const url = document.getElementById('urlInput').value;

    if (!url) {
        alert("Por favor, insira uma URL.");
        return;
    }

    document.getElementById('loader').classList.add('show');

    try {
        const res = await fetch(`http://127.0.0.1:8000/analyze?url=${encodeURIComponent(url)}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        updateIndicator(data.results.openphish);
        updateTable(data.results);

        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        history.push(data.url);
        updateHistory();
        drawChart(data.results.similarity);

    } catch (error) {
        console.error("Erro na análise:", error);
        alert("Erro ao conectar com o backend. Veja o console.");
    } finally {
        document.getElementById('loader').classList.remove('show');
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('history');
    if (history.length === 0) {
        historyDiv.innerHTML = "";
        return;
    }

    historyDiv.innerHTML = "<h3>Histórico</h3><ul>" + 
        history.map(url => `<li>${url}</li>`).join('') + "</ul>";
}

function drawChart(similarity) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Destroi gráfico anterior, se existir e for um Chart
    if (myChart && typeof myChart.destroy === 'function') {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(similarity),
            datasets: [{
                label: 'Similarity Score',
                data: Object.values(similarity),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updateIndicator(isPhishing) {
    const indicator = document.getElementById('indicator');
    if (isPhishing) {
        indicator.textContent = "⚠️ Malicious site detected!";
        indicator.style.color = "red";
    } else {
        indicator.textContent = "✅ Safe site.";
        indicator.style.color = "green";
    }
}

function exportCSV() {
    fetch('http://127.0.0.1:8000/export')
        .then(response => {
            if (response.ok) {
                window.location.href = 'http://127.0.0.1:8000/export';
            } else {
                alert("Erro ao exportar CSV.");
            }
        })
        .catch(err => {
            console.error("Erro ao exportar:", err);
            alert("Erro ao exportar CSV.");
        });
}

function resetHistory() {
    history = [];
    updateHistory();
    document.getElementById('result').textContent = "";
    if (myChart && typeof myChart.destroy === 'function') {
        myChart.destroy();
    }
}

function updateTable(results) {
    const table = document.getElementById('resultTable');
    table.innerHTML = "<tr><th>Feature</th><th>Value</th><th>Explanation</th></tr>";

    for (const key in results) {
        let explanation = getExplanation(key, results[key]);

        let value = typeof results[key] === 'object' ? JSON.stringify(results[key], null, 2) : results[key];

        table.innerHTML += `<tr>
            <td style="border: 1px solid #444; padding: 8px;">${key}</td>
            <td style="border: 1px solid #444; padding: 8px;">${value}</td>
            <td style="border: 1px solid #444; padding: 8px;">${explanation}</td>
        </tr>`;
    }
}

function getExplanation(key, value) {
    switch(key) {
        case 'openphish':
            return value ? "Esta URL está listada como phishing!" : "Nenhum registro de phishing.";
        case 'whois':
            return "Data de criação do domínio. Idade recente pode indicar risco.";
        case 'dns_dynamic':
            return value ? "Usa DNS dinâmico — risco potencial." : "DNS estável.";
        case 'ssl':
            return "Emissor e validade do certificado SSL.";
        case 'redirects':
            return value.length > 0 ? "Redirecionamentos detectados — pode indicar phishing." : "Sem redirecionamentos.";
        case 'similarity':
            return "Similaridade com domínios famosos. Valores altos são suspeitos.";
        case 'html_content':
            return value.sensitive_info ? "Formulário sensível detectado — potencial phishing." : "Nenhum conteúdo sensível.";
        default:
            return "";
    }
}