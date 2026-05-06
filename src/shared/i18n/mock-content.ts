type Localized = Partial<Record<'pt-BR' | 'en-US' | 'es', string>>;

const exact: Record<string, Localized> = {
  'Polpa de açaí congelada — cooperativa ribeirinha': {
    'en-US': 'Frozen açaí pulp — riverside cooperative',
    'es': 'Pulpa de açaí congelada — cooperativa ribereña'
  },
  'Farinha de mandioca ensacada — casa de farinha': {
    'en-US': 'Bagged cassava flour — community flour house',
    'es': 'Harina de yuca embolsada — casa de harina comunitaria'
  },
  'Castanha beneficiada com rastreabilidade socioambiental': {
    'en-US': 'Processed Brazil nuts with socio-environmental traceability',
    'es': 'Castaña procesada con trazabilidad socioambiental'
  },
  'Pirarucu manejado refrigerado': {
    'en-US': 'Refrigerated managed pirarucu',
    'es': 'Pirarucú manejado refrigerado'
  },
  'Madeira de manejo com DOF': {
    'en-US': 'Managed timber with DOF permit',
    'es': 'Madera de manejo con permiso DOF'
  },
  'Equipamentos solares para comunidade isolada': {
    'en-US': 'Solar equipment for isolated community',
    'es': 'Equipos solares para comunidad aislada'
  },
  'Medicamentos refrigerados para abastecimento territorial': {
    'en-US': 'Refrigerated medicines for territorial supply',
    'es': 'Medicamentos refrigerados para abastecimiento territorial'
  },
  'Contêineres de cabotagem conectada Norte–Nordeste': {
    'en-US': 'Connected North–Northeast cabotage containers',
    'es': 'Contenedores de cabotaje conectado Norte–Nordeste'
  },

  'Navegação interior refrigerada': {
    'en-US': 'Refrigerated inland waterway transport',
    'es': 'Navegación interior refrigerada'
  },
  'Navegação interior longitudinal': {
    'en-US': 'Longitudinal inland navigation',
    'es': 'Navegación interior longitudinal'
  },
  'Operação regional fracionada': {
    'en-US': 'Regional less-than-load operation',
    'es': 'Operación regional fraccionada'
  },
  'Operação regional refrigerada': {
    'en-US': 'Regional refrigerated operation',
    'es': 'Operación regional refrigerada'
  },
  'Navegação interior + conexão cabotada': {
    'en-US': 'Inland navigation + cabotage connection',
    'es': 'Navegación interior + conexión de cabotaje'
  },
  'Operação essencial de abastecimento': {
    'en-US': 'Essential supply operation',
    'es': 'Operación esencial de abastecimiento'
  },
  'Cabotagem de contêiner com janela portuária': {
    'en-US': 'Container cabotage with port window',
    'es': 'Cabotaje de contenedor con ventana portuaria'
  },
  'Cabotagem fluvial regional': {
    'en-US': 'Regional river cabotage',
    'es': 'Cabotaje fluvial regional'
  },
  'Transferência hidroviária regional': {
    'en-US': 'Regional waterway transfer',
    'es': 'Transferencia hidroviaria regional'
  },
  'Navegação de abastecimento territorial': {
    'en-US': 'Territorial supply navigation',
    'es': 'Navegación de abastecimiento territorial'
  },
  'Corredor hidroviário amazônico': {
    'en-US': 'Amazon waterway corridor',
    'es': 'Corredor hidroviario amazónico'
  },
  'Operação fluvial sazonal': {
    'en-US': 'Seasonal river operation',
    'es': 'Operación fluvial estacional'
  },
  'Linha regional de contêiner e carga geral': {
    'en-US': 'Regional container and general cargo line',
    'es': 'Línea regional de contenedor y carga general'
  },
  'Conexão fluvial intermunicipal': {
    'en-US': 'Intermunicipal river connection',
    'es': 'Conexión fluvial intermunicipal'
  },
  'Abastecimento territorial interior': {
    'en-US': 'Interior territorial supply',
    'es': 'Abastecimiento territorial interior'
  },
  'Consolidação de carga de curto curso': {
    'en-US': 'Short-haul cargo consolidation',
    'es': 'Consolidación de carga de corto recorrido'
  },
  'Operação granel e carga geral': {
    'en-US': 'Bulk and general cargo operation',
    'es': 'Operación de granel y carga general'
  },
  'Linha territorial insular': {
    'en-US': 'Island territorial line',
    'es': 'Línea territorial insular'
  },
  'Corredor de abastecimento essencial': {
    'en-US': 'Essential supply corridor',
    'es': 'Corredor de abastecimiento esencial'
  },

  'ETA 36–44h • confiança média': {
    'en-US': 'ETA 36–44h • medium confidence',
    'es': 'ETA 36–44h • confianza media'
  },
  'ETA 4–6 dias • confiança média': {
    'en-US': 'ETA 4–6 days • medium confidence',
    'es': 'ETA 4–6 días • confianza media'
  },
  'ETA 52–72h • sazonal': {
    'en-US': 'ETA 52–72h • seasonal',
    'es': 'ETA 52–72h • estacional'
  },
  'ETA 30–42h • sazonal': {
    'en-US': 'ETA 30–42h • seasonal',
    'es': 'ETA 30–42h • estacional'
  },
  'ETA 5–8 dias • sazonal': {
    'en-US': 'ETA 5–8 days • seasonal',
    'es': 'ETA 5–8 días • estacional'
  },
  'ETA 6–9 dias • confiança média': {
    'en-US': 'ETA 6–9 days • medium confidence',
    'es': 'ETA 6–9 días • confianza media'
  },
  'ETA 30–42h': {
    'en-US': 'ETA 30–42h',
    'es': 'ETA 30–42h'
  },
  'ETA 4–7 dias': {
    'en-US': 'ETA 4–7 days',
    'es': 'ETA 4–7 días'
  },

  'Documento fiscal da mercadoria.': {
    'en-US': 'Cargo fiscal document.',
    'es': 'Documento fiscal de la mercancía.'
  },
  'Emitir na contratação do transporte.': {
    'en-US': 'Issue when hiring transport.',
    'es': 'Emitir al contratar el transporte.'
  },
  'Lista de volumes por lote/cooperativa.': {
    'en-US': 'List of volumes by batch/cooperative.',
    'es': 'Lista de volúmenes por lote/cooperativa.'
  },
  'Recomendado para polpas congeladas.': {
    'en-US': 'Recommended for frozen pulps.',
    'es': 'Recomendado para pulpas congeladas.'
  },
  'Recomendado para cadeia de sociobiodiversidade.': {
    'en-US': 'Recommended for sociobiodiversity chains.',
    'es': 'Recomendado para cadenas de sociobiodiversidad.'
  },
  'Verificar inspeção aplicável ao pescado.': {
    'en-US': 'Verify applicable fish inspection.',
    'es': 'Verificar inspección aplicable al pescado.'
  },
  'Aplicável em situações específicas de animal aquático vivo/aquicultura.': {
    'en-US': 'Applicable in specific live aquatic animal/aquaculture situations.',
    'es': 'Aplicable en situaciones específicas de animal acuático vivo/acuicultura.'
  },
  'Obrigatório para produto florestal nativo.': {
    'en-US': 'Mandatory for native forest products.',
    'es': 'Obligatorio para producto forestal nativo.'
  },

  'Cooperativa com agregação de produtores e janela curta de embarque na safra.': {
    'en-US': 'Cooperative with aggregated producers and a short harvest shipping window.',
    'es': 'Cooperativa con agregación de productores y ventana corta de embarque en cosecha.'
  },
  'Produto alimentar regional com origem comunitária e lotes agregados.': {
    'en-US': 'Regional food product with community origin and aggregated batches.',
    'es': 'Producto alimentario regional con origen comunitario y lotes agregados.'
  },
  'Cadeia de sociobiodiversidade com documentação de origem e agregação comunitária.': {
    'en-US': 'Sociobiodiversity chain with origin documents and community aggregation.',
    'es': 'Cadena de sociobiodiversidad con documentación de origen y agregación comunitaria.'
  },
  'Pescado amazônico com controle sanitário e evidência de cadeia fria.': {
    'en-US': 'Amazon fish with sanitary control and cold-chain evidence.',
    'es': 'Pescado amazónico con control sanitario y evidencia de cadena fría.'
  },
  'Produto florestal nativo com documentação ambiental obrigatória.': {
    'en-US': 'Native forest product with mandatory environmental documentation.',
    'es': 'Producto forestal nativo con documentación ambiental obligatoria.'
  },

  'Carga de bioeconomia amazônica com cadeia fria, origem cooperada e necessidade de sincronização de sinal em trechos de baixa conectividade.': {
    'en-US': 'Amazon bioeconomy cargo with cold chain, cooperative origin and signal sync needs in low-connectivity stretches.',
    'es': 'Carga de bioeconomía amazónica con cadena fría, origen cooperativo y sincronización en tramos de baja conectividad.'
  },
  'Carga seca regional com rastreabilidade de origem, romaneio por lote e previsão sujeita a parada operacional.': {
    'en-US': 'Regional dry cargo with origin traceability, batch packing list and ETA subject to operational stops.',
    'es': 'Carga seca regional con trazabilidad de origen, lista por lote y previsión sujeta a parada operativa.'
  },
  'Lote de castanha com valor territorial, exigindo evidência de origem e checagem documental antes de reserva.': {
    'en-US': 'Brazil nut batch with territorial value, requiring origin evidence and document checks before booking.',
    'es': 'Lote de castaña con valor territorial, requiere evidencia de origen y revisión documental antes de reserva.'
  },
  'Carga de pescado com exigência sanitária, lacre, temperatura registrada e prova de embarque.': {
    'en-US': 'Fish cargo requiring sanitary documents, seal, recorded temperature and loading proof.',
    'es': 'Carga de pescado con exigencia sanitaria, precinto, temperatura registrada y prueba de embarque.'
  },
  'Operação regulada com checagem de DOF, autorização do transportador e janela de vazante.': {
    'en-US': 'Regulated operation with DOF checks, carrier authorization and low-water window.',
    'es': 'Operación regulada con revisión DOF, autorización del transportista y ventana de vaciante.'
  },

  'Janela curta de cadeia fria': {
    'en-US': 'Short cold-chain window',
    'es': 'Ventana corta de cadena fría'
  },
  'Sinal intermitente entre terminais menores': {
    'en-US': 'Intermittent signal between smaller terminals',
    'es': 'Señal intermitente entre terminales menores'
  },
  'Consolidação de lotes': {
    'en-US': 'Batch consolidation',
    'es': 'Consolidación de lotes'
  },
  'Variação de prazo por parada em comunidade': {
    'en-US': 'Timing variation due to community stop',
    'es': 'Variación de plazo por parada comunitaria'
  },
  'Trecho sujeito a vazante': {
    'en-US': 'Stretch subject to low-water season',
    'es': 'Tramo sujeto a vaciante'
  },
  'Coleta de evidência offline': {
    'en-US': 'Offline evidence collection',
    'es': 'Recolección de evidencia sin conexión'
  },
  'Cadeia fria crítica': {
    'en-US': 'Critical cold chain',
    'es': 'Cadena fría crítica'
  },
  'Fiscalização sanitária': {
    'en-US': 'Sanitary inspection',
    'es': 'Fiscalización sanitaria'
  },
  'Janela de maré e atracação compartilhada': {
    'en-US': 'Tide window and shared docking',
    'es': 'Ventana de marea y atraque compartido'
  },
  'Coleta documental com sincronização tardia': {
    'en-US': 'Document collection with late sync',
    'es': 'Recolección documental con sincronización tardía'
  },
  'Trecho com menor calado operacional': {
    'en-US': 'Stretch with lower operating draft',
    'es': 'Tramo con menor calado operativo'
  },
  'Necessidade de prova fotográfica no embarque': {
    'en-US': 'Photo proof required at loading',
    'es': 'Necesidad de prueba fotográfica en el embarque'
  },

  'SLA operacional registrado': {
    'en-US': 'Operational SLA registered',
    'es': 'SLA operativo registrado'
  },
  'Transportador com prontidão para baixa conectividade.': {
    'en-US': 'Carrier ready for low-connectivity operation.',
    'es': 'Transportista preparado para baja conectividad.'
  },
  'Validar janela de atracação sanitária': {
    'en-US': 'Validate sanitary docking window',
    'es': 'Validar ventana de atraque sanitario'
  },
  'Responder contraproposta e validar cronograma': {
    'en-US': 'Answer counteroffer and validate schedule',
    'es': 'Responder contrapropuesta y validar cronograma'
  },
  'Emitir booking final e anexar manifesto': {
    'en-US': 'Issue final booking and attach manifest',
    'es': 'Emitir booking final y adjuntar manifiesto'
  },

  'Carga geral fluvial': {
    'en-US': 'General river cargo',
    'es': 'Carga general fluvial'
  },
  'Carga mista insular': {
    'en-US': 'Mixed island cargo',
    'es': 'Carga mixta insular'
  },
  'Refrigerado essencial': {
    'en-US': 'Essential refrigerated service',
    'es': 'Refrigerado esencial'
  },
  'Carga seca regional': {
    'en-US': 'Regional dry cargo',
    'es': 'Carga seca regional'
  },
  'Balsa refrigerada': {
    'en-US': 'Refrigerated barge',
    'es': 'Barcaza refrigerada'
  },
  'Cabotagem contêiner': {
    'en-US': 'Container cabotage',
    'es': 'Cabotaje de contenedor'
  },

  'Documentação validada': {
    'en-US': 'Documents validated',
    'es': 'Documentación validada'
  },
  'NF-e, romaneio e laudo sanitário conferidos para embarque.': {
    'en-US': 'NF-e, packing list and sanitary report checked for shipment.',
    'es': 'NF-e, lista de bultos e informe sanitario revisados para embarque.'
  },
  'Belém, PA': {
    'en-US': 'Belém, PA',
    'es': 'Belém, PA'
  },
  'Dossiê digital': {
    'en-US': 'Digital dossier',
    'es': 'Expediente digital'
  },
  'Carga lacrada no terminal': {
    'en-US': 'Cargo sealed at terminal',
    'es': 'Carga precintada en terminal'
  },
  'Temperatura e lacre registrados com evidência fotográfica.': {
    'en-US': 'Temperature and seal recorded with photo evidence.',
    'es': 'Temperatura y precinto registrados con evidencia fotográfica.'
  },
  'Foto + sensor': {
    'en-US': 'Photo + sensor',
    'es': 'Foto + sensor'
  },
  'Em navegação pelo Amazonas': {
    'en-US': 'Navigating through the Amazon River',
    'es': 'En navegación por el Amazonas'
  },
  'Embarcação reportou posição com sincronização tardia.': {
    'en-US': 'Vessel reported position with delayed sync.',
    'es': 'La embarcación informó posición con sincronización tardía.'
  },
  'Sinal intermitente': {
    'en-US': 'Intermittent signal',
    'es': 'Señal intermitente'
  },
  'Janela de atracação confirmada': {
    'en-US': 'Docking window confirmed',
    'es': 'Ventana de atraque confirmada'
  },
  'Equipe local confirmou berço e equipe de descarga.': {
    'en-US': 'Local team confirmed berth and unloading crew.',
    'es': 'El equipo local confirmó muelle y equipo de descarga.'
  },
  'Confirmação operacional': {
    'en-US': 'Operational confirmation',
    'es': 'Confirmación operativa'
  },
  'Checklist de descarga em preparação': {
    'en-US': 'Unloading checklist in preparation',
    'es': 'Checklist de descarga en preparación'
  },
  'Equipe prepara conferência final de volumes e integridade.': {
    'en-US': 'Team prepares final volume and integrity check.',
    'es': 'El equipo prepara revisión final de volúmenes e integridad.'
  },
  'Checklist digital': {
    'en-US': 'Digital checklist',
    'es': 'Checklist digital'
  },
  'Reserva + SLA sanitário': {
    'en-US': 'Booking + sanitary SLA',
    'es': 'Reserva + SLA sanitario'
  },
  'Saúde e cadeia fria': {
    'en-US': 'Healthcare and cold chain',
    'es': 'Salud y cadena fría'
  },
  '30% reserva / saldo na entrega': {
    'en-US': '30% booking / balance on delivery',
    'es': '30% reserva / saldo en entrega'
  },
  'Carga seca e rastreável': {
    'en-US': 'Dry and traceable cargo',
    'es': 'Carga seca y trazable'
  },
  'Booking + terminal window': {
    'en-US': 'Booking + terminal window',
    'es': 'Booking + ventana de terminal'
  },
  'Portuário': {
    'en-US': 'Port operation',
    'es': 'Portuario'
  },
  'Controle de temperatura ok': {
    'en-US': 'Temperature control ok',
    'es': 'Control de temperatura ok'
  },
  'Declaração de origem revisada': {
    'en-US': 'Origin declaration reviewed',
    'es': 'Declaración de origen revisada'
  },
  'Manifesto pendente': {
    'en-US': 'Manifest pending',
    'es': 'Manifiesto pendiente'
  },
  'CT-e em emissão': {
    'en-US': 'CT-e being issued',
    'es': 'CT-e en emisión'
  },
  'Romaneio': {
    'en-US': 'Packing list',
    'es': 'Lista de bultos'
  },
  'Laudo sanitário': {
    'en-US': 'Sanitary report',
    'es': 'Informe sanitario'
  },
  'Documento sanitário': {
    'en-US': 'Sanitary document',
    'es': 'Documento sanitario'
  },
  'Declaração de origem': {
    'en-US': 'Origin declaration',
    'es': 'Declaración de origen'
  },
  'Controle de temperatura': {
    'en-US': 'Temperature control',
    'es': 'Control de temperatura'
  },
  'Checklist de integridade': {
    'en-US': 'Integrity checklist',
    'es': 'Checklist de integridad'
  },
  'Manifesto': {
    'en-US': 'Manifest',
    'es': 'Manifiesto'
  },
  'Manifesto digital': {
    'en-US': 'Digital manifest',
    'es': 'Manifiesto digital'
  },
  'DOF obrigatório': {
    'en-US': 'Mandatory DOF',
    'es': 'DOF obligatorio'
  },
  'NF-e pendente de anexação': {
    'en-US': 'NF-e pending attachment',
    'es': 'NF-e pendiente de adjuntar'
  },
  'Romaneio validado': {
    'en-US': 'Packing list validated',
    'es': 'Lista de bultos validada'
  },
  'ANTAQ em revisão': {
    'en-US': 'ANTAQ under review',
    'es': 'ANTAQ en revisión'
  },
  'Seguro P&I': {
    'en-US': 'P&I insurance',
    'es': 'Seguro P&I'
  },
  'Lacre digital': {
    'en-US': 'Digital seal',
    'es': 'Precinto digital'
  },
  'Terminal ready': {
    'en-US': 'Terminal ready',
    'es': 'Terminal listo'
  },
  'Rastreio': {
    'en-US': 'Tracking',
    'es': 'Rastreo'
  },
  'Cabotagem': {
    'en-US': 'Cabotage',
    'es': 'Cabotaje'
  },
  'Fracionada': {
    'en-US': 'Less-than-load',
    'es': 'Fraccionada'
  },
  'Refrigerada': {
    'en-US': 'Refrigerated',
    'es': 'Refrigerada'
  },
  'Seca': {
    'en-US': 'Dry',
    'es': 'Seca'
  },
  'Projeto': {
    'en-US': 'Project cargo',
    'es': 'Carga proyecto'
  },
  'Granel leve': {
    'en-US': 'Light bulk',
    'es': 'Granel ligero'
  },
  'Reefer': {
    'en-US': 'Reefer',
    'es': 'Reefer'
  },
  'Comboio de barcaças': {
    'en-US': 'Barge convoy',
    'es': 'Convoy de barcazas'
  },
  'Embarcação regional refrigerada': {
    'en-US': 'Regional refrigerated vessel',
    'es': 'Embarcación regional refrigerada'
  },
  'Empurrador + barcaça': {
    'en-US': 'Pusher + barge',
    'es': 'Empujador + barcaza'
  },
  'Multiuso de cabotagem': {
    'en-US': 'Multipurpose cabotage vessel',
    'es': 'Multiuso de cabotaje'
  },
  'Cabotagem conectada': {
    'en-US': 'Connected cabotage',
    'es': 'Cabotaje conectado'
  },
  'Cadeia fria': {
    'en-US': 'Cold chain',
    'es': 'Cadena de frío'
  },
  'Cadeia fria coberta': {
    'en-US': 'Cold chain covered',
    'es': 'Cadena de frío cubierta'
  },
  'Baixa conectividade': {
    'en-US': 'Low connectivity',
    'es': 'Baja conectividad'
  },
  'Baixa conectividade pronta': {
    'en-US': 'Low-connectivity ready',
    'es': 'Baja conectividad lista'
  },
  'Baixa conectividade pendente': {
    'en-US': 'Low-connectivity pending',
    'es': 'Baja conectividad pendiente'
  },
  'Checklist digital pronto': {
    'en-US': 'Digital checklist ready',
    'es': 'Checklist digital listo'
  },
  'Checklist pendente': {
    'en-US': 'Checklist pending',
    'es': 'Checklist pendiente'
  },
  'Regular': {
    'en-US': 'Regular',
    'es': 'Regular'
  },
  'Em revisão': {
    'en-US': 'Under review',
    'es': 'En revisión'
  },
  'Disponível': {
    'en-US': 'Available',
    'es': 'Disponible'
  },
  'Em rota': {
    'en-US': 'En route',
    'es': 'En ruta'
  },
  'Manutenção': {
    'en-US': 'Maintenance',
    'es': 'Mantenimiento'
  },
  'Contratação': {
    'en-US': 'Contracting',
    'es': 'Contratación'
  },
  'Cotação': {
    'en-US': 'Quote',
    'es': 'Cotización'
  },
  'Contraproposta': {
    'en-US': 'Counteroffer',
    'es': 'Contrapropuesta'
  },
  'Contrato': {
    'en-US': 'Contract',
    'es': 'Contrato'
  },
  'Contrato em minuta': {
    'en-US': 'Draft contract',
    'es': 'Contrato en borrador'
  },
  'Contrato mediante DOF': {
    'en-US': 'Contract subject to DOF',
    'es': 'Contrato mediante DOF'
  },
  'Empenho + aceite digital': {
    'en-US': 'Commitment + digital acceptance',
    'es': 'Compromiso + aceptación digital'
  },
  '50% reserva / 50% POD': {
    'en-US': '50% booking / 50% POD',
    'es': '50% reserva / 50% POD'
  },
  'Ambiental e carga': {
    'en-US': 'Environmental and cargo',
    'es': 'Ambiental y carga'
  },
  'Seguro ativo': {
    'en-US': 'Insurance active',
    'es': 'Seguro activo'
  },
  'Anexar laudo sanitário e confirmar lacre': {
    'en-US': 'Attach sanitary report and confirm seal',
    'es': 'Adjuntar informe sanitario y confirmar precinto'
  },
  'Compliance revisar autorização e janela de vazante': {
    'en-US': 'Compliance to review authorization and low-water window',
    'es': 'Compliance revisará autorización y ventana de bajante'
  },
  'Gerar reserva e checklist de embarque': {
    'en-US': 'Generate booking and shipment checklist',
    'es': 'Generar reserva y checklist de embarque'
  },
  'Hoje': {
    'en-US': 'Today',
    'es': 'Hoy'
  },
  'Ontem': {
    'en-US': 'Yesterday',
    'es': 'Ayer'
  },
  'Hoje, 08:10': {
    'en-US': 'Today, 08:10',
    'es': 'Hoy, 08:10'
  },
  'Hoje, 09:05': {
    'en-US': 'Today, 09:05',
    'es': 'Hoy, 09:05'
  },
  'Hoje, 10:40': {
    'en-US': 'Today, 10:40',
    'es': 'Hoy, 10:40'
  },
  'Hoje, 11:15': {
    'en-US': 'Today, 11:15',
    'es': 'Hoy, 11:15'
  },
  'Ontem, 17:25': {
    'en-US': 'Yesterday, 17:25',
    'es': 'Ayer, 17:25'
  },
  'Ontem, 18:22': {
    'en-US': 'Yesterday, 18:22',
    'es': 'Ayer, 18:22'
  },
  '06 mai • 08:30': {
    'en-US': 'May 06 • 08:30',
    'es': '06 may • 08:30'
  },
  '06 mai • 11:40': {
    'en-US': 'May 06 • 11:40',
    'es': '06 may • 11:40'
  },
  '06 mai • 19:15': {
    'en-US': 'May 06 • 19:15',
    'es': '06 may • 19:15'
  },
  '07 mai • 09:00': {
    'en-US': 'May 07 • 09:00',
    'es': '07 may • 09:00'
  },
  '07 mai • 11:20': {
    'en-US': 'May 07 • 11:20',
    'es': '07 may • 11:20'
  },
  '07 mai • 13:05': {
    'en-US': 'May 07 • 13:05',
    'es': '07 may • 13:05'
  },
  '07 mai • 15:30': {
    'en-US': 'May 07 • 15:30',
    'es': '07 may • 15:30'
  },
  '06-10 maio': {
    'en-US': 'May 06–10',
    'es': '06–10 mayo'
  },
  '07-11 maio': {
    'en-US': 'May 07–11',
    'es': '07–11 mayo'
  },
  '08-12 maio': {
    'en-US': 'May 08–12',
    'es': '08–12 mayo'
  },
  '09-13 maio': {
    'en-US': 'May 09–13',
    'es': '09–13 mayo'
  },
  '10-14 maio': {
    'en-US': 'May 10–14',
    'es': '10–14 mayo'
  },
  '11-15 maio': {
    'en-US': 'May 11–15',
    'es': '11–15 mayo'
  },
  '13-17 maio': {
    'en-US': 'May 13–17',
    'es': '13–17 mayo'
  },
  '16-20 maio': {
    'en-US': 'May 16–20',
    'es': '16–20 mayo'
  },
  '18-22 maio': {
    'en-US': 'May 18–22',
    'es': '18–22 mayo'
  },
  '6 dias': {
    'en-US': '6 days',
    'es': '6 días'
  },
  '5 dias': {
    'en-US': '5 days',
    'es': '5 días'
  },
  'ETA 4–5 dias • alta confiança': {
    'en-US': 'ETA 4–5 days • high confidence',
    'es': 'ETA 4–5 días • alta confianza'
  },
  'ETA 5–6 dias • alta confiança': {
    'en-US': 'ETA 5–6 days • high confidence',
    'es': 'ETA 5–6 días • alta confianza'
  },
  'ETA 6–8 dias • confiança média': {
    'en-US': 'ETA 6–8 days • medium confidence',
    'es': 'ETA 6–8 días • confianza media'
  },
  'ETA 7–10 dias • sazonal': {
    'en-US': 'ETA 7–10 days • seasonal',
    'es': 'ETA 7–10 días • estacional'
  },
  'Aplicável em situação sanitária específica.': {
    'en-US': 'Applicable in specific sanitary situations.',
    'es': 'Aplicable en situación sanitaria específica.'
  },
  'Vazante no rio Madeira': {
    'en-US': 'Low water on the Madeira River',
    'es': 'Bajante en el río Madeira'
  },
  'Documento ambiental obrigatório': {
    'en-US': 'Mandatory environmental document',
    'es': 'Documento ambiental obligatorio'
  },
  'Cadeia de valor regional com lotes de pequeno produtor.': {
    'en-US': 'Regional value chain with small producer batches.',
    'es': 'Cadena de valor regional con lotes de pequeños productores.'
  },
  'Carga de bioeconomia com consolidação em terminal regional e documentação por lote.': {
    'en-US': 'Bioeconomy cargo consolidated at a regional terminal with batch-level documentation.',
    'es': 'Carga de bioeconomía consolidada en terminal regional con documentación por lote.'
  },
  'Útil para rastreabilidade comercial e institucional.': {
    'en-US': 'Useful for commercial and institutional traceability.',
    'es': 'Útil para trazabilidad comercial e institucional.'
  },
  'Consolidação multi-produtor': {
    'en-US': 'Multi-producer consolidation',
    'es': 'Consolidación multiproductor'
  },
  'Carga de interesse público com prioridade operacional e prova de temperatura.': {
    'en-US': 'Public-interest cargo with operational priority and temperature proof.',
    'es': 'Carga de interés público con prioridad operativa y prueba de temperatura.'
  },
  'Carga crítica para abastecimento territorial, com trilha de evidências, temperatura e sincronização tardia.': {
    'en-US': 'Critical cargo for territorial supply, with evidence trail, temperature and delayed sync.',
    'es': 'Carga crítica para abastecimiento territorial, con trazabilidad de evidencias, temperatura y sincronización tardía.'
  },
  'Evidência operacional de cadeia fria.': {
    'en-US': 'Operational cold-chain evidence.',
    'es': 'Evidencia operativa de cadena de frío.'
  },
  'Prioridade pública': {
    'en-US': 'Public priority',
    'es': 'Prioridad pública'
  },
  'Temperatura controlada': {
    'en-US': 'Controlled temperature',
    'es': 'Temperatura controlada'
  },
  'Operação de política pública com equipamentos sensíveis e pontos de entrega múltiplos.': {
    'en-US': 'Public policy operation with sensitive equipment and multiple delivery points.',
    'es': 'Operación de política pública con equipos sensibles y múltiples puntos de entrega.'
  },
  'Carga projeto com checklist de integridade, roteirização por comunidades e aceite digital.': {
    'en-US': 'Project cargo with integrity checklist, community routing and digital acceptance.',
    'es': 'Carga proyecto con checklist de integridad, rutas por comunidades y aceptación digital.'
  },
  'Recomendado para equipamentos sensíveis.': {
    'en-US': 'Recommended for sensitive equipment.',
    'es': 'Recomendado para equipos sensibles.'
  },
  'Entrega multi-ponto': {
    'en-US': 'Multi-point delivery',
    'es': 'Entrega multipunto'
  },
  'Integridade de equipamento': {
    'en-US': 'Equipment integrity',
    'es': 'Integridad del equipo'
  },
  'Operação inter-regional com conexão portuária e escala de contêiner.': {
    'en-US': 'Interregional operation with port connection and container call.',
    'es': 'Operación interregional con conexión portuaria y escala de contenedor.'
  },
  'Conexão de cabotagem com documentos fiscais, booking e previsibilidade superior.': {
    'en-US': 'Cabotage connection with fiscal documents, booking and stronger predictability.',
    'es': 'Conexión de cabotaje con documentos fiscales, booking y mayor previsibilidad.'
  },
  'Aplicável em operação portuária/cabotagem.': {
    'en-US': 'Applicable to port/cabotage operation.',
    'es': 'Aplicable en operación portuaria/cabotaje.'
  },
  'Janela de terminal portuário': {
    'en-US': 'Port terminal window',
    'es': 'Ventana de terminal portuaria'
  },
  'NF-e, romaneio e exigências condicionais conferidas.': {
    'en-US': 'NF-e, packing list and conditional requirements checked.',
    'es': 'NF-e, lista de bultos y exigencias condicionales revisadas.'
  },
  'Checklist documental assinado': {
    'en-US': 'Document checklist signed',
    'es': 'Checklist documental firmado'
  },
  'Cadeia fria registrada antes do embarque.': {
    'en-US': 'Cold chain recorded before shipment.',
    'es': 'Cadena de frío registrada antes del embarque.'
  },
  'Foto do lacre + sensor 2 °C': {
    'en-US': 'Seal photo + 2 °C sensor',
    'es': 'Foto del precinto + sensor 2 °C'
  },
  'Evento sincronizado com atraso por baixa conectividade.': {
    'en-US': 'Event synced late due to low connectivity.',
    'es': 'Evento sincronizado con retraso por baja conectividad.'
  },
  'Atualização operacional pendente': {
    'en-US': 'Operational update pending',
    'es': 'Actualización operativa pendiente'
  },
  'Comprovante de entrega e aceite digital.': {
    'en-US': 'Proof of delivery and digital acceptance.',
    'es': 'Comprobante de entrega y aceptación digital.'
  },
  'Assinatura do recebedor': {
    'en-US': 'Receiver signature',
    'es': 'Firma del receptor'
  },
  'Exceção aberta': {
    'en-US': 'Exception opened',
    'es': 'Excepción abierta'
  },
  'DOF e documentação da embarcação precisam de validação antes da reserva.': {
    'en-US': 'DOF and vessel documentation need validation before booking.',
    'es': 'DOF y documentación de la embarcación deben validarse antes de la reserva.'
  },
  'Contraproposta enviada': {
    'en-US': 'Counteroffer sent',
    'es': 'Contraoferta enviada'
  },
  'Cotação recebida': {
    'en-US': 'Quote received',
    'es': 'Cotización recibida'
  },
  'Transportador compatível com cadeia fria e baixa conectividade.': {
    'en-US': 'Carrier compatible with cold chain and low connectivity.',
    'es': 'Transportista compatible con cadena de frío y baja conectividad.'
  },
  'Carga pronta para reserva operacional.': {
    'en-US': 'Cargo ready for operational booking.',
    'es': 'Carga lista para reserva operativa.'
  },
  'Operação portuária alinhada com janela do terminal.': {
    'en-US': 'Port operation aligned with terminal window.',
    'es': 'Operación portuaria alineada con ventana de terminal.'
  },
  'Ajuste de janela e roteiro fluvial.': {
    'en-US': 'Window and river route adjustment.',
    'es': 'Ajuste de ventana y ruta fluvial.'
  },
  'Aguardar aceite do embarcador': {
    'en-US': 'Waiting for shipper acceptance',
    'es': 'Esperar aceptación del embarcador'
  },
  'Carga criada no marketplace': {
    'en-US': 'Cargo created in marketplace',
    'es': 'Carga creada en el marketplace'
  },
  'Demanda registrada no corredor Belém–Santarém com janela operacional.': {
    'en-US': 'Demand recorded on the Belém–Santarém corridor with an operational window.',
    'es': 'Demanda registrada en el corredor Belém–Santarém con ventana operativa.'
  },
  'Proposta enviada ao armador': {
    'en-US': 'Proposal sent to carrier',
    'es': 'Propuesta enviada al transportista'
  },
  'Valores e SLA enviados para negociação da viagem refrigerada.': {
    'en-US': 'Rates and SLA sent for refrigerated voyage negotiation.',
    'es': 'Valores y SLA enviados para la negociación del viaje refrigerado.'
  },
  'Negociação aceita': {
    'en-US': 'Negotiation accepted',
    'es': 'Negociación aceptada'
  },
  'Armador aceitou termos operacionais e janela de embarque.': {
    'en-US': 'Carrier accepted operational terms and shipment window.',
    'es': 'El transportista aceptó los términos operativos y la ventana de embarque.'
  },
  'Documentação pendente registrada': {
    'en-US': 'Pending documentation registered',
    'es': 'Documentación pendiente registrada'
  },
  'NF-e condicional e manifesto em análise antes do boarding.': {
    'en-US': 'Conditional NF-e and manifest under review before boarding.',
    'es': 'NF-e condicional y manifiesto en revisión antes del embarque.'
  },
  'Entrega concluída no destino': {
    'en-US': 'Delivery completed at destination',
    'es': 'Entrega completada en destino'
  },
  'Volumes conferidos no berço de Santarém; aguardando formalização do POD.': {
    'en-US': 'Volumes checked at Santarém berth; awaiting POD formalization.',
    'es': 'Volúmenes verificados en el muelle de Santarém; esperando formalización del POD.'
  },
  'Documentos validados': {
    'en-US': 'Documents validated',
    'es': 'Documentos validados'
  },
  'Lacre e temperatura conferidos': {
    'en-US': 'Seal and temperature checked',
    'es': 'Precinto y temperatura revisados'
  },
  'Navegação em curso': {
    'en-US': 'Navigation in progress',
    'es': 'Navegación en curso'
  },
  'Previsão de atracação atualizada': {
    'en-US': 'Updated docking forecast',
    'es': 'Previsión de atraque actualizada'
  },
  'POD recebido': {
    'en-US': 'POD received',
    'es': 'POD recibido'
  },
  'Navegação interior': {
    'en-US': 'Inland navigation',
    'es': 'Navegación interior'
  },

  'Abastecimento essencial refrigerado': {
    'en-US': 'Essential refrigerated supply',
    'es': 'Abastecimiento esencial refrigerado'
  },
  'Carga fracionada de sociobioeconomia': {
    'en-US': 'Less-than-load sociobioeconomy cargo',
    'es': 'Carga fraccionada de sociobioeconomía'
  },
  'Carga projeto e abastecimento territorial': {
    'en-US': 'Project cargo and territorial supply',
    'es': 'Carga proyecto y abastecimiento territorial'
  },
  'Conexão portuária': {
    'en-US': 'Port connection',
    'es': 'Conexión portuaria'
  },
  'Checklist de integridade ok': {
    'en-US': 'Integrity checklist ok',
    'es': 'Checklist de integridad ok'
  },
  'NF-e ok': {
    'en-US': 'NF-e ok',
    'es': 'NF-e ok'
  },
  'ETA ajustado conforme janela de vazante e tráfego local.': {
    'en-US': 'ETA adjusted according to low-water window and local traffic.',
    'es': 'ETA ajustado según ventana de bajante y tráfico local.'
  },
  'Equipamento sensível': {
    'en-US': 'Sensitive equipment',
    'es': 'Equipo sensible'
  },
  'Sincronização tardia de sinal': {
    'en-US': 'Delayed signal sync',
    'es': 'Sincronización tardía de señal'
  },
  'Cacau e cupuaçu em cadeia de bioeconomia': {
    'en-US': 'Cocoa and cupuaçu in a bioeconomy chain',
    'es': 'Cacao y cupuaçu en cadena de bioeconomía'
  },
  'Equipamentos solares para comunidades ribeirinhas': {
    'en-US': 'Solar equipment for riverside communities',
    'es': 'Equipos solares para comunidades ribereñas'
  },
  'Rio Amazonas': {
    'en-US': 'Amazon River',
    'es': 'Río Amazonas'
  },
  'Terminal de Belém': {
    'en-US': 'Belém terminal',
    'es': 'Terminal de Belém'
  },

};

