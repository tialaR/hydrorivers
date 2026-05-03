import type { Cargo, Negotiation, TrackingEvent, Vessel } from '../domain/marketplace.types';

const commonDocs = [
  { name: 'NF-e', status: 'required' as const, note: 'Documento fiscal da mercadoria.' },
  { name: 'CT-e', status: 'nextPhase' as const, note: 'Emitir na contratação do transporte.' },
  { name: 'Romaneio', status: 'required' as const, note: 'Lista de volumes por lote/cooperativa.' }
];

export const cargoes: Cargo[] = [
  {
    id: 'cargo-001',
    title: 'Polpa de açaí congelada — cooperativa ribeirinha',
    origin: 'Belém, PA',
    destination: 'Santarém, PA',
    volume: '60 m³',
    window: '06-10 maio',
    cargoType: 'Refrigerada',
    status: 'open',
    co2Saving: '-45% CO₂',
    targetPrice: 'R$ 6.200',
    producer: 'Coop. Açaí Pará',
    temperature: '-18 °C',
    productFamily: 'bioeconomy',
    corridor: 'Belém–Santarém',
    mainRiver: 'Amazonas',
    serviceType: 'Navegação interior refrigerada',
    predictability: 'medium',
    etaConfidence: 'ETA 36–44h • confiança média',
    connectivity: 'delayedSync',
    documentReadiness: 72,
    originContext: 'Cooperativa com agregação de produtores e janela curta de embarque na safra.',
    description: 'Carga de bioeconomia amazônica com cadeia fria, origem cooperada e necessidade de sincronização de sinal em trechos de baixa conectividade.',
    documents: ['NF-e', 'Romaneio', 'Laudo sanitário'],
    requiredDocuments: [...commonDocs, { name: 'Laudo sanitário', status: 'conditional', note: 'Recomendado para polpas congeladas.' }],
    operationalRisks: ['Janela curta de cadeia fria', 'Sinal intermitente entre terminais menores']
  },
  {
    id: 'cargo-002',
    title: 'Farinha de mandioca ensacada — casa de farinha',
    origin: 'Manaus, AM',
    destination: 'Belém, PA',
    volume: '15 t',
    window: '07-11 maio',
    cargoType: 'Seca',
    status: 'bidding',
    co2Saving: '-48% CO₂',
    targetPrice: 'R$ 7.570',
    producer: 'Rede Casas de Farinha do Baixo Amazonas',
    productFamily: 'perishable',
    corridor: 'Manaus–Belém',
    mainRiver: 'Amazonas',
    serviceType: 'Navegação interior longitudinal',
    predictability: 'medium',
    etaConfidence: 'ETA 4–6 dias • confiança média',
    connectivity: 'delayedSync',
    documentReadiness: 64,
    originContext: 'Produto alimentar regional com origem comunitária e lotes agregados.',
    description: 'Carga seca regional com rastreabilidade de origem, romaneio por lote e previsão sujeita a parada operacional.',
    documents: ['NF-e', 'Romaneio'],
    requiredDocuments: commonDocs,
    operationalRisks: ['Consolidação de lotes', 'Variação de prazo por parada em comunidade']
  },
  {
    id: 'cargo-003',
    title: 'Castanha beneficiada com rastreabilidade socioambiental',
    origin: 'Santarém, PA',
    destination: 'Macapá, AP',
    volume: '22 t',
    window: '08-12 maio',
    cargoType: 'Fracionada',
    status: 'contracting',
    co2Saving: '-51% CO₂',
    targetPrice: 'R$ 8.940',
    producer: 'Rede Castanha Viva',
    productFamily: 'bioeconomy',
    corridor: 'Santarém–Macapá',
    mainRiver: 'Amazonas',
    serviceType: 'Operação regional fracionada',
    predictability: 'seasonal',
    etaConfidence: 'ETA 52–72h • sazonal',
    connectivity: 'lowSignal',
    documentReadiness: 81,
    originContext: 'Cadeia de sociobiodiversidade com documentação de origem e agregação comunitária.',
    description: 'Lote de castanha com valor territorial, exigindo evidência de origem e checagem documental antes de reserva.',
    documents: ['NF-e', 'Romaneio', 'Declaração de origem'],
    requiredDocuments: [...commonDocs, { name: 'Declaração de origem', status: 'conditional', note: 'Recomendado para cadeia de sociobiodiversidade.' }],
    operationalRisks: ['Trecho sujeito a vazante', 'Coleta de evidência offline']
  },
  {
    id: 'cargo-004',
    title: 'Pirarucu manejado refrigerado',
    origin: 'Tefé, AM',
    destination: 'Manaus, AM',
    volume: '18 t',
    window: '09-13 maio',
    cargoType: 'Refrigerada',
    status: 'reserved',
    co2Saving: '-39% CO₂',
    targetPrice: 'R$ 10.310',
    producer: 'Frutos do Rio',
    temperature: '0–4 °C',
    productFamily: 'perishable',
    corridor: 'Tefé–Manaus',
    mainRiver: 'Solimões',
    serviceType: 'Operação regional refrigerada',
    predictability: 'seasonal',
    etaConfidence: 'ETA 30–42h • sazonal',
    connectivity: 'lowSignal',
    documentReadiness: 58,
    originContext: 'Pescado amazônico com controle sanitário e evidência de cadeia fria.',
    description: 'Carga de pescado com exigência sanitária, lacre, temperatura registrada e prova de embarque.',
    documents: ['NF-e', 'Romaneio', 'Documento sanitário'],
    requiredDocuments: [...commonDocs, { name: 'Documento sanitário', status: 'required', note: 'Verificar inspeção aplicável ao pescado.' }, { name: 'GTA', status: 'conditional', note: 'Aplicável em situações específicas de animal aquático vivo/aquicultura.' }],
    operationalRisks: ['Cadeia fria crítica', 'Fiscalização sanitária']
  },
  {
    id: 'cargo-005',
    title: 'Madeira de manejo com DOF',
    origin: 'Porto Velho, RO',
    destination: 'Belém, PA',
    volume: '36 t',
    window: '10-14 maio',
    cargoType: 'Cabotagem',
    status: 'open',
    co2Saving: '-57% CO₂',
    targetPrice: 'R$ 11.680',
    producer: 'Floresta Legal',
    productFamily: 'bioeconomy',
    corridor: 'Manaus–Porto Velho',
    mainRiver: 'Madeira',
    serviceType: 'Navegação interior + conexão cabotada',
    predictability: 'seasonal',
    etaConfidence: 'ETA 5–8 dias • sazonal',
    connectivity: 'delayedSync',
    documentReadiness: 46,
    originContext: 'Produto florestal nativo com documentação ambiental obrigatória.',
    description: 'Operação regulada com checagem de DOF, autorização do transportador e janela de vazante.',
    documents: ['NF-e', 'Romaneio', 'DOF'],
    requiredDocuments: [...commonDocs, { name: 'DOF', status: 'required', note: 'Obrigatório para produto florestal nativo.' }],
    operationalRisks: ['Vazante no rio Madeira', 'Documento ambiental obrigatório']
  },
  {
    id: 'cargo-006',
    title: 'Cacau e cupuaçu em cadeia de bioeconomia',
    origin: 'Itacoatiara, AM',
    destination: 'Vila do Conde, PA',
    volume: '100 m³',
    window: '11-15 maio',
    cargoType: 'Fracionada',
    status: 'bidding',
    co2Saving: '-60% CO₂',
    targetPrice: 'R$ 13.050',
    producer: 'Coop. Cacau Amazônico',
    productFamily: 'bioeconomy',
    corridor: 'Manaus–Belém',
    mainRiver: 'Amazonas',
    serviceType: 'Carga fracionada de sociobioeconomia',
    predictability: 'high',
    etaConfidence: 'ETA 4–5 dias • alta confiança',
    connectivity: 'online',
    documentReadiness: 76,
    originContext: 'Cadeia de valor regional com lotes de pequeno produtor.',
    description: 'Carga de bioeconomia com consolidação em terminal regional e documentação por lote.',
    documents: ['NF-e', 'Romaneio', 'Declaração de origem'],
    requiredDocuments: [...commonDocs, { name: 'Declaração de origem', status: 'conditional', note: 'Útil para rastreabilidade comercial e institucional.' }],
    operationalRisks: ['Consolidação multi-produtor']
  },
  {
    id: 'cargo-007',
    title: 'Medicamentos refrigerados para abastecimento territorial',
    origin: 'Parintins, AM',
    destination: 'Tabatinga, AM',
    volume: '57 t',
    window: '13-17 maio',
    cargoType: 'Refrigerada',
    status: 'reserved',
    co2Saving: '-66% CO₂',
    targetPrice: 'R$ 15.790',
    producer: 'Saúde Ribeirinha',
    temperature: '2–8 °C',
    productFamily: 'territorialSupply',
    corridor: 'Tabatinga–Belém',
    mainRiver: 'Solimões/Amazonas',
    serviceType: 'Abastecimento essencial refrigerado',
    predictability: 'seasonal',
    etaConfidence: 'ETA 7–10 dias • sazonal',
    connectivity: 'lowSignal',
    documentReadiness: 69,
    originContext: 'Carga de interesse público com prioridade operacional e prova de temperatura.',
    description: 'Carga crítica para abastecimento territorial, com trilha de evidências, temperatura e sincronização tardia.',
    documents: ['NF-e', 'Romaneio', 'Controle de temperatura'],
    requiredDocuments: [...commonDocs, { name: 'Controle de temperatura', status: 'required', note: 'Evidência operacional de cadeia fria.' }],
    operationalRisks: ['Baixa conectividade', 'Prioridade pública', 'Temperatura controlada']
  },
  {
    id: 'cargo-008',
    title: 'Equipamentos solares para comunidades ribeirinhas',
    origin: 'Vila do Conde, PA',
    destination: 'Tefé, AM',
    volume: '140 m³',
    window: '16-20 maio',
    cargoType: 'Projeto',
    status: 'contracting',
    co2Saving: '-75% CO₂',
    targetPrice: 'R$ 19.900',
    producer: 'Programa Energia Ribeirinha',
    productFamily: 'territorialSupply',
    corridor: 'Belém–Tefé',
    mainRiver: 'Amazonas/Solimões',
    serviceType: 'Carga projeto e abastecimento territorial',
    predictability: 'medium',
    etaConfidence: 'ETA 6–8 dias • confiança média',
    connectivity: 'delayedSync',
    documentReadiness: 88,
    originContext: 'Operação de política pública com equipamentos sensíveis e pontos de entrega múltiplos.',
    description: 'Carga projeto com checklist de integridade, roteirização por comunidades e aceite digital.',
    documents: ['NF-e', 'Romaneio', 'Checklist de integridade'],
    requiredDocuments: [...commonDocs, { name: 'Checklist de integridade', status: 'required', note: 'Recomendado para equipamentos sensíveis.' }],
    operationalRisks: ['Entrega multi-ponto', 'Integridade de equipamento']
  },
  {
    id: 'cargo-009',
    title: 'Contêineres de cabotagem conectada Norte–Nordeste',
    origin: 'Vila do Conde, PA',
    destination: 'Suape, PE',
    volume: '22 TEU',
    window: '18-22 maio',
    cargoType: 'Cabotagem',
    status: 'open',
    co2Saving: '-52% CO₂',
    targetPrice: 'R$ 24.600',
    producer: 'BR do Mar Log',
    productFamily: 'industrialCabotage',
    corridor: 'Vila do Conde–Suape',
    mainRiver: 'Conexão portuária',
    serviceType: 'Cabotagem conectada',
    predictability: 'high',
    etaConfidence: 'ETA 5–6 dias • alta confiança',
    connectivity: 'online',
    documentReadiness: 92,
    originContext: 'Operação inter-regional com conexão portuária e escala de contêiner.',
    description: 'Conexão de cabotagem com documentos fiscais, booking e previsibilidade superior.',
    documents: ['NF-e', 'CT-e', 'Manifesto'],
    requiredDocuments: [...commonDocs, { name: 'Manifesto', status: 'nextPhase', note: 'Aplicável em operação portuária/cabotagem.' }],
    operationalRisks: ['Janela de terminal portuário']
  }
];

