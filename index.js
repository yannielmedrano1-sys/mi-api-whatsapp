import express from 'express';
import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: '¡API propia funcionando al 100%, mi amor! 🚀' });
});

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

app.get('/api/ytmp3', async (req, res) => {
    const videoUrl = req.query.query;
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).json({ status: false, message: 'URL de YouTube inválida o faltante.' });
    }

    try {
        // Opciones avanzadas para evitar el bloqueo de YouTube en Render
        const agent = ytdl.createAgent(JSON.parse(process.env.YT_COOKIE || '[]')); // Por si acaso usas cookies luego, si no, usa opciones base
        
        const info = await ytdl.getInfo(videoUrl);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

        if (!format || !format.url) {
            return res.status(500).json({ status: false, message: 'No se encontró un formato de audio válido.' });
        }

        // Redirigir directamente al stream limpio de YouTube o mandarlo por buffer
        res.json({
            status: true,
            downloadUrl: format.url
        });

    } catch (error) {
        console.error('Error detallado en ytmp3:', error.message);
        res.status(500).json({ status: false, message: 'Error al extraer el audio del video.' });
    }
});

app.listen(PORT, () => {
    console.log(`🔥 API corriendo en el puerto ${PORT}`);
});