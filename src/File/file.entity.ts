import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column({ type: 'timestamp' })
  uploadTime: Date;

  @Column()
  path: string;

  @Column('decimal', { precision: 9, scale: 6 })
  lng: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lat: number;
}
