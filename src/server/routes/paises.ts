import { Router, Request, Response } from 'express';
import { store } from '../store';

export const paisesRouter = Router();

// GET /api/paises/listar
paisesRouter.get('/listar', (_req: Request, res: Response) => {
  const lista = store.listarPaises();
  res.json(lista);
});

// GET /api/paises/obtener/:id
paisesRouter.get('/obtener/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  const pais = store.obtenerPais(id);
  if (!pais) {
    return res.status(404).json(null);
  }
  res.json(pais);
});

// GET /api/paises/buscar/:nombre
paisesRouter.get('/buscar/:nombre', (req: Request, res: Response) => {
  const nombre = req.params.nombre;
  const resultados = store.buscarPaises(nombre);
  res.json(resultados);
});

// POST /api/paises/agregar
paisesRouter.post('/agregar', (req: Request, res: Response) => {
  const nuevo = store.agregarPais(req.body);
  res.status(200).json(nuevo);
});

// PUT /api/paises/modificar
paisesRouter.put('/modificar', (req: Request, res: Response) => {
  const modificado = store.modificarPais(req.body);
  if (!modificado) {
    return res.status(404).json(null);
  }
  res.json(modificado);
});

// DELETE /api/paises/eliminar/:id
paisesRouter.delete('/eliminar/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json(false);
  }
  const eliminado = store.eliminarPais(id);
  res.json(eliminado);
});

// GET /api/paises/capital/:pais
paisesRouter.get('/capital/:pais', (req: Request, res: Response) => {
  const nombrePais = req.params.pais;
  const capital = store.obtenerCapital(nombrePais);
  res.json(capital);
});
