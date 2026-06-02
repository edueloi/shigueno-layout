import React from 'react';
import { ArrowLeftRight, ChevronRight, Droplet, Egg, Leaf, Shield, Sparkles, Sprout, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';

interface HomeViewProps {
  onNavigate: (view: string, tab?: string) => void;
  siteSettings?: Record<string, string>;
}

export default function HomeView({ onNavigate, siteSettings }: HomeViewProps) {
  const { language, t } = useLanguage();
  
  // Use DB site settings if provided, otherwise default to the standard copy
  const motto = siteSettings?.company_motto || "Uma empresa sempre preocupada com a qualidade de vida.";
  const intro = siteSettings?.about_text_intro || "O patriarca da família Shigueno, Sr. Haruo Shigueno chegou ao Brasil em 1932. Na bagagem apenas vontade e determinação.";

  // Dynamic values that support multiple translation targets based on language
  const localizedPillars = {
    pt: {
      eggTitle: 'Avicultura de Postura',
      eggDesc: 'Produção diária de 6 tamanhos seletivos de ovos na Fazenda Nova Aliança, com rigorosos padrões de higiene e classificação eletrônica qualificada.',
      eggBadge: 'Super Extra a Industrial',
      citrusTitle: 'Citricultura Orgânica',
      citrusDesc: 'Pioneirismo na fertilização orgânica do solo através de esterco aviário desde 1975. Produção de laranjas de mesa doces e tangerinas nobres colhidas o ano todo.',
      citrusBadge: '13 Variedades Calendário',
      coffeeTitle: 'Cafeicultura de Altitude',
      coffeeDesc: 'Cultivo especializado de Café Arábica no município de Itaí - SP (Fazendas Nova Esperança, Novo Horizonte e Bela Vista) com as mais renomadas linhagens.',
      coffeeBadge: 'Café Arábica Seletivo',
      cattleTitle: 'Pecuária de Corte (Nelore)',
      cattleDesc: 'Cria e recria sob supervisão técnica especializada de rebanho bovino da raça Nelore em Santo Antônio do Leverger - MT, assegurando máxima dignidade e bem-estar animal.',
      cattleBadge: 'Nelore Premium MT'
    },
    en: {
      eggTitle: 'Poultry & Layer Eggs',
      eggDesc: 'Daily production of 6 selective egg sizes at Nova Aliança farm, with rigorous hygiene standards and qualified electronic classification.',
      eggBadge: 'Super Extra to Industrial',
      citrusTitle: 'Organic Citrus Cultivation',
      citrusDesc: 'Pioneering in organic soil fertilization using poultry manure since 1975. Production of sweet table oranges and noble mandarins harvested all year round.',
      citrusBadge: '13 Calendar Varieties',
      coffeeTitle: 'High-Altitude Arabica Coffee',
      coffeeDesc: 'Specialized cultivation of Arabica Coffee in the municipality of Itaí - SP (Nova Esperança, Novo Horizonte and Vista Bella Farms) with renowned varieties.',
      coffeeBadge: 'Selected Arabica Coffee',
      cattleTitle: 'Beef Cattle Raising (Nelore)',
      cattleDesc: 'Breeding and rearing under specialized technical supervision of Nelore cattle in Santo Antônio do Leverger - MT, ensuring maximum animal dignity.',
      cattleBadge: 'Premium Nelore MT'
    },
    es: {
      eggTitle: 'Avicultura de Postura',
      eggDesc: 'Producción diaria de 6 tamaños selectivos de huevos en la Hacienda Nova Aliança, con rigurosos estándares de higiene y clasificación electrónica.',
      eggBadge: 'Súper Extra a Industrial',
      citrusTitle: 'Citricultura Orgánica',
      citrusDesc: 'Pioneros en la fertilización orgánica del suelo mediante estiércol avícola desde 1975. Producción de naranjas de mesa dulces y mandarinas nobles.',
      citrusBadge: '13 Variedades Calendario',
      coffeeTitle: 'Caficultura de Altura',
      coffeeDesc: 'Cultivo especializado del Café Arábica en el municipio de Itaí - SP (Haciendas Nova Esperança, Novo Horizonte y Vista Bella) de las mejores líneas.',
      coffeeBadge: 'Café Arábica Selecto',
      cattleTitle: 'Ganadería de Engorde (Nelore)',
      cattleDesc: 'Cría y recría bajo supervisión técnica especializada de rodeo de la raza Nelore en Santo Antônio do Leverger - MT, asegurando la máxima dignidad.',
      cattleBadge: 'Nelore Premium MT'
    }
  };

  const currentCaps = localizedPillars[language] || localizedPillars['pt'];

  const pillars = [
    {
      title: currentCaps.eggTitle,
      description: currentCaps.eggDesc,
      icon: Egg,
      badge: currentCaps.eggBadge,
      bgColor: 'bg-amber-50/70',
      iconColor: 'text-amber-650',
      borderColor: 'border-amber-200',
      tab: 'avicultura',
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: currentCaps.citrusTitle,
      description: currentCaps.citrusDesc,
      icon: Sprout,
      badge: currentCaps.citrusBadge,
      bgColor: 'bg-emerald-50/70',
      iconColor: 'text-emerald-700',
      borderColor: 'border-emerald-250',
      tab: 'citricultura',
      image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: currentCaps.coffeeTitle,
      description: currentCaps.coffeeDesc,
      icon: Leaf,
      badge: currentCaps.coffeeBadge,
      bgColor: 'bg-amber-100/30',
      iconColor: 'text-[#8B5A2B]',
      borderColor: 'border-amber-300',
      tab: 'cafeicultura',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: currentCaps.cattleTitle,
      description: currentCaps.cattleDesc,
      icon: TrendingUp,
      badge: currentCaps.cattleBadge,
      bgColor: 'bg-[#fafcfa]',
      iconColor: 'text-emerald-950',
      borderColor: 'border-emerald-200',
      tab: 'agropecuaria',
      image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const localizedTimeline = {
    pt: [
      {
        year: '1932',
        title: 'Chegada ao Brasil',
        text: 'Desembarque de Haruo Shigueno, estabelecendo laços e determinação para labuta na cafeicultura.'
      },
      {
        year: '1970',
        title: 'Instalação em Tatuí - SP',
        text: 'Montagem das instalações de postura na Fazenda Nova Aliança, escala industrial de ovos de alta qualidade.'
      },
      {
        year: '1975',
        title: 'Fertilização com Adubo Orgânico',
        text: 'Aproveitamento inteligente do esterco das aves para pomares de citricultura em Tatuí-SP e Buri-SP.'
      },
      {
        year: 'MT & SP',
        title: 'Nelore de Altíssima Linhagem',
        text: 'Expansão agropecuária para Santo Antônio do Leverger - MT, aplicando controles rigorosos de cria e recria.'
      }
    ],
    en: [
      {
        year: '1932',
        title: 'Arrival in Brazil',
        text: 'Landing of Haruo Shigueno, establishing bonds and determination for work in coffee cultivation.'
      },
      {
        year: '1970',
        title: 'Installation in Tatuí - SP',
        text: 'Setting up poultry facilities at Nova Aliança farm, industrial scale of high quality eggs.'
      },
      {
        year: '1975',
        title: 'Organic Manure Fertilization',
        text: 'Smart recycling of poultry manure for citrus orchards in Tatuí-SP and Buri-SP.'
      },
      {
        year: 'MT & SP',
        title: 'Premium Nelore Raising',
        text: 'Agricultural expansion to Santo Antônio do Leverger - MT, applying strict breeding and rearing controls.'
      }
    ],
    es: [
      {
        year: '1932',
        title: 'Llegada a Brasil',
        text: 'Desembarque de Haruo Shigueno, estableciendo lazos y determinación para el trabajo en la caficultura.'
      },
      {
        year: '1970',
        title: 'Instalación en Tatuí - SP',
        text: 'Instalación de la granja en la Hacienda Nova Aliança, escala industrial de huevos de la más alta calidad.'
      },
      {
        year: '1975',
        title: 'Fertilización con Abono Orgánico',
        text: 'Aprovechamiento inteligente del estiércol avícola para huertos de citricultura en Tatuí-SP y Buri-SP.'
      },
      {
        year: 'MT & SP',
        title: 'Nelore de Alta Estirpe',
        text: 'Expansión agropecuaria a Santo Antônio do Leverger - MT, aplicando estrictos controles de cría y recría.'
      }
    ]
  };

  const currentTimeline = localizedTimeline[language] || localizedTimeline['pt'];

  const localizedCTA = {
    pt: {
      tag: 'Trabalhe com a gente',
      title: 'Junte-se à Família Shigueno',
      desc: 'Valorizamos profissionais dedicados, com o desejo de crescer em contato com a terra, avicultura sustentável e pecuária qualificada. Publique seu currículo em nosso processo unificado.',
      btn: 'Ver Vagas Abertas'
    },
    en: {
      tag: 'Work with us',
      title: 'Join the Shigueno Family',
      desc: 'We value dedicated professionals who want to grow in connection with the soil, sustainable poultry, and qualified livestock. Submit your resume in our unified process.',
      btn: 'View Open Vacancies'
    },
    es: {
      tag: 'Trabaja con nosotros',
      title: 'Únase a la Familia Shigueno',
      desc: 'Valoramos a profesionales dedicados que deseen crecer en conexión con la tierra, la avicultura sostenible y la ganadería calificada. Publique su currículum.',
      btn: 'Ver Vacantes Abiertas'
    }
  };

  const currentCTA = localizedCTA[language] || localizedCTA['pt'];

  return (
    <div className="space-y-16 overflow-hidden">
      
      {/* Banner / Hero Section with Green & Amber Atmosphere and real agricultural panoramic view */}
      <section 
        className="relative overflow-hidden bg-cover bg-center text-white py-24 px-4 sm:px-6 lg:px-8 shadow-inner border-b-8 border-amber-500 animate-scale-in"
        style={{ 
          backgroundImage: `linear-gradient(to bottom right, rgba(6, 70, 50, 0.96), rgba(2, 28, 20, 0.91)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80')`
        }}
      >
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-12 text-center space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-800/60 border border-emerald-500/20 px-3.5 py-1.5 rounded-full mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200 font-mono">{t('home.badge')}</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans max-w-4xl mx-auto leading-tight sm:leading-none">
              Shigueno
            </h1>
            
            <p className="text-xl sm:text-2xl text-emerald-100 font-medium max-w-3xl mx-auto italic font-sans">
              "{language === 'pt' ? motto : t('home.motto')}"
            </p>

            <p className="text-emerald-200/90 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed justify-center">
              {t('home.sub')}
            </p>

            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => onNavigate('produtos')}
                className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-extrabold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 border border-amber-400 cursor-pointer"
              >
                <span>{t('home.cta_production')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('sobre')}
                className="bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold px-8 py-3.5 rounded-xl border border-emerald-600 transition-all cursor-pointer"
              >
                {t('nav.about')}
              </button>
            </div>
          </motion.div>

        </div>

      </section>

      {/* Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-amber-600 tracking-widest uppercase font-mono">Shigueno</h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans mt-1">
            {t('home.pillars_title')}
          </p>
          <p className="text-slate-500 mt-2 text-sm">{t('home.pillars_subtitle')}</p>
          <div className="w-16 h-1.5 bg-emerald-700 mx-auto mt-4 rounded-full"></div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
                key={idx} 
                onClick={() => onNavigate('produtos', pillar.tab as any)}
                className={`flex flex-col rounded-3xl border ${pillar.borderColor} ${pillar.bgColor} p-5 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 relative overflow-hidden group cursor-pointer`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
                
                {/* Image background block with hover scale trigger */}
                <div className="w-full h-36 rounded-2xl mb-4 overflow-hidden relative image-zoom-container border border-slate-200/20 shadow-xs">
                  <img 
                    src={pillar.image} 
                    alt={pillar.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent"></div>
                  
                  {/* Category icon inside circle */}
                  <div className="absolute bottom-3 left-3 inline-flex p-2.5 rounded-xl bg-white/95 text-slate-850 shadow-md backdrop-blur-xs">
                    <IconComponent className={`w-5 h-5 ${pillar.iconColor}`} />
                  </div>
                </div>

                <div className="mt-1">
                  <span className="text-[10px] font-bold text-emerald-850 uppercase tracking-wider bg-emerald-100/60 border border-emerald-200/40 px-2.5 py-1 rounded-md">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 font-sans mt-3 group-hover:text-amber-700 transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mt-2 flex-grow">
                  {pillar.description}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-emerald-850">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {language === 'en' ? 'Explore Segment' : language === 'es' ? 'Conocer el Segmento' : 'Conhecer o Segmento'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 transition-all text-amber-600 group-hover:translate-x-0.5" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Visual Dynamic Callout for History */}
      <section className="bg-slate-50 border-y border-slate-150 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Saga and Button (RESTORED BEAUTIFUL SPLIT LAYOUT to avoid misalignment) */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 space-y-5 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-850 font-bold font-mono">
              ★
            </div>
            <h3 className="text-sm font-bold text-emerald-700 tracking-wider uppercase font-mono">
              {language === 'en' ? 'Origin & Pioneering' : language === 'es' ? 'Origen y Pionerismo' : 'Origem & Pioneirismo'}
            </h3>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {language === 'en' ? 'The Saga of the Shigueno Family' : language === 'es' ? 'La Saga de la Familia Shigueno' : 'A Saga da Família Shigueno'}
            </h2>
            <p className="text-slate-650 text-sm leading-relaxed">
              {language === 'pt' ? intro : t('about.values_text')}
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate('sobre')}
                className="inline-flex items-center space-x-2 bg-emerald-800 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-emerald-950 text-sm transition-all hover:scale-102 hover:shadow-md cursor-pointer"
              >
                <span>{language === 'en' ? 'Read Complete Timeline' : language === 'es' ? 'Conocer la Cronología' : 'Conhecer a Chronologia Completa'}</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Timeline Grid (FULLY LOCALIZED now with currentTimeline!) */}
          <motion.div 
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {currentTimeline.map((item, idx) => (
              <div key={idx} className="space-y-2 border-l-4 border-emerald-600 pl-4 group hover:border-amber-500 transition-colors duration-300">
                <p className="text-2xl font-black text-slate-900 group-hover:text-emerald-850 transition-colors duration-250">{item.year}</p>
                <p className="text-xs font-bold text-emerald-700 uppercase">{item.title}</p>
                <p className="text-xs text-slate-505 leading-relaxed font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Trabalhe Conosco CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-emerald-700 flex flex-col md:flex-row md:items-center md:justify-between gap-8 animate-fade-in"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fec006_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="inline-block text-xs font-extrabold text-amber-400 tracking-[0.08em] uppercase font-mono bg-emerald-900/90 px-3.5 py-1.5 rounded-full border border-emerald-700/60 shadow-xs mb-2">
              {currentCTA.tag}
            </span>
            <h2 className="text-2xl sm:text-4.5xl font-black tracking-tight leading-tight pt-1">
              {currentCTA.title}
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              {currentCTA.desc}
            </p>
          </div>

          <div className="shrink-0 relative z-10 self-start md:self-auto">
            <button 
              onClick={() => onNavigate('vagas')}
              className="bg-white hover:bg-slate-50 text-emerald-900 font-extrabold text-sm px-8 py-4 rounded-xl shadow transition-all hover:scale-[1.02] flex items-center justify-between space-x-2 border border-slate-100 cursor-pointer"
              id="goto-careers-cta"
            >
              <span>{currentCTA.btn}</span>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
