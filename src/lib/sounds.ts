/**
 * Sound effects using the Web Audio API.
 * All sounds are synthesized — no external files needed.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctx) ctx = new AudioContext();
    return ctx;
}

function tone(freq: number, duration: number, volume = 0.3, type: OscillatorType = "sine") {
    const c = getCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(volume, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.start(c.currentTime);
    o.stop(c.currentTime + duration);
}

/** Played when the user saves/confirms a week successfully */
export function playSuccess() {
    tone(523, 0.12, 0.25); // C5
    setTimeout(() => tone(659, 0.12, 0.25), 120); // E5
    setTimeout(() => tone(784, 0.2, 0.25), 240); // G5
}

/** Fanfare when the goal is reached */
export function playGoalReached() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        setTimeout(() => tone(freq, 0.25, 0.3, "square"), i * 150);
    });
}

/** Short alert when a reminder fires */
export function playReminder() {
    tone(880, 0.15, 0.2);
    setTimeout(() => tone(880, 0.15, 0.2), 260);
}

/** Short error buzz */
export function playError() {
    tone(220, 0.3, 0.2, "sawtooth");
}

/** Gentle chime when value is typed/confirmed */
export function playChime() {
    tone(1047, 0.18, 0.15);
}
