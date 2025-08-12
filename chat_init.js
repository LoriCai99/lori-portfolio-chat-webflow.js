// Wait for the widget library to define the global, then init once.
(function initPortfolioChat(){
  if (window.PortfolioChatWidget && typeof window.PortfolioChatWidget.init === 'function') {
    window.PortfolioChatWidget.init({
      mount: 'body',
      brand: '#2563eb',
      title: 'What can I help you with?',
      contactEmail: 'you@domain.com',
      suggestions: ['About me','Projects','Skills','Resume','Contact'],
      faqs: [
        { question: 'About me', answer: "I'm a full-stack engineer focused on Next.js + Node." },
        { question: 'Projects', answer: 'Realtime dashboard, visual diff tool, ML-aided search.' },
        { question: 'Skills', answer: 'TypeScript, React/Next.js, Node, Python, Postgres, AWS.' },
        { question: 'Resume', answer: 'Ask me for a link or grab it from the top nav.' },
        { question: 'Contact', answer: 'Email me at you@domain.com — I reply within 24h.' },
      ],
    });
  } else {
    setTimeout(initPortfolioChat, 100);
  }
})();
