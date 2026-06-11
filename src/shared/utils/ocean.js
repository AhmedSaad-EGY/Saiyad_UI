export function initOcean() {
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
      let W, H, fish, bubbles, kelp, visibility = true;

      function isDark() {
        return document.documentElement.getAttribute("data-theme") === "dark";
      }

      function getColors() {
        const d = isDark();
        return {
          top: d ? "#020917" : "#0e4d8c",
          mid: d ? "#0a1628" : "#0077b6",
          bot: d ? "#0d2137" : "#00b4d8",
          ray: d ? "255,255,255" : "255,240,220",
          bubble: d ? "180,210,240" : "200,230,255",
          kelp: d ? "#0a2a1a" : "#1a5a3a",
        };
      }

      function Fish(x, y, speed, size, colorBody, colorFin) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = size;
        this.colorBody = colorBody;
        this.colorFin = colorFin;
        this.phase = Math.random() * 6.28;
        this.dir = Math.random() > 0.5 ? 1 : -1;
        this.wagPhase = Math.random() * 6.28;
        this.startX = x;
        this.amplitude = 20 + Math.random() * 40;
        this.freq = 0.3 + Math.random() * 0.4;
      }

      Fish.prototype.draw = function (_ctx, t) {
        const wag = Math.sin(t * 2.5 + this.wagPhase) * 0.2;
        const bob = Math.sin(t * this.freq + this.phase) * 0.4;
        const x = this.x;
        const y = this.y + bob;
        const s = this.size;
        const dir = this.dir;

        _ctx.save();
        _ctx.translate(x, y);
        _ctx.scale(dir, 1);

        _ctx.fillStyle = "rgba(0,0,0,0.04)";
        _ctx.beginPath();
        _ctx.ellipse(2, s * 0.6, s * 0.5, s * 0.15, 0, 0, 6.28);
        _ctx.fill();

        _ctx.fillStyle = this.colorBody;
        _ctx.beginPath();
        _ctx.ellipse(0, 0, s * 0.5, s * 0.2, 0, 0, 6.28);
        _ctx.fill();

        _ctx.fillStyle = this.colorFin;
        _ctx.beginPath();
        _ctx.moveTo(-s * 0.45, 0);
        _ctx.lineTo(-s * 0.8, -s * 0.25 + wag * s * 0.3);
        _ctx.lineTo(-s * 0.8, s * 0.25 - wag * s * 0.3);
        _ctx.closePath();
        _ctx.fill();

        _ctx.fillStyle = this.colorFin;
        _ctx.beginPath();
        _ctx.moveTo(s * 0.05, -s * 0.18);
        _ctx.quadraticCurveTo(s * 0.1, -s * 0.45, -s * 0.15, -s * 0.25);
        _ctx.fill();

        _ctx.beginPath();
        _ctx.moveTo(s * 0.1, s * 0.1);
        _ctx.quadraticCurveTo(s * 0.25, s * 0.3, 0, s * 0.2);
        _ctx.fill();

        _ctx.fillStyle = "#111";
        _ctx.beginPath();
        _ctx.arc(s * 0.3, -s * 0.04, s * 0.06, 0, 6.28);
        _ctx.fill();
        _ctx.fillStyle = "#fff";
        _ctx.beginPath();
        _ctx.arc(s * 0.32, -s * 0.06, s * 0.025, 0, 6.28);
        _ctx.fill();

        _ctx.restore();
      };

      function initFish() {
        const c = isDark()
          ? [
              { body: "#3a7ca5", fin: "#4a8cb5" },
              { body: "#d4894a", fin: "#c47939" },
              { body: "#1a4a7a", fin: "#2a5a8a" },
              { body: "#c4a85a", fin: "#d4b86a" },
            ]
          : [
              { body: "#7ec8e3", fin: "#a8dadc" },
              { body: "#f4a261", fin: "#e76f51" },
              { body: "#023e8a", fin: "#0077b6" },
              { body: "#e9c46a", fin: "#f4a261" },
            ];
        const count = 8 + Math.floor(Math.random() * 5);
        fish = [];
        for (let i = 0; i < count; i++) {
          const palette = c[i % c.length];
          const size = 12 + Math.random() * 33;
          fish.push(new Fish(
            Math.random() * W,
            H * 0.15 + Math.random() * H * 0.7,
            0.3 + Math.random() * 0.7,
            size,
            palette.body,
            palette.fin
          ));
        }
      }

      function initBubbles() {
        const count = 30 + Math.floor(Math.random() * 10);
        bubbles = [];
        for (let i = 0; i < count; i++) {
          bubbles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1.5 + Math.random() * 2.5,
            speed: 0.08 + Math.random() * 0.25,
            sway: Math.random() * 0.3,
            phase: Math.random() * 6.28,
            opacity: 0.08 + Math.random() * 0.1,
          });
        }
      }

      function initKelp() {
        kelp = [];
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          kelp.push({
            x: 0.08 * W + Math.random() * 0.84 * W,
            h: 40 + Math.random() * 40,
            segments: 8 + Math.floor(Math.random() * 4),
            phase: Math.random() * 6.28,
          });
        }
      }

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
        initFish();
        initBubbles();
        initKelp();
      }

      function draw() {
        if (!visibility) { requestAnimationFrame(draw); return; }
        const t = performance.now() / 1000;
        const c = getColors();

        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, c.top);
        grad.addColorStop(0.4, c.mid);
        grad.addColorStop(1, c.bot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        for (let i = 0; i < 5; i++) {
          const rx = W * 0.1 + Math.sin(t * 0.02 + i * 1.2) * W * 0.3;
          const rw = 20 + Math.sin(t * 0.03 + i * 0.8) * 10;
          ctx.fillStyle = `rgba(${c.ray}, ${0.03 + Math.sin(t * 0.015 + i * 1.5) * 0.02})`;
          ctx.beginPath();
          ctx.moveTo(rx, 0);
          ctx.lineTo(rx - rw, H);
          ctx.lineTo(rx + rw, H);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${c.ray}, 0.025)`;
        for (let i = 0; i < 12; i++) {
          const cx = (W / 12) * i + Math.sin(t * 0.1 + i) * 30;
          const cy = H * 0.85 + Math.sin(t * 0.08 + i * 0.7) * 15;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * 6.28 + t * 0.05 + i;
            const r = 25 + Math.sin(t * 0.12 + i + a) * 10;
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }

        const bubbleColor = c.bubble;
        for (const b of bubbles) {
          b.y -= b.speed;
          b.x += Math.sin(t * 0.5 + b.phase) * b.sway;
          if (b.y < -10) {
            b.y = H + 5;
            b.x = Math.random() * W;
          }
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, 6.28);
          ctx.fillStyle = `rgba(${bubbleColor}, ${b.opacity})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.35, 0, 6.28);
          ctx.fillStyle = `rgba(255,255,255,${b.opacity * 2})`;
          ctx.fill();
        }

        for (const f of fish) {
          f.x += f.speed * f.dir;
          f.y += Math.sin(t * f.freq + f.phase) * 0.4;

          if (f.dir > 0 && f.x > W + f.size) { f.x = -f.size; }
          else if (f.dir < 0 && f.x < -f.size) { f.x = W + f.size; }

          if (Math.random() < 0.001) f.dir *= -1;

          f.draw(ctx, t);
        }

        for (const k of kelp) {
          ctx.strokeStyle = c.kelp;
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(k.x, H);
          for (let i = 0; i <= k.segments; i++) {
            const sy = H - (i / k.segments) * k.h;
            const sway = Math.sin(t * 0.8 + k.phase - i * 0.3) * (i / k.segments) * 12;
            ctx.lineTo(k.x + sway, sy);
          }
          ctx.stroke();
        }

        for (let w = 0; w < 3; w++) {
          ctx.fillStyle = `rgba(${c.ray}, ${0.02 + w * 0.01})`;
          ctx.beginPath();
          ctx.moveTo(0, H * 0.12);
          for (let x = 0; x <= W; x += 4) {
            const wy = H * 0.12
              + Math.sin(x * 0.008 + t * 0.5 + w) * 8
              + Math.sin(x * 0.015 + t * 0.3 + w * 1.5) * 4;
            ctx.lineTo(x, wy);
          }
          ctx.lineTo(W, 0);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
        }

        requestAnimationFrame(draw);
      }

      const observer = new MutationObserver(() => {
        resize();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "dir"],
      });
      window.addEventListener("beforeunload", () => observer.disconnect());

      document.addEventListener("visibilitychange", () => {
        visibility = !document.hidden;
        if (document.hidden) {
          observer.disconnect();
        } else {
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme", "dir"],
          });
        }
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
    } catch {
      /* ocean background failed gracefully */
    }
  }
}
