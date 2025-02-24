import { Validators, ValidatorFn } from '@angular/forms';

interface ValidationMessages {
  [key: string]: string;
}

interface FieldValidationConfig {
  validators: ValidatorFn[];
  messages: ValidationMessages;
}

interface FormValidationConfig {
  [key: string]: FieldValidationConfig;
}

export const validationConfig: { personalInfo: FormValidationConfig } = {
  personalInfo: {
    fullName: {
      validators: [Validators.required],
      messages: {
        required: 'Введите ваше ФИО'
      }
    },
    age: {
      validators: [Validators.required, Validators.min(1), Validators.max(99)],
      messages: {
        required: 'Введите ваш возраст с 18 до 99 лет',
        min: 'Вам должно быть больше 18 лет',
        max: 'Вам должно быть меньше 99 лет'
      }
    },
    location: {
      validators: [Validators.required],
      messages: {
        required: 'Location is required.'
      }
    },
    occupation: {
      validators: [Validators.required],
      messages: {
        required: 'Введите ваш род деятельности'
      }
    },
    hobbies: {
      validators: [Validators.required],
      messages: {
        required: 'Введите ваши увлечения'
      }
    },
    height: {
      validators: [Validators.required, Validators.min(100), Validators.max(240)],
      messages: {
        required: 'Введите ваш рост',
        min: 'Рост должен быть больше 100 см',
        max: 'Рост должен быть меньше 240 см'
      }
    },
    shoeSize: {
      validators: [Validators.required, Validators.min(30), Validators.max(50)],
      messages: {
        required: 'Введите ваш размер ноги',
        min: 'Размер ноги должен быть больше 30',
        max: 'Размер ноги должен быть меньше 50'
      }
    },
    bust: {
      validators: [Validators.required, Validators.min(30), Validators.max(200)],
      messages: {
        required: 'Введите ваш обхват груди',
        min: 'Обхват груди должен быть больше 30',
        max: 'Обхват груди должен быть меньше 200'
      }
    },
    waist: {
      validators: [Validators.required, Validators.min(30), Validators.max(200)],
      messages: {
        required: 'Введите ваш обхват талии',
        min: 'Обхват талии должен быть больше 30',
        max: 'Обхват талии должен быть меньше 200'
      }
    },
    hips: {
      validators: [Validators.required, Validators.min(30), Validators.max(200)],
      messages: {
        required: 'Введите ваш обхват бедер',
        min: 'Обхват бедер должен быть больше 30',
        max: 'Обхват бедер должен быть меньше 200'
      }
    }
  }
}; 
    
