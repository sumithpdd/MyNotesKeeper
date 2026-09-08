import 'server-only';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { tsFrom, stripUndefined } from '@/lib/server/adminConvert';
import type { Product, Partner } from '@/types';

/**
 * Admin-SDK product and partner catalogues. Mirrors `src/lib/productService.ts`
 * and `src/lib/partnerService.ts`, which use the Firebase **web** SDK and so are
 * denied when called from a route handler.
 */

const PRODUCTS = 'products';
const PARTNERS = 'partners';

async function listAll<T>(collection: string): Promise<T[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(collection).orderBy('name').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

async function createDoc(collection: string, data: Record<string, unknown>): Promise<string> {
  const db = requireAdminFirestore();
  const now = tsFrom(new Date());
  const ref = await db
    .collection(collection)
    .add(stripUndefined({ ...data, createdAt: now, updatedAt: now }));
  return ref.id;
}

async function updateDocById(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = requireAdminFirestore();
  const { id: _ignored, ...rest } = data;
  await db
    .collection(collection)
    .doc(id)
    .update(stripUndefined({ ...rest, updatedAt: tsFrom(new Date()) }));
}

async function deleteDocById(collection: string, id: string): Promise<void> {
  const db = requireAdminFirestore();
  await db.collection(collection).doc(id).delete();
}

export const getAllProductsAdmin = () => listAll<Product>(PRODUCTS);
export const getAllPartnersAdmin = () => listAll<Partner>(PARTNERS);

export const createProductAdmin = (data: Omit<Product, 'id'>) => createDoc(PRODUCTS, data);
export const createPartnerAdmin = (data: Omit<Partner, 'id'>) => createDoc(PARTNERS, data);

export const updateProductAdmin = (id: string, updates: Partial<Product>) =>
  updateDocById(PRODUCTS, id, updates);
export const updatePartnerAdmin = (id: string, updates: Partial<Partner>) =>
  updateDocById(PARTNERS, id, updates);

export const deleteProductAdmin = (id: string) => deleteDocById(PRODUCTS, id);
export const deletePartnerAdmin = (id: string) => deleteDocById(PARTNERS, id);
