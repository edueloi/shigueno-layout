import React from 'react';
import { Mail, Phone, MapPin, Search, Filter, MessageSquare, Check, Landmark } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface ContatoViewProps {
  siteSettings?: Record<string, string>;
}

export default function ContatoView({ siteSettings }: ContatoViewProps) {
  const { language, t } = useLanguage();

  const contactTranslations = {
    pt: {
      subHero: 'Deseja adquirir nossos produtos no atacado ou agendar carregamentos? Utilize nossos telefones diretos.',
      unitPhones: 'Telefones das Unidades',
      allSectors: 'Todos os Setores',
      sectorEgg: 'Avicultura (Ovos)',
      sectorCitrus: 'Citricultura (Laranjas)',
      sectorCoffee: 'Cafeicultura (Café)',
      sectorCattle: 'Agropecuária (Gado)',
      allStates: 'Todos os Estados',
      stateSP: 'São Paulo (SP)',
      stateMT: 'Mato Grosso (MT)',
      noResults: 'Nenhuma unidade correspondente aos filtros.',
      onlineService: 'Atendimento Online',
      formTitle: 'Formulário de Pedido ou Dúvida',
      formSubtitle: 'Envie uma mensagem e nossa equipe comercial entrará em contato.',
      formSentTitle: 'Sua Mensagem foi Enviada!',
      formSentText: 'Agradecemos o contato. Encaminhamos os detalhes de sua solicitação à gerência de vendas da Fazenda Nova Aliança (Tatuí-SP). Breve daremos retorno.',
      sendAnother: 'Enviar Outra Mensagem',
      formErrorFill: 'Por favor, preencha nome, e-mail e mensagem.',
      labelName: 'Seu Nome / Razão Social *',
      placeholderName: 'Ex: Supermercado Aliança Ltda',
      labelEmail: 'E-mail para Retorno *',
      labelPhone: 'Telefone WhatsApp',
      placeholderPhone: 'Ex: (15) 3259-9710',
      labelInterest: 'Segmento de Interesse *',
      optCitrus: '🍊 Compra de Laranjas e Citros',
      optEggs: '🥚 Distribuição de Ovos Postura',
      optCoffee: '☕ Aquisição de Grãos de Café Arábica',
      optCattle: '🐂 Aquisição / Venda de Gado Nelore',
      optOthers: '❓ Outros Assuntos Corporativos',
      labelDesc: 'Descrição do Pedido / Dúvida *',
      placeholderDesc: 'Ex: Gostaria de solicitar cotação de 500 caixas de Laranja Ponkan entregues em São Paulo-SP...',
      submitBtn: 'Enviar Mensagem Comercial',
      headquartersBadge: 'Sede Administrativa',
      hqDesc: 'Venha nos visitar ou faça uma retirada agendada de cargas de Citros e Ovos diretamente em nossa sede. Estacionamento gratuito e guias comerciais no local.',
      addressLabel: 'Endereço',
      phoneLabel: 'Atendimento Telefônico',
      emailLabel: 'E-mail de Contato',
      openGmaps: 'Abrir no Google Maps',
      loadingMap: 'Carregando Mapa de Tatuí...',
      subLoadingMap: 'Fazenda Nova Aliança',
      sectorEggLabel: 'Venda de Ovos',
      sectorCitrusLabel: 'Venda de Laranjas',
      sectorCoffeeLabel: 'Venda de Café',
      sectorCattleLabel: 'Venda de Gado',
      addressTatuí: 'Fazenda Shigueno',
      addressDetails: 'Rodovia Gladys Bernardes Minhoto, km 38 (SP-129)\nVale dos Lagos — Tatuí - SP\nCEP 18277-680',
      visitPrompt: 'Venha nos visitar ou faça uma retirada agendada de cargas de Citros e Ovos diretamente em nossa sede. Estacionamento gratuito e guias comerciais no local.',
      phoneSupport: 'Atendimento Telefônico',
      emailContact: 'E-mail de Contato'
    },
    en: {
      subHero: 'Do you want to purchase our products in bulk or schedule cargo shipments? Use our direct phone lines.',
      unitPhones: 'Unit Phone Numbers',
      allSectors: 'All Sectors',
      sectorEgg: 'Poultry (Eggs)',
      sectorCitrus: 'Citrus (Oranges)',
      sectorCoffee: 'Coffee Farming (Coffee)',
      sectorCattle: 'Livestock (Cattle)',
      allStates: 'All States',
      stateSP: 'São Paulo (SP)',
      stateMT: 'Mato Grosso (MT)',
      noResults: 'No units matches your filters.',
      onlineService: 'Online Service',
      formTitle: 'Order or Question Form',
      formSubtitle: 'Send us a message and our commercial team will contact you.',
      formSentTitle: 'Your Message Has Been Sent!',
      formSentText: 'Thank you for contacting us. We have sent your request details to the sales management team of Fazenda Nova Aliança (Tatuí-SP). We will reply shortly.',
      sendAnother: 'Send Another Message',
      formErrorFill: 'Please, fill in name, email and message.',
      labelName: 'Your Name / Company Name *',
      placeholderName: 'e.g., Aliança Supermarket Ltd',
      labelEmail: 'Return Email *',
      labelPhone: 'WhatsApp Number',
      placeholderPhone: 'e.g., +55 (15) 3259-9710',
      labelInterest: 'Segment of Interest *',
      optCitrus: '🍊 Purchase Citrus / Oranges',
      optEggs: '🥚 Eggs Distribution',
      optCoffee: '☕ Purchase Arabica Coffee Beans',
      optCattle: '🐂 Purchase / Sale of Nelore Cattle',
      optOthers: '❓ Other Corporate Matters',
      labelDesc: 'Order or Question Description *',
      placeholderDesc: 'e.g., I would like to request a quote for 500 boxes of Ponkan Tangerines delivered in São Paulo...',
      submitBtn: 'Send Commercial Message',
      headquartersBadge: 'Administrative HQ',
      hqDesc: 'Visit us or arrange a scheduled pick-up of Citrus and Eggs cargo directly at our headquarters. Free parking and commercial guides available.',
      addressLabel: 'Address',
      phoneLabel: 'Telephone Support',
      emailLabel: 'Contact Email',
      openGmaps: 'Open in Google Maps',
      loadingMap: 'Loading Tatuí Map...',
      subLoadingMap: 'Nova Aliança Farm',
      sectorEggLabel: 'Eggs Sales',
      sectorCitrusLabel: 'Citrus Sales',
      sectorCoffeeLabel: 'Coffee Sales',
      sectorCattleLabel: 'Cattle Sales',
      addressTatuí: 'Shigueno Farm',
      addressDetails: 'Gladys Bernardes Minhoto Highway, km 38 (SP-129)\nVale dos Lagos — Tatuí - SP\nCEP 18277-680',
      visitPrompt: 'Visit us or schedule a pickup for citrus and egg orders directly at our headquarters. Free parking and staff assistance on site.',
      phoneSupport: 'Telephone Support',
      emailContact: 'Contact Email'
    },
    es: {
      subHero: '¿Desea adquirir nuestros productos al por mayor o programar embarques? Utilice nuestras líneas telefónicas directas.',
      unitPhones: 'Teléfonos de las Unidades',
      allSectors: 'Todos los Sectores',
      sectorEgg: 'Avicultura (Huevos)',
      sectorCitrus: 'Citricultura (Naranjas)',
      sectorCoffee: 'Caficultura (Café)',
      sectorCattle: 'Ganadería (Ganado)',
      allStates: 'Todos los Estados',
      stateSP: 'São Paulo (SP)',
      stateMT: 'Mato Grosso (MT)',
      noResults: 'Ninguna unidad coincide con los filtros.',
      onlineService: 'Atención en Línea',
      formTitle: 'Formulario de Pedido o Consulta',
      formSubtitle: 'Envíe un mensaje y nuestro equipo comercial se pondrá en contacto con usted.',
      formSentTitle: '¡Su Mensaje ha sido Enviado!',
      formSentText: 'Agradecemos el contacto. Remitimos los detalles de su solicitud a la gerencia de ventas de la Hacienda Nova Aliança (Tatuí-SP). En breve le daremos una respuesta.',
      sendAnother: 'Enviar Otro Mensaje',
      formErrorFill: 'Por favor, complete nombre, correo electrónico y mensaje.',
      labelName: 'Su Nombre / Razón Social *',
      placeholderName: 'Ej: Supermercado Alianza S.R.L.',
      labelEmail: 'Correo Electrónico de Contacto *',
      labelPhone: 'Teléfono WhatsApp',
      placeholderPhone: 'Ej: (15) 3259-9710',
      labelInterest: 'Segmento de Interés *',
      optCitrus: '🍊 Compra de Naranjas y Cítricos',
      optEggs: '🥚 Distribución de Huevos',
      optCoffee: '☕ Adquisición de Granos de Café Arábica',
      optCattle: '🐂 Adquisición / Venta de Ganado Nelore',
      optOthers: '❓ Otros Asuntos Corporativos',
      labelDesc: 'Descripción del Pedido o Consulta *',
      placeholderDesc: 'Ej: Quisiera solicitar una cotización de 500 cajas de mandarinas Ponkan entregadas en São Paulo-SP...',
      submitBtn: 'Enviar Mensaje Comercial',
      headquartersBadge: 'Sede Administrativa',
      hqDesc: 'Visítenos o realice un retiro programado de cargas de Cítricos y Huevos directamente en nuestra sede. Estacionamiento gratuito y guías comerciales disponibles.',
      addressLabel: 'Dirección',
      phoneLabel: 'Atención Telefónica',
      emailLabel: 'Correo Electrónico',
      openGmaps: 'Abrir en Google Maps',
      loadingMap: 'Cargando Mapa de Tatuí...',
      subLoadingMap: 'Hacienda Nova Aliança',
      sectorEggLabel: 'Venta de Huevos',
      sectorCitrusLabel: 'Venta de Naranjas',
      sectorCoffeeLabel: 'Venta de Café',
      sectorCattleLabel: 'Venta de Ganado',
      addressTatuí: 'Hacienda Shigueno',
      addressDetails: 'Carretera Gladys Bernardes Minhoto, km 38 (SP-129)\nVale dos Lagos — Tatuí - SP\nCEP 18277-680',
      visitPrompt: 'Visítenos o realice un retiro de pedidos directamente en nuestra sede. Estacionamiento gratuito y atención comercial en el lugar.',
      phoneSupport: 'Atención Telefónica',
      emailContact: 'Correo Electrónico de Contacto'
    }
  };

  const ct = contactTranslations[language] || contactTranslations['pt'];

  const [sectorFilter, setSectorFilter] = React.useState('Todos');
  const [stateFilter, setStateFilter] = React.useState('Todos');
  const [isMapLoading, setIsMapLoading] = React.useState(true);
  
  // Form state
  const [contName, setContName] = React.useState('');
  const [contEmail, setContEmail] = React.useState('');
  const [contPhone, setContPhone] = React.useState('');
  const [contSubject, setContSubject] = React.useState('venda_laranjas');
  const [contMsg, setContMsg] = React.useState('');
  const [formSent, setFormSent] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  const farms = [
    { name: 'Granja Nova', sector: 'Venda de Ovos', city: 'Tatuí - SP', phone: '(15) 3259-9710' },
    { name: 'Nova Aliança (Sede)', sector: 'Venda de Laranjas', city: 'Tatuí - SP', phone: '(15) 3259-9710' },
    { name: 'Fortaleza', sector: 'Venda de Laranjas', city: 'Tatuí - SP', phone: '(15) 3259-9725' },
    { name: 'Califórnia', sector: 'Venda de Laranjas', city: 'Burí - SP', phone: '(15) 99853-7212' },
    { name: 'Santa Fé', sector: 'Venda de Larana', city: 'Burí - SP', phone: '(15) 99850-3994' },
    { name: 'Nova Esperança', sector: 'Venda de Café', city: 'Itaí - SP', phone: '(14) 99880-1801' },
    { name: 'Bela Vista', sector: 'Venda de Café', city: 'Itaí - SP', phone: '(14) 99880-1801' },
    { name: 'Vitória São Lourenço', sector: 'Venda de Gado', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
    { name: 'Estrela do Oeste', sector: 'Venda de Gado', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
    { name: 'Boa Esperança', sector: 'Venda de Gado', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
    { name: 'Vale do Mutum', sector: 'Venda de Gado', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' }
  ];

  const getTranslatedSector = (sec: string) => {
    if (sec === 'Venda de Ovos') return ct.sectorEggLabel;
    if (sec.includes('Laranja') || sec.includes('Larana')) return ct.sectorCitrusLabel;
    if (sec === 'Venda de Café') return ct.sectorCoffeeLabel;
    if (sec === 'Venda de Gado') return ct.sectorCattleLabel;
    return sec;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contName || !contEmail || !contMsg) {
      setFormError(ct.formErrorFill);
      return;
    }
    setFormError('');
    // Simulate email dispatch
    setFormSent(true);
    // Clear
    setContName('');
    setContEmail('');
    setContPhone('');
    setContMsg('');
  };

  const filteredFarms = farms.filter((farm) => {
    const sMatch = sectorFilter === 'Todos' || farm.sector.toLowerCase().includes(sectorFilter.toLowerCase()) || (sectorFilter === 'Laranja' && farm.sector.toLowerCase().includes('larana'));
    const stateVal = farm.city.split('-')[1]?.trim() || '';
    const stMatch = stateFilter === 'Todos' || stateVal === stateFilter;
    return sMatch && stMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-xs font-bold text-amber-600 tracking-widest uppercase font-mono">{t('contact.title')}</h2>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          {language === 'en' ? 'Our Contacts & Production Units' : language === 'es' ? 'Nuestros Contactos y Unidades de Producción' : 'Nossos Contatos e Unidades de Produção'}
        </h1>
        <p className="text-slate-500 text-sm mt-2">{ct.subHero}</p>
        <div className="w-20 h-1.5 bg-emerald-800 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact list & Filters column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-4 sm:p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center">
                <Landmark className="w-5 h-5 mr-2 text-emerald-800" />
                {ct.unitPhones}
              </h3>
              
              {/* Dynamic Filters */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs w-full sm:w-auto">
                <select 
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-2 sm:py-1.5 focus:outline-emerald-800 font-semibold text-slate-700 text-[11px] sm:text-xs text-ellipsis overflow-hidden"
                >
                  <option value="Todos">{ct.allSectors}</option>
                  <option value="Ovos">{ct.sectorEgg}</option>
                  <option value="Laranja">{ct.sectorCitrus}</option>
                  <option value="Café">{ct.sectorCoffee}</option>
                  <option value="Gado">{ct.sectorCattle}</option>
                </select>

                <select 
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-2 sm:py-1.5 focus:outline-emerald-800 font-semibold text-slate-700 text-[11px] sm:text-xs text-ellipsis overflow-hidden"
                >
                  <option value="Todos">{ct.allStates}</option>
                  <option value="SP">{ct.stateSP}</option>
                  <option value="MT">{ct.stateMT}</option>
                </select>
              </div>
            </div>

            {/* Farms Grid Table */}
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl">
              {filteredFarms.length > 0 ? (
                filteredFarms.map((farm, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-slate-50 px-3 rounded-lg transition-colors">
                    <div>
                      <h4 className="font-extrabold text-slate-900">{farm.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{getTranslatedSector(farm.sector)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 sm:gap-x-6">
                      <span className="inline-flex items-center text-xs font-semibold text-slate-600 font-mono whitespace-nowrap shrink-0">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                        {farm.city}
                      </span>
                      <a 
                        href={`tel:${farm.phone.replace(/[^0-9]/g, '')}`}
                        className="inline-flex items-center space-x-1.5 text-emerald-800 hover:text-emerald-950 font-bold font-mono text-sm whitespace-nowrap shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{farm.phone}</span>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 italic text-xs">
                  {ct.noResults}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-800 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {formSent ? (
              <div className="space-y-4 text-center py-10 animate-fade-in relative z-10">
                <div className="w-12 h-12 bg-emerald-800 border border-emerald-600 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase font-sans">{ct.formSentTitle}</h3>
                <p className="text-xs text-emerald-200 leading-relaxed max-w-sm mx-auto font-sans">
                  {ct.formSentText}
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-extrabold text-xs px-6 py-2.5 rounded-xl border border-amber-400 transition-colors"
                >
                  {ct.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase font-mono bg-emerald-850 px-2.5 py-1 rounded border border-emerald-800">
                    {ct.onlineService}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white mt-2">{ct.formTitle}</h3>
                  <p className="text-xs text-emerald-200">{ct.formSubtitle}</p>
                </div>

                {formError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3.5 rounded-2xl text-xs font-semibold animate-fade-in flex items-center space-x-2">
                    <span className="text-amber-400">⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-emerald-250 uppercase mb-1">{ct.labelName}</label>
                  <input
                    type="text"
                    required
                    placeholder={ct.placeholderName}
                    value={contName}
                    onChange={(e) => setContName(e.target.value)}
                    className="w-full bg-emerald-950/50 border border-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-amber-500 text-white placeholder-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-250 uppercase mb-1">{ct.labelEmail}</label>
                    <input
                      type="email"
                      required
                      placeholder="comercial@compras.com"
                      value={contEmail}
                      onChange={(e) => setContEmail(e.target.value)}
                      className="w-full bg-emerald-950/50 border border-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-amber-500 text-white placeholder-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-250 uppercase mb-1">{ct.labelPhone}</label>
                    <input
                      type="text"
                      placeholder={ct.placeholderPhone}
                      value={contPhone}
                      onChange={(e) => setContPhone(e.target.value)}
                      className="w-full bg-emerald-950/50 border border-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-amber-500 text-white placeholder-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-emerald-250 uppercase mb-1">{ct.labelInterest}</label>
                  <select
                    value={contSubject}
                    onChange={(e) => setContSubject(e.target.value)}
                    className="w-full bg-emerald-950 border border-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-amber-500 text-white font-sans text-ellipsis overflow-hidden"
                  >
                    <option value="venda_laranjas">{ct.optCitrus}</option>
                    <option value="venda_ovos">{ct.optEggs}</option>
                    <option value="venda_cafe">{ct.optCoffee}</option>
                    <option value="venda_gado">{ct.optCattle}</option>
                    <option value="outros">{ct.optOthers}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-emerald-250 uppercase mb-1">{ct.labelDesc}</label>
                  <textarea
                    rows={4}
                    required
                    placeholder={ct.placeholderDesc}
                    value={contMsg}
                    onChange={(e) => setContMsg(e.target.value)}
                    className="w-full bg-emerald-950/50 border border-emerald-800 px-4 py-2.5 rounded-xl text-xs text-white placeholder-emerald-400 font-sans"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-xs py-3 rounded-xl shadow-md transition-all uppercase tracking-wider border border-amber-400 cursor-pointer"
                >
                  {ct.submitBtn}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

      {/* Endereço Principal & Mapa */}
      <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
        <div className="p-8 lg:p-12 lg:col-span-5 flex flex-col justify-between space-y-8 bg-slate-50/50">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 tracking-widest uppercase font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              {ct.headquartersBadge}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-4 tracking-tight">{ct.addressTatuí}</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              {ct.visitPrompt}
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{ct.addressLabel}</p>
                <p className="text-slate-600 text-xs mt-1 font-medium leading-relaxed whitespace-pre-line">
                  {ct.addressDetails}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{ct.phoneSupport}</p>
                <p className="text-slate-600 text-xs mt-1 font-semibold font-mono">
                  {siteSettings?.contact_phone || '(15) 3259-9710'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <Mail className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{ct.emailContact}</p>
                <p className="text-slate-600 text-xs mt-1 font-semibold font-mono">
                  {siteSettings?.contact_email || 'sac@shigueno.com.br'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200/60">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Granja+Shigueno+Tatu%C3%AD+-+SP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>{ct.openGmaps}</span>
              <span className="ml-1 text-xs">→</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 min-h-[350px] lg:min-h-[480px] w-full relative bg-slate-100 overflow-hidden rounded-2xl border border-slate-200/50 flex items-center justify-center">
          {isMapLoading && (
            <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-10 animate-pulse">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute w-12 h-12 border-4 border-emerald-800/20 rounded-full"></div>
                <div className="absolute w-12 h-12 border-4 border-t-emerald-800 border-r-emerald-800 rounded-full animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-slate-700 font-mono mt-4 tracking-widest uppercase animate-pulse">
                {ct.loadingMap}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">{ct.subLoadingMap}</span>
            </div>
          )}
          <iframe
            id="gmap_canvas"
            src="https://maps.google.com/maps?q=Granja%20Shigueno,%20Tatu%C3%AD%20-%20SP&t=&z=14&ie=UTF8&iwloc=&output=embed"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ${isMapLoading ? 'opacity-0' : 'opacity-100'}`}
            title="Localização da Fazenda Shigueno no Google Maps"
            allowFullScreen
            onLoad={() => setIsMapLoading(false)}
          ></iframe>
        </div>
      </div>

    </div>
  );
}
