// src/lib/surveys-data.ts

import type { Survey } from './types';

export const responseOptions = [
  { value: '1', label: 'Insatisfactorio' },
  { value: '2', label: 'Necesita Mejora' },
  { value: '3', label: 'Cumple Expectativas' },
  { value: '4', label: 'Supera Expectativas' },
  { value: '5', label: 'Excelente' },
];

const ayudanteDeInspeccion: Survey = {
    title: 'Evaluación Ayudante de Inspección',
    competencyCategories: [
        {
            id: 'ai_dom_tec',
            name: '1. Dominio técnico',
            items: [
                {
                    id: 'ai_dt_1',
                    title: 'Dominio técnico',
                    descriptions: [
                        'Maneja los equipos y herramientas con fluidez y es capaz de entrenar a otros en su uso.',
                        'Identifica áreas de mejora en los procedimientos y contribuye a optimizar su aplicación.',
                        'Realiza mediciones con apoyo y utiliza adecuadamente herramientas de medición.',
                        'Promueve activamente el cumplimiento de las normas de seguridad entre sus compañeros y detecta posibles riesgos.',
                        'Realiza el mantenimiento preventivo y correctivo con mínima supervisión, asegurando la funcionalidad de los equipos.',
                    ]
                }
            ]
        },
        {
            id: 'ai_plan_org',
            name: '2. Planificación y organización',
            items: [
                {
                    id: 'ai_po_1',
                    title: 'Planificación y organización',
                    descriptions: [
                        'Establece objetivos claros y metas específicas a corto y mediano plazo, alineadas con la visión organizacional.',
                        'Diseña estrategias adecuadas, seleccionando recursos y asignando roles de forma funcional.',
                        'Identifica actividades críticas y organiza prioridades según importancia y urgencia.',
                        'Desarrolla planes detallados con métodos básicos de seguimiento para implementar actividades y proyectos.',
                        'Cumple con plazos establecidos y demuestra constancia en la ejecución de tareas.',
                        'Relaciona sus objetivos personales con las metas organizacionales, mostrando interés en mejorar profesionalmente.',
                    ]
                }
            ]
        },
        {
            id: 'ai_com_efec',
            name: '3. Comunicación Efectiva',
            items: [
                {
                    id: 'ai_ce_1',
                    title: 'Comunicación Efectiva',
                    descriptions: [
                        'Expone sus ideas de forma estructurada y comprensible, aunque puede requerir ajustes menores.',
                        'Habla con confianza y naturalidad en contextos conocidos, respondiendo preguntas de manera adecuada.',
                        'Presenta argumentos razonables para respaldar sus ideas, influyendo de manera moderada en las decisiones.',
                        'Escucha activamente, mostrando interés en los comentarios de otros y considerando sus puntos de vista.',
                    ]
                }
            ]
        },
        {
            id: 'ai_comp_disc',
            name: '4. Compromiso y disciplina',
            items: [
                {
                    id: 'ai_cd_1',
                    title: 'Compromiso y disciplina',
                    descriptions: [
                        'Cumple con los plazos y acuerdos establecidos de manera consistente, salvo en situaciones excepcionales.',
                        'Se muestra proactivo en la identificación de oportunidades y la resolución de problemas en su ámbito de trabajo.',
                        'Se ajusta a los cambios y nuevas responsabilidades con disposición, aunque requiere orientación ocasional.',
                        'Cumple con las órdenes y disposiciones establecidas por sus superiores de forma oportuna.',
                        'Es disciplinado, cumple con los horarios de trabajo y los reglamentos internos.',
                    ]
                }
            ]
        },
        {
            id: 'ai_trab_eq',
            name: '5. Trabajo en Equipo',
            items: [
                {
                    id: 'ai_te_1',
                    title: 'Trabajo en Equipo',
                    descriptions: [
                        'Participa en actividades grupales, cumpliendo con sus responsabilidades de manera adecuada.',
                        'Contribuye a la resolución de conflictos menores y fomenta relaciones de trabajo cordiales.',
                        'Reconoce las contribuciones de los demás y colabora en el logro de los objetivos del equipo.',
                    ]
                }
            ]
        },
        {
            id: 'ai_or_res',
            name: '6. Orientación a los resultados',
            items: [
                {
                    id: 'ai_or_1',
                    title: 'Orientación a los resultados',
                    descriptions: [
                        'Responde con rapidez y eficiencia a las demandas del entorno y las necesidades del cliente.',
                        'Prioriza actividades críticas y asegura el cumplimiento de los plazos establecidos.',
                        'Toma decisiones clave basándose en un análisis adecuado de riesgos y beneficios.',
                        'Implementa y monitorea los procesos del Sistema Integrado de Gestión para alcanzar los objetivos.',
                    ]
                }
            ]
        },
        {
            id: 'ai_or_cli',
            name: '7. Orientación al Cliente',
            items: [
                {
                    id: 'ai_oc_1',
                    title: 'Orientación al Cliente',
                    descriptions: [
                        'Responde a las solicitudes del cliente de manera profesional y oportuna, cumpliendo con lo esperado.',
                        'Escucha activamente y realiza preguntas para clarificar las necesidades del cliente.',
                        'Ofrece soluciones adecuadas que cumplen con los estándares establecidos, aunque con poca innovación.',
                        'Realiza seguimiento y comunica avances de manera básica, asegurando que las acciones sean implementadas.',
                    ]
                }
            ]
        },
        {
            id: 'ai_adap_cam',
            name: '8. Adaptabilidad al cambio',
            items: [
                {
                    id: 'ai_ac_1',
                    title: 'Adaptabilidad al cambio',
                    descriptions: [
                        'Apoya activamente las iniciativas de cambio, fomentando un ambiente positivo y participativo.',
                        'Detecta tendencias relevantes del entorno y colabora en la formulación de ajustes estratégicos.',
                        'Motiva al equipo a aceptar los cambios mediante una comunicación clara de sus beneficios.',
                        'Ajusta su conducta de manera flexible ante nuevas situaciones, manteniendo un enfoque eficiente y profesional.',
                    ]
                }
            ]
        },
    ],
    paragraphQuestions: [
        { id: 'ai_pq_fortalezas', title: '9. Puntos fuertes: ¿En qué aspectos es este empleado especialmente competente?' },
        { id: 'ai_pq_mejorar', title: '10. Áreas qué debe mejorar: ¿Qué comportamientos son clave para conseguir los objetivos organizacionales?' },
        { id: 'ai_pq_formacion', title: '11. Necesidades de formación y desarrollo: ¿Qué competencias debe desarrollar el colaborador para promover la mejora continua?' },
    ],
};

