/**
 * Laboratorio de Prompts Clínicos | URV AI Foundations
 * Lógica Interactiva y Reglas Pedagógicas Transparentes
 * Alumna: María José
 */

// Base de datos clínica simulada (embebida directamente para funcionamiento 100% offline y local vía file://)
const PACIENTES_SIMULADOS = {
  "PAC-001": {
    nombre: "Elena R.",
    edad: 68,
    sexo: "Femenino",
    motivo: "Astenia progresiva y disnea de esfuerzo",
    sintomas: "Disnea mMRC 2, fatiga vespertina, tos matutina seca sin expectoración (3 semanas)",
    antecedentes: "EPOC moderada, HTA en tratamiento con Enalapril, exfumadora (25 paquetes-año)",
    constantes: "TA: 135/82 mmHg | FC: 78 lpm | SatO2: 94% aire ambiente | Murmullo disminuido",
    notaDesordenada: "Paciente de 68 años que viene por cansancio desde hace unas 3 semanas aprox dice que le cuesta subir escaleras ahora tose un poco por las mañanas pero no saca flemas. Es exfumadora lo dejó hace 5 años fumaba un paquete al día desde joven. Tiene EPOC diagnosticado y toma broncodilatadores aunque a veces se olvida. También enalapril para la tensión. En triaje ta 135/82 fc 78 sat 94 por ciento aire ambiente. Murmullo disminuido. Habría que pedir placa de tórax y gasometría si empeora, no trajo su analítica de cabecera. Citar en neumología.",
    promptReferencia: "Actúa como asistente especialista en documentación sanitaria. A partir de la nota de triage de Elena R. (PAC-001): 1) Extrae y clasifica en una tabla Markdown [Categoría, Detalle Clínico, Estado/Valor]: síntomas, antecedentes, medicación habitual, constantes vitales y pruebas solicitadas. 2) Añade un apartado titulado 'Datos No Registrados' para explicitar lo que falte. 3) RESTRICCIONES: No inventes diagnósticos ni sugieras tratamientos médicos."
  },
  "PAC-002": {
    nombre: "Carlos M.",
    edad: 45,
    sexo: "Masculino",
    motivo: "Dolor torácico atípico",
    sintomas: "Molestia retroesternal opresiva que empeora en decúbito e inspiración profunda (4 días)",
    antecedentes: "Sin factores de riesgo cardiovascular conocidos. Deportista habitual de maratón",
    constantes: "TA: 120/75 mmHg | FC: 84 lpm | SatO2: 98% ambiente | Afebril",
    notaDesordenada: "Carlos 45 a. Llega hoy a consulta muy asustado por pinchazos en el centro del pecho que empezaron hace 4 días cuando corría. Dice que si se tumba en la cama le duele más y si se inclina adelante mejora un poco. No fuma ni tiene azúcar ni tensión alta. Corre maratones. ECG en sala de curas con elevación de ST cóncava en varias derivaciones. TA 120/75 sat 98. No tiene fiebre. Le pido enzimas cardiacas troponina urgente y ecocardio preferente. Le digo que no haga esfuerzos mientras tanto.",
    promptReferencia: "Actúa como documentalista médico en urgencias. Analiza la nota clínica de Carlos M. (PAC-002): 1) Genera un resumen estructurado en 4 viñetas: Características del dolor, Factores modificadores (postura/esfuerzo), Hallazgos electrocardiográficos y Pruebas urgentes en curso. 2) RESTRICCIÓN: Prohibido calificar la pericarditis como diagnóstico cerrado; formúlala únicamente como hipótesis de trabajo sujeta a troponinas."
  },
  "PAC-003": {
    nombre: "Beatriz S.",
    edad: 54,
    sexo: "Femenino",
    motivo: "Cefalea holocraneal continua",
    sintomas: "Dolor opresivo continuo, náuseas esporádicas sin vómitos ni fotofobia (10 días)",
    antecedentes: "Migrañas en la juventud, hipotiroidismo primario en tratamiento sustitutivo",
    constantes: "TA: 148/92 mmHg | FC: 70 lpm | SatO2: 99% ambiente",
    notaDesordenada: "Beatriz 54 años, dolor de cabeza desde hace 10 días continuo no cede con paracetamol. Se queja de náuseas pero come bien. TA algo alta 148/92, pulso regular. Tuvo migrañas de joven pero dice que este dolor es diferente, más sordo. Toma levotiroxina por tiroides. Exploración neurológica por ahora normal, pupilas reactivas, sin signos meníngeos. Le falta fondo de ojo y control de tensión en reposo.",
    promptReferencia: "Actúa como asistente de revisión neurológica ambulatoria. A partir del caso de Beatriz S.: 1) Presenta en una tabla comparativa los 'Signos de Alarma Presentes' frente a 'Signos de Alarma Ausentes'. 2) Especifica las exploraciones físicas pendientes. 3) RESTRICCIÓN: No emitas prescripción farmacológica ni reemplaces la evaluación neurológica presencial."
  },
  "PAC-004": {
    nombre: "Javier G.",
    edad: 72,
    sexo: "Masculino",
    motivo: "Síndrome confusional agudo y caída",
    sintomas: "Desorientación temporoespacial fluctuante, lentitud psicomotora acentuada (48 horas)",
    antecedentes: "Enfermedad de Parkinson (6 años), Diabetes Mellitus tipo 2",
    constantes: "TA: 115/65 mmHg | FC: 68 lpm | SatO2: 96% | T: 37.6ºC (febrícula)",
    notaDesordenada: "Ingresa por guardia paciente de 72 con Parkinson y diabetes desde hace años. Esposa refiere que desde antes de ayer está raro confunde nombres no sabe qué día es y ayer se cayó en el baño sin romperse nada. T 37.6 febril ta 115 65 saturando 96. Camina arrastrando pies más de lo habitual. No tiene síntomas respiratorios pero orina con olor fuerte según familia. Toma levodopa metformina y analgésicos por dolor de rodilla. Falta analítica de orina cultivo y revisar si tomó medicación de más.",
    promptReferencia: "Actúa como asistente de triage geriátrico. Para el paciente Javier G. (PAC-004): 1) Estructura una nota de pase de guardia con el método SBAR (Situación, Antecedentes, Evaluación de alertas, Recomendaciones pendientes). 2) Destaca la sospecha de infección urinaria o toxicidad farmacológica como alertas prioritarias. 3) RESTRICCIÓN: Prohibido descartar causas sin esperar el urocultivo."
  },
  "PAC-006": {
    nombre: "Antonio V.",
    edad: 61,
    sexo: "Masculino",
    motivo: "Dolor epigástrico y pirosis nocturna",
    sintomas: "Dispepsia postprandial, ardor retroesternal que despierta en la noche (2 meses)",
    antecedentes: "Hipercolesterolemia, consumo frecuente de ibuprofeno por lumbalgia mecánica",
    constantes: "TA: 130/80 mmHg | FC: 72 lpm | SatO2: 98% ambiente | Abdomen sin peritonismo",
    notaDesordenada: "Hombre 61 años remitido por su médico de familia. Lleva dos meses con ardor tras comidas y dolor en la boca del estómago que le despierta a medianoche. Toma ibuprofeno con frecuencia porque tiene lumbalgia mecánica. Sin pérdida de peso ni vómitos con sangre. Heces normales. Exploración abdominal normal solo molestias leves a la palpación profunda epigástrica. TA normal. No tiene test de aliento ni endoscopia previa. Sugiero pauta con IBP y programar endoscopia digestiva alta.",
    promptReferencia: "Actúa como documentalista de patología digestiva. Analiza el caso de Antonio V. (PAC-006): 1) Genera una lista de verificación con: Factor de riesgo farmacológico clave, Síntomas de alarma pesquisados y Pruebas invasivas propuestas. 2) RESTRICCIÓN: Advierte explícitamente sobre el riesgo del consumo crónico de AINEs sin afirmar la presencia de úlcera péptica hasta tener el informe endoscópico."
  }
};

