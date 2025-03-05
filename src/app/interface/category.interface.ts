export interface ICategory {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  imagePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  position?: number;
} 