const coordinadorAdministrativo: Survey = {
    title: 'Evaluación Coordinador Administrativo',
    competencyCategories: [
        {
            id: 'ca_cont_fin',
            name: '1. Contabilidad y finanzas',
            items: [
                {
                    id: 'ca_cf_1',
                    title: 'Contabilidad y finanzas',
                    descriptions: [
                        'Aplica los principios contables con precisión, implementando controles que garantizan la calidad de los registros financieros.',
                        'Elabora estados financieros detallados, proporcionando análisis adicionales que facilitan la toma de decisiones estratégicas.',
                        'Gestiona impuestos de manera proactiva, identificando oportunidades de optimización fiscal y asegurando el cumplimiento pleno de las normativas.',
                        'Realiza conciliaciones bancarias con rapidez y eficiencia, asegurando una alineación constante entre los registros contables y bancarios.',
                    ]
                }
            ]
        },
        {
            id: 'ca_ley_lab',
            name: '2. Dominio en ley laboral y tributaria',
            items: [
                {
                    id: 'ca_ll_1',
                    title: 'Dominio en ley laboral y tributaria',
                    descriptions: [
                        'Domina las leyes laborales y tributarias, asegurando su correcta implementación en procesos empresariales complejos.',
                        'Detecta áreas de mejora en la gestión legal y fiscal, proponiendo estrategias que optimicen el cumplimiento normativo.',
                        'Mantiene actualizada a la organización sobre cambios legislativos, adaptando los procedimientos de manera proactiva.',
                        'Proporciona orientación clara y práctica para resolver situaciones legales y fiscales específicas.',
                    ]
                }
            ]
        },
        {
            id: 'ca_sgi',
            name: '3. Gestión de sistema integrado',
            items: [
                {
                    id: 'ca_sgi_1',
                    title: 'Gestión de sistema integrado',
                    descriptions: [
                        'Planifica proyectos con objetivos claros y planes estructurados que incluyen alcance, cronograma, y asignación de recursos básicos.',
                        'Aplica correctamente las normas ISO y utiliza herramientas de mejora continua en la gestión del proyecto.',
                        'Motiva y coordina eficazmente a los miembros del equipo. Facilita la comunicación dentro del equipo, asegurando que los roles y responsabilidades sean comprendidos.',
                        'Cumple con los plazos y estándares de calidad, entregando proyectos dentro del presupuesto.',
                    ]
                }
            ]
        },
        {
            id: 'ca_liderazgo',
            name: '4. Capacidad de liderazgo',
            items: [
                {
                    id: 'ca_lid_1',
                    title: 'Capacidad de liderazgo',
                    descriptions: [
                        'Define y comunica objetivos claros, asegurando una alineación parcial con la estrategia organizacional.',
                        'Genera un nivel aceptable de motivación y compromiso dentro del equipo.',
                        'Toma decisiones informadas en situaciones predecibles y defiende criterios con fundamentos básicos.',
                        'Establece relaciones de confianza con algunos miembros del equipo y fomenta la comunicación transparente.',
                        'Promueve el desarrollo profesional en función de las necesidades operativas del equipo.',
                    ]
                }
            ]
        },
        {
            id: 'ca_sol_prob',
            name: '5. Capacidad de solución de problemas',
            items: [
                {
                    id: 'ca_sp_1',
                    title: 'Capacidad de solución de problemas',
                    descriptions: [
                        'Identifica problemas presentes y potenciales, priorizándolos según su impacto y urgencia.',
                        'Realiza análisis causal correcto, utilizando herramientas y obteniendo conclusiones útiles.',
                        'Propone al menos tres soluciones viables, considerando las limitaciones del entorno.',
                        'Toma decisiones razonables, evaluando pros y contras de forma objetiva.',
                        'Desarrolla planes de acción claros y realiza un seguimiento básico para garantizar su implementación.',
                        'Actúa con iniciativa en problemas moderadamente complejos, mostrando persistencia ante obstáculos.',
                        'Explica los problemas y las soluciones con suficiente claridad para que los interesados las comprendan.',
                    ]
                }
            ]
        },
        {
            id: 'ca_plan_org',
            name: '6. Planificación y organización',
            items: [
                {
                    id: 'ca_po_1',
                    title: 'Planificación y organización',
                    descriptions: [
                        'Define objetivos y metas claras y medibles a corto, mediano y largo plazo, totalmente alineadas con la estrategia organizacional.',
                        'Diseña estrategias efectivas, asignando recursos y roles de manera óptima para maximizar resultados.',
                        'Gestiona prioridades con precisión, ajustándolas de manera proactiva ante cambios o imprevistos.',
                        'Construye planes detallados y bien estructurados, incorporando métodos efectivos de seguimiento y ajuste.',
                        'Entrega resultados de manera puntual y consistente, demostrando un alto nivel de autodisciplina.',
                        'Vincula sus objetivos personales y profesionales con las metas organizacionales, buscando continuamente el desarrollo y la mejora profesional.',
                    ]
                }
            ]
        },
        {
            id: 'ca_atencion',
            name: '7. Atención al detalle',
            items: [
                {
                    id: 'ca_ad_1',
                    title: 'Atención al detalle',
                    descriptions: [
                        'Realiza revisiones exhaustivas, asegurando altos estándares de calidad en documentos y procesos.',
                        'Identifica patrones de errores recurrentes y propone mejoras para evitar su repetición.',
                        'Implementa sistemas o listas de verificación para asegurar que los detalles importantes no se pasen por alto.',
                        'Monitorea y supervisa la calidad del trabajo administrativo de su equipo, brindando retroalimentación constructiva.',
                    ]
                }
            ]
        },
        {
            id: 'ca_com_efec',
            name: '8. Comunicación Efectiva',
            items: [
                {
                    id: 'ca_ce_1',
                    title: 'Comunicación Efectiva',
                    descriptions: [
                        'Comunica ideas de forma clara, lógica y bien adaptada al público, mostrando una estructura sólida en su discurso.',
                        'Se expresa con fluidez y seguridad en diferentes contextos, tanto formales como informales.',
                        'Utiliza argumentos persuasivos para influir en las decisiones de manera positiva y constructiva.',
                        'Responde de manera empática y precisa a los comentarios, fomentando un diálogo abierto y constructivo.',
                    ]
                }
            ]
        },
        {
            id: 'ca_trab_eq',
            name: '9. Trabajo en equipo',
            items: [
                {
                    id: 'ca_te_1',
                    title: 'Trabajo en equipo',
                    descriptions: [
                        'Colabora activamente en las tareas del equipo, compartiendo ideas y apoyando a los demás.',
                        'Fomenta un ambiente de respeto y confianza, gestionando conflictos de manera constructiva.',
                        'Contribuye al desarrollo de relaciones sólidas y refuerza el sentido de identidad del equipo.',
                    ]
                }
            ]
        },
        {
            id: 'ca_compromiso',
            name: '10. Compromiso',
            items: [
                {
                    id: 'ca_com_1',
                    title: 'Compromiso',
                    descriptions: [
                        'Demuestra alineación con los objetivos organizacionales, contribuyendo con decisiones y acciones relevantes.',
                        'Cumple con los plazos y acuerdos establecidos de manera consistente, salvo en situaciones excepcionales.',
                        'Se muestra proactivo en la identificación de oportunidades y la resolución de problemas en su ámbito de trabajo.',
                        'Se ajusta a los cambios y nuevas responsabilidades con disposición, aunque requiere orientación ocasional.',
                        'Cumple con las órdenes y disposiciones establecidas por sus superiores de forma oportuna.',
                    ]
                }
            ]
        },
        {
            id: 'ca_res_conf',
            name: '11. Resolución de conflictos',
            items: [
                {
                    id: 'ca_rc_1',
                    title: 'Resolución de conflictos',
                    descriptions: [
                        'Identifica conflictos potenciales y actúa de manera proactiva para evitar que escalen.',
                        'Facilita el diálogo entre las partes involucradas, promoviendo soluciones equitativas.',
                        'Escucha activamente y analiza las posiciones de las partes antes de proponer alternativas.',
                        'Negocia acuerdos satisfactorios que equilibran las necesidades de las partes y los objetivos organizacionales.',
                    ]
                }
            ]
        },
        {
            id: 'ca_iniciativa',
            name: '12. Iniciativa',
            items: [
                {
                    id: 'ca_ini_1',
                    title: 'Iniciativa',
                    descriptions: [
                        'Toma la iniciativa en tareas adicionales y propone ideas que contribuyen de forma tangible a los objetivos organizacionales.',
                        'Identifica oportunidades de mejora y aplica cambios que optimizan procesos y recursos a nivel operativo.',
                        'Diseña herramientas prácticas, como cronogramas o procedimientos, que facilitan el trabajo del equipo.',
                        'Involucra a los colaboradores en el desarrollo de ideas y fomenta la creatividad en un entorno colaborativo.',
                    ]
                }
            ]
        },
        {
            id: 'ca_adap_cam',
            name: '13. Adaptabilidad al cambio',
            items: [
                {
                    id: 'ca_ac_1',
                    title: 'Adaptabilidad al cambio',
                    descriptions: [
                        'Lidera la implementación de cambios organizacionales, asegurando una transición fluida y efectiva.',
                        'Anticipa transformaciones del entorno y desarrolla estrategias proactivas para aprovechar oportunidades o mitigar riesgos.',
                        'Inspira al equipo a adoptar el cambio, involucrándolos en el proceso y generando confianza en los resultados.',
                        'Adapta rápidamente sus métodos de trabajo a circunstancias cambiantes, manteniendo altos niveles de desempeño y alineación estratégica.',
                    ]
                }
            ]
        },
    ],
    paragraphQuestions: [
        { id: 'ca_pq_fortalezas', title: '14. Puntos fuertes: ¿En qué aspectos es este empleado especialmente competente?' },
        { id: 'ca_pq_mejorar', title: '15. Áreas qué debe mejorar: ¿Qué comportamientos son clave para conseguir los objetivos organizacionales?' },
        { id: 'ca_pq_formacion', title: '16. Necesidades de formación y desarrollo: ¿Qué competencias debe desarrollar el colaborador para promover la mejora continua?' },
    ],
};

