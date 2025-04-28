import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { IFormData } from '../interface/form-data.interface';

@Injectable({
  providedIn: 'root'
})
export class FormsService {
  constructor(private firestore: Firestore) {}

  async saveForm(formData: IFormData): Promise<{ id: string }> {
    const formsRef = collection(this.firestore, 'forms');
    const docRef = await addDoc(formsRef, {
      ...formData,
      createdAt: new Date()
    });
    return { id: docRef.id };
  }
} 