const patterns: Array<[RegExp, Localized]> = [
  [/^(\d{2})-(\d{2}) maio$/i, {
    'en-US': 'May $1–$2',
    es: '$1–$2 mayo'
  }],
  [/^(\d{2}) mai • (.+)$/i, {
    'en-US': 'May $1 • $2',
    es: '$1 may • $2'
  }],
  [/^Hoje, (.+)$/i, {
    'en-US': 'Today, $1',
    es: 'Hoy, $1'
  }],
  [/^Ontem, (.+)$/i, {
    'en-US': 'Yesterday, $1',
    es: 'Ayer, $1'
  }],
  [/^(\d+) dias$/i, {
    'en-US': '$1 days',
    es: '$1 días'
  }],
  [/^ETA (\d+)[–-](\d+) dias • confiança média$/i, {
    'en-US': 'ETA $1–$2 days • medium confidence',
    es: 'ETA $1–$2 días • confianza media'
  }],
  [/^ETA (\d+)[–-](\d+) dias • alta confiança$/i, {
    'en-US': 'ETA $1–$2 days • high confidence',
    es: 'ETA $1–$2 días • alta confianza'
  }],
  [/^ETA (\d+)[–-](\d+) dias • sazonal$/i, {
    'en-US': 'ETA $1–$2 days • seasonal',
    es: 'ETA $1–$2 días • estacional'
  }],
  [/^ETA (\d+)[–-](\d+)h • confiança média$/i, {
    'en-US': 'ETA $1–$2h • medium confidence',
    es: 'ETA $1–$2h • confianza media'
  }],
  [/^(.+) • lote (\d+)$/i, {
    'en-US': '$1 • batch $2',
    es: '$1 • lote $2'
  }],
  [/^(.+) Lote QA (\d+) com consolidação hidroviária simulada\.$/i, {
    'en-US': '$1 QA batch $2 with simulated waterway consolidation.',
    es: '$1 Lote QA $2 con consolidación hidroviaria simulada.'
  }],
  [/^(.+) Cenário adicional para testes de busca, paginação e estados de contratação\.$/i, {
    'en-US': '$1 Additional scenario for testing search, pagination and contracting states.',
    es: '$1 Escenario adicional para pruebas de búsqueda, paginación y estados de contratación.'
  }]
];

function normalizeLocale(locale: string): 'pt-BR' | 'en-US' | 'es' {
  if (locale === 'pt-BR') return 'pt-BR';
  if (locale.startsWith('es')) return 'es';
  return 'en-US';
}

function translateWithPatterns(locale: 'pt-BR' | 'en-US' | 'es', value: string) {
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

export function translateMock(locale: string, value?: string | null): string {
  if (!value) return '';
  const normalized = normalizeLocale(locale);
  if (normalized === 'pt-BR') return value;

  const translated = exact[value]?.[normalized];
  if (translated) return translated;

  return translateWithPatterns(normalized, value);
}

export function translateMockList(locale: string, values?: string[] | null): string[] {
  return (values ?? []).map((value) => translateMock(locale, value));
}