const cargoRoutePool = [
  { origin: 'Coari, AM', destination: 'Manaus, AM', corridor: 'Coari–Manaus', mainRiver: 'Solimões', serviceType: 'Cabotagem fluvial regional' },
  { origin: 'Óbidos, PA', destination: 'Santarém, PA', corridor: 'Óbidos–Santarém', mainRiver: 'Amazonas', serviceType: 'Transferência hidroviária regional' },
  { origin: 'Breves, PA', destination: 'Belém, PA', corridor: 'Breves–Belém', mainRiver: 'Pará/Tocantins', serviceType: 'Navegação de abastecimento territorial' },
  { origin: 'Itaituba, PA', destination: 'Manaus, AM', corridor: 'Itaituba–Manaus', mainRiver: 'Tapajós/Amazonas', serviceType: 'Corredor hidroviário amazônico' },
  { origin: 'Lábrea, AM', destination: 'Porto Velho, RO', corridor: 'Lábrea–Porto Velho', mainRiver: 'Purus/Madeira', serviceType: 'Operação fluvial sazonal' },
  { origin: 'Macapá, AP', destination: 'Belém, PA', corridor: 'Macapá–Belém', mainRiver: 'Amazonas', serviceType: 'Linha regional de contêiner e carga geral' },
  { origin: 'Parintins, AM', destination: 'Santarém, PA', corridor: 'Parintins–Santarém', mainRiver: 'Amazonas', serviceType: 'Conexão fluvial intermunicipal' },
  { origin: 'Manicoré, AM', destination: 'Manaus, AM', corridor: 'Manicoré–Manaus', mainRiver: 'Madeira/Amazonas', serviceType: 'Abastecimento territorial interior' },
  { origin: 'Abaetetuba, PA', destination: 'Vila do Conde, PA', corridor: 'Abaetetuba–Vila do Conde', mainRiver: 'Pará', serviceType: 'Consolidação de carga de curto curso' },
  { origin: 'Humaitá, AM', destination: 'Itacoatiara, AM', corridor: 'Humaitá–Itacoatiara', mainRiver: 'Madeira/Amazonas', serviceType: 'Operação granel e carga geral' },
  { origin: 'Soure, PA', destination: 'Belém, PA', corridor: 'Soure–Belém', mainRiver: 'Baía do Marajó', serviceType: 'Linha territorial insular' },
  { origin: 'Tabatinga, AM', destination: 'Tefé, AM', corridor: 'Tabatinga–Tefé', mainRiver: 'Solimões', serviceType: 'Corredor de abastecimento essencial' }
] as const;

