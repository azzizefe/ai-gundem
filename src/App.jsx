import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, LayoutGrid, Flame, Compass, Bookmark, Trash2, LogIn, LogOut, X, Info, Send, CheckCircle, XCircle, Clock, Edit2, Code, BookOpen } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import './App.css';

// --- FIREBASE CONFIGURATION ---
// Buraya Firebase konsolundan aldığınız bilgileri yapıştırın:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (only if apiKey is provided)
let db = null;
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

const INITIAL_POSTS = [

  {
    id: 'p1',
    title: "OPENPLANTER",
    summary: "Terminal tabanlı bir arayüze sahip, karmaşık veri setlerini analiz eden bir araç.",
    description: "Terminal tabanlı bir arayüze sahip, karmaşık veri setlerini analiz ederek aralarındaki gizli bağlantıları keşfeden bir araç.",
    categories: ["Yapay Zeka"],
    tag: "Eğitim",
    link: "https://github.com/ShinMegamiBoson/OpenPlanter",
    isPaid: false,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    author: "Yönetici",
    date: "Bugün"
  }
];

const CATEGORIES_DATA = {
  'Hepsi': [],
  'Siber Güvenlik': ['Pentest', 'Phishing', 'Malware', 'Ağ Güvenliği', 'Diğer'],
  'Yapay Zeka': ['Chatbot', 'Machine Learning', 'Deep Learning', 'NLP', 'Diğer'],
  'Frontend': ['React', 'Vue', 'Next.js', 'CSS', 'Tailwind', 'Diğer'],
  'Backend': ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Docker', 'Diğer'],
  'Mobil Geliştirme': ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Diğer'],
  'Bulut Bilişim': ['AWS', 'Azure', 'Kubernetes', 'Serverless', 'Diğer'],
  'n8n': ['Otomasyon', 'Workflow', 'Node-RED', 'Entegrasyon', 'Diğer'],
  'Görsel İçerik': ['Midjourney', 'DALL-E', 'Canva', 'Tasarım', 'Diğer'],
  'Video İçerik': ['Sora', 'Runway', 'Pika', 'Kurgu', 'Diğer'],
  'Mimari': ['Microservices', 'Design Patterns', 'System Design', 'Diğer'],
  'Projeler': ['Yapay Zeka', 'Web', 'Otomasyon', 'Uygulama', 'Diğer'],
  'Kurslar': ['Yapay Zeka', 'Programlama', 'Tasarım', 'Pazarlama', 'Diğer'],
  'Diğer': ['Genel', 'Kariyer', 'Haberler', 'Eğitim']
};

const CATEGORIES = Object.keys(CATEGORIES_DATA);

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80';

// Base64 veriyi temizle - localStorage sınırını aşmamak için
const sanitizePostsForStorage = (posts) => {
  return posts.map(post => {
    if (post.image && post.image.startsWith('data:')) {
      return { ...post, image: DEFAULT_IMAGE };
    }
    return post;
  });
};

