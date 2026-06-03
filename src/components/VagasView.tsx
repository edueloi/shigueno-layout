import React from 'react';
import { Briefcase, MapPin, FileText, ChevronRight, CheckCircle, Clock, Paperclip, X } from 'lucide-react';
import { Vacancy } from '../types';
import { useLanguage } from '../LanguageContext';

interface VagasViewProps {
  onNavigate: (view: string) => void;
}

export default function VagasView({ onNavigate }: VagasViewProps) {
  const { language } = useLanguage();
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVacancy, setSelectedVacancy] = React.useState<Vacancy | null>(null);
  
  // Form State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cvText, setCvText] = React.useState('');
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submittedMessage, setSubmittedMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const localizedTexts = {
    pt: {
      bannerTag: "Trabalhe Conosco",
      bannerTitle: "Oportunidades que Plantam o Amanhã",
      bannerDesc: "Seja na Citricultura em Buri, na Cafeicultura em Itaí, na Postura de Ovos em Tatuí, ou na criação de gado Nelore em Leverger-MT, a Shigueno busca profissionais que partilham do amor pela terra e pelo trabalho bem-feito.",
      successTitle: "Inscrição Efetuada com Sucesso!",
      successDesc: "Nosso departamento de Recursos Humanos em Tatuí-SP revisará as informações de sua experiência e entrará em contato em caso de sinergia com o perfil.",
      btnOther: "Ver Outras Vagas",
      btnHome: "Voltar ao Início",
      listTitle: "Vagas de Força Aberta",
      listSubtitle: "Selecione uma vaga para expandir os requisitos e enviar seu currículo.",
      activeLabel: "ativas",
      loadingText: "Buscando vagas no banco de dados de Tatuí...",
      cardCta: "Consulte e Candidate-se",
      noVacanciesTitle: "Sem vagas específicas publicadas no momento.",
      noVacanciesDesc: "Mesmo sem vagas abertas, você pode enviar seu currículo espontâneo. Ele ficará em destaque em nosso banco de dados no painel do administrador da Shigueno.",
      btnSpontaneous: "Criar Candidatura Espontânea",
      spontaneousTitle: "Banco de Talentos / Envio Espontâneo",
      spontaneousDept: "Geral",
      spontaneousDesc: "Envie seus dados para cadastro reserva e futuras oportunidades em qualquer um de nossos setores (Postura, Citrus, Café ou Nelore MT).",
      spontaneousLoc: "Tatuí-SP ou Leverger-MT",
      spontaneousReq: "Interesse genuíno no agronegócio e disposição para aprender e crescer com a família Shigueno.",
      closeBtn: "Fechar [X]",
      applyingFor: "Você está se candidatando para:",
      reqTitle: "Requisitos Exigidos:",
      formTitle: "Ficha de Inscrição Unificada",
      fieldName: "Nome Completo *",
      fieldEmail: "E-mail para Contato *",
      fieldPhone: "Telefone WhatsApp *",
      fieldCv: "Resumo Curricular / Experiência *",
      fieldCvHelp: "Copie e cole suas experiências aqui",
      cvPlaceholder: "Descreva brevemente onde trabalhou, maquinários que opera, fazendas onde trabalhou ou referências de trabalhos rurais anteriores...",
      fieldFile: "Anexar Currículo (PDF, DOC, DOCX)",
      fieldFileBtn: "Clique para anexar arquivo",
      fieldFileHelp: "Opcional · Máx. 10 MB",
      fieldFileRemove: "Remover arquivo",
      sending: "Enviando Ficha...",
      submitBtn: "Enviar Currículo para o RH",
      securityNote: "* Seus dados serão transmitidos de forma segura diretamente para o banco de dados do painel do Gestor Shigueno.",
      alertFields: "Por favor, preencha todos os campos obrigatórios.",
      alertError: "Erro ao enviar candidatura: ",
      alertConnection: "Erro de conexão ao enviar currículo."
    },
    en: {
      bannerTag: "Work with Us",
      bannerTitle: "Opportunities that Plant Tomorrow",
      bannerDesc: "Whether in Citrus in Buri, Coffee in Itaí, Eggs in Tatuí, or Nelore cattle in Leverger-MT, Shigueno seeks professionals who share a love for the land and for a job well done.",
      successTitle: "Registration Completed Successfully!",
      successDesc: "Our Human Resources department in Tatuí-SP will review your experience information and will contact you if there is synergy with the profile.",
      btnOther: "See Other Positions",
      btnHome: "Back to Home",
      listTitle: "Open Positions",
      listSubtitle: "Select a position to expand requirements and submit your resume.",
      activeLabel: "active",
      loadingText: "Searching job vacancies in Tatuí database...",
      cardCta: "Check Details & Apply",
      noVacanciesTitle: "No specific vacancies posted at the moment.",
      noVacanciesDesc: "Even without open vacancies, you can send a spontaneous resume. It will be highlighted in our database on Shigueno's administration panel.",
      btnSpontaneous: "Submit General Application",
      spontaneousTitle: "Talent Pool / Spontaneous Submission",
      spontaneousDept: "General",
      spontaneousDesc: "Send your details for future opportunities in any of our sectors (Eggs, Citrus, Coffee or Nelore MT).",
      spontaneousLoc: "Tatuí-SP or Leverger-MT",
      spontaneousReq: "Genuine interest in agribusiness and willingness to learn and grow with the Shigueno family.",
      closeBtn: "Close [X]",
      applyingFor: "You are applying for:",
      reqTitle: "Required Profile:",
      formTitle: "Unified Registration Form",
      fieldName: "Full Name *",
      fieldEmail: "Contact Email *",
      fieldPhone: "WhatsApp Phone *",
      fieldCv: "Resume Summary / Experience *",
      fieldCvHelp: "Copy and paste your professional background here",
      cvPlaceholder: "Briefly describe your past jobs, machinery you operate, farms you worked on, or previous agricultural references...",
      fieldFile: "Attach Resume (PDF, DOC, DOCX)",
      fieldFileBtn: "Click to attach file",
      fieldFileHelp: "Optional · Max 10 MB",
      fieldFileRemove: "Remove file",
      sending: "Submitting Form...",
      submitBtn: "Send Resume to HR",
      securityNote: "* Your data will be securely transmitted directly to Shigueno's admin dashboard database.",
      alertFields: "Please fill in all required fields.",
      alertError: "Error sending application: ",
      alertConnection: "Connection error while submitting resume."
    },
    es: {
      bannerTag: "Trabaje con Nosotros",
      bannerTitle: "Oportunidades que Siembran el Mañana",
      bannerDesc: "Ya sea en la Citricultura en Buri, la Caficultura en Itaí, la Postura de huevos en Tatuí, o la ganadería Nelore en Leverger-MT, Shigueno busca profesionales que compartan el amor por la tierra y el trabajo bien hecho.",
      successTitle: "¡Inscripción Realizada con Éxito!",
      successDesc: "Nuestro departamento de Recursos Humanos en Tatuí-SP revisará su información laboral y se pondrá en contacto en caso de sinergia con el perfil.",
      btnOther: "Ver Otras Vacantes",
      btnHome: "Volver al Inicio",
      listTitle: "Vacantes Abiertas",
      listSubtitle: "Seleccione una vacante para ampliar los requisitos y enviar su currículum.",
      activeLabel: "activas",
      loadingText: "Buscando vacantes en la base de datos de Tatuí...",
      cardCta: "Consulte y Postúlese",
      noVacanciesTitle: "No hay vacantes específicas publicadas en este momento.",
      noVacanciesDesc: "Incluso sin vacantes abiertas, puede enviar su currículum espontáneo. Quedará registrado en nuestra base de datos en el panel del administrador de Shigueno.",
      btnSpontaneous: "Crear Candidatura Espontánea",
      spontaneousTitle: "Banco de Talentos / Envío Espontáneo",
      spontaneousDept: "General",
      spontaneousDesc: "Envíe sus datos para el registro de reserva y futuras oportunidades en cualquiera de nuestros sectores (Postura, Citrus, Café o Nelore MT).",
      spontaneousLoc: "Tatuí-SP o Leverger-MT",
      spontaneousReq: "Interés genuino en el agronegocio y disposición para aprender y crecer con la familia Shigueno.",
      closeBtn: "Cerrar [X]",
      applyingFor: "Se está postulando para:",
      reqTitle: "Requisitos Exigidos:",
      formTitle: "Ficha de Insciption Unificada",
      fieldName: "Nombre Completo *",
      fieldEmail: "E-mail de Contacto *",
      fieldPhone: "Teléfono WhatsApp *",
      fieldCv: "Resumen de Currículum / Experiencia *",
      fieldCvHelp: "Copie y pegue sus experiencias aquí",
      cvPlaceholder: "Describa brevemente dónde trabajó, qué maquinarias opera, granjas donde trabajó o referencias de trabajos agrícolas anteriores...",
      fieldFile: "Adjuntar Currículum (PDF, DOC, DOCX)",
      fieldFileBtn: "Haga clic para adjuntar archivo",
      fieldFileHelp: "Opcional · Máx. 10 MB",
      fieldFileRemove: "Eliminar archivo",
      sending: "Enviando Ficha...",
      submitBtn: "Enviar Currículum a Recursos Humanos",
      securityNote: "* Sus datos se transmitirán de forma segura directamente a la base de datos del panel de administración de Shigueno.",
      alertFields: "Por favor, complete todos los campos obligatorios.",
      alertError: "Error al enviar la postulación: ",
      alertConnection: "Error de conexión al enviar el currículum."
    }
  };

  const tView = localizedTexts[language] || localizedTexts['pt'];

  React.useEffect(() => {
    fetchActiveVacancies();
  }, []);

  const fetchActiveVacancies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vacancies?active=true');
      const data = await res.json();
      if (data.success) {
        setVacancies(data.vacancies || []);
      }
    } catch (e) {
      console.error('Erro ao listar vagas:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !cvText) {
      alert(tView.alertFields);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('cv_text', cvText);
      if (selectedVacancy?.id) formData.append('vacancy_id', String(selectedVacancy.id));
      if (cvFile) formData.append('cv_file', cvFile);

      const response = await fetch('/api/candidates', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setSubmittedMessage(data.message || tView.successTitle);
        setName(''); setEmail(''); setPhone(''); setCvText(''); setCvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(tView.alertError + data.message);
      }
    } catch (err) {
      console.error(err);
      alert(tView.alertConnection);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in" id="careers-portal">
      
      {/* Careers Banner */}
      <div className="bg-emerald-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden mb-12 shadow-sm border border-emerald-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fca510_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">{tView.bannerTag}</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{tView.bannerTitle}</h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            {tView.bannerDesc}
          </p>
        </div>
      </div>

      {submittedMessage ? (
        <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4 shadow-sm animate-fade-in">
          <CheckCircle className="w-16 h-16 text-emerald-700 mx-auto" />
          <h2 className="text-2xl font-extrabold text-emerald-900">{tView.successTitle}</h2>
          <p className="text-sm text-slate-650 leading-relaxed">
            {tView.successDesc}
          </p>
          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={() => {
                setSubmittedMessage(null);
                setSelectedVacancy(null);
                fetchActiveVacancies();
              }}
              className="bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-900 transition-all font-sans cursor-pointer"
            >
              {tView.btnOther}
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="bg-white border border-slate-300 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-slate-50 transition-all font-sans cursor-pointer"
            >
              {tView.btnHome}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Vacancy lists Column */}
          <div className={`${selectedVacancy ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6 transition-all duration-350`}>
            <div className="border-b border-slate-150 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-sans">{tView.listTitle}</h2>
                <p className="text-xs text-slate-500 font-sans">{tView.listSubtitle}</p>
              </div>
              <span className="text-xs font-bold text-emerald-850 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 font-sans">
                {vacancies.length} {tView.activeLabel}
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm italic font-sans animate-pulse">
                {tView.loadingText}
              </div>
            ) : vacancies.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {vacancies.map((v) => (
                  <div
                    key={v.id}
                    id={`vacancy-card-${v.id}`}
                    onClick={() => {
                      setSelectedVacancy(v);
                      // Smooth scroll candidate form area on small screens
                      if (window.innerWidth < 1024) {
                        setTimeout(() => {
                           const el = document.getElementById('application-form-panel');
                           el?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className={`p-6 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedVacancy?.id === v.id
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                        : 'border-slate-150 hover:border-emerald-300 bg-white hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold bg-amber-100 text-amber-850 px-2.5 py-0.5 rounded font-mono uppercase">
                        {v.department}
                      </span>
                      <span className="inline-flex items-center text-xs text-slate-500 font-semibold font-mono">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" />
                        {v.location}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-950 font-sans">{v.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed font-sans">{v.description}</p>
                    
                    <div className="mt-4 flex items-center justify-between text-xs text-emerald-800 font-bold font-sans">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {tView.cardCta}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedVacancy?.id === v.id ? 'translate-x-1 text-emerald-800' : 'text-slate-350'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-10 text-center space-y-4">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-650 text-sm font-semibold font-sans">{tView.noVacanciesTitle}</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                  {tView.noVacanciesDesc}
                </p>
                <button
                  onClick={() => setSelectedVacancy({
                    id: 0,
                    title: tView.spontaneousTitle,
                    department: tView.spontaneousDept,
                    description: tView.spontaneousDesc,
                    location: tView.spontaneousLoc,
                    requirements: tView.spontaneousReq,
                    status: 'Ativa'
                  })}
                  className="bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-emerald-900 transition-colors cursor-pointer font-sans"
                >
                  {tView.btnSpontaneous}
                </button>
              </div>
            )}
          </div>

          {/* Application Form Column */}
          {selectedVacancy && (
            <div 
              id="application-form-panel" 
              className="lg:col-span-6 bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-6 animate-slide-in relative"
            >
              {/* Reset selection button */}
              <button
                onClick={() => setSelectedVacancy(null)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-650 font-mono cursor-pointer"
              >
                {tView.closeBtn}
              </button>

              <div className="space-y-2 border-b border-slate-150 pb-4">
                <p className="text-xs font-bold text-amber-600 uppercase font-mono">{tView.applyingFor}</p>
                <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">{selectedVacancy.title}</h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">{selectedVacancy.description}</p>
                <div className="mt-2.5 p-3.5 bg-emerald-50 rounded-xl text-xs text-emerald-950 leading-relaxed font-sans">
                  <strong>{tView.reqTitle}</strong> {selectedVacancy.requirements}
                </div>
              </div>

              {/* Recruitment Application Form */}
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-sans">{tView.formTitle}</h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-sans">{tView.fieldName}</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-250 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-emerald-800 focus:ring-1 focus:ring-emerald-700 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-sans">{tView.fieldEmail}</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.nome@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-250 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-emerald-805 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 font-sans">{tView.fieldPhone}</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: (15) 99885-4422"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-250 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-emerald-805 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 font-sans">
                    <label className="block text-xs font-bold text-slate-700 uppercase">{tView.fieldCv}</label>
                    <span className="text-[10px] text-slate-400 font-mono">{tView.fieldCvHelp}</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder={tView.cvPlaceholder}
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    className="w-full bg-white border border-slate-250 px-4 py-3 rounded-xl text-xs font-medium focus:outline-emerald-805 leading-relaxed font-mono"
                  ></textarea>
                </div>

                {/* Upload de arquivo de CV */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase font-sans">{tView.fieldFile}</label>
                    <span className="text-[10px] text-slate-400 font-mono">{tView.fieldFileHelp}</span>
                  </div>
                  {cvFile ? (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-xs text-emerald-900 font-medium truncate flex-1">{cvFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {(cvFile.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title={tView.fieldFileRemove}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 w-full bg-white border border-dashed border-slate-300 hover:border-emerald-500 px-4 py-3 rounded-xl cursor-pointer transition-colors group">
                      <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                      <span className="text-xs text-slate-500 group-hover:text-emerald-700 font-sans">{tView.fieldFileBtn}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && file.size > 10 * 1024 * 1024) {
                            alert('Arquivo muito grande. Máximo 10 MB.');
                            e.target.value = '';
                            return;
                          }
                          setCvFile(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-800 hover:bg-emerald-905 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  {submitting ? tView.sending : tView.submitBtn}
                </button>
                <p className="text-[10px] text-slate-450 leading-relaxed text-center font-sans">
                  {tView.securityNote}
                </p>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
