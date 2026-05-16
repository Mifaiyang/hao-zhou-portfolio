# Zhou Hao Personal Site Design System

Design Decisions:
- Color palette: paper `#f7f2e8`, ink `#11110f`, slate `#2d3432`, signal cyan `#00c9d2`, field orange `#ff5a2a`, proof lime `#b6ff39`.
- Typography: dense Chinese body copy with `Noto Sans SC`; condensed Latin display with `Bebas Neue`; large Chinese names set with local bold sans-serif fallbacks.
- Spacing system: 8px base grid; major section rhythm uses 64px, 96px, and 128px bands.
- Border-radius strategy: sharp editorial geometry, maximum radius 8px except image masking.
- Shadow hierarchy: mostly flat; depth comes from blend modes, outlines, offset panels, and animated canvas texture.
- Motion style: responsive signal-field canvas, scroll-tied progress, restrained hover transforms, and optional reduced-motion support.

Positioning:
- Narrative role: a portfolio-resume hybrid that proves creative output and business impact in the first 10 seconds.
- Viewing distance: laptop interview screen first, with mobile recruiter scan as a secondary target.
- Visual temperature: experimental, precise, production-minded; not a generic creator landing page.
- Capacity check: content is grouped into proof blocks, timelines, and a single embedded portfolio video to avoid resume-wall overload.
