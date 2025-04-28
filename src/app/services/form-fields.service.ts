import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs
} from '@angular/fire/firestore';
import {from, map, Observable} from 'rxjs';
import { IFormField } from '../models/form-field.model';
import {ICategory} from "../interface/category.interface";

@Injectable({
  providedIn: 'root'
})
export class FormFieldsService {
  constructor(private firestore: Firestore) {}

  getFormFields(): Observable<IFormField[]> {

    const categoriesRef = collection(this.firestore, 'form-fields');
    let q;

    q = query(
      categoriesRef,
      orderBy('position', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IFormField[])
    );
  }

  addFormField(field: Omit<IFormField, 'id'>): Promise<void> {
    const formFieldsRef = collection(this.firestore, 'form-fields');
    const docRef = doc(formFieldsRef);
    return setDoc(docRef, { ...field, id: docRef.id });
  }

  updateFormField(field: IFormField): Promise<void> {
    const docRef = doc(this.firestore, 'form-fields', field.id);
    return setDoc(docRef, field);
  }

  deleteFormField(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'form-fields', id);
    return deleteDoc(docRef);
  }
}
