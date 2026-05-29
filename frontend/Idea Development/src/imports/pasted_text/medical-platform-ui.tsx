Actúa como un Diseñador de UI/UX Senior experto en sistemas médicos de alta complejidad y entornos IoT. Necesito que generes la interfaz visual de alta fidelidad, interactiva y estructurada para una plataforma médica web (Frontend en React + Vite). 

El sistema complementa la evaluación clínica del temblor en manos mediante la prueba de la "Espiral de Arquímedes", utilizando un dispositivo ESP32 conectado con sensores inerciales (MPU6050, LSM303DLHC) y de presión (FSR402). 

REQUISITOS DE ESTILO VISUAL Y ACCESIBILIDAD MÉDICA:
- Paleta de Colores: Estilo clínico-orgánico, limpio y relajante. Fondo general en verde menta o salvia muy pálido (#F4F7F5) para reducir la fatiga visual. Contenedores y tarjetas en blanco puro (#FFFFFF). Acentos en verde quirúrgico desaturado (#3B7A57) para estados activos. Textos en gris carbón oscuro (#2F3E46).
- Accesibilidad (Pacientes con Temblor Motor): Evitar menús desplegables densos o micro-componentes que requieran motricidad fina. Todos los elementos interactivos del paciente deben tener un área de clic (hitbox) masiva. Contrastes elevados (mínimo 4.5:1 WCAG AA) y tipografías grandes (mínimo 16pt para instrucciones).

ESTRUCTURA DE NAVIGACIÓN INTERNA (Simulación en React):
La interfaz no utiliza librerías externas de rutas; la navegación se maquetará basándose en estados condicionales de React (useState). Diseña exactamente las siguientes 3 pantallas con sus componentes atómicos mapeados:

---

1. PANTALLA DE PREPARACIÓN Y CAPTURA ACTIVA (Módulo Paciente)
- Propósito: Controlar el flujo de inicio, adquisición y parada de la prueba (HU-01, HU-02, HU-09).
- Elementos Visuales Clave:
  * Campo de selección grande y limpio para vincular el ID o Nombre del Paciente.
  * Tarjeta de Estado del Hardware (ESP32): Un indicador LED visual con tres estados configurados como variantes: 1) "Desconectado" (Rojo), 2) "Sincronizando" (Amarillo), 3) "Listo para Captura" (Verde).
  * Botón "Iniciar Prueba" (HU-01): Un botón masivo (mínimo 64px de altura) de color verde clínico. Al hacer clic (Active State), simula un loader que registra el Timestamp/fecha-hora de inicio y genera un ID único de sesión.
  * Interfaz de Grabación Activa: Al iniciar, el botón cambia a un estado de alerta "Grabando..." acompañado de un cronómetro dinámico y un contador de muestras. Añade un Lienzo Guía central que muestre de fondo la silueta de una Espiral de Arquímedes.
  * Indicador de Memoria Buffer (HU-09): Una barra de progreso que emula el almacenamiento temporal del ESP32. Debe cambiar de color según umbrales: Verde (0-50%), Amarillo (51-80%) y Rojo Parpadeante (>80%) con un banner de advertencia: "Riesgo de pérdida de datos por conectividad".
  * Botón "Finalizar Prueba" (HU-02): Ubicado estratégicamente lejos de los bordes, de color rojo alerta (#E53E3E). Al accionarse, muestra una transición corta de "Guardando y Validando Sesión...".

---

2. DASHBOARD E HISTORIAL DE SESIONES (Módulo Médico)
- Propósito: Permitir al profesional de la salud consultar y buscar el registro histórico de pruebas (HU-12).
- Elementos Visuales Clave:
  * Barra superior (Header) con la información del médico activo, logotipo minimalista de una espiral médica y barra de búsqueda global.
  * Filtros de Búsqueda Avanzada: selectores limpios para filtrar por Rango de Fechas, ID de Sesión y Severidad del Temblor.
  * Tabla de Historial Clínico (HU-12): Tabla estructurada y limpia con columnas legibles para: [ID de Sesión (UUID corto)], [Fecha y Hora de Inicio], [Duración de la Prueba], [Estado de Validación Backend] y [Acciones].
  * Variantes de Estado en la Tabla: 
    - Las filas deben mostrar estados de carga (Skeleton Screens) para simular una respuesta ágil de carga de datos en menos de 2 segundos.
    - La columna "Estado de Validación Backend" (HU-10) debe incluir Badges visuales: un badge verde para "JSON Válido / Datos Estructurados" y un badge rojo para "Muestra Corrupta / Rechazada".
  * Acciones de Fila: Un botón con ícono de ojo o gráfica ("Ver Detalle Analítico") que cambie el estado de navegación hacia la pantalla de detalle.

---

3. VISUALIZACIÓN ANALÍTICA Y DETALLE DE PRUEBA (Módulo Médico Avanzado)
- Propósito: Desplegar la telemetría multieje completa de los sensores para el análisis del movimiento motor (HU-13, HU-14).
- Elementos Visuales Clave:
  * Botón prominente en la esquina superior izquierda: "<- Volver al Historial de Sesiones".
  * Panel de Metadatos de la Sesión: Tarjeta lateral fija que muestra el ID Único de sesión consultada, fecha exacta, y confirmación de persistencia del 95% en base de datos PostgreSQL (HU-11).
  * Grid Sincronizado de Gráficas Temporales (HU-13, HU-14): Diseña un layout de rejilla vertical con 4 gráficas lineales 2D independientes pero perfectamente alineadas en el eje X (Tiempo). Cada gráfica representa una variable de los sensores:
    1. Gráfica 1 (Aceleración MPU6050): Tres curvas continuas (Ejes X, Y, Z) usando colores contrastantes de alta visibilidad (Ej: Azul, Naranja, Púrpura). Evitar usar rojo y verde juntos.
    2. Gráfica 2 (Velocidad Angular MPU6050): Tres curvas continuas para los ejes de rotación del giroscopio.
    3. Gráfica 3 (Campo Magnético y Orientación LSM303DLHC): Tres curvas continuas de comportamiento espacial.
    4. Gráfica 4 (Presión Aplicada FSR402): Una única curva continua y robusta que representa la fuerza ejercida sobre el lápiz durante el trazado de la espiral.
  * Interacción Avanzada del Gráfico (Hover State / Tooltip): Prototipa el estado en el que el médico pasa el cursor sobre cualquier punto temporal de una gráfica. Debe aparecer una línea guía vertical que cruce las 4 gráficas simultáneamente, desplegando un cuadro flotante (Tooltip) con los valores numéricos exactos de todos los sensores en ese milisegundo (Timestamp).
  * Panel de KPIs Superiores: Bloques resumen con métricas pre-calculadas (Ej: "Fuerza Promedio: 4.2 N", "Frecuencia del Temblor: 6 Hz", "Picos de Aceleración Máxima").

---

REQUISITOS DEL PROTOTIPO INTERACTIVO (Flujo End-to-End HU-15):
Configura las conexiones de prototipado para asegurar el recorrido completo del sistema (Happy Path):
1. Iniciar en la Pantalla de Paciente -> Vincular un paciente ficticio -> Ver el LED del ESP32 pasar a Verde.
2. Hacer clic en "Iniciar Prueba" -> Ver transiciones de temporizador, lienzo de la espiral y barra de buffer llenándose moderadamente.
3. Hacer clic en "Finalizar Prueba" -> Ver alerta de éxito de persistencia y procesamiento del Backend.
4. El sistema redirige automáticamente al Dashboard Médico -> Hacer clic en la fila de la última sesión en la Tabla.
5. Acceder a la Pantalla de Detalle -> Interactuar con el Tooltip síncrono sobre el Grid de las 4 gráficas de sensores.