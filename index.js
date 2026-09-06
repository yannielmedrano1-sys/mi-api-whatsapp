import express from 'express';
import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta de prueba para ver si la API está viva
app.get('/', (req, res) => {
    res.json({ status: true, message: '¡API propia funcionando al 100%, mi amor! 🚀' });
});

// Endpoint 1: Obtener info y thumbnail
app.get('/api/ytinfo', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.json({ status: false, message: 'Falta el parámetro query' });
    }

    try {
        const search = await yts(query);
        const vid = search.videos[0];

        if (!vid) {
            return res.json({ status: false, message: 'No se encontró la canción.' });
        }

        res.json({
            status: true,
            title: vid.title,
            duration: vid.timestamp,
            views: vid.views ? vid.views.toLocaleString() : 'Desconocido',
            published: vid.ago || 'Reciente',
            url: vid.url,
            thumbnail: vid.thumbnail
        });
    } catch (error) {
        console.error(error);
        res.json({ status: false, message: 'Error interno al buscar la información.' });
    }
});

// Endpoint 2: Obtener enlace de descarga de audio
app.get('/api/ytmp3', async (req, res) => {
    const videoUrl = req.query.query;
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.json({ status: false, message: 'URL de YouTube inválida o faltante.' });
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        
        if (audioFormats.length === 0) {
            return res.json({ status: false, message: 'No se encontraron formatos de audio.' });
        }

        res.json({
            status: true,
            downloadUrl: audioFormats[0].url
        });
    } catch (error) {
        console.error(error);
        res.json({ status: false, message: 'Error al extraer el audio del video.' });
    }
});

app.listen(PORT, () => {
    console.log(`🔥 API corriendo en el puerto ${PORT}`);
});