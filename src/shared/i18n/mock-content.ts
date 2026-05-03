export type AppLocale = 'pt-BR' | 'en' | 'es' | string;

type Localized = Partial<Record<'pt-BR' | 'en' | 'es', string>>;

const exact: Record<string, Localized> = {
  'Polpa de açaí congelada — cooperativa ribeirinha': {
    'en': 'Frozen açaí pulp — riverside cooperative',
    'es': 'Pulpa de açaí congelada — cooperativa ribereña'
  },
  'Farinha de mandioca ensacada — casa de farinha': {
    'en': 'Bagged cassava flour — community flour house',
    'es': 'Harina de yuca embolsada — casa de harina comunitaria'
  },
  'Castanha beneficiada com rastreabilidade socioambiental': {
    'en': 'Processed Brazil nuts with socio-environmental traceability',
    'es': 'Castaña procesada con trazabilidad socioambiental'
  },
  'Pirarucu manejado refrigerado': {
    'en': 'Refrigerated managed pirarucu',
    'es': 'Pirarucú manejado refrigerado'
  },
  'Madeira de manejo com DOF': {
    'en': 'Managed timber with DOF permit',
    'es': 'Madera de manejo con permiso DOF'
  },
  'Equipamentos solares para comunidade isolada': {
    'en': 'Solar equipment for isolated community',
    'es': 'Equipos solares para comunidad aislada'
  },
  'Medicamentos refrigerados para abastecimento territorial': {
    'en': 'Refrigerated medicines for territorial supply',
    'es': 'Medicamentos refrigerados para abastecimiento territorial'
  },
  'Contêineres de cabotagem conectada Norte–Nordeste': {
    'en': 'Connected North–Northeast cabotage containers',
    'es': 'Contenedores de cabotaje conectado Norte–Nordeste'
  },

  'Navegação interior refrigerada': {
    'en': 'Refrigerated inland waterway transport',
    'es': 'Navegación interior refrigerada'
  },
  'Navegação interior longitudinal': {
    'en': 'Longitudinal inland navigation',
    'es': 'Navegación interior longitudinal'
  },
  'Operação regional fracionada': {
    'en': 'Regional less-than-load operation',
    'es': 'Operación regional fraccionada'
  },
  'Operação regional refrigerada': {
    'en': 'Regional refrigerated operation',
    'es': 'Operación regional refrigerada'
  },
  'Navegação interior + conexão cabotada': {
    'en': 'Inland navigation + cabotage connection',
    'es': 'Navegación interior + conexión de cabotaje'
  },
  'Operação essencial de abastecimento': {
    'en': 'Essential supply operation',
    'es': 'Operación esencial de abastecimiento'
  },
  'Cabotagem de contêiner com janela portuária': {
    'en': 'Container cabotage with port window',
    'es': 'Cabotaje de contenedor con ventana portuaria'
  },
  'Cabotagem fluvial regional': {
    'en': 'Regional river cabotage',
    'es': 'Cabotaje fluvial regional'
  },
  'Transferência hidroviária regional': {
    'en': 'Regional waterway transfer',
    'es': 'Transferencia hidroviaria regional'
  },
  'Navegação de abastecimento territorial': {
    'en': 'Territorial supply navigation',
    'es': 'Navegación de abastecimiento territorial'
  },
  'Corredor hidroviário amazônico': {
    'en': 'Amazon waterway corridor',
    'es': 'Corredor hidroviario amazónico'
  },
  'Operação fluvial sazonal': {
    'en': 'Seasonal river operation',
    'es': 'Operación fluvial estacional'
  },
  'Linha regional de contêiner e carga geral': {
    'en': 'Regional container and general cargo line',
    'es': 'Línea regional de contenedor y carga general'
  },
  'Conexão fluvial intermunicipal': {
    'en': 'Intermunicipal river connection',
    'es': 'Conexión fluvial intermunicipal'
  },
  'Abastecimento territorial interior': {
    'en': 'Interior territorial supply',
    'es': 'Abastecimiento territorial interior'
  },
  'Consolidação de carga de curto curso': {
    'en': 'Short-haul cargo consolidation',
    'es': 'Consolidación de carga de corto recorrido'
  },
  'Operação granel e carga geral': {
    'en': 'Bulk and general cargo operation',
    'es': 'Operación de granel y carga general'
  },
  'Linha territorial insular': {
    'en': 'Island territorial line',
    'es': 'Línea territorial insular'
  },
  'Corredor de abastecimento essencial': {
    'en': 'Essential supply corridor',
    'es': 'Corredor de abastecimiento esencial'
  },

  'ETA 36–44h • confiança média': {
    'en': 'ETA 36–44h • medium confidence',
    'es': 'ETA 36–44h • confianza media'
  },
  'ETA 4–6 dias • confiança média': {
    'en': 'ETA 4–6 days • medium confidence',
    'es': 'ETA 4–6 días • confianza media'
  },
  'ETA 52–72h • sazonal': {
    'en': 'ETA 52–72h • seasonal',
    'es': 'ETA 52–72h • estacional'
  },
  'ETA 30–42h • sazonal': {
    'en': 'ETA 30–42h • seasonal',
    'es': 'ETA 30–42h • estacional'
  },
  'ETA 5–8 dias • sazonal': {
    'en': 'ETA 5–8 days • seasonal',
    'es': 'ETA 5–8 días • estacional'
  },
  'ETA 6–9 dias • confiança média': {
    'en': 'ETA 6–9 days • medium confidence',
    'es': 'ETA 6–9 días • confianza media'
  },
  'ETA 30–42h': {
    'en': 'ETA 30–42h',
    'es': 'ETA 30–42h'
  },
  'ETA 4–7 dias': {
    'en': 'ETA 4–7 days',
    'es': 'ETA 4–7 días'
  },

  'Documento fiscal da mercadoria.': {
    'en': 'Cargo fiscal document.',
    'es': 'Documento fiscal de la mercancía.'
  },
  'Emitir na contratação do transporte.': {
    'en': 'Issue when hiring transport.',
    'es': 'Emitir al contratar el transporte.'
  },
  'Lista de volumes por lote/cooperativa.': {
    'en': 'List of volumes by batch/cooperative.',
    'es': 'Lista de volúmenes por lote/cooperativa.'
  },
  'Recomendado para polpas congeladas.': {
    'en': 'Recommended for frozen pulps.',
    'es': 'Recomendado para pulpas congeladas.'
  },
  'Recomendado para cadeia de sociobiodiversidade.': {
    'en': 'Recommended for sociobiodiversity chains.',
    'es': 'Recomendado para cadenas de sociobiodiversidad.'
  },
  'Verificar inspeção aplicável ao pescado.': {
    'en': 'Verify applicable fish inspection.',
    'es': 'Verificar inspección aplicable al pescado.'
  },
  'Aplicável em situações específicas de animal aquático vivo/aquicultura.': {
    'en': 'Applicable in specific live aquatic animal/aquaculture situations.',
    'es': 'Aplicable en situaciones específicas de animal acuático vivo/acuicultura.'
  },
  'Obrigatório para produto florestal nativo.': {
    'en': 'Mandatory for native forest products.',
    'es': 'Obligatorio para producto forestal nativo.'
  },

  'Cooperativa com agregação de produtores e janela curta de embarque na safra.': {
    'en': 'Cooperative with aggregated producers and a short harvest shipping window.',
    'es': 'Cooperativa con agregación de productores y ventana corta de embarque en cosecha.'
  },
  'Produto alimentar regional com origem comunitária e lotes agregados.': {
    'en': 'Regional food product with community origin and aggregated batches.',
    'es': 'Producto alimentario regional con origen comunitario y lotes agregados.'
  },
  'Cadeia de sociobiodiversidade com documentação de origem e agregação comunitária.': {
    'en': 'Sociobiodiversity chain with origin documents and community aggregation.',
    'es': 'Cadena de sociobiodiversidad con documentación de origen y agregación comunitaria.'
  },
  'Pescado amazônico com controle sanitário e evidência de cadeia fria.': {
    'en': 'Amazon fish with sanitary control and cold-chain evidence.',
    'es': 'Pescado amazónico con control sanitario y evidencia de cadena fría.'
  },
  'Produto florestal nativo com documentação ambiental obrigatória.': {
    'en': 'Native forest product with mandatory environmental documentation.',
    'es': 'Producto forestal nativo con documentación ambiental obligatoria.'
  },

  'Carga de bioeconomia amazônica com cadeia fria, origem cooperada e necessidade de sincronização de sinal em trechos de baixa conectividade.': {
    'en': 'Amazon bioeconomy cargo with cold chain, cooperative origin and signal sync needs in low-connectivity stretches.',
    'es': 'Carga de bioeconomía amazónica con cadena fría, origen cooperativo y sincronización en tramos de baja conectividad.'
  },
  'Carga seca regional com rastreabilidade de origem, romaneio por lote e previsão sujeita a parada operacional.': {
    'en': 'Regional dry cargo with origin traceability, batch packing list and ETA subject to operational stops.',
    'es': 'Carga seca regional con trazabilidad de origen, lista por lote y previsión sujeta a parada operativa.'
  },
  'Lote de castanha com valor territorial, exigindo evidência de origem e checagem documental antes de reserva.': {
    'en': 'Brazil nut batch with territorial value, requiring origin evidence and document checks before booking.',
    'es': 'Lote de castaña con valor territorial, requiere evidencia de origen y revisión documental antes de reserva.'
  },
  'Carga de pescado com exigência sanitária, lacre, temperatura registrada e prova de embarque.': {
    'en': 'Fish cargo requiring sanitary documents, seal, recorded temperature and loading proof.',
    'es': 'Carga de pescado con exigencia sanitaria, precinto, temperatura registrada y prueba de embarque.'
  },
  'Operação regulada com checagem de DOF, autorização do transportador e janela de vazante.': {
    'en': 'Regulated operation with DOF checks, carrier authorization and low-water window.',
    'es': 'Operación regulada con revisión DOF, autorización del transportista y ventana de vaciante.'
  },

  'Janela curta de cadeia fria': {
    'en': 'Short cold-chain window',
    'es': 'Ventana corta de cadena fría'
  },
  'Sinal intermitente entre terminais menores': {
    'en': 'Intermittent signal between smaller terminals',
    'es': 'Señal intermitente entre terminales menores'
  },
  'Consolidação de lotes': {
    'en': 'Batch consolidation',
    'es': 'Consolidación de lotes'
  },
  'Variação de prazo por parada em comunidade': {
    'en': 'Timing variation due to community stop',
    'es': 'Variación de plazo por parada comunitaria'
  },
  'Trecho sujeito a vazante': {
    'en': 'Stretch subject to low-water season',
    'es': 'Tramo sujeto a vaciante'
  },
  'Coleta de evidência offline': {
    'en': 'Offline evidence collection',
    'es': 'Recolección de evidencia sin conexión'
  },
  'Cadeia fria crítica': {
    'en': 'Critical cold chain',
    'es': 'Cadena fría crítica'
  },
  'Fiscalização sanitária': {
    'en': 'Sanitary inspection',
    'es': 'Fiscalización sanitaria'
  },
  'Janela de maré e atracação compartilhada': {
    'en': 'Tide window and shared docking',
    'es': 'Ventana de marea y atraque compartido'
  },
  'Coleta documental com sincronização tardia': {
    'en': 'Document collection with late sync',
    'es': 'Recolección documental con sincronización tardía'
  },
  'Trecho com menor calado operacional': {
    'en': 'Stretch with lower operating draft',
    'es': 'Tramo con menor calado operativo'
  },
  'Necessidade de prova fotográfica no embarque': {
    'en': 'Photo proof required at loading',
    'es': 'Necesidad de prueba fotográfica en el embarque'
  },

  'SLA operacional registrado': {
    'en': 'Operational SLA registered',
    'es': 'SLA operativo registrado'
  },
  'Transportador com prontidão para baixa conectividade.': {
    'en': 'Carrier ready for low-connectivity operation.',
    'es': 'Transportista preparado para baja conectividad.'
  },
  'Validar janela de atracação sanitária': {
    'en': 'Validate sanitary docking window',
    'es': 'Validar ventana de atraque sanitario'
  },
  'Responder contraproposta e validar cronograma': {
    'en': 'Answer counteroffer and validate schedule',
    'es': 'Responder contrapropuesta y validar cronograma'
  },
  'Emitir booking final e anexar manifesto': {
    'en': 'Issue final booking and attach manifest',
    'es': 'Emitir booking final y adjuntar manifiesto'
  },

  'Carga geral fluvial': {
    'en': 'General river cargo',
    'es': 'Carga general fluvial'
  },
  'Carga mista insular': {
    'en': 'Mixed island cargo',
    'es': 'Carga mixta insular'
  },
  'Refrigerado essencial': {
    'en': 'Essential refrigerated service',
    'es': 'Refrigerado esencial'
  },
  'Carga seca regional': {
    'en': 'Regional dry cargo',
    'es': 'Carga seca regional'
  },
  'Balsa refrigerada': {
    'en': 'Refrigerated barge',
    'es': 'Barcaza refrigerada'
  },
  'Cabotagem contêiner': {
    'en': 'Container cabotage',
    'es': 'Cabotaje de contenedor'
  },

  'Documentação validada': {
    'en': 'Documents validated',
    'es': 'Documentación validada'
  },
  'NF-e, romaneio e laudo sanitário conferidos para embarque.': {
    'en': 'NF-e, packing list and sanitary report checked for shipment.',
    'es': 'NF-e, lista de bultos e informe sanitario revisados para embarque.'
  },
  'Belém, PA': {
    'en': 'Belém, PA',
    'es': 'Belém, PA'
  },
  'Dossiê digital': {
    'en': 'Digital dossier',
    'es': 'Expediente digital'
  },
  'Carga lacrada no terminal': {
    'en': 'Cargo sealed at terminal',
    'es': 'Carga precintada en terminal'
  },
  'Temperatura e lacre registrados com evidência fotográfica.': {
    'en': 'Temperature and seal recorded with photo evidence.',
    'es': 'Temperatura y precinto registrados con evidencia fotográfica.'
  },
  'Foto + sensor': {
    'en': 'Photo + sensor',
    'es': 'Foto + sensor'
  },
  'Em navegação pelo Amazonas': {
    'en': 'Navigating through the Amazon River',
    'es': 'En navegación por el Amazonas'
  },
  'Embarcação reportou posição com sincronização tardia.': {
    'en': 'Vessel reported position with delayed sync.',
    'es': 'La embarcación informó posición con sincronización tardía.'
  },
  'Sinal intermitente': {
    'en': 'Intermittent signal',
    'es': 'Señal intermitente'
  },
  'Janela de atracação confirmada': {
    'en': 'Docking window confirmed',
    'es': 'Ventana de atraque confirmada'
  },
  'Equipe local confirmou berço e equipe de descarga.': {
    'en': 'Local team confirmed berth and unloading crew.',
    'es': 'El equipo local confirmó muelle y equipo de descarga.'
  },
  'Confirmação operacional': {
    'en': 'Operational confirmation',
    'es': 'Confirmación operativa'
  },
  'Checklist de descarga em preparação': {
    'en': 'Unloading checklist in preparation',
    'es': 'Checklist de descarga en preparación'
  },
  'Equipe prepara conferência final de volumes e integridade.': {
    'en': 'Team prepares final volume and integrity check.',
    'es': 'El equipo prepara revisión final de volúmenes e integridad.'
  },
  'Checklist digital': {
    'en': 'Digital checklist',
    'es': 'Checklist digital'
  },
  'Reserva + SLA sanitário': {
    'en': 'Booking + sanitary SLA',
    'es': 'Reserva + SLA sanitario'
  },
  'Saúde e cadeia fria': {
    'en': 'Healthcare and cold chain',
    'es': 'Salud y cadena fría'
  },
  '30% reserva / saldo na entrega': {
    'en': '30% booking / balance on delivery',
    'es': '30% reserva / saldo en entrega'
  },
  'Carga seca e rastreável': {
    'en': 'Dry and traceable cargo',
    'es': 'Carga seca y trazable'
  },
  'Booking + terminal window': {
    'en': 'Booking + terminal window',
    'es': 'Booking + ventana de terminal'
  },
  'Portuário': {
    'en': 'Port operation',
    'es': 'Portuario'
  },
  'Controle de temperatura ok': {
    'en': 'Temperature control ok',
    'es': 'Control de temperatura ok'
  },
  'Declaração de origem revisada': {
    'en': 'Origin declaration reviewed',
    'es': 'Declaración de origen revisada'
  },
  'Manifesto pendente': {
    'en': 'Manifest pending',
    'es': 'Manifiesto pendiente'
  },
  'CT-e em emissão': {
    'en': 'CT-e being issued',
    'es': 'CT-e en emisión'
  },
  'Romaneio': {
    'en': 'Packing list',
    'es': 'Lista de bultos'
  },
  'Laudo sanitário': {
    'en': 'Sanitary report',
    'es': 'Informe sanitario'
  },
  'Documento sanitário': {
    'en': 'Sanitary document',
    'es': 'Documento sanitario'
  },
  'Declaração de origem': {
    'en': 'Origin declaration',
    'es': 'Declaración de origen'
  },
  'Controle de temperatura': {
    'en': 'Temperature control',
    'es': 'Control de temperatura'
  },
  'Checklist de integridade': {
    'en': 'Integrity checklist',
    'es': 'Checklist de integridad'
  },
  'Manifesto': {
    'en': 'Manifest',
    'es': 'Manifiesto'
  },
  'Manifesto digital': {
    'en': 'Digital manifest',
    'es': 'Manifiesto digital'
  },
  'DOF obrigatório': {
    'en': 'Mandatory DOF',
    'es': 'DOF obligatorio'
  },
  'NF-e pendente de anexação': {
    'en': 'NF-e pending attachment',
    'es': 'NF-e pendiente de adjuntar'
  },
  'Romaneio validado': {
    'en': 'Packing list validated',
    'es': 'Lista de bultos validada'
  },
  'ANTAQ em revisão': {
    'en': 'ANTAQ under review',
    'es': 'ANTAQ en revisión'
  },
  'Seguro P&I': {
    'en': 'P&I insurance',
    'es': 'Seguro P&I'
  },
  'Lacre digital': {
    'en': 'Digital seal',
    'es': 'Precinto digital'
  },
  'Terminal ready': {
    'en': 'Terminal ready',
    'es': 'Terminal listo'
  },
  'Rastreio': {
    'en': 'Tracking',
    'es': 'Rastreo'
  },
  'Cabotagem': {
    'en': 'Cabotage',
    'es': 'Cabotaje'
  },
  'Fracionada': {
    'en': 'Less-than-load',
    'es': 'Fraccionada'
  },
  'Refrigerada': {
    'en': 'Refrigerated',
    'es': 'Refrigerada'
  },
  'Seca': {
    'en': 'Dry',
    'es': 'Seca'
  },
  'Projeto': {
    'en': 'Project cargo',
    'es': 'Carga proyecto'
  },
  'Granel leve': {
    'en': 'Light bulk',
    'es': 'Granel ligero'
  },
  'Reefer': {
    'en': 'Reefer',
    'es': 'Reefer'
  },
  'Comboio de barcaças': {
    'en': 'Barge convoy',
    'es': 'Convoy de barcazas'
  },
  'Embarcação regional refrigerada': {
    'en': 'Regional refrigerated vessel',
    'es': 'Embarcación regional refrigerada'
  },
  'Empurrador + barcaça': {
    'en': 'Pusher + barge',
    'es': 'Empujador + barcaza'
  },
  'Multiuso de cabotagem': {
    'en': 'Multipurpose cabotage vessel',
    'es': 'Multiuso de cabotaje'
  },
  'Cabotagem conectada': {
    'en': 'Connected cabotage',
    'es': 'Cabotaje conectado'
  },
  'Cadeia fria': {
    'en': 'Cold chain',
    'es': 'Cadena de frío'
  },
  'Cadeia fria coberta': {
    'en': 'Cold chain covered',
    'es': 'Cadena de frío cubierta'
  },
  'Baixa conectividade': {
    'en': 'Low connectivity',
    'es': 'Baja conectividad'
  },
  'Baixa conectividade pronta': {
    'en': 'Low-connectivity ready',
    'es': 'Baja conectividad lista'
  },
  'Baixa conectividade pendente': {
    'en': 'Low-connectivity pending',
    'es': 'Baja conectividad pendiente'
  },
  'Checklist digital pronto': {
    'en': 'Digital checklist ready',
    'es': 'Checklist digital listo'
  },
  'Checklist pendente': {
    'en': 'Checklist pending',
    'es': 'Checklist pendiente'
  },
  'Regular': {
    'en': 'Regular',
    'es': 'Regular'
  },
  'Em revisão': {
    'en': 'Under review',
    'es': 'En revisión'
  },
  'Disponível': {
    'en': 'Available',
    'es': 'Disponible'
  },
  'Em rota': {
    'en': 'En route',
    'es': 'En ruta'
  },
  'Manutenção': {
    'en': 'Maintenance',
    'es': 'Mantenimiento'
  },
  'Contratação': {
    'en': 'Contracting',
    'es': 'Contratación'
  },
  'Cotação': {
    'en': 'Quote',
    'es': 'Cotización'
  },
  'Contraproposta': {
    'en': 'Counteroffer',
    'es': 'Contraoferta'
  },
  'Contrato': {
    'en': 'Contract',
    'es': 'Contrato'
  },
  'Contrato em minuta': {
    'en': 'Draft contract',
    'es': 'Contrato en borrador'
  },
  'Contrato mediante DOF': {
    'en': 'Contract subject to DOF',
    'es': 'Contrato mediante DOF'
  },
  'Empenho + aceite digital': {
    'en': 'Commitment + digital acceptance',
    'es': 'Compromiso + aceptación digital'
  },
  '50% reserva / 50% POD': {
    'en': '50% booking / 50% POD',
    'es': '50% reserva / 50% POD'
  },
  'Ambiental e carga': {
    'en': 'Environmental and cargo',
    'es': 'Ambiental y carga'
  },
  'Seguro ativo': {
    'en': 'Insurance active',
    'es': 'Seguro activo'
  },
  'Anexar laudo sanitário e confirmar lacre': {
    'en': 'Attach sanitary report and confirm seal',
    'es': 'Adjuntar informe sanitario y confirmar precinto'
  },
  'Compliance revisar autorização e janela de vazante': {
    'en': 'Compliance to review authorization and low-water window',
    'es': 'Compliance revisará autorización y ventana de bajante'
  },
  'Gerar reserva e checklist de embarque': {
    'en': 'Generate booking and shipment checklist',
    'es': 'Generar reserva y checklist de embarque'
  },
  'Hoje': {
    'en': 'Today',
    'es': 'Hoy'
  },
  'Ontem': {
    'en': 'Yesterday',
    'es': 'Ayer'
  },
  'Hoje, 08:10': {
    'en': 'Today, 08:10',
    'es': 'Hoy, 08:10'
  },
  'Hoje, 09:05': {
    'en': 'Today, 09:05',
    'es': 'Hoy, 09:05'
  },
  'Hoje, 10:40': {
    'en': 'Today, 10:40',
    'es': 'Hoy, 10:40'
  },
  'Hoje, 11:15': {
    'en': 'Today, 11:15',
    'es': 'Hoy, 11:15'
  },
  'Ontem, 17:25': {
    'en': 'Yesterday, 17:25',
    'es': 'Ayer, 17:25'
  },
  'Ontem, 18:22': {
    'en': 'Yesterday, 18:22',
    'es': 'Ayer, 18:22'
  },
  '06 mai • 08:30': {
    'en': 'May 06 • 08:30',
    'es': '06 may • 08:30'
  },
  '06 mai • 11:40': {
    'en': 'May 06 • 11:40',
    'es': '06 may • 11:40'
  },
  '06 mai • 19:15': {
    'en': 'May 06 • 19:15',
    'es': '06 may • 19:15'
  },
  '07 mai • 09:00': {
    'en': 'May 07 • 09:00',
    'es': '07 may • 09:00'
  },
  '07 mai • 11:20': {
    'en': 'May 07 • 11:20',
    'es': '07 may • 11:20'
  },
  '07 mai • 13:05': {
    'en': 'May 07 • 13:05',
    'es': '07 may • 13:05'
  },
  '07 mai • 15:30': {
    'en': 'May 07 • 15:30',
    'es': '07 may • 15:30'
  },
  '06-10 maio': {
    'en': 'May 06–10',
    'es': '06–10 mayo'
  },
  '07-11 maio': {
    'en': 'May 07–11',
    'es': '07–11 mayo'
  },
  '08-12 maio': {
    'en': 'May 08–12',
    'es': '08–12 mayo'
  },
  '09-13 maio': {
    'en': 'May 09–13',
    'es': '09–13 mayo'
  },
  '10-14 maio': {
    'en': 'May 10–14',
    'es': '10–14 mayo'
  },
  '11-15 maio': {
    'en': 'May 11–15',
    'es': '11–15 mayo'
  },
  '13-17 maio': {
    'en': 'May 13–17',
    'es': '13–17 mayo'
  },
  '16-20 maio': {
    'en': 'May 16–20',
    'es': '16–20 mayo'
  },
  '18-22 maio': {
    'en': 'May 18–22',
    'es': '18–22 mayo'
  },
  '6 dias': {
    'en': '6 days',
    'es': '6 días'
  },
  '5 dias': {
    'en': '5 days',
    'es': '5 días'
  },
  'ETA 4–5 dias • alta confiança': {
    'en': 'ETA 4–5 days • high confidence',
    'es': 'ETA 4–5 días • alta confianza'
  },
  'ETA 5–6 dias • alta confiança': {
    'en': 'ETA 5–6 days • high confidence',
    'es': 'ETA 5–6 días • alta confianza'
  },
  'ETA 6–8 dias • confiança média': {
    'en': 'ETA 6–8 days • medium confidence',
    'es': 'ETA 6–8 días • confianza media'
  },
  'ETA 7–10 dias • sazonal': {
    'en': 'ETA 7–10 days • seasonal',
    'es': 'ETA 7–10 días • estacional'
  },
  'Aplicável em situação sanitária específica.': {
    'en': 'Applicable in specific sanitary situations.',
    'es': 'Aplicable en situación sanitaria específica.'
  },
  'Vazante no rio Madeira': {
    'en': 'Low water on the Madeira River',
    'es': 'Bajante en el río Madeira'
  },
  'Documento ambiental obrigatório': {
    'en': 'Mandatory environmental document',
    'es': 'Documento ambiental obligatorio'
  },
  'Cadeia de valor regional com lotes de pequeno produtor.': {
    'en': 'Regional value chain with small producer batches.',
    'es': 'Cadena de valor regional con lotes de pequeños productores.'
  },
  'Carga de bioeconomia com consolidação em terminal regional e documentação por lote.': {
    'en': 'Bioeconomy cargo consolidated at a regional terminal with batch-level documentation.',
    'es': 'Carga de bioeconomía consolidada en terminal regional con documentación por lote.'
  },
  'Útil para rastreabilidade comercial e institucional.': {
    'en': 'Useful for commercial and institutional traceability.',
    'es': 'Útil para trazabilidad comercial e institucional.'
  },
  'Consolidação multi-produtor': {
    'en': 'Multi-producer consolidation',
    'es': 'Consolidación multiproductor'
  },
  'Carga de interesse público com prioridade operacional e prova de temperatura.': {
    'en': 'Public-interest cargo with operational priority and temperature proof.',
    'es': 'Carga de interés público con prioridad operativa y prueba de temperatura.'
  },
  'Carga crítica para abastecimento territorial, com trilha de evidências, temperatura e sincronização tardia.': {
    'en': 'Critical cargo for territorial supply, with evidence trail, temperature and delayed sync.',
    'es': 'Carga crítica para abastecimiento territorial, con trazabilidad de evidencias, temperatura y sincronización tardía.'
  },
  'Evidência operacional de cadeia fria.': {
    'en': 'Operational cold-chain evidence.',
    'es': 'Evidencia operativa de cadena de frío.'
  },
  'Prioridade pública': {
    'en': 'Public priority',
    'es': 'Prioridad pública'
  },
  'Temperatura controlada': {
    'en': 'Controlled temperature',
    'es': 'Temperatura controlada'
  },
  'Operação de política pública com equipamentos sensíveis e pontos de entrega múltiplos.': {
    'en': 'Public policy operation with sensitive equipment and multiple delivery points.',
    'es': 'Operación de política pública con equipos sensibles y múltiples puntos de entrega.'
  },
  'Carga projeto com checklist de integridade, roteirização por comunidades e aceite digital.': {
    'en': 'Project cargo with integrity checklist, community routing and digital acceptance.',
    'es': 'Carga proyecto con checklist de integridad, rutas por comunidades y aceptación digital.'
  },
  'Recomendado para equipamentos sensíveis.': {
    'en': 'Recommended for sensitive equipment.',
    'es': 'Recomendado para equipos sensibles.'
  },
  'Entrega multi-ponto': {
    'en': 'Multi-point delivery',
    'es': 'Entrega multipunto'
  },
  'Integridade de equipamento': {
    'en': 'Equipment integrity',
    'es': 'Integridad del equipo'
  },
  'Operação inter-regional com conexão portuária e escala de contêiner.': {
    'en': 'Interregional operation with port connection and container call.',
    'es': 'Operación interregional con conexión portuaria y escala de contenedor.'
  },
  'Conexão de cabotagem com documentos fiscais, booking e previsibilidade superior.': {
    'en': 'Cabotage connection with fiscal documents, booking and stronger predictability.',
    'es': 'Conexión de cabotaje con documentos fiscales, booking y mayor previsibilidad.'
  },
  'Aplicável em operação portuária/cabotagem.': {
    'en': 'Applicable to port/cabotage operation.',
    'es': 'Aplicable en operación portuaria/cabotaje.'
  },
  'Janela de terminal portuário': {
    'en': 'Port terminal window',
    'es': 'Ventana de terminal portuaria'
  },
  'NF-e, romaneio e exigências condicionais conferidas.': {
    'en': 'NF-e, packing list and conditional requirements checked.',
    'es': 'NF-e, lista de bultos y exigencias condicionales revisadas.'
  },
  'Checklist documental assinado': {
    'en': 'Document checklist signed',
    'es': 'Checklist documental firmado'
  },
  'Cadeia fria registrada antes do embarque.': {
    'en': 'Cold chain recorded before shipment.',
    'es': 'Cadena de frío registrada antes del embarque.'
  },
  'Foto do lacre + sensor 2 °C': {
    'en': 'Seal photo + 2 °C sensor',
    'es': 'Foto del precinto + sensor 2 °C'
  },
  'Evento sincronizado com atraso por baixa conectividade.': {
    'en': 'Event synced late due to low connectivity.',
    'es': 'Evento sincronizado con retraso por baja conectividad.'
  },
  'Atualização operacional pendente': {
    'en': 'Operational update pending',
    'es': 'Actualización operativa pendiente'
  },
  'Comprovante de entrega e aceite digital.': {
    'en': 'Proof of delivery and digital acceptance.',
    'es': 'Comprobante de entrega y aceptación digital.'
  },
  'Assinatura do recebedor': {
    'en': 'Receiver signature',
    'es': 'Firma del receptor'
  },
  'Exceção aberta': {
    'en': 'Exception opened',
    'es': 'Excepción abierta'
  },
  'DOF e documentação da embarcação precisam de validação antes da reserva.': {
    'en': 'DOF and vessel documentation need validation before booking.',
    'es': 'DOF y documentación de la embarcación deben validarse antes de la reserva.'
  },
  'Contraproposta enviada': {
    'en': 'Counteroffer sent',
    'es': 'Contraoferta enviada'
  },
  'Cotação recebida': {
    'en': 'Quote received',
    'es': 'Cotización recibida'
  },
  'Transportador compatível com cadeia fria e baixa conectividade.': {
    'en': 'Carrier compatible with cold chain and low connectivity.',
    'es': 'Transportista compatible con cadena de frío y baja conectividad.'
  },
  'Carga pronta para reserva operacional.': {
    'en': 'Cargo ready for operational booking.',
    'es': 'Carga lista para reserva operativa.'
  },
  'Operação portuária alinhada com janela do terminal.': {
    'en': 'Port operation aligned with terminal window.',
    'es': 'Operación portuaria alineada con ventana de terminal.'
  },
  'Ajuste de janela e roteiro fluvial.': {
    'en': 'Window and river route adjustment.',
    'es': 'Ajuste de ventana y ruta fluvial.'
  },
  'Documentos validados': {
    'en': 'Documents validated',
    'es': 'Documentos validados'
  },
  'Lacre e temperatura conferidos': {
    'en': 'Seal and temperature checked',
    'es': 'Precinto y temperatura revisados'
  },
  'Navegação em curso': {
    'en': 'Navigation in progress',
    'es': 'Navegación en curso'
  },
  'Previsão de atracação atualizada': {
    'en': 'Updated docking forecast',
    'es': 'Previsión de atraque actualizada'
  },
  'POD recebido': {
    'en': 'POD received',
    'es': 'POD recibido'
  },
  'Navegação interior': {
    'en': 'Inland navigation',
    'es': 'Navegación interior'
  },

  'Abastecimento essencial refrigerado': {
    'en': 'Essential refrigerated supply',
    'es': 'Abastecimiento esencial refrigerado'
  },
  'Carga fracionada de sociobioeconomia': {
    'en': 'Less-than-load sociobioeconomy cargo',
    'es': 'Carga fraccionada de sociobioeconomía'
  },
  'Carga projeto e abastecimento territorial': {
    'en': 'Project cargo and territorial supply',
    'es': 'Carga proyecto y abastecimiento territorial'
  },
  'Conexão portuária': {
    'en': 'Port connection',
    'es': 'Conexión portuaria'
  },
  'Checklist de integridade ok': {
    'en': 'Integrity checklist ok',
    'es': 'Checklist de integridad ok'
  },
  'NF-e ok': {
    'en': 'NF-e ok',
    'es': 'NF-e ok'
  },
  'ETA ajustado conforme janela de vazante e tráfego local.': {
    'en': 'ETA adjusted according to low-water window and local traffic.',
    'es': 'ETA ajustado según ventana de bajante y tráfico local.'
  },
  'Equipamento sensível': {
    'en': 'Sensitive equipment',
    'es': 'Equipo sensible'
  },
  'Sincronização tardia de sinal': {
    'en': 'Delayed signal sync',
    'es': 'Sincronización tardía de señal'
  },
  'Cacau e cupuaçu em cadeia de bioeconomia': {
    'en': 'Cocoa and cupuaçu in a bioeconomy chain',
    'es': 'Cacao y cupuaçu en cadena de bioeconomía'
  },
  'Equipamentos solares para comunidades ribeirinhas': {
    'en': 'Solar equipment for riverside communities',
    'es': 'Equipos solares para comunidades ribereñas'
  },
  'Rio Amazonas': {
    'en': 'Amazon River',
    'es': 'Río Amazonas'
  },
  'Terminal de Belém': {
    'en': 'Belém terminal',
    'es': 'Terminal de Belém'
  },

};

