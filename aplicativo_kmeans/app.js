/**
 * Simulador K-Means Reumatológico en Bailarines (~30 años)
 * Cohorte Específica: Desgaste Óseo Severo en Bailarines de Alta Exigencia
 * Diagnóstico Diferencial: Artrosis Ocupacional vs. Artritis Reumatoide Autoinmune
 * Variables Clínicas Estandarizadas: Rigidez Matutina, Número de Articulaciones, 
 *                                    Índice de Simetría Bilateral (%), Puntaje Inflamatorio (0-10), Anti-CCP
 * Observación Especial: Categorización de Lecturas Espontáneas en Electros (EMG / ECG)
 * Capacidad Dinámica: Inclusión de Nuevos Pacientes en la Cohorte
 * URV AI Foundations - Alumna: María José
 */

// Rangos de normalización clínica para el espacio multidimensional [0, 1]
const SCALES = {
  rigidez: { min: 0, max: 150, label: "Rigidez Matutina (min)", unit: "min" },
  articulaciones: { min: 0, max: 20, label: "Articulaciones Dolorosas", unit: "art." },
  simetria: { min: 0, max: 100, label: "Índice de Simetría Bilateral (%)", unit: "%" },
  inflamacion: { min: 0, max: 10, label: "Puntaje Inflamatorio Clínico (0-10)", unit: "pts" },
  anticcp: { min: 0, max: 300, label: "Ac. Anti-Citrulina Anti-CCP (U/mL)", unit: "U/mL" }
};

// 10 Pacientes iniciales: Bailarinas y bailarines profesionales (~30 años) con desgaste óseo severo
const PACIENTES_ENTRENAMIENTO_BASE = [
  {
    id: "PAC-01",
    nombre: "Sofía M. (29a, Ballet Clásico)",
    rigidez: 95,
    articulaciones: 12,
    simetria: 90,
    inflamacion: 8.5,
    anticcp: 195,
    electroTipo: "cat3",
    electroObs: "EMG: Fibrilaciones espontáneas (+2) en reposo; latencia distal bilateral prolongada en nervio mediano (Túnel Carpiano bilateral inflamatorio).",
    hallazgoRx: "Erosiones corticales marginales en carpos y osteopenia yuxtaarticular simétrica.",
    contextoDanza: "Incapacidad para calentar en la barra matutina; afectación bilateral en espejo de manos y tobillos.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-02",
    nombre: "Mateo G. (31a, Contemporáneo)",
    rigidez: 15,
    articulaciones: 2,
    simetria: 15,
    inflamacion: 1.5,
    anticcp: 3,
    electroTipo: "cat1",
    electroObs: "EMG: Reposo eléctrico silente fisiológico normal; ECG: Bradicardia sinusal benigna de atleta (50 lpm).",
    hallazgoRx: "Desgaste severo de cartílago articular, esclerosis ósea densa en corteza de astrágalo y osteofitos.",
    contextoDanza: "Sobrecarga asimétrica en tobillo derecho de batida tras caídas de saltos (grand jeté).",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-03",
    nombre: "Elena R. (28a, Danza Moderna)",
    rigidez: 110,
    articulaciones: 14,
    simetria: 95,
    inflamacion: 9.0,
    anticcp: 240,
    electroTipo: "cat3",
    electroObs: "EMG: Ondas agudas positivas espontáneas en musculatura interósea y carpos por compresión sinovial activa.",
    hallazgoRx: "Desestructuración y rotura cortical ósea en carpo; pinzamiento simétrico bilateral.",
    contextoDanza: "Tumefacción caliente esponjosa en ambas muñecas; dolor articular continuo que empeora en reposo.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-04",
    nombre: "Lucas B. (33a, Solista Clásico)",
    rigidez: 10,
    articulaciones: 3,
    simetria: 20,
    inflamacion: 1.8,
    anticcp: 4,
    electroTipo: "cat2",
    electroObs: "EMG: Atrapamiento focal de nervio tibial posterior en túnel del tarso derecho por osteofitos de tracción; sin denervación difusa.",
    hallazgoRx: "Hallux rigidus severo con osteofitos gigantes en 1ª MCF derecha y esclerosis subcondral marcada.",
    contextoDanza: "Desgaste focal mecánico por trabajo de puntas y relevé en pie derecho dominante.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-05",
    nombre: "Valentina C. (30a, Neoclásico)",
    rigidez: 80,
    articulaciones: 10,
    simetria: 85,
    inflamacion: 7.8,
    anticcp: 165,
    electroTipo: "cat3",
    electroObs: "EMG: Actividad espontánea incipiente en eminencia tenar bilateral por túnel carpiano precoz autoinmune.",
    hallazgoRx: "Tumefacción sinovial difusa con sutil pérdida de la corteza ósea en estiloides cubital bilateral.",
    contextoDanza: "Sinovitis caliente en ambas manos y empeines; fatiga generalizada matutina.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-06",
    nombre: "Julián P. (32a, Flamenco y Danza Española)",
    rigidez: 20,
    articulaciones: 2,
    simetria: 25,
    inflamacion: 2.2,
    anticcp: 5,
    electroTipo: "cat1",
    electroObs: "EMG: Conducción nerviosa normal sin actividad espontánea; ECG: Repolarización precoz típica de deportista.",
    hallazgoRx: "Pinzamiento femorotibial medial asimétrico y marcado reborde osteofítico sin erosiones.",
    contextoDanza: "Microtraumatismo de repetición por impacto de zapateo en rodilla izquierda de apoyo.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-07",
    nombre: "Camila H. (27a, Ballet Clásico)",
    rigidez: 125,
    articulaciones: 16,
    simetria: 100,
    inflamacion: 9.2,
    anticcp: 220,
    electroTipo: "cat4",
    electroObs: "ECG: Elevación cóncava difusa de ST (pericarditis reactiva autoinmune); EMG: Fibrilaciones activas en pies y manos.",
    hallazgoRx: "Pinzamiento articular simétrico bilateral con microgeodas y rotura cortical en falanges.",
    contextoDanza: "Afectación en espejo idéntica en manos y pies; impotencia funcional matutina severa.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-08",
    nombre: "Daniel T. (34a, Danza Acrobática)",
    rigidez: 8,
    articulaciones: 3,
    simetria: 10,
    inflamacion: 1.2,
    anticcp: 2,
    electroTipo: "cat2",
    electroObs: "EMG: Atrapamiento mecánico focal del nervio peroneo común en cabeza de peroné izquierdo por hiperostosis ósea.",
    hallazgoRx: "Corteza ósea engrosada con osteofitos mecánicos en tobillo izquierdo y muñeca derecha.",
    contextoDanza: "Articulaciones duras y frías por traumatismo ocupacional crónico; sin calor local ni eritema.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-09",
    nombre: "Martina F. (29a, Danza Contemporánea)",
    rigidez: 90,
    articulaciones: 11,
    simetria: 88,
    inflamacion: 8.0,
    anticcp: 180,
    electroTipo: "cat3",
    electroObs: "EMG: Fibrilaciones espontáneas (+2) y potenciales polifásicos de corta duración en manos.",
    hallazgoRx: "Erosiones marginales activas en articulaciones interfalángicas proximales de ambas manos.",
    contextoDanza: "Dolor nocturno pulsátil y calor articular sinovial bilateral en extremidades superiores.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-10",
    nombre: "Andrés V. (30a, Teatro Musical)",
    rigidez: 12,
    articulaciones: 2,
    simetria: 18,
    inflamacion: 1.6,
    anticcp: 6,
    electroTipo: "cat1",
    electroObs: "EMG: Reposo muscular silente normal; ECG: Bradicardia de reposo fisiológica sin alteraciones.",
    hallazgoRx: "Pinzamiento coxofemoral superior asimétrico y osteofito cefálico por choque fémoro-acetabular.",
    contextoDanza: "Dolor mecánico en cadera derecha tras sobrecarga en saltos y giros repetitivos.",
    dxReal: "OA",
    dxMariaJose: null
  }
];

