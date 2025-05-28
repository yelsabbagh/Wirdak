/**
 * Wirdak - Islamic Dhikr Habit Tracking App
 * counter-animation.js - Tasbih bead animation functionality
 */

class TasbihAnimationManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.beads = [];
    this.currentCount = 0;
    this.targetCount = 33;
    this.isAnimating = false;
    this.hapticFeedbackEnabled = true;
    
    // Create the counter display
    this.counterDisplay = document.createElement('div');
    this.counterDisplay.className = 'tasbih-counter';
    this.counterDisplay.textContent = this.currentCount;
    
    // Create the beads container
    this.beadsContainer = document.createElement('div');
    this.beadsContainer.className = 'tasbih-beads-container';
    
    // Append elements to container
    this.container.appendChild(this.beadsContainer);
    this.container.appendChild(this.counterDisplay);
    
    // Initialize
    this.createBeadCircle();
    this.setupEventListeners();
  }
  
  /**
   * Create the circular arrangement of beads
   */
  createBeadCircle() {
    // Clear existing beads
    this.beadsContainer.innerHTML = '';
    this.beads = [];
    
    const beadCount = this.targetCount;
    const radius = this.container.offsetWidth * 0.4; // 40% of container width
    const centerX = this.container.offsetWidth / 2;
    const centerY = this.container.offsetHeight / 2;
    
    for (let i = 0; i < beadCount; i++) {
      // Calculate position in circle
      const angle = (i / beadCount) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Create bead element
      const bead = document.createElement('div');
      bead.className = 'tasbih-bead';
      bead.style.left = `${x}px`;
      bead.style.top = `${y}px`;
      
      // Alternate colors for visual interest
      if (i % 2 === 0) {
        bead.classList.add('tasbih-bead-primary');
      } else {
        bead.classList.add('tasbih-bead-secondary');
      }
      
      // Add data attribute for index
      bead.dataset.index = i;
      
      // Add to DOM and array
      this.beadsContainer.appendChild(bead);
      this.beads.push(bead);
    }
  }
  
  /**
   * Set up event listeners for user interaction
   */
  setupEventListeners() {
    // Make the entire container clickable to increment counter
    this.container.addEventListener('click', (e) => {
      // Prevent double clicks
      if (this.isAnimating) return;
      
      this.incrementCounter();
    });
    
    // Listen for window resize to adjust bead positions
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Listen for orientation change on mobile
    window.addEventListener('orientationchange', this.handleResize.bind(this));
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    // Recreate the bead circle with new dimensions
    this.createBeadCircle();
    
    // Update active beads based on current count
    for (let i = 0; i < this.currentCount; i++) {
      if (this.beads[i]) {
        this.beads[i].classList.add('bead-active');
      }
    }
  }
  
  /**
   * Increment the counter and animate the corresponding bead
   */
  incrementCounter() {
    if (this.currentCount >= this.targetCount) {
      this.resetCounter();
      return;
    }
    
    this.isAnimating = true;
    
    // Get the current bead to animate
    const bead = this.beads[this.currentCount];
    
    // Animate the bead
    bead.classList.add('bead-active', 'bead-glow');
    
    // Update counter
    this.currentCount++;
    this.counterDisplay.textContent = this.currentCount;
    
    // Provide haptic feedback if enabled and supported
    if (this.hapticFeedbackEnabled && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
    
    // Create particle effect
    this.createParticleEffect(bead);
    
    // Check if we've reached the target
    if (this.currentCount === this.targetCount) {
      this.celebrateCompletion();
    }
    
    // Reset animation state after animation completes
    setTimeout(() => {
      bead.classList.remove('bead-glow');
      this.isAnimating = false;
    }, 300);
  }
  
  /**
   * Reset the counter and bead animations
   */
  resetCounter() {
    this.isAnimating = true;
    
    // Reset counter display
    this.currentCount = 0;
    this.counterDisplay.textContent = this.currentCount;
    
    // Animate all beads back to inactive state
    this.beads.forEach(bead => {
      bead.classList.add('bead-reset');
      
      setTimeout(() => {
        bead.classList.remove('bead-active', 'bead-glow', 'bead-reset');
      }, 500);
    });
    
    // Reset animation state
    setTimeout(() => {
      this.isAnimating = false;
    }, 600);
  }
  
  /**
   * Celebrate completion of the full dhikr count
   */
  celebrateCompletion() {
    // Add celebration class to container
    this.container.classList.add('completion-celebration');
    
    // Provide stronger haptic feedback if enabled and supported
    if (this.hapticFeedbackEnabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Create multiple particle effects
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const randomBead = this.beads[Math.floor(Math.random() * this.beads.length)];
        this.createParticleEffect(randomBead);
      }, i * 200);
    }
    
    // Remove celebration class after animation completes
    setTimeout(() => {
      this.container.classList.remove('completion-celebration');
    }, 2000);
    
    // Dispatch completion event
    const event = new CustomEvent('tasbih-completion', {
      detail: {
        count: this.targetCount,
        timestamp: new Date().toISOString()
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Create particle effect around a bead
   */
  createParticleEffect(bead) {
    const particleCount = 8;
    const beadRect = bead.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate bead center position relative to container
    const beadCenterX = beadRect.left + beadRect.width / 2 - containerRect.left;
    const beadCenterY = beadRect.top + beadRect.height / 2 - containerRect.top;
    
    for (let i = 0; i < particleCount; i++) {
      // Create particle element
      const particle = document.createElement('div');
      particle.className = 'tasbih-particle';
      
      // Position at bead center
      particle.style.left = `${beadCenterX}px`;
      particle.style.top = `${beadCenterY}px`;
      
      // Random angle and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      
      // Random size
      const size = 4 + Math.random() * 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random color
      const hue = Math.random() > 0.5 ? '160' : '45'; // Green or gold
      particle.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
      
      // Add to container
      this.container.appendChild(particle);
      
      // Animate outward
      setTimeout(() => {
        particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        particle.style.opacity = '0';
      }, 10);
      
      // Remove after animation
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }
  
  /**
   * Set the target count for the dhikr
   */
  setTargetCount(count) {
    if (count < 1) count = 1;
    this.targetCount = count;
    this.resetCounter();
    this.createBeadCircle();
  }
  
  /**
   * Enable or disable haptic feedback
   */
  setHapticFeedback(enabled) {
    this.hapticFeedbackEnabled = enabled;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TasbihAnimationManager;
}
