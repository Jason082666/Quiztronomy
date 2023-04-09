import React, { useState, useEffect, useRef } from "react";
const Home = () => {
  const canvasRef = useRef(null);
  const [spider, setSpider] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w, h;
    const { sin, cos, PI, hypot, min, max } = Math;

    function spawn() {
      const pts = many(333, () => {
        return {
          x: rnd(window.innerWidth),
          y: rnd(window.innerHeight),
          len: 0,
          r: 0,
        };
      });

      const pts2 = many(9, (i) => {
        return {
          x: cos((i / 9) * PI * 2),
          y: sin((i / 9) * PI * 2),
        };
      });

      let seed = rnd(100);
      let tx = rnd(window.innerWidth);
      let ty = rnd(window.innerHeight);
      let x = rnd(window.innerWidth);
      let y = rnd(window.innerHeight);
      let kx = rnd(0.5, 0.5);
      let ky = rnd(0.5, 0.5);
      let walkRadius = pt(rnd(50, 50), rnd(50, 50));
      let r = window.innerWidth / rnd(100, 150);

      function paintPt(pt) {
        pts2.forEach((pt2) => {
          if (!pt.len) return;
          drawLine(
            lerp(x + pt2.x * r, pt.x, pt.len * pt.len),
            lerp(y + pt2.y * r, pt.y, pt.len * pt.len),
            x + pt2.x * r,
            y + pt2.y * r
          );
        });
        drawCircle(pt.x, pt.y, pt.r);
      }

      return {
        follow(x, y) {
          tx = x;
          ty = y;
        },

        tick(t) {
          const selfMoveX = cos(t * kx + seed) * walkRadius.x;
          const selfMoveY = sin(t * ky + seed) * walkRadius.y;
          let fx = tx + selfMoveX;
          let fy = ty + selfMoveY;

          x += min(window.innerWidth / 100, (fx - x) / 10);
          y += min(window.innerWidth / 100, (fy - y) / 10);

          let i = 0;
          pts.forEach((pt) => {
            const dx = pt.x - x,
              dy = pt.y - y;
            const len = hypot(dx, dy);
            let r = min(2, window.innerWidth / len / 5);
            pt.t = 0;
            const increasing = len < window.innerWidth / 10 && i++ < 8;
            let dir = increasing ? 0.1 : -0.1;
            if (increasing) {
              r *= 1.5;
            }
            pt.r = r;
            pt.len = max(0, min(pt.len + dir, 1));
            paintPt(pt);
          });
        },
      };
    }

    const spiders = many(1, spawn);

    window.addEventListener("pointermove", (e) => {
      const [x, y] = [e.clientX, e.clientY];
      console.log(x, y);
      spiders.forEach((s) => s.follow(x, y));
    });

    function drawLine(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function drawCircle(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    function pt(x, y) {
      return { x, y };
    }

    function lerp(a, b, t) {
      return a * (1 - t) + b * t;
    }

    function rnd(a, b = 0) {
      if (b === 0) {
        [a, b] = [0, a];
      }
      return Math.random() * (b - a) + a;
    }

    function many(n, fn) {
      const res = [];
      for (let i = 0; i < n; i++) {
        res.push(fn(i));
      }
      return res;
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      spiders.forEach((s) => s.tick(performance.now() / 400));
      requestAnimationFrame(loop);
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    }

    resize();
    loop();
    window.addEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Home;