const coordinadorDeProduccion: Survey = {
    title: 'Evaluación Coordinador de Producción',
    competencyCategories: [
        {
            id: 'cp_cap_tec',
            name: '1. Capacidad técnica',
            items: [
                {
                    id: 'cp_ct_1',
                    title: 'Capacidad técnica',
                    descriptions: [
                        'Demuestra un entendimiento profundo y detallado de los procesos productivos, optimizando cada etapa con decisiones basadas en datos.',
                        'Identifica proactivamente áreas de mejora, diseñando soluciones innovadoras para eliminar cuellos de botella y maximizar la eficiencia.',
                        'Lidera la implementación de mejoras significativas en los procesos, obteniendo resultados sostenibles a largo plazo.',
                        'Integra herramientas avanzadas de control de calidad y mejora continua en la gestión de la cadena de suministro.',
                    ]
                }
            ]
        },
        {
            id: 'cp_sgi',
            name: '2. Gestión de sistema integrado',
            items: [
                {
                    id: 'cp_sgi_1',
                    title: 'Gestión de sistema integrado',
                    descriptions: [
                        'Anticipa los desafíos y desarrolla planes de contingencia. Desarrolla planes de proyecto completos y alineados con los objetivos estratégicos de la organización, anticipando riesgos y mitigándolos eficazmente.',
                        'Aplica de manera consistente y avanzada las normas ISO y las metodologías de mejora continua, asegurando la conformidad.',
                        'Introduce nuevas ideas y mejora continuamente los procesos. Lidera equipos multidisciplinarios con éxito, fomentando la colaboración y el compromiso de los miembros.',
                        'Los proyectos se completan antes de lo previsto y con un alto nivel de calidad. Entrega proyectos puntuales con un enfoque en la optimización de recursos y la mejora continua de los procesos',
                    ]
                }
            ]
        },
        {
            id: 'cp_herramientas',
            name: '3. Herramientas de Gestión',
            items: [
                {
                    id: 'cp_hg_1',
                    title: 'Herramientas de Gestión',
                    descriptions: [
                        'Domina el uso de software ERP, MRP y herramientas de análisis avanzado de datos, aplicándolos para optimizar procesos y recursos.',
                        'Diseña y personaliza paneles de control interactivos que permiten el seguimiento en tiempo real de indicadores clave de desempeño.',
                        'Realiza análisis detallados de datos, identificando oportunidades de mejora y aportando soluciones estratégicas basadas en evidencia.',
                        'Lidera proyectos utilizando metodologías avanzadas de gestión, asegurando el cumplimiento de plazos y objetivos.',
                    ]
                }
            ]
        },
        {
            id: 'cp_liderazgo',
            name: '4. Capacidad de liderazgo',
            items: [
                {
                    id: 'cp_lid_1',
                    title: 'Capacidad de liderazgo',
                    descriptions: [
                        'Define y comunica objetivos alineados con la estrategia organizacional de manera clara y efectiva.',
                        'Inspira entusiasmo y compromiso, reconociendo logros y fomentando un ambiente positivo.',
                        'Toma decisiones acertadas, asumiendo riesgos calculados y defendiendo criterios con argumentos sólidos.',
                        'Fomenta la confianza y la transparencia en todo el equipo, escuchando activamente y valorando sus ideas.',
                        'Identifica oportunidades de desarrollo profesional y proporciona retroalimentación constructiva regularmente',
                    ]
                }
            ]
        },
        {
            id: 'cp_sol_prob',
            name: '5. Capacidad de solución de problemas',
            items: [
                {
                    id: 'cp_sp_1',
                    title: 'Capacidad de solución de problemas',
                    descriptions: [
                        'Detecta problemas de manera proactiva y prioriza con precisión según el impacto en el entorno laboral.',
                        'Realiza análisis causal detallado y estructurado, utilizando herramientas y metodologías específicas.',
                        'Genera múltiples soluciones factibles e innovadoras, involucrando activamente a las partes interesadas.',
                        'Toma decisiones con rapidez y confianza, respaldadas por un análisis objetivo y alineadas con los objetivos estratégicos.',
                        'Desarrolla e implementa planes de acción efectivos, realizando un seguimiento continuo para asegurar resultados.',
                        'Demuestra iniciativa constante y perseverancia, resolviendo problemas complejos con autonomía y determinación.',
                        'Comunica problemas y soluciones de manera clara y persuasiva, logrando consenso y compromiso.',
                    ]
                }
            ]
        },
        {
            id: 'cp_plan_org',
            name: '6. Planificación y organización',
            items: [
                {
                    id: 'cp_po_1',
                    title: 'Planificación y organización',
                    descriptions: [
                        'Define objetivos y metas claras y medibles a corto, mediano y largo plazo, totalmente alineadas con la estrategia organizacional.',
                        'Diseña estrategias efectivas, asignando recursos y roles de manera óptima para maximizar resultados.',
                        'Gestiona prioridades con precisión, ajustándolas de manera proactiva ante cambios o imprevistos.',
                        'Construye planes detallados y bien estructurados, incorporando métodos efectivos de seguimiento y ajuste.',
                        'Entrega resultados de manera puntual y consistente, demostrando un alto nivel de autodisciplina.',
                        'Vincula sus objetivos personales y profesionales con las metas organizacionales, buscando continuamente el desarrollo y la mejora profesional.',
                    ]
                }
            ]
        },
        {
            id: 'cp_pensamiento',
            name: '7. Pensamiento Estratégico',
            items: [
                {
                    id: 'cp_pe_1',
                    title: 'Pensamiento Estratégico',
                    descriptions: [
                        'Monitorea cambios en el mercado y reconoce tendencias relevantes para la organización.',
                        'Identifica oportunidades estratégicas y amenazas con impacto moderado en los objetivos organizacionales.',
                        'Evalúa fortalezas y debilidades internas con razonable profundidad y propone iniciativas básicas para su gestión.',
                        'Diseña estrategias viables y alineadas con los objetivos organizacionales, aunque con innovación limitada.',
                        'Identifica y gestiona alianzas estratégicas que aportan valor, pero con alcance moderado.',
                        'Propone acciones con enfoque a largo plazo, considerando riesgos y beneficios de forma general.',
                    ]
                }
            ]
        },
        {
            id: 'cp_com_efec',
            name: '8. Comunicación Efectiva',
            items: [
                {
                    id: 'cp_ce_1',
                    title: 'Comunicación Efectiva',
                    descriptions: [
                        'Comunica ideas de forma clara, lógica y bien adaptada al público, mostrando una estructura sólida en su discurso.',
                        'Se expresa con fluidez y seguridad en diferentes contextos, tanto formales como informales.',
                        'Utiliza argumentos persuasivos para influir en las decisiones de manera positiva y constructiva.',
                        'Responde de manera empática y precisa a los comentarios, fomentando un diálogo abierto y constructivo.',
                    ]
                }
            ]
        },
        {
            id: 'cp_trab_eq',
            name: '9. Trabajo en equipo',
            items: [
                {
                    id: 'cp_te_1',
                    title: 'Trabajo en equipo',
                    descriptions: [
                        'Colabora activamente en las tareas del equipo, compartiendo ideas y apoyando a los demás.',
                        'Fomenta un ambiente de respeto y confianza, gestionando conflictos de manera constructiva.',
                        'Contribuye al desarrollo de relaciones sólidas y refuerza el sentido de identidad del equipo.',
                    ]
                }
            ]
        },
        {
            id: 'cp_compromiso',
            name: '10. Compromiso',
            items: [
                {
                    id: 'cp_com_1',
                    title: 'Compromiso',
                    descriptions: [
                        'Demuestra alineación con los objetivos organizacionales, contribuyendo con decisiones y acciones relevantes.',
                        'Cumple con los plazos y acuerdos establecidos de manera consistente, salvo en situaciones excepcionales.',
                        'Se muestra proactivo en la identificación de oportunidades y la resolución de problemas en su ámbito de trabajo.',
                        'Se ajusta a los cambios y nuevas responsabilidades con disposición, aunque requiere orientación ocasional.',
                        'Cumple con las órdenes y disposiciones establecidas por sus superiores de forma oportuna.',
                    ]
                }
            ]
        },
        {
            id: 'cp_orientacion_cliente',
            name: '11. Orientación al cliente',
            items: [
                {
                    id: 'cp_oc_1',
                    title: 'Orientación al cliente',
                    descriptions: [
                        'Demuestra un compromiso claro con la satisfacción del cliente, atendiendo solicitudes con profesionalismo y empatía.',
                        'Escucha de manera activa, valida expectativas y asegura que las soluciones propuestas sean pertinentes.',
                        'Diseña y ofrece alternativas que satisfacen o superan las necesidades del cliente, proponiendo mejoras basadas en feedback.',
                        'Realiza un seguimiento constante, garantizando la implementación efectiva de las acciones y manteniendo al cliente informado sobre los resultados.',
                    ]
                }
            ]
        },
        {
            id: 'cp_iniciativa',
            name: '12. Iniciativa',
            items: [
                {
                    id: 'cp_ini_1',
                    title: 'Iniciativa',
                    descriptions: [
                        'Toma la iniciativa en tareas adicionales y propone ideas que contribuyen de forma tangible a los objetivos organizacionales.',
                        'Identifica oportunidades de mejora y aplica cambios que optimizan procesos y recursos a nivel operativo.',
                        'Diseña herramientas prácticas, como cronogramas o procedimientos, que facilitan el trabajo del equipo.',
                        'Involucra a los colaboradores en el desarrollo de ideas y fomenta la creatividad en un entorno colaborativo.',
                    ]
                }
            ]
        },
        {
            id: 'cp_innovacion',
            name: '13. Innovación',
            items: [
                {
                    id: 'cp_inn_1',
                    title: 'Innovación',
                    descriptions: [
                        'Presenta propuestas innovadoras con un impacto positivo en los procesos y resultados organizacionales.',
                        'Detecta oportunidades de mejora utilizando datos y análisis para justificar las propuestas.',
                        'Diseña soluciones creativas con un enfoque sostenible y alineadas con los objetivos a largo plazo.',
                        'Estimula la creatividad del equipo, valorando y considerando activamente sus ideas y sugerencias.',
                    ]
                }
            ]
        },
        {
            id: 'cp_gestion_cambio',
            name: '14. Gestión del cambio',
            items: [
                {
                    id: 'cp_gc_1',
                    title: 'Gestión del cambio',
                    descriptions: [
                        'Establece una visión clara y comunicable del cambio, alineada con los objetivos estratégicos de la organización.',
                        'Informa de manera estructurada sobre los motivos y beneficios del cambio, promoviendo una comprensión general en el equipo.',
                        'Empodera a los colaboradores, fomentando su participación activa en el proceso de cambio.',
                        'Identifica y aborda resistencias comunes, aplicando estrategias proactivas para superarlas.',
                        'Monitorea el progreso del cambio mediante métricas básicas, realizando ajustes menores según sea necesario.',
                    ]
                }
            ]
        },
    ],
    paragraphQuestions: [
        { id: 'cp_pq_fortalezas', title: '15. Puntos fuertes: ¿En qué aspectos es este empleado especialmente competente?' },
        { id: 'cp_pq_mejorar', title: '16. Áreas qué debe mejorar: ¿Qué comportamientos son clave para conseguir los objetivos organizacionales?' },
        { id: 'cp_pq_formacion', title: '17. Necesidades de formación y desarrollo: ¿Qué competencias debe desarrollar el colaborador para promover la mejora continua?' },
    ],
};

