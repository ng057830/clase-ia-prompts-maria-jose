# Plan de Clase: Fundamentos de IA y Prompt Engineering Clínico
**Alumna:** María José  
**Fecha de la Sesión:** 31 de Octubre de 2026  
**Duración:** 50 minutos  
**Inspiración Curricular:** Introducción a la IA Generativa (estilo *Artificial Intelligence Foundations* - Universitat Rovira i Virgili, URV)  
**Ubicación:** `Clase_IA_Prompts_Maria_Jose_20261031/`

---

## 🌟 Cómo Iniciar la Clase en 10 Segundos

1. **Abre el laboratorio de prompts clínicos:**  
   Haz doble clic sobre [`aplicativo/index.html`](file:///g:/My%20Drive/Folios/Beamer/2026-05-25/MARIA%20JOSE/Clase_IA_Prompts_Maria_Jose_20261031/aplicativo/index.html).  
   *No requiere instalación, ni servidor, ni internet, ni API keys.*

2. **Abre el simulador interactivo de K-Means (Bailarines ~30 años):**  
   Haz doble clic sobre [`aplicativo_kmeans/index.html`](file:///g:/My%20Drive/Folios/Beamer/2026-05-25/MARIA%20JOSE/Clase_IA_Prompts_Maria_Jose_20261031/aplicativo_kmeans/index.html).  
   *Diferenciación de casos críticos en danza: Artrosis Mecánica vs. Artritis Reumatoide mediante 5 variables clínicas cuantitativas (Rigidez, Nº Articulaciones, Índice de Simetría Bilateral %, Score Inflamatorio 0-10 y Anti-CCP, sin PCR).*

3. **Abre la guía docente:**  
   Consulta [`guia_profesor.txt`](file:///g:/My%20Drive/Folios/Beamer/2026-05-25/MARIA%20JOSE/Clase_IA_Prompts_Maria_Jose_20261031/guia_profesor.txt) en tu editor o en una ventana secundaria para tener las respuestas exactas, tiempos de control y estrategias para gestionar el ritmo de María José.

---

## 🧭 Estructura de la Carpeta

```text
Clase_IA_Prompts_Maria_Jose_20261031/
│
├── README.md                          <- Este documento general de bienvenida y uso
├── guia_profesor.txt                  <- Soluciones completas, tiempos y tips pedagógicos
│
├── enunciados/                        <- Hojas de trabajo independientes para la alumna
│   ├── 01_introduccion_ia_prompts.txt <- Actividad 1: Concepto y comparativa Prompt A vs B (8 min)
│   ├── 02_construccion_prompts.txt    <- Actividad 2: Método 5 Elementos (RCTFR) (12 min)
│   ├── 03_casos_clinicos.txt          <- Actividad 3: Tres escenarios en salud e investigación (15 min)
│   └── 04_desafio_final.txt           <- Actividad 5: Protocolo incompleto y rúbrica (5 min)
│
├── datos/                             <- Conjuntos de datos simulados (100% ficticios)
│   ├── pacientes_ficticios.csv        <- 8 perfiles clínicos completos con constantes y antecedentes
│   ├── notas_clinicas.csv             <- Notas médicas de urgencias/consulta intencionalmente desordenadas
│   └── ejercicios_prompts.csv         <- Catálogo de prompts deficientes, problemas y criterios de mejora
│
├── aplicativo/                        <- Herramienta interactiva de prompts clínicos
│   ├── index.html                     <- Interfaz visual web para usar en clase
│   ├── styles.css                     <- Diseño limpio clínico/tecnológico, responsive
│   └── app.js                         <- Lógica interactiva y evaluador pedagógico transparente
│
└── aplicativo_kmeans/                 <- Simulador de Machine Learning Clínico (K=2)
    ├── index.html                     <- Simulador AR vs. Artrosis en bailarines (Simetría, Inflamación, Rigidez, Anti-CCP)
    ├── styles.css                     <- Estilos clínicos para tarjetas de bailarines y gráficos
    └── app.js                         <- Algoritmo K-Means, centroides en danza, proyecciones y paciente sorpresa
```

---

## ⏱️ Secuencia Didáctica de 50 Minutos

| Minutos | Actividad | Objetivo Central |
|---|---|---|
| **00:00 - 08:00** | **1. Primer contacto con la IA** | Comparar el Prompt A ("dime qué tiene") con el Prompt B estructurado. Entender por qué la IA no diagnostica. |
| **08:00 - 20:00** | **2. Método de los 5 Elementos (RCTFR)** | Transformar una nota caótica de triage (Elena R., 68 años) en una tabla limpia usando Rol, Contexto, Tarea, Formato y Restricciones. |
| **20:00 - 35:00** | **3. Tres Escenarios del Mundo Real** | 1) Pase de guardia geriátrico (Javier G.), 2) Síntesis de estudio clínico con sesgos, 3) Preguntas de anamnesis sin encasillar diagnósticos. |
| **35:00 - 45:00** | **4. Laboratorio Interactivo** | Utilizar el aplicativo web para redactar, analizar y obtener un puntaje pedagógico (0-100%) con retroalimentación inmediata. |
| **45:00 - 50:00** | **5. Desafío Final del Prompt Maestro** | Resolver un protocolo de investigación incompleto declarando incertidumbre y datos faltantes. Autoevaluación con rúbrica. |

---

## 🎯 Tips Pedagógicos para Trabajar con María José

- **Perfil:** María José es muy habladora, curiosa y tiende a dispersarse con relatos de casos o divagaciones.
- **Estrategia "Time-Boxing":** Dile amablemente al iniciar cada bloque: *"María José, tenemos 8 minutos exactos para este reto, ¡vamos al grano!"*.
- **Preguntas Operativas:** Evita preguntas abiertas del tipo *"¿Qué piensas de la tecnología?"*. Usa preguntas cerradas: *"En esta frase, ¿dónde está el Rol y dónde la Restricción?"*.
- **Anclaje en la Pantalla:** Utiliza el aplicativo interactivo para mantenerla enfocada en los campos concretos (Rol, Tarea, Formato). Si empieza a divagar, pídele que copie el prompt y observe el resultado.

---

## 🔒 Rigor Ético y Seguridad

- Todos los datos, nombres y notas son **100% ficticios y creados con fines pedagógicos**.
- La aplicación **no conecta con ninguna API ni finge ser un médico artificial**: funciona mediante reglas de evaluación didáctica transparentes.
- Se inculca en todo momento que la IA es una herramienta de organización documental y soporte analítico que jamás sustituye la evaluación médica profesional.
