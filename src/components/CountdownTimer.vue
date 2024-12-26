<template>
  <div class="countdown-timer-container">
    <div class="countdown-timer">
      <div class="countdown-number">{{ remainingSeconds }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    initialSeconds: {
      type: Number,
      default: 60
    },
    startTrigger: {
      type: String,
      required: true
    },
    isRunning: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      remainingSeconds: this.initialSeconds,
      intervalId: null,
      tickSound: null,
      soundLoaded: false
    };
  },
  methods: {
    startTimer() {
      if (!this.intervalId && this.isRunning) {
        this.intervalId = setInterval(() => {
          if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            if (this.tickSound && this.soundLoaded && this.isRunning) {
              this.tickSound.play().catch(error => {
                console.warn('Autoplay was prevented:', error);
              });
            }
          } else {
            this.stopTimer();
            this.$emit('timeup');
          }
        }, 1000);
      }
    },
    stopTimer() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
    resetTimer() {
      this.stopTimer();
      this.remainingSeconds = this.initialSeconds;
    }
  },
  watch: {
    initialSeconds(newVal) {
      this.resetTimer();
      if (this.soundLoaded && this.startTrigger && this.isRunning) {
        this.startTimer();
      }
    },
    startTrigger: {
      immediate: true,
      handler() {
        this.resetTimer();
        if (this.soundLoaded && this.isRunning) {
          this.startTimer();
        }
      }
    },
    isRunning(newValue) {
      if (newValue) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }
  },
  beforeDestroy() {
    this.stopTimer();
  },
  mounted() {
    const soundPath = '/tick.mp3';
    this.tickSound = new Audio(soundPath);

    this.tickSound.addEventListener('canplaythrough', function () {
      console.log('Tick sound loaded successfully:', soundPath);
      console.log('this inside canplaythrough:', this);
      this.soundLoaded = true;
      if (this.startTrigger && this.isRunning) {
        this.startTimer();
      }
    }.bind(this));

    this.tickSound.addEventListener('error', function (error) {
      console.error('Error loading tick sound:', soundPath, error);
    }.bind(this));

    console.log('Attempting to load tick sound from:', soundPath);
  }
};
</script>

<style scoped>
/* Styles specific to the countdown timer */
.countdown-timer-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.1;
  pointer-events: none;
  z-index: 1;
}

.countdown-timer {
  position: relative;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  border: 5px solid rgba(128, 128, 128, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.countdown-number {
  font-size: 18rem;
  color: #aaa;
}
</style>