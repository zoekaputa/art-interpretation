export default class PauseableTimeout {
  constructor(callback, delay) {
    this.callback = callback;
    this.delay = delay;
    this.remaining = delay;
    this.startTime = 0;
    this.timeoutId = null;
    this.paused = false;

    this.start();
  }

  start() {
    this.startTime = Date.now();
    this.timeoutId = setTimeout(this.callback, this.remaining);
  }

  pause() {
    if (this.timeoutId !== null && !this.paused) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      const elapsed = Date.now() - this.startTime;
      this.remaining -= elapsed;
      this.paused = true;
    }
  }

  resume() {
    if (this.paused) {
      this.start();
      this.paused = false;
    }
  }

  clear() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
