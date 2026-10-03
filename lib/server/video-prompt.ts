// Server-only: this instruction is never shipped in the creation UI.
export const MOTION_MASTER = `MOTION TRANSFER / REFERENCE VIDEO RECONSTRUCTION
Video 1 is the absolute source-of-truth for motion, performance, timing, choreography, camera movement, framing, composition, scene progression and physical interaction.
Reconstruct Video 1 while replacing ONLY the main human subject with Image 1.
REFERENCE VIDEO RULE: Preserve body motion, pose progression, direction and speed of travel, gestures, hand and head movement, choreography, physical interactions, entrances, exits, screen position, character spacing, camera position, angle and movement, framing, composition, shot progression, scene timing, environmental movement and occlusion timing. Do not invent a different performance, reinterpret choreography, or unnecessarily change the camera or environment. VIDEO 1 IS THE MOTION MASTER.
REFERENCE IMAGE RULE: Image 1 defines identity and appearance, including face, skin tone, hairstyle, body proportions, clothing, accessories, colors, materials and distinctive characteristics. Do not blend identities, drift back to the original actor, or morph between identities.
MOTION RETARGETING: Preserve functional position, action, trajectory, timing, orientation, interactions and choreography. Retarget naturally for different body proportions without distorting anatomy.
MULTIPLE CHARACTER RULE: Replace only the main subject. Leave unassigned people unchanged. Do not synchronize independent performances.
SCENE PRESERVATION: Unless explicitly requested, preserve location, architecture, background, furniture, vehicles, props, weather, scene geometry, lighting, atmosphere and environmental activity. Change only explicitly assigned entities.
PHYSICAL INTEGRATION: Preserve realistic lighting, shadows, reflections, perspective, scale, depth, motion blur, interactions and occlusions. Preserve carrying, touching and crossing interactions at corresponding moments.
IDENTITY CONSISTENCY: Maintain replacement identity from first through final frame. Avoid identity swapping, morphing, duplicated anatomy, disappearing characters, flicker, unexpected background regeneration and inconsistent scale.
EDITING RULE: Change only what the user requests. Everything else remains as faithful as possible to Video 1.
PRIORITY ORDER: Explicit user replacement instructions; uploaded image identity; Video 1 motion and timing; Video 1 camera and composition; Video 1 environment and lighting.
FINAL OBJECTIVE: The replacement should look originally present when Video 1 was filmed.
REFERENCE ASSIGNMENTS: Video 1 = MOTION MASTER. Image 1 = MAIN CHARACTER / IDENTITY MASTER. Replace the main human subject in Video 1 with Image 1. Preserve action, choreography, timing, camera, environment and interactions. Additional images are product references only when explicitly enabled.
USER INSTRUCTIONS:
`;