const superintendenteDeOperaciones: Survey = {
    title: 'Evaluación Superintendente de Operaciones',
    competencyCategories: [
        {
            id: 'so_cap_tec',
            name: '1. Capacidad técnica',
            items: [
                {
                    id: 'so_ct_1',
                    title: 'Capacidad técnica',
                    descriptions: [
                        'Conocimiento de normas y estándares sobre Inspección de Ensayos No Destructivos aplicadas en la industria petrolera: ASME 5, API 5T1, ASMT E709, ASMT 797, ASMT E165, API 5CT, API RB1, API RP 5A5, API RP 5A3, API SPEC 8C, API SPEC 6A, API SPEC 7K, API SPEC 9A, API SPEC RP 7L, API RP 4G, AWS D1.1 y estándar DS-1.',
                        'Conocimiento profundo de los procesos de producción y servicios de la empresa.',
                        'Conocimiento en soldaduras especiales y estructuras metálicas aplicadas a operaciones industriales.',
                        'Conocimiento de regulaciones aplicables a seguridad, salud ocupacional y manejo ambiental.',
                    ],
                },
            ],
        },
        {
            id: 'so_sgi',
            name: '2. Gestión de sistema integrado',
            items: [
                {
                    id: 'so_sgi_1',
                    title: 'Gestión de sistema integrado',
                    descriptions: [
                        'Anticipa los desafíos y desarrolla planes de contingencia. Desarrolla planes de proyecto completos y alineados con los objetivos estratégicos de la organización, anticipando riesgos y mitigándolos eficazmente.',
                        'Aplica de manera consistente y avanzada las normas ISO y las metodologías de mejora continua, asegurando la conformidad.',
                        'Introduce nuevas ideas y mejora continuamente los procesos. Lidera equipos multidisciplinarios con éxito, fomentando la colaboración y el compromiso de los miembros.',
                        'Los proyectos se completan antes de lo previsto y con un alto nivel de calidad. Entrega proyectos puntuales con un enfoque en la optimización de recursos y la mejora continua de los procesos',
                    ],
                },
            ],
        },
        {
            id: 'so_liderazgo',
            name: '3. Capacidad de liderazgo',
            items: [
                {
                    id: 'so_lid_1',
                    title: 'Capacidad de liderazgo',
                    descriptions: [
                        'Establece y comunica una visión estratégica que guía al equipo con claridad y propósito.',
                        'Motiva e inspira a los miembros del equipo hacia un alto desempeño, promoviendo compromiso y colaboración constantes.',
                        'Toma decisiones efectivas en situaciones complejas, defendiendo criterios de manera audaz y basada en análisis.',
                        'Cultiva relaciones de confianza y fomenta una comunicación abierta y persuasiva a todos los niveles.',
                        'Actúa como un modelo a seguir, impulsando el crecimiento profesional del equipo con estrategias de desarrollo innovadoras y retroalimentación continua.',
                    ],
                },
            ],
        },
        {
            id: 'so_sol_prob',
            name: '4. Capacidad de solución de problemas',
            items: [
                {
                    id: 'so_sp_1',
                    title: 'Capacidad de solución de problemas',
                    descriptions: [
                        'Detecta problemas de manera proactiva y prioriza con precisión según el impacto en el entorno laboral.',
                        'Realiza análisis causal detallado y estructurado, utilizando herramientas y metodologías específicas.',
                        'Genera múltiples soluciones factibles e innovadoras, involucrando activamente a las partes interesadas.',
                        'Toma decisiones con rapidez y confianza, respaldadas por un análisis objetivo y alineadas con los objetivos estratégicos.',
                        'Desarrolla e implementa planes de acción efectivos, realizando un seguimiento continuo para asegurar resultados.',
                        'Demuestra iniciativa constante y perseverancia, resolviendo problemas complejos con autonomía y determinación.',
                        'Comunica problemas y soluciones de manera clara y persuasiva, logrando consenso y compromiso.',
                    ],
                },
            ],
        },
        {
            id: 'so_plan_org',
            name: '5. Planificación y organización',
            items: [
                {
                    id: 'so_po_1',
                    title: 'Planificación y organización',
                    descriptions: [
                        'Establece objetivos y metas altamente estratégicos, innovadores y medibles, con un impacto significativo en la organización.',
                        'Diseña estrategias avanzadas, optimizando recursos y asignando roles de manera precisa y eficiente.',
                        'Maneja prioridades con excepcional habilidad, anticipándose a posibles cambios y ajustando planes con flexibilidad.',
                        'Elabora planes detallados, con métodos innovadores de seguimiento y ajuste, asegurando una ejecución impecable.',
                        'Cumple consistentemente con plazos establecidos y entrega resultados de alta calidad, siendo un modelo de autodisciplina.',
                        'Integra perfectamente sus objetivos personales y profesionales con la visión organizacional, inspirando a otros a alcanzar un desarrollo continuo.',
                    ],
                },
            ],
        },
        {
            id: 'so_pensamiento',
            name: '6. Pensamiento Estratégico',
            items: [
                {
                    id: 'so_pe_1',
                    title: 'Pensamiento Estratégico',
                    descriptions: [
                        'Analiza cambios en el mercado y el entorno competitivo con profundidad y precisión.',
                        'Reconoce oportunidades estratégicas de alto impacto y sugiere acciones concretas para aprovecharlas.',
                        'Detecta amenazas competitivas relevantes y desarrolla estrategias efectivas para mitigarlas.',
                        'Evalúa fortalezas y debilidades internas de manera crítica, proponiendo soluciones prácticas y alineadas con los objetivos.',
                        'Diseña estrategias innovadoras y creativas que conectan oportunidades del mercado con objetivos organizacionales.',
                        'Promueve alianzas estratégicas significativas que generan valor sostenido para todas las partes involucradas.',
                        'Propone acciones con visión a largo plazo, evaluando cuidadosamente riesgos y beneficios potenciales.',
                    ],
                },
            ],
        },
        {
            id: 'so_com_efec',
            name: '7. Comunicación Efectiva',
            items: [
                {
                    id: 'so_ce_1',
                    title: 'Comunicación Efectiva',
                    descriptions: [
                        'Comunica ideas de forma clara, lógica y bien adaptada al público, mostrando una estructura sólida en su discurso.',
                        'Se expresa con fluidez y seguridad en diferentes contextos, tanto formales como informales.',
                        'Utiliza argumentos persuasivos para influir en las decisiones de manera positiva y constructiva.',
                        'Responde de manera empática y precisa a los comentarios, fomentando un diálogo abierto y constructivo.',
                    ],
                },
            ],
        },
        {
            id: 'so_trab_eq',
            name: '8. Trabajo en equipo',
            items: [
                {
                    id: 'so_te_1',
                    title: 'Trabajo en equipo',
                    descriptions: [
                        'Lidera con el ejemplo, fomentando una atmósfera de armonía, respeto y compromiso activo.',
                        'Es un modelo de colaboración y cooperación, promoviendo un alto nivel de cohesión grupal.',
                        'Dedica tiempo a construir relaciones laborales duraderas y motiva a los demás hacia el logro de metas comunes.',
                        'Celebra los logros colectivos y refuerza el sentido de pertenencia e identidad en el equipo.',
                    ],
                },
            ],
        },
        {
            id: 'so_compromiso',
            name: '9. Compromiso',
            items: [
                {
                    id: 'so_com_1',
                    title: 'Compromiso',
                    descriptions: [
                        'Actúa de manera constante en alineación con los objetivos organizacionales, priorizando decisiones estratégicas.',
                        'Cumple de manera confiable y puntual con sus compromisos, incluso en situaciones adversas.',
                        'Toma la iniciativa para proponer soluciones creativas y anticiparse a problemas potenciales.',
                        'Adapta rápidamente su trabajo a los cambios, asumiendo nuevas responsabilidades con entusiasmo.',
                        'Cumple muy bien con las órdenes y disposiciones establecidas por sus superiores y moviliza al grupo para su consecución.',
                    ],
                },
            ],
        },
        {
            id: 'so_orientacion_cliente',
            name: '10. Orientación al cliente',
            items: [
                {
                    id: 'so_oc_1',
                    title: 'Orientación al cliente',
                    descriptions: [
                        'Actúa con un enfoque genuino en la satisfacción y superación de las expectativas del cliente, anticipándose a sus necesidades.',
                        'Escucha activamente, valida detalladamente las expectativas y genera confianza a través de la comunicación clara y empática.',
                        'Propone soluciones innovadoras que no solo cumplen sino que exceden los estándares de calidad esperados.',
                        'Realiza un seguimiento proactivo, asegurando la ejecución efectiva de acciones, informando avances en tiempo real y asegurando la satisfacción total del cliente.',
                    ],
                },
            ],
        },
        {
            id: 'so_iniciativa',
            name: '11. Iniciativa',
            items: [
                {
                    id: 'so_ini_1',
                    title: 'Iniciativa',
                    descriptions: [
                        'Anticipa necesidades y propone soluciones innovadoras con impacto positivo en la productividad y eficiencia organizacional.',
                        'Evalúa procesos existentes, implementando mejoras significativas que generan ahorro de tiempo y recursos.',
                        'Diseña herramientas avanzadas que optimizan la gestión y los resultados del equipo de manera sostenible.',
                        'Inspira compromiso en los colaboradores, promoviendo la creatividad y motivando la participación activa en la toma de decisiones.',
                    ],
                },
            ],
        },
        {
            id: 'so_innovacion',
            name: '12. Innovación',
            items: [
                {
                    id: 'so_inn_1',
                    title: 'Innovación',
                    descriptions: [
                        'Presenta propuestas innovadoras con un impacto positivo en los procesos y resultados organizacionales.',
                        'Detecta oportunidades de mejora utilizando datos y análisis para justificar las propuestas.',
                        'Diseña soluciones creativas con un enfoque sostenible y alineadas con los objetivos a largo plazo.',
                        'Estimula la creatividad del equipo, valorando y considerando activamente sus ideas y sugerencias.',
                    ],
                },
            ],
        },
        {
            id: 'so_adap_cam',
            name: '13. Adaptabilidad al cambio',
            items: [
                {
                    id: 'so_ac_1',
                    title: 'Adaptabilidad al cambio',
                    descriptions: [
                        'Lidera la implementación de cambios organizacionales, asegurando una transición fluida y efectiva.',
                        'Anticipa transformaciones del entorno y desarrolla estrategias proactivas para aprovechar oportunidades o mitigar riesgos.',
                        'Inspira al equipo a adoptar el cambio, involucrándolos en el proceso y generando confianza en los resultados.',
                        'Adapta rápidamente sus métodos de trabajo a circunstancias cambiantes, manteniendo altos niveles de desempeño y alineación estratégica.',
                    ],
                },
            ],
        },
    ],
    paragraphQuestions: [
        { id: 'so_pq_fortalezas', title: '14. Puntos fuertes: ¿En qué aspectos es este empleado especialmente competente?' },
        { id: 'so_pq_mejorar', title: '15. Áreas qué debe mejorar: ¿Qué comportamientos son clave para conseguir los objetivos organizacionales?' },
        { id: 'so_pq_formacion', title: '16. Necesidades de formación y desarrollo: ¿Qué competencias debe desarrollar el colaborador para promover la mejora continua?' },
    ],
};

