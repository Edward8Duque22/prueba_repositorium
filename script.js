// ── Ruta única para toda la API ────────────────────────────────────────
const API = '/api';

// ── Cargar proyectos (usada por index.html) ───────────────────────────
async function cargarProyectos() {
    try {
        const res = await fetch(`${API}?accion=listar`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('cargarProyectos falló:', err);
        return [];
    }
}

// ── Agregar proyecto (usada por admin.html) ───────────────────────────
async function agregarProyecto() {
    const tituloEl = document.getElementById('titulo');
    const fechaEl  = document.getElementById('fecha');
    const fotoEl   = document.getElementById('foto');
    const repoEl   = document.getElementById('repo');
    const liveEl   = document.getElementById('live');
    const descEl   = document.getElementById('desc');

    if (!tituloEl.value.trim()) return alert('El título es obligatorio.');
    if (!fotoEl.files[0])       return alert('Selecciona una imagen.');

    const reader = new FileReader();
    reader.onload = async (e) => {
        const datos = {
            titulo: tituloEl.value.trim(),
            fecha:  fechaEl.value  || new Date().toISOString().slice(0, 10),
            img:    e.target.result,
            repo:   repoEl.value.trim() || '#',
            live:   liveEl.value.trim() || '#',
            desc:   descEl.value.trim() || ''
        };

        try {
            const res = await fetch(`${API}?accion=guardar`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(datos)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            alert('¡Proyecto guardado!');
            location.reload();
        } catch (err) {
            console.error('agregarProyecto falló:', err);
            alert('Error al guardar el proyecto. Revisa la consola.');
        }
    };
    reader.readAsDataURL(fotoEl.files[0]);
}

// ── Eliminar proyecto (usada por admin.html) ──────────────────────────
async function eliminarProyecto(id) {
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    try {
        const res = await fetch(`${API}?accion=eliminar&id=${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        alert('Proyecto eliminado.');
        cargarAdmin();  // recarga la lista sin recargar la página completa
    } catch (err) {
        console.error('eliminarProyecto falló:', err);
        alert('Error al eliminar. Revisa la consola.');
    }
}
