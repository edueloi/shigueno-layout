import React from 'react';
import { 
  Plus, Trash2, Edit, Save, PlusCircle, Check, X, FileText, 
  Tag, Users, Settings, Newspaper, Image, Link, Eye, Calendar, EyeOff, AlertCircle
} from 'lucide-react';

interface BlogPost {
  id?: number;
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
  id?: number;
  name: string;
  description: string;
}

interface BlogAuthor {
  id?: number;
  name: string;
  role: string;
  bio: string;
  instagram: string;
  avatar_url: string;
}

interface BlogManagerProps {
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onSettingsUpdate?: () => void;
}

const PRESET_UNSPLASH_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=800&auto=format&fit=crop&q=80', label: 'Laranjas no Galho (Citros)' },
  { url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop&q=80', label: 'Ovos Brancos e Castanhos (Postura)' },
  { url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80', label: 'Nelore no Pasto (Gado)' },
  { url: 'https://images.unsplash.com/photo-1447078806655-40579c2520d6?w=800&auto=format&fit=crop&q=80', label: 'Colheita Agrícola (Geral)' },
  { url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80', label: 'Solo e Nutrição (Café)' }
];

export default function BlogManager({ authFetch, onSettingsUpdate }: BlogManagerProps) {
  const [activeSegment, setActiveSegment] = React.useState<'posts' | 'categories' | 'authors' | 'config'>('posts');
  
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [authors, setAuthors] = React.useState<BlogAuthor[]>([]);
  const [showBlogOnMenuSetting, setShowBlogOnMenuSetting] = React.useState<boolean>(true);
  
  const [loading, setLoading] = React.useState<boolean>(true);
  const [toastSuccess, setToastSuccess] = React.useState<string | null>(null);
  const [toastError, setToastError] = React.useState<string | null>(null);

  // Forms state
  const [postFormOpen, setPostFormOpen] = React.useState<boolean>(false);
  const [editingPostId, setEditingPostId] = React.useState<number | null>(null);
  const [postTitle, setPostTitle] = React.useState<string>('');
  const [postSlug, setPostSlug] = React.useState<string>('');
  const [postExcerpt, setPostExcerpt] = React.useState<string>('');
  const [postContent, setPostContent] = React.useState<string>('');
  const [postImageUrl, setPostImageUrl] = React.useState<string>('');
  const [postCategoryId, setPostCategoryId] = React.useState<number>(1);
  const [postAuthorId, setPostAuthorId] = React.useState<number>(1);
  const [postStatus, setPostStatus] = React.useState<string>('Publicado');
  const [postPublishedAt, setPostPublishedAt] = React.useState<string>('');
  const [postIsFeatured, setPostIsFeatured] = React.useState<boolean>(false);
  const [postTags, setPostTags] = React.useState<string>('');

  // Category template forms
  const [catFormOpen, setCatFormOpen] = React.useState<boolean>(false);
  const [editingCatId, setEditingCatId] = React.useState<number | null>(null);
  const [catName, setCatName] = React.useState<string>('');
  const [catDesc, setCatDesc] = React.useState<string>('');

  // Author template forms
  const [authorFormOpen, setAuthorFormOpen] = React.useState<boolean>(false);
  const [editingAuthorId, setEditingAuthorId] = React.useState<number | null>(null);
  const [authName, setAuthName] = React.useState<string>('');
  const [authRole, setAuthRole] = React.useState<string>('');
  const [authBio, setAuthBio] = React.useState<string>('');
  const [authInstagram, setAuthInstagram] = React.useState<string>('');
  const [authAvatarUrl, setAuthAvatarUrl] = React.useState<string>('');

  React.useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, aRes, sRes] = await Promise.all([
        fetch('/api/blog/posts'),
        fetch('/api/blog/categories'),
        fetch('/api/blog/authors'),
        fetch('/api/site-settings')
      ]);

      const [pData, cData, aData, sData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        aRes.json(),
        sRes.json()
      ]);

      if (pData.success) setPosts(pData.posts || []);
      if (cData.success) setCategories(cData.categories || []);
      if (aData.success) setAuthors(aData.authors || []);
      if (sData.success && sData.config) {
        setShowBlogOnMenuSetting(sData.config.show_blog_on_menu !== 'false');
      }
    } catch (e) {
      triggerError('Falha ao reverter base de posts do blog.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(null), 3500);
  };

  const triggerError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 4000);
  };

  // Convert Title to slug dynamically
  const handleTitleChange = (val: string) => {
    setPostTitle(val);
    if (!editingPostId) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-0\s-]/g, '') // remove special chars
        .replace(/[\s_]+/g, '-') // replace spaces
        .replace(/-+/g, '-'); // replace double hyphens
      setPostSlug(generatedSlug);
    }
  };

  // POSTS CRUD actions
  const handleOpenNewPost = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostSlug('');
    setPostExcerpt('');
    setPostContent('');
    setPostImageUrl(PRESET_UNSPLASH_IMAGES[0].url);
    setPostCategoryId(categories[0]?.id || 1);
    setPostAuthorId(authors[0]?.id || 1);
    setPostStatus('Publicado');
    
    // Set default local time string for datetime-local
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setPostPublishedAt(now.toISOString().slice(0, 16));
    
    setPostIsFeatured(false);
    setPostTags('');
    setPostFormOpen(true);
  };

  const handleOpenEditPost = (post: BlogPost) => {
    setEditingPostId(post.id || null);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostExcerpt(post.excerpt);
    setPostContent(post.content);
    setPostImageUrl(post.image_url);
    setPostCategoryId(post.category_id);
    setPostAuthorId(post.author_id);
    setPostStatus(post.status);
    
    // Format ISO to datetime-local
    const d = new Date(post.published_at);
    if (!isNaN(d.getTime())) {
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setPostPublishedAt(d.toISOString().slice(0, 16));
    } else {
      setPostPublishedAt('');
    }
    
    setPostIsFeatured(post.is_featured);
    setPostTags(post.tags || '');
    setPostFormOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const postPayload: BlogPost = {
        title: postTitle,
        slug: postSlug || postTitle.toLowerCase().replace(/\s+/g, '-'),
        excerpt: postExcerpt,
        content: postContent,
        image_url: postImageUrl,
        category_id: Number(postCategoryId),
        author_id: Number(postAuthorId),
        status: postStatus,
        views: editingPostId ? (posts.find(p => p.id === editingPostId)?.views || 0) : 0,
        published_at: postPublishedAt ? new Date(postPublishedAt).toISOString() : new Date().toISOString(),
        is_featured: postIsFeatured,
        tags: postTags
      };

      if (editingPostId) {
        postPayload.id = editingPostId;
      }

      // Enforce auth headers
      const res = await authFetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });

      const data = await res.json();
      if (data.success) {
        triggerSuccess('Postagem gravada no banco de dados SQLite com sucesso!');
        setPostFormOpen(false);
        loadAllData();
      } else {
        triggerError(data.error || 'Erro ao persistir postagem.');
      }
    } catch (err: any) {
      triggerError(err.message || 'Erro de conexão de rede.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este artigo? Esta ação é irreversível.')) return;
    try {
      setLoading(true);
      const res = await authFetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Artigo excluído do catálogo.');
        loadAllData();
      } else {
        triggerError('Erro ao deletar postagem.');
      }
    } catch (e) {
      triggerError('Falha ao comunicar exclusão.');
    } finally {
      setLoading(false);
    }
  };

  // CATEGORIES CRUD Actions
  const handleOpenNewCat = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDesc('');
    setCatFormOpen(true);
  };

  const handleOpenEditCat = (cat: BlogCategory) => {
    setEditingCatId(cat.id || null);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatFormOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: BlogCategory = { name: catName, description: catDesc };
      if (editingCatId) payload.id = editingCatId;

      const res = await authFetch('/api/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Categoria gravada com sucesso!');
        setCatFormOpen(false);
        loadAllData();
      } else {
        triggerError('Erro de processamento da Categoria.');
      }
    } catch (err) {
      triggerError('Erro de rede.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Tem certeza? Postagens associadas a esta categoria perderão o vínculo.')) return;
    try {
      setLoading(true);
      const res = await authFetch(`/api/blog/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Categoria removida.');
        loadAllData();
      } else {
        triggerError('Erro ao exvluir categoria.');
      }
    } catch (e) {
      triggerError('Erro de comunicação.');
    } finally {
      setLoading(false);
    }
  };

  // AUTHORS CRUD Actions
  const handleOpenNewAuthor = () => {
    setEditingAuthorId(null);
    setAuthName('');
    setAuthRole('');
    setAuthBio('');
    setAuthInstagram('');
    setAuthAvatarUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setAuthorFormOpen(true);
  };

  const handleOpenEditAuthor = (author: BlogAuthor) => {
    setEditingAuthorId(author.id || null);
    setAuthName(author.name);
    setAuthRole(author.role);
    setAuthBio(author.bio);
    setAuthInstagram(author.instagram);
    setAuthAvatarUrl(author.avatar_url);
    setAuthorFormOpen(true);
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: BlogAuthor = {
        name: authName,
        role: authRole,
        bio: authBio,
        instagram: authInstagram,
        avatar_url: authAvatarUrl
      };
      if (editingAuthorId) payload.id = editingAuthorId;

      const res = await authFetch('/api/blog/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Perfil do autor gravado com sucesso!');
        setAuthorFormOpen(false);
        loadAllData();
      } else {
        triggerError('Falha ao salvar autor.');
      }
    } catch (err) {
      triggerError('Erro de rede.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (!window.confirm('Tem certeza? Artigos vinculados a este perfil continuarão existindo sem autor.')) return;
    try {
      setLoading(true);
      const res = await authFetch(`/api/blog/authors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Perfil de autor excluído.');
        loadAllData();
      } else {
        triggerError('Veto na exclusão.');
      }
    } catch (e) {
      triggerError('Erro de comunicação.');
    } finally {
      setLoading(false);
    }
  };

  // MENU VISIBILITY MANAGEMENT (que ele define se menu ira aparecer ou nao)
  const handleSaveMenuSetting = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          show_blog_on_menu: String(showBlogOnMenuSetting)
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess('Configuração de menu atualizada com sucesso!');
        if (typeof onSettingsUpdate === 'function') {
          onSettingsUpdate();
        }
      } else {
        triggerError('Veto ao gravar preferências.');
      }
    } catch (err) {
      triggerError('Erro ao comunicar nova regra de menu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.025)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
      
      {/* Toast notifications */}
      {toastSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white font-extrabold p-4 px-5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs animate-in slide-in-from-bottom border border-emerald-700">
          <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
          <span>{toastSuccess}</span>
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-900 text-white font-extrabold p-4 px-5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs animate-in slide-in-from-bottom border border-red-750">
          <AlertCircle className="w-4 h-4 text-red-350 animate-pulse" />
          <span>{toastError}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Gerenciador de Artigos e Editorial</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-relaxed">
            Organize a distribuição de postagens do blog, defina visibilidades, controle agendamentos e configure o menu principal do site.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeSegment === 'posts' && (
            <button
              onClick={handleOpenNewPost}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-xs hover:shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Escrever Artigo</span>
            </button>
          )}
          {activeSegment === 'categories' && (
            <button
              onClick={handleOpenNewCat}
              className="px-5 py-2.5 bg-emerald-850 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-xs hover:shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          )}
          {activeSegment === 'authors' && (
            <button
              onClick={handleOpenNewAuthor}
              className="px-5 py-2.5 bg-emerald-850 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-xs hover:shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Autor</span>
            </button>
          )}
        </div>
      </div>

      {/* Internal Tabs styled beautifully */}
      <div className="flex border-b border-slate-100 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-1 bg-slate-50/50 p-1 rounded-2xl select-none">
        {[
          { key: 'posts', label: 'Artigos Escritos', icon: Newspaper },
          { key: 'categories', label: 'Categorias do Blog', icon: Tag },
          { key: 'authors', label: 'Perfis de Co-autores', icon: Users },
          { key: 'config', label: 'Visibilidade no Menu', icon: Settings }
        ].map((item) => {
          const active = activeSegment === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveSegment(item.key as any)}
              className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                active 
                  ? 'bg-white text-emerald-900 shadow-sm font-black' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Real-time KPI micro widgets exactly as requested, styled like reports section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2 animate-fade-in font-sans">
        
        {/* Total Artigos */}
        <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.025)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.045)] transition-all duration-300 select-none">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl shrink-0 flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Total de Artigos</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">{posts.length} posts</h4>
            <p className="text-[9px] text-emerald-700 font-bold font-mono">Banco Conectado</p>
          </div>
        </div>

        {/* Leituras Totais */}
        <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.025)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.045)] transition-all duration-300 select-none">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 flex items-center justify-center text-lg">
            👁️
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Leituras Totais</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">
              {posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString('pt-BR')}
            </h4>
            <p className="text-[9px] text-amber-600 font-black">Visualizações</p>
          </div>
        </div>

        {/* Publicados Ativos */}
        <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.025)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.045)] transition-all duration-300 select-none">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl shrink-0 flex items-center justify-center">
            <Check className="w-5 h-5 bg-transparent" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">No Ar / Ativos</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">
              {posts.filter(p => p.status === 'Publicado' && new Date(p.published_at) <= new Date()).length} artigos
            </h4>
            <p className="text-[9px] text-emerald-700 font-bold">Publicações vivas</p>
          </div>
        </div>

        {/* Agendados/Rascunho */}
        <div className="bg-white p-5 rounded-2xl flex items-center space-x-4 shadow-[0_4px_18px_rgba(0,0,0,0.025)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.045)] transition-all duration-300 select-none">
          <div className="p-3 bg-slate-50/80 text-slate-550 rounded-xl shrink-0 flex items-center justify-center">
            <Calendar className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide truncate">Pendentes / Rascunhos</p>
            <h4 className="text-lg font-black text-slate-900 mt-0.5 truncate">
              {posts.filter(p => p.status === 'Rascunho' || new Date(p.published_at) > new Date()).length} rascunhos
            </h4>
            <p className="text-[9px] text-slate-400 font-medium">Aguardando gatilho</p>
          </div>
        </div>

      </div>

      {loading && posts.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-4 border-emerald-800/20 border-t-emerald-800 animate-spin mb-4" />
          <p className="text-xs text-slate-500 font-semibold font-mono tracking-wide">Carregando artigos...</p>
        </div>
      ) : (
        <>
          {/* SEGMENT 1: ARTIGOS EM GRID (RESPONSIVO E SEM BORDAS) */}
          {activeSegment === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {posts.length === 0 ? (
                <div className="col-span-full py-16 text-center select-none bg-slate-50/40 rounded-3xl border border-dashed border-slate-150">
                  <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-extrabold text-slate-650">Nenhum artigo editorial escrito.</p>
                  <p className="text-xs text-slate-400 mt-1">Selecione "Escrever Artigo" para lançar no SQLite corporativo.</p>
                </div>
              ) : (
                posts.map((post) => {
                  const cat = categories.find(c => Number(c.id) === Number(post.category_id));
                  const author = authors.find(a => Number(a.id) === Number(post.author_id));
                  const isFuture = new Date(post.published_at) > new Date();
                  const statusMessage = post.status === 'Publicado' 
                    ? (isFuture ? 'Agendado' : 'Publicado') 
                    : 'Rascunho';

                  return (
                    <div 
                      key={post.id} 
                      className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_18px_rgba(0,0,0,0.025)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.055)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 group relative"
                    >
                      {/* Cover Banner with elegant overlay tags */}
                      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden shrink-0 select-none">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer" 
                        />
                        
                        {/* Upper category and status badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-emerald-900 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-xs">
                            {cat ? cat.name : 'Tema Agro'}
                          </span>
                          
                          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-xs ${
                            post.status === 'Rascunho' || post.status === 'rascunho'
                              ? 'bg-slate-100/90 backdrop-blur-xs text-slate-700'
                              : (isFuture ? 'bg-amber-100/95 text-amber-800' : 'bg-green-150/90 text-emerald-900')
                          }`}>
                            {statusMessage}
                          </span>
                        </div>

                        {post.is_featured && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 bg-amber-550 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-xs animate-pulse">
                              ★ Destaque
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                            <span>{new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <span className="mr-0.5">👁️</span>
                              {post.views || 0} acessos
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 group-hover:text-emerald-800 text-sm sm:text-base leading-snug transition-colors line-clamp-2">
                            {post.title}
                          </h4>

                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Co-author row and action dashboard drawer */}
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-150 shrink-0 bg-slate-50">
                              <img src={author?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-850 truncate leading-none">{author?.name || 'Editorial'}</p>
                              <p className="text-[8px] text-slate-400 font-mono mt-0.5 leading-none truncate">{author?.role || 'Shigueno'}</p>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => handleOpenEditPost(post)}
                              className="p-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-lg text-[10px] font-black flex items-center transition-all cursor-pointer"
                              title="Editar Artigo"
                            >
                              <Edit className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id!)}
                              className="p-1.5 bg-red-50/40 hover:bg-red-50 text-red-655 hover:text-red-800 rounded-lg text-[10px] font-bold flex items-center transition-all cursor-pointer"
                              title="Excluir Postagem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SEGMENT 2: CATEGORIAS EM LAYOUT EMBORDA-ZERO */}
          {activeSegment === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {categories.length === 0 ? (
                <div className="col-span-full py-16 text-center select-none bg-slate-50/40 rounded-3xl">
                  <Tag className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-650">Nenhuma categoria registrada.</p>
                  <p className="text-xs text-slate-400 mt-1">Crie canais para categorizar e filtrar matérias do blog.</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="bg-white rounded-2xl p-6 shadow-[0_4px_18px_rgba(0,0,0,0.022)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.045)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Vertical left aesthetic bar */}
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-800 rounded-l-2xl select-none" />
                    
                    <div className="pl-2">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[9px] font-black tracking-wide rounded-md">
                          CATEGORIA #ID {cat.id}
                        </span>
                        
                        <div className="flex space-x-0.5 items-center">
                          <button
                            onClick={() => handleOpenEditCat(cat)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-transform active:scale-90 cursor-pointer"
                            title="Editar Categoria"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id!)}
                            className="p-1.5 hover:bg-red-50 text-red-550 hover:text-red-700 rounded-lg transition-transform active:scale-90 cursor-pointer"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-extrabold text-slate-900 text-base mb-1">{cat.name}</h4>
                      <p className="text-xs text-slate-550 leading-relaxed font-semibold">{cat.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SEGMENT 3: AUTORES EM CARTÕES DE PERFIL SLICK */}
          {activeSegment === 'authors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {authors.length === 0 ? (
                <div className="col-span-full py-16 text-center select-none bg-slate-50/40 rounded-3xl">
                  <Users className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-655">Nenhum autor assinado.</p>
                  <p className="text-xs text-slate-400 mt-1">Crie perfis reais com fotos e biografias curriculares para os artigos.</p>
                </div>
              ) : (
                authors.map((author) => (
                  <div 
                    key={author.id} 
                    className="bg-white rounded-2xl p-6 shadow-[0_4px_18px_rgba(0,0,0,0.022)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.045)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 group"
                  >
                    <div>
                      {/* Photo Header layout */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-emerald-50 shadow-xs select-none bg-slate-50">
                          <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 truncate">
                          <h4 className="font-black text-slate-900 text-base leading-tight truncate">{author.name}</h4>
                          <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mt-1">{author.role}</p>
                          {author.instagram && (
                            <a 
                              href={`https://instagram.com/${author.instagram.replace('@', '')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[10px] text-slate-400 font-mono hover:text-emerald-800 mt-1.5 transition-colors cursor-pointer"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                              {author.instagram}
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Bio panel */}
                      <p className="text-xs text-slate-600 leading-relaxed italic block mb-5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        "{author.bio}"
                      </p>
                    </div>
                    
                    {/* Foot controls */}
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between font-mono text-[9px] text-slate-400">
                      <span>BIOGRAFIA ID #{author.id}</span>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleOpenEditAuthor(author)}
                          className="px-3 py-1.5 text-[10px] font-black bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAuthor(author.id!)}
                          className="px-3 py-1.5 text-[10px] font-bold bg-red-50/40 hover:bg-red-50 text-red-655 rounded-lg transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SEGMENT 4: MENU DE NAVEGAÇÃO INTEGRADO */}
          {activeSegment === 'config' && (
            <div className="max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_18px_rgba(0,0,0,0.025)] border-0 animate-fade-in">
              <h3 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center select-none">
                <Settings className="w-5 h-5 mr-1.5 text-emerald-800" />
                <span>Visualização do Menu de Navegação</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                O site principal exibe um link rápido "Blog" na barra de menu principal. Caso deseje ocultar a aba temporariamente para manutenção das matérias ou revisão técnica, ajuste a chave reguladora abaixo e grave automaticamente nas preferências do sistema.
              </p>

              <div className="space-y-6">
                <label className="flex items-center space-x-3.5 bg-slate-50/50 p-5 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={showBlogOnMenuSetting}
                    onChange={(e) => setShowBlogOnMenuSetting(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-805 focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Exibir link do Blog no menu principal do site</span>
                    <span className="text-[11px] text-slate-450 mt-0.5 block font-semibold leading-normal">Se ativado, "Blog" aparecerá de forma imediata na UI visitante.</span>
                  </div>
                </label>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSaveMenuSetting}
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Gravar Preferências de Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- MODAL DIALOGS --- */}
      
      {/* 2. POST FORM MODAL OVERLAY */}
      {postFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-350" onClick={() => setPostFormOpen(false)} />
          
          <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-0 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                  <span className="mr-2">✍️</span>
                  {editingPostId ? 'Editar Matéria do Blog' : 'Lançar Novo Artigo Editorial'}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5 uppercase">Integração Direta de Publicação — Granja Shigueno</p>
              </div>
              <button 
                onClick={() => setPostFormOpen(false)} 
                className="p-1 px-2.5 hover:bg-slate-100 rounded-lg text-slate-450 hover:text-slate-800 transition-colors font-extrabold text-xs cursor-pointer"
              >
                fechar
              </button>
            </div>

            {/* Split Editorial Pane */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN 1: FORM INPUTS (7cols) */}
                <form onSubmit={handleSavePost} className="lg:col-span-7 space-y-6">
                  
                  {/* Title Row */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Título de Capa</label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                      placeholder="Ex: Como a Nutrição de Precisão Reduz Desperdícios"
                    />
                  </div>

                  {/* Slug and tag grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Slug / URL Amigável (Auto-gerada)</label>
                      <input
                        type="text"
                        required
                        value={postSlug}
                        onChange={(e) => setPostSlug(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-100/70 border border-slate-200 text-slate-600 rounded-xl text-xs font-mono font-bold"
                        placeholder="url-amigavel-aqui"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Tags / Palavras-chave (separe por vírgula)</label>
                      <input
                        type="text"
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all font-semibold"
                        placeholder="ovos, qualidade, bem-estar, postura"
                      />
                    </div>
                  </div>

                  {/* Excerpt / Resumo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Resumo Curto (Aparece no card de entrada)</label>
                    <input
                      type="text"
                      required
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all font-semibold"
                      placeholder="Escreva uma frase de efeito rápida para reter o leitor..."
                    />
                  </div>

                  {/* Content body body text area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex justify-between items-center">
                      <span>Artigo Completo (Suporta Parágrafos de Texto)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Dica: Digite livremente e quebre linhas</span>
                    </label>
                    <textarea
                      rows={7}
                      required
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold leading-relaxed focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all font-mono"
                      placeholder="Divida sua redação técnica em parágrafos claros..."
                    />
                  </div>

                  {/* Core selectors row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Categoria Relacionada</label>
                      <select
                        value={postCategoryId}
                        onChange={(e) => setPostCategoryId(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-bold text-slate-705 cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Autor / Revisor Técnico</label>
                      <select
                        value={postAuthorId}
                        onChange={(e) => setPostAuthorId(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-bold text-slate-705 cursor-pointer"
                      >
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status and scheduling options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Status de Escrita</label>
                      <select
                        value={postStatus}
                        onChange={(e) => setPostStatus(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="Publicado">Publicado (Visivel ao Público) 🟢</option>
                        <option value="Rascunho">Rascunho (Manutenção Privada) ⚪</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-705 block">Data e Horário (Futuro agenda automaticamente)</label>
                      <input
                        type="datetime-local"
                        required
                        value={postPublishedAt}
                        onChange={(e) => setPostPublishedAt(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-mono font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Image input and Presets stack */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Foto de Capa do Post (Link Unsplash)</label>
                    <input
                      type="text"
                      required
                      value={postImageUrl}
                      onChange={(e) => setPostImageUrl(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-mono focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 transition-all"
                      placeholder="Cole o endereço da imagem..."
                    />

                    {/* Quick Presets list wrapper with beautiful visual touch */}
                    <div className="p-3 bg-slate-50/55 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-wider">💡 Sugestões / Temáticas Agrícolas:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_UNSPLASH_IMAGES.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPostImageUrl(img.url)}
                            className={`px-2.5 py-1 text-[10px] rounded-lg transition-all border font-bold cursor-pointer ${
                              postImageUrl === img.url 
                                ? 'bg-emerald-800 border-transparent text-white shadow-xs' 
                                : 'bg-white border-slate-150 hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feature Check toggle */}
                  <div className="p-4 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={postIsFeatured}
                        onChange={(e) => setPostIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-500 border-slate-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Fixar como Destaque Editorial Superior</span>
                        <span className="block text-[10px] text-slate-400 font-medium leading-normal">Posts destacados ganham visibilidade no carrossel de entrada na página do blog.</span>
                      </div>
                    </label>
                  </div>

                  {/* Actions Drawer */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-2.5 select-none">
                    <button
                      type="button"
                      onClick={() => setPostFormOpen(false)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-55 rounded-xl cursor-pointer"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer uppercase tracking-wider"
                    >
                      Gravar no Site
                    </button>
                  </div>

                </form>

                {/* COLUMN 2: REAL-TIME INTERACTIVE CARD VISUALIZER (5cols) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-4 lg:sticky lg:top-1 select-none">
                  <div className="flex items-center justify-between border-b border-rose-50/10 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">👁️ Preview em Tempo Real de Visitação</span>
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  </div>

                  {/* The interactive Card Replica container */}
                  <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_22px_rgba(0,0,0,0.035)] border border-slate-100/90 flex flex-col justify-between">
                    
                    {/* Visual Banner on Replica */}
                    <div className="relative aspect-video w-full bg-slate-100/80 overflow-hidden">
                      {postImageUrl ? (
                        <img src={postImageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                          <span className="text-xl mb-1">🖼️</span>
                          <span className="text-[10px] font-bold font-mono">Sem imagem de capa selecionada</span>
                        </div>
                      )}
                      
                      {/* Left Badge overlay on Replica card */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 bg-white/95 text-emerald-900 text-[8px] font-black uppercase tracking-wider rounded-lg shadow-xs">
                          {categories.find(c => Number(c.id) === Number(postCategoryId))?.name || 'Geral'}
                        </span>
                        
                        <span className="px-2.5 py-1 bg-green-900 text-white text-[8px] font-black uppercase tracking-wider rounded-lg shadow-xs">
                          {postStatus === 'Publicado' 
                            ? (postPublishedAt && new Date(postPublishedAt) > new Date() ? 'Agendado' : 'Publicado') 
                            : 'Rascunho'}
                        </span>
                      </div>

                      {postIsFeatured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 bg-amber-550 text-white text-[8px] font-black uppercase rounded-md shadow-xs">
                            ★ Destaque
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Title Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-mono">
                        <span>{postPublishedAt ? new Date(postPublishedAt).toLocaleDateString('pt-BR') : 'Data de Hoje'}</span>
                        <span>•</span>
                        <span>0 visualizações</span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug break-all line-clamp-2">
                        {postTitle || 'Título Provisório da Sua Matéria Editorial...'}
                      </h4>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {postExcerpt || 'Insira um resumo curto para observar o comportamento do espaçamento estético do conteúdo...'}
                      </p>

                      {/* Author Card line */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-205 shrink-0 bg-slate-50">
                            <img 
                              src={authors.find(a => Number(a.id) === Number(postAuthorId))?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt="" 
                              className="w-full h-full object-cover animate-pulse" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-800 leading-none">
                              {authors.find(a => Number(a.id) === Number(postAuthorId))?.name || 'Autor Editorial'}
                            </p>
                            <p className="text-[8px] text-slate-450 font-mono leading-none mt-0.5">
                              {authors.find(a => Number(a.id) === Number(postAuthorId))?.role || 'Granja Shigueno'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[8px] font-mono text-slate-400 bg-slate-50 p-1 px-2 rounded-md">Artigo Pronto</span>
                      </div>

                    </div>

                  </div>

                  {/* Side Helper Box inside Modal */}
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60 text-[11px] text-amber-900 leading-relaxed font-semibold">
                    ⭐ <span className="font-black text-amber-955">Como funciona a distribuição:</span> O site organiza os agendamentos de acordo com o carimbo de data. Qualquer alteração aqui é gravada instantaneamente em ambiente de produção.
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. CATEGORY MODAL */}
      {catFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setCatFormOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border-0 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
                <span className="mr-1.5">🏷️</span>
                {editingCatId ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
              </h3>
              <button onClick={() => setCatFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 transition-colors font-bold text-xs cursor-pointer">
                fechar
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-805/10 transition-all font-sans"
                  placeholder="Ex: Avicultura de Postura"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Descrição / Foco Temático</label>
                <textarea
                  rows={3}
                  required
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold leading-relaxed focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-805/10 transition-all"
                  placeholder="Explique o viés temático desta categoria..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCatFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Confirmar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. AUTHOR MODAL */}
      {authorFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-350" onClick={() => setAuthorFormOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border-0 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center">
                <span className="mr-1.5">✍️</span>
                {editingAuthorId ? 'Editar Co-autor Editorial' : 'Adicionar Co-autor Técnico'}
              </h3>
              <button onClick={() => setAuthorFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-800 transition-colors font-bold text-xs cursor-pointer">
                fechar
              </button>
            </div>
            <form onSubmit={handleSaveAuthor} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-805/10 transition-all"
                  placeholder="Ex: Dra. Marta Shigueno"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Cargo Institucional</label>
                  <input
                    type="text"
                    required
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-805/10 transition-all"
                    placeholder="Ex: Diretora de Sanidade"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 block">Instagram / Link Ficha</label>
                  <input
                    type="text"
                    value={authInstagram}
                    onChange={(e) => setAuthInstagram(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-805/10 transition-all font-mono"
                    placeholder="@marta_shigueno"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Biografia Editorial Acadêmica (resumida)</label>
                <textarea
                  rows={2}
                  required
                  value={authBio}
                  onChange={(e) => setAuthBio(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-semibold leading-relaxed focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-805/10 transition-all"
                  placeholder="Fale brevemente do histórico profissional ou acadêmico do profissional..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Foto de Avatar (URL Unsplash ou similar)</label>
                <input
                  type="text"
                  required
                  value={authAvatarUrl}
                  onChange={(e) => setAuthAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-mono focus:bg-white focus:border-emerald-800 focus:ring-2 focus:ring-emerald-850/10 transition-all text-slate-650"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAuthorFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-55 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Gravar Autor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
