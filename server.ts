import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { monedasRouter } from './src/server/routes/monedas';
import { paisesRouter } from './src/server/routes/paises';
import { usuariosRouter } from './src/server/routes/usuarios';
import { filtroSeguridad } from './src/server/auth';
import { store } from './src/server/store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = process.env.HOST || '0.0.0.0';

  app.use(cors());
  app.use(express.json());

  // Security Filter matching Spring Boot FiltroSeguridad
  app.use(filtroSeguridad);

  // Mount API routers
  app.use('/api/monedas', monedasRouter);
  app.use('/api/paises', paisesRouter);
  app.use('/api/usuarios', usuariosRouter);

  // SQL scripts endpoints
  app.get('/api/sql/ddl', (_req, res) => {
    const file = path.resolve(__dirname, 'BD/DDL_Monedas.sql');
    if (fs.existsSync(file)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(file);
    } else {
      res.status(404).send('DDL no encontrado');
    }
  });

  app.get('/api/sql/dml', (_req, res) => {
    const file = path.resolve(__dirname, 'BD/DML_Monedas.sql');
    if (fs.existsSync(file)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(file);
    } else {
      res.status(404).send('DML no encontrado');
    }
  });

  // System & API info endpoint
  app.get('/api/info', (_req, res) => {
    res.json({
      nombre: 'API Cambio de Monedas (Migrado de Spring Boot a Node.js Express)',
      version: '1.0.0',
      totalMonedas: store.listarMonedas().length,
      totalPaises: store.listarPaises().length,
      rutas: [
        'GET  /api/sql/ddl',
        'GET  /api/sql/dml',
        'GET  /api/monedas/listar',
        'GET  /api/monedas/obtener/:id',
        'GET  /api/monedas/buscar/:nombre',
        'GET  /api/monedas/buscarporpais/:nombre',
        'POST /api/monedas/agregar',
        'PUT  /api/monedas/modificar',
        'DELETE /api/monedas/eliminar/:id',
        'GET/POST /api/monedas/listarporperiodo (query/body: idMoneda, desde, hasta)',
        'GET  /api/paises/listar',
        'GET  /api/paises/obtener/:id',
        'GET  /api/paises/buscar/:nombre',
        'POST /api/paises/agregar',
        'PUT  /api/paises/modificar',
        'DELETE /api/paises/eliminar/:id',
        'GET  /api/paises/capital/:pais',
        'GET  /api/usuarios/login/:nombreUsuario/:clave',
        'POST /api/usuarios/login',
        'GET  /api/usuarios/listar',
        'GET  /api/usuarios/obtener/:id',
        'GET  /api/usuarios/buscar/:nombre',
        'POST /api/usuarios/agregar',
        'PUT  /api/usuarios/modificar',
        'DELETE /api/usuarios/eliminar/:id',
      ],
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Servidor iniciado en http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
