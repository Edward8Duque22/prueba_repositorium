const { MongoClient, ObjectId } = require('mongodb');

let client;

async function getClient() {
    if (!client) {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
    }
    return client;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { accion, h, id } = req.query;

    try {
        const c = await getClient();
        const db = c.db('archivo_creativo');
        const proyectos = db.collection('proyectos');

        // ── LOGIN ──────────────────────────────────────────────────────
        if (accion === 'login') {
            const hashCorrecto = "c0e1cd8fc8386315b37205f95cd4918b8820715968f4b0c6bd910ce0c78045ba";
            const ok = h === hashCorrecto;
            return res.status(ok ? 200 : 401).json({ success: ok });
        }

        // ── LISTAR ────────────────────────────────────────────────────
        if (accion === 'listar') {
            const data = await proyectos.find({}).sort({ fecha: -1 }).toArray();
            return res.status(200).json(data);
        }

        // ── GUARDAR ───────────────────────────────────────────────────
        if (accion === 'guardar' && req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch {
                    return res.status(400).json({ error: 'Body JSON inválido' });
                }
            }
            if (!body || !body.titulo) {
                return res.status(400).json({ error: 'Falta el campo "titulo"' });
            }
            body.createdAt = new Date();
            const result = await proyectos.insertOne(body);
            return res.status(200).json({ success: true, id: result.insertedId });
        }

        // ── ELIMINAR ──────────────────────────────────────────────────
        if (accion === 'eliminar' && req.method === 'DELETE') {
            if (!id) return res.status(400).json({ error: 'Falta el parámetro "id"' });
            let oid;
            try { oid = new ObjectId(id); } catch {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const result = await proyectos.deleteOne({ _id: oid });
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Proyecto no encontrado' });
            }
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: `Acción desconocida: "${accion}"` });

    } catch (e) {
        console.error('Error en API:', e);
        return res.status(500).json({ error: e.message });
    }
};
