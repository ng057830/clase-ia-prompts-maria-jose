/**
 * Simulador K-Means Reumatológico: Artritis Reumatoide vs. Artrosis
 * URV AI Foundations - Alumna: María José
 */

// Rangos de normalización clínica para el espacio 3D [0, 1]
const SCALES = {
  rigidez: { min: 0, max: 150 },      // Minutos de rigidez matutina
  pcr: { min: 0, max: 80 },           // Proteína C Reactiva en mg/L
  articulaciones: { min: 0, max: 20 } // Conteo de articulaciones tumefactas/dolorosas
};

// 10 Pacientes de entrenamiento (5 AR, 5 Artrosis con datos típicos)
const PACIENTES_ENTRENAMIENTO = [
  { id: "PAC-01", nombre: "Carmen S.", rigidez: 90, pcr: 48, articulaciones: 12, dxReal: "AR", dxMariaJose: null },
  { id: "PAC-02", nombre: "Manuel G.", rigidez: 15, pcr: 2.1, articulaciones: 2, dxReal: "OA", dxMariaJose: null },
  { id: "PAC-03", nombre: "Teresa L.", rigidez: 110, pcr: 62, articulaciones: 14, dxReal: "AR", dxMariaJose: null },
  { id: "PAC-04", nombre: "Antonio R.", rigidez: 10, pcr: 1.5, articulaciones: 1, dxReal: "OA", dxMariaJose: null },
  { id: "PAC-05", nombre: "Isabel V.", rigidez: 75, pcr: 35, articulaciones: 9, dxReal: "AR", dxMariaJose: null },
  { id: "PAC-06", nombre: "Vicente M.", rigidez: 20, pcr: 3.8, articulaciones: 3, dxReal: "OA", dxMariaJose: null },
  { id: "PAC-07", nombre: "Rosa P.", rigidez: 120, pcr: 55, articulaciones: 16, dxReal: "AR", dxMariaJose: null },
  { id: "PAC-08", nombre: "Francisco D.", rigidez: 8, pcr: 0.9, articulaciones: 2, dxReal: "OA", dxMariaJose: null },
  { id: "PAC-09", nombre: "Dolores B.", rigidez: 85, pcr: 40, articulaciones: 11, dxReal: "AR", dxMariaJose: null },
  { id: "PAC-10", nombre: "Juan C.", rigidez: 12, pcr: 2.4, articulaciones: 4, dxReal: "OA", dxMariaJose: null }
];

// Estado global de la aplicación
let appState = {
  pacientes: JSON.parse(JSON.stringify(PACIENTES_ENTRENAMIENTO)),
  centroides: null, // { AR: {rigidez, pcr, articulaciones}, OA: {...} }
  pacienteNuevo: { rigidez: 80, pcr: 42, articulaciones: 10 },
  proyeccionActual: "rigidez_pcr" // "rigidez_pcr" | "rigidez_art" | "pcr_art"
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderPatientsGrid();
  initSliders();
  initCanvas();
  updateStatusCounter();
});

