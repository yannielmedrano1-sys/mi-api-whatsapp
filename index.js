import express from 'express';
import yts from 'yt-search';
import axios from 'axios';

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

// Endpoint ytmp3 ultra-optimizado usando un extractor externo estable
app.get('/api/ytmp3', async (req, res) => {
    const videoUrl = req.query.query;
    if (!videoUrl) {
        return res.status(400).json({ status: false, message: 'URL de YouTube faltante.' });
    }

    try {
        // Usamos un servicio público y rápido para extraer el enlace de audio sin bloqueos de IP
        const response = await axios.post('https://co.wuk.sh/api/json', {
            url: videoUrl,
            isAudioOnly: true,
            downloadMode: 'audio'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.data && (response.data.url || response.data.picker)) {
            const downloadLink = response.data.url || response.data.picker[0].url;
            return res.json({
                status: true,
                downloadUrl: downloadLink
            });
        }

        res.json({ status: false, message: 'No se pudo procesar el audio con el extractor.' });
    } catch (error) {
        console.error('Error en ytmp3 alternativo:', error.message);
        res.json({ status: false, message: 'Error al extraer el audio del video.' });
    }
});

app.listen(PORT, () => {
    console.log(`🔥 API corriendo en el puerto ${PORT}`);
});