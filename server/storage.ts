import { db } from "./db";
import { 
  cases, insights, 
  type Case, type InsertCase, type Insight, type CreateCaseRequest,
  type CaseWithInsight
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Cases
  createCase(caseData: CreateCaseRequest): Promise<Case>;
  getCase(id: number): Promise<CaseWithInsight | undefined>;
  listCases(): Promise<Case[]>;
  updateCaseStatus(id: number, status: string): Promise<Case>;
  
  // Insights
  createInsight(caseId: number, insightData: Partial<Insight>): Promise<Insight>;
  getInsightByCaseId(caseId: number): Promise<Insight | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createCase(caseData: CreateCaseRequest): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async getCase(id: number): Promise<CaseWithInsight | undefined> {
    const [foundCase] = await db.select().from(cases).where(eq(cases.id, id));
    if (!foundCase) return undefined;

    const [insight] = await db.select().from(insights).where(eq(insights.caseId, id));
    return { ...foundCase, insight };
  }

  async listCases(): Promise<Case[]> {
    return db.select().from(cases).orderBy(desc(cases.createdAt));
  }

  async updateCaseStatus(id: number, status: string): Promise<Case> {
    const [updated] = await db.update(cases)
      .set({ status })
      .where(eq(cases.id, id))
      .returning();
    return updated;
  }

  async createInsight(caseId: number, insightData: Partial<Insight>): Promise<Insight> {
    const [insight] = await db.insert(insights).values({
      caseId,
      summary: insightData.summary,
      blindSpots: insightData.blindSpots,
      questions: insightData.questions,
      originalLanguage: insightData.originalLanguage
    }).returning();
    return insight;
  }

  async getInsightByCaseId(caseId: number): Promise<Insight | undefined> {
    const [insight] = await db.select().from(insights).where(eq(insights.caseId, caseId));
    return insight;
  }
}

export const storage = new DatabaseStorage();
