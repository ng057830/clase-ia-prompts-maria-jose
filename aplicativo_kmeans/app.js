/**
 * Simulador K-Means Reumatológico Avanzado: Artritis Reumatoide vs. Artrosis
 * Parámetros Clínicos: Rigidez, PCR, Articulaciones, Anti-CCP, Radiografía y Densitometría DEXA (T-score)
 * URV AI Foundations - Alumna: María José
 */

// Rangos de normalización clínica para el espacio multidimensional [0, 1]
const SCALES = {
  rigidez: { min: 0, max: 150, label: "Rigidez Matutina (min)", unit: "min" },
  pcr: { min: 0, max: 80, label: "PCR en Sangre (mg/L)", unit: "mg/L" },
  articulaciones: { min: 0, max: 20, label: "Articulaciones Dolorosas", unit: "art." },
  anticcp: { min: 0, max: 300, label: "Anti-CCP Citrulina (U/mL)", unit: "U/mL" },
  tscore: { min: -4.0, max: 1.0, label: "DEXA T-Score (Fémur/Columna)", unit: "DS" }
};

// 10 Pacientes de entrenamiento con perfil clínico y analítico completo
const PACIENTES_ENTRENAMIENTO = [
  {
    id: "PAC-01",
    nombre: "Carmen S. (58a)",
    rigidez: 90,
    pcr: 48,
    articulaciones: 12,
    anticcp: 185,
    tscore: -2.8,
    hallazgoRx: "Erosiones marginales en corteza de MCP-2/3 y osteopenia yuxtaarticular.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-02",
    nombre: "Manuel G. (67a)",
    rigidez: 15,
    pcr: 2.1,
    articulaciones: 2,
    anticcp: 3,
    tscore: -1.1,
    hallazgoRx: "Pinzamiento femorotibial medial asimétrico, esclerosis ósea subcondral y osteofitos.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-03",
    nombre: "Teresa L. (62a)",
    rigidez: 110,
    pcr: 62,
    articulaciones: 14,
    anticcp: 240,
    tscore: -3.1,
    hallazgoRx: "Desestructuración y pinzamiento simétrico en carpo; rotura de corteza ósea.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-04",
    nombre: "Antonio R. (71a)",
    rigidez: 10,
    pcr: 1.5,
    articulaciones: 1,
    anticcp: 2,
    tscore: -0.9,
    hallazgoRx: "Rizoartrosis pulgar con osteofitos trapezometacarpianos marcados, sin erosión.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-05",
    nombre: "Isabel V. (44a)",
    rigidez: 75,
    pcr: 35,
    articulaciones: 9,
    anticcp: 140,
    tscore: -2.6,
    hallazgoRx: "Tumefacción de partes blandas con sutil pérdida de la corteza ósea en estiloides cubital.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-06",
    nombre: "Vicente M. (69a)",
    rigidez: 20,
    pcr: 3.8,
    articulaciones: 3,
    anticcp: 5,
    tscore: -1.4,
    hallazgoRx: "Nódulos de Heberden (IFD) y Bouchard; esclerosis ósea densa y osteofitos sin osteopenia.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-07",
    nombre: "Rosa P. (53a)",
    rigidez: 120,
    pcr: 55,
    articulaciones: 16,
    anticcp: 210,
    tscore: -2.9,
    hallazgoRx: "Pinzamiento simétrico bilateral, microgeodas y múltiples erosiones corticales activas.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-08",
    nombre: "Francisco D. (75a)",
    rigidez: 8,
    pcr: 0.9,
    articulaciones: 2,
    anticcp: 4,
    tscore: -0.6,
    hallazgoRx: "Gonartrosis tricompartimental con desgaste de cartílago y marcada esclerosis subcondral.",
    dxReal: "OA",
    dxMariaJose: null
  },
  {
    id: "PAC-09",
    nombre: "Dolores B. (49a)",
    rigidez: 85,
    pcr: 40,
    articulaciones: 11,
    anticcp: 160,
    tscore: -2.7,
    hallazgoRx: "Erosiones óseas corticales en articulaciones interfalángicas proximales de ambas manos.",
    dxReal: "AR",
    dxMariaJose: null
  },
  {
    id: "PAC-10",
    nombre: "Juan C. (64a)",
    rigidez: 12,
    pcr: 2.4,
    articulaciones: 4,
    anticcp: 6,
    tscore: -1.3,
    hallazgoRx: "Coxartrosis con pinzamiento superoexterno y reborde osteofítico periacetabular.",
    dxReal: "OA",
    dxMariaJose: null
  }
];