const cargoStatusPool: Cargo['status'][] = ['open', 'bidding', 'contracting', 'reserved'];
const cargoRiskPool = [
  'Janela de maré e atracação compartilhada',
  'Coleta documental com sincronização tardia',
  'Trecho com menor calado operacional',
  'Necessidade de prova fotográfica no embarque'
] as const;

const extraCargoes: Cargo[] = Array.from({ length: 24 }, (_, index) => {
  const template = cargoes[index % cargoes.length];
  const route = cargoRoutePool[index % cargoRoutePool.length];
  const readinessBase = template.documentReadiness ?? 60;
  const windowStart = String(((index * 2) % 20) + 1).padStart(2, '0');
  const windowEnd = String((((index * 2) % 20) + 4)).padStart(2, '0');
  const extraRisk = cargoRiskPool[index % cargoRiskPool.length];
  const priceDigits = Number(template.targetPrice.replace(/\D/g, '')) + (index + 1) * 135;
  const price = new Intl.NumberFormat('pt-BR').format(priceDigits);

  return {
    ...template,
    id: `cargo-${String(index + 10).padStart(3, '0')}`,
    title: `${template.title} • lote ${index + 2}`,
    origin: route.origin,
    destination: route.destination,
    corridor: route.corridor,
    mainRiver: route.mainRiver,
    serviceType: route.serviceType,
    status: cargoStatusPool[index % cargoStatusPool.length],
    window: `${windowStart}-${windowEnd} maio`,
    targetPrice: `R$ ${price}`,
    documentReadiness: Math.max(34, Math.min(98, readinessBase + ((index % 6) - 2) * 5)),
    etaConfidence: template.etaConfidence?.replace(/\d+–\d+h|\d+–\d+ dias/, index % 2 === 0 ? 'ETA 30–42h' : 'ETA 4–7 dias') ?? template.etaConfidence,
    originContext: `${template.originContext ?? ''} Lote QA ${index + 2} com consolidação hidroviária simulada.`,
    description: `${template.description ?? ''} Cenário adicional para testes de busca, paginação e estados de contratação.`,
    operationalRisks: Array.from(new Set([...(template.operationalRisks ?? []), extraRisk]))
  };
});

