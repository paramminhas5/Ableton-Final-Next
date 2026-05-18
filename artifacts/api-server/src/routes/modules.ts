import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, modulesTable } from "@workspace/db";
import {
  ListModulesResponse,
  CreateModuleBody,
  GetModuleParams,
  GetModuleResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/modules", async (_req, res): Promise<void> => {
  const modules = await db.select().from(modulesTable).orderBy(modulesTable.orderIndex);
  res.json(ListModulesResponse.parse(modules.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))));
});

router.post("/modules", async (req, res): Promise<void> => {
  const parsed = CreateModuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [mod] = await db.insert(modulesTable).values(parsed.data).returning();
  res.status(201).json(GetModuleResponse.parse({ ...mod, createdAt: mod.createdAt.toISOString() }));
});

router.get("/modules/:id", async (req, res): Promise<void> => {
  const params = GetModuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [mod] = await db.select().from(modulesTable).where(eq(modulesTable.id, params.data.id));
  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }
  res.json(GetModuleResponse.parse({ ...mod, createdAt: mod.createdAt.toISOString() }));
});

export default router;