// Renderizar tarjetas de los 10 pacientes
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

    card.innerHTML = `
      <div>
        <div class="p-top">
          <span class="p-id">${p.id}</span>
          ${badgeHtml}
        </div>
        <div style="font-size:0.75rem; color:#64748b; margin-bottom:0.3rem;">${p.nombre}</div>
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
  
  // Si ya se habían calculado centroides, recalculamos en tiempo real
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
  showToast("Todos los pacientes diagnosticados según criterio reumatológico.");
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
// CÁLCULO DE CENTROIDES K-MEANS EN ESPACIO 3D
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

  // Centroide Artritis Reumatoide (Media aritmética en las 3 variables)
  const centroidAR = {
    rigidez: arList.reduce((acc, p) => acc + p.rigidez, 0) / arList.length,
    pcr: arList.reduce((acc, p) => acc + p.pcr, 0) / arList.length,
    articulaciones: arList.reduce((acc, p) => acc + p.articulaciones, 0) / arList.length,
    count: arList.length
  };

  // Centroide Artrosis (Media aritmética en las 3 variables)
  const centroidOA = {
    rigidez: oaList.reduce((acc, p) => acc + p.rigidez, 0) / oaList.length,
    pcr: oaList.reduce((acc, p) => acc + p.pcr, 0) / oaList.length,
    articulaciones: oaList.reduce((acc, p) => acc + p.articulaciones, 0) / oaList.length,
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

  document.getElementById("oaCount").textContent = `${oa.count} pacientes`;
  document.getElementById("oaRigidez").textContent = `${oa.rigidez.toFixed(1)} min`;
  document.getElementById("oaPcr").textContent = `${oa.pcr.toFixed(1)} mg/L`;
  document.getElementById("oaArt").textContent = `${oa.articulaciones.toFixed(1)}`;
}

// =========================================================================
// VISUALIZADOR 2D/3D (HTML5 Canvas)
// =========================================================================

function initCanvas() {
  const canvas = document.getElementById("scatterCanvas");
  if (!canvas) return;
  canvas.width = 540;
  canvas.height = 340;
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
  const padLeft = 60;
  const padBottom = 45;
  const padRight = 30;
  const padTop = 30;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  // Configuración de ejes según proyección
  let xProp, yProp, xLabel, yLabel, xScale, yScale;

  if (appState.proyeccionActual === "rigidez_pcr") {
    xProp = "rigidez"; yProp = "pcr";
    xLabel = "Rigidez Matutina (min)"; yLabel = "PCR (mg/L)";
    xScale = SCALES.rigidez; yScale = SCALES.pcr;
  } else if (appState.proyeccionActual === "rigidez_art") {
    xProp = "rigidez"; yProp = "articulaciones";
    xLabel = "Rigidez Matutina (min)"; yLabel = "Articulaciones Dolorosas";
    xScale = SCALES.rigidez; yScale = SCALES.articulaciones;
  } else {
    xProp = "pcr"; yProp = "articulaciones";
    xLabel = "PCR en Sangre (mg/L)"; yLabel = "Articulaciones Dolorosas";
    xScale = SCALES.pcr; yScale = SCALES.articulaciones;
  }

  // Dibujar cuadrícula suave
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    // Líneas verticales
    const x = padLeft + (plotW / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
    ctx.stroke();

    const xVal = Math.round(xScale.min + ((xScale.max - xScale.min) / 5) * i);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(xVal, x, padTop + plotH + 16);

    // Líneas horizontales
    const y = padTop + plotH - (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();

    const yVal = Math.round(yScale.min + ((yScale.max - yScale.min) / 5) * i);
    ctx.textAlign = "right";
    ctx.fillText(yVal, padLeft - 8, y + 4);
  }

  // Títulos de ejes
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(xLabel, padLeft + plotW / 2, h - 8);

  ctx.save();
  ctx.translate(16, padTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  // Función de mapeo de valores a coordenadas en canvas
  function mapX(val) {
    return padLeft + ((val - xScale.min) / (xScale.max - xScale.min)) * plotW;
  }
  function mapY(val) {
    return padTop + plotH - ((val - yScale.min) / (yScale.max - yScale.min)) * plotH;
  }

  // Dibujar puntos de los pacientes de entrenamiento
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

    // Etiqueta del ID
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(p.id.replace("PAC-", "P"), cx + 8, cy - 4);
  });

  // Si hay centroides calculados, dibujarlos como cruces / estrellas grandes
  if (appState.centroides) {
    // Centroide AR
    const cAR = appState.centroides.AR;
    const arX = mapX(cAR[xProp]);
    const arY = mapY(cAR[yProp]);
    drawCentroidMarker(ctx, arX, arY, "#dc2626", "Centroide AR (μ₁)");

    // Centroide OA
    const cOA = appState.centroides.OA;
    const oaX = mapX(cOA[xProp]);
    const oaY = mapY(cOA[yProp]);
    drawCentroidMarker(ctx, oaX, oaY, "#2563eb", "Centroide OA (μ₂)");
  }

  // Dibujar Paciente Nuevo (Punto Amarillo resplandeciente)
  if (appState.pacienteNuevo) {
    const npX = mapX(appState.pacienteNuevo[xProp]);
    const npY = mapY(appState.pacienteNuevo[yProp]);

    // Resplandor
    ctx.beginPath();
    ctx.arc(npX, npY, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
    ctx.fill();

    // Punto central
    ctx.beginPath();
    ctx.arc(npX, npY, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#eab308";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Etiqueta
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

  // Cruz grande
  const size = 10;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  // Círculo concéntrico
  ctx.beginPath();
  ctx.arc(x, y, size + 2, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.stroke();

  // Etiqueta
  ctx.font = "bold 9px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(label, x + size + 4, y + 3);
  ctx.restore();
}

// =========================================================================
// PASO 3: PACIENTE NUEVO ALEATORIO Y PREDICCIÓN DE LA IA
// =========================================================================

function initSliders() {
  const sRigidez = document.getElementById("sliderRigidez");
  const sPcr = document.getElementById("sliderPcr");
  const sArt = document.getElementById("sliderArt");

  function onSliderChange() {
    appState.pacienteNuevo.rigidez = parseFloat(sRigidez.value);
    appState.pacienteNuevo.pcr = parseFloat(sPcr.value);
    appState.pacienteNuevo.articulaciones = parseInt(sArt.value);

    document.getElementById("valRigidez").textContent = `${appState.pacienteNuevo.rigidez} min`;
    document.getElementById("valPcr").textContent = `${appState.pacienteNuevo.pcr.toFixed(1)} mg/L`;
    document.getElementById("valArt").textContent = `${appState.pacienteNuevo.articulaciones}`;

    drawScatter();
    evaluateNewPatient();
  }

  sRigidez?.addEventListener("input", onSliderChange);
  sPcr?.addEventListener("input", onSliderChange);
  sArt?.addEventListener("input", onSliderChange);
}

// Generar paciente nuevo con medidas aleatorias pero biológicamente coherentes
function generateRandomPatient() {
  // Elegimos al azar generar un perfil con tendencia inflamatoria (AR) o degenerativa (OA)
  const isAR = Math.random() > 0.5;

  let r, p, a;
  if (isAR) {
    r = Math.floor(60 + Math.random() * 65);       // 60 a 125 min
    p = parseFloat((25 + Math.random() * 45).toFixed(1)); // 25 a 70 mg/L
    a = Math.floor(7 + Math.random() * 10);        // 7 a 16 artic.
  } else {
    r = Math.floor(5 + Math.random() * 20);        // 5 a 25 min
    p = parseFloat((0.8 + Math.random() * 3.5).toFixed(1)); // 0.8 a 4.3 mg/L
    a = Math.floor(1 + Math.random() * 4);         // 1 a 4 artic.
  }

  document.getElementById("sliderRigidez").value = r;
  document.getElementById("sliderPcr").value = p;
  document.getElementById("sliderArt").value = a;

  appState.pacienteNuevo = { rigidez: r, pcr: p, articulaciones: a };

  document.getElementById("valRigidez").textContent = `${r} min`;
  document.getElementById("valPcr").textContent = `${p} mg/L`;
  document.getElementById("valArt").textContent = `${a}`;

  drawScatter();
  evaluateNewPatient();
  showToast("¡Nuevo paciente simulado generado!");
}

// Cargar un paciente límite o dudoso para generar debate clínico
function loadBorderlinePatient() {
  const r = 40;  // Rigidez intermedia
  const p = 14.0; // PCR ligeramente elevada
  const a = 6;   // 6 articulaciones

  document.getElementById("sliderRigidez").value = r;
  document.getElementById("sliderPcr").value = p;
  document.getElementById("sliderArt").value = a;

  appState.pacienteNuevo = { rigidez: r, pcr: p, articulaciones: a };

  document.getElementById("valRigidez").textContent = `${r} min`;
  document.getElementById("valPcr").textContent = `${p} mg/L`;
  document.getElementById("valArt").textContent = `${a}`;

  drawScatter();
  evaluateNewPatient();
  showToast("Paciente con valores intermedios cargado.");
}

// Evaluar el paciente nuevo con la distancia euclidiana tridimensional normalizada
function evaluateNewPatient() {
  if (!appState.centroides) return;

  const np = appState.pacienteNuevo;
  const cAR = appState.centroides.AR;
  const cOA = appState.centroides.OA;

  // Coordenadas normalizadas [0, 1] del paciente nuevo
  const npNorm = {
    r: normalizeVal(np.rigidez, SCALES.rigidez),
    p: normalizeVal(np.pcr, SCALES.pcr),
    a: normalizeVal(np.articulaciones, SCALES.articulaciones)
  };

  // Coordenadas normalizadas de los centroides
  const arNorm = {
    r: normalizeVal(cAR.rigidez, SCALES.rigidez),
    p: normalizeVal(cAR.pcr, SCALES.pcr),
    a: normalizeVal(cAR.articulaciones, SCALES.articulaciones)
  };

  const oaNorm = {
    r: normalizeVal(cOA.rigidez, SCALES.rigidez),
    p: normalizeVal(cOA.pcr, SCALES.pcr),
    a: normalizeVal(cOA.articulaciones, SCALES.articulaciones)
  };

  // Distancia euclidiana tridimensional d = sqrt(dr^2 + dp^2 + da^2)
  const distAR = Math.sqrt(
    Math.pow(npNorm.r - arNorm.r, 2) +
    Math.pow(npNorm.p - arNorm.p, 2) +
    Math.pow(npNorm.a - arNorm.a, 2)
  );

  const distOA = Math.sqrt(
    Math.pow(npNorm.r - oaNorm.r, 2) +
    Math.pow(npNorm.p - oaNorm.p, 2) +
    Math.pow(npNorm.a - oaNorm.a, 2)
  );

  // Conversión de distancias a probabilidades (Softmax con temperatura)
  const tau = 0.25; // Sensibilidad de frontera
  const expAR = Math.exp(-distAR / tau);
  const expOA = Math.exp(-distOA / tau);
  const probAR = (expAR / (expAR + expOA)) * 100;
  const probOA = (expOA / (expAR + expOA)) * 100;

  // Veredicto
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

  if (distMathEl) {
    distMathEl.innerHTML = `
      <strong>Distancias calculadas por K-Means en el espacio 3D:</strong><br>
      • Distancia a Centroide AR (μ₁): <code>${distAR.toFixed(3)}</code> unidades<br>
      • Distancia a Centroide OA (μ₂): <code>${distOA.toFixed(3)}</code> unidades<br>
      <em>Criterio matemático: El paciente se asigna al centroide con menor distancia euclidiana normalizada.</em>
    `;
  }
}

// Toast flotante
function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