// Plantillas de prompt preconfiguradas para aprendizaje guiado
const PLANTILLAS_PROMPTS = {
  vacio: "",
  deficiente: "Dime qué enfermedad tiene este paciente y qué medicamentos debería tomar para curarse rápido.",
  intermedio: "Por favor resume la nota del paciente Elena R. y extrae los síntomas principales y antecedentes en una lista ordenada.",
  avanzado: "Actúa como asistente de documentación clínica sanitaria. A partir de los datos del paciente seleccionado: 1) Extrae y clasifica en una tabla Markdown con columnas [Categoría, Hallazgo, Estado] los síntomas, duración, medicación actual, antecedentes y constantes. 2) Identifica y lista los 'Datos Clínicos No Registrados'. 3) RESTRICCIONES: No emitas ningún diagnóstico definitivo ni recomiendes modificaciones en fármacos. Reconoce explícitamente cualquier dato dudoso."
};

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initEditorStats();
  onCaseChange();
  assemblePrompt(); // Generar prompt inicial en constructor
});

// Navegación entre las 5 actividades
function initNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const step = parseInt(tab.getAttribute("data-step"));
      goToStep(step);
    });
  });
}

function goToStep(step) {
  // Ocultar todas las secciones
  document.querySelectorAll(".activity-section").forEach(sec => sec.classList.remove("active"));
  
  // Activar la seleccionada
  const activeSec = document.getElementById(`activity${step}`);
  if (activeSec) {
    activeSec.classList.add("active");
  }

  // Actualizar tabs
  document.querySelectorAll(".nav-tab").forEach(tab => {
    const tabStep = parseInt(tab.getAttribute("data-step"));
    if (tabStep === step) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Actualizar barra de progreso
  const progressPercent = step * 20;
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  if (progressBar) progressBar.style.width = `${progressPercent}%`;
  if (progressText) progressText.textContent = `Actividad ${step} de 5 (${progressPercent}%)`;

  window.scrollTo({ top: 120, behavior: "smooth" });
}

// Actividad 2: Constructor Visual RCTFR
function assemblePrompt() {
  const rol = document.getElementById("builderRol")?.value.trim() || "";
  const contexto = document.getElementById("builderContexto")?.value.trim() || "";
  const tarea = document.getElementById("builderTarea")?.value.trim() || "";
  const formato = document.getElementById("builderFormato")?.value.trim() || "";
  const restricciones = document.getElementById("builderRestricciones")?.value.trim() || "";

  const assembled = `${rol}
${contexto}

TAREA A EJECUTAR:
${tarea}

FORMATO DE SALIDA:
${formato}

RESTRICCIONES Y SEGURIDAD:
${restricciones}`;

  const targetArea = document.getElementById("assembledPromptText");
  if (targetArea) {
    targetArea.value = assembled;
  }
}

function loadDefaultBuilder() {
  document.getElementById("builderRol").value = "Actúa como asistente especialista en documentación sanitaria.";
  document.getElementById("builderContexto").value = "Trabajas analizando notas apresuradas de triage en el servicio de urgencias.";
  document.getElementById("builderTarea").value = "Extrae y categoriza los síntomas, duración, antecedentes relevantes, medicación actual, constantes vitales y pruebas pendientes.";
  document.getElementById("builderFormato").value = "Presenta la información en una tabla Markdown con las columnas: [Categoría, Detalle Clínico, Estado/Valor]. Incluye al final una lista de 'Datos No Registrados'.";
  document.getElementById("builderRestricciones").value = "No inventes información ausente. Prohibido sugerir tratamientos o emitir diagnósticos definitivos. Si un dato no consta, márcalo explícitamente como 'No registrado'.";
  assemblePrompt();
  showToast("Valores iniciales cargados en el constructor.");
}

function copyAssembledPrompt() {
  const text = document.getElementById("assembledPromptText")?.value;
  if (!text) return;
  copyText(text);
  const feedback = document.getElementById("copyFeedbackText");
  if (feedback) {
    feedback.classList.add("show");
    setTimeout(() => feedback.classList.remove("show"), 2000);
  }
}

// Actividad 3: Selector de Escenarios
function selectScenario(num) {
  const buttons = document.querySelectorAll(".scenario-btn");
  buttons.forEach((btn, index) => {
    if (index + 1 === num) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  for (let i = 1; i <= 3; i++) {
    const sc = document.getElementById(`scenario${i}`);
    if (sc) {
      if (i === num) {
        sc.classList.remove("hidden");
      } else {
        sc.classList.add("hidden");
      }
    }
  }
}

// Actividad 4: Selector de Pacientes y Editor
function onCaseChange() {
  const selector = document.getElementById("caseSelector");
  if (!selector) return;
  const caseId = selector.value;
  const paciente = PACIENTES_SIMULADOS[caseId];
  if (!paciente) return;

  const card = document.getElementById("patientDataCard");
  if (card) {
    card.innerHTML = `
      <div class="case-header">
        <span class="case-id">Ficha: ${paciente.nombre} (${paciente.edad} años, ${paciente.sexo}) • ID: ${caseId}</span>
        <span class="case-badge">${paciente.motivo}</span>
      </div>
      <div style="font-size:0.85rem; margin: 0.5rem 0; color:#334155;">
        <strong>Constantes vitales:</strong> ${paciente.constantes}<br>
        <strong>Antecedentes:</strong> ${paciente.antecedentes}
      </div>
      <div style="font-size:0.8rem; font-weight:700; color:#64748b; margin-top:0.5rem;">TEXTO DE LA NOTA MÉDICA ORIGINAL (DESORDENADA):</div>
      <div class="clinical-note-content" style="margin-top:0.25rem;">${paciente.notaDesordenada}</div>
    `;
  }
}

function initEditorStats() {
  const area = document.getElementById("promptEditorArea");
  if (!area) return;
  area.addEventListener("input", () => {
    const text = area.value;
    const chars = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    
    document.getElementById("charCount").textContent = `${chars} caracteres`;
    document.getElementById("wordCount").textContent = `${words} palabras`;
  });
}

function applyTemplate() {
  const select = document.getElementById("templateSelector");
  const area = document.getElementById("promptEditorArea");
  if (!select || !area) return;
  const key = select.value;
  if (PLANTILLAS_PROMPTS[key] !== undefined) {
    area.value = PLANTILLAS_PROMPTS[key];
    area.dispatchEvent(new Event("input"));
    analyzeCurrentPrompt();
  }
}

function loadReferencePrompt() {
  const selector = document.getElementById("caseSelector");
  const caseId = selector ? selector.value : "PAC-001";
  const paciente = PACIENTES_SIMULADOS[caseId];
  const area = document.getElementById("promptEditorArea");
  if (paciente && area) {
    area.value = paciente.promptReferencia;
    area.dispatchEvent(new Event("input"));
    analyzeCurrentPrompt();
    showToast("Propuesta de referencia cargada en el editor.");
  }
}

// Analizador Educativo del Prompt (Reglas Pedagógicas Transparentes)
function analyzeCurrentPrompt() {
  const text = (document.getElementById("promptEditorArea")?.value || "").toLowerCase();
  
  if (text.trim().length === 0) {
    updateScore(0, "Prompt Vacío", "Escribe una instrucción para iniciar el análisis pedagógico.");
    resetChecklist();
    return;
  }

  // 1. Detección de ROL
  const hasRol = /(act[uú]a como|eres un|rol:|asistente|documentalista|triage|investigador|revisor|m[eé]dico|especialista)/i.test(text);
  
  // 2. Detección de CONTEXTO
  const hasContexto = /(paciente|urgencias|consulta|cl[ií]nic|estudio|fictici|hospital|s[ií]ntoma|nota)/i.test(text);

  // 3. Detección de TAREA
  const hasTarea = /(extrae|organiza|resume|clasifica|identifica|analiza|prepara|sintetiza|genera|lista)/i.test(text);

  // 4. Detección de FORMATO
  const hasFormato = /(tabla|columnas|markdown|vi[nñ]etas|sbar|lista numerada|formato|apartado|categor[ií]a)/i.test(text);

  // 5. Detección de RESTRICCIONES Y SEGURIDAD
  const hasRestriccion = /(no inventes|no diagnost|prohibido|evita|no prescrib|no const|no registrado|restricci[oó]n|incertidumbre|l[ií]mite)/i.test(text);

  // Marcador de peligro: Si pide que la IA diagnostique directamente sin restricción
  const dangerDiagnostico = /(dime qu[eé] tiene|diagnostica|qu[eé] enfermedad tiene|qu[eé] medicina le receto)/i.test(text) && !hasRestriccion;

  // Actualizar checklist visual
  setCheckItem("checkRol", hasRol);
  setCheckItem("checkContexto", hasContexto);
  setCheckItem("checkTarea", hasTarea);
  setCheckItem("checkFormato", hasFormato);
  setCheckItem("checkRestriccion", hasRestriccion);

  // Cálculo de Puntuación Pedagógica
  let score = 0;
  if (hasRol) score += 20;
  if (hasContexto) score += 20;
  if (hasTarea) score += 20;
  if (hasFormato) score += 20;
  if (hasRestriccion) score += 20;

  if (dangerDiagnostico) {
    score = Math.max(0, score - 30);
  }

  // Feedback pedagógico
  let feedback = "";
  if (dangerDiagnostico) {
    feedback = "⚠️ <strong>Alerta Ética:</strong> Tu prompt pide un diagnóstico directo o fármacos sin restricciones. En salud, la IA debe asistir en la organización de datos, nunca suplantar la decisión médica.";
  } else if (score === 100) {
    feedback = "🌟 <strong>¡Excelente arquitectura de prompt!</strong> Cumples los 5 elementos (RCTFR). Tienes rol definido, tarea concreta, formato de salida y protección contra alucinaciones.";
  } else if (score >= 60) {
    feedback = "👍 <strong>Buen progreso:</strong> La instrucción es útil pero aún puede mejorar. Revisa los puntos grises en la lista para agregar mayor precisión o límites de seguridad.";
  } else {
    feedback = "💡 <strong>Prompt muy básico o ambiguo:</strong> La IA podría generar texto libre divagante. Añade un Rol ('Actúa como...') y especifica un formato como tabla o viñetas.";
  }

  updateScore(score, `Calidad: ${score} / 100`, feedback);
}

function setCheckItem(elementId, passed) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const icon = el.querySelector(".icon");
  if (passed) {
    el.className = "check-item passed";
    if (icon) icon.textContent = "✅";
  } else {
    el.className = "check-item failed";
    if (icon) icon.textContent = "❌";
  }
}

function resetChecklist() {
  ["checkRol", "checkContexto", "checkTarea", "checkFormato", "checkRestriccion"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = "check-item";
    const icon = el.querySelector(".icon");
    if (icon) icon.textContent = "⚪";
  });
}

function updateScore(score, title, feedback) {
  const scoreNum = document.getElementById("qualityScore");
  const scoreTitle = document.getElementById("scoreTitle");
  const feedbackCard = document.getElementById("analysisFeedback");

  if (scoreNum) scoreNum.textContent = score > 0 ? `${score}%` : "--";
  if (scoreTitle) scoreTitle.textContent = title;
  if (feedbackCard) feedbackCard.innerHTML = feedback;
}

function copyCurrentPrompt() {
  const text = document.getElementById("promptEditorArea")?.value;
  if (!text) {
    showToast("El editor está vacío.");
    return;
  }
  copyText(text);
}

// Actividad 5: Evaluación del Desafío Final
function evaluateFinalChallenge() {
  const text = (document.getElementById("finalPromptInput")?.value || "").toLowerCase();
  
  if (text.trim().length === 0) {
    showToast("Por favor redacta tu propuesta en el área de texto.");
    return;
  }

  // 1. Rol de metodólogo / revisor
  const r1 = /(metod[oó]log|revisor|evaluador|investigador|auditor)/i.test(text);
  // 2. Identificación de vacíos
  const r2 = /(vac[ií]os|faltante|ausente|no especifica|lagunas|disponible)/i.test(text);
  // 3. Riesgos y sesgos
  const r3 = /(sesgo|riesgo|seguridad|peligro|validez)/i.test(text);
  // 4. Formato
  const r4 = /(tabla|columnas|lista|vi[nñ]etas)/i.test(text);
  // 5. Incertidumbre / No inventar
  const r5 = /(no inventes|no supongas|incertidumbre|no especificado|prohibido)/i.test(text);

  setRubricItem("rubric1", r1);
  setRubricItem("rubric2", r2);
  setRubricItem("rubric3", r3);
  setRubricItem("rubric4", r4);
  setRubricItem("rubric5", r5);

  const total = [r1, r2, r3, r4, r5].filter(Boolean).length;
  showToast(`Evaluación completada: ${total} de 5 criterios superados.`);
}

function setRubricItem(id, pass) {
  const el = document.getElementById(id);
  if (!el) return;
  const status = el.querySelector(".rubric-status");
  if (pass) {
    el.className = "rubric-item pass";
    if (status) status.textContent = "✅";
  } else {
    el.className = "rubric-item";
    if (status) status.textContent = "❌";
  }
}

function copyFinalPrompt() {
  const text = document.getElementById("finalPromptInput")?.value;
  if (!text) {
    showToast("Escribe primero un prompt en el desafío final.");
    return;
  }
  copyText(text);
}

// Utilidades generales: Copiado y Toasts
function copySnippet(id) {
  const el = document.getElementById(id);
  if (!el) return;
  copyText(el.innerText || el.textContent);
}

function copyText(str) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(str).then(() => {
      showToast("¡Prompt copiado al portapapeles!");
    }).catch(() => fallbackCopy(str));
  } else {
    fallbackCopy(str);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast("¡Prompt copiado al portapapeles!");
  } catch (err) {
    showToast("No se pudo copiar automáticamente. Selecciónalo manualmente.");
  }
  document.body.removeChild(textArea);
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function toggleSolution(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("hidden");
}