// Estado global de la aplicación
let appState = {
  pacientes: JSON.parse(JSON.stringify(PACIENTES_ENTRENAMIENTO_BASE)),
  centroides: null, // { AR: {...}, OA: {...} }
  pacienteNuevo: {
    rigidez: 90,
    articulaciones: 12,
    simetria: 90,
    inflamacion: 8.2,
    anticcp: 175,
    electroTipo: "cat3",
    rxTipo: "ar" // "ar" | "oa"
  },
  proyeccionActual: "simetria_inflamacion"
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderPatientsGrid();
  initSliders();
  initCanvas();
  updateStatusCounter();
});

// Obtener etiqueta y estilo según categoría de lecturas espontáneas en electros
function getElectroBadgeHtml(tipo) {
  switch (tipo) {
    case "cat1":
      return '<span class="badge-electro-normal">Cat. 1: Silente/Atleta (Normal)</span>';
    case "cat2":
      return '<span class="badge-electro-atrap">Cat. 2: Atrapamiento Mecánico</span>';
    case "cat3":
      return '<span class="badge-electro-inflam">Cat. 3: Actividad Espontánea Patológica</span>';
    case "cat4":
      return '<span class="badge-electro-sistem">Cat. 4: Afectación Sistémica / Pericarditis</span>';
    default:
      return '<span class="badge-electro-normal">Sin categorizar</span>';
  }
}

function getElectroDescription(tipo) {
  switch (tipo) {
    case "cat1":
      return "EMG: Silencio eléctrico en reposo normal. ECG: Bradicardia sinusal benigna de bailarín (48-54 lpm).";
    case "cat2":
      return "EMG: Latencia distal motora prolongada focal en túnel del tarso/peroneo por osteofito de impacto. Sin denervación difusa.";
    case "cat3":
      return "EMG: Fibrilaciones espontáneas (+2) en reposo y túnel carpiano bilateral por compresión de pannus sinovial inflamatorio.";
    case "cat4":
      return "ECG: Elevación cóncava difusa de ST (pericarditis autoinmune reactiva); EMG: Ondas agudas positivas espontáneas.";
    default:
      return "Estudio neurofisiológico dentro de límites normales para deportista.";
  }
}