const patterns: Array<[RegExp, Localized]> = [
  [/^(\d{2})-(\d{2}) maio$/i, {
    en: 'May $1–$2',
    es: '$1–$2 mayo'
  }],
  [/^(\d{2}) mai • (.+)$/i, {
    en: 'May $1 • $2',
    es: '$1 may • $2'
  }],
  [/^Hoje, (.+)$/i, {
    en: 'Today, $1',
    es: 'Hoy, $1'
  }],
  [/^Ontem, (.+)$/i, {
    en: 'Yesterday, $1',
    es: 'Ayer, $1'
  }],
  [/^(\d+) dias$/i, {
    en: '$1 days',
    es: '$1 días'
  }],
  [/^ETA (\d+)[–-](\d+) dias • confiança média$/i, {
    en: 'ETA $1–$2 days • medium confidence',
    es: 'ETA $1–$2 días • confianza media'
  }],
  [/^ETA (\d+)[–-](\d+) dias • alta confiança$/i, {
    en: 'ETA $1–$2 days • high confidence',
    es: 'ETA $1–$2 días • alta confianza'
  }],
  [/^ETA (\d+)[–-](\d+) dias • sazonal$/i, {
    en: 'ETA $1–$2 days • seasonal',
    es: 'ETA $1–$2 días • estacional'
  }],
  [/^ETA (\d+)[–-](\d+)h • confiança média$/i, {
    en: 'ETA $1–$2h • medium confidence',
    es: 'ETA $1–$2h • confianza media'
  }],
  [/^(.+) • lote (\d+)$/i, {
    en: '$1 • batch $2',
    es: '$1 • lote $2'
  }],
  [/^(.+) Lote QA (\d+) com consolidação hidroviária simulada\.$/i, {
    en: '$1 QA batch $2 with simulated waterway consolidation.',
    es: '$1 Lote QA $2 con consolidación hidroviaria simulada.'
  }],
  [/^(.+) Cenário adicional para testes de busca, paginação e estados de contratação\.$/i, {
    en: '$1 Additional scenario for testing search, pagination and contracting states.',
    es: '$1 Escenario adicional para pruebas de búsqueda, paginación y estados de contratación.'
  }]
];

function normalizeLocale(locale: AppLocale): 'pt-BR' | 'en' | 'es' {
  if (locale === 'pt-BR') return 'pt-BR';
  if (locale.startsWith('es')) return 'es';
  return 'en';
}

function translateWithPatterns(locale: 'pt-BR' | 'en' | 'es', value: string) {
  for (const [pattern, localized] of patterns) {
    const match = value.match(pattern);
    if (match) {
      const template = localized[locale];
      if (!template) return value;
      const translatedBase = match[1] ? translateMock(locale, match[1]) : '';
      let result = template;
      if (match[1]) result = result.replace('$1', translatedBase);
      for (let index = 2; index < match.length; index += 1) {
        result = result.replace(`$${index}`, match[index] ?? '');
      }
      return result;
    }
  }

  return value;
}

export function translateMock(locale: AppLocale, value?: string | null): string {
  if (!value) return '';
  const normalized = normalizeLocale(locale);
  if (normalized === 'pt-BR') return value;

  const translated = exact[value]?.[normalized];
  if (translated) return translated;

  return translateWithPatterns(normalized, value);
}

export function translateMockList(locale: AppLocale, values?: string[] | null): string[] {
  return (values ?? []).map((value) => translateMock(locale, value));
}
