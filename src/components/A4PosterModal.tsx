import React from 'react';
import { X, Printer, Download, Check, MapPin } from 'lucide-react';
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

const DEFAULT_BENEFITS = [
  'Cesta Natalidade (para recém-nascidos, pai e mãe);',
  'Convênio com Farmácias;',
  'Convênio com Ponto de Vendas Local; (Produtos com até 20% de desconto)',
  'Convênio Médico Coparticipação;',
  'Refeição na empresa;',
  'Seguro de Vida;',
  'Transporte Fretado;',
  'Vale Alimentação R$ 600,00 (acordo sindical).',
];

const DEFAULT_REQUIREMENTS = [
  'Bom relacionamento e trabalho em equipe;',
  'Boa comunicação, senso de organização e agilidade;',
  'Fácil adaptabilidade;',
  'Comprometimento, responsabilidade e pontualidade;',
  'Necessário experiência comprovada de acordo com a função.',
];

export default function A4PosterModal({ isOpen, onClose, vacancy }: A4PosterModalProps) {
  const [cargoTitle, setCargoTitle] = React.useState('');
  const [departamento, setDepartamento] = React.useState('');
  const [localizacao, setLocalizacao] = React.useState('');
  const [beneficiosText, setBeneficiosText] = React.useState(DEFAULT_BENEFITS.join('\n'));
  const [requisitosText, setRequisitosText] = React.useState(DEFAULT_REQUIREMENTS.join('\n'));
  const [emailContato, setEmailContato] = React.useState('rh@shigueno.com.br');
  const [whatsappContato, setWhatsappContato] = React.useState('(15) 99661-9119');
  const [disclaimer, setDisclaimer] = React.useState('PARA A VAGA PROPOSTA É NECESSÁRIO EXPERIÊNCIA COMPROVADA');
  const [zoomLevel, setZoomLevel] = React.useState(0.65);
  const [showCopied, setShowCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    if (vacancy) {
      setCargoTitle(vacancy.title || '');
      setDepartamento(vacancy.department || '');
      setLocalizacao(vacancy.location || 'Granja Nova - Tatuí');

      const reqs = vacancy.requirements
        ? vacancy.requirements.split(/[;,\n]+/).map(r => r.trim()).filter(Boolean)
        : [];
      const finalReqs = reqs.length > 0 ? reqs : DEFAULT_REQUIREMENTS;
      setRequisitosText(
        finalReqs.map(r => (r.endsWith(';') || r.endsWith('.') ? r : r + ';')).join('\n')
      );
    }
  }, [vacancy]);

  if (!isOpen || !vacancy) return null;

  const benefitsList = beneficiosText.split('\n').map(l => l.trim()).filter(Boolean);
  const requirementsList = requisitosText.split('\n').map(l => l.trim()).filter(Boolean);

  const handleDownloadPNG = async () => {
    const node = document.getElementById('print-a4-target');
    if (!node) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(node, {
        width: 794,
        height: 1123,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '794px',
          height: '1123px',
        },
      });
      const link = document.createElement('a');
      link.download = `Vaga_A4_${cargoTitle.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Falha ao exportar imagem. Use o botão "Imprimir / Salvar PDF" do navegador.');
    } finally {
      setIsExporting(false);
    }
  };

  const ZOOM_OPTIONS = [
    { label: '50%', value: 0.5 },
    { label: '65% (Padrão)', value: 0.65 },
    { label: '80%', value: 0.8 },
    { label: '100%', value: 1.0 },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans">
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-a4-root-wrapper {
            display: block !important; position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important; height: 100% !important;
            margin: 0 !important; padding: 0 !important; background: white !important;
          }
          #print-a4-target {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 210mm !important; height: 297mm !important;
            margin: 0 !important; padding: 0 !important; background: white !important;
            box-shadow: none !important; border: none !important; border-radius: 0 !important;
            transform: scale(1) !important; transform-origin: top left !important;
          }
        }
      `}</style>

      <div
        id="print-a4-root-wrapper"
        className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col"
        style={{ maxHeight: '95vh' }}
      >
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-100 bg-zinc-50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-800 text-[10px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                PDF Oficial A4
              </span>
              <span className="text-zinc-400 text-[10px]">• Layout de Divulgação Social</span>
            </div>
            <h2 className="text-sm font-black text-zinc-900">Gerador de Cartaz de Vaga (Formato A4 Corporativo)</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#147B42] hover:bg-[#0f5a31] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF (A4)
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60"
            >
              {showCopied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Processando…' : showCopied ? 'Baixado!' : 'Baixar Imagem PNG'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left: Settings */}
          <div className="w-[320px] shrink-0 bg-white border-r border-zinc-100 overflow-y-auto p-5 space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">Painel de Ajustes do Cartaz</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Altere os textos abaixo. O cartaz do lado direito mudará instantaneamente para o formato exato que será impresso ou baixado em redes sociais.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Título do Cargo', value: cargoTitle, set: setCargoTitle },
                { label: 'Unidade / Setor', value: departamento, set: setDepartamento, placeholder: 'Ex: Pecuária Nelore' },
                { label: 'Atuação / Local', value: localizacao, set: setLocalizacao },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Benefícios Oferecidos (um por linha)</label>
                <textarea
                  rows={7}
                  value={beneficiosText}
                  onChange={e => setBeneficiosText(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-[11px] font-mono text-zinc-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Desejável e Requisitos (um por linha)</label>
                <textarea
                  rows={6}
                  value={requisitosText}
                  onChange={e => setRequisitosText(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-[11px] font-mono text-zinc-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">E-mail Recrutamento</label>
                  <input
                    type="text"
                    value={emailContato}
                    onChange={e => setEmailContato(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-[10px] font-semibold text-zinc-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">WhatsApp Fichas</label>
                  <input
                    type="text"
                    value={whatsappContato}
                    onChange={e => setWhatsappContato(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 text-[10px] font-semibold text-zinc-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Texto do Rodapé (Alerta)</label>
                <input
                  type="text"
                  value={disclaimer}
                  onChange={e => setDisclaimer(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-[10px] font-semibold text-zinc-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {showCopied && (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                Download efetuado com sucesso!
              </div>
            )}
          </div>

          {/* Right: A4 Preview */}
          <div className="flex-1 bg-zinc-100 overflow-auto flex flex-col items-center py-6 gap-4">

            {/* Zoom selector */}
            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mr-1">Zoom do Cartaz A4:</span>
              {ZOOM_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setZoomLevel(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                    zoomLevel === opt.value
                      ? 'bg-[#147B42] text-white shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Scaled A4 poster */}
            <div
              style={{
                width: `${794 * zoomLevel}px`,
                height: `${1123 * zoomLevel}px`,
                transition: 'all 0.15s ease-out',
              }}
              className="relative shrink-0 rounded-xl shadow-2xl border border-zinc-300 overflow-hidden"
            >
              {/* ─────────────── A4 POSTER (794 × 1123 px) ─────────────── */}
              <div
                id="print-a4-target"
                style={{
                  width: '794px',
                  height: '1123px',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* ── HEADER ── */}
                <div style={{ position: 'relative', height: '210px', flexShrink: 0 }}>
                  {/* SVG header — fundo sólido + onda fluida na base */}
                  <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    viewBox="0 0 794 210"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Fundo principal verde escuro cobrindo tudo */}
                    <rect width="794" height="210" fill="#0D532F" />

                    {/* Camada de profundidade — gradiente suave no topo */}
                    <rect width="794" height="90" fill="#0a4525" opacity="0.4" />

                    {/* Onda principal — verde médio, cobre base inteira */}
                    <path
                      d="M0 145 C80 118, 180 168, 300 148 C420 128, 520 172, 640 152 C710 140, 760 155, 794 148 L794 210 L0 210 Z"
                      fill="#147B42"
                    />

                    {/* Onda secundária — mais clara, sobreposta */}
                    <path
                      d="M0 168 C60 155, 160 182, 280 165 C400 148, 500 188, 620 170 C700 158, 755 172, 794 165 L794 210 L0 210 Z"
                      fill="#1eb356"
                      opacity="0.5"
                    />

                    {/* Brilho sutil no canto direito para dar profundidade */}
                    <ellipse cx="720" cy="60" rx="120" ry="55" fill="#1eb356" opacity="0.12" />
                  </svg>

                  {/* Logo */}
                  <div style={{
                    position: 'absolute', left: '40px', top: '28px',
                    display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10,
                  }}>
                    <div style={{
                      width: '72px', height: '72px',
                      background: 'white', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
                      overflow: 'hidden', padding: '6px',
                    }}>
                      <img
                        src="/images/shigueno-logo.png"
                        alt="Shigueno"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <h1 style={{
                        fontSize: '38px', fontWeight: '900', color: 'white',
                        fontStyle: 'italic', lineHeight: 1, letterSpacing: '-1px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        fontFamily: 'Georgia, serif', margin: 0,
                      }}>
                        Shigueno
                      </h1>
                      <div style={{
                        width: '60px', height: '3px',
                        background: 'rgba(255,255,255,0.4)',
                        borderRadius: '99px', marginTop: '6px',
                      }} />
                    </div>
                  </div>

                  {/* People badge */}
                  <div style={{ position: 'absolute', right: '40px', top: '24px', zIndex: 10 }}>
                    <div style={{
                      width: '100px', height: '100px', background: 'white',
                      borderRadius: '50%', border: '4px solid #147B42',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
                    }}>
                      <svg width="70" height="70" viewBox="0 0 100 100">
                        <circle cx="30" cy="34" r="10" fill="none" stroke="#DE7358" strokeWidth="3.5" />
                        <path d="M12 68 C12 52, 48 52, 48 68" fill="none" stroke="#DE7358" strokeWidth="3.5" strokeLinecap="round" />
                        <circle cx="70" cy="34" r="10" fill="none" stroke="#DE5A43" strokeWidth="3.5" />
                        <path d="M52 68 C52 52, 88 52, 88 68" fill="none" stroke="#DE5A43" strokeWidth="3.5" strokeLinecap="round" />
                        <circle cx="50" cy="30" r="11" fill="none" stroke="#2563EB" strokeWidth="4" />
                        <path d="M28 70 C28 52, 72 52, 72 70" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── BODY ── */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  padding: '28px 48px 20px', gap: '0',
                }}>
                  {/* Call to action */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '5px', background: '#147B42', borderRadius: '3px',
                        marginRight: '16px', alignSelf: 'stretch', minHeight: '54px',
                      }} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{
                          fontSize: '16px', fontWeight: '900', color: '#0D532F',
                          letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 2px 0',
                        }}>
                          Estamos em busca de
                        </p>
                        <h2 style={{
                          fontSize: '30px', fontWeight: '900', color: '#1a1a1a',
                          letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 1.1, margin: 0,
                        }}>
                          Novos Talentos
                        </h2>
                      </div>
                    </div>

                    <div style={{ marginTop: '14px' }}>
                      <p style={{
                        fontSize: '18px', fontWeight: '900', color: '#1c1d1e',
                        letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 6px 0',
                      }}>
                        Estamos Contratando
                      </p>
                      <span style={{
                        fontSize: '12px', fontWeight: '800', color: '#147B42',
                        background: '#ecfdf5', border: '1px solid #a7f3d0',
                        borderRadius: '999px', padding: '4px 18px',
                        letterSpacing: '2px', textTransform: 'uppercase', display: 'inline-block',
                      }}>
                        Vaga Aberta
                      </span>
                    </div>

                    {/* Job title */}
                    <div style={{ marginTop: '16px' }}>
                      <h1 style={{
                        fontSize: cargoTitle.length > 30 ? '32px' : '40px',
                        fontWeight: '900', color: '#111827',
                        letterSpacing: '-1px', lineHeight: 1.1, margin: 0,
                      }}>
                        {cargoTitle || 'Título da Vaga'}
                      </h1>
                      {departamento && (
                        <p style={{
                          fontSize: '12px', fontWeight: '800', color: '#6b7280',
                          textTransform: 'uppercase', letterSpacing: '3px',
                          marginTop: '6px', background: '#f4f4f5',
                          display: 'inline-block', padding: '3px 14px', borderRadius: '6px', margin: '6px 0 0 0',
                        }}>
                          {departamento}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0 16px' }} />

                  {/* Two columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
                    {/* Benefícios */}
                    <div style={{ paddingRight: '28px', borderRight: '1px solid #e5e7eb' }}>
                      <p style={{
                        fontSize: '13px', fontWeight: '900', color: '#0D532F',
                        textTransform: 'uppercase', letterSpacing: '2px',
                        borderBottom: '3px solid #147B42', paddingBottom: '5px',
                        marginBottom: '14px', margin: '0 0 14px 0',
                      }}>
                        Benefícios
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {benefitsList.map((ben, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>
                            <span style={{ color: '#147B42', fontWeight: '900', fontSize: '14px', lineHeight: 1, marginTop: '1px', flexShrink: 0 }}>•</span>
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Desejável */}
                    <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{
                          fontSize: '13px', fontWeight: '900', color: '#0D532F',
                          textTransform: 'uppercase', letterSpacing: '2px',
                          borderBottom: '3px solid #147B42', paddingBottom: '5px',
                          margin: '0 0 14px 0',
                        }}>
                          Desejável
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {requirementsList.map((req, i) => {
                            const bold =
                              req.toLowerCase().includes('experiência comprovada') ||
                              req.toLowerCase().includes('impostos') ||
                              req.toLowerCase().includes('sistema erp') ||
                              req.toLowerCase().includes('especificações de materiais');
                            return (
                              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', lineHeight: 1.4 }}>
                                <span style={{ color: '#147B42', fontWeight: '900', fontSize: '14px', lineHeight: 1, marginTop: '1px', flexShrink: 0 }}>•</span>
                                <span style={{
                                  fontWeight: bold ? '800' : '600',
                                  textDecoration: bold ? 'underline' : 'none',
                                  color: bold ? '#111827' : '#111827',
                                }}>
                                  {req}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Local */}
                      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '10px', fontWeight: '900', color: '#147B42', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px 0' }}>
                          Local
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#147B42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <p style={{ fontSize: '13px', fontWeight: '800', color: '#1f2937', margin: 0 }}>{localizacao}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={{
                  background: '#f9fafb', borderTop: '2px solid #e5e7eb',
                  padding: '16px 48px', textAlign: 'center', flexShrink: 0,
                }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px 0' }}>
                    Encaminhe seu currículo no e-mail
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#147B42', textDecoration: 'underline' }}>{emailContato}</span>
                    <span style={{ color: '#9ca3af' }}>ou</span>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#1f2937' }}>Whatsapp {whatsappContato}</span>
                  </div>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: '#1c1d1e', textTransform: 'uppercase', letterSpacing: '2px', margin: '8px 0 0 0' }}>
                    {disclaimer}
                  </p>
                </div>

                {/* Green bottom border */}
                <div style={{ height: '8px', background: '#0D532F', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
