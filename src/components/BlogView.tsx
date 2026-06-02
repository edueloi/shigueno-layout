import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, Calendar, Eye, ArrowLeft, User, Instagram, Tag, ArrowRight, 
  Share2, MessageSquare, Check, Mail, Clock, Heart, Copy
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: number;
  author_id: number;
  status: string;
  views: number;
  published_at: string;
  is_featured: boolean;
  tags: string;
}

interface BlogCategory {
  id: number;
  name: string;
  description: string;
}

interface BlogAuthor {
  id: number;
  name: string;
  role: string;
  bio: string;
  instagram: string;
  avatar_url: string;
}

const localizedTexts = {
  pt: {
    postViews: 'visualizações',
    postReadTime: 'min de leitura',
    copiedFeedback: 'Link copiado para a área de transferência!',
    backToList: 'Voltar para Lista de Artigos',
    likeSupported: 'Gostou!',
    likeSupport: 'Apoiar Artigo',
    shareLabel: 'Compartilhar:',
    newsletterTitle: 'Informativo Shigueno',
    newsletterDesc: 'Receba dicas de manejo aviário, agricultura familiar e novidades do agronegócio diretamente na sua caixa.',
    newsletterPlaceholder: 'seu-email@provedor.com',
    newsletterSuccess: 'Inscrição Confirmada!',
    newsletterBtn: 'Inscrever-se',
    recommendedTitle: 'Recomendado para Você',
    bannerTag: 'Blog do Grupo Shigueno',
    bannerTitlePart1: 'Semeando Conexões,',
    bannerTitlePart2: 'Nutrindo a Terra.',
    bannerDesc: 'Descubra artigos exclusivos, inovações tecnológicas no agronegócio, dicas de manejo ecológico e acompanhe o legado da família Shigueno desde 1932.',
    searchPlaceholder: 'Pesquise por título, palavras ou tags...',
    foundCount: 'Sistemas Shigueno identificaram',
    articlesText: 'artigos',
    allCategories: 'Todos os Assuntos',
    loadingDb: 'Buscando banco de dados...',
    noArticlesTitle: 'Nenhum artigo encontrado',
    noArticlesDesc: 'Tente ajustar termos na barra de busca ou trocar a categoria selecionada.',
    featuredTag: 'Destaque',
    readFull: 'Ler Artigo Completo',
    heritageTitle: 'Grupo Shigueno',
    heritageSub: 'Tradição & Inovação',
    heritageDesc: 'Pioneiros na agricultura familiar em Tatuí, integrando processos circulares de adubação da nossa avicultura diretamente para o solo dos pomares de citros.',
    heritageHq: 'Sede Central: Tatuí - SP',
    newsletterSidebarDesc: 'Cadastre o seu e-mail corporativo para receber as análises de mercado, novidades da produção de ovos e relatórios de manejo Nelore.',
    newsletterSidebarSuccess: 'Inscrição Confirmada com sucesso!',
    editorialTitle: 'Nosso Corpo Editorial',
    monthFormat: {
      january: 'Janeiro', february: 'Fevereiro', march: 'Março', april: 'Abril',
      may: 'Maio', june: 'Junho', july: 'Julho', august: 'Agosto',
      september: 'Setembro', october: 'Outubro', november: 'Novembro', december: 'Dezembro'
    }
  },
  en: {
    postViews: 'views',
    postReadTime: 'min read',
    copiedFeedback: 'Link copied to clipboard!',
    backToList: 'Back to Article List',
    likeSupported: 'Liked!',
    likeSupport: 'Support Article',
    shareLabel: 'Share:',
    newsletterTitle: 'Shigueno Newsletter',
    newsletterDesc: 'Get tips on poultry management, family farming, and agribusiness news directly in your inbox.',
    newsletterPlaceholder: 'your-email@provider.com',
    newsletterSuccess: 'Subscription Confirmed!',
    newsletterBtn: 'Subscribe',
    recommendedTitle: 'Recommended for You',
    bannerTag: 'Shigueno Group Blog',
    bannerTitlePart1: 'Sowing Connections,',
    bannerTitlePart2: 'Nutrining the Earth.',
    bannerDesc: 'Discover exclusive articles, technological innovations in agribusiness, ecological management tips, and follow the legacy of the Shigueno family since 1932.',
    searchPlaceholder: 'Search by title, keywords or tags...',
    foundCount: 'Shigueno systems identified',
    articlesText: 'articles',
    allCategories: 'All Subjects',
    loadingDb: 'Fetching database...',
    noArticlesTitle: 'No articles found',
    noArticlesDesc: 'Try adjusting terms in the search bar or changing the selected category.',
    featuredTag: 'Featured',
    readFull: 'Read Full Article',
    heritageTitle: 'Shigueno Group',
    heritageSub: 'Tradition & Innovation',
    heritageDesc: 'Pioneers in family farming in Tatuí, integrating circular processes of poultry organic fertilization directly into citrus orchard soils.',
    heritageHq: 'Headquarters: Tatuí - SP',
    newsletterSidebarDesc: 'Enter your business email to receive market analysis, egg market updates, and Nelore cattle breeding reports.',
    newsletterSidebarSuccess: 'Subscription confirmed successfully!',
    editorialTitle: 'Our Editorial Board',
    monthFormat: {
      january: 'January', february: 'February', march: 'March', april: 'April',
      may: 'May', june: 'June', july: 'July', august: 'August',
      september: 'September', october: 'October', november: 'November', december: 'December'
    }
  },
  es: {
    postViews: 'visualizaciones',
    postReadTime: 'min de lectura',
    copiedFeedback: '¡Enlace copiado al portapapeles!',
    backToList: 'Volver a la Lista de Artículos',
    likeSupported: '¡Le gustó!',
    likeSupport: 'Apoyar Artículo',
    shareLabel: 'Compartir:',
    newsletterTitle: 'Informativo Shigueno',
    newsletterDesc: 'Reciba consejos sobre manejo avícola, agricultura familiar y novedades del agronegocio directamente en su buzón.',
    newsletterPlaceholder: 'tu-correo@servidor.com',
    newsletterSuccess: '¡Inscripción Confirmada!',
    newsletterBtn: 'Suscribirse',
    recommendedTitle: 'Recomendado para Usted',
    bannerTag: 'Blog del Grupo Shigueno',
    bannerTitlePart1: 'Sembrando Conexiones,',
    bannerTitlePart2: 'Nutriendo la Tierra.',
    bannerDesc: 'Descubra artículos exclusivos, innovaciones tecnológicas en el agronegocio, consejos de manejo ecológico y acompañe el legado de la familia Shigueno desde 1932.',
    searchPlaceholder: 'Busque por título, palabras clave o etiquetas...',
    foundCount: 'Los sistemas de Shigueno identificaron',
    articlesText: 'artículos',
    allCategories: 'Todos los Temas',
    loadingDb: 'Buscando base de datos...',
    noArticlesTitle: 'No se encontraron artículos',
    noArticlesDesc: 'Intente ajustar los términos en la barra de búsqueda o cambiar la categoría seleccionada.',
    featuredTag: 'Destacado',
    readFull: 'Leer Artículo Completo',
    heritageTitle: 'Grupo Shigueno',
    heritageSub: 'Tradición e Innovación',
    heritageDesc: 'Pioneros en agricultura familiar en Tatuí, integrando procesos circulares de abono orgánico de nuestra avicultura directamente en los suelos de huertos de cítricos.',
    heritageHq: 'Sede Central: Tatuí - SP',
    newsletterSidebarDesc: 'Registre su correo corporativo para recibir análisis de mercado, novedades de distribución de huevos y reportes Nelore.',
    newsletterSidebarSuccess: '¡Suscripción confirmada con éxito!',
    editorialTitle: 'Nuestro Cuerpo Editorial',
    monthFormat: {
      january: 'Enero', february: 'Febrero', march: 'Marzo', april: 'Abril',
      may: 'Mayo', june: 'Junio', july: 'Julio', august: 'Agosto',
      september: 'Septiembre', october: 'Octubre', november: 'Noviembre', december: 'Diciembre'
    }
  }
};

