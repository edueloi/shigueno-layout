import React from 'react';
import { X, Printer, Download, Check, FileText, Palette } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Button } from './ui';

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

// ── Dados compartilhados pelos templates ──────────────────────────────────────
interface TemplateProps {
  cargoTitle: string;
  departamento: string;
  localizacao: string;
  benefitsList: string[];
  requirementsList: string[];
  emailContato: string;
  whatsappContato: string;
  disclaimer: string;
}

type TemplateKey = 'classico' | 'premium' | 'minimal';

const TEMPLATES: Array<{ key: TemplateKey; label: string; hint: string; swatch: string }> = [
  { key: 'classico', label: 'Clássico',       hint: 'Onda verde oficial',      swatch: 'bg-gradient-to-br from-[#0D532F] to-[#1eb356]' },
  { key: 'premium',  label: 'Premium Escuro', hint: 'Verde profundo + dourado', swatch: 'bg-gradient-to-br from-[#06150c] to-amber-500' },
  { key: 'minimal',  label: 'Minimal Claro',  hint: 'Branco clean + âmbar',     swatch: 'bg-gradient-to-br from-white to-amber-200 border border-slate-200' },
];

// ── TEMPLATE 1: Clássico (onda verde) ────────────────────────────────────────
function ClassicTemplate({ cargoTitle, departamento, localizacao, benefitsList, requirementsList, emailContato, whatsappContato, disclaimer }: TemplateProps) {
  return (
    <div style={{ width: '794px', height: '1123px', fontFamily: "'Helvetica Neue', Arial, sans-serif", background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* HEADER */}
      <div style={{ position: 'relative', height: '210px', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 794 210" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="794" height="210" fill="#0D532F" />
          <rect width="794" height="90" fill="#0a4525" opacity="0.4" />
          <path d="M0 145 C80 118, 180 168, 300 148 C420 128, 520 172, 640 152 C710 140, 760 155, 794 148 L794 210 L0 210 Z" fill="#147B42" />
          <path d="M0 168 C60 155, 160 182, 280 165 C400 148, 500 188, 620 170 C700 158, 755 172, 794 165 L794 210 L0 210 Z" fill="#1eb356" opacity="0.5" />
          <ellipse cx="720" cy="60" rx="120" ry="55" fill="#1eb356" opacity="0.12" />
        </svg>
        <div style={{ position: 'absolute', left: '40px', top: '28px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
          <div style={{ width: '72px', height: '72px', background: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.28)', overflow: 'hidden', padding: '6px' }}>
            <img src="/images/shigueno-logo.png" alt="Shigueno" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '38px', fontWeight: 900, color: 'white', fontStyle: 'italic', lineHeight: 1, letterSpacing: '-1px', textShadow: '0 2px 8px rgba(0,0,0,0.35)', fontFamily: 'Georgia, serif', margin: 0 }}>Shigueno</h1>
            <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.4)', borderRadius: '99px', marginTop: '6px' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', right: '40px', top: '24px', zIndex: 10 }}>
          <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%', border: '4px solid #147B42', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(0,0,0,0.2)' }}>
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

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'flex-start' }}>
            <div style={{ width: '5px', background: '#147B42', borderRadius: '3px', marginRight: '16px', alignSelf: 'stretch', minHeight: '54px' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '16px', fontWeight: 900, color: '#0D532F', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 2px 0' }}>Estamos em busca de</p>
              <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 1.1, margin: 0 }}>Novos Talentos</h2>
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <p style={{ fontSize: '18px', fontWeight: 900, color: '#1c1d1e', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Estamos Contratando</p>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#147B42', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '999px', padding: '4px 18px', letterSpacing: '2px', textTransform: 'uppercase', display: 'inline-block' }}>Vaga Aberta</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <h1 style={{ fontSize: cargoTitle.length > 30 ? '32px' : '40px', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1, margin: 0 }}>{cargoTitle || 'Título da Vaga'}</h1>
            {departamento && (
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '3px', background: '#f4f4f5', display: 'inline-block', padding: '3px 14px', borderRadius: '6px', margin: '6px 0 0 0' }}>{departamento}</p>
            )}
          </div>
        </div>

        <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0 16px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
          <div style={{ paddingRight: '28px', borderRight: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '13px', fontWeight: 900, color: '#0D532F', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '3px solid #147B42', paddingBottom: '5px', margin: '0 0 14px 0' }}>Benefícios</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {benefitsList.map((ben, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>
                  <span style={{ color: '#147B42', fontWeight: 900, fontSize: '14px', lineHeight: 1, marginTop: '1px', flexShrink: 0 }}>•</span>
                  <span>{ben}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 900, color: '#0D532F', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '3px solid #147B42', paddingBottom: '5px', margin: '0 0 14px 0' }}>Desejável</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requirementsList.map((req, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', lineHeight: 1.4 }}>
                    <span style={{ color: '#147B42', fontWeight: 900, fontSize: '14px', lineHeight: 1, marginTop: '1px', flexShrink: 0 }}>•</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '10px', fontWeight: 900, color: '#147B42', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px 0' }}>Local</p>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#1f2937', margin: 0 }}>📍 {localizacao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb', padding: '16px 48px', textAlign: 'center', flexShrink: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 6px 0' }}>Encaminhe seu currículo no e-mail</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#147B42', textDecoration: 'underline' }}>{emailContato}</span>
          <span style={{ color: '#9ca3af' }}>ou</span>
          <span style={{ fontSize: '15px', fontWeight: 900, color: '#1f2937' }}>Whatsapp {whatsappContato}</span>
        </div>
        <p style={{ fontSize: '10px', fontWeight: 900, color: '#1c1d1e', textTransform: 'uppercase', letterSpacing: '2px', margin: '8px 0 0 0' }}>{disclaimer}</p>
      </div>
      <div style={{ height: '8px', background: '#0D532F', flexShrink: 0 }} />
    </div>
  );
}