cargoes.push(...extraCargoes);


export const vessels: Vessel[] = [
  { id: 'vessel-001', name: 'Comboio Rio Negro', route: 'Manaus–Belém', capacity: '2.400 t', eta: '36h', status: 'available', owner: 'Navega Norte', vesselType: 'Comboio de barcaças', draft: '2,2 m', corridor: 'Manaus–Belém', documentStatus: 'verified', lowConnectivityReady: true, checklistReady: true, imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', certifications: ['ANTAQ', 'Seguro P&I', 'Checklist digital'], sustainabilityScore: 'A-', lastInspection: '2026-04-18' },
  { id: 'vessel-002', name: 'Frio Tapajós', route: 'Belém–Santarém', capacity: '480 m³', eta: '18h', status: 'route', owner: 'FrioRios', vesselType: 'Embarcação regional refrigerada', draft: '1,4 m', corridor: 'Belém–Santarém', documentStatus: 'verified', lowConnectivityReady: true, checklistReady: true, imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80', certifications: ['Cadeia fria', 'Rastreio', 'Lacre digital'], sustainabilityScore: 'A', lastInspection: '2026-04-20' },
  { id: 'vessel-003', name: 'Madeira Forte', route: 'Manaus–Porto Velho', capacity: '1.600 t', eta: '72h', status: 'maintenance', owner: 'Hidrovia Madeira', vesselType: 'Empurrador + barcaça', draft: '2,6 m', corridor: 'Manaus–Porto Velho', documentStatus: 'review', lowConnectivityReady: false, checklistReady: false, imageUrl: 'https://images.unsplash.com/photo-1527439228071-489156f9b94a?auto=format&fit=crop&w=1200&q=80', certifications: ['ANTAQ em revisão'], sustainabilityScore: 'B+', lastInspection: '2026-03-29' },
  { id: 'vessel-004', name: 'Cabotagem Norte 01', route: 'Vila do Conde–Suape', capacity: '320 TEU', eta: '5 dias', status: 'available', owner: 'BR do Mar Log', vesselType: 'Multiuso de cabotagem', draft: '5,8 m', corridor: 'Vila do Conde–Suape', documentStatus: 'verified', lowConnectivityReady: true, checklistReady: true, imageUrl: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=1200&q=80', certifications: ['ANTAQ', 'Seguro P&I', 'Terminal ready'], sustainabilityScore: 'A-', lastInspection: '2026-04-10' }
];

const extraVessels: Vessel[] = [
  { id: 'vessel-005', name: 'Tapajós Express', route: 'Santarém–Itaituba', capacity: '620 t', eta: '28h', status: 'available', owner: 'Tapajós Cargo', vesselType: 'Carga geral fluvial', draft: '1,8 m', corridor: 'Santarém–Itaituba', documentStatus: 'verified', lowConnectivityReady: true, checklistReady: true, imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', certifications: ['ANTAQ', 'Checklist digital'], sustainabilityScore: 'A-', lastInspection: '2026-04-23' },
  { id: 'vessel-006', name: 'Marajó Link', route: 'Belém–Soure', capacity: '340 t', eta: '12h', status: 'route', owner: 'Norte Marajó', vesselType: 'Carga mista insular', draft: '1,2 m', corridor: 'Belém–Soure', documentStatus: 'verified', lowConnectivityReady: true, checklistReady: true, imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=80', certifications: ['Seguro P&I', 'Manifesto digital'], sustainabilityScore: 'A', lastInspection: '2026-04-19' },
  { id: 'vessel-007', name: 'Solimões Care', route: 'Manaus–Tabatinga', capacity: '290 m³', eta: '6 dias', status: 'available', owner: 'Saúde Ribeirinha', vesselType: 'Refrigerado essencial', draft: '1,5 m', corridor: 'Manaus–Tabatinga', documentStatus: 'verified', lowConnectivityReady: true, checklistReady: true, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', certifications: ['Cadeia fria', 'Rastreio'], sustainabilityScore: 'A', lastInspection: '2026-04-16' }
];

vessels.push(...extraVessels);


export const negotiations: Negotiation[] = [
  { id: 'neg-001', cargoTitle: 'Polpa de açaí congelada — cooperativa ribeirinha', vesselName: 'Frio Tapajós', stage: 'quote', amount: 'R$ 6.080', lastUpdate: 'Hoje, 10:40', parties: ['Coop. Açaí Pará', 'FrioRios'], route: 'Belém–Santarém', paymentTerms: '50% reserva / 50% POD', insurance: 'Cadeia fria coberta', documents: ['NF-e pendente de anexação', 'Romaneio validado'], nextStep: 'Anexar laudo sanitário e confirmar lacre', riskLevel: 'medium', history: [{ title: 'Cotação recebida', description: 'Transportador compatível com cadeia fria e baixa conectividade.', date: '10:40' }] },
  { id: 'neg-002', cargoTitle: 'Madeira de manejo com DOF', vesselName: 'Madeira Forte', stage: 'counteroffer', amount: 'R$ 11.900', lastUpdate: 'Ontem, 17:25', parties: ['Floresta Legal', 'Hidrovia Madeira'], route: 'Manaus–Porto Velho', paymentTerms: 'Contrato mediante DOF', insurance: 'Ambiental e carga', documents: ['DOF obrigatório', 'ANTAQ em revisão'], nextStep: 'Compliance revisar autorização e janela de vazante', riskLevel: 'high', history: [{ title: 'Exceção aberta', description: 'DOF e documentação da embarcação precisam de validação antes da reserva.', date: 'Ontem' }] },
  { id: 'neg-003', cargoTitle: 'Equipamentos solares para comunidades ribeirinhas', vesselName: 'Comboio Rio Negro', stage: 'contract', amount: 'R$ 19.450', lastUpdate: 'Hoje, 08:10', parties: ['Programa Energia Ribeirinha', 'Navega Norte'], route: 'Belém–Tefé', paymentTerms: 'Empenho + aceite digital', insurance: 'Equipamento sensível', documents: ['Checklist de integridade ok', 'NF-e ok'], nextStep: 'Gerar reserva e checklist de embarque', riskLevel: 'low', history: [{ title: 'Documentos validados', description: 'Carga pronta para reserva operacional.', date: '08:10' }] }
];

const extraNegotiations: Negotiation[] = [
  { id: 'neg-004', cargoTitle: 'Medicamentos refrigerados para abastecimento territorial', vesselName: 'Solimões Care', stage: 'quote', amount: 'R$ 15.820', lastUpdate: 'Hoje, 11:15', parties: ['Saúde Ribeirinha', 'Saúde Ribeirinha'], route: 'Manaus–Tabatinga', paymentTerms: 'Reserva + SLA sanitário', insurance: 'Saúde e cadeia fria', documents: ['Controle de temperatura ok', 'NF-e ok'], nextStep: 'Validar janela de atracação sanitária', riskLevel: 'medium', history: [{ title: 'SLA operacional registrado', description: 'Transportador com prontidão para baixa conectividade.', date: '11:15' }] },
  { id: 'neg-005', cargoTitle: 'Castanha beneficiada com rastreabilidade socioambiental', vesselName: 'Tapajós Express', stage: 'counteroffer', amount: 'R$ 9.120', lastUpdate: 'Hoje, 09:05', parties: ['Rede Castanha Viva', 'Tapajós Cargo'], route: 'Santarém–Macapá', paymentTerms: '30% reserva / saldo na entrega', insurance: 'Carga seca e rastreável', documents: ['Declaração de origem revisada'], nextStep: 'Responder contraproposta e validar cronograma', riskLevel: 'low', history: [{ title: 'Contraproposta enviada', description: 'Ajuste de janela e roteiro fluvial.', date: '09:05' }] },
  { id: 'neg-006', cargoTitle: 'Contêineres de cabotagem conectada Norte–Nordeste', vesselName: 'Cabotagem Norte 01', stage: 'contract', amount: 'R$ 24.240', lastUpdate: 'Ontem, 18:22', parties: ['BR do Mar Log', 'BR do Mar Log'], route: 'Vila do Conde–Suape', paymentTerms: 'Booking + terminal window', insurance: 'Portuário', documents: ['Manifesto pendente', 'CT-e em emissão'], nextStep: 'Emitir booking final e anexar manifesto', riskLevel: 'medium', history: [{ title: 'Contrato em minuta', description: 'Operação portuária alinhada com janela do terminal.', date: 'Ontem' }] }
];

negotiations.push(...extraNegotiations);


export const trackingEvents: TrackingEvent[] = [
  { id: 'track-001', title: 'Documentos validados', description: 'NF-e, romaneio e exigências condicionais conferidas.', location: 'Belém, PA', timestamp: '06 mai • 08:30', status: 'done', evidence: 'Checklist documental assinado' },
  { id: 'track-002', title: 'Lacre e temperatura conferidos', description: 'Cadeia fria registrada antes do embarque.', location: 'Terminal de Belém', timestamp: '06 mai • 11:40', status: 'done', evidence: 'Foto do lacre + sensor 2 °C' },
  { id: 'track-003', title: 'Navegação em curso', description: 'Evento sincronizado com atraso por baixa conectividade.', location: 'Rio Amazonas', timestamp: '06 mai • 19:15', status: 'current', evidence: 'Sincronização tardia de sinal' },
  { id: 'track-004', title: 'Previsão de atracação atualizada', description: 'ETA ajustado conforme janela de vazante e tráfego local.', location: 'Santarém, PA', timestamp: '07 mai • 09:00', status: 'pending', evidence: 'Atualização operacional pendente' },
  { id: 'track-005', title: 'POD recebido', description: 'Comprovante de entrega e aceite digital.', location: 'Santarém, PA', timestamp: '07 mai • 15:30', status: 'pending', evidence: 'Assinatura do recebedor' }
];

trackingEvents.push(
  { id: 'track-006', title: 'Janela de atracação confirmada', description: 'Equipe local confirmou berço e equipe de descarga.', location: 'Santarém, PA', timestamp: '07 mai • 11:20', status: 'pending', evidence: 'Confirmação operacional' },
  { id: 'track-007', title: 'Checklist de descarga em preparação', description: 'Equipe prepara conferência final de volumes e integridade.', location: 'Santarém, PA', timestamp: '07 mai • 13:05', status: 'pending', evidence: 'Checklist digital' }
);
