import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import initialData from '../../data/initialData.json';

export interface ISystemStatus {
  status: string;
  node: string;
  activeSatellites: number;
  coveragePercentage: number;
  evidenceCoverage: number;
  medianResponse: string;
  lastSync: string;
}

export interface IScene {
  id: string;
  name: string;
  satellite: string;
  type: string;
  category: string;
  acquired: string;
  confidence: number;
  status: string;
  resolution: string;
  coordinates: string;
  thumbnail: string;
}

export interface IQueryArchive {
  id: string;
  query: string;
  scene: string;
  location: string;
  satellite: string;
  acquired: string;
  confidence: number;
  mode: string;
  status: string;
}

export interface ITemporalReport {
  title: string;
  period: string;
  expansionHa: number;
  percentageGrowth: string;
  timeline: Array<{ date: string; extent: number; baseline: number }>;
  highlights: string[];
}

class DatabaseService {
  public prisma: PrismaClient;
  public pgPool: Pool;
  private isPostgresConnected: boolean = false;
  private memoryScenes: IScene[] = [...(initialData.scenes as IScene[])];
  private memoryArchive: IQueryArchive[] = [...(initialData.archive as IQueryArchive[])];

  constructor() {
    this.prisma = new PrismaClient();
    this.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/satquery_ai'
    });

    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      await this.pgPool.query('SELECT 1');
      this.isPostgresConnected = true;
      console.log('🐘 PostgreSQL Database connection established successfully via Pool & Prisma.');
    } catch (err: any) {
      this.isPostgresConnected = false;
      console.warn(`🐘 PostgreSQL notice: Live database instance offline (${err.message}). Using TypeScript in-memory store fallback.`);
    }
  }

  public getSystemStatus(): ISystemStatus {
    return {
      ...(initialData.system as ISystemStatus),
      lastSync: new Date().toISOString().substring(11, 19) + ' UTC'
    };
  }

  public async getScenes(category?: string, search?: string): Promise<IScene[]> {
    let results = [...this.memoryScenes];

    if (category && category !== 'All') {
      results = results.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase() || s.type.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (s) => s.name.toLowerCase().includes(q) || s.satellite.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public async addScene(scene: IScene): Promise<IScene> {
    this.memoryScenes.unshift(scene);
    if (this.isPostgresConnected) {
      try {
        await this.prisma.scene.create({ data: scene });
      } catch (e) {
        // Silently handled
      }
    }
    return scene;
  }

  public async getArchive(mode?: string, search?: string): Promise<IQueryArchive[]> {
    let results = [...this.memoryArchive];

    if (mode && mode !== 'All') {
      results = results.filter((a) => a.mode.toLowerCase() === mode.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (a) => a.query.toLowerCase().includes(q) || a.scene.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
      );
    }

    return results;
  }

  public getReports(): ITemporalReport {
    return initialData.reports as ITemporalReport;
  }
}

export const dbService = new DatabaseService();
