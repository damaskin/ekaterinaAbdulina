import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, limit, collection, query, where, getDocs, orderBy, startAt } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  async saveUser(user: any): Promise<void> {
    console.log('saveUser', user);
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

  getUsers(startAtDoc: any = null, limitValue: number = 10, search: string = '') {
    const userRef = collection(this.firestore, 'users');
    let q;

    if (search) {
      q = query(
        userRef,
        where('username', '>=', search),
        where('username', '<=', search + '\uf8ff'),
        orderBy('username'),
        limit(limitValue)
      );
    } else {
      if (startAtDoc) {
        q = query(
          userRef,
          orderBy('username'),
          startAt(startAtDoc),
          limit(limitValue)
        );
      } else {
        q = query(
          userRef,
          orderBy('username'),
          limit(limitValue)
        );
      }
    }

    return from(getDocs(q)).pipe(
      map(snapshot => ({
        users: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] // последний документ
      }))
    );
  }   

  async getUserData(userId: number): Promise<any> {
    const userRef = doc(this.firestore, `users/${userId}`);
    const userSnapshot = await getDoc(userRef);
    return userSnapshot.data();
  } 

  async updateUserData(userId: number, data: any): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    await setDoc(userRef, data, { merge: true });
  }
}
