import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  async saveUser(user: any): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.id}`);
    const currentDate = new Date().toISOString();

    // Получаем текущие данные пользователя
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      // Обновляем только дату последнего захода
      await setDoc(
        userRef,
        { ...user, lastLoginDate: currentDate },
        { merge: true }
      );
    } else {
      // Устанавливаем дату первого и последнего захода при первом сохранении
      await setDoc(userRef, {
        ...user,
        firstLoginDate: currentDate,
        lastLoginDate: currentDate,
      });
    }
  }
}
