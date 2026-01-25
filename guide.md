# Implementation Guide: CSS Houdini Ring Particles Background

This guide explains how to add the animated, mouse-responsive floating particle background effect to any website. The effect uses the **CSS Houdini Paint API**.

> [!IMPORTANT]
> **Browser Support**: CSS Paint Worklets are supported in Chromium-based browsers (Chrome, Edge, Opera, Brave). They do **not** work in Firefox or Safari. The code includes a feature check, so the page will simply not show the effect in unsupported browsers.

---

## Overview

The effect is achieved in three parts:

1.  **HTML**: A container element that will display the particle background.
2.  **CSS**: Custom properties to configure the particle effect, the `paint()` function to render them, and keyframe animations.
3.  **JavaScript**: Code to register the paint worklet and handle mouse events.

---

## Step 1: HTML Structure

Create a container element. This element needs to have dimensions (width and height) for the background to be visible. For a full-page background, this is typically the `<body>` or a wrapper `<div>`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Particle Background</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- This div will have the particle background -->
    <div id="particle-container">
      <!-- Your page content goes here -->
      <h1>My Website</h1>
    </div>

    <script src="script.js"></script>
  </body>
</html>
```

---

## Step 2: CSS Configuration

Create a [styles.css](file:///c:/Users/jayab/OneDrive/Desktop/anti/styles.css) file. This is where you configure the look of the particles and set up the animations.

### 2.1: Define Animatable Custom Properties

For the animations to work smoothly, you must use `@property` to tell the browser that these custom properties are numbers that can be transitioned/animated.

```css
/* --- REQUIRED: Register custom properties for animation --- */
@property --animation-tick {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --ring-radius {
  syntax: "<number>";
  inherits: false;
  initial-value: 150; /* Starting radius */
}

@property --ring-x {
  syntax: "<number>";
  inherits: false;
  initial-value: 50; /* 50 = center (percentage) */
}

@property --ring-y {
  syntax: "<number>";
  inherits: false;
  initial-value: 50; /* 50 = center (percentage) */
}
```

### 2.2: Define Keyframe Animations

These animations make the particles "breathe" and shimmer.

```css
/* --- Keyframes for continuous animation --- */

/* This makes particles shimmer/twinkle */
@keyframes ripple {
  from {
    --animation-tick: 0;
  }
  to {
    --animation-tick: 1;
  }
}

/* This makes the ring expand and contract */
@keyframes ring {
  from {
    --ring-radius: 150;
  }
  to {
    --ring-radius: 250;
  }
}
```

### 2.3: Style the Container Element

Apply the particle configuration and the paint function to your container.

```css
/* --- Base styles for the container --- */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%; /* Ensure body has height */
}

#particle-container {
  /* Ensure the container has dimensions */
  min-height: 100vh;
  width: 100%;

  /* --- PARTICLE CONFIGURATION --- */
  /* Adjust these values to customize the look */

  --ring-radius: 150; /* Base radius of the particle ring */
  --ring-thickness: 600; /* How spread out the particles are from the center */
  --particle-count: 80; /* Number of particles per row */
  --particle-rows: 25; /* Number of concentric rows of particles */
  --particle-size: 2; /* Diameter of each particle in pixels */
  --particle-color: navy; /* Color of the particles (any valid CSS color) */
  --particle-min-alpha: 0.1; /* Minimum opacity of particles */
  --particle-max-alpha: 1; /* Maximum opacity of particles */
  --seed: 200; /* Random seed for particle placement */

  /* --- APPLY THE PAINT WORKLET --- */
  /* This line renders the particles as a background image */
  background-image: paint(ring-particles);
  background-color: #f0f0f0; /* Fallback color for unsupported browsers */

  /* --- APPLY ANIMATIONS --- */
  animation:
    ripple 6s linear infinite,
    ring 6s ease-in-out infinite alternate;

  /* --- SMOOTH MOUSE FOLLOWING --- */
  /* When JS updates --ring-x and --ring-y, this transition smooths the movement */
  transition:
    --ring-x 0.5s ease-out,
    --ring-y 0.5s ease-out;
}
```

---

## Step 3: JavaScript for Interactivity

Create a `script.js` file. This script does two things:

1.  Registers the external paint worklet library.
2.  Listens for mouse movement to update the particle ring's center position.

```javascript
// Check if the browser supports Paint Worklets
if ("paintWorklet" in CSS) {
  // --- 1. REGISTER THE PAINT WORKLET ---
  // This loads the external library that defines how the particles are drawn.
  CSS.paintWorklet.addModule(
    "https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js",
  );

  // --- 2. SETUP MOUSE INTERACTIVITY ---
  const container = document.querySelector("#particle-container");

  if (container) {
    // Update particle center position on mouse move
    container.addEventListener("pointermove", (e) => {
      // Calculate mouse position as a percentage of the container's dimensions
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;

      // Update the CSS custom properties
      container.style.setProperty("--ring-x", xPercent);
      container.style.setProperty("--ring-y", yPercent);
    });

    // Reset to center when mouse leaves the container
    container.addEventListener("pointerleave", () => {
      container.style.setProperty("--ring-x", 50);
      container.style.setProperty("--ring-y", 50);
    });
  }
} else {
  console.log("CSS Paint Worklets are not supported in this browser.");
}
```

---

## Complete File Structure

```
your-project/
├── index.html
├── styles.css
└── script.js
```

---

## Customization Cheat Sheet

| CSS Property           | Description                                | Example Value |
| :--------------------- | :----------------------------------------- | :------------ |
| `--ring-radius`        | Base radius of the ring from center.       | `150`         |
| `--ring-thickness`     | How far particles spread from the ring.    | `600`         |
| `--particle-count`     | Number of particles per row.               | `80`          |
| `--particle-rows`      | Number of concentric circles of particles. | `25`          |
| `--particle-size`      | Diameter of each particle (pixels).        | `2`           |
| `--particle-color`     | Color of the particles.                    | `royalblue`   |
| `--particle-min-alpha` | Minimum opacity (0-1).                     | `0.1`         |
| `--particle-max-alpha` | Maximum opacity (0-1).                     | `1.0`         |
| `--seed`               | Random seed for reproducible patterns.     | `123`         |

---

## Verification

1.  Open [index.html](file:///c:/Users/jayab/OneDrive/Desktop/anti/index.html) in a **Chromium-based browser** (Chrome, Edge).
2.  You should see animated particles filling the `#particle-container`.
3.  Move your mouse over the container; the particle ring should follow.
4.  If nothing appears, check the browser's Developer Console for errors.
