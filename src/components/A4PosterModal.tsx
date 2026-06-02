import React from 'react';
import { X, Printer, Download, Copy, Check, Sparkles, FileText, Smartphone, Mail, MapPin } from 'lucide-react';
import { toPng } from 'html-to-image';

interface Vacancy {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  requirements: string;
  status: string;
}

interface A4PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy: Vacancy | null;
}

export default function A4PosterModal({ isOpen, onClose, vacancy }: A4PosterModalProps) {
  const [cargoTitle, setCargoTitle] = React.useState('');
  const [departamento, setDepartamento] = React.useState('');
  const [localizacao, setLocalizacao] = React.useState('');
  const [beneficiosText, setBeneficiosText] = React.useState('');
  const [requisitosText, setRequisitosText] = React.useState('');
  const [emailContato, setEmailContato] = React.useState('rh@shigueno.com.br');
  const [whatsappContato, setWhatsappContato] = React.useState('(15) 99661-9119');
  const [disclaimer, setDisclaimer] = React.useState('PARA A VAGA PROPOSTA É NECESSÁRIO EXPERIÊNCIA COMPROVADA');
  
  const [zoomLevel, setZoomLevel] = React.useState(0.65);
  const [showCopied, setShowCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Initialize fields when vacancy changes
  React.useEffect(() => {
    if (vacancy) {
      setCargoTitle(vacancy.title || '');
      setDepartamento(vacancy.department || '');
      setLocalizacao(vacancy.location || 'Granja Nova - Tatuí');
      
      // Default benefits exactly like in the image
      const defaultBenefits = [
        "Cesta Natalidade (para recém-nascidos, pai e mãe);",
        "Convênio com Farmácias;",
        "Convênio com Ponto de Vendas Local; (Produtos com até 20% de desconto)",
        "Convênio Médico Coparticipação;",
        "Refeição na empresa;",
        "Seguro de Vida;",
        "Transporte Fretado;",
        "Vale Alimentação R$ 600,00 (acordo sindical)."
      ];
      setBeneficiosText(defaultBenefits.join('\n'));

      // If vacancy has custom requirements, parse or split them neatly, otherwise use custom defaults
      const cleanReqsFromVacancy = vacancy.requirements
        ? vacancy.requirements.split(/[;,\n]+/).map(r => r.trim()).filter(Boolean)
        : [];

      const defaultRequirements = [
        "Bom relacionamento e trabalho em equipe;",
        "Boa comunicação, senso de organização e agilidade;",
        "Fácil adaptabilidade;",
        "Comprometimento, responsabilidade e pontualidade;",
        "Necessário experiência comprovada de acordo com a função."
      ];

      // Use actual vacancy requirements directly if available, otherwise fallback to generic defaults
      const finalReqs = cleanReqsFromVacancy.length > 0 
        ? cleanReqsFromVacancy 
        : defaultRequirements;

      setRequisitosText(finalReqs.map(r => r.endsWith(';') || r.endsWith('.') ? r : r + ';').join('\n'));
    }
  }, [vacancy]);

  if (!isOpen || !vacancy) return null;

  // Split benefits & requirements textareas by line
  const benefitsList = beneficiosText.split('\n').map(line => line.trim()).filter(Boolean);
  const requirementsList = requisitosText.split('\n').map(line => line.trim()).filter(Boolean);

  // Dynamic SVG rendering of oranges icon logo
  const OrangesLogoIcon = () => (
    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex flex-col items-center justify-between p-2 border border-white/30 shadow-md transform -rotate-1 select-none">
      <div className="flex-grow flex items-center justify-center relative w-full">
        {/* Left Orange */}
        <div className="w-7 h-7 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full absolute -left-0.5 top-2 Sinner border border-amber-300">
          {/* Stem & Leaf */}
          <div className="absolute -top-1 left-2.5 w-1.5 h-1.5 bg-emerald-800 rounded-full" />
          <div className="absolute -top-1.5 left-3 w-3.5 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-ellipse transform rotate-12" />
        </div>
        {/* Right Orange */}
        <div className="w-8 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full absolute right-0.5 top-1.5 shadow-inner border border-amber-250 z-10">
          <div className="absolute -top-1 left-3.5 w-1.5 h-1.5 bg-emerald-800 rounded-full" />
          <div className="absolute -top-2 left-4 w-4 h-2 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-ellipse transform -rotate-12" />
          {/* Orange dots texture */}
          <div className="absolute top-3 left-2.5 w-0.5 h-0.5 bg-orange-700/60 rounded-full" />
          <div className="absolute top-4 left-3.5 w-0.5 h-0.5 bg-orange-700/60 rounded-full" />
        </div>
      </div>
      <span className="text-[9px] font-black uppercase text-white tracking-widest font-sans drop-shadow-sm mt-0.5">desde 1932</span>
    </div>
  );

  // SVG representation of three collaborative people on white circular badge
  const PeopleCircleBadge = () => (
    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#147B42]">
      <svg className="w-20 h-20" viewBox="0 0 100 100">
        {/* Red outline person (right) */}
        <path d="M 62 48 C 62 40, 72 40, 72 48 C 72 58, 55 58, 55 68 L 85 68 C 85 58, 62 58, 62 48 Z" fill="none" stroke="#DE5A43" strokeWidth="3.5" strokeLinecap="round" />
        {/* Orange outline person (left) */}
        <path d="M 38 48 C 38 40, 28 40, 28 48 C 28 58, 45 58, 45 68 L 15 68 C 15 58, 38 58, 38 48 Z" fill="none" stroke="#DE7358" strokeWidth="3.5" strokeLinecap="round" />
        {/* Blue outline person (center - foreground) */}
        <path d="M 50 42 C 50 32, 60 32, 60 42 C 60 54, 40 54, 40 68 L 70 68 C 70 54, 50 54, 50 42 Z" fill="none" stroke="#2563EB" strokeWidth="4.2" strokeLinecap="round" className="transform -translate-x-[5px]" />
      </svg>
    </div>
  );

  const handleDownloadPNG = async () => {
    const node = document.getElementById('print-a4-target');
    if (!node) return;
    try {
      setIsExporting(true);
      
      const dataUrl = await toPng(node, {
        width: 794, // High Resolution 794x1123 px matching A4 ratio at 96DPI
        height: 1123,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '794px',
          height: '1123px',
        }
      });
      
      const link = document.createElement('a');
      link.download = `Vaga_A4_${cargoTitle.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      
      setIsExporting(false);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    } catch (err) {
      console.error('Error generating image:', err);
      setIsExporting(false);
      alert('Falha ao exportar imagem. Por favor, utilize o botão "Imprimir / Salvar PDF" que usa a vetorização direta do seu navegador.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
      
      {/* Styles Injection to ensure native window.print() prints ONLY this poster on a single perfectly scaled A4 page */}
      <style>{`
        @media print {
          /* Hide anything except the clean poster element */
          body > * {
            display: none !important;
          }
          #print-a4-root-wrapper {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          #print-a4-target {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            transform: scale(1) !important;
            transform-origin: top left !important;
          }
        }
      `}</style>

      <div id="print-a4-root-wrapper" className="bg-slate-50 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-zoom-in">
        
        {/* Header toolbar */}
        <div className="bg-white border-b border-slate-150 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-800 text-xs font-black uppercase tracking-wider font-mono bg-emerald-50 px-2 py-0.5 rounded">PDF Oficial A4</span>
              <span className="text-slate-400 text-xs font-mono">• Layout de Divulgação Social</span>
            </div>
            <h2 className="text-base font-black text-slate-900 mt-1">Gerador de Cartaz de Vaga (Formato A4 Corporativo)</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-[#147B42] hover:bg-[#0F5A31] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF (A4)</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Processando Imagem...' : 'Baixar Imagem PNG'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          
          {/* Active Settings Editor Form (LEFT PANEL) */}
          <div className="w-full lg:w-[350px] bg-white border-r border-slate-150 p-5 overflow-y-auto space-y-4 shrink-0">
            <div className="flex items-center space-x-1.5 text-xs text-amber-850 font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>Painel de Ajustes do Cartaz</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Altere os textos abaixo. O cartaz do lado direito mudará instantaneamente para o formato exato que será impresso ou baixado em redes sociais.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Título do Cargo</label>
                <input
                  type="text"
                  value={cargoTitle}
                  onChange={(e) => setCargoTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Unidade / Setor</label>
                <input
                  type="text"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  placeholder="Ex: Pecuária Nelore"
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Atuação / Local</label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-xl text-xs font-bold focus:bg-white focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Benefícios Oferecidos (um por linha)</label>
                <textarea
                  rows={6}
                  value={beneficiosText}
                  onChange={(e) => setBeneficiosText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-xl text-xs font-mono focus:bg-white focus:outline-emerald-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Desejável e Requisitos (um por linha)</label>
                <textarea
                  rows={6}
                  value={requisitosText}
                  onChange={(e) => setRequisitosText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-xl text-xs font-mono focus:bg-white focus:outline-emerald-800 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">E-mail Recrutamento</label>
                  <input
                    type="text"
                    value={emailContato}
                    onChange={(e) => setEmailContato(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 p-2 rounded-xl text-[10px] font-bold focus:bg-white focus:outline-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">WhatsApp Fichas</label>
                  <input
                    type="text"
                    value={whatsappContato}
                    onChange={(e) => setWhatsappContato(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 p-2 rounded-xl text-[10px] font-bold focus:bg-white focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Texto do Rodapé (Alerta)</label>
                <input
                  type="text"
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-xl text-[10px] font-bold focus:bg-white focus:outline-emerald-800"
                />
              </div>
            </div>

            {showCopied && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl p-3 text-[10.5px] font-bold text-center flex items-center justify-center space-x-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Download efetuado com sucesso!</span>
              </div>
            )}
          </div>

          {/* Graphical A4 Poster Mockup Container (RIGHT PREVIEW PANEL) */}
          <div className="flex-grow p-6 bg-slate-100 overflow-y-auto flex flex-col items-center justify-start gap-4">
            
            {/* Zoom selector controls */}
            <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs border border-slate-200/60 flex items-center space-x-2 text-xs shrink-0 select-none">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1">Zoom do Cartaz A4:</span>
              <button 
                onClick={() => setZoomLevel(0.5)} 
                className={`px-2.5 py-1 rounded-full font-black transition-all ${zoomLevel === 0.5 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-150'}`}
              >
                50%
              </button>
              <button 
                onClick={() => setZoomLevel(0.65)} 
                className={`px-2.5 py-1 rounded-full font-black transition-all ${zoomLevel === 0.65 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-150'}`}
              >
                65% (Padrão)
              </button>
              <button 
                onClick={() => setZoomLevel(0.8)} 
                className={`px-2.5 py-1 rounded-full font-black transition-all ${zoomLevel === 0.8 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-150'}`}
              >
                80%
              </button>
              <button 
                onClick={() => setZoomLevel(1.0)} 
                className={`px-2.5 py-1 rounded-full font-black transition-all ${zoomLevel === 1.0 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-150'}`}
              >
                100%
              </button>
            </div>

            {/* Scaled viewport container for dynamic responsive mockup view */}
            <div 
              style={{ 
                width: `${794 * zoomLevel}px`, 
                height: `${1123 * zoomLevel}px`,
                transition: 'all 0.15s ease-out'
              }}
              className="shrink-0 relative overflow-hidden rounded-2xl shadow-2xl border border-slate-300"
            >
              {/* Inner scalable target element - Styled to preserve standard 794px x 1123px A4 pixel bounds */}
              <div 
                id="print-a4-target"
                className="bg-white text-slate-950 relative flex flex-col justify-between overflow-hidden shrink-0"
                style={{ 
                  width: '794px', 
                  height: '1123px',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                
                {/* WAVE HEADER CONTAINER */}
                <div className="absolute top-0 left-0 w-full h-[200px] overflow-hidden">
                  <svg className="absolute w-full h-full" viewBox="0 0 794 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    {/* Layer 1: Dark-Green wavy backdrop */}
                    <path d="M0 0H794V135C654 185 414 105 200 155 C93 180 33 185 0 175V0Z" fill="#0D532F" />
                    
                    {/* Layer 2: Wavy Lime Green Swoop underneath */}
                    <path d="M0 175 C33 185 93 180 200 155 C414 105 654 185 794 135 V147 C654 197 414 115 200 167 C93 192 33 197 0 187V175Z" fill="#147B42" opacity="0.6" />
                    
                    {/* Layer 3: Accent decoration swoop to frame circle badge on right */}
                    <path d="M547 147C661 147 721 180 794 167 V147C721 160 661 128 547 128Z" fill="#8CE1A3" opacity="0.4" />
                  </svg>

                  {/* Left logo elements */}
                  <div className="absolute left-8 top-8 flex items-center space-x-4 z-10">
                    <OrangesLogoIcon />
                    <div className="space-y-0.5">
                      <h1 className="text-4xl font-black italic text-white leading-none font-serif tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" style={{ fontFamily: 'Georgia, serif' }}>
                        Shigueno
                      </h1>
                      <div className="w-16 h-1 bg-white/40 rounded-full" />
                    </div>
                  </div>

                  {/* Right team outlines badge */}
                  <div className="absolute right-8 top-8 z-10">
                    <PeopleCircleBadge />
                  </div>
                </div>

                {/* MAIN BODY AREA & GRID (SPACED DOWN FOR HEADER WAVE HEIGHT OF 200px) */}
                <div className="pt-[220px] px-12 flex-grow flex flex-col justify-between pb-8">
                  
                  {/* Title Segment */}
                  <div className="space-y-5 text-center">
                    
                    {/* Red/Green side-border banner layout */}
                    <div className="inline-block border-l-[5px] border-[#0F5A31] pl-5 text-left max-w-xl mx-auto">
                      <p className="text-[17px] font-black uppercase text-[#0F5A31] tracking-widest font-sans">
                        Estamos em busca de
                      </p>
                      <h3 className="text-[31px] font-black text-slate-800 leading-none tracking-tight uppercase mt-0.5">
                        Novos Talentos
                      </h3>
                    </div>

                    {/* Hiring and bold contract callouts */}
                    <div className="space-y-1.5 mt-2.5 select-none">
                      <h2 className="text-[21px] font-black text-[#1c1d1e] tracking-widest uppercase">
                        Estamos Contratando
                      </h2>
                      <p className="text-[15px] font-extrabold text-emerald-700 bg-emerald-50 inline-block px-5 py-1.5 rounded-full uppercase tracking-wider font-mono">
                        Vaga Aberta
                      </p>
                    </div>

                    {/* HUGE VISUAL CARGO TITLE */}
                    <div className="py-3 select-all">
                      <h1 className="text-[41px] font-black text-[#151D24] tracking-tight leading-tight select-all drop-shadow-xs max-w-2xl mx-auto font-sans">
                        {cargoTitle || 'Vaga Sem Título'}
                      </h1>
                      {departamento && (
                        <span className="text-[13px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md inline-block mt-2 font-mono">
                          {departamento}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* TWO COLUMN GRID Layout of benefits & requirements */}
                  <div className="grid grid-cols-12 gap-10 my-6 flex-grow items-stretch">
                    
                    {/* Left Column: BENEFÍCIOS */}
                    <div className="col-span-6 flex flex-col justify-between border-r border-slate-150 pr-6 select-none">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-1 text-[#0D532F]">
                          <span className="text-base font-black uppercase tracking-wider font-sans border-b-[3px] border-emerald-600 pb-1">
                            Benefícios
                          </span>
                        </div>
                        
                        <ul className="space-y-2 leading-relaxed text-slate-800 text-[13px] font-sans antialiased">
                          {benefitsList.map((ben, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-emerald-700 mr-2 select-none shrink-0 text-sm font-black">•</span>
                              <span className="leading-snug">{ben}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column: DESEJÁVEL & LOCAL */}
                    <div className="col-span-6 flex flex-col justify-between pl-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-1 text-[#0D532F] select-none">
                          <span className="text-base font-black uppercase tracking-wider font-sans border-b-[3px] border-emerald-600 pb-1">
                            Desejável
                          </span>
                        </div>
                        
                        <ul className="space-y-2 text-slate-900 text-[13px] font-sans antialiased font-semibold leading-relaxed">
                          {requirementsList.map((req, i) => {
                            // Clean underlining if specified or match particular indicators in image
                            const shouldUnderline = req.toLowerCase().includes('experiência comprovada') || 
                                                    req.toLowerCase().includes('impostos') || 
                                                    req.toLowerCase().includes('sistema erp') || 
                                                    req.toLowerCase().includes('especificações de materiais');
                            return (
                              <li key={i} className="flex items-start">
                                <span className="text-emerald-700 mr-2 select-none shrink-0 text-sm font-black">•</span>
                                <span className={`leading-snug ${shouldUnderline ? 'underline decoration-slate-800 underline-offset-1 font-extrabold text-slate-950' : 'text-slate-800'}`}>
                                  {req}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Local information card at right column footer as per layout */}
                      <div className="mt-6 pt-4 border-t border-slate-150 select-none">
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                          Local
                        </p>
                        <p className="text-sm font-black text-slate-850 mt-1 flex items-center">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mr-1.5" />
                          {localizacao}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* BOTTOM FOOTER CALL-TO-ACTION AND EMAILS */}
                  <div className="border-t border-slate-200 pt-5 mt-auto text-center space-y-2 select-none shrink-0">
                    <p className="text-[11px] font-bold text-slate-650 tracking-wider uppercase">
                      Encaminhe seu currículo no e-mail
                    </p>
                    
                    {/* Display Email and WhatsApp details */}
                    <div className="flex flex-wrap items-center justify-center gap-x-2 text-[16px] font-black text-[#147B42]">
                      <span className="underline select-all text-emerald-850 font-sans tracking-wide">{emailContato}</span>
                      <span className="text-slate-400 font-normal">ou</span>
                      <span className="flex items-center text-slate-900 font-mono">
                        <span>Whatsapp {whatsappContato}</span>
                      </span>
                    </div>

                    <p className="text-[11px] font-black text-[#1c1d1e] tracking-widest uppercase mt-1.5">
                      {disclaimer}
                    </p>
                  </div>

                </div>

                {/* Green bottom small safety border */}
                <div className="w-full h-2 bg-[#0D532F] shrink-0" />
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
