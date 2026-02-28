const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Initial data if file doesn't exist
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
    }
];

// Load posts
const loadPosts = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_POSTS, null, 2));
        return INITIAL_POSTS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

// Save posts
const savePosts = (posts) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
};

app.get('/api/posts', (req, res) => {
    const posts = loadPosts();
    res.json(posts);
});

app.post('/api/posts', (req, res) => {
    const posts = loadPosts();
    const newPost = req.body;
    const updatedPosts = [newPost, ...posts];
    savePosts(updatedPosts);
    res.status(201).json(newPost);
});

app.delete('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const posts = loadPosts();
    const updatedPosts = posts.filter(p => p.id !== id);
    savePosts(updatedPosts);
    res.status(204).send();
});

// All other requests should return the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
