const TOTAL_BUTTERFLIES = 6;

const pastelColors = [
    '#ffb7b2', '#b5ead7', '#c7ceea', '#e2f0cb',
    '#ffdac1', '#a8e6cf'
];

// SVG //
const butterflySVG = `
    <div class="deco-container">
        <svg class="deco-svg" viewBox="0 0 100 100">
            <path class="body-deco" d="M49,53 C46,48 44,42 46,36" />
            <path class="body-deco" d="M51,53 C54,48 56,42 54,36" />
            <path class="body-deco" d="M50,50 L50,58" stroke-width="1.6" />
            <g class="wing-group left-side">
                <path class="tribal-wing" d="M50,54 C40,50 28,44 20,28 C14,16 18,4 28,10 C34,14 30,22 24,20 C18,26 22,36 30,38 C38,40 46,46 50,54 Z M33,24 C36,21 40,23 39,27 C38,30 34,29 33,26 C33,25 33,24 33,24 Z" />
                <path class="tribal-wing" d="M50,56 C42,58 32,62 26,74 C22,82 26,90 34,84 C40,80 38,70 44,66 C47,63 49,59 50,56 Z" />
            </g>
            <g class="wing-group right-side">
                <path class="tribal-wing" d="M50,54 C60,50 72,44 80,28 C86,16 82,4 72,10 C66,14 70,22 76,20 C82,26 78,36 70,38 C62,40 54,46 50,54 Z M67,24 C64,21 60,23 61,27 C62,30 66,29 67,26 C67,25 67,24 67,24 Z" />
                <path class="tribal-wing" d="M50,56 C58,58 68,62 74,74 C78,82 74,90 66,84 C60,80 62,70 56,66 C53,63 51,59 50,56 Z" />
            </g>
        </svg>
    </div>
`;

// EASING HELPERS //
function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

// BEZIER //
function bezierPoint(t, p0, c, p2) {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * c + t * t * p2;
}
function bezierTangent(t, p0, c, p2) {
    return 2 * (1 - t) * (c - p0) + 2 * t * (p2 - c);
}

for (let i = 0; i < TOTAL_BUTTERFLIES; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'butterfly-wrapper';
    wrapper.innerHTML = butterflySVG;
    document.body.appendChild(wrapper);

    const color = pastelColors[i % pastelColors.length];

    wrapper.querySelectorAll('.tribal-wing').forEach(el => {
        el.style.fill = color;
    });
    wrapper.querySelectorAll('.body-deco').forEach(el => {
        el.style.stroke = color;
    });
    wrapper.querySelector('.deco-svg').style.color = color;

    animateButterfly(wrapper, color);
}

function createSparkle(x, y, color) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    const size = Math.random() * 3 + 1.5;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.backgroundColor = color;
    sparkle.style.boxShadow = `0 0 4px ${color}`;

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;

    const dx = (Math.random() - 0.5) * 12 + 'px';
    const dy = (Math.random() * 10 + 4) + 'px';
    sparkle.style.setProperty('--dx', dx);
    sparkle.style.setProperty('--dy', dy);

    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 450);
}

function animateButterfly(element, color) {
    const wingGroups = element.querySelectorAll('.wing-group');

    let curX = (Math.random() - 0.5) * 120;
    let curY = (Math.random() - 0.5) * 120;
    let heading = 0;

    let segStartX, segStartY, segCtrlX, segCtrlY, segEndX, segEndY;
    let segDuration = 0;
    let segStartTime = null;
    let flapBase = 0.7;

    let isPaused = false;
    let pauseDuration = 0;
    let pauseStartTime = null;

    let lastSparkleTime = 0;

    function randomPointInBounds() {
        const padding = 60;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const x = Math.random() * (w - padding * 2) + padding - w / 2;
        const y = Math.random() * (h - padding * 2) + padding - h / 2;
        return { x, y };
    }

    function setFlapDuration(seconds, jitter) {
        wingGroups.forEach(wing => {
            const d = seconds + (Math.random() * jitter - jitter / 2);
            wing.style.animationDuration = `${Math.max(0.28, d).toFixed(2)}s`;
        });
    }

    function startNewSegment() {
        segStartX = curX;
        segStartY = curY;

        const target = randomPointInBounds();
        segEndX = target.x;
        segEndY = target.y;

        const dx = segEndX - segStartX;
        const dy = segEndY - segStartY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const midX = (segStartX + segEndX) / 2;
        const midY = (segStartY + segEndY) / 2;
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const curveAmount = (Math.random() - 0.5) * dist * 0.7;
        segCtrlX = midX + perpX * curveAmount;
        segCtrlY = midY + perpY * curveAmount;

        // DURATION //
        segDuration = Math.max(1.6, dist / (65 + Math.random() * 55));
        segStartTime = null;

        // MOVEMENT SPEED & FLAP RATE //
        const speedPxPerSec = dist / segDuration;
        flapBase = Math.max(0.32, Math.min(0.85, 0.72 - speedPxPerSec / 380));
        setFlapDuration(flapBase, 0.1);
    }

    function startPause() {
        isPaused = true;
        pauseDuration = Math.random() * 1.1 + 0.35;
        pauseStartTime = null;
        
        setFlapDuration(1.15, 0.3);
    }

    function frame(now) {
        if (isPaused) {
            if (pauseStartTime === null) pauseStartTime = now;
            const elapsed = (now - pauseStartTime) / 1000;

            const hoverX = Math.sin(now / 420) * 3 + Math.sin(now / 970) * 1.5;
            const hoverY = Math.cos(now / 560) * 2.2;
            element.style.transform =
                `translate(${(curX + hoverX).toFixed(1)}px, ${(curY + hoverY).toFixed(1)}px) rotate(${heading.toFixed(1)}deg)`;

            if (elapsed >= pauseDuration) {
                isPaused = false;
                startNewSegment();
            }
            requestAnimationFrame(frame);
            return;
        }

        if (segStartTime === null) segStartTime = now;
        const elapsedSec = (now - segStartTime) / 1000;
        const t = Math.min(elapsedSec / segDuration, 1);
        const eased = easeInOutSine(t);

        const x = bezierPoint(eased, segStartX, segCtrlX, segEndX);
        const y = bezierPoint(eased, segStartY, segCtrlY, segEndY);

        const tx = bezierTangent(eased, segStartX, segCtrlX, segEndX);
        const ty = bezierTangent(eased, segStartY, segCtrlY, segEndY);
        const targetHeading = Math.atan2(ty, tx) * (180 / Math.PI) + 90;

        let diff = targetHeading - heading;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        heading += diff * 0.1;
        const flutter = Math.sin(now / (flapBase * 500)) * 5;

        const bob = Math.sin(now / (flapBase * 400)) * 1.6;
        const breathe = 1 + Math.sin(now / 900) * 0.04;

        curX = x;
        curY = y + bob;

        element.style.transform =
            `translate(${curX.toFixed(1)}px, ${curY.toFixed(1)}px) rotate(${(heading + flutter).toFixed(1)}deg) scale(${breathe.toFixed(3)})`;

        // SPARKLES //
        if (now - lastSparkleTime > 85 && Math.random() < 0.45) {
            createSparkle(curX + window.innerWidth / 2, curY + window.innerHeight / 2, color);
            lastSparkleTime = now;
        }

        if (t >= 1) {
            if (Math.random() < 0.4) {
                startPause();
            } else {
                startNewSegment();
            }
        }

        requestAnimationFrame(frame);
    }

    startNewSegment();
    setTimeout(() => requestAnimationFrame(frame), Math.random() * 2000);
}