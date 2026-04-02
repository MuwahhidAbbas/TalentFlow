/* ============================================
   Landing Page — Premium Hero with Particles
   ============================================ */

export async function renderLanding(app) {
  app.innerHTML = `
    <canvas id="particle-canvas"></canvas>
    <div class="landing-page">
      <div class="landing-content animate-fade-in">
        <div class="landing-badge">Talent Coordination Platform</div>
        <h1 class="landing-title">
          <span class="landing-title-line">Discover</span>
          <span class="landing-title-line accent">Exceptional</span>
          <span class="landing-title-line">Talent</span>
        </h1>
        <p class="landing-subtitle">
          A premium workspace for coordinating, evaluating, and managing talent across projects — built for teams that demand excellence.
        </p>
        <div class="landing-actions">
          <button class="btn btn-primary btn-lg landing-cta" id="enter-app">
            Enter Dashboard
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div class="landing-features">
          <div class="landing-feature">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span>500+ Profiles</span>
          </div>
          <div class="landing-feature">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span>Multi-Project</span>
          </div>
          <div class="landing-feature">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span>Team Views</span>
          </div>
          <div class="landing-feature">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <span>Rich Media</span>
          </div>
        </div>
      </div>
    </div>

    <style>
      .landing-page {
        position: relative;
        z-index: 1;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .landing-content {
        text-align: center;
        max-width: 720px;
      }

      .landing-badge {
        display: inline-block;
        padding: 6px 18px;
        border: 1px solid rgba(201, 169, 110, 0.25);
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--accent-gold);
        background: rgba(201, 169, 110, 0.06);
        margin-bottom: 2rem;
      }

      .landing-title {
        font-family: var(--font-heading);
        font-weight: 800;
        line-height: 1.05;
        margin-bottom: 1.5rem;
      }

      .landing-title-line {
        display: block;
        font-size: clamp(3rem, 8vw, 5.5rem);
        color: var(--text-primary);
      }

      .landing-title-line.accent {
        background: linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .landing-subtitle {
        font-size: 1.125rem;
        color: var(--text-secondary);
        max-width: 520px;
        margin: 0 auto 2.5rem;
        line-height: 1.7;
      }

      .landing-actions {
        margin-bottom: 4rem;
      }

      .landing-cta {
        padding: 16px 40px;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        gap: 10px;
        border-radius: 14px;
      }

      .landing-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 40px rgba(201, 169, 110, 0.3);
      }

      .landing-features {
        display: flex;
        gap: 2rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .landing-feature {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-tertiary);
        font-size: 0.875rem;
      }

      .landing-feature-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-gold);
      }

      @media (max-width: 768px) {
        .landing-features {
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      }
    </style>
  `;

  // Particle animation
  initParticles();

  // CTA
  document.getElementById('enter-app').addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  return () => { cancelAnimationFrame(window._particleRAF); };
}

/* ---- Geometric Particle System ---- */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const count = Math.min(60, Math.floor((w * h) / 25000));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.3 + 0.05,
      shape: Math.floor(Math.random() * 3), // 0=circle, 1=triangle, 2=square
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);

      if (p.shape === 0) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#c9a96e';
        ctx.fill();
      } else if (p.shape === 1) {
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.5);
        ctx.lineTo(p.size * 1.3, p.size);
        ctx.lineTo(-p.size * 1.3, p.size);
        ctx.closePath();
        ctx.strokeStyle = '#c9a96e';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#c9a96e';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-p.size, -p.size, p.size * 2, p.size * 2);
      }

      ctx.restore();
    });

    // Draw connections
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.globalAlpha = (1 - dist / 150) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    window._particleRAF = requestAnimationFrame(draw);
  }

  draw();
}