// Renderizar tarjetas de los pacientes
function renderPatientsGrid() {
  const container = document.getElementById("patientsGrid");
  if (!container) return;

  container.innerHTML = "";

  appState.pacientes.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = `patient-card ${p.dxMariaJose === 'AR' ? 'classified-ar' : p.dxMariaJose === 'OA' ? 'classified-oa' : ''}`;
    
    let badgeHtml = '<span class="p-badge badge-unassigned">Pendiente</span>';
    if (p.dxMariaJose === "AR") badgeHtml = '<span class="p-badge badge-ar">AR (Inflamatorio)</span>';
    if (p.dxMariaJose === "OA") badgeHtml = '<span class="p-badge badge-oa">Artrosis Mecánica</span>';

    // Badge de simetría
    const simetriaBadge = p.simetria >= 75
      ? `<span class="badge-simetria-alta">${p.simetria}% (Simétrica Bilateral)</span>`
      : `<span class="badge-simetria-baja">${p.simetria}% (Asimétrica Focal)</span>`;

    // Badge de inflamación clínica
    const inflaBadge = p.inflamacion >= 6.0
      ? `<span class="badge-infla-alta">${p.inflamacion.toFixed(1)}/10 (Sinovitis Caliente)</span>`
      : `<span class="badge-infla-baja">${p.inflamacion.toFixed(1)}/10 (Articulación Fría)</span>`;

    // Badge de Anti-CCP
    const ccpBadge = p.anticcp >= 20
      ? `<span class="badge-anticcp-pos">${p.anticcp} U/mL (Positivo)</span>`
      : `<span class="badge-anticcp-neg">${p.anticcp} U/mL (Negativo)</span>`;

    // Badge de Electros
    const electroBadge = getElectroBadgeHtml(p.electroTipo);

    card.innerHTML = `
      <div>
        <div class="p-top">
          <span class="p-id">${p.id}</span>
          ${badgeHtml}
        </div>
        <div style="font-size:0.75rem; color:#0284c7; font-weight:700; margin-bottom:0.25rem;">🩰 ${p.nombre}</div>

        <div class="p-metrics">
          <div class="metric-row">
            <span>Rigidez matutina:</span>
            <span class="metric-val">${p.rigidez} min</span>
          </div>
          <div class="metric-row">
            <span>Artic. dolorosas:</span>
            <span class="metric-val">${p.articulaciones}</span>
          </div>
          <div class="metric-row">
            <span>Índice de Simetría:</span>
            <div>${simetriaBadge}</div>
          </div>
          <div class="metric-row">
            <span>Score Inflamatorio:</span>
            <div>${inflaBadge}</div>
          </div>
          <div class="metric-row">
            <span>Anti-CCP Citrulina:</span>
            <div>${ccpBadge}</div>
          </div>
        </div>

        <div class="p-electro-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.2rem;">
            <strong style="color:#0369a1;">⚡ Lectura Electros (EMG/ECG):</strong>
            ${electroBadge}
          </div>
          <div style="color:#475569;">${p.electroObs}</div>
        </div>

        <div class="p-rx-box">
          <div style="font-weight:700; color:#1e293b; margin-bottom:0.2rem;">🦴 Hallazgo Óseo / Radiológico:</div>
          <div>${p.hallazgoRx}</div>
          <div style="font-style:italic; color:#64748b; margin-top:0.3rem;"><strong>Danza:</strong> ${p.contextoDanza}</div>
        </div>
      </div>

      <div class="p-buttons">
        <button class="btn-diagnose ar-btn ${p.dxMariaJose === 'AR' ? 'active' : ''}" onclick="setDiagnosis(${index}, 'AR')">
          🔴 Artritis Reumatoide
        </button>
        <button class="btn-diagnose oa-btn ${p.dxMariaJose === 'OA' ? 'active' : ''}" onclick="setDiagnosis(${index}, 'OA')">
          🔵 Artrosis del Bailarín
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Asignar diagnóstico por clic de María José
function setDiagnosis(index, dx) {
  appState.pacientes[index].dxMariaJose = dx;
  renderPatientsGrid();
  updateStatusCounter();
  
  if (appState.centroides) {
    calculateKMeans(false);
  }
}

// Autodiagnóstico médico rápido
function autoDiagnoseAll() {
  appState.pacientes.forEach(p => {
    p.dxMariaJose = p.dxReal;
  });
  renderPatientsGrid();
  updateStatusCounter();
  calculateKMeans(true);
  showToast(`Todos los ${appState.pacientes.length} bailarines diagnosticados con criterio clínico.`);
}

// Resetear diagnósticos
function resetAllDiagnoses() {
  appState.pacientes.forEach(p => {
    p.dxMariaJose = null;
  });
  appState.centroides = null;
  renderPatientsGrid();
  updateStatusCounter();
  document.getElementById("stepCentroids").style.display = "none";
  document.getElementById("stepSurprise").style.display = "none";
  drawScatter();
  showToast("Diagnósticos reiniciados.");
}

// Restaurar cohorte inicial de 10
function resetToInitialCohort() {
  appState.pacientes = JSON.parse(JSON.stringify(PACIENTES_ENTRENAMIENTO_BASE));
  appState.centroides = null;
  renderPatientsGrid();
  updateStatusCounter();
  document.getElementById("stepCentroids").style.display = "none";
  document.getElementById("stepSurprise").style.display = "none";
  drawScatter();
  showToast("Cohorte restaurada a los 10 bailarines originales.");
}

// Actualizar contador de clasificados
function updateStatusCounter() {
  const total = appState.pacientes.length;
  const classifiedCount = appState.pacientes.filter(p => p.dxMariaJose !== null).length;
  const countEl = document.getElementById("classifiedCount");
  const trainBtn = document.getElementById("btnTrainKMeans");
  
  if (countEl) countEl.textContent = `${classifiedCount} / ${total}`;
  
  if (trainBtn) {
    if (classifiedCount >= Math.min(6, total)) {
      trainBtn.removeAttribute("disabled");
      trainBtn.classList.remove("btn-outline");
      trainBtn.classList.add("btn-success");
    } else {
      trainBtn.setAttribute("disabled", "true");
      trainBtn.classList.add("btn-outline");
      trainBtn.classList.remove("btn-success");
    }
  }
}

// =========================================================================
// CÁLCULO DE CENTROIDES K-MEANS EN ESPACIO CLÍNICO MULTIDIMENSIONAL
// =========================================================================

function normalizeVal(val, scale) {
  return (val - scale.min) / (scale.max - scale.min);
}

function calculateKMeans(showToastMessage = true) {
  const arList = appState.pacientes.filter(p => p.dxMariaJose === "AR");
  const oaList = appState.pacientes.filter(p => p.dxMariaJose === "OA");

  if (arList.length === 0 || oaList.length === 0) {
    alert("Para que el algoritmo de K-Means funcione, María José debe asignar al menos un paciente a Artritis Reumatoide (AR) y al menos uno a Artrosis del Bailarín (OA).");
    return;
  }

  // Centroide Artritis Reumatoide
  const centroidAR = {
    rigidez: arList.reduce((acc, p) => acc + p.rigidez, 0) / arList.length,
    articulaciones: arList.reduce((acc, p) => acc + p.articulaciones, 0) / arList.length,
    simetria: arList.reduce((acc, p) => acc + p.simetria, 0) / arList.length,
    inflamacion: arList.reduce((acc, p) => acc + p.inflamacion, 0) / arList.length,
    anticcp: arList.reduce((acc, p) => acc + p.anticcp, 0) / arList.length,
    count: arList.length
  };

  // Centroide Artrosis
  const centroidOA = {
    rigidez: oaList.reduce((acc, p) => acc + p.rigidez, 0) / oaList.length,
    articulaciones: oaList.reduce((acc, p) => acc + p.articulaciones, 0) / oaList.length,
    simetria: oaList.reduce((acc, p) => acc + p.simetria, 0) / oaList.length,
    inflamacion: oaList.reduce((acc, p) => acc + p.inflamacion, 0) / oaList.length,
    anticcp: oaList.reduce((acc, p) => acc + p.anticcp, 0) / oaList.length,
    count: oaList.length
  };

  appState.centroides = { AR: centroidAR, OA: centroidOA };

  updateCentroidDisplay(centroidAR, centroidOA);

  document.getElementById("stepCentroids").style.display = "block";
  document.getElementById("stepSurprise").style.display = "block";

  drawScatter();
  evaluateNewPatient();

  if (showToastMessage) {
    showToast("¡Centroides calculados! La IA ha aprendido tu criterio clínico en bailarines.");
    document.getElementById("stepCentroids").scrollIntoView({ behavior: "smooth" });
  }
}

function updateCentroidDisplay(ar, oa) {
  document.getElementById("arCount").textContent = `${ar.count} bailarines`;
  document.getElementById("arRigidez").textContent = `${ar.rigidez.toFixed(1)} min`;
  document.getElementById("arArt").textContent = `${ar.articulaciones.toFixed(1)}`;
  document.getElementById("arSimetria").textContent = `${ar.simetria.toFixed(1)}% (Alta simetría bilateral)`;
  document.getElementById("arInflamacion").textContent = `${ar.inflamacion.toFixed(1)} / 10 (Sinovitis activa)`;
  document.getElementById("arAnticcp").textContent = `${ar.anticcp.toFixed(0)} U/mL (Positivo)`;

  document.getElementById("oaCount").textContent = `${oa.count} bailarines`;
  document.getElementById("oaRigidez").textContent = `${oa.rigidez.toFixed(1)} min`;
  document.getElementById("oaArt").textContent = `${oa.articulaciones.toFixed(1)}`;
  document.getElementById("oaSimetria").textContent = `${oa.simetria.toFixed(1)}% (Asimétrica focal de carga)`;
  document.getElementById("oaInflamacion").textContent = `${oa.inflamacion.toFixed(1)} / 10 (Fría / mecánica)`;
  document.getElementById("oaAnticcp").textContent = `${oa.anticcp.toFixed(0)} U/mL (Negativo)`;
}

// =========================================================================
// VISUALIZADOR MULTI-PROYECCIÓN (HTML5 Canvas)
// =========================================================================

function initCanvas() {
  const canvas = document.getElementById("scatterCanvas");
  if (!canvas) return;
  canvas.width = 560;
  canvas.height = 350;
  drawScatter();
}

function setProjection(type) {
  appState.proyeccionActual = type;
  document.querySelectorAll(".axis-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-axis") === type);
  });
  drawScatter();
}

function drawScatter() {
  const canvas = document.getElementById("scatterCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, w, h);

  const padLeft = 65;
  const padBottom = 48;
  const padRight = 30;
  const padTop = 30;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  let xProp, yProp, xLabel, yLabel, xScale, yScale;

  if (appState.proyeccionActual === "simetria_inflamacion") {
    xProp = "simetria"; yProp = "inflamacion";
    xLabel = "Índice de Simetría Bilateral (%)"; yLabel = "Score Inflamatorio (0-10)";
    xScale = SCALES.simetria; yScale = SCALES.inflamacion;
  } else if (appState.proyeccionActual === "rigidez_simetria") {
    xProp = "rigidez"; yProp = "simetria";
    xLabel = "Rigidez Matutina (min)"; yLabel = "Índice de Simetría (%)";
    xScale = SCALES.rigidez; yScale = SCALES.simetria;
  } else if (appState.proyeccionActual === "anticcp_inflamacion") {
    xProp = "anticcp"; yProp = "inflamacion";
    xLabel = "Anti-CCP Citrulina (U/mL)"; yLabel = "Score Inflamatorio (0-10)";
    xScale = SCALES.anticcp; yScale = SCALES.inflamacion;
  } else if (appState.proyeccionActual === "rigidez_inflamacion") {
    xProp = "rigidez"; yProp = "inflamacion";
    xLabel = "Rigidez Matutina (min)"; yLabel = "Score Inflamatorio (0-10)";
    xScale = SCALES.rigidez; yScale = SCALES.inflamacion;
  } else {
    xProp = "articulaciones"; yProp = "simetria";
    xLabel = "Articulaciones Afectadas"; yLabel = "Índice de Simetría (%)";
    xScale = SCALES.articulaciones; yScale = SCALES.simetria;
  }

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const x = padLeft + (plotW / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
    ctx.stroke();

    let xVal = Math.round(xScale.min + ((xScale.max - xScale.min) / 5) * i);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(xVal, x, padTop + plotH + 16);

    const y = padTop + plotH - (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();

    let yVal = yScale.max <= 10 
      ? (yScale.min + ((yScale.max - yScale.min) / 5) * i).toFixed(1)
      : Math.round(yScale.min + ((yScale.max - yScale.min) / 5) * i);
    ctx.textAlign = "right";
    ctx.fillText(yVal, padLeft - 8, y + 4);
  }

  if (xProp === "simetria") {
    const xMid = mapX(50);
    ctx.save();
    ctx.strokeStyle = "#0284c7";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xMid, padTop);
    ctx.lineTo(xMid, padTop + plotH);
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "9px system-ui";
    ctx.fillText("Umbral Simetría 50%", xMid + 4, padTop + 14);
    ctx.restore();
  }

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(xLabel, padLeft + plotW / 2, h - 10);

  ctx.save();
  ctx.translate(16, padTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  function mapX(val) {
    return padLeft + ((val - xScale.min) / (xScale.max - xScale.min)) * plotW;
  }
  function mapY(val) {
    return padTop + plotH - ((val - yScale.min) / (yScale.max - yScale.min)) * plotH;
  }

  appState.pacientes.forEach(p => {
    const cx = mapX(p[xProp]);
    const cy = mapY(p[yProp]);

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);

    if (p.dxMariaJose === "AR") {
      ctx.fillStyle = "#ef4444";
      ctx.strokeStyle = "#ffffff";
    } else if (p.dxMariaJose === "OA") {
      ctx.fillStyle = "#3b82f6";
      ctx.strokeStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#64748b";
      ctx.strokeStyle = "#cbd5e1";
    }

    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(p.id.replace("PAC-", "P"), cx + 8, cy - 4);
  });

  if (appState.centroides) {
    const cAR = appState.centroides.AR;
    const arX = mapX(cAR[xProp]);
    const arY = mapY(cAR[yProp]);
    drawCentroidMarker(ctx, arX, arY, "#dc2626", "Centroide AR (μ₁)");

    const cOA = appState.centroides.OA;
    const oaX = mapX(cOA[xProp]);
    const oaY = mapY(cOA[yProp]);
    drawCentroidMarker(ctx, oaX, oaY, "#2563eb", "Centroide Artrosis (μ₂)");
  }

  if (appState.pacienteNuevo) {
    const npX = mapX(appState.pacienteNuevo[xProp]);
    const npY = mapY(appState.pacienteNuevo[yProp]);

    ctx.beginPath();
    ctx.arc(npX, npY, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(npX, npY, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#eab308";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("NUEVO", npX, npY - 12);
  }
}

function drawCentroidMarker(ctx, x, y, color, label) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  const size = 10;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, size + 2, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.stroke();

  ctx.font = "bold 9px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(label, x + size + 4, y + 3);
  ctx.restore();
}

// =========================================================================
// PASO 3: PACIENTE NUEVO CON VARIABLES CLÍNICAS Y LECTURAS DE ELECTROS
// =========================================================================

function initSliders() {
  const sRigidez = document.getElementById("sliderRigidez");
  const sArt = document.getElementById("sliderArt");
  const sSimetria = document.getElementById("sliderSimetria");
  const sInfla = document.getElementById("sliderInflamacion");
  const sAnticcp = document.getElementById("sliderAnticcp");
  const sRx = document.getElementById("selectRxFinding");
  const sElectro = document.getElementById("selectElectroFinding");

  function onControlsChange() {
    appState.pacienteNuevo.rigidez = parseFloat(sRigidez.value);
    appState.pacienteNuevo.articulaciones = parseInt(sArt.value);
    appState.pacienteNuevo.simetria = parseInt(sSimetria.value);
    appState.pacienteNuevo.inflamacion = parseFloat(sInfla.value);
    appState.pacienteNuevo.anticcp = parseInt(sAnticcp.value);
    appState.pacienteNuevo.rxTipo = sRx.value;
    appState.pacienteNuevo.electroTipo = sElectro.value;

    document.getElementById("valRigidez").textContent = `${appState.pacienteNuevo.rigidez} min`;
    document.getElementById("valArt").textContent = `${appState.pacienteNuevo.articulaciones} artic.`;
    
    const simVal = appState.pacienteNuevo.simetria;
    const simNote = simVal >= 75 ? "(Bilateral Simétrica - AR)" : simVal >= 40 ? "(Intermedia)" : "(Asimétrica Focal - Danza)";
    document.getElementById("valSimetria").textContent = `${simVal}% ${simNote}`;

    const inflaVal = appState.pacienteNuevo.inflamacion;
    const inflaNote = inflaVal >= 6.0 ? "(Sinovitis Caliente Activa)" : inflaVal >= 3.5 ? "(Leve/Moderada)" : "(Articulación Fría / Mecánica)";
    document.getElementById("valInflamacion").textContent = `${inflaVal.toFixed(1)} / 10 ${inflaNote}`;

    const ccpVal = appState.pacienteNuevo.anticcp;
    const ccpNote = ccpVal >= 20 ? "(Positivo > 20)" : "(Negativo < 20)";
    document.getElementById("valAnticcp").textContent = `${ccpVal} U/mL ${ccpNote}`;

    drawScatter();
    evaluateNewPatient();
  }

  sRigidez?.addEventListener("input", onControlsChange);
  sArt?.addEventListener("input", onControlsChange);
  sSimetria?.addEventListener("input", onControlsChange);
  sInfla?.addEventListener("input", onControlsChange);
  sAnticcp?.addEventListener("input", onControlsChange);
  sRx?.addEventListener("change", onControlsChange);
  sElectro?.addEventListener("change", onControlsChange);
}

// Generar nuevo paciente bailarín aleatorio coherente
function generateRandomPatient() {
  const isAR = Math.random() > 0.5;

  let r, a, sim, infla, ccp, rx, electro;
  if (isAR) {
    r = Math.floor(65 + Math.random() * 60);         // 65 a 125 min
    a = Math.floor(8 + Math.random() * 9);          // 8 a 16 artic.
    sim = Math.floor(78 + Math.random() * 22);       // 78% a 100% (altamente simétrica)
    infla = parseFloat((6.5 + Math.random() * 3.2).toFixed(1)); // 6.5 a 9.7 (sinovitis caliente)
    ccp = Math.floor(110 + Math.random() * 150);     // 110 a 260 U/mL (muy específico)
    rx = "ar";
    electro = Math.random() > 0.3 ? "cat3" : "cat4";
  } else {
    r = Math.floor(5 + Math.random() * 20);          // 5 a 25 min
    a = Math.floor(1 + Math.random() * 4);           // 1 a 4 artic.
    sim = Math.floor(5 + Math.random() * 25);        // 5% a 30% (asimétrico)
    infla = parseFloat((0.8 + Math.random() * 2.0).toFixed(1)); // 0.8 a 2.8 (artritis fría mecánica)
    ccp = Math.floor(1 + Math.random() * 8);         // 1 a 8 U/mL (negativo)
    rx = "oa";
    electro = Math.random() > 0.4 ? "cat1" : "cat2";
  }

  document.getElementById("sliderRigidez").value = r;
  document.getElementById("sliderArt").value = a;
  document.getElementById("sliderSimetria").value = sim;
  document.getElementById("sliderInflamacion").value = infla;
  document.getElementById("sliderAnticcp").value = ccp;
  document.getElementById("selectRxFinding").value = rx;
  document.getElementById("selectElectroFinding").value = electro;

  appState.pacienteNuevo = { rigidez: r, articulaciones: a, simetria: sim, inflamacion: infla, anticcp: ccp, rxTipo: rx, electroTipo: electro };

  document.getElementById("valRigidez").textContent = `${r} min`;
  document.getElementById("valArt").textContent = `${a} artic.`;
  document.getElementById("valSimetria").textContent = `${sim}% ${sim >= 75 ? '(Simétrica Bilateral)' : '(Asimétrica)'}`;
  document.getElementById("valInflamacion").textContent = `${infla.toFixed(1)} / 10 ${infla >= 6.0 ? '(Sinovitis Caliente)' : '(Mecánica Fría)'}`;
  document.getElementById("valAnticcp").textContent = `${ccp} U/mL ${ccp >= 20 ? '(Positivo)' : '(Negativo)'}`;

  drawScatter();
  evaluateNewPatient();
  showToast("¡Nuevo caso clínico espontáneo de bailarín generado!");
}

// Cargar caso clínico límite o de transición
function loadBorderlinePatient() {
  const r = 35;
  const a = 5;
  const sim = 50;
  const infla = 4.5;
  const ccp = 35;
  const rx = "ar";
  const electro = "cat2";

  document.getElementById("sliderRigidez").value = r;
  document.getElementById("sliderArt").value = a;
  document.getElementById("sliderSimetria").value = sim;
  document.getElementById("sliderInflamacion").value = infla;
  document.getElementById("sliderAnticcp").value = ccp;
  document.getElementById("selectRxFinding").value = rx;
  document.getElementById("selectElectroFinding").value = electro;

  appState.pacienteNuevo = { rigidez: r, articulaciones: a, simetria: sim, inflamacion: infla, anticcp: ccp, rxTipo: rx, electroTipo: electro };

  document.getElementById("valRigidez").textContent = `${r} min`;
  document.getElementById("valArt").textContent = `${a} artic.`;
  document.getElementById("valSimetria").textContent = `50% (Zona de incertidumbre)`;
  document.getElementById("valInflamacion").textContent = `4.5 / 10 (Moderada)`;
  document.getElementById("valAnticcp").textContent = `35 U/mL (Débilmente Positivo)`;

  drawScatter();
  evaluateNewPatient();
  showToast("Caso límite de bailarín con lecturas mixtas cargado.");
}

// =========================================================================
// INCLUIR PACIENTE NUEVO EN LA COHORTE OFICIAL (PAC-11, PAC-12...)
// =========================================================================

function addNewPatientToCohort() {
  const nextNum = appState.pacientes.length + 1;
  const nextId = `PAC-${nextNum < 10 ? '0' + nextNum : nextNum}`;
  const np = appState.pacienteNuevo;

  // Predecir diagnóstico vía centroides K-Means
  const isAR = evaluateNewPatient(false);
  const predictedDx = isAR ? "AR" : "OA";

  const newPatient = {
    id: nextId,
    nombre: `Bailarín/a ${nextId} (~30a, Muestra Espontánea)`,
    rigidez: np.rigidez,
    articulaciones: np.articulaciones,
    simetria: np.simetria,
    inflamacion: np.inflamacion,
    anticcp: np.anticcp,
    electroTipo: np.electroTipo || (isAR ? "cat3" : "cat1"),
    electroObs: getElectroDescription(np.electroTipo || (isAR ? "cat3" : "cat1")),
    hallazgoRx: np.rxTipo === "ar"
      ? "Erosiones óseas marginales en corteza, rotura articular y osteopenia yuxtaarticular."
      : "Desgaste severo de cartílago por danza, esclerosis ósea subcondral y osteofitos sin rotura.",
    contextoDanza: np.rxTipo === "ar"
      ? "Presenta sinovitis bilateral en reposo nocturno; dolor continuo que no cede al descansar."
      : "Sobrecarga biomecánica ocupacional por impacto de saltos en danza de alta intensidad.",
    dxReal: predictedDx,
    dxMariaJose: predictedDx
  };

  appState.pacientes.push(newPatient);
  renderPatientsGrid();
  updateStatusCounter();
  calculateKMeans(false);
  drawScatter();

  showToast(`¡Bailarín/a ${nextId} incluido/a en la muestra clínica con diagnóstico ${predictedDx}!`);
  
  // Desplazar suavemente a la cuadrícula de pacientes para verlo
  document.getElementById("stepClassification").scrollIntoView({ behavior: "smooth" });
}

// Evaluación del paciente nuevo en el espacio multidimensional (K-Means)
function evaluateNewPatient(updateUI = true) {
  if (!appState.centroides) return false;

  const np = appState.pacienteNuevo;
  const cAR = appState.centroides.AR;
  const cOA = appState.centroides.OA;

  const npNorm = {
    r: normalizeVal(np.rigidez, SCALES.rigidez),
    a: normalizeVal(np.articulaciones, SCALES.articulaciones),
    sim: normalizeVal(np.simetria, SCALES.simetria),
    inf: normalizeVal(np.inflamacion, SCALES.inflamacion),
    ccp: normalizeVal(np.anticcp, SCALES.anticcp)
  };

  const arNorm = {
    r: normalizeVal(cAR.rigidez, SCALES.rigidez),
    a: normalizeVal(cAR.articulaciones, SCALES.articulaciones),
    sim: normalizeVal(cAR.simetria, SCALES.simetria),
    inf: normalizeVal(cAR.inflamacion, SCALES.inflamacion),
    ccp: normalizeVal(cAR.anticcp, SCALES.anticcp)
  };

  const oaNorm = {
    r: normalizeVal(cOA.rigidez, SCALES.rigidez),
    a: normalizeVal(cOA.articulaciones, SCALES.articulaciones),
    sim: normalizeVal(cOA.simetria, SCALES.simetria),
    inf: normalizeVal(cOA.inflamacion, SCALES.inflamacion),
    ccp: normalizeVal(cOA.anticcp, SCALES.anticcp)
  };

  const wSim = 1.3;
  const wInf = 1.3;
  const wCCP = 1.4;
  const wRig = 1.0;
  const wArt = 1.0;

  const distAR = Math.sqrt(
    wRig * Math.pow(npNorm.r - arNorm.r, 2) +
    wArt * Math.pow(npNorm.a - arNorm.a, 2) +
    wSim * Math.pow(npNorm.sim - arNorm.sim, 2) +
    wInf * Math.pow(npNorm.inf - arNorm.inf, 2) +
    wCCP * Math.pow(npNorm.ccp - arNorm.ccp, 2)
  );

  const distOA = Math.sqrt(
    wRig * Math.pow(npNorm.r - oaNorm.r, 2) +
    wArt * Math.pow(npNorm.a - oaNorm.a, 2) +
    wSim * Math.pow(npNorm.sim - oaNorm.sim, 2) +
    wInf * Math.pow(npNorm.inf - oaNorm.inf, 2) +
    wCCP * Math.pow(npNorm.ccp - oaNorm.ccp, 2)
  );

  const tau = 0.22;
  const expAR = Math.exp(-distAR / tau);
  const expOA = Math.exp(-distOA / tau);
  const probAR = (expAR / (expAR + expOA)) * 100;
  const probOA = (expOA / (expAR + expOA)) * 100;

  const isAR = distAR < distOA;

  if (updateUI) {
    const verdictEl = document.getElementById("aiVerdictBadge");
    const barFill = document.getElementById("probBarFillAR");
    const probARText = document.getElementById("probARText");
    const probOAText = document.getElementById("probOAText");
    const distMathEl = document.getElementById("distMathText");

    if (verdictEl) {
      if (isAR) {
        verdictEl.className = "verdict-badge ar";
        verdictEl.textContent = `🔴 Artritis Reumatoide Autoinmune (${probAR.toFixed(1)}%)`;
      } else {
        verdictEl.className = "verdict-badge oa";
        verdictEl.textContent = `🔵 Artrosis Ocupacional del Bailarín (${probOA.toFixed(1)}%)`;
      }
    }

    if (barFill) barFill.style.width = `${probAR.toFixed(1)}%`;
    if (probARText) probARText.textContent = `Artritis Reumatoide: ${probAR.toFixed(1)}%`;
    if (probOAText) probOAText.textContent = `Artrosis Mecánica: ${probOA.toFixed(1)}%`;

    if (distMathEl) {
      const simAnalysis = np.simetria >= 75
        ? `• <strong style="color:#b91c1c;">Simetría (${np.simetria}%):</strong> Afectación bilateral en espejo, característica cardinal de Artritis Reumatoide.`
        : `• <strong style="color:#1d4ed8;">Simetría (${np.simetria}%):</strong> Asimétrica/unilateral, congruente con sobrecarga mecánica de apoyo en danza.`;

      const inflaAnalysis = np.inflamacion >= 6.0
        ? `• <strong style="color:#b91c1c;">Score Inflamatorio (${np.inflamacion.toFixed(1)}/10):</strong> Sinovitis esponjosa con calor local y derrame articular activo.`
        : `• <strong style="color:#1d4ed8;">Score Inflamatorio (${np.inflamacion.toFixed(1)}/10):</strong> Articulaciones frías/duras por osteofitos y esclerosis cortical sin calor.`;

      const ccpAnalysis = np.anticcp >= 20
        ? `• <strong style="color:#b91c1c;">Anti-CCP (${np.anticcp} U/mL):</strong> Positivo (especificidad >96% confirmando proceso autoinmune).`
        : `• <strong style="color:#1d4ed8;">Anti-CCP (${np.anticcp} U/mL):</strong> Negativo (descarta patología autoinmune sistémica).`;

      const electroDesc = getElectroDescription(np.electroTipo);
      const electroAnalysis = (np.electroTipo === "cat3" || np.electroTipo === "cat4")
        ? `• <strong style="color:#b91c1c;">Lectura Espontánea de Electros:</strong> ${electroDesc}`
        : `• <strong style="color:#1d4ed8;">Lectura Espontánea de Electros:</strong> ${electroDesc}`;

      distMathEl.innerHTML = `
        <strong>Análisis Multidimensional del Bailarín/a:</strong><br>
        ${simAnalysis}<br>
        ${inflaAnalysis}<br>
        ${ccpAnalysis}<br>
        ${electroAnalysis}<br>
        <div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px dashed #cbd5e1;">
          <strong>Distancias vectoriales ponderadas K-Means:</strong><br>
          • Distancia a Centroide AR (μ₁): <code>${distAR.toFixed(3)}</code> | Distancia a Centroide Artrosis (μ₂): <code>${distOA.toFixed(3)}</code>
        </div>
      `;
    }
  }

  return isAR;
}

// Alternar panel de anotaciones clínicas
function toggleClinicalNotes() {
  const panel = document.getElementById("clinicalNotesGrid");
  const btn = document.getElementById("btnToggleNotes");
  if (!panel || !btn) return;
  const isHidden = panel.style.display === "none";
  panel.style.display = isHidden ? "grid" : "none";
  btn.textContent = isHidden ? "▲ Ocultar Anotaciones" : "▼ Mostrar Anotaciones Clínicas";
}

// Toast
function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