export default function BlogView() {
  const { language, t } = useLanguage();
  const tView = localizedTexts[language] || localizedTexts['pt'];
  
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [authors, setAuthors] = React.useState<BlogAuthor[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  
  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Reader view state
  const [activePost, setActivePost] = React.useState<BlogPost | null>(null);
  
  // Newsletter simulation
  const [email, setEmail] = React.useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState<boolean>(false);

  // Reading experience hooks
  const [scrollProgress, setScrollProgress] = React.useState<number>(0);
  const [likes, setLikes] = React.useState<number>(0);
  const [hasLiked, setHasLiked] = React.useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!activePost) {
      setScrollProgress(0);
      return;
    }
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePost]);

  React.useEffect(() => {
    if (activePost) {
      const storageKey = `shigueno_blog_likes_${activePost.id}`;
      const savedLikes = localStorage.getItem(storageKey);
      const liked = !!savedLikes;
      setHasLiked(liked);
      
      // Dynamic baseline count
      const baseLikes = Math.floor(((activePost.views || 0) + 12) * 0.35) + (liked ? 1 : 0);
      setLikes(baseLikes);
    }
  }, [activePost]);

  React.useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      setIsLoading(true);
      const [postsRes, catsRes, authorsRes] = await Promise.all([
        fetch('/api/blog/posts'),
        fetch('/api/blog/categories'),
        fetch('/api/blog/authors')
      ]);

      const [postsData, catsData, authorsData] = await Promise.all([
        postsRes.json(),
        catsRes.json(),
        authorsRes.json()
      ]);

      if (postsData.success) setPosts(postsData.posts);
      if (catsData.success) setCategories(catsData.categories);
      if (authorsData.success) setAuthors(authorsData.authors);
    } catch (error) {
      console.error('Falha ao carregar dados do blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPost = async (post: BlogPost) => {
    setActivePost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track views dynamically
    try {
      await fetch(`/api/blog/posts/${post.id}/view`, { method: 'POST' });
      // Update local state views counter immediately for good UX
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p));
      setActivePost(curr => curr && curr.id === post.id ? { ...curr, views: (curr.views || 0) + 1 } : curr);
    } catch (e) {
      console.warn('Erro ao atualizar visualizações no servidor:', e);
    }
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 3000);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return language === 'en' ? 'July, 2026' : language === 'es' ? 'Julio, 2026' : 'Julho, 2026';
    
    const monthNames = [
      tView.monthFormat.january, tView.monthFormat.february, tView.monthFormat.march, tView.monthFormat.april,
      tView.monthFormat.may, tView.monthFormat.june, tView.monthFormat.july, tView.monthFormat.august,
      tView.monthFormat.september, tView.monthFormat.october, tView.monthFormat.november, tView.monthFormat.december
    ];
    
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    
    if (language === 'en') {
      return `${month} ${day}, ${year}`;
    }
    return `${day} de ${month} de ${year}`;
  };

  // Filter out posts that are scheduled in the future (posso programar tbm uma postagem)
  // or posts that aren't "Publicado" (status === 'Publicado')
  const publicPosts = posts.filter(post => {
    const isPublished = post.status === 'Publicado';
    const isPastOrPresent = new Date(post.published_at) <= new Date();
    return isPublished && isPastOrPresent;
  });

  // Apply visual category tab and search filters on top of published posts
  const filteredPosts = publicPosts.filter(post => {
    const matchesCategory = selectedCategory === null || Number(post.category_id) === Number(selectedCategory);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      (post.tags && post.tags.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  // Find featured post among filtered or total public posts
  const featuredPost = publicPosts.find(p => p.is_featured);  if (activePost) {
    const postCategory = categories.find(c => Number(c.id) === Number(activePost.category_id));
    const postAuthor = authors.find(a => Number(a.id) === Number(activePost.author_id));
    
    // Find related posts (same category or others, excluding the active one)
    const relatedPosts = publicPosts
      .filter(p => p.id !== activePost.id && (Number(p.category_id) === Number(activePost.category_id) || p.is_featured))
      .slice(0, 3);

    const wordCount = activePost.content ? activePost.content.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.round(wordCount / 200));

    const handleLike = () => {
      const storageKey = `shigueno_blog_likes_${activePost.id}`;
      if (!hasLiked) {
        localStorage.setItem(storageKey, 'true');
        setHasLiked(true);
        setLikes(prev => prev + 1);
      } else {
        localStorage.removeItem(storageKey);
        setHasLiked(false);
        setLikes(prev => prev - 1);
      }
    };

    const handleCopyLink = () => {
      const dummyUrl = `${window.location.origin}/blog/${activePost.slug}`;
      navigator.clipboard.writeText(dummyUrl).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      }).catch(err => {
        console.warn('Erro ao copiar URL:', err);
      });
    };

    const shareWhatsApp = () => {
      const text = `Confira este artigo no Blog do Grupo Shigueno: "${activePost.title}" - ${window.location.origin}/blog/${activePost.slug}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
      <div className="bg-slate-50/70 min-h-screen pb-24 selection:bg-emerald-100 relative">
        
        {/* Scroll Progress Bar */}
        <div 
          className="fixed top-0 left-0 h-1 bg-emerald-600 transition-all duration-75 z-50 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Link Copied floating feedback */}
        {copyFeedback && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-xs border border-emerald-600 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{tView.copiedFeedback}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
          
          {/* Breadcrumb Path & Header Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-200/60 pb-6">
            <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 font-mono">
              <span className="hover:text-emerald-850 transition-colors cursor-pointer" onClick={() => setActivePost(null)}>Blog</span>
              <span>/</span>
              {postCategory && (
                <>
                  <span className="hover:text-emerald-850 transition-colors cursor-pointer" onClick={() => setSelectedCategory(postCategory.id)}>{postCategory.name}</span>
                  <span>/</span>
                </>
              )}
              <span className="text-emerald-800 font-bold truncate max-w-[150px] sm:max-w-xs">{activePost.title}</span>
            </nav>

            <button
              onClick={() => {
                setActivePost(null);
                window.scrollTo({ top: 0, behavior: 'instant' as any });
              }}
              className="group inline-flex items-center space-x-2 text-slate-750 hover:text-emerald-855 font-bold text-xs transition-all bg-white px-4.5 py-2.5 rounded-full shadow-xs border border-slate-200/80 hover:border-emerald-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>{tView.backToList}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
            
            {/* LEFT / MAIN COLUMN (8 cols) - Main Article reading station */}
            <main className="lg:col-span-8 space-y-8">
              
              <article className="bg-white rounded-[32px] border border-slate-200/70 shadow-xs overflow-hidden p-5 sm:p-8 md:p-12 relative animate-in fade-in duration-300">
                
                {/* Meta details header band */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-slate-450 font-semibold border-b border-slate-100 pb-5">
                  {postCategory && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-850 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                      {postCategory.name}
                    </span>
                  )}
                  
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {formatDate(activePost.published_at)}
                  </span>

                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {readTime} {tView.postReadTime}
                  </span>

                  <span className="flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {activePost.views || 0} {tView.postViews}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3.5xl md:text-4xl lg:text-5xl font-sans font-black text-emerald-950 leading-[1.12] tracking-tight mb-6">
                  {activePost.title}
                </h1>

                {/* Excerpt Summary Showcase */}
                <div className="border-l-4 border-amber-500 bg-amber-50/20 rounded-r-2xl px-5 py-4 mb-8 text-base md:text-lg text-slate-650 leading-relaxed font-sans italic">
                  "{activePost.excerpt}"
                </div>

                {/* Cover Image portion */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 shadow-sm relative group bg-slate-100">
                  <img
                    src={activePost.image_url}
                    alt={activePost.title}
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none"></div>
                </div>

                {/* Article Content Parser Engine */}
                <div className="doc-content text-slate-700 leading-[1.75] space-y-6 text-[15px] sm:text-[17px] md:text-[18px] mb-12 selection:bg-emerald-100 selection:text-emerald-950">
                  {activePost.content.split('\n\n').map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-xl md:text-2xl font-black text-emerald-950 mt-10 mb-4 pb-2 border-b border-emerald-100 flex items-center">
                          <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block mr-3 shrink-0"></span>
                          <span>{trimmed.replace('### ', '')}</span>
                        </h3>
                      );
                    }
                    if (trimmed.startsWith('#### ')) {
                      return (
                        <h4 key={index} className="text-lg md:text-xl font-bold text-emerald-900 mt-8 mb-3">
                          {trimmed.replace('#### ', '')}
                        </h4>
                      );
                    }
                    if (trimmed.startsWith('> ')) {
                      return (
                        <blockquote key={index} className="border-l-4 border-amber-500 bg-amber-50/40 px-6 py-4 my-6 rounded-r-xl italic text-slate-650 leading-relaxed text-base md:text-lg">
                          {trimmed.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                      const items = trimmed.split('\n');
                      return (
                        <ul key={index} className="list-disc pl-6 space-y-3 my-4 text-slate-700 font-sans">
                          {items.map((item, i) => (
                            <li key={i} className="pl-1">
                              {item.replace(/^[*-\s]+/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (trimmed.match(/^\d+\./)) {
                      const items = trimmed.split('\n');
                      return (
                        <ol key={index} className="list-decimal pl-6 space-y-3 my-4 text-slate-700 font-sans">
                          {items.map((item, i) => (
                            <li key={i} className="pl-1">
                              {item.replace(/^\d+\.\s*/, '')}
                            </li>
                          ))}
                        </ol>
                      );
                    }
                    
                    // First text block premium layout styling
                    const isFirstText = index === 0 || (index === 1 && activePost.content.split('\n\n')[0].startsWith('###'));
                    return (
                      <p 
                        key={index} 
                        className={`font-sans leading-relaxed whitespace-pre-line text-slate-650 ${
                          isFirstText 
                            ? 'text-lg md:text-xl text-slate-900 font-medium leading-relaxed border-l-2 border-emerald-600 pl-4 py-1.5 bg-emerald-50/10 rounded-r-lg shadow-2xs' 
                            : ''
                        }`}
                      >
                        {trimmed}
                      </p>
                    );
                  })}
                </div>

                {/* Post Tags section */}
                {activePost.tags && (
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100 mb-8">
                    {activePost.tags.split(',').map((tag, i) => (
                      <span key={i} className="flex items-center text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full select-none">
                        <Tag className="w-3 h-3 mr-1.5 text-slate-400" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Interaction Bar (Like + Share Widget) */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleLike}
                      className={`group inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                        hasLiked 
                          ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-800 hover:border-emerald-300 hover:shadow-2xs cursor-pointer'
                      }`}
                    >
                      <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${hasLiked ? 'fill-rose-500 text-rose-500 animate-pulse' : ''}`} />
                      <span>{hasLiked ? tView.likeSupported : tView.likeSupport}</span>
                      <span className="w-px h-3 bg-slate-200"></span>
                      <span className="font-mono text-xs font-black">{likes}</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="p-2.5 border border-slate-200 rounded-full hover:bg-slate-50 text-slate-500 hover:text-emerald-850 cursor-pointer"
                      title="Copiar Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 font-sans mr-1">{tView.shareLabel}</span>
                    <button
                      onClick={shareWhatsApp}
                      className="px-3.5 py-2 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        const text = `Confira este artigo no Blog do Grupo Shigueno: "${activePost.title}"`;
                        const url = `${window.location.origin}/blog/${activePost.slug}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition-colors flex items-center cursor-pointer"
                    >
                      <span>CompartilharX</span>
                    </button>
                  </div>

                </div>

              </article>

            </main>

            {/* RIGHT SIDEBAR (4 cols) - Authors/Newsletter/Read more, Sticky and beautifully framed */}
            <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
              
              {/* Author Presentation Card */}
              {postAuthor && (
                <div className="bg-white rounded-[24px] border border-slate-200/70 p-6 shadow-xs relative overflow-hidden transition-all hover:border-emerald-250">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/20 to-amber-100/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center space-x-4 mb-4 relative z-10">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-emerald-600 shadow-sm relative bg-slate-50">
                      <img
                        src={postAuthor.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                        alt={postAuthor.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md tracking-wider inline-block">
                        {postAuthor.role}
                      </span>
                      <h4 className="font-sans font-black text-emerald-950 text-base mt-2 leading-tight truncate">{postAuthor.name}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 relative z-10 italic">
                    "{postAuthor.bio}"
                  </p>

                  {postAuthor.instagram && (
                    <a
                      href={`https://instagram.com/${postAuthor.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-emerald-850 hover:text-emerald-700 font-bold transition-colors bg-emerald-50/40 px-3 py-2 rounded-xl border border-emerald-100/30 w-full justify-center"
                    >
                      <Instagram className="w-3.5 h-3.5 mr-2 text-emerald-650" />
                      <span>{postAuthor.instagram}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Newsletter subscription widget */}
              <div className="bg-white rounded-[24px] p-6 border border-slate-200/70 shadow-xs relative overflow-hidden hover:border-amber-250 transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                
                <h4 className="font-extrabold text-emerald-950 text-sm mb-1.5 flex items-center">
                  <Mail className="w-4.5 h-4.5 mr-2 text-emerald-850 shrink-0" />
                  <span>{tView.newsletterTitle}</span>
                </h4>
                <p className="text-xs text-slate-550 leading-relaxed mb-4">
                  {tView.newsletterDesc}
                </p>

                {newsletterSubscribed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 text-center text-xs font-bold"
                  >
                    <Check className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    <span>{tView.newsletterSuccess}</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribeNewsletter} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tView.newsletterPlaceholder}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-slate-50/60"
                    />
                    <button
                      type="submit"
                      className="w-full bg-emerald-850 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    >
                      <span>{tView.newsletterBtn}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Related articles showcase inside sidebar layout */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-[24px] p-6 border border-slate-200/70 shadow-xs">
                  <h4 className="font-sans font-black text-emerald-950 text-sm mb-4 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-emerald-750" />
                    <span>{tView.recommendedTitle}</span>
                  </h4>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => {
                      const relCat = categories.find(c => Number(c.id) === Number(related.category_id));
                      return (
                        <div
                          key={related.id}
                          onClick={() => handleOpenPost(related)}
                          className="group flex gap-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0 items-start cursor-pointer hover:opacity-95"
                        >
                          <div className="h-14 w-14 rounded-xl overflow-hidden relative shrink-0 bg-slate-50 border border-slate-200/50">
                            <img src={related.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            {relCat && (
                              <span className="text-[9px] font-extrabold text-emerald-800 uppercase block tracking-wider leading-none mb-1">
                                {relCat.name}
                              </span>
                            )}
                            <h5 className="font-extrabold text-slate-800 text-xs line-clamp-2 leading-snug group-hover:text-emerald-850 transition-colors">
                              {related.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(related.published_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </aside>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-10/40 pb-20">
      
      {/* Blog Hero Section */}
      <div className="relative bg-emerald-900 text-white overflow-hidden py-16 md:py-24 border-b border-emerald-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800 via-emerald-950 to-slate-950 opacity-95"></div>
        
        {/* Abstract farm pattern simulator lines */}
        <div className="absolute inset-0 opacity-10 flex flex-col justify-between pointer-events-none">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold tracking-widest uppercase inline-block mb-4">
              {tView.bannerTag}
            </span>
            <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight leading-none text-white">
              {tView.bannerTitlePart1} <br />
              <span className="text-amber-400">{tView.bannerTitlePart2}</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-emerald-100 font-medium max-w-2xl leading-relaxed">
              {tView.bannerDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Feed Side (Left 3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Filter control bar & Search with absolute beauty */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-450" />
                <input
                  type="text"
                  placeholder={tView.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all bg-slate-50/50"
                />
              </div>
              <div className="text-xs text-slate-500 font-mono font-medium">
                {tView.foundCount} <span className="font-extrabold text-emerald-800">{filteredPosts.length}</span> {tView.articlesText}
              </div>
            </div>

            {/* Category selection horizontal rail */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-emerald-850 text-white shadow-sm'
                    : 'bg-white border border-emerald-100 text-slate-600 hover:bg-slate-50 hover:text-emerald-950'
                }`}
              >
                {tView.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-850 text-white shadow-sm'
                      : 'bg-white border border-emerald-100 text-slate-600 hover:bg-slate-50 hover:text-emerald-950'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Loader */}
            {isLoading ? (
              <div className="bg-white rounded-3xl p-16 border border-emerald-50 text-center shadow-sm">
                <div className="inline-block w-8 h-8 rounded-full border-4 border-emerald-800/20 border-t-emerald-800 animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-500 font-mono tracking-wide">{tView.loadingDb}</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-emerald-50 text-center shadow-sm">
                <p className="text-base font-extrabold text-[#064e3b] mb-1">{tView.noArticlesTitle}</p>
                <p className="text-sm text-slate-500">{tView.noArticlesDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => {
                  const postCat = categories.find(c => Number(c.id) === Number(post.category_id));
                  return (
                    <motion.article
                      whileHover={{ y: -4 }}
                      key={post.id}
                      onClick={() => handleOpenPost(post)}
                      className="bg-white rounded-3xl overflow-hidden border border-emerald-50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[460px] cursor-pointer group"
                    >
                      {/* Image header portion */}
                      <div className="h-48 w-full overflow-hidden relative bg-slate-100 shrink-0">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {postCat && (
                          <span className="absolute top-4 left-4 bg-emerald-950/90 text-white text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full shadow-xs">
                            {postCat.name}
                          </span>
                        )}
                        {post.is_featured && (
                          <span className="absolute top-4 right-4 bg-amber-500 text-amber-950 text-[10px] uppercase font-heavy tracking-wider py-1 px-3 rounded-full shadow-xs">
                            {tView.featuredTag}
                          </span>
                        )}
                      </div>

                      {/* Content representation */}
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <div className="flex items-center text-slate-400 text-xs font-semibold space-x-3 mb-3">
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              {formatDate(post.published_at)}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              {post.views || 0} {tView.postViews}
                            </span>
                          </div>
                          <h3 className="text-xl font-extrabold text-emerald-950 font-sans tracking-tight leading-snug line-clamp-2 group-hover:text-emerald-850 duration-200 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-550 leading-relaxed mt-3 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Read action */}
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-xs text-emerald-850 font-extrabold group-hover:translate-x-1 duration-200 transition-all flex items-center">
                            <span>{tView.readFull}</span>
                            <ArrowRight className="w-4.5 h-4.5 ml-1" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}

          </div>

          {/* Sidebar Section (Right 1 col) */}
          <div className="space-y-8">
            
            {/* Shigueno Heritage Quick Box */}
            <div className="bg-emerald-950 text-white rounded-3xl p-6 border-2 border-emerald-805 relative overflow-hidden shadow-sm">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
              
              <h4 className="text-lg font-black font-sans uppercase tracking-tight text-white mb-2 leading-tight">
                {tView.heritageTitle}
              </h4>
              <p className="text-[#a7f3d0] text-xs font-mono font-medium block uppercase tracking-widest mb-4">
                {tView.heritageSub}
              </p>
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {tView.heritageDesc}
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                {tView.heritageHq}
              </div>
            </div>

            {/* Simulated Newsletter Signup widget */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
              <h4 className="font-extrabold text-emerald-950 text-base mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-1.5 text-emerald-850 shrink-0" />
                <span>{tView.newsletterTitle}</span>
              </h4>
              <p className="text-xs text-slate-550 leading-relaxed mb-5">
                {tView.newsletterSidebarDesc}
              </p>

              {newsletterSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 text-center text-xs font-bold"
                >
                  <Check className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                  <span>{tView.newsletterSidebarSuccess}</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribeNewsletter} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tView.newsletterPlaceholder}
                      className="w-full px-3 py-2.5 border border-slate-205 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-850 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center transition-colors shadow-xs"
                  >
                    <span>{tView.newsletterBtn}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Dynamic Blog Authors sidebar overview */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
              <h4 className="font-extrabold text-emerald-950 text-base mb-4">
                {tView.editorialTitle}
              </h4>
              <div className="space-y-4">
                {authors.slice(0, 3).map((author) => (
                  <div key={author.id} className="flex items-center space-x-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-emerald-200">
                      <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none">{author.name}</p>
                      <p className="text-[10px] text-emerald-800 font-semibold mt-1 leading-none">{author.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
