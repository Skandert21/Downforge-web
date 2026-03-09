const express = require('express');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(require('cors')({
    exposedHeaders: ['Content-Disposition']
}));

// --- PASO 1: SERVIR ARCHIVOS DE ANGULAR ---
const distPath = path.join(__dirname, 'dist', 'Youwnloader', 'browser');
app.use(express.static(distPath));

// Ajuste para multiplataforma: En Render (Linux) usamos el comando global
const isWin = process.platform === 'win32';
const ytdlpPath = isWin ? path.join(__dirname, 'bin', 'yt-dlp.exe') : 'yt-dlp';

let downloadStatus = {
    mensaje: "Esperando...",
    progreso: "0",
    activo: false
};

// --- RUTAS DEL API ---
app.get('/api/status', (req, res) => {
    res.json(downloadStatus);
});

app.post('/api/download', async (req, res) => {
    const { url, type, quality, codec } = req.body;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    downloadStatus = { mensaje: "Iniciando...", progreso: "0", activo: true };

    const isAudio = type === 'mp3';
    const extension = isAudio ? 'mp3' : 'mp4';
    const codecMap = {
        'h264': '[vcodec^=avc1]',
        'vp9': '[vcodec^=vp9]',
        'av1': '[vcodec^=av01]'
    };

    let formatOption;
    if (isAudio) {
        formatOption = 'bestaudio/best';
    } else {
        const selectedCodecFilter = codecMap[codec] || '[vcodec^=avc1]';
        formatOption = `bestvideo[height<=${quality}]${selectedCodecFilter}+bestaudio[ext=m4a]/best[ext=mp4]/best`;
    }

    try {
        const cleanUrl = url.split('&list=')[0];

        // FLAGS OPTIMIZADAS PARA STREAMING
        const flags = {
            format: formatOption,
            noPlaylist: true,
            newline: true,
            output: '-',
            noCacheDir: true,
            noPart: true, // No crear archivos temporales, flujo directo
            ffmpegLocation: isWin ? undefined : '/usr/bin/ffmpeg' // Ayuda a Linux a hallar FFmpeg
        };

        if (isAudio) {
            flags.extractAudio = true;
            flags.audioFormat = 'mp3';
        }

        const subprocess = youtubedl.exec(cleanUrl, flags, {
            executablePath: ytdlpPath 
        });

        // Configuración de cabeceras para la descarga
        res.header('Content-Disposition', `attachment; filename="download.${extension}"`);
        res.header('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');

        // Canalización de la salida estándar al cliente
        subprocess.stdout.pipe(res);

        // Captura de errores y progreso
        subprocess.stderr.on('data', (data) => {
            const output = data.toString();
            console.log(`[YT-DLP LOG]: ${output}`); // Esto saldrá en los logs de Render
            
            if (output.includes('%')) {
                const match = output.match(/(\d+\.\d+)%/);
                if (match) downloadStatus.progreso = match[1];
            }
        });

        subprocess.on('close', (code) => {
            downloadStatus.activo = false;
            downloadStatus.mensaje = code === 0 ? "Finalizado" : "Error";
            console.log(`Proceso finalizado con código: ${code}`);
        });

        // Manejo de cierre inesperado de la conexión por parte del usuario
        req.on('close', () => {
            subprocess.kill();
        });

    } catch (err) {
        downloadStatus.activo = false;
        console.error("Error en el servidor:", err);
        if (!res.headersSent) res.status(500).send('Error interno');
    }
});

// --- PASO 2: CATCH-ALL PARA ANGULAR ---
app.use((req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (!req.url.startsWith('/api')) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'Endpoint de API no encontrado' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});