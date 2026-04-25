export const CDN_LINKS = {
    alpine: '<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>',
    tailwind: '<script src="https://cdn.tailwindcss.com"></script>',
    pdfjs: '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>',
    xlsx: '<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>',
    tesseract: '<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>'
};
export const HOT_RELOAD_SCRIPT = (wsPort) => `
<script>
  (function() {
    const socket = new WebSocket('ws://localhost:${wsPort}');
    socket.onmessage = (msg) => { 
      if(msg.data === 'reload') {
        console.log('Hot reload triggered');
        window.location.reload(); 
      }
    };
    socket.onclose = () => console.log('Hot reload disconnected');
    socket.onerror = (err) => console.error('Hot reload error:', err);
  })();
</script>
`;
export const HTML_BOILERPLATE = (body, libs, wsPort) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quickfill Preview</title>
    ${CDN_LINKS.tailwind}
    ${CDN_LINKS.alpine}
    ${libs.includes('pdf') ? CDN_LINKS.pdfjs : ''}
    ${libs.includes('excel') ? CDN_LINKS.xlsx : ''}
    ${libs.includes('ocr') ? CDN_LINKS.tesseract : ''}
    ${HOT_RELOAD_SCRIPT(wsPort)}
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    ${body}
</body>
</html>
`;
