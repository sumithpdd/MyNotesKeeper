import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '@/types';

/**
 * Product Service
 * CRUD operations for products collection
 */

export const productService = {
  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to get products');
    }
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const productRef = doc(db, 'products', id);
      const snapshot = await getDoc(productRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  },

  /**
   * Create a new product
   */
  async createProduct(data: Omit<Product, 'id'>): Promise<string> {
    try {
      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Product created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Product updated:', id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      
      console.log('✅ Product deleted:', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
};
