import fs from 'fs';
import path from 'path';

export interface Moneda {
  id: number;
  nombre: string;
  sigla: string;
  simbolo?: string | null;
  emisor?: string | null;
}

export interface Pais {
  id: number;
  nombre: string;
  codigoAlfa2: string;
  codigoAlfa3: string;
  idMoneda: number;
  moneda?: Moneda;
}

export interface CambioMoneda {
  id: number;
  idMoneda: number;
  fecha: string;
  valor: number;
  moneda?: Moneda;
}

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  clave?: string;
  roles?: string;
}

export interface CapitalDto {
  ciudad: string;
  estado: string;
}

class MonedaStore {
  private monedas: Map<number, Moneda> = new Map();
  private paises: Map<number, Pais> = new Map();
  private cambios: CambioMoneda[] = [];
  private usuarios: Map<number, Usuario> = new Map();
  private nextMonedaId = 1;
  private nextPaisId = 1;
  private nextUsuarioId = 1;
  private nextCambioId = 1;

  constructor() {
    this.cargarDatos();
  }

  private cargarDatos() {
    try {
      const seedPath = path.resolve(process.cwd(), 'src/server/seedData.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf-8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.monedas)) {
          for (const m of data.monedas) {
            this.monedas.set(m.id, m);
            if (m.id >= this.nextMonedaId) this.nextMonedaId = m.id + 1;
          }
        }

        if (Array.isArray(data.paises)) {
          for (const p of data.paises) {
            this.paises.set(p.id, p);
            if (p.id >= this.nextPaisId) this.nextPaisId = p.id + 1;
          }
        }

        if (Array.isArray(data.cambios)) {
          this.cambios = data.cambios;
          this.nextCambioId = this.cambios.length + 1;
        }

        if (Array.isArray(data.usuarios)) {
          for (const u of data.usuarios) {
            this.usuarios.set(u.id, u);
            if (u.id >= this.nextUsuarioId) this.nextUsuarioId = u.id + 1;
          }
        }
      }
    } catch (err) {
      console.error('Error cargando seedData:', err);
    }
  }

  // --- Monedas ---
  public listarMonedas(): Moneda[] {
    return Array.from(this.monedas.values());
  }

  public obtenerMoneda(id: number): Moneda | null {
    return this.monedas.get(id) ?? null;
  }

  public buscarMonedas(nombre: string): Moneda[] {
    const q = nombre.toLowerCase().trim();
    return Array.from(this.monedas.values()).filter(
      (m) =>
        m.nombre.toLowerCase().includes(q) ||
        m.sigla.toLowerCase().includes(q) ||
        (m.emisor && m.emisor.toLowerCase().includes(q))
    );
  }

  public buscarMonedaPorPais(nombrePais: string): Moneda | null {
    const q = nombrePais.toLowerCase().trim();
    const pais = Array.from(this.paises.values()).find(
      (p) => p.nombre.toLowerCase().includes(q) || p.codigoAlfa2.toLowerCase() === q || p.codigoAlfa3.toLowerCase() === q
    );
    if (!pais) return null;
    return this.monedas.get(pais.idMoneda) ?? null;
  }

  public agregarMoneda(datos: Partial<Moneda>): Moneda {
    const id = this.nextMonedaId++;
    const nueva: Moneda = {
      id,
      nombre: datos.nombre || '',
      sigla: datos.sigla || '',
      simbolo: datos.simbolo ?? null,
      emisor: datos.emisor ?? null,
    };
    this.monedas.set(id, nueva);
    return nueva;
  }

  public modificarMoneda(datos: Moneda): Moneda | null {
    if (!this.monedas.has(datos.id)) return null;
    const actual = this.monedas.get(datos.id)!;
    const actualizada: Moneda = {
      ...actual,
      ...datos,
    };
    this.monedas.set(datos.id, actualizada);
    return actualizada;
  }

  public eliminarMoneda(id: number): boolean {
    return this.monedas.delete(id);
  }

  public listarPorPeriodo(idMoneda: number, desde: string | Date, hasta: string | Date): CambioMoneda[] {
    const parseDateToTimestamp = (d: string | Date): number => {
      if (d instanceof Date) return d.getTime();
      const parts = String(d).split(/[-/]/);
      if (parts.length === 3) {
        // e.g. 2018-1-1 or 2018-01-01
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(y, m, day).getTime();
      }
      return new Date(d).getTime();
    };

    const tDesde = parseDateToTimestamp(desde);
    const tHasta = parseDateToTimestamp(hasta);

    const moneda = this.monedas.get(idMoneda);

    return this.cambios
      .filter((c) => {
        if (c.idMoneda !== idMoneda) return false;
        const t = parseDateToTimestamp(c.fecha);
        return t >= tDesde && t <= tHasta;
      })
      .map((c) => ({
        ...c,
        moneda: moneda || undefined,
      }))
      .sort((a, b) => parseDateToTimestamp(a.fecha) - parseDateToTimestamp(b.fecha));
  }

  // --- Países ---
  public listarPaises(): Pais[] {
    return Array.from(this.paises.values()).map((p) => ({
      ...p,
      moneda: this.monedas.get(p.idMoneda) || undefined,
    }));
  }

  public obtenerPais(id: number): Pais | null {
    const p = this.paises.get(id);
    if (!p) return null;
    return {
      ...p,
      moneda: this.monedas.get(p.idMoneda) || undefined,
    };
  }

  public buscarPaises(nombre: string): Pais[] {
    const q = nombre.toLowerCase().trim();
    return Array.from(this.paises.values())
      .filter((p) => p.nombre.toLowerCase().includes(q) || p.codigoAlfa2.toLowerCase().includes(q) || p.codigoAlfa3.toLowerCase().includes(q))
      .map((p) => ({
        ...p,
        moneda: this.monedas.get(p.idMoneda) || undefined,
      }));
  }

  public agregarPais(datos: Partial<Pais>): Pais {
    const id = this.nextPaisId++;
    const nuevo: Pais = {
      id,
      nombre: datos.nombre || '',
      codigoAlfa2: datos.codigoAlfa2 || '',
      codigoAlfa3: datos.codigoAlfa3 || '',
      idMoneda: datos.idMoneda || (datos.moneda?.id ?? 1),
    };
    nuevo.moneda = this.monedas.get(nuevo.idMoneda);
    this.paises.set(id, nuevo);
    return nuevo;
  }

  public modificarPais(datos: Pais): Pais | null {
    if (!this.paises.has(datos.id)) return null;
    const actual = this.paises.get(datos.id)!;
    const actualizado: Pais = {
      ...actual,
      ...datos,
      idMoneda: datos.idMoneda || datos.moneda?.id || actual.idMoneda,
    };
    actualizado.moneda = this.monedas.get(actualizado.idMoneda);
    this.paises.set(datos.id, actualizado);
    return actualizado;
  }

  public eliminarPais(id: number): boolean {
    return this.paises.delete(id);
  }

  public obtenerCapital(nombrePais: string): CapitalDto {
    const capitals: Record<string, { ciudad: string; estado: string }> = {
      colombia: { ciudad: 'Bogotá', estado: 'Distrito Capital' },
      argentina: { ciudad: 'Buenos Aires', estado: 'Ciudad Autónoma de Buenos Aires' },
      españa: { ciudad: 'Madrid', estado: 'Comunidad de Madrid' },
      'estados unidos': { ciudad: 'Washington, D.C.', estado: 'Distrito de Columbia' },
      mexico: { ciudad: 'Ciudad de México', estado: 'CDMX' },
      méxico: { ciudad: 'Ciudad de México', estado: 'CDMX' },
      francia: { ciudad: 'París', estado: 'Isla de Francia' },
      alemania: { ciudad: 'Berlín', estado: 'Berlín' },
      'reino unido': { ciudad: 'Londres', estado: 'Gran Londres' },
      italia: { ciudad: 'Roma', estado: 'Lacio' },
      brasil: { ciudad: 'Brasilia', estado: 'Distrito Federal' },
      chile: { ciudad: 'Santiago', estado: 'Región Metropolitana de Santiago' },
      peru: { ciudad: 'Lima', estado: 'Provincia de Lima' },
      perú: { ciudad: 'Lima', estado: 'Provincia de Lima' },
      uruguay: { ciudad: 'Montevideo', estado: 'Montevideo' },
      venezuela: { ciudad: 'Caracas', estado: 'Distrito Capital' },
      ecuador: { ciudad: 'Quito', estado: 'Pichincha' },
      bolivia: { ciudad: 'Sucre / La Paz', estado: 'Chuquisaca / La Paz' },
      paraguay: { ciudad: 'Asunción', estado: 'Distrito Capital' },
      japón: { ciudad: 'Tokio', estado: 'Kanto' },
      japon: { ciudad: 'Tokio', estado: 'Kanto' },
      china: { ciudad: 'Pekín', estado: 'Beijing' },
      canadá: { ciudad: 'Ottawa', estado: 'Ontario' },
      canada: { ciudad: 'Ottawa', estado: 'Ontario' },
      australia: { ciudad: 'Canberra', estado: 'Territorio de la Capital Australiana' },
    };

    const key = nombrePais.toLowerCase().trim();
    if (capitals[key]) {
      return capitals[key];
    }

    // Try finding by country name match
    const paisEncontrado = Array.from(this.paises.values()).find((p) =>
      p.nombre.toLowerCase().includes(key) || key.includes(p.nombre.toLowerCase())
    );

    if (paisEncontrado) {
      const matchKey = paisEncontrado.nombre.toLowerCase();
      if (capitals[matchKey]) {
        return capitals[matchKey];
      }
      return {
        ciudad: `Capital de ${paisEncontrado.nombre}`,
        estado: 'Distrito Central',
      };
    }

    return {
      ciudad: `Capital de ${nombrePais}`,
      estado: 'Distrito Capital',
    };
  }

  // --- Usuarios ---
  public validarUsuario(usuario: string, clave: string): Usuario | null {
    for (const u of this.usuarios.values()) {
      if (u.usuario === usuario && u.clave === clave) {
        const { clave: _, ...sinClave } = u;
        return sinClave as Usuario;
      }
    }
    return null;
  }

  public listarUsuarios(): Usuario[] {
    return Array.from(this.usuarios.values()).map(({ clave: _, ...u }) => u);
  }

  public obtenerUsuario(id: number): Usuario | null {
    const u = this.usuarios.get(id);
    if (!u) return null;
    const { clave: _, ...sinClave } = u;
    return sinClave as Usuario;
  }

  public buscarUsuarios(nombre: string): Usuario[] {
    const q = nombre.toLowerCase().trim();
    return Array.from(this.usuarios.values())
      .filter((u) => u.nombre.toLowerCase().includes(q) || u.usuario.toLowerCase().includes(q))
      .map(({ clave: _, ...u }) => u);
  }

  public agregarUsuario(datos: Partial<Usuario>): Usuario {
    const id = this.nextUsuarioId++;
    const nuevo: Usuario = {
      id,
      usuario: datos.usuario || `user_${id}`,
      nombre: datos.nombre || '',
      clave: datos.clave || '123',
      roles: datos.roles || 'Usuario',
    };
    this.usuarios.set(id, nuevo);
    const { clave: _, ...sinClave } = nuevo;
    return sinClave as Usuario;
  }

  public modificarUsuario(datos: Usuario): Usuario | null {
    if (!this.usuarios.has(datos.id)) return null;
    const actual = this.usuarios.get(datos.id)!;
    const actualizado: Usuario = {
      ...actual,
      ...datos,
      clave: datos.clave || actual.clave,
    };
    this.usuarios.set(datos.id, actualizado);
    const { clave: _, ...sinClave } = actualizado;
    return sinClave as Usuario;
  }

  public eliminarUsuario(id: number): boolean {
    return this.usuarios.delete(id);
  }
}

export const store = new MonedaStore();
