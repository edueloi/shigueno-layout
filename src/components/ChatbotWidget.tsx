import React from 'react';
import { Bot, X, Send, Sparkles, Phone, ArrowUpRight, Leaf, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatbotWidgetProps {
  siteSettings?: Record<string, string>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
  isQuickReplySuggestion?: boolean;
}

export default function ChatbotWidget({ siteSettings }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);

  // Read official parameters
  const officialPhone = siteSettings?.contact_phone || '(15) 3259-9710';
  const officialEmail = siteSettings?.contact_email || 'sac@shigueno.com.br';
  const rawMotto = siteSettings?.company_motto || 'Uma empresa sempre preocupada com a qualidade de vida.';

  // Initial messages
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o **ShiguenoBot**, o assistente virtual de autoatendimento oficial do **Grupo Shigueno**. 🌾🐓🍊\n\nEstou aqui para tirar suas dúvidas instantaneamente sobre nossa história, produtos do campo (ovos, citros, café, Nelore) ou oportunidades de trabalho.\n\n*Como posso ajudar você hoje?*',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Clean WhatsApp phone formatting
  const whatsappUrl = React.useMemo(() => {
    const rawNumber = officialPhone.replace(/\D/g, '');
    const codedCountry = rawNumber.startsWith('55') ? rawNumber : '55' + rawNumber;
    return `https://wa.me/${codedCountry}?text=Olá!%20Estou%20entrando%20em%20contato%20através%20do%20autoatendimento%20do%20site%20da%20Família%20Shigueno.`;
  }, [officialPhone]);

  // Handle auto scrolling
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Custom audio confirmation play (soft synthesizer beep if enabled to make it professional)
  const playBeep = (type: 'send' | 'recv' | 'open') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'send') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } else if (type === 'recv') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {
      // Browser audio limits ignored in silence
    }
  };

  // Highly intelligent client-side keyword pattern matching
  const getOfflineResponse = (query: string): string => {
    const q = query.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim();

    // 1. VACANCIES & WORK
    if (q.includes('vaga') || q.includes('emprego') || q.includes('trabalhar') || q.includes('trabalho') || q.includes('oportunidade') || q.includes('curriculo') || q.includes('cv') || q.includes('contrat') || q.includes('recruta') || q.includes('trabalhe conosco')) {
      return `💼 **Oportunidades de Trabalho & Recrutamento:**\n\nNós do **Grupo Shigueno** estamos sempre à procura de novos talentos para impulsionar nossas fazendas e escritórios administrativos!\n\n**Como se candidatar:**\n1. Acesse o menu **"Vagas / Trabalhe Conosco"** no topo esquerdo do nosso site.\n2. Veja os postos ativos e clique em **"Enviar Currículo"** ou preencha a candidatura espontânea informando seus dados.\n\n*Dica:* Nossas áreas com mais vagas recorrentes são: Auxiliares de Produção avícola (Tatuí/SP), Tratoristas e operadores de campo (Itaí e Buri/SP) e Cargos Operacionais ou de Manutenção rústica. Caso queira falar com o RH, nosso e-mail também aceita currículos: **${officialEmail}**.`;
    }

    // 2. AVICULTURE / EGGS
    if (q.includes('ovo') || q.includes('ovos') || q.includes('galinha') || q.includes('postura') || q.includes('avicultura') || q.includes('granja') || q.includes('ave') || q.includes('aves') || q.includes('pintinho')) {
      return `🥚 **Avicultura de Postura de Linha Premium:**\n\nNosso principal segmento histórico é a produção técnica de ovos de alta qualidade na **Fazenda Nova Aliança, em Tatuí (SP)**.\n\n- **Pioneirismo:** Iniciado pelo patriarca **Sr. Haruo Shigueno**, fomos pioneiros na importação de incubatórios importados na época.\n- **Sustentabilidade Ecológica:** Todo o esterco gerado pelas aves de postura passa por um rico processo aeróbico, sendo totalmente convertido em fertilizante de altíssimo impacto para nutrir nossos pomares de Citros e Café. Economia circular pura de alta qualidade!\n- **Controle:** Galpões automatizados, nutrição balanceada e ovos frescos embalados diariamente com destino aos maiores distribuidores de São Paulo.`;
    }

    // 3. CITRI CULTURE / ORANGES
    if (q.includes('laranja') || q.includes('laranjas') || q.includes('citro') || q.includes('citros') || q.includes('citricultura') || q.includes('limao') || q.includes('fruta') || q.includes('pomar') || q.includes('california')) {
      return `🍊 **Citricultura Sustentável do Grupo Shigueno:**\n\nCultivamos excelentes variedades de laranja de mesa e laranja industrial nas fazendas **Califórnia e Nova Aliança, na região de Tatuí e Buri (SP)**.\n\n- **O Segredo do Solo:** Nossa citricultura é mundialmente elogiada pelo dulçor acumulado nas frutas, derivado da adubação orgânica integral com esterco curtido de nossas galinhas de postura.\n- **Safra:** Produção rigorosamente tratada com as melhores práticas de defensivos recomendados e manejo seguro, entregando nutrientes excepcionais ao mercado corporativo e industrial.`;
    }

    // 4. COFFEE
    if (q.includes('cafe') || q.includes('café') || q.includes('itai') || q.includes('arabica') || q.includes('altitude') || q.includes('grao') || q.includes('graos')) {
      return `☕ **Cafeicultura de Altitude de Alta Produtividade:**\n\nProduzimos grãos de excelência de café Arábica nas belíssimas terras da **Fazenda Califórnia de Itaí (SP)**.\n\n- **Microclima Favorável:** Microclima propício devido à altitude excelente e clima equilibrado do interior paulista.\n- **Tecnologia de Secagem:** Terreiros de secagem modernos com monitoramento de umidade rigoroso.\n- **Integração Ecológica:** Nossos cafeeiros também são fertilizados com os insumos orgânicos de nossa avicultura, demonstrando como fechamos o ciclo de produção rústico livre de desperdícios.`;
    }

    // 5. NELORE CATTLE
    if (q.includes('nelore') || q.includes('boi') || q.includes('vaca') || q.includes('gado') || q.includes('agropecuaria') || q.includes('leverger') || q.includes('mato grosso') || q.includes('mt') || q.includes('rebanho') || q.includes('cria') || q.includes('recria')) {
      return `🐂 **Agropecuária de Nelore Seletivo:**\n\nExpandimos nossas fronteiras rurais rumo a **Santo Antônio do Leverger (MT)**, onde conduzimos com extremo rigor as operações de cria e recria do rebanho bovino Nelore.\n\n- **Manejo Racional:** Pastagens manejadas rotacionalmente e preocupação máxima com o bem-estar animal para fornecer carne sustentável.\n- **Genética Consolidada:** Linhagens robustas integradas com o progresso do campo e nutrição balanceada por especialistas.`;
    }

    // 6. HISTORY / PATRIARCH HARUO
    if (q.includes('haruo') || q.includes('patriarca') || q.includes('historia') || q.includes('origem') || q.includes('imigra') || q.includes('fundacao') || q.includes('familia') || q.includes('shigueno') || q.includes('1932') || q.includes('mogi') || q.includes('fundou')) {
      return `📖 **Histórico de Trabalho & Suor e Visão:**\n\nA saga do **Grupo Shigueno** confunde-se com a resiliência da imigração japonesa no Brasil:\n\n- **1932:** O jovem patriarca **Sr. Haruo Shigueno** iniciou as atividades rústicas no ramo em Mogi das Cruzes (SP) ainda aos 18 anos de idade.\n- **Inovação Marcante:** Ele foi pioneiro na importação das primeiras incubadoras técnicas, produzindo e comercializando pintinhos de um dia pelo interior.\n- **Mudança para Tatuí:** Nos anos 1970, Haruo moveu sua avicultura para a cidade de Tatuí (Fazenda Nova Aliança) de onde o clã Shigueno estruturou a excepcional diversificação ecológica agrícola atual.\n\n*Lema:* "${rawMotto}"`;
    }

    // 7. LOCATION
    if (q.includes('local') || q.includes('onde') || q.includes('endereco') || q.includes('fazenda') || q.includes('sede') || q.includes('cidade') || q.includes('ficam') || q.includes('tatui') || q.includes('itai') || q.includes('buri') || q.includes('sorocaba')) {
      return `📍 **Endereços e Produções das Fazendas Shigueno:**\n\nNossas unidades de produção estão distribuídas estrategicamente para aproveitar o melhor de cada terroir:\n\n- **Tatuí (SP):** Sede administrativa e Fazenda Nova Aliança (Ovos de Postura e Laranjas).\n- **Buri (SP):** Fazenda California/Aliança (Pomares de Laranjas técnicas).\n- **Itaí (SP):** Fazendas California Itaí (Plantações ricas de Café Arábica).\n- **Santo Antônio do Leverger (MT):** Operações agropecuárias com Gado Nelore.\n- **Sorocaba (SP):** Plataforma de ligação logística e distribuição rápida.`;
    }

    // 8. CONTACT / WHATSAPP
    if (q.includes('contato') || q.includes('whatsapp') || q.includes('zap') || q.includes('telefone') || q.includes('falar') || q.includes('humano') || q.includes('email') || q.includes('comercial') || q.includes('sac') || q.includes('atende') || q.includes('numero')) {
      return `📞 **Canais de Atendimento e Vendas Shigueno:**\n\nPrecisa encomendar cargas grandes, propor representações comerciais ou dúvidas com RH? Veja como falar conosco:\n\n- **WhatsApp Comercial Direto:** CLIQUE no link de contato verde no topo do chat para conectar diretamente!\n- **Telefone Fixo Sede:** **${officialPhone}**\n- **E-mail Oficial:** **${officialEmail}** (respostas em até 24 horas úteis).\n\nNosso expediente rústico administrativo é de Segunda a Sexta-feira, das 07h30 às 17h00.`;
    }

    // 9. HELLOS & GREETINGS
    if (q.includes('ola') || q.includes('bom dia') || q.includes('boa tarde') || q.includes('boa noite') || q.includes('oi') || q.includes('opa') || q.includes('ajuda') || q.includes('bot') || q.includes('robo')) {
      return `✨ **Olá! Sou o ShiguenoBot rústico. Como posso ajudar?**\n\nDigite uma dúvida ou escolha um dos temas populares de nossa fazenda:\n\n- Digite **"Vagas"** para ver como mandar seu currículo;\n- Digite **"História"** para conhecer a trajetória do Sr. Haruo Shigueno desde 1932;\n- Digite **"Ovos"** ou **"Laranja"** para compreender o modelo ecológico de nossas fazendas;\n- Ou clique no botão **"Zap Comercial"** no cabeçalho do console para conversar com o RH / Setor Administrativo.`;
    }

    // 10. NOT FOUND FALLBACK WITH ADVANCED KEYWORD SUGGESTION
    return `🌾 **Entendi sua mensagem, mas não localizei essa palavra específica no meu banco de dados rústico de Tatuí.**\n\nPosso informar para você tudo sobre o Grupo Shigueno! Que tal experimentar perguntar sobre:\n- **"Vagas de Emprego"**\n- **"Produção de Ovos e Galinhas"**\n- **"Fazenda de Café"**\n- **"Laranjas e Citros de Tatuí"**\n- **"Cria de Gado Nelore em Mato Grosso"**\n- **"História do Haruo Shigueno"**\n\nCaso seja um assunto urgente de fornecimento ou recrutamento humano, sinta-se super à vontade para falar conosco pelo **WhatsApp: ${officialPhone}** ou e-mail **${officialEmail}**.`;
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Trigger soft sound for user message sent
    playBeep('send');

    const userMsg: Message = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    // Simulate human-like computational delay (looks much more premium and realistic than instant)
    setTimeout(() => {
      const responseText = getOfflineResponse(text);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: responseText,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
      // Trigger reply sound
      playBeep('recv');
    }, 750);
  };

  // Safe renderer for markers
  const formatMarkdown = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formatted.split('\n').map((line, i) => (
      <span key={i} className="block mt-1 first:mt-0 text-slate-100 font-sans tracking-wide leading-relaxed">
        {line.includes('<strong>') || line.includes('<em>') ? (
          <span dangerouslySetInnerHTML={{ __html: line }} />
        ) : (
          line
        )}
      </span>
    ));
  };

  return (
    <div className="font-sans antialiased text-left">
      
      {/* 1. PREMIUM ROTATING FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-[9991]">
        <motion.button
          id="btn-trigger-shiguenobot-primo"
          onClick={() => {
            const nextState = !isOpen;
            setIsOpen(nextState);
            if (nextState) playBeep('open');
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.35)] transition-all duration-300 focus:outline-none ${
            isOpen 
              ? 'bg-slate-900 border-2 border-amber-500/70 text-white' 
              : 'bg-gradient-to-tr from-emerald-900 via-emerald-800 to-amber-700 border-2 border-amber-400 text-white'
          }`}
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <div className="flex flex-col items-center justify-center relative">
              <Bot className="w-8 h-8" />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-300 -mt-0.5 font-mono">Chat</span>
              
              {/* Green active breathing pulse dot */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-emerald-950"></span>
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* 2. CHAT PANEL INTERACTION (CORRECTLY FIXED POSITIONED FOR PERFECT RESPONSIVENESS AND NO OUT-OF-IFRAME SCALE OVERFLOW) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="panel-shiguenobot-standalone-premium"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 w-auto sm:w-[380px] h-[480px] sm:h-[580px] max-h-[calc(100vh-120px)] bg-slate-950 rounded-2xl border-2 border-slate-800 flex flex-col overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.65)] z-[9990]"
          >
            {/* PANEL BRANDING HEAD - Elegant Gradient, Bordered */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 px-4 py-3 border-b-2 border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                {/* Robot Avatar Panel */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-700 flex items-center justify-center border-2 border-amber-500/40 relative">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                  <span className="absolute -bottom-1 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white flex items-center tracking-wider uppercase">
                    ShiguenoBot
                    <span className="ml-1.5 text-[8px] tracking-normal px-1 bg-emerald-500/15 text-emerald-450 border border-emerald-500/30 font-mono py-0.5 rounded-sm uppercase font-black">OK</span>
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-[9px] text-slate-300 font-mono">Robô Assistente Offline</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Sound Control Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${soundEnabled ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'}`}
                  title={soundEnabled ? "Desativar assistente sonoro" : "Ativar assistente sonoro"}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* INTEGRATED DIRECT WHATSAPP HIGHLIGHT STRIP */}
            <div className="bg-slate-900 border-b border-slate-800/85 px-3 py-2 flex items-center justify-between gap-3 text-slate-100 shrink-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <Leaf className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[9.5px] text-slate-300 font-bold leading-tight truncate">Quer falar com o Comercial / RH Humano?</span>
              </div>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-[9px] bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded-lg border border-emerald-600 transition-all shadow-sm shrink-0 uppercase tracking-wider"
              >
                <Phone className="w-2.5 h-2.5 text-emerald-300 mr-1 shrink-0" />
                <span>Zap Direto</span>
                <ArrowUpRight className="w-2.5 h-2.5 text-emerald-250 ml-0.5 shrink-0" />
              </a>
            </div>

            {/* SCROLLABLE CHAT FEED */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 custom-scrollbar relative">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-250`}
                >
                  <div className="flex flex-col space-y-1 max-w-[85%]">
                    {msg.role === 'assistant' && (
                      <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center space-x-1">
                        <span>🤖 ShiguenoBot</span>
                      </span>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-emerald-800 to-emerald-900 text-white rounded-tr-none border border-emerald-600/70 shadow-sm'
                        : 'bg-slate-900/90 text-slate-100 border border-slate-800/80 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap select-text">
                        {formatMarkdown(msg.content)}
                      </div>
                      {msg.time && (
                        <span className="text-[8px] text-slate-500 font-mono font-bold block text-right mt-1.5">
                          {msg.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center space-x-2 animate-pulse mt-2">
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl rounded-tl-none flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[9.5px] text-slate-500 font-mono tracking-wider font-extrabold uppercase animate-pulse">Analisando escrita...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER MESSAGE WRITING FORM INPUT */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-slate-950 border-t border-slate-800/90 flex items-center space-x-3 shrink-0"
            >
              <div className="relative flex-grow min-w-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={loading}
                  maxLength={180}
                  placeholder="Pergunte sobre vagas, café, ovos, Haruo..."
                  className="w-full bg-slate-900 border border-slate-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 text-xs pl-3 pr-8 py-2.5 rounded-xl text-white outline-none placeholder:text-slate-500/90 disabled:opacity-50"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-500 font-mono">
                  {inputValue.length}/180
                </span>
              </div>
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Enviar mensagem"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