// Estado global de la aplicación
let appState = {
  pacientes: JSON.parse(JSON.stringify(PACIENTES_ENTRENAMIENTO)),
  centroides: null, // { AR: {...}, OA: {...} }
  pacienteNuevo: {
    rigidez: 85,
    pcr: 42.0,
    articulaciones: 10,
    anticcp: 170,
    tscore: -2.7,
    rxTipo: "ar" // "ar" | "oa"
  },
  proyeccionActual: "anticcp_pcr" // "anticcp_pcr" | "rigidez_pcr" | "rigidez_anticcp" | "tscore_pcr" | "rigidez_art"
};

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  renderPatientsGrid();
  initSliders();
  initCanvas();
  updateStatusCounter();
});

// Renderizar tarjetas de los 10 pacientes enriquecidas
function renderPatientsGrid() {
  const container = document.getElementById("patientsGrid");
  if (!container) return;

  container.innerHTML = "";

  appState.pacientes.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = `patient-card ${p.dxMariaJose === 'AR' ? 'classified-ar' : p.dxMariaJose === 'OA' ? 'classified-oa' : ''}`;
    
    let badgeHtml = '<span class="p-badge badge-unassigned">Pendiente</span>';
    if (p.dxMariaJose === "AR") badgeHtml = '<span class="p-badge badge-ar">AR (Inflamatorio)</span>';
    if (p.dxMariaJose === "OA") badgeHtml = '<span class="p-badge badge-oa">Artrosis (Mecánico)</span>';

    // Badges específicos
    const anticcpBadge = p.anticcp >= 20
      ? `<span class="badge-anticcp-pos">Anti-CCP: ${p.anticcp} U/mL (Positivo Alto)</span>`
      : `<span class="badge-anticcp-neg">Anti-CCP: ${p.anticcp} U/mL (Negativo &lt;20)</span>`;

    const tscoreBadge = p.tscore <= -2.5
      ? `<span class="badge-tscore-osteo">T: ${p.tscore.toFixed(1)} (Osteoporosis &le; -2.5)</span>`
      : `<span class="badge-tscore-normal">T: ${p.tscore.toFixed(1)} (Normal/Osteopenia)</span>`;

    card.innerHTML = `
      <div>
        <div class="p-top">
          <span class="p-id">${p.id}</span>
          ${badgeHtml}
        </div>
        <div style="font-size:0.75rem; color:#64748b; margin-bottom:0.35rem; font-weight:600;">${p.nombre}</div>

        <div class="p-metrics">
          <div class="metric-row">
            <span>Rigidez matutina:</span>
            <span class="metric-val">${p.rigidez} min</span>
          </div>
          <div class="metric-row">
            <span>PCR en sangre:</span>
            <span class="metric-val">${p.pcr} mg/L</span>
          </div>
          <div class="metric-row">
            <span>Artic. dolorosas:</span>
            <span class="metric-val">${p.articulaciones}</span>
          </div>
          <div class="metric-row">
            <span>Ac. Anti-Citrulina:</span>
            <div>${anticcpBadge}</div>
          </div>
          <div class="metric-row">
            <span>DEXA (Fémur/Columna):</span>
            <div>${tscoreBadge}</div>
          </div>
        </div>

        <div class="p-rx-box">
          <strong>Rx Ósea y Articular:</strong> ${p.hallazgoRx}
        </div>
      </div>

      <div class="p-buttons">
        <button class="btn-diagnose ar-btn ${p.dxMariaJose === 'AR' ? 'active' : ''}" onclick="setDiagnosis(${index}, 'AR')">
          🔴 Artritis (AR)
        </button>
        <button class="btn-diagnose oa-btn ${p.dxMariaJose === 'OA' ? 'active' : ''}" onclick="setDiagnosis(${index}, 'OA')">
          🔵 Artrosis (OA)
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
  showToast("Todos los pacientes diagnosticados según criterio clínico estándar.");
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

// Actualizar contador de clasificados
function updateStatusCounter() {
  const classifiedCount = appState.pacientes.filter(p => p.dxMariaJose !== null).length;
  const countEl = document.getElementById("classifiedCount");
  const trainBtn = document.getElementById("btnTrainKMeans");
  
  if (countEl) countEl.textContent = `${classifiedCount} / 10`;
  
  if (trainBtn) {
    if (classifiedCount >= 6) {
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
// CÁLCULO DE CENTROIDES K-MEANS EN ESPACIO MULTIDIMENSIONAL
// =========================================================================

function normalizeVal(val, scale) {
  return (val - scale.min) / (scale.max - scale.min);
}

function calculateKMeans(showToastMessage = true) {
  const arList = appState.pacientes.filter(p => p.dxMariaJose === "AR");
  const oaList = appState.pacientes.filter(p => p.dxMariaJose === "OA");

  if (arList.length === 0 || oaList.length === 0) {
    alert("Para que el algoritmo de K-Means funcione, María José debe asignar al menos un paciente a Artritis Reumatoide (AR) y al menos uno a Artrosis (OA).");
    return;
  }

  // Centroide Artritis Reumatoide
  const centroidAR = {
    rigidez: arList.reduce((acc, p) => acc + p.rigidez, 0) / arList.length,
    pcr: arList.reduce((acc, p) => acc + p.pcr, 0) / arList.length,
    articulaciones: arList.reduce((acc, p) => acc + p.articulaciones, 0) / arList.length,
    anticcp: arList.reduce((acc, p) => acc + p.anticcp, 0) / arList.length,
    tscore: arList.reduce((acc, p) => acc + p.tscore, 0) / arList.length,
    count: arList.length
  };

  // Centroide Artrosis
  const centroidOA = {
    rigidez: oaList.reduce((acc, p) => acc + p.rigidez, 0) / oaList.length,
    pcr: oaList.reduce((acc, p) => acc + p.pcr, 0) / oaList.length,
    articulaciones: oaList.reduce((acc, p) => acc + p.articulaciones, 0) / oaList.length,
    anticcp: oaList.reduce((acc, p) => acc + p.anticcp, 0) / oaList.length,
    tscore: oaList.reduce((acc, p) => acc + p.tscore, 0) / oaList.length,
    count: oaList.length
  };

  appState.centroides = { AR: centroidAR, OA: centroidOA };

  // Actualizar UI de centroides
  updateCentroidDisplay(centroidAR, centroidOA);

  // Mostrar secciones siguientes
  document.getElementById("stepCentroids").style.display = "block";
  document.getElementById("stepSurprise").style.display = "block";

  // Redibujar gráfico
  drawScatter();

  // Evaluar paciente nuevo actual
  evaluateNewPatient();

  if (showToastMessage) {
    showToast("¡Centroides calculados! La IA ha sintetizado tu juicio clínico.");
    document.getElementById("stepCentroids").scrollIntoView({ behavior: "smooth" });
  }
}

function updateCentroidDisplay(ar, oa) {
  document.getElementById("arCount").textContent = `${ar.count} pacientes`;
  document.getElementById("arRigidez").textContent = `${ar.rigidez.toFixed(1)} min`;
  document.getElementById("arPcr").textContent = `${ar.pcr.toFixed(1)} mg/L`;
  document.getElementById("arArt").textContent = `${ar.articulaciones.toFixed(1)}`;
  document.getElementById("arAnticcp").textContent = `${ar.anticcp.toFixed(0)} U/mL`;
  document.getElementById("arTscore").textContent = `${ar.tscore.toFixed(2)} (Osteoporosis activa)`;

  document.getElementById("oaCount").textContent = `${oa.count} pacientes`;
  document.getElementById("oaRigidez").textContent = `${oa.rigidez.toFixed(1)} min`;
  document.getElementById("oaPcr").textContent = `${oa.pcr.toFixed(1)} mg/L`;
  document.getElementById("oaArt").textContent = `${oa.articulaciones.toFixed(1)}`;
  document.getElementById("oaAnticcp").textContent = `${oa.anticcp.toFixed(0)} U/mL (Negativo)`;
  document.getElementById("oaTscore").textContent = `${oa.tscore.toFixed(2)} (Masa ósea conservada)`;
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

  // Limpiar fondo
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, w, h);

  // Ejes y márgenes
  const padLeft = 65;
  const padBottom = 48;
  const padRight = 30;
  const padTop = 30;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  // Selección de variables según proyección activa
  let xProp, yProp, xLabel, yLabel, xScale, yScale;

  if (appState.proyeccionActual === "anticcp_pcr") {
    xProp = "anticcp"; yProp = "pcr";
    xLabel = "Anti-CCP Citrulina (U/mL)"; yLabel = "PCR en Sangre (mg/L)";
    xScale = SCALES.anticcp; yScale = SCALES.pcr;
  } else if (appState.proyeccionActual === "rigidez_pcr") {
    xProp = "rigidez"; yProp = "pcr";
    xLabel = "Rigidez Matutina (min)"; yLabel = "PCR (mg/L)";
    xScale = SCALES.rigidez; yScale = SCALES.pcr;
  } else if (appState.proyeccionActual === "rigidez_anticcp") {
    xProp = "rigidez"; yProp = "anticcp";
    xLabel = "Rigidez Matutina (min)"; yLabel = "Anti-CCP Citrulina (U/mL)";
    xScale = SCALES.rigidez; yScale = SCALES.anticcp;
  } else if (appState.proyeccionActual === "tscore_pcr") {
    xProp = "tscore"; yProp = "pcr";
    xLabel = "DEXA T-Score (Fémur/Columna)"; yLabel = "PCR (mg/L)";
    xScale = SCALES.tscore; yScale = SCALES.pcr;
  } else {
    xProp = "rigidez"; yProp = "articulaciones";
    xLabel = "Rigidez Matutina (min)"; yLabel = "Articulaciones Dolorosas";
    xScale = SCALES.rigidez; yScale = SCALES.articulaciones;
  }

  // Cuadrícula suave
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    // Eje X
    const x = padLeft + (plotW / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
    ctx.stroke();

    let xVal = xScale.min + ((xScale.max - xScale.min) / 5) * i;
    xVal = xProp === "tscore" ? xVal.toFixed(1) : Math.round(xVal);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(xVal, x, padTop + plotH + 16);

    // Eje Y
    const y = padTop + plotH - (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();

    const yVal = Math.round(yScale.min + ((yScale.max - yScale.min) / 5) * i);
    ctx.textAlign = "right";
    ctx.fillText(yVal, padLeft - 8, y + 4);
  }

  // Línea de referencia clínica especial (Corte de Anti-CCP en 20 U/mL o T-Score en -2.5)
  if (xProp === "anticcp") {
    const xThreshold = mapX(20);
    ctx.save();
    ctx.strokeStyle = "#f59e0b";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xThreshold, padTop);
    ctx.lineTo(xThreshold, padTop + plotH);
    ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.font = "9px system-ui";
    ctx.fillText("Corte 20 U/mL", xThreshold + 4, padTop + 14);
    ctx.restore();
  } else if (xProp === "tscore") {
    const xThreshold = mapX(-2.5);
    ctx.save();
    ctx.strokeStyle = "#ef4444";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xThreshold, padTop);
    ctx.lineTo(xThreshold, padTop + plotH);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.font = "9px system-ui";
    ctx.fillText("Osteoporosis ≤ -2.5", xThreshold + 4, padTop + 14);
    ctx.restore();
  }

  // Títulos de ejes
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

  // Puntos de los pacientes
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

  // Centroides
  if (appState.centroides) {
    const cAR = appState.centroides.AR;
    const arX = mapX(cAR[xProp]);
    const arY = mapY(cAR[yProp]);
    drawCentroidMarker(ctx, arX, arY, "#dc2626", "Centroide AR (μ₁)");

    const cOA = appState.centroides.OA;
    const oaX = mapX(cOA[xProp]);
    const oaY = mapY(cOA[yProp]);
    drawCentroidMarker(ctx, oaX, oaY, "#2563eb", "Centroide OA (μ₂)");
  }

  // Paciente Nuevo
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
// PASO 3: PACIENTE NUEVO CON PARÁMETROS COMPLETOS Y EVALUACIÓN
// =========================================================================

function initSliders() {
  const sRigidez = document.getElementById("sliderRigidez");
  const sPcr = document.getElementById("sliderPcr");
  const sArt = document.getElementById("sliderArt");
  const sAnticcp = document.getElementById("sliderAnticcp");
  const sTscore = document.getElementById("sliderTscore");
  const sRx = document.getElementById("selectRxFinding");

  function onControlsChange() {
    appState.pacienteNuevo.rigidez = parseFloat(sRigidez.value);
    appState.pacienteNuevo.pcr = parseFloat(sPcr.value);
    appState.pacienteNuevo.articulaciones = parseInt(sArt.value);
    appState.pacienteNuevo.anticcp = parseInt(sAnticcp.value);
    appState.pacienteNuevo.tscore = parseFloat(sTscore.value);
    appState.pacienteNuevo.rxTipo = sRx.value;

    document.getElementById("valRigidez").textContent = `${appState.pacienteNuevo.rigidez} min`;
    document.getElementById("valPcr").textContent = `${appState.pacienteNuevo.pcr.toFixed(1)} mg/L`;
    document.getElementById("valArt").textContent = `${appState.pacienteNuevo.articulaciones}`;
    
    // Anotación dinámica de Anti-CCP
    const ccpVal = appState.pacienteNuevo.anticcp;
    const ccpNote = ccpVal >= 60 ? "(Positivo Alto)" : ccpVal >= 20 ? "(Positivo)" : "(Negativo <20)";
    document.getElementById("valAnticcp").textContent = `${ccpVal} U/mL ${ccpNote}`;

    // Anotación dinámica de T-Score DEXA
    const tVal = appState.pacienteNuevo.tscore;
    const tNote = tVal <= -2.5 ? "(Osteoporosis ≤ -2.5)" : tVal <= -1.0 ? "(Osteopenia)" : "(Normal)";
    document.getElementById("valTscore").textContent = `${tVal.toFixed(1)} DS ${tNote}`;

    drawScatter();
    evaluateNewPatient();
  }

  sRigidez?.addEventListener("input", onControlsChange);
  sPcr?.addEventListener("input", onControlsChange);
  sArt?.addEventListener("input", onControlsChange);
  sAnticcp?.addEventListener("input", onControlsChange);
  sTscore?.addEventListener("input", onControlsChange);
  sRx?.addEventListener("change", onControlsChange);
}

// Generar paciente nuevo aleatorio coherente
function generateRandomPatient() {
  const isAR = Math.random() > 0.5;

  let r, p, a, ccp, t, rx;
  if (isAR) {
    r = Math.floor(65 + Math.random() * 60);         // 65 a 125 min
    p = parseFloat((25 + Math.random() * 45).toFixed(1)); // 25 a 70 mg/L
    a = Math.floor(8 + Math.random() * 9);          // 8 a 16 artic.
    ccp = Math.floor(100 + Math.random() * 160);    // 100 a 260 U/mL (muy específico)
    t = parseFloat((-2.5 - Math.random() * 0.9).toFixed(1)); // -2.5 a -3.4 (Osteoporosis)
    rx = "ar";
  } else {
    r = Math.floor(5 + Math.random() * 20);          // 5 a 25 min
    p = parseFloat((0.8 + Math.random() * 3.5).toFixed(1)); // 0.8 a 4.3 mg/L
    a = Math.floor(1 + Math.random() * 4);           // 1 a 4 artic.
    ccp = Math.floor(1 + Math.random() * 8);         // 1 a 8 U/mL (negativo)
    t = parseFloat((-0.5 - Math.random() * 1.3).toFixed(1)); // -0.5 a -1.8 (Normal/Osteopenia)
    rx = "oa";
  }

  document.getElementById("sliderRigidez").value = r;
  document.getElementById("sliderPcr").value = p;
  document.getElementById("sliderArt").value = a;
  document.getElementById("sliderAnticcp").value = ccp;
  document.getElementById("sliderTscore").value = t;
  document.getElementById("selectRxFinding").value = rx;

  appState.pacienteNuevo = { rigidez: r, pcr: p, articulaciones: a, anticcp: ccp, tscore: t, rxTipo: rx };

  document.getElementById("valRigidez").textContent = `${r} min`;
  document.getElementById("valPcr").textContent = `${p} mg/L`;
  document.getElementById("valArt").textContent = `${a}`;
  document.getElementById("valAnticcp").textContent = `${ccp} U/mL ${ccp >= 20 ? '(Positivo)' : '(Negativo)'}`;
  document.getElementById("valTscore").textContent = `${t.toFixed(1)} DS ${t <= -2.5 ? '(Osteoporosis ≤ -2.5)' : '(Normal)'}`;

  drawScatter();
  evaluateNewPatient();
  showToast("¡Nuevo paciente simulado con analítica y radiografía generado!");
}

// Cargar caso límite / dudoso para debate pedagógico
function loadBorderlinePatient() {
  const r = 35;
  const p = 12.0;
  const a = 5;
  const ccp = 38; // Débilmente positivo
  const t = -2.3; // Osteopenia límite
  const rx = "ar";

  document.getElementById("sliderRigidez").value = r;
  document.getElementById("sliderPcr").value = p;
  document.getElementById("sliderArt").value = a;
  document.getElementById("sliderAnticcp").value = ccp;
  document.getElementById("sliderTscore").value = t;
  document.getElementById("selectRxFinding").value = rx;

  appState.pacienteNuevo = { rigidez: r, pcr: p, articulaciones: a, anticcp: ccp, tscore: t, rxTipo: rx };

  document.getElementById("valRigidez").textContent = `${r} min`;
  document.getElementById("valPcr").textContent = `${p} mg/L`;
  document.getElementById("valArt").textContent = `${a}`;
  document.getElementById("valAnticcp").textContent = `${ccp} U/mL (Débilmente Positivo)`;
  document.getElementById("valTscore").textContent = `${t.toFixed(1)} DS (Osteopenia límite)`;

  drawScatter();
  evaluateNewPatient();
  showToast("Caso clínico dudoso cargado.");
}

// Evaluación del paciente nuevo en el espacio multidimensional normalizado
function evaluateNewPatient() {
  if (!appState.centroides) return;

  const np = appState.pacienteNuevo;
  const cAR = appState.centroides.AR;
  const cOA = appState.centroides.OA;

  // Coordenadas normalizadas [0, 1]
  const npNorm = {
    r: normalizeVal(np.rigidez, SCALES.rigidez),
    p: normalizeVal(np.pcr, SCALES.pcr),
    a: normalizeVal(np.articulaciones, SCALES.articulaciones),
    ccp: normalizeVal(np.anticcp, SCALES.anticcp),
    t: normalizeVal(np.tscore, SCALES.tscore)
  };

  const arNorm = {
    r: normalizeVal(cAR.rigidez, SCALES.rigidez),
    p: normalizeVal(cAR.pcr, SCALES.pcr),
    a: normalizeVal(cAR.articulaciones, SCALES.articulaciones),
    ccp: normalizeVal(cAR.anticcp, SCALES.anticcp),
    t: normalizeVal(cAR.tscore, SCALES.tscore)
  };

  const oaNorm = {
    r: normalizeVal(cOA.rigidez, SCALES.rigidez),
    p: normalizeVal(cOA.pcr, SCALES.pcr),
    a: normalizeVal(cOA.articulaciones, SCALES.articulaciones),
    ccp: normalizeVal(cOA.anticcp, SCALES.anticcp),
    t: normalizeVal(cOA.tscore, SCALES.tscore)
  };

  // Ponderación de pesos clínicos: Anti-CCP tiene gran peso por especificidad (>96%)
  const wCCP = 1.5;
  const wPCR = 1.0;
  const wRig = 1.0;
  const wArt = 1.0;
  const wT = 0.8;

  const distAR = Math.sqrt(
    wRig * Math.pow(npNorm.r - arNorm.r, 2) +
    wPCR * Math.pow(npNorm.p - arNorm.p, 2) +
    wArt * Math.pow(npNorm.a - arNorm.a, 2) +
    wCCP * Math.pow(npNorm.ccp - arNorm.ccp, 2) +
    wT * Math.pow(npNorm.t - arNorm.t, 2)
  );

  const distOA = Math.sqrt(
    wRig * Math.pow(npNorm.r - oaNorm.r, 2) +
    wPCR * Math.pow(npNorm.p - oaNorm.p, 2) +
    wArt * Math.pow(npNorm.a - oaNorm.a, 2) +
    wCCP * Math.pow(npNorm.ccp - oaNorm.ccp, 2) +
    wT * Math.pow(npNorm.t - oaNorm.t, 2)
  );

  // Softmax
  const tau = 0.22;
  const expAR = Math.exp(-distAR / tau);
  const expOA = Math.exp(-distOA / tau);
  const probAR = (expAR / (expAR + expOA)) * 100;
  const probOA = (expOA / (expAR + expOA)) * 100;

  const isAR = distAR < distOA;
  const verdictEl = document.getElementById("aiVerdictBadge");
  const barFill = document.getElementById("probBarFillAR");
  const probARText = document.getElementById("probARText");
  const probOAText = document.getElementById("probOAText");
  const distMathEl = document.getElementById("distMathText");

  if (verdictEl) {
    if (isAR) {
      verdictEl.className = "verdict-badge ar";
      verdictEl.textContent = `🔴 Artritis Reumatoide (${probAR.toFixed(1)}%)`;
    } else {
      verdictEl.className = "verdict-badge oa";
      verdictEl.textContent = `🔵 Artrosis / Osteoartritis (${probOA.toFixed(1)}%)`;
    }
  }

  if (barFill) barFill.style.width = `${probAR.toFixed(1)}%`;
  if (probARText) probARText.textContent = `Artritis Reumatoide: ${probAR.toFixed(1)}%`;
  if (probOAText) probOAText.textContent = `Artrosis: ${probOA.toFixed(1)}%`;

  // Explicación clínica matemática detallada
  if (distMathEl) {
    const ccpAnalysis = np.anticcp >= 20 
      ? `• <strong style="color:#b91c1c;">Anti-CCP (${np.anticcp} U/mL):</strong> Positivo (especificidad >96% Artritis Reumatoide).`
      : `• <strong style="color:#1d4ed8;">Anti-CCP (${np.anticcp} U/mL):</strong> Negativo (típico de Artrosis).`;

    const dexaAnalysis = np.tscore <= -2.5
      ? `• <strong style="color:#b91c1c;">DEXA T-score (${np.tscore.toFixed(1)}):</strong> Cumple criterio OMS de Osteoporosis (≤ -2.5), fuertemente asociada a inflamación crónica sistémica (AR).`
      : `• <strong style="color:#1d4ed8;">DEXA T-score (${np.tscore.toFixed(1)}):</strong> Sin osteoporosis severa, congruente con Artrosis.`;

    const rxAnalysis = np.rxTipo === "ar"
      ? `• <strong style="color:#b91c1c;">Radiografía:</strong> Rotura y erosión cortical marginal + desestructuración (patrón AR).`
      : `• <strong style="color:#1d4ed8;">Radiografía:</strong> Desgaste con esclerosis subcondral y osteofitos (patrón Artrosis).`;

    distMathEl.innerHTML = `
      <strong>Análisis Multidimensional Integrado:</strong><br>
      ${ccpAnalysis}<br>
      ${dexaAnalysis}<br>
      ${rxAnalysis}<br>
      <div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px dashed #cbd5e1;">
        <strong>Distancias vectoriales ponderadas K-Means:</strong><br>
        • Distancia a Centroide AR (μ₁): <code>${distAR.toFixed(3)}</code> | Distancia a Centroide OA (μ₂): <code>${distOA.toFixed(3)}</code>
      </div>
    `;
  }
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
