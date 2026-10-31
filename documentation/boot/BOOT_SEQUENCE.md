# CHAOSOS boot sequence — approved visual direction

**Status: design reference for a future boot-animation implementation.**

The supplied storyboard image is stored at:

`documentation/boot/assets/boot-sequence-storyboard-reference.png`

The sequence and composition should stay faithful to that reference. The
change is to use a photorealistic human eye as the visual source, not replace
the concept with an abstract logo, particle cloud, or unrelated animation.

## Six visual stages

1. **Natural eye:** a realistic human eye, naturally open and still.
2. **Beginning of blink:** the eyelid starts to close in a slow, continuous blink.
3. **Closed eye:** the eyelid closes fully for a brief transition.
4. **Pupil transformation:** the eye reopens; the scene darkens and the red
   transformation begins in the pupil/iris.
5. **Final eye:** the eye settles into its final dark form with a deep red,
   luminous pupil/iris.
6. **Optional accent:** restrained red veins, cracks, or energy lines appear
   around the eye. Keep this subtle; avoid excessive effects.

## Composition to preserve

- Black background.
- Same order and meaning of the six frames.
- CHAOSOS red eye mark and the `CHAOSOS` wordmark.
- The Arabic tagline: `عين واحدة ... لعالم آخر`.
- Natural eye realism must remain the core visual. The transformation is the
  unusual event; the initial eye itself should look ordinary and human.

## Animation implementation requirements

- Generate or license a consistent eye source and create temporally coherent
  frame images from it. Do not mix different people/eyes or unrelated crops.
- Use a sequence of optimized WebP/AVIF frames or a sprite sheet, with smooth
  interpolation/transitions where appropriate.
- Preload only the initial frames, then progressively load later frames to
  avoid a large memory spike on entry-level Android devices.
- Synchronize the handoff to the home screen with actual shell readiness; do
  not hide a failed initialization behind a completed animation.
- Respect `prefers-reduced-motion`, provide a skip control, and keep a static
  fallback if image decoding fails.
- Measure frame rate, memory use, and total asset size on a real Android device.

The existing V3.1.6 boot screen is a timed CSS/JavaScript simulation. This
storyboard has not yet been converted into an actual frame sequence.
