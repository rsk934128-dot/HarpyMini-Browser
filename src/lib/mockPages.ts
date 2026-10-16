export interface PageArticle {
  url: string;
  title: string;
  domain: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  heroImage: string;
  summary: string;
  content: string;
  tags: string[];
  trackersCount: number;
  sizeKb: number;
}

export const MOCK_PAGES: Record<string, PageArticle> = {
  'https://techcrunch.com/2026/04/12/the-rise-of-ai-native-browsers': {
    url: 'https://techcrunch.com/2026/04/12/the-rise-of-ai-native-browsers',
    title: 'The Rise of AI-Native Browsers: Why HarpyMini and Edge-First AI Are Changing the Web',
    domain: 'techcrunch.com',
    author: 'Elena Vance, Senior Tech Editor',
    date: 'April 12, 2026',
    readTime: '4 min read',
    category: 'Artificial Intelligence & Software',
    heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    summary: 'Web browsers are transforming from passive document viewers into intelligent agents. HarpyMini showcases how local AES-GCM password encryption combined with server-side Gemini intelligence reshapes privacy, speed, and productivity.',
    content: `## The Next Evolution of the Web Browser
For over two decades, web browsers remained largely unchanged: an address bar at the top, a back button, bookmarks, and a rendering engine. Today, however, a fundamental shift is underway.

Modern browsers like HarpyMini are proving that users no longer want to just *visit* a web page—they want to understand it, interrogate it, and extract actionable insights without sacrificing privacy.

### Key Technological Pillars of AI-Native Browsing
1. **Context-Aware Assistance**: Instead of copying and pasting text into separate chat windows, an embedded assistant like Gemini 3.8 Flash understands the document in real time.
2. **Aggressive Data-Saving Engines**: Mobile networks and high-bandwidth tracking scripts consume an estimated 40% of page weight. Stripping third-party trackers saves massive battery life and data.
3. **Zero-Knowledge Password Management**: Browsers have historically had questionable password vault storage. With client-side AES-GCM Web Crypto derivation, master keys never touch remote servers.

> "The browser of tomorrow isn't just a viewport—it is your personal research analyst and security gatekeeper."

### What's Next for 2026 and Beyond
Expect multi-modal voice browsing to become standard. When you can speak "summarize this page and save to my offline reading vault," the friction of navigating dense technical documentation disappears entirely.`,
    tags: ['AI Browsers', 'Web Security', 'Data Saver', 'Gemini'],
    trackersCount: 14,
    sizeKb: 84.2,
  },

  'https://en.wikipedia.org/wiki/Quantum_computing': {
    url: 'https://en.wikipedia.org/wiki/Quantum_computing',
    title: 'Quantum computing - Wikipedia, the free encyclopedia',
    domain: 'en.wikipedia.org',
    author: 'Wikipedia Contributors',
    date: 'Updated October 2026',
    readTime: '6 min read',
    category: 'Science & Computing',
    heroImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    summary: 'Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers.',
    content: `## Overview
Quantum computing is a rapidly advancing subfield of computer science and quantum physics. Classical computers encode information in binary bits (either 0 or 1), whereas quantum computers use qubits, which can exist in a superposition of states.

### Principles of Quantum Mechanics
* **Superposition**: Enables a qubit to represent combinations of both 0 and 1 simultaneously.
* **Entanglement**: Two or more particles become interconnected such that the physical state of one dictates the state of another, regardless of physical separation.
* **Quantum Interference**: Quantum algorithms bias the probability amplitudes of qubits towards the correct outcome while canceling out incorrect outcomes.

### Practical Applications
1. **Cryptanalysis & Post-Quantum Cryptography**: Shor's algorithm demonstrates the theoretical ability to break RSA and discrete logarithm cryptosystems, driving the global transition to lattice-based post-quantum cryptography.
2. **Molecular Simulation & Drug Discovery**: Simulating chemical interactions at atomic precision enables the rapid discovery of novel pharmaceuticals and catalyst materials.
3. **Combinatorial Optimization**: Logistics, supply-chain routing, and financial portfolio optimization benefit from quantum annealing and quantum approximate optimization algorithms (QAOA).`,
    tags: ['Physics', 'Quantum Mechanics', 'Supercomputers', 'Cryptography'],
    trackersCount: 2,
    sizeKb: 62.4,
  },

  'https://news.ycombinator.com': {
    url: 'https://news.ycombinator.com',
    title: 'Hacker News — Tech, Startups & Code',
    domain: 'news.ycombinator.com',
    author: 'Y Combinator Community',
    date: 'Live Feed',
    readTime: '3 min read',
    category: 'Technology & Startups',
    heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    summary: 'Top stories from Hacker News: lightweight browsers, client-side AES crypto, Rust operating systems, and decentralized web standards.',
    content: `## Hacker News Top Stories

1. ▲ **Show HN: HarpyMini — Lightweight, AI-driven browser with AES-GCM Vault and Gemini integration**
   *248 points by bosramoni 3 hours ago | 84 comments*
   A fast browser built with Next/React, Google Gemini 3.8 Flash, and Firebase Cloud Sync with client-side master password encryption.

2. ▲ **Why client-side AES-GCM with PBKDF2 is the golden standard for web credentials**
   *192 points by cryptodev 5 hours ago | 67 comments*
   An in-depth analysis of Web Crypto API, zero-knowledge architecture, and avoiding server-side credential leaks.

3. ▲ **Post-Quantum Cryptography: NIST Standards in Production**
   *310 points by mathguy 7 hours ago | 112 comments*
   Lattice-based cryptography algorithms Kyber and Dilithium are now being deployed across modern web browsers and TLS 1.3 stacks.

4. ▲ **SQLite in the Browser via WebAssembly: 5 Years Later**
   *145 points by wasm_fan 8 hours ago | 42 comments*
   How client-side persistence and local-first software architectures are changing modern web apps.`,
    tags: ['Startups', 'Programming', 'Hardware', 'HackerNews'],
    trackersCount: 0,
    sizeKb: 31.8,
  },

  'https://dev.to/harpymini/building-modern-privacy-browsers': {
    url: 'https://dev.to/harpymini/building-modern-privacy-browsers',
    title: 'How We Built HarpyMini: Data Saver, Voice AI & Zero-Knowledge Architecture',
    domain: 'dev.to',
    author: 'HarpyMini Engineering Team',
    date: 'October 15, 2026',
    readTime: '5 min read',
    category: 'Engineering & Architecture',
    heroImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    summary: 'A behind-the-scenes engineering deep dive into the architecture of HarpyMini browser, showcasing how we combined AI tools, privacy filters, and Web Crypto.',
    content: `## Architecture of HarpyMini Browser

Building a browser simulation that feels snappy and production-ready requires deliberate architectural choices:

### 1. Data Saver & Privacy Mode
Data Saver works by inspecting outgoing asset requests and server-side proxied HTML. By removing third-party tracking scripts, pixel beacons, and pre-loading bloat, bandwidth usage drops by 40-70%.

### 2. Client-Side AES-GCM Password Encryption
When a user stores a password in HarpyMini:
- The user provides their Master Password.
- We generate a cryptographically random 16-byte salt and 12-byte IV using \`crypto.getRandomValues\`.
- \`crypto.subtle.deriveKey\` executes 100,000 PBKDF2 iterations using SHA-256.
- The ciphertext is saved in Firestore. No plain password or master password ever leaves the device!

### 3. Integrated AI Companion
Using Gemini 3.8 Flash, users can press one button to get an executive summary, ask contextual questions about the active article, or execute voice commands like *"Navigate to Wikipedia"* or *"Turn on Data Saver"*.`,
    tags: ['WebDev', 'TypeScript', 'Security', 'React'],
    trackersCount: 4,
    sizeKb: 45.0,
  },
};

export const DEFAULT_BOOKMARKS = [
  {
    id: 'bm-1',
    title: 'TechCrunch — AI Browsers',
    url: 'https://techcrunch.com/2026/04/12/the-rise-of-ai-native-browsers',
    icon: '⚡',
    category: 'Tech',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-2',
    title: 'Wikipedia — Quantum Computing',
    url: 'https://en.wikipedia.org/wiki/Quantum_computing',
    icon: '🌐',
    category: 'Reference',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-3',
    title: 'Hacker News Daily',
    url: 'https://news.ycombinator.com',
    icon: '🟧',
    category: 'News',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-4',
    title: 'Dev.to — HarpyMini Architecture',
    url: 'https://dev.to/harpymini/building-modern-privacy-browsers',
    icon: '💻',
    category: 'Dev',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-5',
    title: 'GitHub Trending',
    url: 'https://github.com/trending',
    icon: '🐙',
    category: 'Code',
    createdAt: new Date().toISOString(),
  },
];