const mergeWithInitialPosts = (loadedPosts) => {
  const merged = [...loadedPosts];
  INITIAL_POSTS.forEach(initialPost => {
    if (!merged.find(p => p.id === initialPost.id)) {
      merged.push(initialPost);
    }
  });
  return merged;
};

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCategoriesInForm, setSelectedCategoriesInForm] = useState([]);
  const [selectedInfoPost, setSelectedInfoPost] = useState(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [suggestCategoriesInForm, setSuggestCategoriesInForm] = useState([]);
  const [editingPending, setEditingPending] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [isProjectForm, setIsProjectForm] = useState(false);
  const [isCourseForm, setIsCourseForm] = useState(false);

  // Load posts from backend
  // Load posts from backend (with fallback)
  useEffect(() => {
    const fetchPosts = async () => {
      // 1. Try Firebase first (Shared Cloud Data)
      if (db) {
        try {
          const q = query(collection(db, "posts"), orderBy("id", "desc"));
          const querySnapshot = await getDocs(q);
          const firebasePosts = querySnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
          if (firebasePosts.length > 0) {
            setPosts(mergeWithInitialPosts(firebasePosts));
            return;
          }
        } catch (dbErr) {
          console.error('Firebase fetching error:', dbErr);
        }
      }

      // 2. Try Node.js Backend (Local Dev)
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setPosts(mergeWithInitialPosts(data));
      } catch (err) {
        console.warn('Backend API failed, trying static fallback...');
        // 3. GitHub Pages static fallback
        try {
          const staticRes = await fetch(`${import.meta.env.BASE_URL}posts.json`);
          if (!staticRes.ok) throw new Error('Static File Error');
          const staticData = await staticRes.json();
          setPosts(mergeWithInitialPosts(staticData));
        } catch (staticErr) {
          // 4. LocalStorage fallback
          const saved = localStorage.getItem('daily_dev_posts_fallback') || localStorage.getItem('daily_dev_posts');
          if (saved && saved !== '[]') {
            try {
              const parsed = JSON.parse(saved);
              setPosts(mergeWithInitialPosts(sanitizePostsForStorage(parsed)));
            } catch (e) {
              setPosts(INITIAL_POSTS);
            }
          } else {
            setPosts(INITIAL_POSTS);
          }
        }
      }
    };
    fetchPosts();
  }, []);

  // Load pending posts from localStorage
  useEffect(() => {
    const savedPending = localStorage.getItem('ai_site_pending_posts');
    if (savedPending) {
      setPendingPosts(JSON.parse(savedPending));
    }
  }, []);

  // Save to localStorage as a fallback backup whenever posts change
  // Base64 resimleri temizle - localStorage sınırını aşmamak için
  useEffect(() => {
    if (posts.length > 0) {
      const safePosts = sanitizePostsForStorage(posts);
      try {
        localStorage.setItem('daily_dev_posts_fallback', JSON.stringify(safePosts));
        localStorage.setItem('daily_dev_posts', JSON.stringify(safePosts));
      } catch (e) {
        console.warn('localStorage kayıt hatası:', e);
      }
    }
  }, [posts]);

  // Save pending posts to localStorage
  useEffect(() => {
    localStorage.setItem('ai_site_pending_posts', JSON.stringify(pendingPosts));
  }, [pendingPosts]);

  useEffect(() => {
    setSelectedTag(null);
  }, [selectedCategory]);

  const addPost = async (newPost) => {
    // Firebase Sync
    if (db) {
      try {
        const docRef = await addDoc(collection(db, "posts"), newPost);
        newPost.firebaseId = docRef.id;
        setPosts([newPost, ...posts]);
      } catch (e) {
        console.error("Firebase Add Error:", e);
      }
    } else {
      // API Fallback
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost)
        });
        if (!response.ok) throw new Error('API Error');
        const addedPost = await response.json();
        setPosts([addedPost, ...posts]);
      } catch (err) {
        // Fallback
        newPost.id = Date.now();
        setPosts([newPost, ...posts]);
      }
    }
    setShowAdminForm(false);
    setSelectedCategoriesInForm([]);
  };

  const deletePost = async (e, post) => {
    const id = post.id;
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
      if (db && post.firebaseId) {
        try {
          await deleteDoc(doc(db, "posts", post.firebaseId));
          setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
          console.error("Firebase Delete Error:", err);
        }
      } else {
        try {
          const response = await fetch(`/api/posts/${id}`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('API Error');
          setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
          setPosts(posts.filter(p => p.id !== id));
        }
      }
    }
  };

  const startEditPost = (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPost({ ...post });
  };

  const saveEditPost = async () => {
    if (db && editingPost.firebaseId) {
      try {
        const postRef = doc(db, "posts", editingPost.firebaseId);
        await updateDoc(postRef, editingPost);
        setPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost : p));
      } catch (err) {
        console.error("Firebase Update Error:", err);
      }
    } else {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost : p));
    }
    setEditingPost(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Yeni gizli kimlik bilgileri
    if (formData.get('username') === 'nulladmin22' && formData.get('password') === '!!12345.') {
      setIsLogged(true);
      setShowLoginModal(false);
    } else {
      alert('Hatalı giriş!');
    }
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategoriesInForm(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };
  const handleSuggestCategoryToggle = (cat) => {
    setSuggestCategoriesInForm(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const submitSuggestion = (newPost) => {
    newPost.id = Date.now();
    newPost.status = 'pending';
    setPendingPosts([newPost, ...pendingPosts]);
    setShowSuggestForm(false);
    setSuggestCategoriesInForm([]);
    alert('Gönderi öneriniz alındı! Admin onayından sonra yayınlanacaktır.');
  };

  const approvePost = (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    const edits = editingPending[post.id] || {};
    const approvedPost = { ...post, ...edits };
    delete approvedPost.status;
    approvedPost.date = 'Bugün';
    setPosts(prev => [approvedPost, ...prev]);
    setPendingPosts(prev => prev.filter(p => p.id !== post.id));
    setEditingPending(prev => { const n = { ...prev }; delete n[post.id]; return n; });
  };

  const updatePendingField = (postId, field, value) => {
    setEditingPending(prev => ({
      ...prev,
      [postId]: { ...(prev[postId] || {}), [field]: value }
    }));
  };

  const rejectPost = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bu öneriyi reddetmek istediğinize emin misiniz?')) {
      setPendingPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredPosts = posts.filter(p => {
    const categories = p.categories || [p.category]; // Backwards compatibility
    const categoryMatch = selectedCategory === 'Hepsi' || categories.includes(selectedCategory);
    const tagMatch = !selectedTag || p.tag === selectedTag || (p.summary + p.title).toLowerCase().includes(selectedTag.toLowerCase());
    return categoryMatch && tagMatch;
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">n</span>
            <span className="logo-text">nullai.dev</span>
          </div>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Haberlerde ara..." />
            <div className="search-shortcut">Ctrl K</div>
          </div>
        </div>
        <div className="header-right">
          {isLogged ? (
            <button className="admin-btn active" onClick={() => setIsLogged(false)}>
              <LogOut size={18} /> <span>Çıkış Yap</span>
            </button>
          ) : (
            <button className="admin-btn" onClick={() => setShowLoginModal(true)}>
              <LogIn size={18} /> <span>Yönetici Girişi</span>
            </button>
          )}
          <button className="icon-btn"><Bell size={20} /></button>
          <div className="user-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav>
            <section>
              <h3 className="nav-title">Menü</h3>
              <ul>
                <li className={selectedCategory === 'Hepsi' ? 'active' : ''} onClick={() => setSelectedCategory('Hepsi')}>
                  <LayoutGrid size={20} /> <span>Senin İçin</span>
                </li>
                <li><Flame size={20} /> <span>Popüler</span></li>
                <li className={selectedCategory === 'Kurslar' ? 'active' : ''} onClick={() => setSelectedCategory('Kurslar')}>
                  <BookOpen size={20} /> <span>Kurslar</span>
                </li>
                <li><Bookmark size={20} /> <span>Yer İşaretleri</span></li>
                <li className={selectedCategory === 'Projeler' ? 'active' : ''} onClick={() => setSelectedCategory('Projeler')}>
                  <Code size={20} /> <span>Projeler</span>
                </li>
                <li className="suggest-post-item" onClick={() => {
                  setIsProjectForm(false);
                  setIsCourseForm(false);
                  setShowSuggestForm(true);
                }}>
                  <Send size={20} /> <span>Link Öner</span>
                </li>
                {isLogged && (
                  <li className="new-post-item" onClick={() => {
                    setIsProjectForm(false);
                    setIsCourseForm(false);
                    setShowAdminForm(true);
                  }}>
                    <Plus size={20} /> <span>Yeni Link Ekle</span>
                  </li>
                )}
                {isLogged && (
                  <li className="pending-item" onClick={() => setShowPendingModal(true)}>
                    <Clock size={20} />
                    <span>Onay Bekleyenler</span>
                    {pendingPosts.length > 0 && (
                      <span className="pending-badge">{pendingPosts.length}</span>
                    )}
                  </li>
                )}
              </ul>
            </section>

            <section>
              <h3 className="nav-title">Kategoriler</h3>
              <ul>
                {CATEGORIES.map(cat => (
                  <li
                    key={cat}
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{cat === 'Hepsi' ? '🔥 Hepsi' : cat}</span>
                  </li>
                ))}
              </ul>
            </section>
          </nav>
        </aside>

        {/* Content */}
        <main className="content">
          <div className="feed-header">
            <div className="feed-title-row">
              <h1>{selectedCategory === 'Hepsi' ? 'Akış' : selectedCategory}</h1>
              {selectedCategory === 'Projeler' && (
                <button
                  className="add-project-btn"
                  onClick={() => {
                    setIsProjectForm(true);
                    setIsCourseForm(false);
                    setSelectedCategoriesInForm(['Projeler']);
                    isLogged ? setShowAdminForm(true) : setShowSuggestForm(true);
                  }}
                >
                  <Plus size={18} /> <span>Proje Ekle</span>
                </button>
              )}
              {selectedCategory === 'Kurslar' && (
                <button
                  className="add-project-btn add-course-btn"
                  onClick={() => {
                    setIsProjectForm(false);
                    setIsCourseForm(true);
                    setSelectedCategoriesInForm(['Kurslar']);
                    isLogged ? setShowAdminForm(true) : setShowSuggestForm(true);
                  }}
                >
                  <Plus size={18} /> <span>Kurs Ekle</span>
                </button>
              )}
            </div>

            {/* Tags Bar */}
            {CATEGORIES_DATA[selectedCategory] && CATEGORIES_DATA[selectedCategory].length > 0 && (
              <div className="tags-bar">
                <button
                  className={!selectedTag ? 'active' : ''}
                  onClick={() => setSelectedTag(null)}
                >
                  Hepsi
                </button>
                {CATEGORIES_DATA[selectedCategory].map(tag => (
                  <button
                    key={tag}
                    className={selectedTag === tag ? 'active' : ''}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="posts-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="post-card-wrapper">
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="post-card">
                  <div className="post-image">
                    <img src={post.image} alt={post.title} />
                    {post.isPaid !== undefined && (
                      <div className={`post-price-badge ${post.isPaid ? 'paid' : 'free'}`}>
                        {post.isPaid ? 'Ücretli' : 'Ücretsiz'}
                      </div>
                    )}
                    <div className="post-categories">
                      {(post.categories || [post.category]).map(cat => (
                        <span key={cat} className="post-category-tag">{cat}</span>
                      ))}
                    </div>
                  </div>
                  <div className="post-info">
                    <h3>{post.title}</h3>
                    <p>{post.summary}</p>
                    <div className="post-footer">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    {post.submittedBy && (
                      <div className="submitted-by">
                        <Send size={12} /> Öneren: {post.submittedBy}
                      </div>
                    )}
                  </div>
                </a>
                {post.description && (
                  <button className="info-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedInfoPost(post); }} title="Detaylı Bilgi">
                    <Info size={16} />
                  </button>
                )}
                {isLogged && (
                  <button className="edit-btn" onClick={(e) => startEditPost(e, post)} title="Düzenle">
                    <Edit2 size={16} />
                  </button>
                )}
                {isLogged && (
                  <button className="delete-btn" onClick={(e) => deletePost(e, post)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gönderiyi Düzenle</h2>
              <button onClick={() => setEditingPost(null)}><X size={24} /></button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Başlık</label>
                <input
                  value={editingPost.title}
                  onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Link</label>
                <input
                  value={editingPost.link}
                  onChange={e => setEditingPost({ ...editingPost, link: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Yazar</label>
              <input
                value={editingPost.author}
                onChange={e => setEditingPost({ ...editingPost, author: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Özet Açıklama</label>
              <textarea
                value={editingPost.summary}
                onChange={e => setEditingPost({ ...editingPost, summary: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Detaylı Açıklama</label>
              <textarea
                rows="5"
                value={editingPost.description || ''}
                onChange={e => setEditingPost({ ...editingPost, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setEditingPost(null)}>Vazgeç</button>
              <button type="button" className="submit-btn" onClick={saveEditPost}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content login-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yönetici Girişi</h2>
              <button onClick={() => setShowLoginModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Kullanıcı Adı</label>
                <input name="username" required placeholder="admin" autoComplete="off" />
              </div>
              <div className="form-group">
                <label>Şifre</label>
                <input type="password" name="password" required placeholder="••••" />
              </div>
              <button type="submit" className="submit-btn full-width">Giriş Yap</button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminForm && (
        <div className="modal-overlay" onClick={() => setShowAdminForm(false)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yeni Gönderi Paylaş</h2>
              <button onClick={() => setShowAdminForm(false)}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              if (selectedCategoriesInForm.length === 0) {
                alert('Lütfen en az bir kategori seçin!');
                return;
              }
              addPost({
                id: Date.now(),
                title: formData.get('title'),
                summary: (isProjectForm || isCourseForm) ? formData.get('description').substring(0, 100) + '...' : formData.get('summary'),
                description: formData.get('description') || '',
                categories: selectedCategoriesInForm,
                tag: isProjectForm ? "Fikir" : (isCourseForm ? "Eğitim" : formData.get('tag')),
                image: isProjectForm ? "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" : (isCourseForm ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" : (formData.get('imageUrl') || DEFAULT_IMAGE)),
                link: (isProjectForm || isCourseForm) ? "#" : formData.get('link'),
                isPaid: formData.get('isPaid') === 'true',
                author: "Yönetici",
                date: "Bugün"
              });
            }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>{(isProjectForm || isCourseForm) ? (isProjectForm ? 'Proje Adı' : 'Kurs Adı') : 'Başlık'}</label>
                  <input name="title" required placeholder={isProjectForm ? "Proje adı..." : (isCourseForm ? "Kurs adı..." : "Haber başlığı...")} />
                </div>
                {!isProjectForm && !isCourseForm && (
                  <div className="form-group">
                    <label>Link</label>
                    <input name="link" required placeholder="https://..." />
                  </div>
                )}
              </div>

              {isCourseForm && (
                <div className="form-group">
                  <label>Kurs Ücreti</label>
                  <div className="price-toggle-group">
                    <label className="price-radio">
                      <input type="radio" name="isPaid" value="false" defaultChecked />
                      <span>Ücretsiz</span>
                    </label>
                    <label className="price-radio">
                      <input type="radio" name="isPaid" value="true" />
                      <span>Ücretli</span>
                    </label>
                  </div>
                </div>
              )}

              {!isProjectForm && !isCourseForm && (
                <>
                  <div className="form-group">
                    <label>Kategoriler (Birden fazla seçilebilir)</label>
                    <div className="category-checkbox-list">
                      {CATEGORIES.filter(c => c !== 'Hepsi').map(cat => (
                        <label key={cat} className={`category-checkbox ${selectedCategoriesInForm.includes(cat) ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selectedCategoriesInForm.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Baskın Etiket (İsteğe bağlı)</label>
                    <select name="tag">
                      <option value="">Seçilmedi</option>
                      {selectedCategoriesInForm.length > 0 && CATEGORIES_DATA[selectedCategoriesInForm[0]].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Özet Açıklama</label>
                    <textarea name="summary" required placeholder="Okuyucular için kısa bir özet yazın..." />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Uzun Açıklama</label>
                <textarea name="description" rows={(isProjectForm || isCourseForm) ? "10" : "6"} required={isProjectForm || isCourseForm} placeholder="Detaylı açıklama metni yazın..." />
              </div>

              {!isProjectForm && !isCourseForm && (
                <div className="form-group">
                  <label>Fotoğraf URL'si</label>
                  <input name="imageUrl" placeholder="https://images.unsplash.com/... (boş bırakılırsa varsayılan kullanılır)" />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowAdminForm(false);
                }}>Vazgeç</button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={selectedCategoriesInForm.length === 0}
                >
                  Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suggest Link Modal */}
      {showSuggestForm && (
        <div className="modal-overlay" onClick={() => setShowSuggestForm(false)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Link Öner</h2>
              <button onClick={() => setShowSuggestForm(false)}><X size={24} /></button>
            </div>
            <div className="suggest-notice">
              <Clock size={16} />
              <span>Öneriniz admin onayından sonra yayınlanacaktır.</span>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              if (suggestCategoriesInForm.length === 0) {
                alert('Lütfen en az bir kategori seçin!');
                return;
              }
              if (!formData.get('submittedBy').trim()) {
                alert('Lütfen adınızı girin!');
                return;
              }
              submitSuggestion({
                title: formData.get('title'),
                summary: (isProjectForm || isCourseForm) ? formData.get('description').substring(0, 100) + '...' : formData.get('summary'),
                description: formData.get('description') || '',
                categories: suggestCategoriesInForm,
                tag: isProjectForm ? "Fikir" : (isCourseForm ? "Eğitim" : formData.get('tag')),
                image: isProjectForm ? "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" : (isCourseForm ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" : (formData.get('imageUrl') || DEFAULT_IMAGE)),
                link: (isProjectForm || isCourseForm) ? "#" : formData.get('link'),
                isPaid: formData.get('isPaid') === 'true',
                author: formData.get('submittedBy').trim(),
                submittedBy: formData.get('submittedBy').trim()
              });
            }}>
              <div className="form-group">
                <label>Adınız / Kullanıcı Adınız *</label>
                <input name="submittedBy" required placeholder="Adınızı yazın..." />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>{(isProjectForm || isCourseForm) ? (isProjectForm ? 'Proje Adı *' : 'Kurs Adı *') : 'Başlık *'}</label>
                  <input name="title" required placeholder={isProjectForm ? "Proje adı..." : (isCourseForm ? "Kurs adı..." : "Haber başlığı...")} />
                </div>
                {!isProjectForm && !isCourseForm && (
                  <div className="form-group">
                    <label>Link *</label>
                    <input name="link" required placeholder="https://..." />
                  </div>
                )}
              </div>

              {isCourseForm && (
                <div className="form-group">
                  <label>Kurs Ücreti</label>
                  <div className="price-toggle-group">
                    <label className="price-radio">
                      <input type="radio" name="isPaid" value="false" defaultChecked />
                      <span>Ücretsiz</span>
                    </label>
                    <label className="price-radio">
                      <input type="radio" name="isPaid" value="true" />
                      <span>Ücretli</span>
                    </label>
                  </div>
                </div>
              )}

              {!isProjectForm && !isCourseForm && (
                <>
                  <div className="form-group">
                    <label>Kategoriler (Birden fazla seçilebilir) *</label>
                    <div className="category-checkbox-list">
                      {CATEGORIES.filter(c => c !== 'Hepsi').map(cat => (
                        <label key={cat} className={`category-checkbox ${suggestCategoriesInForm.includes(cat) ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={suggestCategoriesInForm.includes(cat)}
                            onChange={() => handleSuggestCategoryToggle(cat)}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Baskın Etiket (İsteğe bağlı)</label>
                    <select name="tag">
                      <option value="">Seçilmedi</option>
                      {suggestCategoriesInForm.length > 0 && CATEGORIES_DATA[suggestCategoriesInForm[0]].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Özet Açıklama *</label>
                    <textarea name="summary" required placeholder="Okuyucular için kısa bir özet yazın..." />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Uzun Açıklama *</label>
                <textarea name="description" rows={(isProjectForm || isCourseForm) ? "10" : "4"} required placeholder="Detaylı açıklama ekleyin..." />
              </div>

              {!isProjectForm && !isCourseForm && (
                <div className="form-group">
                  <label>Fotoğraf URL'si (İsteğe bağlı)</label>
                  <input name="imageUrl" placeholder="https://images.unsplash.com/... (boş bırakılırsa varsayılan kullanılır)" />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowSuggestForm(false);
                }}>Vazgeç</button>
                <button
                  type="submit"
                  className="submit-btn suggest-submit-btn"
                  disabled={suggestCategoriesInForm.length === 0}
                >
                  <Send size={16} /> Öneriyi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Posts Modal (Admin Only) */}
      {showPendingModal && isLogged && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal-content pending-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Onay Bekleyen Gönderiler ({pendingPosts.length})</h2>
              <button onClick={() => setShowPendingModal(false)}><X size={24} /></button>
            </div>
            {pendingPosts.length === 0 ? (
              <div className="pending-empty">
                <CheckCircle size={48} />
                <p>Onay bekleyen gönderi yok!</p>
              </div>
            ) : (
              <div className="pending-list">
                {pendingPosts.map(post => {
                  const edits = editingPending[post.id] || {};
                  return (
                    <div key={post.id} className="pending-card">
                      <div className="pending-card-image">
                        <img src={post.image} alt={post.title} />
                        <div className="pending-card-sender-badge">
                          <Send size={12} /> {post.submittedBy}
                        </div>
                        <div className="pending-card-categories">
                          {(post.categories || []).map(cat => (
                            <span key={cat} className="post-category-tag">{cat}</span>
                          ))}
                        </div>
                      </div>
                      <div className="pending-card-edit-area">
                        <div className="pending-edit-group">
                          <label>Başlık</label>
                          <input
                            type="text"
                            value={edits.title !== undefined ? edits.title : post.title}
                            onChange={e => updatePendingField(post.id, 'title', e.target.value)}
                          />
                        </div>
                        <div className="pending-edit-group">
                          <label>Link</label>
                          <input
                            type="text"
                            value={edits.link !== undefined ? edits.link : post.link}
                            onChange={e => updatePendingField(post.id, 'link', e.target.value)}
                          />
                        </div>
                        <div className="pending-edit-group">
                          <label>Özet Açıklama</label>
                          <textarea
                            rows="2"
                            value={edits.summary !== undefined ? edits.summary : post.summary}
                            onChange={e => updatePendingField(post.id, 'summary', e.target.value)}
                          />
                        </div>
                        <div className="pending-edit-group">
                          <label>Detaylı Açıklama</label>
                          <textarea
                            rows="3"
                            value={edits.description !== undefined ? edits.description : (post.description || '')}
                            onChange={e => updatePendingField(post.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="pending-card-actions">
                        <a href={edits.link || post.link} target="_blank" rel="noopener noreferrer" className="pending-link-btn" onClick={e => e.stopPropagation()}>
                          Linki Aç ↗
                        </a>
                        <div className="pending-actions-right">
                          <button type="button" className="reject-btn" onClick={(e) => rejectPost(e, post.id)}>
                            <XCircle size={16} /> Reddet
                          </button>
                          <button type="button" className="approve-btn" onClick={(e) => approvePost(e, post)}>
                            <CheckCircle size={16} /> Onayla
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Detail Modal */}
      {selectedInfoPost && (
        <div className="modal-overlay" onClick={() => setSelectedInfoPost(null)}>
          <div className="modal-content info-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedInfoPost.title}</h2>
              <button onClick={() => setSelectedInfoPost(null)}><X size={24} /></button>
            </div>
            <div className="info-modal-body">
              <div className="info-modal-image">
                <img src={selectedInfoPost.image} alt={selectedInfoPost.title} />
                <div className="info-modal-categories">
                  {(selectedInfoPost.categories || [selectedInfoPost.category]).map(cat => (
                    <span key={cat} className="post-category-tag">{cat}</span>
                  ))}
                </div>
              </div>
              <div className="info-modal-meta">
                <span>{selectedInfoPost.author}</span>
                <span>•</span>
                <span>{selectedInfoPost.date}</span>
                {selectedInfoPost.tag && <span className="info-modal-tag">{selectedInfoPost.tag}</span>}
              </div>
              <div className="info-modal-description">
                {selectedInfoPost.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <a href={selectedInfoPost.link} target="_blank" rel="noopener noreferrer" className="info-modal-link">
                Habere Git →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
