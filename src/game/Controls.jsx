export function setupControls(player, state, playAnimation) {
  window.addEventListener("keydown", (e) => {
    if (state.gameOver) return;

    // Smooth lane switching
    const targetX = () => state.currentLane * state.laneOffset;

    if (e.key === "ArrowLeft" && state.currentLane > -1) {
      state.currentLane--;
      animateLaneSwitch(player, targetX());
    }

    if (e.key === "ArrowRight" && state.currentLane < 1) {
      state.currentLane++;
      animateLaneSwitch(player, targetX());
    }

    if (e.key === "ArrowUp" && !state.isJumping) {
      state.isJumping = true;
      const jumpHeight = 2;
      const jumpDuration = 500;
      const startTime = performance.now();
      const startY = player.parent.position.y;
      playAnimation("rig|Jump", false, 1.0); // Play jump animation

      const animateJump = (time) => {
        if (state.gameOver) return;
        const elapsed = time - startTime;
        const t = Math.min(elapsed / jumpDuration, 1);
        player.parent.position.y = startY + jumpHeight * Math.sin(Math.PI * t);

        if (t < 1) {
          requestAnimationFrame(animateJump);
        } else {
          player.parent.position.y = startY;
          playAnimation("rig|Roll", false, 2.0); // Play landing animation
          setTimeout(() => {
            state.isJumping = false;
            playAnimation("rig|Sprint");
          }, 500); // Delay before switching back to sprint
        }
      };
      requestAnimationFrame(animateJump);
    }
    if (e.key === "ArrowDown" && !state.isJumping) {
      state.isJumping = true;
      const jumpDuration = 500;
      const startTime = performance.now();
      const startY = player.parent.position.y;
      playAnimation("rig|Roll", false, 2.0); // Play jump animation

      const animateJump = (time) => {
        if (state.gameOver) return;
        const elapsed = time - startTime;
        const t = Math.min(elapsed / jumpDuration, 1);

        if (t < 1) {
          requestAnimationFrame(animateJump);
        } else {
          state.isJumping = false;
          playAnimation("rig|Sprint");
        }
      };
      requestAnimationFrame(animateJump);
    }
  });
}

function animateLaneSwitch(player, targetX) {
  const startX = player.parent.position.x;
  const duration = 200;
  const startTime = performance.now();

  const animate = (time) => {
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1);
    player.parent.position.x = startX + (targetX - startX) * t;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      player.parent.position.x = targetX;
    }
  };

  requestAnimationFrame(animate);
}

// game/SwipeControls.js
export function setupSwipeControls(player, state, playAnimation) {
  let touchStartX = 0;
  let touchStartY = 0;
  const threshold = 30; // Minimum distance in px to consider a swipe

  const targetX = () => state.currentLane * -state.laneOffset;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (state.gameOver) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > threshold && state.currentLane > -1) {
        state.currentLane--;
        animateLaneSwitch(player, targetX());
      } else if (dx < -threshold && state.currentLane < 1) {
        state.currentLane++;
        animateLaneSwitch(player, targetX());
      }
    } else {
      // Vertical swipe
      if (dy < -threshold && !state.isJumping) {
        // Swipe up
        simulateJump(player, state, playAnimation);
      } else if (dy > threshold && !state.isJumping) {
        // Swipe down
        simulateRoll(player, state, playAnimation);
      }
    }
  };

  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
}
function simulateJump(player, state, playAnimation) {
  const jumpHeight = 2;
  const jumpDuration = 500;
  const startTime = performance.now();
  const startY = player.parent.position.y;

  playAnimation("rig|Jump", false, 1.0);

  const animateJump = (time) => {
    if (state.gameOver) return;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / jumpDuration, 1);
    player.parent.position.y = startY + jumpHeight * Math.sin(Math.PI * t);

    if (t < 1) {
      requestAnimationFrame(animateJump);
    } else {
      player.parent.position.y = startY;
      playAnimation("rig|Roll", false, 2.0);
      setTimeout(() => {
        state.isJumping = false;
        playAnimation("rig|Sprint");
      }, 500);
    }
  };

  state.isJumping = true;
  requestAnimationFrame(animateJump);
}

function simulateRoll(player, state, playAnimation) {
  const rollDuration = 500;
  const startTime = performance.now();

  playAnimation("rig|Roll", false, 2.0);

  const animateRoll = (time) => {
    if (state.gameOver) return;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / rollDuration, 1);

    if (t < 1) {
      requestAnimationFrame(animateRoll);
    } else {
      state.isJumping = false;
      playAnimation("rig|Sprint");
    }
  };

  state.isJumping = true;
  requestAnimationFrame(animateRoll);
}