const supervisorDeInspeccion: Survey = {
    title: 'Evaluación Supervisor de Inspección',
    competencyCategories: [
        {
            id: 'si_dom_tec',
            name: '1. Dominio técnico',
            items: [
                {
                    id: 'si_dt_1',
                    title: 'Dominio técnico',
                    descriptions: [
                        'Manejo avanzado de técnicas de Inspección de Ensayos No Destructivos, incluyendo: visual-dimensional, ultrasonido convencional y puntual, medición de espesores y técnica electromagnética.',
                        'Operación de equipos especializados como lámpara de luz negra, medidores de profundidad, OD-Gage, y otros dispositivos avanzados. Análisis detallado de resultados obtenidos, incluyendo la interpretación de datos más complejos.',
                        'Conocimiento de las técnicas de inspección no destructivas aplicadas en la industria petrolera: ASME 5, API 5T1, ASMT E709, ASMT 797, ASMT E165, API 5CT, API RB1, API RP 5A5, API RP 5A3, API SPEC 8C, API SPEC 6A, API SPEC 7K, API SPEC 9A, API SPEC RP 7L, API RP 4G, AWS D1.1 y estándar DS-1.',
                    ],
                },
            ],
        },
        {
            id: 'si_analisis',
            name: '2. Análisis y procesamiento',
            items: [
                {
                    id: 'si_ap_1',
                    title: 'Análisis y procesamiento',
                    descriptions: [
                        'Evaluación de resultados obtenidos mediante diversos métodos (visual-dimensional, líquidos penetrantes, partículas magnéticas, ultrasonido, electromagnética). Comparación precisa de los datos recopilados en la tubería o herramienta con estándares y normas técnicos. Tomar decisiones precisas en base a la normativa para dar una clasificación de la tubería o herramienta (operativa, no operativa o cambio de clase) basada en análisis detallado basado en la evidencia.',
                    ],
                },
            ],
        },
        {
            id: 'si_reportes',
            name: '3. Realización de reportes',
            items: [
                {
                    id: 'si_rr_1',
                    title: 'Realización de reportes',
                    descriptions: [
                        'Uso avanzado de Microsoft Excel y DataScope para análisis de datos y digitación de información precisa.',
                        'Identificación de inconsistencias o errores en los datos recopilados. Elaboración de informes técnicos claros y detallados que incluyan conclusiones y recomendaciones, con enfoque en estándares técnicos y calidad del servicio. Generación de gráficos y tablas comparativas para predecir el comportamiento o generar hipótesis sobre las operaciones de los clientes.',
                    ],
                },
            ],
        },
        {
            id: 'si_orientacion_cliente',
            name: '4. Orientación al cliente',
            items: [
                {
                    id: 'si_oc_1',
                    title: 'Orientación al cliente',
                    descriptions: [
                        'Demuestra un compromiso claro con la satisfacción del cliente, atendiendo solicitudes con profesionalismo y empatía. Escucha de manera activa, valida expectativas y asegura que las soluciones propuestas sean pertinentes. Diseña y ofrece alternativas que satisfacen o superan las necesidades del cliente, proponiendo mejoras basadas en feedback. Realiza un seguimiento constante, garantizando la implementación efectiva de las acciones y manteniendo al cliente informado sobre los resultados.',
                    ],
                },
            ],
        },
        {
            id: 'si_liderazgo',
            name: '5. Capacidad de liderazgo',
            items: [
                {
                    id: 'si_lid_1',
                    title: 'Capacidad de liderazgo',
                    descriptions: [
                        'Define y comunica objetivos alineados con la estrategia organizacional de manera clara y efectiva.',
                        'Inspira entusiasmo y compromiso, reconociendo logros y fomentando un ambiente positivo.',
                        'Toma decisiones acertadas, asumiendo riesgos calculados y defendiendo criterios con argumentos sólidos.',
                        'Fomenta la confianza y la transparencia en todo el equipo, escuchando activamente y valorando sus ideas.',
                        'Identifica oportunidades de desarrollo profesional y proporciona retroalimentación constructiva regularmente.',
                    ],
                },
            ],
        },
        {
            id: 'si_sol_prob',
            name: '6. Capacidad de solución de problemas',
            items: [
                {
                    id: 'si_sp_1',
                    title: 'Capacidad de solución de problemas',
                    descriptions: [
                        'Detecta problemas de manera proactiva y prioriza con precisión según el impacto en el entorno laboral.',
                        'Realiza análisis causal detallado y estructurado, utilizando herramientas y metodologías específicas.',
                        'Genera múltiples soluciones factibles e innovadoras, involucrando activamente a las partes interesadas.',
                        'Toma decisiones con rapidez y confianza, respaldadas por un análisis objetivo y alineadas con los objetivos estratégicos.',
                        'Desarrolla e implementa planes de acción efectivos, realizando un seguimiento continuo para asegurar resultados.',
                        'Demuestra iniciativa constante y perseverancia, resolviendo problemas complejos con autonomía y determinación.',
                        'Comunica problemas y soluciones de manera clara y persuasiva, logrando consenso y compromiso.',
                    ],
                },
            ],
        },
        {
            id: 'si_plan_org',
            name: '7. Planificación y organización',
            items: [
                {
                    id: 'si_po_1',
                    title: 'Planificación y organización',
                    descriptions: [
                        'Define objetivos y metas claras y medibles a corto, mediano y largo plazo, totalmente alineadas con la estrategia organizacional.',
                        'Diseña estrategias efectivas, asignando recursos y roles de manera óptima para maximizar resultados.',
                        'Gestiona prioridades con precisión, ajustándolas de manera proactiva ante cambios o imprevistos.',
                        'Construye planes detallados y bien estructurados, incorporando métodos efectivos de seguimiento y ajuste.',
                        'Entrega resultados de manera puntual y consistente, demostrando un alto nivel de autodisciplina.',
                        'Vincula sus objetivos personales y profesionales con las metas organizacionales, buscando continuamente el desarrollo y la mejora profesional.',
                    ],
                },
            ],
        },
        {
            id: 'si_com_efec',
            name: '8. Comunicación efectiva',
            items: [
                {
                    id: 'si_ce_1',
                    title: 'Comunicación efectiva',
                    descriptions: [
                        'Comunica ideas de forma clara, lógica y bien adaptada al público, mostrando una estructura sólida en su discurso.',
                        'Se expresa con fluidez y seguridad en diferentes contextos, tanto formales como informales.',
                        'Utiliza argumentos persuasivos para influir en las decisiones de manera positiva y constructiva.',
                        'Responde de manera empática y precisa a los comentarios, fomentando un diálogo abierto y constructivo.',
                    ],
                },
            ],
        },
        {
            id: 'si_trab_eq',
            name: '9. Trabajo en equipo',
            items: [
                {
                    id: 'si_te_1',
                    title: 'Trabajo en equipo',
                    descriptions: [
                        'Colabora activamente en las tareas del equipo, compartiendo ideas y apoyando a los demás.',
                        'Fomenta un ambiente de respeto y confianza, gestionando conflictos de manera constructiva.',
                        'Contribuye al desarrollo de relaciones sólidas y refuerza el sentido de identidad del equipo.',
                    ],
                },
            ],
        },
        {
            id: 'si_compromiso',
            name: '10. Compromiso',
            items: [
                {
                    id: 'si_com_1',
                    title: 'Compromiso',
                    descriptions: [
                        'Actúa de manera constante en alineación con los objetivos organizacionales, priorizando decisiones estratégicas.',
                        'Cumple de manera confiable y puntual con sus compromisos, incluso en situaciones adversas.',
                        'Toma la iniciativa para proponer soluciones creativas y anticiparse a problemas potenciales.',
                        'Adapta rápidamente su trabajo a los cambios, asumiendo nuevas responsabilidades con entusiasmo.',
                        'Cumple muy bien con las órdenes y disposiciones establecidas por sus superiores y moviliza al grupo para su consecución.',
                    ],
                },
            ],
        },
        {
            id: 'si_gestion_proyectos',
            name: '11. Gestión de Proyectos',
            items: [
                {
                    id: 'si_gp_1',
                    title: 'Gestión de Proyectos',
                    descriptions: [
                        'Planifica proyectos con objetivos claros y planes estructurados que incluyen alcance, cronograma, y asignación de recursos básicos.',
                        'Aplica correctamente las normas ISO y utiliza herramientas de mejora continua en la gestión del proyecto.',
                        'Motiva y coordina eficazmente a los miembros del equipo. Facilita la comunicación dentro del equipo, asegurando que los roles y responsabilidades sean comprendidos.',
                        'Cumple con los plazos y estándares de calidad, entregando proyectos dentro del presupuesto.',
                    ],
                },
            ],
        },
        {
            id: 'si_iniciativa',
            name: '12. Iniciativa',
            items: [
                {
                    id: 'si_ini_1',
                    title: 'Iniciativa',
                    descriptions: [
                        'Toma la iniciativa en tareas adicionales y propone ideas que contribuyen de forma tangible a los objetivos organizacionales.',
                        'Identifica oportunidades de mejora y aplica cambios que optimizan procesos y recursos a nivel operativo.',
                        'Diseña herramientas prácticas, como cronogramas o procedimientos, que facilitan el trabajo del equipo.',
                        'Involucra a los colaboradores en el desarrollo de ideas y fomenta la creatividad en un entorno colaborativo.',
                    ],
                },
            ],
        },
        {
            id: 'si_adap_cam',
            name: '13. Adaptabilidad al cambio',
            items: [
                {
                    id: 'si_ac_1',
                    title: 'Adaptabilidad al cambio',
                    descriptions: [
                        'Es promotor del cambio; motiva y entusiasma a los demás para que se adapten a las transformaciones.',
                        'Se anticipa a los cambios de la industria y el mercado realizando propuestas para enfrentarlos. Modifica si es necesario su propia conducta para alcanzar determinados objetivos cuando surgen dificultades, como cambios del entorno interno y externo.',
                    ],
                },
            ],
        },
    ],
    paragraphQuestions: [
        { id: 'si_pq_fortalezas', title: '14. Puntos fuertes: ¿En qué aspectos es este empleado especialmente competente?' },
        { id: 'si_pq_mejorar', title: '15. Áreas qué debe mejorar: ¿Qué comportamientos son clave para conseguir los objetivos organizacionales?' },
        { id: 'si_pq_formacion', title: '16. Necesidades de formación y desarrollo: ¿Qué competencias debe desarrollar el colaborador para promover la mejora continua?' },
    ],
};

