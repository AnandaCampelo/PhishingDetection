# PhishingDetection

Sistema completo de detecção de phishing com análise heurística e interface web interativa.

[Phishing Detector Website](https://phishing-detection-khaki.vercel.app/)

---

## Visão geral

* **Backend:** FastAPI + Uvicorn → hospedado no Railway.
* **Frontend:** HTML + CSS + JS puro → hospedado no Vercel.
* **Funcionalidades:**

  * Análise heurística completa (WHOIS, SSL, DNS, etc.).
  * Consulta a listas de phishing (OpenPhish).
  * Indicador verde/vermelho.
  * Gráfico de similaridade.
  * Exportação de histórico em CSV.

---

## Tecnologias usadas

* **Backend:** Python 3.12, FastAPI, Uvicorn, Requests, BeautifulSoup, Python-Levenshtein
* **Frontend:** HTML, CSS, JavaScript, Chart.js
* **Hospedagem:**

  * Backend → Railway
  * Frontend → Vercel

---

## Estrutura do projeto

```
PhishingDetection/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── main.py
│   ├── detection.py
│   └── requirements.txt
└── .gitignore
```

---

## Passos para deploy

### Backend no Railway

1. **Root Directory:** `backend/`
2. **Start Command:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. **requirements.txt** na pasta `backend/` com:

```
fastapi
uvicorn
requests
beautifulsoup4
python-whois
python-Levenshtein
```

4. **Public Networking:** ativar → porta `8000`.
5. Railway irá gerar uma **URL pública**, ex.:

```
https://phishingdetection-production.up.railway.app
```

### Frontend no Vercel

1. Subir `frontend/` no GitHub.
2. Conectar no Vercel → "New Project".
3. Configurar:

   * **Root Directory:** `frontend/`
   * **Framework:** Other → Static Site
4. Deploy → será gerado:

```
https://phishing-detection.vercel.app
```

---

## Como usar

1. Acesse o frontend.
2. Insira uma URL e clique em "Analyze".
3. Veja o resultado:

   * JSON detalhado.
   * Tabela com explicações.
   * Indicador verde/vermelho.
   * Gráfico de similaridade.
4. Exporte o histórico via botão "Export CSV".

---

## Funcionalidades principais

* Análise de WHOIS → idade do domínio.
* Verificação de DNS dinâmico.
* Análise de certificados SSL.
* Redirecionamentos suspeitos.
* Similaridade com domínios famosos.
* Detecção de formulários sensíveis.
* Indicador verde/vermelho.
* Dashboard interativo.
* Exportação de CSV.

---

## Diagrama de arquitetura

**Usuário → Frontend (Vercel) → Backend (Railway) → Análises → Resposta**

```
[Usuário] → [Vercel: Frontend] → [Railway: FastAPI Backend]
                                    ↑
                                    → WHOIS, SSL, DNS, OpenPhish
```

---

Por: Ananda Campelo
