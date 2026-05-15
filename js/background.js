(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }
  init();

  function init() {
    try {
      const canvas = document.createElement("canvas");
      canvas.id = "bgCanvas";
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        zIndex: "-1",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        display: "block",
      });
      document.body.prepend(canvas);

      const ctx = canvas.getContext("2d");
      let W, H, waves, particles, rafId;

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
        initWaves();
        initParticles();
      }

      function cssVar(name, fallback) {
        return (
          getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim() || fallback
        );
      }

      function initWaves() {
        const c = [
          cssVar("--blob-1", "rgba(14,165,233,0.10)"),
          cssVar("--blob-2", "rgba(99,102,241,0.06)"),
          cssVar("--blob-3", "rgba(20,184,166,0.05)"),
        ];
        waves = [
          {
            amp: 35,
            freq: 0.004,
            speed: 0.08,
            baseY: H * 0.15,
            color: c[0],
            phase: Math.random() * 6.28,
          },
          {
            amp: 25,
            freq: 0.006,
            speed: -0.05,
            baseY: H * 0.35,
            color: c[1],
            phase: Math.random() * 6.28,
          },
          {
            amp: 30,
            freq: 0.003,
            speed: 0.12,
            baseY: H * 0.55,
            color: c[2],
            phase: Math.random() * 6.28,
          },
        ];
      }

      function initParticles() {
        const count = Math.min(20, Math.floor((W * H) / 25000));
        const primary = cssVar("--primary", "#2563eb");
        particles = [];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1 + Math.random() * 2.5,
            speed: 0.08 + Math.random() * 0.25,
            opacity: 0.1 + Math.random() * 0.25,
            color: primary,
          });
        }
      }

      function drawWave(w, t) {
        ctx.beginPath();
        ctx.moveTo(0, w.baseY);
        for (let x = 0; x <= W; x += 2) {
          ctx.lineTo(
            x,
            w.baseY + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp,
          );
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        const t = performance.now() / 1000;
        waves.forEach((w) => drawWave(w, t));
        for (const p of particles) {
          p.y -= p.speed;
          p.x += Math.sin(t + p.y * 0.008) * 0.15;
          if (p.y < -10) {
            p.y = H + 5;
            p.x = Math.random() * W;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        rafId = requestAnimationFrame(draw);
      }

      new MutationObserver(() => {
        initWaves();
        initParticles();
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "dir"],
      });

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
      });
      window.addEventListener("orientationchange", () =>
        setTimeout(resize, 300),
      );
      resize();
      draw();
    } catch (e) {
      /* canvas background failed gracefully */
    }
  }
})();
