import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, query, where, getDoc, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, switchMap, of, map } from 'rxjs';
import { ICategory } from '../interface/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  getCategories(): Observable<ICategory[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    let q;

    q = query(
      categoriesRef
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ICategory[])
    );
  }
  

  getCategory(id: string): Observable<ICategory> {
    const categoryRef = doc(this.firestore, `categories/${id}`);
    return from(getDoc(categoryRef)).pipe(
      switchMap(doc => {
        if (doc.exists()) {
          return of({ id: doc.id, ...doc.data() } as ICategory);
        }
        throw new Error('Category not found');
      })
    );
  }

  async saveCategory(category: ICategory, imageFile?: File): Promise<void> {
    let imageUrl = category.imageUrl;
    let imagePath = category.imagePath;

    if (imageFile) {
      const timestamp = Date.now();
      const imagePath = `categories/${timestamp}_${imageFile.name}`;
      const storageRef = ref(this.storage, imagePath);
      
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const categoryData = {
      ...category,
      imageUrl,
      imagePath,
      updatedAt: new Date(),
      ...(category.id ? {} : { createdAt: new Date() })
    };

    if (category.id) {
      await setDoc(doc(this.firestore, `categories/${category.id}`), categoryData);
    } else {
      const newCategoryRef = doc(collection(this.firestore, 'categories'));
      await setDoc(newCategoryRef, categoryData);
    }
  }

  async deleteCategory(category: ICategory): Promise<void> {
    if (category.imagePath) {
      const imageRef = ref(this.storage, category.imagePath);
      await deleteObject(imageRef);
    }
    await deleteDoc(doc(this.firestore, `categories/${category.id}`));
  }
} 