const inspectorNDT2: Survey = {
    title: 'Evaluación Inspector de Ensayos No Destructivos Nivel 2',
    competencyCategories: [
        {
            id: 'ndt2_dom_tec',
            name: '1. Dominio técnico',
            items: [
                {
                    id: 'ndt2_dt_1',
                    title: 'Dominio técnico',
                    descriptions: [
                        'Manejo avanzado de técnicas de END, incluyendo: inspección visual-dimensional, ultrasonido convencional, medición de espesores y técnica electromagnética.',
                        'Operación de equipos especializados como lámparas de luz negra, medidores de profundidad, ultrasonido, tintas penetrantes y máquina electromagnética.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_analisis',
            name: '2. Análisis y procesamiento',
            items: [
                {
                    id: 'ndt2_ap_1',
                    title: 'Análisis y procesamiento',
                    descriptions: [
                        'Evaluación de resultados obtenidos mediante diversos métodos.',
                        'Comparación precisa de datos con estándares técnicos como DS-1 y normas ASME, API, etc.',
                        'Interpretación de resultados obtenidos en la observación.',
                        'Clasificación de la tubería o herramienta (operativa, no operativa o cambio de clase) de acuerdo a las normas establecidas para cada proceso.',
                        'Capacidad de demostrar la razón por la cual se establece un resultado y no otro.',
                        'Tener precisión en cuanto al detalle y al conocimiento de la normativa.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_reportes',
            name: '3. Realización de reportes',
            items: [
                {
                    id: 'ndt2_rr_1',
                    title: 'Realización de reportes',
                    descriptions: [
                        'Identificación de inconsistencias o errores en los datos recopilados.',
                        'Elabora informes técnicos claros y detallados que incluyan conclusiones y recomendaciones, con enfoque en estándares técnicos y calidad del servicio.',
                        'Registra y organiza datos de forma impecable, utiliza Excel elaborar reportes detallados que facilitan la toma de decisiones.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_orientacion_cliente',
            name: '4. Orientación al cliente',
            items: [
                {
                    id: 'ndt2_oc_1',
                    title: 'Orientación al cliente',
                    descriptions: [
                        'Habilidad para orientar la acción de los grupos humanos en una dirección determinada, inspirando valores de acción, crear un clima de compromiso y comunicar la visión de la empresa. Establecer directivas, fijar objetivos y prioridades. Motivar e Inspirar confianza. Tener valor para defender ideas, criterios y resultados.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_liderazgo',
            name: '5. Capacidad de liderazgo',
            items: [
                {
                    id: 'ndt2_lid_1',
                    title: 'Capacidad de liderazgo',
                    descriptions: [
                        'Habilidad para orientar la acción de los grupos humanos en una dirección determinada, inspirando valores de acción, crear un clima de compromiso y comunicar la visión de la empresa. Establecer directivas, fijar objetivos y prioridades. Motivar e Inspirar confianza. Tener valor para defender ideas, criterios y resultados.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_sol_prob',
            name: '6. Capacidad de solución de problemas',
            items: [
                {
                    id: 'ndt2_sp_1',
                    title: 'Capacidad de solución de problemas',
                    descriptions: [
                        'Identificación, análisis causal, generación de soluciones potenciales.',
                        'Tomar decisiones, controlar y dar seguimiento. Iniciativa, perseverancia, y energía para alcanzar la solución. Capacidad para explicar las situaciones del entorno.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_plan_estrategica',
            name: '7. Planificación Estratégica',
            items: [
                {
                    id: 'ndt2_pe_1',
                    title: 'Planificación Estratégica',
                    descriptions: [
                        'Tener objetivos y metas definidos, visión de futuro. Estructuración de los medios para alcanzar los objetivos. Comprende los cambios del entorno, conocer las fortalezas y debilidades de la organización y desarrollar mejoras para incrementar el desempeño de los colaboradores y la empresa.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_organizacion',
            name: '8. Capacidad de organización',
            items: [
                {
                    id: 'ndt2_org_1',
                    title: 'Capacidad de organización',
                    descriptions: [
                        'Estructurar los medios para desarrollar las actividades. Capacidad para mantener prioridades. Autodisciplina y puntualidad en sus actividades. Construir planes y métodos para alcanzar los objetivos establecidos.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_comunicacion',
            name: '9. Capacidad comunicación',
            items: [
                {
                    id: 'ndt2_com_1',
                    title: 'Capacidad comunicación',
                    descriptions: [
                        'Capacidad de exponer sus ideas y convencer. Tiene fluidez y facilidad en la comunicación oral. Transmite sus ideas de forma clara y coherente. Saber escuchar los diversos criterios de los demás. Reconocer equivocaciones y construir acuerdos con sus compañeros.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_trab_eq',
            name: '10. Trabajo en equipo',
            items: [
                {
                    id: 'ndt2_te_1',
                    title: 'Trabajo en equipo',
                    descriptions: [
                        'Capacidad de colaborar y cooperar con los demás, de formar parte de un equipo, donde los miembros buscan alcanzar el mismo objetivo.',
                        'Trabaja en grupo para desarrollar procesos, tareas y objetivos compartidos que son beneficios para la empresa.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_compromiso',
            name: '11. Compromiso',
            items: [
                {
                    id: 'ndt2_com_1',
                    title: 'Compromiso',
                    descriptions: [
                        'Tomar decisiones comprometido por completo con el logro de objetivos organizacionales comunes. Controla la puesta en marcha de las acciones acordadas. Cumple con las tareas encomendadas. Es disciplinado, cumple con los horarios de trabajo y los reglamentos internos.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_orientacion_resultados',
            name: '12. Orientación a los resultados',
            items: [
                {
                    id: 'ndt2_or_1',
                    title: 'Orientación a los resultados',
                    descriptions: [
                        'Velar por los resultados planificados para satisfacer las necesidades del cliente.',
                        'Cumplir con los requisitos del Sistema Integrado de Gestión.',
                        'Mantener altos niveles de rendimiento en el tiempo establecido de acuerdo a la planificación diaria, mensual y anual. Controlar que las acciones se lleven a cabo en los plazos establecidos por el cliente.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_iniciativa',
            name: '13. Iniciativa',
            items: [
                {
                    id: 'ndt2_ini_1',
                    title: 'Iniciativa',
                    descriptions: [
                        'Supera el cumplimiento de sus responsabilidades, trabaja productivamente en tareas y proyectos adicionales, que facilitan el logro de los objetivos organizacionales. Realiza mejoras continuas en los procedimientos, para optimizar tiempos y resultados y hacer más eficaces los procesos.',
                        'Diseña indicadores, procedimientos, cronogramas u otras herramientas que facilitan el trabajo y lo hacen más práctico y efectivo.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_innovacion',
            name: '14. Innovación',
            items: [
                {
                    id: 'ndt2_inn_1',
                    title: 'Innovación',
                    descriptions: [
                        'Presenta propuestas y cambios innovadores que producen una transformación importante y optimizan los resultados organizacionales.',
                        'Detecta oportunidades de mejora para las diferentes áreas de la organización, utilizando la visión a largo plazo para elaborar propuestas creativas que beneficien a la organización. Promueve la creatividad, innovación y la asunción de riesgos en su equipo. Motiva a los colaboradores y los involucra en la toma de decisiones, acepta y valora sus ideas y sugerencias.',
                    ],
                },
            ],
        },
        {
            id: 'ndt2_adap_cam',
            name: '15. Adaptabilidad al cambio',
            items: [
                {
                    id: 'ndt2_ac_1',
                    title: 'Adaptabilidad al cambio',
                    descriptions: [
                        'Es promotor del cambio; motiva y entusiasma a los demás para que se adapten a las transformaciones.',
                        'Se anticipa a los cambios de la industria y el mercado realizando propuestas para enfrentarlos. Modifica si es necesario su propia conducta para alcanzar determinados objetivos cuando surgen dificultades, como cambios del entorno interno y externo.',
                    ],
                },
            ],
        },
    ],
    paragraphQuestions: [
        { id: 'ndt2_pq_fortalezas', title: '16. Puntos fuertes: ¿En qué aspectos es este empleado especialmente competente?' },
        { id: 'ndt2_pq_mejorar', title: '17. Áreas qué debe mejorar: ¿Qué comportamientos son clave para conseguir los objetivos organizacionales?' },
        { id: 'ndt2_pq_formacion', title: '18. Necesidades de formación y desarrollo: ¿Qué competencias debe desarrollar el colaborador para promover la mejora continua?' },
    ],
};

// This array will be populated with all surveys as we build them.
export const surveys: Survey[] = [
    ayudanteDeInspeccion,
    coordinadorAdministrativo,
    coordinadorDeProduccion,
    superintendenteDeOperaciones,
    supervisorDeInspeccion,
    inspectorNDT2,
];
