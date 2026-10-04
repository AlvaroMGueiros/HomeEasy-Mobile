# Home Easy — lançamento em motion design

Vídeo de 75 segundos (4500 frames a 60 fps), em 1920×1080 e 1080×1920. As 12 cenas são componentes independentes em `src/scenes`. A interface, mapas e ícones são desenhados em React/SVG; as capturas antigas em `public/screens` não entram nesta campanha.

```bash
npm install
npm run studio
npm run render
npm run render:vertical
```

Os arquivos finais são `out/home-easy-launch-16x9.mp4` e `out/home-easy-launch-9x16.mp4`. O texto está em `src/theme/copy.ts`; cores, tipografia, espaçamento e timings ficam nos demais arquivos de `src/theme`. As cenas têm 30 frames de sobreposição, revelados por uma máscara circular compartilhada. `src/theme/audio.ts` contém a cue sheet a 120 BPM. Não há música ou SFX embutidos porque ainda não foram fornecidos arquivos licenciados; adicione-os à pasta `public/audio` e sincronize-os com as constantes da cue sheet.
