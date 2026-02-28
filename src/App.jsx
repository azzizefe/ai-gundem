import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, LayoutGrid, Flame, Compass, Bookmark, Trash2, LogIn, LogOut, X, Camera } from 'lucide-react';
import './App.css';

const INITIAL_POSTS = [
  {
    id: 1,
    title: "React Server Components Rehberi",
    summary: "RSC'nin nasıl çalıştığı ve React geliştirmenin geleceği neden bu olduğu üzerine derinlemesine bir bakış.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    categories: ["Frontend"],
    tag: "React",
    link: "https://react.dev",
    author: "Dan Abramov",
    date: "28 Şubat"
  },
  {
    id: 2,
    title: "Ölçeklenebilir Yapay Zeka Uygulamaları",
    summary: "LLM'leri üretim ortamınıza entegre etmek için en iyi uygulamaları ve Chatbot stratejilerini öğrenin.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    categories: ["Yapay Zeka"],
    tag: "Chatbot",
    link: "https://openai.com",
    author: "Sam Altman",
    date: "27 Şubat"
  },
  {
    id: 3,
    title: "2026 İçin En İyi 10 Güvenlik Duruşu",
    summary: "Pentest ve modern sıfır gün açıklarına karşı altyapınızı nasıl koruyacağınızı öğrenin.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    categories: ["Siber Güvenlik"],
    tag: "Pentest",
    link: "https://krebsonsecurity.com",
    author: "Brian Krebs",
    date: "26 Şubat"
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
  'Veri Bilimi': ['Pandas', 'Analiz', 'Big Data', 'Görselleştirme', 'Diğer'],
  'Web3': ['Blockchain', 'Solidity', 'Ethereum', 'Smart Contracts', 'Diğer'],
  'Tasarım': ['Figma', 'UI Design', 'UX Research', 'Prototipleme', 'Diğer'],
  'Oyun Geliştirme': ['Unity', 'Unreal Engine', 'C#', '3D Modelleme', 'Diğer'],
  'DevOps': ['CI/CD', 'Terraform', 'Jenkins', 'Monitoring', 'Diğer'],
  'Veritabanı': ['NoSQL', 'SQL Optimization', 'Redis', 'MongoDB', 'Diğer'],
  'Test': ['Unit Testing', 'Selenium', 'Cypress', 'QA', 'Diğer'],
  'Mimari': ['Microservices', 'Design Patterns', 'System Design', 'Diğer'],
  'Diğer': ['Genel', 'Kariyer', 'Haberler', 'Eğitim']
};

const CATEGORIES = Object.keys(CATEGORIES_DATA);

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCategoriesInForm, setSelectedCategoriesInForm] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // Load posts from backend
  // Load posts from backend (with fallback)
  useEffect(() => {
    fetch('/api/posts')
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(data => setPosts(data))
      .catch(err => {
        const saved = localStorage.getItem('daily_dev_posts_fallback');
        if (saved) {
          setPosts(JSON.parse(saved));
        } else {
          setPosts(INITIAL_POSTS);
        }
      });
  }, []);

  // Save to localStorage as a fallback backup whenever posts change
  useEffect(() => {
    localStorage.setItem('daily_dev_posts_fallback', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    setSelectedTag(null);
  }, [selectedCategory]);

  const addPost = async (newPost) => {
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
    setShowAdminForm(false);
    setSelectedCategoriesInForm([]);
    setImagePreview(null);
  };

  const deletePost = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('API Error');
        setPosts(posts.filter(p => p.id !== id));
      } catch (err) {
        // Fallback
        setPosts(posts.filter(p => p.id !== id));
      }
    }
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for localStorage
        alert('Resim boyutu çok büyük! Lütfen 2MB altı bir görsel seçin.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
                <li><Compass size={20} /> <span>Keşfet</span></li>
                <li><Bookmark size={20} /> <span>Yer İşaretleri</span></li>
                {isLogged && (
                  <li className="new-post-item" onClick={() => setShowAdminForm(true)}>
                    <Plus size={20} /> <span>Yeni Link Ekle</span>
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
            <h1>{selectedCategory === 'Hepsi' ? 'Akış' : selectedCategory}</h1>

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
                  </div>
                </a>
                {isLogged && (
                  <button className="delete-btn" onClick={(e) => deletePost(e, post.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

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
                summary: formData.get('summary'),
                categories: selectedCategoriesInForm,
                tag: formData.get('tag'),
                image: imagePreview || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
                link: formData.get('link'),
                author: "Yönetici",
                date: "Bugün"
              });
            }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Başlık</label>
                  <input name="title" required placeholder="Haber başlığı..." />
                </div>
                <div className="form-group">
                  <label>Link</label>
                  <input name="link" required placeholder="https://..." />
                </div>
              </div>

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
              <div className="form-group">
                <label>Fotoğraf</label>
                <div className="image-upload-wrapper">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input-hidden"
                  />
                  <label htmlFor="image-upload" className="image-upload-label">
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} alt="Preview" />
                        <div className="preview-overlay">Resmi Değiştir</div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <Camera size={32} />
                        <span>Fotoğraf Seç</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowAdminForm(false);
                  setImagePreview(null);
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
    </div>
  );
}

export default App;
