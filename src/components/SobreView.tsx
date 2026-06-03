import React from 'react';
import { Award, Box, Compass, Heart, History, Leaf, Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';

interface SobreViewProps {
  siteSettings?: Record<string, string>;
}

export default function SobreView({ siteSettings }: SobreViewProps) {
  const { language } = useLanguage();
  
  const intro = siteSettings?.about_text_intro || 'O patriarca da família Shigueno, Sr. Haruo Shigueno chegou ao Brasil em 1932. Na bagagem apenas vontade e determinação.';

  const localizedAbout = {
    pt: {
      tag: 'Sobre a Fazenda',
      title: 'Nossa História e Legado',
      sub: 'A trajetória da Fazenda Nova Aliança e o pioneirismo da Família Shigueno.',
      dynasty: 'Fundador da Dinastia',
      patriarch: 'Patriarca',
      founderTitle: 'Fundador e Visionário',
      pioneeringTitle1: 'Adubação 100% Orgânica',
      pioneeringDesc1: 'Pioneirismo iniciado em 1975 utilizando fertilização rica gerada em nossa própria granja de ovos.',
      pioneeringTitle2: 'Respeito e Bem-estar',
      pioneeringDesc2: 'Zelo com bem-estar animal desde as aves de postura até o rebanho Nelore em pastos rotacionados.',
      pioneeringTitle3: 'Tradição Sustentada',
      pioneeringDesc3: 'Família Shigueno presidindo o progresso com governança robusta focado no desenvolvimento regional.',
      timelineTitle: 'Cronologia do Agro Shigueno',
      timelineSub: 'Os marcos temporais que construíram a grandiosidade de nossas fazendas.',
      timelineData: [
        {
          year: '1932',
          title: 'A Chegada ao Brasil',
          text: 'O patriarca Haruo Shigueno desembarca no porto brasileiro, trazendo apenas vontade de vencer nos cafezais do noroeste paulista.',
          icon: Compass,
          color: 'border-amber-400 bg-amber-50 text-amber-705'
        },
        {
          year: '1940s',
          title: 'Pioneirismo na Avicultura',
          text: 'Com apenas 18 anos em Mogi das Cruzes, Haruo importa incubadoras pioneiras e ensina a comunidade a criar aves de forma comercial organizada.',
          icon: Box,
          color: 'border-emerald-450 bg-emerald-50 text-emerald-805'
        },
        {
          year: '1970',
          title: 'Chegada a Tatuí - SP',
          text: 'Após desapropriações em São José dos Campos, o visionário adquire terras em Tatuí para lançar a Fazenda Nova Aliança, focada na postura em grande escala.',
          icon: History,
          color: 'border-blue-400 bg-blue-50 text-blue-705'
        },
        {
          year: '1975',
          title: 'A Revolução Ecológica',
          text: 'Adubação orgânica pioneira em pomares de citros com esterco aviário, gerando produtividades incríveis e frutos altamente adocicados.',
          icon: Leaf,
          color: 'border-green-400 bg-green-50 text-green-705'
        },
        {
          year: 'Expansão',
          title: 'Café & Agropecuária Nelore',
          text: 'Plantação de café de altitude arábica em Itaí-SP, seguida pelo ousado investimento de cria e recria do rebanho Nelore em Santo Antônio do Leverger, no Mato Grosso.',
          icon: Award,
          color: 'border-amber-500 bg-amber-100 text-amber-905'
        }
      ],
      paragraphs: [
        'A princípio se estabeleceu na cidade de Aliança, noroeste do estado de SP, onde foram praticar a cafeicultura, decepcionando-se com o descumprimento do que lhes foi prometido, voltou e estabeleceu-se em Mogi das Cruzes.',
        'Numa época em que ninguém ousava criar galinhas comercialmente, Haruo Shigueno com 18 anos, começou a importar incubatórios e produzir pintinhos, dando início na atividade de avicultura na família.',
        'Com a expansão dos negócios, os irmãos Shigueno se separaram, ficando um irmão em Mogi das Cruzes e Haruo foi para São José dos Campos.',
        'Com a desapropriação sofrida pela Granja Shigueno em São José dos Campos, voltou-se o visionário Haruo Shigueno para a cidade de Tatuí, onde por volta de 1970 começou a montar sua granja.',
        'Com a produção de ovos em maior escala, surgiu o esterco das aves e porque não aproveitá-lo para a citricultura?',
        'Foi aí que se iniciou, já em 1975, quando pouco se falava em adubação orgânica, iniciou-se a fertilização da terra com o esterco das galinhas em pomares de citricultura. Posteriormente estendeu a área de citros também para Buri - SP e cafeicultura em Itaí - SP, conseguindo graças à adubação orgânica uma produtividade invejável.'
      ]
    },
    en: {
      tag: 'About the Farm',
      title: 'Our History and Legacy',
      sub: 'The trajectory of Nova Aliança Farm and the pioneering spirit of the Shigueno Family.',
      dynasty: 'Dynasty Founder',
      patriarch: 'Patriarch',
      founderTitle: 'Founder & Visionary',
      pioneeringTitle1: '100% Organic Fertilization',
      pioneeringDesc1: 'Pioneered in 1975 using highly nutritious organic manure generated from our own egg laying farm.',
      pioneeringTitle2: 'Care and Animal Welfare',
      pioneeringDesc2: 'Commitment to animal welfare from layer poultry to Nelore herds grazing on rotated pastures.',
      pioneeringTitle3: 'Sustained Tradition',
      pioneeringDesc3: 'The Shigueno family guiding progress with robust governance focused on regional development.',
      timelineTitle: 'Shigueno Agricultural Timeline',
      timelineSub: 'The historical milestones space that built the greatness of our farms.',
      timelineData: [
        {
          year: '1932',
          title: 'Arrival in Brazil',
          text: 'The patriarch Haruo Shigueno disembarks at the Brazilian port, bringing only the will to succeed in the coffee plantations of northwestern São Paulo.',
          icon: Compass,
          color: 'border-amber-400 bg-amber-50 text-amber-705'
        },
        {
          year: '1940s',
          title: 'Pioneering Poultry Farm',
          text: 'At just 18 years old in Mogi das Cruzes, Haruo imports innovative incubators and trains the community to raise poultry commercially.',
          icon: Box,
          color: 'border-emerald-450 bg-emerald-50 text-emerald-805'
        },
        {
          year: '1970',
          title: 'Arrival in Tatuí - SP',
          text: 'Following properties expropriations in São José dos Campos, the visionary acquires land in Tatuí to establish Nova Aliança Farm.',
          icon: History,
          color: 'border-blue-400 bg-blue-50 text-blue-705'
        },
        {
          year: '1975',
          title: 'Ecological Revolution',
          text: 'Pioneering organic fertilization in citrus orchards using poultry manure, generating incredible yields and sweet fruits.',
          icon: Leaf,
          color: 'border-green-400 bg-green-50 text-green-705'
        },
        {
          year: 'Expansion',
          title: 'Coffee & Nelore Beef Cattle',
          text: 'High-altitude Arabica coffee farming in Itaí-SP, followed by the bold breeding and rearing of Nelore herd in Santo Antônio do Leverger, MT.',
          icon: Award,
          color: 'border-amber-500 bg-amber-100 text-amber-905'
        }
      ],
      paragraphs: [
        'Initially, he settled in the city of Aliança, northwest of SP, where they started coffee cultivation. However, disappointed by unfulfilled promises, he returned and settled in Mogi das Cruzes.',
        'At a time when no one dared to raise chickens commercially, Haruo Shigueno at 18 years old began importing hatchery equipment and producing chicks, initiating the family poultry business.',
        'As business expanded, the Shigueno brothers separated, with one brother remaining in Mogi das Cruzes and Haruo moving to São José dos Campos.',
        'With the expropriation suffered by the Shigueno Farm in São José dos Campos, the visionary Haruo Shigueno turned to the city of Tatuí, where around 1970 he began building his farm.',
        'With egg production at a larger scale, chicken manure accumulated, and why not use it for citrus cultivation?',
        'That is how it began, back in 1975, when organic fertilization was barely discussed. They started fertilizing the land with chicken manure in citrus orchards. Later, citrus cultivation was expanded to Buri-SP and coffee farming to Itaí-SP, achieving an enviable productivity thanks to organic fertilization.'
      ]
    },
    es: {
      tag: 'Sobre la Hacienda',
      title: 'Nuestra Historia y Legado',
      sub: 'La trayectoria de la Hacienda Nova Aliança y el pionerismo de la Familia Shigueno.',
      dynasty: 'Fundador de la Dinastía',
      patriarch: 'Patriarca',
      founderTitle: 'Fundador y Visionario',
      pioneeringTitle1: 'Fertilización 100% Orgánica',
      pioneeringDesc1: 'Pionerismo iniciado en 1975 utilizando el rico fertilizante generado en nuestra propia granja avícola.',
      pioneeringTitle2: 'Cuidado y Bienestar Animal',
      pioneeringDesc2: 'Celoso del bienestar animal desde las aves de postura hasta el rodeo Nelore en pastos rotados.',
      pioneeringTitle3: 'Tradición Sostenida',
      pioneeringDesc3: 'La familia Shigueno liderando el progreso con una gobernanza sólida enfocada en el desarrollo regional.',
      timelineTitle: 'Cronología del Agro Shigueno',
      timelineSub: 'Los hitos temporales que construyeron la grandeza de nuestras haciendas.',
      timelineData: [
        {
          year: '1932',
          title: 'La Llegada a Brasil',
          text: 'El patriarca Haruo Shigueno desembarca en el puerto brasileño, trayendo solo el deseo de vencer en los cafetales del noroeste paulista.',
          icon: Compass,
          color: 'border-amber-400 bg-amber-50 text-amber-705'
        },
        {
          year: '1940s',
          title: 'Pionerismo Avícola',
          text: 'Con solo 18 años en Mogi das Cruzes, Haruo importa incubadoras pioneras y enseña a la comunidad a criar aves de manera comercial.',
          icon: Box,
          color: 'border-emerald-450 bg-emerald-50 text-emerald-805'
        },
        {
          year: '1970',
          title: 'Llegada a Tatuí - SP',
          text: 'Tras expropiaciones en São José dos Campos, el visionario adquiere tierras en Tatuí para fundar la Hacienda Nova Aliança dedicada a la postura.',
          icon: History,
          color: 'border-blue-400 bg-blue-50 text-blue-705'
        },
        {
          year: '1975',
          title: 'La Revolución Ecológica',
          text: 'Abonado orgánico pionero en huertos de cítricos con estiércol avícola, generando productividades increíbles y frutos sabrosos.',
          icon: Leaf,
          color: 'border-green-400 bg-green-50 text-green-705'
        },
        {
          year: 'Expansión',
          title: 'Café & Ganado Nelore',
          text: 'Café Arábica de altura en Itaí-SP, seguido de la inversión de cría y recría de ganado Nelore en Santo Antônio del Leverger, en Mato Grosso.',
          icon: Award,
          color: 'border-amber-500 bg-amber-100 text-amber-905'
        }
      ],
      paragraphs: [
        'Al principio se estableció en la ciudad de Alianza, al noroeste del estado de SP, donde se dedicaron a la caficultura. Decepcionado por promesas incumplidas, regresó y se estableció en Mogi das Cruzes.',
        'En una época en que nadie se atrevía a criar gallinas comercialmente, Haruo Shigueno con 18 años comenzó a importar incubadoras y producir polluelos, iniciando la avicultura familiar.',
        'Con la expansión de los negocios, los hermanos Shigueno se separaron; un hermano permaneció en Mogi das Cruzes y Haruo partió a São José dos Campos.',
        'Tras la expropiación sufrida por la Granja Shigueno en São José dos Campos, el visionario Haruo Shigueno se dirigió a la ciudad de Tatuí, donde alrededor de 1970 comenzó a armar su granja.',
        'Con la producción de huevos a gran escala, surgió el estiércol orgánico de las aves. ¿Por qué no aprovecharlo para la citricultura?',
        'Fue así que se inició, ya en 1975, cuando poco se hablaba de abono orgánico, fertilizando la tierra con el estiércol de las gallinas en cultivos de cítricos. Posteriormente extendió el área de cítricos a Buri-SP y la caficultura a Itaí-SP, logrando una excelente productividad gracias a la fertilización orgánica.'
      ]
    }
  };

  const about = localizedAbout[language] || localizedAbout['pt'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 overflow-hidden">
      
      {/* Editorial Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h2 className="text-xs font-bold text-amber-600 tracking-widest uppercase font-mono">{about.tag}</h2>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans mt-2">
          {about.title}
        </h1>
        <p className="text-sm text-slate-505 mt-2">{about.sub}</p>
        <div className="w-20 h-1.5 bg-emerald-800 mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* Main Narrative Layout: Row of Patriarch Haruo Shigueno */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white p-8 sm:p-12 rounded-3xl border border-emerald-100/60 shadow-xs relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-br-full"></div>
        
        {/* Story copy */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-8 space-y-6 relative z-10 text-slate-800"
        >
          <div className="inline-flex space-x-2 items-center bg-amber-100/65 text-amber-900 px-3 py-1 rounded-md text-xs font-bold font-mono">
            <span>{about.dynasty}</span>
          </div>
          
          <h2 className="text-2.5xl font-extrabold text-emerald-950 font-sans tracking-tight">
            Sr. Haruo Shigueno
          </h2>

          <p className="text-base text-slate-800 font-medium leading-relaxed italic border-l-4 border-amber-500 pl-4 bg-amber-50/30 py-2 pr-2 rounded-r-lg">
            "{intro}"
          </p>

          {about.paragraphs.map((pText, pIdx) => (
            <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-slate-650">
              {pText}
            </p>
          ))}
        </motion.div>

        {/* Founder Portrait Visual Frame */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-4 flex flex-col items-center relative z-10 self-start lg:sticky lg:top-6"
        >
          <div className="relative bg-amber-50/70 p-4 rounded-3xl border-2 border-amber-100 shadow-md max-w-xs w-full transition-transform hover:scale-[1.02] duration-300">
            <div className="overflow-hidden rounded-2xl bg-slate-100 border border-amber-200">
              <img
                src="/images/haruo.jpg"
                alt="Sr. Haruo Shigueno"
                className="w-full aspect-[4/5] object-cover filter brightness-[102%] contrast-[101%] transition-transform duration-700 hover:scale-105"
              />
            </div>
            
            <div className="absolute top-8 right-8 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm font-mono animate-pulse">
              {about.patriarch}
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="font-extrabold text-slate-900 text-base">Sr. Haruo Shigueno</h3>
              <p className="text-2xs text-slate-500 font-bold uppercase tracking-widest font-mono mt-0.5">{about.founderTitle}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Brand Attributes: horizontal pilares showcase */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl flex space-x-4 items-start shadow-xs hover:scale-101 transition-transform"
        >
          <div className="p-3 bg-emerald-900 rounded-xl text-amber-500 shrink-0">
            <Leaf className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">{about.pioneeringTitle1}</h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{about.pioneeringDesc1}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl flex space-x-4 items-start shadow-xs hover:scale-101 transition-transform"
        >
          <div className="p-3 bg-emerald-900 rounded-xl text-amber-500 shrink-0">
            <Heart className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">{about.pioneeringTitle2}</h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{about.pioneeringDesc2}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl flex space-x-4 items-start shadow-xs hover:scale-101 transition-transform"
        >
          <div className="p-3 bg-emerald-900 rounded-xl text-amber-500 shrink-0">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">{about.pioneeringTitle3}</h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{about.pioneeringDesc3}</p>
          </div>
        </motion.div>
      </section>

      {/* Vertical Interactive Timeline */}
      <section className="space-y-8 bg-slate-50 p-8 rounded-3xl border border-slate-150">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{about.timelineTitle}</h3>
          <p className="text-xs text-slate-500 mt-1">{about.timelineSub}</p>
        </div>

        <div className="relative border-l-2 border-emerald-200 ml-4 md:ml-12 pl-6 md:pl-8 space-y-10 max-w-4xl mx-auto">
          {about.timelineData.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={idx} 
                className="relative group"
              >
                {/* Node indicator */}
                <div className={`absolute -left-[45px] md:-left-[53px] top-1.5 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${evt.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Content Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs group-hover:border-emerald-300 transition-colors duration-250">
                  <span className="text-sm font-extrabold text-amber-600 block font-mono">
                    {evt.year}
                  </span>
                  <h4 className="text-base font-bold text-slate-950 font-sans mt-0.5">
                    {evt.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    {evt.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
