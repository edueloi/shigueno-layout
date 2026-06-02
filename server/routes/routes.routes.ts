import { Router } from 'express';
import { getDb } from '../../server-db';

const router = Router();

// GET all routes
router.get('/routes', async (req, res) => {
  try {
    const db = await getDb();
    const routes = await db.all('SELECT * FROM routes');
    res.json({ success: true, routes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST start route (Driver triggers "Iniciar Rota")
router.post('/routes', async (req, res) => {
  try {
    const db = await getDb();
    const { 
      driver_name, 
      vehicle_plate, 
      vehicle_type, 
      start_location, 
      destination, 
      current_lat, 
      current_lng, 
      cargo_description 
    } = req.body;

    const now = new Date();
    const started_at = now.toISOString().replace('T', ' ').slice(0, 19);

    const initialHistory = [
      { 
        lat: Number(current_lat) || -23.3556, 
        lng: Number(current_lng) || -47.8556, 
        time: started_at, 
        speed: 0, 
        event: `Início de rota com destino a ${destination}.` 
      }
    ];

    const result = await db.run(
      'INSERT INTO routes (driver_name, vehicle_plate, vehicle_type, start_location, destination, status, started_at, current_lat, current_lng, progress, speed, fuel_level, cargo_description, last_event, coordinates_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        driver_name,
        vehicle_plate,
        vehicle_type,
        start_location,
        destination,
        'Ativa',
        started_at,
        Number(current_lat) || -23.3556,
        Number(current_lng) || -47.8556,
        0, // Progress 0%
        0, // Speed 0 km/h
        100, // Fuel 100%
        cargo_description || 'Cargas Gerais',
        'Motorista iniciou a rota e ligou o veículo.',
        JSON.stringify(initialHistory)
      ]
    );

    res.json({ 
      success: true, 
      id: result.lastID, 
      message: 'Rota e rastreamento GPS iniciados com sucesso!' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update telemetry / GPS Ping / Stop route
router.put('/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Find current route details first
    const routes = await db.all('SELECT * FROM routes');
    const existing = routes.find(r => Number(r.id) === Number(id));

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Rota não encontrada.' });
    }

    const { 
      current_lat, 
      current_lng, 
      progress, 
      speed, 
      fuel_level, 
      last_event, 
      status, 
      event_occurred // Optional descriptor string of what happened
    } = req.body;

    const latVal = Number(current_lat) !== undefined && !isNaN(Number(current_lat)) ? Number(current_lat) : existing.current_lat;
    const lngVal = Number(current_lng) !== undefined && !isNaN(Number(current_lng)) ? Number(current_lng) : existing.current_lng;
    const speedVal = speed !== undefined ? Number(speed) : existing.speed;
    const progressVal = progress !== undefined ? Number(progress) : existing.progress;
    const fuelVal = fuel_level !== undefined ? Number(fuel_level) : existing.fuel_level;
    const statusVal = status || existing.status;
    const lastEventVal = last_event || existing.last_event;

    // Construtor do histórico
    let coordsHistory = [];
    try {
      coordsHistory = typeof existing.coordinates_history === 'string' 
        ? JSON.parse(existing.coordinates_history) 
        : (existing.coordinates_history || []);
    } catch (e) {
      coordsHistory = existing.coordinates_history || [];
    }

    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 19);

    // If new coords or status changed, or a specific event occurred, add to path history
    if (event_occurred || speedVal !== existing.speed || progressVal !== existing.progress || Math.abs(latVal - existing.current_lat) > 0.0001) {
      coordsHistory.push({
        lat: latVal,
        lng: lngVal,
        time: timeStr,
        speed: speedVal,
        event: event_occurred || lastEventVal
      });
    }

    let completedAt = existing.completed_at;
    if (statusVal === 'Concluída' && existing.status !== 'Concluída') {
      completedAt = timeStr;
      coordsHistory.push({
        lat: latVal,
        lng: lngVal,
        time: timeStr,
        speed: 0,
        event: 'Destino alcançado. Rota finalizada!'
      });
    }

    await db.run(
      'UPDATE routes SET current_lat = ?, current_lng = ?, progress = ?, speed = ?, fuel_level = ?, last_event = ?, coordinates_history = ?, status = ?, completed_at = ? WHERE id = ?',
      [
        latVal,
        lngVal,
        progressVal,
        speedVal,
        fuelVal,
        lastEventVal,
        JSON.stringify(coordsHistory),
        statusVal,
        completedAt,
        Number(id)
      ]
    );

    res.json({ 
      success: true, 
      message: statusVal === 'Concluída' ? 'Rota concluída com sucesso!' : 'Posicionamento GPS atualizado em tempo real.',
      route: {
        id: Number(id),
        status: statusVal,
        progress: progressVal,
        completed_at: completedAt
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE standard route entry (purgar)
router.delete('/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('DELETE FROM routes WHERE id = ?', [Number(id)]);
    res.json({ success: true, message: 'Registro de rota expurgado do banco.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