// ── TEMPLATE 2: Premium Escuro (verde profundo + dourado) ────────────────────
function PremiumTemplate({ cargoTitle, departamento, localizacao, benefitsList, requirementsList, emailContato, whatsappContato, disclaimer }: TemplateProps) {
  const gold = '#fbbf24';
  const goldDark = '#d97706';
  return (
    <div style={{ width: '794px', height: '1123px', fontFamily: "'Helvetica Neue', Arial, sans-serif", background: 'linear-gradient(160deg, #06150c 0%, #0a2316 55%, #0d3320 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Brilhos decorativos */}
      <div style={{ position: 'absolute', top: '-90px', right: '-90px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.13) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '120px', left: '-110px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />

      {/* Filete dourado superior */}
      <div style={{ height: '10px', background: `linear-gradient(90deg, ${goldDark}, ${gold}, ${goldDark})`, flexShrink: 0 }} />

      {/* HEADER */}
      <div style={{ padding: '36px 52px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '78px', height: '78px', background: 'rgba(255,255,255,0.06)', border: `2px dashed rgba(251,191,36,0.6)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <img src="/images/shigueno-logo.png" alt="Shigueno" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: gold, textTransform: 'uppercase', letterSpacing: '5px', margin: 0, lineHeight: 1 }}>Grupo Shigueno</h1>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '4px', margin: '7px 0 0 0' }}>Qualidade de vida desde 1932</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#06150c', background: gold, borderRadius: '999px', padding: '7px 20px', letterSpacing: '2.5px', textTransform: 'uppercase', display: 'inline-block', boxShadow: '0 6px 20px rgba(251,191,36,0.3)' }}>
            Vaga Aberta
          </span>
        </div>
      </div>

      {/* TITULO */}
      <div style={{ textAlign: 'center', padding: '42px 52px 30px', position: 'relative' }}>
        <p style={{ fontSize: '15px', fontWeight: 900, color: '#6ee7b7', letterSpacing: '6px', textTransform: 'uppercase', margin: '0 0 14px 0' }}>Estamos Contratando</p>
        <h1 style={{ fontSize: cargoTitle.length > 30 ? '40px' : '52px', fontWeight: 900, color: 'white', letterSpacing: '-1px', lineHeight: 1.05, margin: 0, textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
          {cargoTitle || 'Título da Vaga'}
        </h1>
        {departamento && (
          <p style={{ fontSize: '12px', fontWeight: 800, color: gold, textTransform: 'uppercase', letterSpacing: '4px', border: `1px solid rgba(251,191,36,0.4)`, display: 'inline-block', padding: '6px 22px', borderRadius: '999px', margin: '18px 0 0 0', background: 'rgba(251,191,36,0.07)' }}>
            {departamento}
          </p>
        )}
        <div style={{ width: '90px', height: '3px', background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '26px auto 0' }} />
      </div>

      {/* COLUNAS */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px', padding: '0 52px', position: 'relative' }}>
        {[{ title: 'Benefícios', items: benefitsList }, { title: 'Desejável', items: requirementsList }].map(({ title, items }) => (
          <div key={title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(110,231,183,0.18)', borderRadius: '20px', padding: '22px 24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 900, color: gold, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 16px 0', paddingBottom: '10px', borderBottom: '1px solid rgba(251,191,36,0.25)' }}>{title}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '12px', color: '#d1fae5', lineHeight: 1.45, fontWeight: 500 }}>
                  <span style={{ color: gold, fontWeight: 900, fontSize: '11px', lineHeight: 1.6, flexShrink: 0 }}>◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* LOCAL */}
      <div style={{ textAlign: 'center', padding: '24px 52px 8px', position: 'relative' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(110,231,183,0.25)', borderRadius: '999px', padding: '8px 26px', display: 'inline-block' }}>
          📍 <span style={{ color: '#6ee7b7', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '10px', marginRight: '8px' }}>Local</span>{localizacao}
        </span>
      </div>

      {/* FOOTER dourado */}
      <div style={{ margin: '20px 52px 0', background: `linear-gradient(90deg, ${goldDark}, ${gold})`, borderRadius: '20px 20px 0 0', padding: '20px 30px', textAlign: 'center', flexShrink: 0 }}>
        <p style={{ fontSize: '10px', fontWeight: 900, color: '#06150c', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 6px 0', opacity: 0.75 }}>Encaminhe seu currículo</p>
        <p style={{ fontSize: '17px', fontWeight: 900, color: '#06150c', margin: 0 }}>
          {emailContato} <span style={{ opacity: 0.5, fontWeight: 700 }}>|</span> WhatsApp {whatsappContato}
        </p>
        <p style={{ fontSize: '9px', fontWeight: 900, color: '#06150c', textTransform: 'uppercase', letterSpacing: '2px', margin: '8px 0 0 0', opacity: 0.7 }}>{disclaimer}</p>
      </div>
    </div>
  );
}

// ── TEMPLATE 3: Minimal Claro (branco + âmbar) ───────────────────────────────
function MinimalTemplate({ cargoTitle, departamento, localizacao, benefitsList, requirementsList, emailContato, whatsappContato, disclaimer }: TemplateProps) {
  return (
    <div style={{ width: '794px', height: '1123px', fontFamily: "'Helvetica Neue', Arial, sans-serif", background: '#ffffff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Filete âmbar */}
      <div style={{ height: '12px', background: '#f59e0b', flexShrink: 0 }} />

      {/* HEADER centrado */}
      <div style={{ textAlign: 'center', padding: '44px 60px 0' }}>
        <img src="/images/shigueno-logo.png" alt="Shigueno" style={{ width: '84px', height: '84px', objectFit: 'contain', margin: '0 auto' }} />
        <p style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '7px', margin: '16px 0 0 0' }}>Grupo Shigueno</p>
        <div style={{ width: '46px', height: '2px', background: '#f59e0b', margin: '18px auto 0' }} />
      </div>

      {/* TÍTULO */}
      <div style={{ textAlign: 'center', padding: '40px 60px 36px' }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '999px', padding: '6px 22px', letterSpacing: '3px', textTransform: 'uppercase', display: 'inline-block' }}>
          Estamos Contratando
        </span>
        <h1 style={{ fontSize: cargoTitle.length > 30 ? '42px' : '54px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1.05, margin: '22px 0 0 0' }}>
          {cargoTitle || 'Título da Vaga'}
        </h1>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px', margin: '14px 0 0 0' }}>
          {departamento}{departamento && localizacao ? '  ·  ' : ''}{localizacao}
        </p>
      </div>

      <div style={{ height: '1px', background: '#e2e8f0', margin: '0 60px' }} />

      {/* COLUNAS */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '36px 60px 0' }}>
        {[{ title: 'O que oferecemos', items: benefitsList }, { title: 'O que buscamos', items: requirementsList }].map(({ title, items }) => (
          <div key={title}>
            <p style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '22px', height: '2px', background: '#f59e0b', display: 'inline-block' }} />
              {title}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                  <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '13px', lineHeight: 1.4, flexShrink: 0 }}>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '28px 60px 34px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '24px' }} />
        <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 8px 0' }}>Candidate-se agora</p>
        <p style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
          <span style={{ color: '#b45309' }}>{emailContato}</span>
          <span style={{ color: '#cbd5e1', margin: '0 12px' }}>•</span>
          WhatsApp {whatsappContato}
        </p>
        <p style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', margin: '12px 0 0 0' }}>{disclaimer}</p>
      </div>
      <div style={{ height: '12px', background: '#0f172a', flexShrink: 0 }} />
    </div>
  );
}

// ── MODAL PRINCIPAL ───────────────────────────────────────────────────────────
export default function A4PosterModal({ isOpen, onClose, vacancy }: A4PosterModalProps) {
  const [template, setTemplate] = React.useState<TemplateKey>('classico');
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
  const [isExporting, setIsExporting] = React.useState<false | 'png' | 'pdf'>(false);

  React.useEffect(() => {
    if (vacancy) {
      setCargoTitle(vacancy.title || '');
      setDepartamento(vacancy.department || '');
      setLocalizacao(vacancy.location || 'Granja Nova - Tatuí');
      const reqs = vacancy.requirements
        ? vacancy.requirements.split(/[;,\n]+/).map(r => r.trim()).filter(Boolean)
        : [];
      const finalReqs = reqs.length > 0 ? reqs : DEFAULT_REQUIREMENTS;
      setRequisitosText(finalReqs.map(r => (r.endsWith(';') || r.endsWith('.') ? r : r + ';')).join('\n'));
    }
  }, [vacancy]);

  if (!isOpen || !vacancy) return null;

  const templateProps: TemplateProps = {
    cargoTitle, departamento, localizacao,
    benefitsList: beneficiosText.split('\n').map(l => l.trim()).filter(Boolean),
    requirementsList: requisitosText.split('\n').map(l => l.trim()).filter(Boolean),
    emailContato, whatsappContato, disclaimer,
  };

  const capturePoster = async () => {
    const node = document.getElementById('print-a4-target');
    if (!node) throw new Error('Cartaz não encontrado');
    return toPng(node, {
      width: 794,
      height: 1123,
      pixelRatio: 2,
      cacheBust: true,
      style: { transform: 'scale(1)', transformOrigin: 'top left', width: '794px', height: '1123px' },
    });
  };

  const flagDone = () => {
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 3000);
  };

  const handleDownloadPNG = async () => {
    try {
      setIsExporting('png');
      const dataUrl = await capturePoster();
      const link = document.createElement('a');
      link.download = `Cartaz_Vaga_${cargoTitle.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      flagDone();
    } catch (err) {
      console.error(err);
      alert('Falha ao exportar imagem. Use o botão "Imprimir" do navegador.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExporting('pdf');
      const dataUrl = await capturePoster();
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      pdf.save(`Cartaz_Vaga_${cargoTitle.replace(/\s+/g, '_')}.pdf`);
      flagDone();
    } catch (err) {
      console.error(err);
      alert('Falha ao gerar PDF. Use o botão "Imprimir" do navegador.');
    } finally {
      setIsExporting(false);
    }
  };

  const ZOOM_OPTIONS = [
    { label: '50%', value: 0.5 },
    { label: '65%', value: 0.65 },
    { label: '80%', value: 0.8 },
    { label: '100%', value: 1.0 },
  ];

  const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto font-sans">
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
        style={{ maxHeight: '96vh' }}
      >
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-zinc-100 bg-zinc-50 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-800 text-[10px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Cartaz A4</span>
              <span className="text-zinc-400 text-[10px] hidden sm:inline">• 3 layouts · PNG · PDF · Impressão</span>
            </div>
            <h2 className="text-sm font-black text-zinc-900 truncate">Gerador de Cartaz de Vaga</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()} className="hidden sm:inline-flex">
              Imprimir
            </Button>
            <Button variant="secondary" size="sm" icon={showCopied ? Check : Download} loading={isExporting === 'png'} onClick={handleDownloadPNG}>
              PNG
            </Button>
            <Button variant="gold" size="sm" icon={showCopied ? Check : FileText} loading={isExporting === 'pdf'} onClick={handleDownloadPDF}>
              Baixar PDF
            </Button>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* Painel de ajustes */}
          <div className="w-full lg:w-[330px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-zinc-100 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[38vh] lg:max-h-none">
            {/* Seletor de layout */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />Estilo do Cartaz
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTemplate(t.key)}
                    className={`rounded-xl p-2 border-2 transition-all cursor-pointer text-center ${
                      template === t.key ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-zinc-150 hover:border-zinc-300'
                    }`}
                    title={t.hint}
                  >
                    <div className={`h-10 rounded-lg ${t.swatch} mb-1.5`} />
                    <p className={`text-[8px] font-black uppercase leading-tight ${template === t.key ? 'text-emerald-800' : 'text-zinc-500'}`}>{t.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Título do Cargo', value: cargoTitle, set: setCargoTitle },
                { label: 'Unidade / Setor', value: departamento, set: setDepartamento, placeholder: 'Ex: Pecuária Nelore' },
                { label: 'Atuação / Local', value: localizacao, set: setLocalizacao },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
                  <input type="text" value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className={inputCls} />
                </div>
              ))}

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Benefícios Oferecidos (um por linha)</label>
                <textarea rows={6} value={beneficiosText} onChange={e => setBeneficiosText(e.target.value)}
                  className={`${inputCls} text-[11px] font-mono resize-none leading-relaxed`} />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Desejável e Requisitos (um por linha)</label>
                <textarea rows={5} value={requisitosText} onChange={e => setRequisitosText(e.target.value)}
                  className={`${inputCls} text-[11px] font-mono resize-none leading-relaxed`} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">E-mail Recrutamento</label>
                  <input type="text" value={emailContato} onChange={e => setEmailContato(e.target.value)} className={`${inputCls} text-[10px]`} />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">WhatsApp Fichas</label>
                  <input type="text" value={whatsappContato} onChange={e => setWhatsappContato(e.target.value)} className={`${inputCls} text-[10px]`} />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Texto do Rodapé (Alerta)</label>
                <input type="text" value={disclaimer} onChange={e => setDisclaimer(e.target.value)} className={`${inputCls} text-[10px]`} />
              </div>
            </div>

            {showCopied && (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                Download efetuado com sucesso!
              </div>
            )}
          </div>

          {/* Preview A4 */}
          <div className="flex-1 bg-zinc-100 overflow-auto flex flex-col items-center py-4 sm:py-6 gap-4">
            {/* Zoom */}
            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mr-1 hidden sm:inline">Zoom:</span>
              {ZOOM_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setZoomLevel(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                    zoomLevel === opt.value ? 'bg-[#147B42] text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-100'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Cartaz escalado */}
            <div
              style={{ width: `${794 * zoomLevel}px`, height: `${1123 * zoomLevel}px`, transition: 'all 0.15s ease-out' }}
              className="relative shrink-0 rounded-xl shadow-2xl border border-zinc-300 overflow-hidden"
            >
              <div
                id="print-a4-target"
                style={{
                  width: '794px', height: '1123px',
                  transform: `scale(${zoomLevel})`, transformOrigin: 'top left',
                  position: 'absolute', top: 0, left: 0,
                }}
              >
                {template === 'classico' && <ClassicTemplate {...templateProps} />}
                {template === 'premium' && <PremiumTemplate {...templateProps} />}
                {template === 'minimal' && <MinimalTemplate {...templateProps} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
